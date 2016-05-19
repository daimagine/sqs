/** @module Index */
import { install } from 'source-map-support'; install();

import Sqs from './sqs';
import { SqsError } from './error.js';

// Exposes main entrypoint to the lib.
export default Sqs;

// Exposes the lib error.
export { SqsError };
