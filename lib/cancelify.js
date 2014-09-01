"use strict";

exports = module.exports = function (fn) {
    return new Cancelify(fn);
};

exports.empty = function (fn) {
    return (new Cancelify(fn)).future;
};

function noop() {}

function Cancelify(fn) {
    if (!(this instanceof Cancelify)) return new Cancelify(fn);

    var data = {
        fn: fn || noop,
        reason: null,
        cancelled: false,
        callbacks: []
    };

    this.cancel = Cancel(data);
    this.future = Future(data);
}

function Cancel(data) {
    return function cancel(reason) {
        data.fn = noop;
        data.cancelled = true;
        reason = reason || 'Operation Cancelled';
        if (typeof reason === 'string') reason = new Error(reason);
        reason.code = 'OperationCancelled';
        data.reason = reason;
        setTimeout(function () {
            for (var i = 0; i < data.callbacks.length; i++) {
                if (typeof data.callbacks[i] === 'function') {
                    data.callbacks[i](reason);
                }
            }
        }, 0);
    };
}

function Future(data) {
    var future = function () {
        if (!future.cancelled()) return data.fn.apply(this, arguments);
    };

    future.cancelled = future.canceled = function (callback) {
        if (arguments.length === 0) return data.cancelled;

        if (future.cancelled()) {
            setTimeout(function () {
                callback(data.reason);
            }, 0);
        } else {
            data.callbacks.push(callback);
        }
    };

    future.throwIfCancelled = future.throwIfCanceled = function () {
        if (future.cancelled()) throw data.reason;
    };

    return future;
}