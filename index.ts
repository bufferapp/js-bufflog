import tracer from "dd-trace";
import express from 'express';

// CommonJS style
//const BuffLog = require('./bufflog');

// ES6 style
import * as BuffLog  from "./bufflog";

tracer.init({
    hostname: "dd-agent-hostname",
    //  will automatically append the traces to BuffLog
    logInjection: true
});

BuffLog.debug('hello debug');
BuffLog.info('hello info');
BuffLog.notice('hello notice');
BuffLog.notice('hello notice with context', {"test":"toto"});
BuffLog.warning('hello warning');
BuffLog.error('hello error');
BuffLog.critical('hello critical');
BuffLog.critical('hello critical', {"some":"stuff"});

const app = express();

app.listen(4000, () => {
    console.log(`Server is listening on port 4000`);
});

app.get('/', (req, res) =>  {
    BuffLog.notice("Notice log via endpoint");
    BuffLog.info('hello info');
    BuffLog.debug('hello debug');
    BuffLog.notice('hello notice');
    BuffLog.warning('hello warning');
    BuffLog.error('hello error');
    BuffLog.critical('hello critical');
});