const SERVER_KEYS_TO_REDACT = [
  'body.password',
  'query.password',
  'cookies',
  'fresh',
  'res',
  'secure',
  'signedCookies',
  'stale',
  'xhr',
  'headers'
]

export const REQ_KEYS_REDACTED = SERVER_KEYS_TO_REDACT.map((el: string) => `req.${el}`)
export const REQ_CONTEXT_KEYS_REDACTED = SERVER_KEYS_TO_REDACT.map((el: string) => `context.req.${el}`)
export const RES_KEYS_REDACTED = SERVER_KEYS_TO_REDACT.map((el: string) => `res.${el}`)
export const RES_CONTEXT_KEYS_REDACTED = SERVER_KEYS_TO_REDACT.map((el: string) => `context.res.${el}`)
