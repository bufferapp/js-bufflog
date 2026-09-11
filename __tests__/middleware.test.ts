jest.mock('pino', () => {
  const actualPino = jest.requireActual('pino')
  const { sink } = require('./sink')
  const pinoToSink = (options: object) => actualPino(options, sink)
  return Object.assign(pinoToSink, actualPino)
})

import express from 'express'
import * as http from 'http'
import { AddressInfo } from 'net'
import BuffLog from '../bufflog'
import { LogLine, reset, waitForLine } from './sink'

const CENSOR = '[ REDACTED ]'

interface Response {
  status: number
  body: string
}

function get(port: number, path: string): Promise<Response> {
  return new Promise((resolve, reject) => {
    const request = http.get(
      {
        host: '127.0.0.1',
        port,
        path,
        headers: { cookie: 'buffer_session=secret' },
      },
      (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk: string) => {
          body += chunk
        })
        response.on('end', () =>
          resolve({ status: response.statusCode || 0, body })
        )
      }
    )
    request.on('error', reject)
  })
}

function completedRequest(url: string): (line: LogLine) => boolean {
  return (line: LogLine) => Boolean(line.req) && line.req.url === url
}

describe('BuffLog.middleware()', () => {
  let server: http.Server
  let port: number

  beforeAll(async () => {
    const app = express()
    app.use(BuffLog.middleware())
    app.get('/ok', (_req, res) => {
      res.send({ hello: 'world' })
    })
    app.get('/boom', (_req, res) => {
      res.status(500).send({ message: 'This is an error 500!' })
    })
    app.get('/missing', (_req, res) => {
      res.status(404).send({ message: 'This is a 404!' })
    })

    server = await new Promise((resolve) => {
      const listening = app.listen(0, () => resolve(listening))
    })
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  beforeEach(reset)

  it('passes the request through to the route handler', async () => {
    const response = await get(port, '/ok')

    expect(response.status).toBe(200)
    expect(JSON.parse(response.body)).toEqual({ hello: 'world' })
  })

  it('logs the completed request at info, with a response time', async () => {
    await get(port, '/ok')
    const line = await waitForLine(completedRequest('/ok'))

    expect(line.level).toBe(200)
    expect(line.message).toBe('request completed')
    expect(line.req.method).toBe('GET')
    expect(line.res.statusCode).toBe(200)
    expect(typeof line.responseTime).toBe('number')
  })

  it('redacts the request and response headers it logs', async () => {
    await get(port, '/ok')
    const line = await waitForLine(completedRequest('/ok'))

    expect(line.req.headers).toBe(CENSOR)
    expect(line.res.headers).toBe(CENSOR)
  })

  it('logs a 5xx at error level', async () => {
    const response = await get(port, '/boom')
    const line = await waitForLine(completedRequest('/boom'))

    expect(response.status).toBe(500)
    expect(line.level).toBe(400)
    expect(line.res.statusCode).toBe(500)
  })

  it('logs a 4xx at info level', async () => {
    const response = await get(port, '/missing')
    const line = await waitForLine(completedRequest('/missing'))

    expect(response.status).toBe(404)
    expect(line.level).toBe(200)
  })
})
