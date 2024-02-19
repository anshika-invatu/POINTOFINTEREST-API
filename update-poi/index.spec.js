'use strict';
const expect = require('chai').expect;
const helpers = require('../spec/helpers');
const request = require('request-promise');
const uuid = require('uuid');
const { getMongodbCollection } = require('../db/mongodb');
const samplePointOfInterest = { ...require('../spec/sample-docs/PointOfInterest'), _id: uuid.v4() };

describe('Update PointOfInterest', () => {
    before(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        samplePointOfInterest.partitionKey = samplePointOfInterest._id;
        await collection.insertOne(samplePointOfInterest);
    });

    it('should throw error on incorrect id field', async () => {
        try {
            await request.patch(`${helpers.API_URL}/api/v1/point-of-interest/123-abc`, {
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                },
                body: {
                    subscriberName: 'testing'
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

    it('should throw 404 error if the doc of specified merchantID not exist', async () => {
        try {
            await request.patch(`${helpers.API_URL}/api/v1/point-of-interest/${uuid.v4()}`, {
                json: true,
                headers: {
                    'x-functions-key': process.env.X_FUNCTIONS_KEY
                },
                body: {}
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

    it('should update the document when all validation passes', async () => {
        const result = await request.patch(`${helpers.API_URL}/api/v1/point-of-interest/${samplePointOfInterest._id}`, {
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            },
            body: {
                poiDescriptionLong: 'Some long description of the Voucher'
            }
        });
        const collection = await getMongodbCollection('PointOfInterests');
        const pointOfInterest = await collection.findOne({ _id: samplePointOfInterest._id, partitionKey: samplePointOfInterest._id, docType: 'pointOfInterest' });
        
        expect(pointOfInterest.poiDescriptionLong).to.eql('Some long description of the Voucher');
        expect(result).not.to.be.null;
        expect(result).to.eql({
            code: 200,
            description: 'Successfully updated the specified pointOfInterest'
        });
    });
    after(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        await collection.deleteOne({ _id: samplePointOfInterest._id, docType: 'pointOfInterest', partitionKey: samplePointOfInterest._id });
    });
});