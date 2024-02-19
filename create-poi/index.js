'use strict';

const { getMongodbCollection } = require('../db/mongodb');
const utils = require('../utils');
const Promise = require('bluebird');
const errors = require('../errors');

// Please refer the story BASE-441 for more details

module.exports = async (context, req) => {

    if (!req.body) {
        utils.setContextResError(
            context,
            new errors.EmptyRequestBodyError(
                'You\'ve requested to create a new pointOfInterest but the request body seems to be empty. Kindly pass the request body in application/json format',
                400
            )
        );
        return Promise.resolve();
    }

    try {
        await utils.validateUUIDField(context, `${req.body._id}`, 'The _id specified in the request body does not match the UUID v4 format.');
        const collection = await getMongodbCollection('PointOfInterests');
        const result = await collection.insertOne(Object.assign(
            {},
            req.body,
            req.body.location && req.body.location.longitude && req.body.location.longitude ?
                {
                    partitionKey: req.body._id,
                    docType: 'pointOfInterest',
                    createdDate: new Date(),
                    updatedDate: new Date(),
                    aPoint: {
                        type: 'Point',
                        coordinates: [req.body.location.longitude, req.body.location.latitude],
                    }
                    
                } :
                {
                    partitionKey: req.body._id,
                    docType: 'pointOfInterest',
                    createdDate: new Date(),
                    updatedDate: new Date(),
                }
        ));
        
        await collection.createIndexes([
            { key: { aPoint: '2dsphere' }, }
        ]);
        
        console.log('Results created',result);
        if (result) {
            context.res = {
                body: {
                    status: 200,
                    'message': 'data inserted successfully'
                    
                }
            };
        }

    } catch (error) {
        utils.handleError(context, error);
    }
};
