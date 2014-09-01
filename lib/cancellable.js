"use strict";

exports = module.exports = function (fn) {
    return new Cancellable(fn);
};

exports.empty = function (fn) {
    return (new Cancellable(fn)).future;
};

function noop() {}

function Cancellable(fn) {
    if (!(this instanceof Cancellable)) return new Cancellable(fn);

    var cancellation = {
        fn: fn || noop,
        reason: null,
        cancelled: false,
        callbacks: []
    };

    this.cancel = Cancel(cancellation);
    this.future = Future(cancellation);
}

function Cancel(cancellation) {
    return function cancel(reason) {
        cancellation.fn = noop;
        cancellation.cancelled = true;
        reason = reason || 'Operation Cancelled';
        if (typeof reason === 'string') reason = new Error(reason);
        reason.code = 'OperationCancelled';
        cancellation.reason = reason;
        setTimeout(function () {
            for (var i = 0; i < cancellation.callbacks.length; i++) {
                if (typeof cancellation.callbacks[i] === 'function') {
                    cancellation.callbacks[i](reason);
                }
            }
        }, 0);
    };
}

function Future(cancellation) {
    var future = function () {
        if (!future.cancelled()) return cancellation.fn.apply(this, arguments);
    };

    future.cancelled = future.canceled = function (callback) {
        if (arguments.length === 0) return cancellation.cancelled;

        if (future.cancelled()) {
            setTimeout(function () {
                callback(cancellation.reason);
            }, 0);
        } else {
            cancellation.callbacks.push(callback);
        }
    };

    future.throwIfCancelled = future.throwIfCanceled = function () {
        if (future.cancelled()) throw cancellation.reason;
    };

    return future;
}