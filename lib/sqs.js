/** @module Sqs*/

import Consumer from 'sqs-consumer';
import Producer from 'sqs-producer';
import { SqsError } from './error';
import Promise from 'bluebird';
import AWS from 'aws-sdk';
import uuid from 'uuid';

/** Class representing Sqs */
export default class Sqs {
    /**
     * Constructs Sqs
     *
     * @param {String} name - The queue name.
     */
    constructor(prefix = 'hooq', suffix = 'development', options = { aws: {} }) {
        const { aws } = options;
        this.prefix = prefix;
        this.suffix = suffix;
        this.sqs = new AWS.SQS({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || aws.accessKeyId,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || aws.secretAccessKey,
            region: process.env.AWS_SQS_REGION || aws.region || 'ap-southeast-1'
        });
        Promise.promisifyAll(this.sqs);
    }

    /**
     * Pushes the data to named queue.
     *
     * @param {String} name - The queue name.
     * @param {Array|Object} records - The payload.
     * returns {Object} The data and timestamp.
     */
    async push(name, records) {
        const data = [],
            queueUrl = await this.queueUrl(name),
            producer = Producer.create({
                sqs: this.sqs,
                queueUrl
            }),
            timestamp = new Date().valueOf();

        if (!Array.isArray(records)) {
            records = [ records ];
        }

        if (records.length === 0) {
            // ignores empty records
            return {
                data,
                timestamp
            };
        }

        for (let record of records) {
            const id = record.id || uuid.v4();
            data.push({
                id,
                body: JSON.stringify(record),
                messageAttributes: {
                    id: { DataType: 'String', StringValue: id }
                }
            });
        }

        // sends the data to queue url
        try {
            await this.sendAsync(producer, data);
            return {
                data,
                timestamp
            };
        } catch (error) {
            throw new SqsError(error.message, 50001, 'push', error);
        }
    }

    /**
     * Subscribes to a queue.
     *
     * @param {String} name - The queue name.
     * @param {Function} handle - The handle Body object function.
     * @return {Consumer} The consumer object, can be stopped.
     */
    async subscribe(name, handle) {
        handle = handle || ((message, done) => { done(); });
        const handleMessage = (message, done) => {
                try {
                    const object = JSON.parse(message.Body);
                    message.MessageAttributes = message.MessageAttributes || { id: { StringValue: uuid.v4() } };
                    object.queueTransactionId = message.MessageAttributes.id.StringValue;
                    handle(object, done);
                } catch (err) {
                    // FIXME: Log the error parsing of non json string
                    // definitely we can ignore this
                    done();
                }
            },
            queueUrl = await this.queueUrl(name),
            consumer = new Consumer({
                sqs: this.sqs,
                queueUrl,
                handleMessage,
                batchSize: 10,
                messageAttributes: [ 'id' ]
            });
        consumer.on('error', (error) => { throw new Error(error.message, 50001, 'subscribe', error); });
        return consumer;
    }

    /**
     * Returns a valid sqs queue url.
     *
     * @param {String} name - The queue name.
     * @return {String} The queue url.
     */
    async queueUrl(name) {
        name = `${this.prefix}-${name}-${this.suffix}`.toLowerCase();
        const list = await this.sqs.listQueuesAsync({ QueueNamePrefix: name }),
            queueUrls = list.QueueUrls || [],
            filtered = queueUrls.filter((url) => { return url.indexOf(name) >= 0; });
        if (queueUrls.length === 0 || filtered.length === 0) {
            try {
                const created = await this.sqs.createQueueAsync({
                    QueueName: name
                });
                // FIXME: when in PROD creates dead letter queue
                return created.QueueUrl;
            } catch (error) {
                // FIXME: log the error
                throw new SqsError(error.message, 50001, 'queueUrl', error);
            }
        }
        return filtered.pop();
    }

    /**
     * Removes a queue from SQS.
     *
     * @param {String} url - The queue url NOT name.
     */
    async removeQueue(queueUrl) {
        await this.sqs.deleteQueueAsync({
            QueueUrl: queueUrl
        });
    }

    /**
     * Sends the record to queue. This is a private API.
     *
     * @param {Producer} producer
     * @param {Array|Object} producer
     */
    sendAsync(producer, messages) {
        if (!Array.isArray(messages)) {
            messages = [ messages ];
        }
        return new Promise((resolve, reject) => {
            producer.send(messages, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
    }
}
