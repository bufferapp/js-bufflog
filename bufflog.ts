const pinoLogger = require('pino')({
    level: process.env.LOG_LEVEL ? String.prototype.toLowerCase.apply(process.env.LOG_LEVEL) : "notice",
    // probably we want to call it `msg`. if so, let's change the PHP library instead
    messageKey: 'message',

    // Define "base" fields
    // soon: remove the `v` field https://github.com/pinojs/pino/issues/620
    base: {},
    // notice doesn't exist in pino, let's add it
    customLevels: {
        debug: 100,
        info: 200,
        notice: 250,
        warn: 300,
        error: 400,
        fatal: 500
      },
    // necessary if we want to override the level "number"
    useOnlyCustomLevels: true,

    redact: {
        paths: ['req', 'res', 'context.req', 'context.res'],
        censor: '[ REDACTED ]',
    },
});

import redact from 'redact-object'

export const KEYS_TO_REDACT = [
    '__dd_span',
    '_datadog',
    'access_token',
    'access-token',
    'accessToken',
    'publishAccessToken',
    'access_token_secret',
    'access-token-secret',
    'accessTokenSecret',
    'appsecret_proof',
    'appsecret_time',
    'authorization',
    'buffer_session',
    'bufferapp_ci_session',
    'codeVerifier',
    'cookie',
    'credentials',
    'input_token',
    'password',
    'rawHeaders',
    'refresh_token',
    'refresh-token',
    'refreshToken',
    'secret',
    'shared_access_token',
    'shared-access-token',
    'sharedAccessToken',
    'x-buffer-authentication-access-token',
    'x-buffer-authentication-jwt',
    'x-buffer-authorization-jwt',
]

export function getLogger() {
    return pinoLogger;
}

function sanitizeContext(context?: object): object | undefined {
    // For now, to keep the change limited, disabling this
    return context

    // Will re-enable this after Campsite decision
    // if (!context) {
    //     return
    // }
    //
    // return redact(context, KEYS_TO_REDACT, '[ REDACTED ]', {
    //     ignoreUnknown: true,
    // })
}

export function debug(message: string, context?: object) {
    pinoLogger.debug({context: sanitizeContext(context)}, message);
}

export function info(message: string, context?: object) {
    pinoLogger.info({context: sanitizeContext(context)}, message);
}

export function notice(message: string, context?: object) {
    pinoLogger.notice({context: sanitizeContext(context)}, message);
}

export function warning(message: string, context?: object) {
    pinoLogger.warn({context: sanitizeContext(context)}, message);
}

export function error(message: string, context?: object) {
    pinoLogger.error({context: sanitizeContext(context)}, message);
}

// for consistency with php-bufflog, critical == fatal
export function critical(message: string, context?: object) {
    pinoLogger.fatal({context: sanitizeContext(context)}, message);
}

export function middleware() {
    return require('pino-http')({
       logger: pinoLogger,

    // Define a custom logger level
    customLogLevel: function (res: any, err: any) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            // for now, we don't want notice notification on the 4xx
            return 'info'
        } else if (res.statusCode >= 500 || err) {
           return 'error'
        }
        return 'info'
    },
   })
}

const BuffLog = {
    getLogger,
    debug,
    info,
    notice,
    warning,
    error,
    critical,
    middleware,
}

export default BuffLog
