"use strict";

var async = require('async');
var t = require('chai').assert;
var cancelify = require('../lib/cancelify');

describe.only('cancelify', function () {

    describe('Default token fn', function () {
        it('should not get cancelled', function (done) {
            delay(10, done);
        });
    });

    describe('Cancelling with a future', function () {
        it('should invoke callback with reason in the next turn of the event loop', function (done) {
            var fn = cancelify();
            var waitedTillNextTurn = false;
            var timeout;
            fn.cancel('Test Cancel');
            waitedTillNextTurn = true;
            timeout = setTimeout(function () {
                throw new Error('Did not cancel fast enough');
            }, 100);

            delay(20000, fn.future, function (reason) {
                if (!reason) throw new Error('Should have been cancelled');
                t(waitedTillNextTurn);
                t.instanceOf(reason, Error);
                t.equal(reason.message, 'Test Cancel');
                t.equal(reason.code, 'OperationCancelled');
                clearTimeout(timeout);
                done();
            });
        });
    });

    describe('Polling for cancelify', function () {
        describe('using `.cancelled()`', function () {
            it('should works', function (done) {
                var fn = cancelify();
                var timeout;
                fn.cancel('Test Cancel');
                timeout = setTimeout(function () {
                    throw new Error('Did not cancel fast enough');
                }, 30);
                delay2(40, fn.future, function (reason) {
                    if (!reason) throw new Error('Should have been cancelled');
                    clearTimeout(timeout);
                    done();
                });
            });
        });
        describe('using `.throwIfCancelled()`', function () {
            it('should works', function (done) {
                var fn = cancelify();
                var timeout;
                fn.cancel('Test Cancel');
                timeout = setTimeout(function () {
                    throw new Error('Did not cancel fast enough');
                }, 30);
                delay3(40, fn.future, function (reason) {
                    if (!reason) throw new Error('Should have been cancelled');
                    clearTimeout(timeout);
                    done();
                });
            });
        });
    });

    describe('Cascading cancelify', function () {
        it('should works', function (done) {
            var fn = cancelify();
            var waitedTillNextTurn = false;
            var timeout;
            fn.cancel('Test Cancel');
            waitedTillNextTurn = true;
            timeout = setTimeout(function () {
                throw new Error('Did not cancel fast enough');
            }, 20);
            cascade(fn.future, function (reason) {
                if (!reason) throw new Error('Should have been cancelled');
                t(waitedTillNextTurn);
                t.instanceOf(reason, Error);
                t.equal(reason.message, 'Test Cancel');
                t.equal(reason.code, 'OperationCancelled');
                clearTimeout(timeout);
                done();
            });
        });
    });
});


function delay(timeout, future, cb) {
    if (typeof future === 'function' && !future.cancelled) {
        cb = future;
        future = null;
    }
    future = future || cancelify.future();

    var called = false;

    function done(err) {
        if (called) return;
        called = true;
        cb(err);
    }

    setTimeout(done, timeout);
    future.cancelled(done);
}

function delay2(timeout, future, cb) {
    if (typeof future === 'function' && !future.cancelled) {
        cb = future;
        future = null;
    }
    future = future || cancelify.future();
    setTimeout(function () {
        if (future.cancelled()) return cb(new Error('Operation Cancelled'));
        cb();
    }, timeout / 4);
}

function delay3(timeout, future, cb) {
    if (typeof future === 'function' && !future.cancelled) {
        cb = future;
        future = null;
    }
    future = future || cancelify.future();

    async.series([
        function (callback) {
            delay(timeout / 4, callback);
        },
        function (callback) {
            safeThrowIfCancelled(callback);
        },
        function (callback) {
            safeThrowIfCancelled(callback);
        },
        function (callback) {
            safeThrowIfCancelled(callback);
        }
    ], cb);

    function safeThrowIfCancelled(callback) {
        try {
            future.throwIfCancelled();
            delay(timeout / 4, callback);
        } catch (e) {
            callback(e);
        }
    }
}

function cascade(future, cb) {
    async.series([
        function (callback) {
            delay(500, future, callback);
        },
        function (callback) {
            delay(500, future, callback);
        },
        function (callback) {
            delay(500, future, callback);
        }
    ], cb);
}
