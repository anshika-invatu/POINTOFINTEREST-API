'use strict';

const { getMongodbCollection } = require('../db/mongodb');
const utils = require('../utils');
const Promise = require('bluebird');
const errors = require('../errors');

// Please refer the story BASE-441 for more details

module.exports = async (context, req) => {
    try {
        await utils.validateUUIDField(context, req.params.id, 'The pointOfInterest id specified in the URL does not match the UUID v4 format.');
        const collection = await getMongodbCollection('PointOfInterests');
        const result = await collection.findOne({
            docType: 'pointOfInterest',
            _id: req.params.id,
            partitionKey: req.params.id
        });
        console.log('Results----',result);
        if (result) {
            if (result.aPoint) {
                delete result.aPoint;
            }
            context.res = {
                body: result
            };
        } else {
            utils.setContextResError(
                context,
                new errors.PointOfInterestNotFoundError(
                    'The pointOfInterest id specified in the URL doesn\'t exist.',
                    404
                )
            );
            return Promise.resolve();
        }
        
    } catch (error) {
        utils.handleError(context, error);
    }
};
