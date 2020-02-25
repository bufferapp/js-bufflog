# js-bufflog
logger for all javascript and typescript Buffer services

# Usage
```js
import bufflog from "BuffLog";

bufflog.debug('hello critical', {"some":"stuff"});
bufflog.info('hello info');
bufflog.notice('hello notice with context', {"foo":"bar"});
bufflog.error('hello error');
bufflog.critical('hello critical');
```

## Log verbosity levels

If you wish to see more logs, simply set the `LOG_LEVEL` to the desired level. Here a list with some use case:

| Levels  | Use case  | Examples  |
|:-:|---|---|
| DEBUG  | Logs that are used for interactive investigation during development. These logs should primarily contain information useful for debugging and have no long-term value.  |   |
| INFO | Informational messages |   |
| NOTICE | Logs that track the general flow of the application. This is the default level |   |
| WARNING | Logs that highlight an abnormal or unexpected event in the application flow, but do not otherwise cause the application execution to stop.  |   |
| ERROR |  Logs that highlight when the current flow of execution is stopped due to a failure. These should indicate a failure in the current activity, not an application-wide failure. |   |
| CRITICAL  | Logs that describe an unrecoverable application or system crash, or a catastrophic failure that requires immediate attention.  |   |


## Add traces to log

A great feature of Datadog is to correlate traces and logs to make troubleshooting easier. 

To take advantage of this, you will need to:
- install the `dd-trace` package 
- import it and init it with `logInjection:true`. 
- BuffLog will append automatically the traces to the logs (only within a request)

```js
// make sure to put those lines at the very beginning of your service
import tracer from "dd-trace";
tracer.init({
    //  will automatically append the traces to BuffLog
    logInjection: true

    // ... all other options...
});
```
