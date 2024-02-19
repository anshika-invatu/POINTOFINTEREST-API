'use strict';

const { getMongodbCollection } = require('../db/mongodb');
const utils = require('../utils');

// Please refer the story BASE-441 for more details

module.exports = async (context, req) => {
    try {
        const collection = await getMongodbCollection('PointOfInterests');
        const query = {
            docType: 'pointOfInterest',
            isEnabled: true
        };
        if (req.body.merchantID) {
            query.merchantID = req.body.merchantID;
        }
        if (req.body.merchantName) {
            query.merchantName = { '$regex': new RegExp('.*' + req.body.merchantName + '.*', 'i') };
        }
        if (req.body.brandID) {
            query.brandID = req.body.brandID;
        }
        if (req.body.brandName) {
            query.brandName = { '$regex': new RegExp('.*' + req.body.brandName + '.*', 'i') };
        }
        if (req.body.siteID) {
            query.siteID = req.body.siteID;
        }
        if (req.body.zoneID) {
            query.zoneID = req.body.zoneID;
        }
        if (req.body.rating) {
            query.rating = { '$gte': req.body.rating };
        }

        if (req.body.location && req.body.location.city) {
            query['location.city'] = req.body.location.city;
        }
        if (req.body.location && req.body.location.countryCode) {
            query['location.countryCode'] = req.body.location.countryCode;
        }
        if (req.body.location && req.body.location.zip) {
            query['location.zip'] = req.body.location.zip;
        }
        if (req.body.location && req.body.location.streetRow1) {
            query['location.streetRow1'] = { '$regex': new RegExp('.*' + req.body.location.streetRow1 + '.*', 'i') };
        }
        if (req.body.location && req.body.location.latitude && req.body.location.longitude && req.body.radius) {
            query.aPoint = {
                '$nearSphere': [req.body.location.longitude, req.body.location.latitude],
                '$maxDistance': req.body.radius / 6378137
            };
        }
        
        if (req.body.categories) {
            query.categories = { '$in': req.body.categories };
        }
        if (req.body.tags) {
            query.tags = { '$in': req.body.tags };
        }
        if (req.body.poiName) {
            query.poiName = { '$regex': new RegExp('.*' + req.body.poiName + '.*', 'i') };
        }

        const response = await collection.aggregate([
            {
                '$match': query
            },
            {
                '$project': {
                    aPoint: 0
                }
            }
        ])
            .limit(1000)
            .toArray();

        context.res = {
            body: response
        };
    } catch (error) {
        utils.handleError(context, error);
    }
};
