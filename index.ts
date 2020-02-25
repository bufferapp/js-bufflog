import tracer from "dd-trace";
import express from 'express';
import bufflog from './bufflog';

tracer.init({
    hostname: "dd-agent-hostname",
    //  will automatically append the traces to BuffLog
    logInjection: true
});

bufflog.info('hello info');
bufflog.notice('hello notice');
bufflog.notice('hello notice with context', {"test":"toto"});
bufflog.warning('hello warning');
bufflog.error('hello error');
bufflog.critical('hello critical');
bufflog.critical('hello critical', {"some":"stuff"});

const app = express();

app.listen(4000, () => {
    console.log(`Server is listening on port 4000`);
});

app.get('/', (req, res) =>  {
    bufflog.notice("Notice log via endpoint");
    bufflog.info('hello info');
    bufflog.debug('hello debug');
    bufflog.notice('hello notice');
    bufflog.warning('hello warning');
    bufflog.error('hello error');
    bufflog.critical('hello critical');
});