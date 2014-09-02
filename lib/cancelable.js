'use strict';

module.exports = Cancelable;

function Cancelable() {
    if (!isCancelable(this)) return new Cancelable();

    var future = this;
    this.finished = false;
    this._cancelbacks = [];
    this._canceled = false;
    this._reason = null;

    future.cancel = function cancel(reason) {
        if (future._canceled || future.finished) return;

        future._canceled = true;

        reason = reason || 'Operation Canceled';
        if (typeof reason === 'string') reason = new Error(reason);
        reason.code = 'OperationCanceled';

        future._reason = reason;

        setTimeout(function () {
            for (var i = 0; i < future._cancelbacks.length; i++) {
                if (typeof future._cancelbacks[i] === 'function') {
                    future._cancelbacks[i](reason);
                }
            }
        }, 0);
    };

    future.canceled = function (callback) {
        if (arguments.length === 0) return future._canceled;
        if (typeof callback === 'function') {
            future._cancelbacks.push(callback);
        }
    };

    future.throwIfCanceled = function () {
        if (future.canceled()) throw future._reason;
    };

}

Cancelable.prototype.possible = function () {
    if (!this._passenger) {
        this._passenger = privatize(this, [
            "canceled",
            "throwIfCanceled"
        ]);
    }
    return this._passenger;
};

Cancelable.prototype.isCancelable = isCancelable;

Cancelable.isCancelable = isCancelable;

function isCancelable(obj) {
    return obj instanceof Cancelable;
}

function privatize(obj, pubs) {
    var result = {};
    pubs.forEach(function (pub) {
        result[pub] = function () {
            obj[pub].apply(obj, arguments);
            return result;
        };
    });
    return result;
}