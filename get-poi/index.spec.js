'use strict';

const expect = require('chai').expect;
const helpers = require('../spec/helpers');
const request = require('request-promise');
const uuid = require('uuid');
const { getMongodbCollection } = require('../db/mongodb');
const samplePointOfInterest = { ...require('../spec/sample-docs/PointOfInterest'), _id: uuid.v4() };

describe('Get PointOfInterest', () => {
    before(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        samplePointOfInterest.partitionKey = samplePointOfInterest._id;
        await collection.insertOne(samplePointOfInterest);
    });

    it('should throw error on incorrect id field', async () => {
        try {
            await request.get(`${helpers.API_URL}/api/v1/point-of-interest/123-abc`, {
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                }
            });
        } catch (error) {
            const response = {
                code: 400,
                description: 'The pointOfInterest id specified in the URL does not match the UUID v4 format.',
                reasonPhrase: 'InvalidUUIDError'
            };

            expect(error.statusCode).to.equal(400);
            expect(error.error).to.eql(response);
        }
    });

    it('should throw 404 error if the pointOfInterest id not exist', async () => {
        try {
            await request.get(`${helpers.API_URL}/api/v1/point-of-interest/${uuid.v4()}`, {
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                }
            });
        } catch (error) {
            const response = {
                code: 404,
                description: 'The pointOfInterest id specified in the URL doesn\'t exist.',
                reasonPhrase: 'PointOfInterestNotFoundError'
            };

            expect(error.statusCode).to.equal(404);
            expect(error.error).to.eql(response);
        }
    });

    it('should return the document when all validation passes', async () => {
        const result = await request.get(`${helpers.API_URL}/api/v1/point-of-interest/${samplePointOfInterest._id}`, {
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        
        expect(result).not.to.be.null;
        expect(result._id).to.eql(samplePointOfInterest._id);
    });

    after(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        await collection.deleteOne({ _id: samplePointOfInterest._id, docType: 'pointOfInterest', partitionKey: samplePointOfInterest._id });
    });

    
});