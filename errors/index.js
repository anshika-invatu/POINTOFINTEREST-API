'use strict';

class BaseError extends Error {
    constructor (message, code) {
        super(message);
        this.name = 'PointOfInterestBaseError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;

class DuplicatePointOfInterestError extends BaseError {
    constructor (message, code) {
        super(message, code);
        this.name = 'DuplicatePointOfInterestError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.DuplicatePointOfInterestError = DuplicatePointOfInterestError;

class PointOfInterestNotFoundError extends BaseError {
    constructor (message, code) {
        super(message);
        this.name = 'PointOfInterestNotFoundError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.PointOfInterestNotFoundError = PointOfInterestNotFoundError;

class EmptyRequestBodyError extends BaseError {
    constructor (message, code) {
        super(message);
        this.name = 'EmptyRequestBodyError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.EmptyRequestBodyError = EmptyRequestBodyError;

class InvalidUUIDError extends BaseError {
    constructor (message, code) {
        super(message, code);
        this.name = 'InvalidUUIDError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InvalidUUIDError = InvalidUUIDError;

class FieldValidationError extends BaseError {
    constructor (message, code) {
        super(message);
        this.name = 'FieldValidationError';
        this.code = code;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.FieldValidationError = FieldValidationError;
