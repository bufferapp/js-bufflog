// bufflog reads LOG_LEVEL once, at import time, and defaults to "notice".
// The tests need the two levels below notice to reach the sink.
process.env.LOG_LEVEL = 'debug'
