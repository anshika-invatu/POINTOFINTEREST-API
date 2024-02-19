'use strict';
require('dotenv').config();
const validator = require('validator');
const errors = require('../errors');
const { MongoError } = require('mongodb');
var winston = require('winston');
require('winston-loggly-bulk');

exports.validateUUIDField = (context, id, message = 'The order id specified in the URL does not match the UUID v4 format.') => {
    return new Promise((resolve, reject) => {
        if (validator.isUUID(id, 4)) {
            resolve();
        } else {
            reject(
                new errors.InvalidUUIDError(message, 400)
            );
        }
    });
};

class BaseError extends Error {
    constructor (message, code) {
        super(message);
        this.name = 'PointOfInterestServerError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;

exports.handleError = (context, error) => {
    context.log.error('Exception logs : ' + error);
    switch (error.constructor) {
        case errors.EmptyRequestBodyError:
        case errors.InvalidUUIDError:
        case errors.FieldValidationError:
            this.setContextResError(context, error);
            break;
        case MongoError:
            this.handleMongoErrors(context, error);
            break;
        default:
            this.handleDefaultError(context, error);
            break;
    }
};
class PointOfInterestServerError extends BaseError {
    constructor (message, code) {
        super(message, code);
        this.name = 'PointOfInterestServerError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.PointOfInterestServerError = PointOfInterestServerError;


exports.handleDefaultError = (context, error) => {
    const body = {
        code: error.code,
        description: error.message,
        reasonPhrase: error.name
    };
    context.res = {
        status: error.code,
        body: body
    };
};

exports.setContextResError = (context, error) => {
    const body = {
        code: error.code,
        description: error.message,
        reasonPhrase: error.name
    };
    context.res = {
        status: error.code,
        body: body
    };
};

exports.logEvents = (message) => {
    var error = Object.assign({}, message);
    error.functionName = 'PointOfInterest';
    winston.configure({
        transports: [
            new winston.transports.Loggly({
                token: process.env.LOGGLY_TOKEN,
                subdomain: 'vourity',
                tags: ['Winston-NodeJS'],
                json: true
            })
        ]
    });

    winston.log('error', error);
};

exports.handleMongoErrors = (context, error) => {
    switch (error.code) {
        case 11000:
            handleDuplicateDocumentInserts(context);
            break;
        default:
            this.handleDefaultError(context, error);
            break;
    }
};

const handleDuplicateDocumentInserts = context => {
    let className, entity;

    if (context.req.body.docType === 'pointOfInterest') {
        className = 'DuplicatePointOfInterestError';
        entity = 'pointOfInterest';
    }

    this.setContextResError(
        context,
        new errors[className](
            `You've requested to create a new ${entity} but a ${entity} with the specified _id field already exists.`,
            409
        )
    );
};