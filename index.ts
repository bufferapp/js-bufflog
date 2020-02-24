import tracer from "dd-trace";
import express from 'express';
import {BuffLog} from './bufflog';

tracer.init({
    hostname: "dd-agent-hostname",
    logInjection: false
});

let logger = new BuffLog();

logger.info('hello info');
logger.debug('hello debug');
logger.notice('hello notice');
logger.warning('hello warning');
logger.error('hello error');
logger.critical('hello critical');

const app = express();

app.listen(4000, () => {
    console.log(`Server is listening on port 4000`);
});

app.get('/', (req, res) =>  {
    var logger = new BuffLog();
    logger.notice("Notice log via endpoint");
    logger.info('hello info');
    logger.debug('hello debug');
    logger.notice('hello notice');
    logger.warning('hello warning');
    logger.error('hello error');
    logger.critical('hello critical');
});