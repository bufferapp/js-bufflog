# js-bufflog
logger for all javascript and typescript Buffer services

## Install
`npm i @bufferapp/bufflog`

## Usage
```js

// CommonJS style
const Bufflog = require('@bufferapp/bufflog');

// ES6 style
import Bufflog  from "@bufferapp/bufflog";

Bufflog.debug('hello critical', {"some":"stuff"});
Bufflog.info('hello info');
Bufflog.notice('hello notice with context', {"foo":"bar"});
Bufflog.error('hello error');
Bufflog.critical('hello critical');
```

## Log verbosity levels

If you wish to see more logs, simply set the `LOG_LEVEL` to the desired level. Here a list with some use case:

| Levels  | Use case  | Examples  |
|:-:|---|---|
| DEBUG  | Information used for interactive investigation, with no long-term value. Activate it with `LOG_LEVEL=DEBUG`| Printing function names, steps inside a function. |
| INFO | Interesting events. Track the general flow of the application.  Activate it with `LOG_LEVEL=INFO`| User logs in, SQL logs, worker process/delete a message... |
| NOTICE | Uncommon events. **This is the default verbosity level**. |  Missing environment variables, page redirection, pod starting/restarting/terminating, retrying to query an API... |
| WARNING | Exceptional occurrences that are not errors. Undesirable things that are not necessarily wrong. | Use of deprecated APIs,  poor use of an API, unauthorized access, pod restart because of memory limit ... |
| ERROR | Runtime errors. Highlight when the current flow of execution is stopped due to a failure. | Exceptions messages, incorect credentials or permissions...  |
| CRITICAL  | Critical conditions. Describe an unrecoverable application, system crash, or a catastrophic failure that requires immediate attention.  | Application component unavailable, unexpected exception. entire website down, database unavailable ...|


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

## Use bufflog middleware with express
```js
const app = express();
app.use(Bufflog.middleware())
```
