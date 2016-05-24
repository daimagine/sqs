// This test requires a .env file with following keys:
// - AWS_ACCESS_KEY_ID
// - AWS_SECRET_ACCESS_KEY
//
// What is .env, please see: https://www.npmjs.com/package/dotenv
import test from 'ava';
import Sqs from '../lib';
const timestamp = new Date().valueOf(),
    PREFIX = 'hooq-test',
    SUFFIX = 'development';

test('Push', async (t) => {
    const sqs = new Sqs(PREFIX, SUFFIX, { useNameOnly: false });
    await sqs.push(timestamp, { timestamp });
});

test.cb('Subscribe', (t) => {
    let queueUrl;
    const sqs = new Sqs(PREFIX, SUFFIX);
    sqs.subscribe(timestamp, (message, done) => {
        t.deepEqual(message.timestamp, timestamp);
        done();
        setTimeout(() => {
            sqs.removeQueue(queueUrl)
                .then(() => {
                    t.end();
                })
                .catch((error) => {
                    t.falsy(error);
                    t.end();
                });
        // wait for done() to be finished, coffee?
        }, 5000);
    })
    .then((subscriber) => {
        queueUrl = subscriber.queueUrl;
        subscriber.start();
    });
});
