"use strict";

var Cancelable = require('./lib/cancelable');

var create = exports = module.exports = function () {
    return new Cancelable();
};

exports.possible = function () {
    return create().possible();
};

exports.Cancelable = Cancelable;
exports.isCancelable = Cancelable.isCancelable;