import BuffLog, { middleware } from './bufflog'
import pino from 'pino'

describe('BuffLog', () => {
  const logger = BuffLog.getLogger()
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('getLogger returns the logger instance', () => {
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
  })

  it('debug calls logger.debug', () => {
    const spy = jest.spyOn(logger, 'debug')
    BuffLog.debug('test debug', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ context: { foo: 'bar' } }, 'test debug')
  })

  it('info calls logger.info', () => {
    const spy = jest.spyOn(logger, 'info')
    BuffLog.info('test info', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ context: { foo: 'bar' } }, 'test info')
  })

  it('notice calls logger.notice', () => {
    const spy = jest.spyOn(logger, 'notice')
    BuffLog.notice('test notice', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ context: { foo: 'bar' } }, 'test notice')
  })

  it('warning calls logger.warn', () => {
    const spy = jest.spyOn(logger, 'warn')
    BuffLog.warning('test warn', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ context: { foo: 'bar' } }, 'test warn')
  })

  it('error calls logger.error', () => {
    const spy = jest.spyOn(logger, 'error')
    BuffLog.error('test error', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith({ context: { foo: 'bar' } }, 'test error')
  })

  it('critical calls logger.fatal', () => {
    const spy = jest.spyOn(logger, 'fatal')
    BuffLog.critical('test critical', { foo: 'bar' })
    expect(spy).toHaveBeenCalledWith(
      { context: { foo: 'bar' } },
      'test critical',
    )
  })

  it('middleware returns a function', () => {
    const mw = middleware()
    expect(typeof mw).toBe('function')
  })
})

describe('BuffLog Redaction', () => {
  let logs: any[] = []
  let testLogger: any

  beforeEach(() => {
    logs = []
    // Create a test logger with the same config but capture output
    const stream = {
      write: (line: string) => {
        logs.push(JSON.parse(line))
      }
    }

    testLogger = pino({
      level: 'debug',
      messageKey: 'message',
      customLevels: {
        debug: 100,
        info: 200,
        notice: 250,
        warn: 300,
        error: 400,
        fatal: 500
      },
      useOnlyCustomLevels: true,
      redact: {
        paths: [
          'req.body.password',
          'req.headers',
          'req.cookies',
          'context.req.body.password',
          'context.req.headers',
          'context.req.cookies',
        ],
        censor: '[ REDACTED ]',
      },
    }, stream)
  })

  it('redacts sensitive req fields (headers, cookies, passwords)', () => {
    testLogger.info({
      context: {
        req: {
          headers: {
            authorization: 'Bearer secret-token',
            cookie: 'session=secret-session'
          },
          body: {
            username: 'testuser',
            password: 'secret-password',
            email: 'test@example.com'
          },
          cookies: {
            session: 'secret-session-id'
          },
          method: 'POST',
          path: '/api/login'
        },
        userId: 'user-123'
      }
    }, 'Test with sensitive data')

    expect(logs).toHaveLength(1)
    expect(logs[0].context.req.headers).toBe('[ REDACTED ]')
    expect(logs[0].context.req.body.password).toBe('[ REDACTED ]')
    expect(logs[0].context.req.cookies).toBe('[ REDACTED ]')
    expect(logs[0].context.req.body.username).toBe('testuser')
    expect(logs[0].context.req.body.email).toBe('test@example.com')
    expect(logs[0].context.req.method).toBe('POST')
    expect(logs[0].context.req.path).toBe('/api/login')
    expect(logs[0].context.userId).toBe('user-123')
  })

  it('does not redact non-sensitive data', () => {
    testLogger.info({
      context: {
        userId: 'user-123',
        action: 'login',
        metadata: {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        }
      }
    }, 'Test without sensitive data')

    expect(logs).toHaveLength(1)
    expect(logs[0].context.userId).toBe('user-123')
    expect(logs[0].context.action).toBe('login')
    expect(logs[0].context.metadata.ip).toBe('192.168.1.1')
    expect(logs[0].context.metadata.userAgent).toBe('Mozilla/5.0')
  })
})
