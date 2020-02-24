import {BuffLog}from './bufflog';

it('Testing jest', () => {
    expect(1).toBe(1)
});


it('Test Bufflog', () => {
    var logger = new BuffLog();
    logger.info("test");
});
