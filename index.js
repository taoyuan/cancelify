"use strict";

var Cancelable = require('./lib/cancelable');

var create = exports = module.exports = function () {
    return new Cancelable();
};

exports.future = function () {
    return create().future();
};

exports.Cancelable = Cancelable;
exports.isCancelable = Cancelable.isCancelable;