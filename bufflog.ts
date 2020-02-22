
export class BuffLog {
    pinoLogger: any;
    defaultLevel = 'notice';

    constructor() {
        this.pinoLogger = require('pino')({
            'level': this.defaultLevel,
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