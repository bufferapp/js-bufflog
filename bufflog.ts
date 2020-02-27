const pinoLogger = require('pino')({
    level: process.env.LOG_LEVEL ? String.prototype.toLowerCase.apply(process.env.LOG_LEVEL) : "notice",
    // probably we want to call it `msg`. if so, let's change the PHP library instead
    messageKey: 'message',

    // Define "base" fields
    // soon: remove the `v` field https://github.com/pinojs/pino/issues/620
    base: {},

    // notice doesn't exist in pino, let's add it
    customLevels: {
        notice: 35
      }
});

export class BuffLog {

    static debug(message: string, context?: object) {
        pinoLogger.debug({context: context}, message);
    }

    static info(message: string, context?: object) {
        pinoLogger.info(message);
    }

    static notice(message: string, context?: object) {
        pinoLogger.notice(message, context);
    }

    static warning(message: string, context?: object) {
        pinoLogger.warn(message, context);
    }

    static error(message: string, context?: object) {
        pinoLogger.error({context: context}, message);
    }

    // for consistency with php-bufflog, critical == fatal
    static critical(message: string, context?: object) {
        pinoLogger.fatal({context: context}, message);
    }
}
