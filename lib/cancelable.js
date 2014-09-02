'use strict';

module.exports = Cancelable;

function Cancelable() {
    if (!isCancelable(this)) return new Cancelable();

    var self = this;
    this.finished = false;
    this._cancelbacks = [];
    this._canceled = false;
    this._reason = null;

    self.cancel = function cancel(reason) {
        if (self._canceled || self.finished) return;

        self._canceled = true;

        reason = reason || 'Operation Canceled';
        if (typeof reason === 'string') reason = new Error(reason);
        reason.code = 'OperationCanceled';

        self._reason = reason;

        setTimeout(function () {
            for (var i = 0; i < self._cancelbacks.length; i++) {
                if (typeof self._cancelbacks[i] === 'function') {
                    self._cancelbacks[i](reason);
                }
            }
        }, 0);
    };

    self.canceled = function (callback) {
        if (arguments.length === 0) return self._canceled;
        if (typeof callback === 'function') {
            self._cancelbacks.push(callback);
        }
    };

    self.throwIfCanceled = function () {
        if (self.canceled()) throw self._reason;
    };

}

Cancelable.prototype.future = function () {
    if (!this._passenger) {
        this._passenger = privatize(this, [
            "cancel",
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