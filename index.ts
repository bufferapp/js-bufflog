import {BuffLog} from './bufflog';

let logger = new BuffLog();

logger.info('hello info');
logger.debug('hello debug');
logger.notice('hello notice');
logger.warning('hello warning');
logger.error('hello error');
logger.critical('hello critical');
