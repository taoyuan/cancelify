"use strict";

var async = require('async');
var t = require('chai').assert;
var cancelify = require('../');

describe.only('cancelify', function () {

    describe('Default token fn', function () {
        it('should not get canceled', function (done) {
            delay(10, done);
        });
    });

    describe('Canceling with a possible', function () {
        it('should invoke callback with reason in the next turn of the event loop', function (done) {
            var cancelable = cancelify();
            var waitedTillNextTurn = false;
            var timeout;
            cancelable.cancel('Test Cancel');
            waitedTillNextTurn = true;
            timeout = setTimeout(function () {
                throw new Error('Did not cancel fast enough');
            }, 100);

            delay(20000, cancelable.possible(), function (reason) {
                if (!reason) throw new Error('Should have been canceled');
                t(waitedTillNextTurn);
                t.instanceOf(reason, Error);
                t.equal(reason.message, 'Test Cancel');
                t.equal(reason.code, 'OperationCanceled');
                clearTimeout(timeout);
                done();
            });
        });
    });

    describe('Polling for cancelify', function () {
        describe('using `.canceled()`', function () {
            it('should works', function (done) {
                var cancelable = cancelify();
                var timeout;
                cancelable.cancel('Test Cancel');
                timeout = setTimeout(function () {
                    throw new Error('Did not cancel fast enough');
                }, 30);
                delay2(40, cancelable.possible(), function (reason) {
                    if (!reason) throw new Error('Should have been canceled');
                    clearTimeout(timeout);
                    done();
                });
            });
        });
        describe('using `.throwIfCanceled()`', function () {
            it('should works', function (done) {
                var cancelable = cancelify();
                var timeout;
                cancelable.cancel('Test Cancel');
                timeout = setTimeout(function () {
                    throw new Error('Did not cancel fast enough');
                }, 30);
                delay3(40, cancelable.possible(), function (reason) {
                    if (!reason) throw new Error('Should have been canceled');
                    clearTimeout(timeout);
                    done();
                });
            });
        });
    });

    describe('Cascading cancelify', function () {
        it('should works', function (done) {
            var cancelable = cancelify();
            var waitedTillNextTurn = false;
            var timeout;
            cancelable.cancel('Test Cancel');
            waitedTillNextTurn = true;
            timeout = setTimeout(function () {
                throw new Error('Did not cancel fast enough');
            }, 20);
            cascade(cancelable.possible(), function (reason) {
                if (!reason) throw new Error('Should have been canceled');
                t(waitedTillNextTurn);
                t.instanceOf(reason, Error);
                t.equal(reason.message, 'Test Cancel');
                t.equal(reason.code, 'OperationCanceled');
                clearTimeout(timeout);
                done();
            });
        });
    });
});


function delay(timeout, possible, cb) {
    if (typeof possible === 'function') {
        cb = possible;
        possible = null;
    }
    possible = possible || cancelify.possible();

    var called = false;

    function done(err) {
        if (called) return;
        called = true;
        cb(err);
    }

    setTimeout(done, timeout);
    possible.canceled(done);
}

function delay2(timeout, possible, cb) {
    if (typeof possible === 'function' && !possible.canceled) {
        cb = possible;
        possible = null;
    }
    possible = possible || cancelify.possible();
    setTimeout(function () {
        if (possible.canceled()) return cb(new Error('Operation Canceled'));
        cb();
    }, timeout / 4);
}

function delay3(timeout, possible, cb) {
    if (typeof possible === 'function' && !possible.canceled) {
        cb = possible;
        possible = null;
    }
    possible = possible || cancelify.possible();

    async.series([
        function (callback) {
            delay(timeout / 4, callback);
        },
        function (callback) {
            safeThrowIfCanceled(callback);
        },
        function (callback) {
            safeThrowIfCanceled(callback);
        },
        function (callback) {
            safeThrowIfCanceled(callback);
        }
    ], cb);

    function safeThrowIfCanceled(callback) {
        try {
            possible.throwIfCanceled();
            delay(timeout / 4, callback);
        } catch (e) {
            callback(e);
        }
    }
}

function cascade(possible, cb) {
    async.series([
        function (callback) {
            delay(500, possible, callback);
        },
        function (callback) {
            delay(500, possible, callback);
        },
        function (callback) {
            delay(500, possible, callback);
        }
    ], cb);
}
