'use strict';

const expect = require('chai').expect;
const helpers = require('../spec/helpers');
const request = require('request-promise');
const uuid = require('uuid');
const { getMongodbCollection } = require('../db/mongodb');
const samplePointOfInterest = { ...require('../spec/sample-docs/PointOfInterest'), _id: uuid.v4() };
samplePointOfInterest.partitionKey = samplePointOfInterest._id;

describe('Create pointOfInterest', () => {

    
    it('should return status code 400 when request body is null', async () => {
        try {
            await request.post(helpers.API_URL + '/api/v1/point-of-interest', {
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                }
            });
        } catch (error) {
            const response = {
                code: 400,
                description: 'You\'ve requested to create a new pointOfInterest but the request body seems to be empty. Kindly pass the request body in application/json format',
                reasonPhrase: 'EmptyRequestBodyError'
            };
            expect(error.statusCode).to.equal(400);
            expect(error.error).to.eql(response);
        }
    });
    it('should throw error on incorrect _id field', async () => {
        try {
            await request.post(helpers.API_URL + '/api/v1/point-of-interest', {
                body: {
                    _id: 123
                },
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                }
            });
        } catch (error) {
            const response = {
                code: 400,
                description: 'The _id specified in the request body does not match the UUID v4 format.',
                reasonPhrase: 'InvalidUUIDError'
            };
            expect(error.statusCode).to.equal(400);
            expect(error.error).to.eql(response);
        }
    });

    it('should create doc when all validation passes', async () => {

        const result = await request.post(helpers.API_URL + '/api/v1/point-of-interest', {
            body: samplePointOfInterest,
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(result).not.to.be.null;
        expect(result._id).to.equal(samplePointOfInterest._id);
        expect(result.docType).to.equal('pointOfInterest');
    });

    it('should throw error on duplicate _id field', async () => {
        try {
            await request.post(helpers.API_URL + '/api/v1/point-of-interest', {
                body: samplePointOfInterest,
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                }
            });
        } catch (error) {
            const response = {
                code: 409,
                description: 'You\'ve requested to create a new pointOfInterest but a pointOfInterest with the specified _id field already exists.',
                reasonPhrase: 'DuplicatePointOfInterestError'
            };
            expect(error.statusCode).to.equal(409);
            expect(error.error).to.eql(response);
        }
    });

    after(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        await collection.deleteOne({ _id: samplePointOfInterest._id, partitionKey: samplePointOfInterest.partitionKey, docType: 'pointOfInterest' });
    });
});