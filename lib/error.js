/** The base extensible error class */
class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

/** Wraps Sqs errors */
class SqsError extends BaseError {
    constructor(message, code, source = 'Sqs', originalError) {
        // Hence we know which place is failing by just reading the message
        super(`${message}`);
        this.code = code;
        this.source = source;
        this.name = this.constructor.name;
        this.originalError = originalError;
    }
}

export { SqsError };
