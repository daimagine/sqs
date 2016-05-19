var Reflect = require('reflect-r');var regeneratorRuntime = require('babel-regenerator-runtime');'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SqsError = undefined;

var _sourceMapSupport = require('source-map-support');

var _sqs = require('./sqs');

var _sqs2 = _interopRequireDefault(_sqs);

var _error = require('./error.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _sourceMapSupport.install)(); /** @module Index */


// Exposes main entrypoint to the lib.
exports.default = _sqs2.default;

// Exposes the lib error.

exports.SqsError = _error.SqsError;
//# sourceMappingURL=index.js.map
