
export class BuffLog {
    pinoLogger: any;
    defaultLevel = 'notice';

    constructor() {
        this.pinoLogger = require('pino')({
            level: this.defaultLevel,

            // probably we want to call it `msg`. if so, let's change the PHP library instead
            messageKey: 'message',

            // Define "base" fields
            // soon: remove the `v` field https://github.com/pinojs/pino/issues/620
            base: {
            },

            // notice doesn't exist in pino, let's add it
            customLevels: {
                notice: 35
              }
        });
    }

    debug(message: string) {
        this.pinoLogger.debug(message);
    }

    info(message: string) {
        this.pinoLogger.info(message);
    }

    notice(message: string) {
        this.pinoLogger.notice(message);
    }

    warning(message: string) {
        this.pinoLogger.warn(message);
    }

    error(message: string) {
        this.pinoLogger.error(message);
    }

    // for consistency with php-bufflog, critical == fatal
    critical(message: string) {
        this.pinoLogger.fatal(message);
    }

}