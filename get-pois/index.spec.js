'use strict';

const expect = require('chai').expect;
const helpers = require('../spec/helpers');
const request = require('request-promise');
const uuid = require('uuid');
const merchantID = uuid.v4();
const { getMongodbCollection } = require('../db/mongodb');
const samplePointOfInterest = { ...require('../spec/sample-docs/PointOfInterest'), _id: uuid.v4() };

samplePointOfInterest.partitionKey = samplePointOfInterest._id;
samplePointOfInterest.merchantID = merchantID;
samplePointOfInterest.poiName = 'test 1234';
samplePointOfInterest.location.streetRow1 = 'test 1234';
samplePointOfInterest.categories[1] = 'test';
samplePointOfInterest.tags[1] = 'test123';
samplePointOfInterest.rating = 3.6;
samplePointOfInterest.aPoint = {};
samplePointOfInterest.aPoint.type = 'Point';
samplePointOfInterest.aPoint.coordinates = [samplePointOfInterest.location.longitude, samplePointOfInterest.location.latitude];

describe('Search POI', () => {
    before(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        await collection.insertOne(samplePointOfInterest);
        await collection.createIndexes({
            aPoint: '2dsphere'
        });
    });

    it('should return poi by merchantID', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            json: true,
            body: { merchantID: merchantID },
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
    
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].merchantID).to.equal(merchantID);
    });


    it('should return poi by poiName', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                poiName: 'test'
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].poiName).to.includes('test');
    });

    it('should return poi by location.streetRow1', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                location: {
                    streetRow1: 'test'
                }
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].location.streetRow1).to.includes('test');
    });

    it('should return poi by categories', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                categories: ['test']
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].categories).to.includes('test');
    });

    it('should return poi by tags', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                tags: ['test123']
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].tags).to.includes('test123');
    });

    it('should return poi by rating', async () => {
       
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                rating: 3
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].rating).to.greaterThan(3);
    });

    it('should return poi by position', async () => {
        const lat = samplePointOfInterest.location.latitude + (180 / Math.PI) * (10 / 6378137);
        const lon = samplePointOfInterest.location.longitude + (180 / Math.PI) * (10 / 6378137) / Math.cos(samplePointOfInterest.location.latitude);
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                location: {
                    latitude: lat,
                    longitude: lon
                },
                radius: 50,
                merchantID: merchantID
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi[0].docType).to.equal('pointOfInterest');
        expect(poi[0].merchantID).to.equal(merchantID);
        
    });

    it('should return empty array by position with latitude and longitude outside radius', async () => {
        const lat = samplePointOfInterest.location.latitude + (180 / Math.PI) * (50 / 6378137);
        const lon = samplePointOfInterest.location.longitude + (180 / Math.PI) * (60 / 6378137) / Math.cos(samplePointOfInterest.location.latitude);
        const poi = await request.post(`${helpers.API_URL}/api/v1/get-pois`, {
            body: {
                location: {
                    latitude: lat,
                    longitude: lon
                },
                radius: 50,
                merchantID: merchantID
            },
            json: true,
            headers: {
                'x-functions-key': process.env.X_FUNCTIONS_KEY
            }
        });
        expect(poi).not.to.be.null;
        expect(poi).to.lengthOf(0);
    });

    after(async () => {
        const collection = await getMongodbCollection('PointOfInterests');
        await collection.deleteOne({ _id: samplePointOfInterest._id, partitionKey: samplePointOfInterest._id, docType: 'pointOfInterest' });
    });

});