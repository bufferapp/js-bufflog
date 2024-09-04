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

});

export function getLogger() {
    return pinoLogger;
}

export function debug<T extends object>(message: string, context?: T) {
    pinoLogger.debug({context: context}, message);
}

export function info<T extends object>(message: string, context?: T) {
    pinoLogger.info({context: context}, message);
}

export function notice<T extends object>(message: string, context?: T) {
    pinoLogger.notice({context: context}, message);
}

export function warning<T extends object>(message: string, context?: T) {
    pinoLogger.warn({context: context}, message);
}

export function error<T extends object>(message: string, context?: T) {
    pinoLogger.error({context: context}, message);
}

// for consistency with php-bufflog, critical == fatal
export function critical<T extends object>(message: string, context?: T) {
    pinoLogger.fatal({context: context}, message);
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