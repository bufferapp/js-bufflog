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

export function debug(message: string, context?: object) {
    pinoLogger.debug({context: context}, message);
}

export function info(message: string, context?: object) {
    pinoLogger.info({context: context}, message);
}

export function notice(message: string, context?: object) {
    pinoLogger.notice({context: context}, message);
}

export function warning(message: string, context?: object) {
    pinoLogger.warn({context: context}, message);
}

export function error(message: string, context?: object) {
    pinoLogger.error({context: context}, message);
}

// for consistency with php-bufflog, critical == fatal
export function critical(message: string, context?: object) {
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
