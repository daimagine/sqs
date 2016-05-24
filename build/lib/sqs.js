var Reflect = require('reflect-r');var regeneratorRuntime = require('babel-regenerator-runtime');'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /** @module Sqs*/

var _sqsConsumer = require('sqs-consumer');

var _sqsConsumer2 = _interopRequireDefault(_sqsConsumer);

var _sqsProducer = require('sqs-producer');

var _sqsProducer2 = _interopRequireDefault(_sqsProducer);

var _error = require('./error');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2.default.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Class representing Sqs */

var Sqs = function () {
    /**
     * Constructs Sqs
     *
     * @param {String} name - The queue name.
     */

    function Sqs() {
        var prefix = arguments.length <= 0 || arguments[0] === undefined ? 'hooq' : arguments[0];
        var suffix = arguments.length <= 1 || arguments[1] === undefined ? 'development' : arguments[1];
        var options = arguments.length <= 2 || arguments[2] === undefined ? { aws: {}, useNameOnly: false } : arguments[2];

        _classCallCheck(this, Sqs);

        var aws = options.aws;
        var useNameOnly = options.useNameOnly;

        this.prefix = prefix;
        this.suffix = suffix;
        this.useNameOnly = useNameOnly;
        this.sqs = new _awsSdk2.default.SQS({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || aws.accessKeyId,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || aws.secretAccessKey,
            region: process.env.AWS_SQS_REGION || aws.region || 'ap-southeast-1'
        });
_bluebird2.default.promisifyAll(this.sqs);
    }

    /**
     * Pushes the data to named queue.
     *
     * @param {String} name - The queue name.
     * @param {Array|Object} records - The payload.
     * returns {Object} The data and timestamp.
     */


    _createClass(Sqs, [{
        key: 'push',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(name, records) {
                var data, queueUrl, producer, timestamp, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, record, id;

                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                data = [];
                                _context.next = 3;
                                return this.queueUrl(name);

                            case 3:
                                queueUrl = _context.sent;
                                producer = _sqsProducer2.default.create({
                                    sqs: this.sqs,
                                    queueUrl: queueUrl
                                });
                                timestamp = new Date().valueOf();


                                if (!Array.isArray(records)) {
                                    records = [records];
                                }

                                if (!(records.length === 0)) {
                                    _context.next = 9;
                                    break;
                                }

                                return _context.abrupt('return', {
                                    data:
                                    // ignores empty records
                                    data,
                                    timestamp: timestamp
                                });

                            case 9:
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context.prev = 12;


                                for (_iterator = records[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                    record = _step.value;
                                    id = record.id || _uuid2.default.v4();

                                    data.push({
                                        id: id,
                                        body: JSON.stringify(record),
                                        messageAttributes: {
                                            id: { DataType: 'String', StringValue: id }
                                        }
                                    });
                                }

                                // sends the data to queue url
                                _context.next = 20;
                                break;

                            case 16:
                                _context.prev = 16;
                                _context.t0 = _context['catch'](12);
                                _didIteratorError = true;
                                _iteratorError = _context.t0;

                            case 20:
                                _context.prev = 20;
                                _context.prev = 21;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 23:
                                _context.prev = 23;

                                if (!_didIteratorError) {
                                    _context.next = 26;
                                    break;
                                }

                                throw _iteratorError;

                            case 26:
                                return _context.finish(23);

                            case 27:
                                return _context.finish(20);

                            case 28:
                                _context.prev = 28;
                                _context.next = 31;
                                return this.sendAsync(producer, data);

                            case 31:
                                return _context.abrupt('return', {
                                    data: data,
                                    timestamp: timestamp
                                });

                            case 34:
                                _context.prev = 34;
                                _context.t1 = _context['catch'](28);
                                throw new _error.SqsError(_context.t1.message, 50001, 'push', _context.t1);

                            case 37:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[12, 16, 20, 28], [21,, 23, 27], [28, 34]]);
            }));

            function push(_x4, _x5) {
                return ref.apply(this, arguments);
            }

            return push;
        }()

        /**
         * Subscribes to a queue.
         *
         * @param {String} name - The queue name.
         * @param {Function} handle - The handle Body object function.
         * @return {Consumer} The consumer object, can be stopped.
         */

    }, {
        key: 'subscribe',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(name, handle) {
                var handleMessage, queueUrl, consumer;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                handle = handle || function (message, done) {
                                    done();
                                };

                                handleMessage = function handleMessage(message, done) {
                                    try {
                                        var object = JSON.parse(message.Body);
                                        message.MessageAttributes = message.MessageAttributes || { id: { StringValue: _uuid2.default.v4() } };
                                        object.queueTransactionId = message.MessageAttributes.id.StringValue;
                                        handle(object, done);
                                    } catch (err) {
                                        // FIXME: Log the error parsing of non json string
                                        // definitely we can ignore this
                                        done();
                                    }
                                };

                                _context2.next = 4;
                                return this.queueUrl(name);

                            case 4:
                                queueUrl = _context2.sent;
                                consumer = new _sqsConsumer2.default({
                                    sqs: this.sqs,
                                    queueUrl: queueUrl,
                                    handleMessage: handleMessage,
                                    batchSize: 10,
                                    messageAttributes: ['id']
                                });

                                consumer.on('error', function (error) {
                                    throw new Error(error.message, 50001, 'subscribe', error);
                                });
                                return _context2.abrupt('return', consumer);

                            case 8:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function subscribe(_x6, _x7) {
                return ref.apply(this, arguments);
            }

            return subscribe;
        }()

        /**
         * Returns a valid sqs queue url.
         *
         * @param {String} name - The queue name.
         * @return {String} The queue url.
         */

    }, {
        key: 'queueUrl',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(name) {
                var list, queueUrls, filtered, created;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                name = this.useNameOnly ? name : (this.prefix + '-' + name + '-' + this.suffix).toLowerCase();
                                _context3.next = 3;
                                return this.sqs.listQueuesAsync({ QueueNamePrefix: name });

                            case 3:
                                list = _context3.sent;
                                queueUrls = list.QueueUrls || [];
                                filtered = queueUrls.filter(function (url) {
                                    return url.indexOf(name) >= 0;
                                });

                                if (!(queueUrls.length === 0 || filtered.length === 0)) {
                                    _context3.next = 17;
                                    break;
                                }

                                _context3.prev = 7;
                                _context3.next = 10;
                                return this.sqs.createQueueAsync({
                                    QueueName: name
                                });

                            case 10:
                                created = _context3.sent;
                                return _context3.abrupt('return', created.QueueUrl);

                            case 14:
                                _context3.prev = 14;
                                _context3.t0 = _context3['catch'](7);
                                throw new _error.SqsError(_context3.t0.message, 50001, 'queueUrl', _context3.t0);

                            case 17:
                                return _context3.abrupt('return', filtered.pop());

                            case 18:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this, [[7, 14]]);
            }));

            function queueUrl(_x8) {
                return ref.apply(this, arguments);
            }

            return queueUrl;
        }()

        /**
         * Removes a queue from SQS.
         *
         * @param {String} url - The queue url NOT name.
         */

    }, {
        key: 'removeQueue',
        value: function () {
            var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(queueUrl) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.sqs.deleteQueueAsync({
                                    QueueUrl: queueUrl
                                });

                            case 2:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function removeQueue(_x9) {
                return ref.apply(this, arguments);
            }

            return removeQueue;
        }()

        /**
         * Sends the record to queue. This is a private API.
         *
         * @param {Producer} producer
         * @param {Array|Object} producer
         */

    }, {
        key: 'sendAsync',
        value: function sendAsync(producer, messages) {
            if (!Array.isArray(messages)) {
                messages = [messages];
            }
            return new _bluebird2.default(function (resolve, reject) {
                producer.send(messages, function (err) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(true);
                });
            });
        }
    }]);

    return Sqs;
}();

exports.default = Sqs;
//# sourceMappingURL=sqs.js.map
