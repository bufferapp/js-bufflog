import BuffLog, { middleware } from './bufflog'

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
  let stdoutWriteSpy: jest.SpyInstance
  let originalLogLevel: string

  beforeEach(() => {
    logs = []
    // Set log level to info so our test logs are captured
    const logger = BuffLog.getLogger()
    originalLogLevel = logger.level
    logger.level = 'info'

    // Spy on stdout to capture actual BuffLog output
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation((chunk: any) => {
      try {
        logs.push(JSON.parse(chunk.toString()))
      } catch (e) {
        // Ignore non-JSON output
      }
      return true
    })
  })

  afterEach(() => {
    stdoutWriteSpy.mockRestore()
    // Restore original log level
    BuffLog.getLogger().level = originalLogLevel
  })

  it('redacts sensitive req fields (headers, cookies, passwords) in actual BuffLog logger', () => {
    BuffLog.info('Test with sensitive data', {
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
    })

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

  it('redacts query.password in actual BuffLog logger', () => {
    BuffLog.info('Test with query password', {
      req: {
        query: {
          password: 'secret-query-password',
          page: '1'
        },
        method: 'GET',
        path: '/api/data'
      }
    })

    expect(logs).toHaveLength(1)
    expect(logs[0].context.req.query.password).toBe('[ REDACTED ]')
    expect(logs[0].context.req.query.page).toBe('1')
    expect(logs[0].context.req.method).toBe('GET')
  })

  it('does not redact non-sensitive data in actual BuffLog logger', () => {
    BuffLog.info('Test without sensitive data', {
      userId: 'user-123',
      action: 'login',
      metadata: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0'
      }
    })

    expect(logs).toHaveLength(1)
    expect(logs[0].context.userId).toBe('user-123')
    expect(logs[0].context.action).toBe('login')
    expect(logs[0].context.metadata.ip).toBe('192.168.1.1')
    expect(logs[0].context.metadata.userAgent).toBe('Mozilla/5.0')
  })
})
