import tracer from 'dd-trace';
import express from 'express';

// ES6 style
import BuffLog from "./bufflog";

tracer.init({
    hostname: "dd-agent-hostname",
    //  will automatically append the traces to BuffLog
    logInjection: true
});

BuffLog.debug('hello debug');
BuffLog.info('hello info');
BuffLog.notice('hello notice');
BuffLog.notice('hello notice with context to redact', {"test":"toto", "password":"must-redact", req: {headers: {cookie: "must-redact"}}});
BuffLog.warning('hello warning');
BuffLog.error('hello error');
BuffLog.critical('hello critical');
BuffLog.critical('hello critical', {"some":"stuff"});

const app = express();

app.use(BuffLog.middleware())

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
    BuffLog.notice("Notice log via endpoint with req and res in context", {req ,res});
    res.send({'hello': 'world'})
});

app.get('/error500', (req, res) =>  {
    BuffLog.critical('hello critical');
    return res.status(500).send({
        message: 'This is an error 500!'
     });
});

app.get('/error404', (req, res) =>  {
    BuffLog.critical('hello critical');
    return res.status(404).send({
        message: 'This is a 404!'
     });
});
