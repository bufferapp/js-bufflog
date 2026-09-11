jest.mock('pino', () => {
  const actualPino = jest.requireActual('pino')
  const { sink } = require('./sink')
  const pinoToSink = (options: object) => actualPino(options, sink)
  return Object.assign(pinoToSink, actualPino)
})

import BuffLog from '../bufflog'
import { lastLine, lines, reset } from './sink'

const CENSOR = '[ REDACTED ]'

describe('custom log levels', () => {
  beforeEach(reset)

  it('exposes only the six custom levels, with their numeric values', () => {
    expect(BuffLog.getLogger().levels.values).toEqual({
      debug: 100,
      info: 200,
      notice: 250,
      warn: 300,
      error: 400,
      fatal: 500,
    })
  })

  const cases: Array<[string, (message: string) => void, number]> = [
    ['debug', BuffLog.debug, 100],
    ['info', BuffLog.info, 200],
    ['notice', BuffLog.notice, 250],
    ['warning', BuffLog.warning, 300],
    ['error', BuffLog.error, 400],
    ['critical', BuffLog.critical, 500],
  ]

  cases.forEach(([name, log, level]) => {
    it(`logs ${name} at level ${level}`, () => {
      log(`hello ${name}`)

      expect(lines).toHaveLength(1)
      expect(lastLine().level).toBe(level)
      // messageKey is overridden, so the text lands on "message", not "msg"
      expect(lastLine().message).toBe(`hello ${name}`)
      expect(lastLine().msg).toBeUndefined()
    })
  })
})

describe('redaction', () => {
  beforeEach(reset)

  it('redacts the whole req.headers object, cookie included', () => {
    BuffLog.notice('request context', {
      req: { headers: { cookie: 'buffer_session=secret' } },
    })

    expect(lastLine().context.req.headers).toBe(CENSOR)
  })

  it('redacts a password in the request body and query', () => {
    BuffLog.notice('request context', {
      req: {
        body: { password: 'hunter2', email: 'joe@buffer.com' },
        query: { password: 'hunter2' },
      },
    })

    expect(lastLine().context.req.body.password).toBe(CENSOR)
    expect(lastLine().context.req.query.password).toBe(CENSOR)
    // redaction is path-scoped, so a sibling key survives
    expect(lastLine().context.req.body.email).toBe('joe@buffer.com')
  })

  it('redacts every server key from constants.ts, on req and on res', () => {
    const serverKeys = {
      cookies: { buffer_session: 'secret' },
      fresh: true,
      secure: true,
      signedCookies: { buffer_session: 'secret' },
      stale: false,
      xhr: true,
      headers: { cookie: 'buffer_session=secret' },
    }

    BuffLog.notice('request and response context', {
      req: serverKeys,
      res: serverKeys,
    })

    Object.keys(serverKeys).forEach((key: string) => {
      expect(lastLine().context.req[key]).toBe(CENSOR)
      expect(lastLine().context.res[key]).toBe(CENSOR)
    })
  })

  it('does not currently redact a bare password key in context', () => {
    // Documents live behaviour, not the behaviour we want. bufflog's
    // sanitizeContext() returns the context untouched, so KEYS_TO_REDACT and
    // the redact-object pass never run. Only pino's own paths redact, and they
    // cover context.req.* / context.res.* but not context.password.
    BuffLog.notice('context to redact', {
      test: 'toto',
      password: 'must-redact',
      req: { headers: { cookie: 'must-redact' } },
    })

    expect(lastLine().context.password).toBe('must-redact')
    expect(lastLine().context.req.headers).toBe(CENSOR)
  })
})
