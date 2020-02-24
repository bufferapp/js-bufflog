import tracer from "dd-trace";
import formats from "dd-trace/ext/formats";

export class BuffLog {
    pinoLogger: any;
    defaultLevel = 'notice';
    dest: any;

    constructor() {
        this.dest = require('pino').destination('/tmp/test.log')
        this.dest[Symbol.for('pino.metadata')] = true

        this.pinoLogger = require('pino')({
            level: this.defaultLevel,

            // probably we want to call it `msg`. if so, let's change the PHP library instead
            messageKey: 'message',

            // `notice` level doesn't exist in pino, let's create it
            customLevels: {
                notice: 35
              },

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
            }
        }, this.dest)
    };

    debug(message: string) {
        this.pinoLogger.debug(message);
    }

    info(message: string) {
        this.pinoLogger.info(message);
    }

    notice(message: string) {
        this.pinoLogger.notice(message);
        const { lastMsg, lastLevel, lastObj, lastTime} = this.dest
        console.log(
            'Logged message "%s" at level %d with object %o at time %s',
            lastMsg, lastLevel, lastObj, lastTime
          );
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