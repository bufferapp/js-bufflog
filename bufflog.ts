import tracer from "dd-trace";
import formats from "dd-trace/ext/formats";

export class BuffLog {
    pinoLogger: any;
    defaultLevel = String.prototype.toLowerCase.apply(process.env.LOG_LEVEL) || "notice";;

    constructor() {
        this.pinoLogger = require('pino')({
            level: this.defaultLevel,

            // probably we want to call it `msg`. if so, let's change the PHP library instead
            messageKey: 'message',

            // Define "base" fields
            // soon: remove the `v` field https://github.com/pinojs/pino/issues/620
            base: {},

            mixin () {
                // Check here if a current trace exist to inject it in the log
                // `tracer` is a singleton, will no-op if no tracer was initialized
                var span = tracer.scope().active()
                if (span) {
                    const traceInfo = {}
                    tracer.inject(span.context(), formats.LOG, traceInfo);
                    return traceInfo;
                } else {
                    return {}
                }
            },

            // notice doesn't exist in pino, let's add it
            customLevels: {
                notice: 35
              }
        });
    }

    debug(message: string, context?: object) {
        this.pinoLogger.debug({context: context}, message);
    }

    info(message: string, context?: object) {
        this.pinoLogger.info(message);
    }

    notice(message: string, context?: object) {
        this.pinoLogger.notice({context: context}, message);
    }

    warning(message: string, context?: object) {
        this.pinoLogger.warn({context: context}, message);
    }

    error(message: string, context?: object) {
        this.pinoLogger.error({context: context}, message);

    }

    // for consistency with php-bufflog, critical == fatal
    critical(message: string, context?: object) {
        this.pinoLogger.fatal({context: context}, message);
    }

}