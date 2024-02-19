'use strict';

const { getMongodbCollection } = require('../db/mongodb');
const utils = require('../utils');
const errors = require('../errors');

// Please refer the story BASE-441 for more details

module.exports = async (context, req) => {
    try {
        await utils.validateUUIDField(context, req.params.id, 'The pointOfInterest id specified in the URL does not match the UUID v4 format.');
        const collection = await getMongodbCollection('PointOfInterests');
        const result = await collection.deleteOne({
            docType: 'pointOfInterest',
            _id: req.params.id,
            partitionKey: req.params.id });
        
        if (result && result.deletedCount === 1) {
            context.res = {
                body: {
                    code: 200,
                    description: 'Successfully deleted the specified pointOfInterest'
                }
            };
        } else {
            utils.setContextResError(
                context,
                new errors.PointOfInterestNotFoundError(
                    'The pointOfInterest id specified in the URL doesn\'t exist.',
                    404
                )
            );
        }
    } catch (error) {
        utils.handleError(context, error);
    }
};
