import pino from 'pino'
import pinoHttp from 'pino-http'
import {
    REQ_KEYS_REDACTED,
    REQ_CONTEXT_KEYS_REDACTED,
    RES_KEYS_REDACTED,
    RES_CONTEXT_KEYS_REDACTED
} from './constants'

const pinoLogger = pino({
    level: process.env.LOG_LEVEL ? String.prototype.toLowerCase.apply(process.env.LOG_LEVEL) : "notice",
    // probably we want to call it `msg`. if so, let's change the PHP library instead
    messageKey: 'message',

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
        paths: [
          ...REQ_KEYS_REDACTED,
          ...RES_KEYS_REDACTED,
          ...REQ_CONTEXT_KEYS_REDACTED,
          ...RES_CONTEXT_KEYS_REDACTED,
        ],
        censor: '[ REDACTED ]',
    },
});

export function getLogger() {
    return pinoLogger;
}

export function debug(message: string, context?: object) {
    pinoLogger.debug({context}, message);
}

export function info(message: string, context?: object) {
    pinoLogger.info({context}, message);
}

export function notice(message: string, context?: object) {
    pinoLogger.notice({context}, message);
}

export function warning(message: string, context?: object) {
    pinoLogger.warn({context}, message);
}

export function error(message: string, context?: object) {
    pinoLogger.error({context}, message);
}

// for consistency with php-bufflog, critical == fatal
export function critical(message: string, context?: object) {
    pinoLogger.fatal({context}, message);
}

export function middleware() {
    return pinoHttp({
       logger: pinoLogger,

    // Define a custom logger level
    customLogLevel: function (_req, res, err) {
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
