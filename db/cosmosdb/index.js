'use strict';

const { CosmosClient } = require('@azure/cosmos');

let client;
let database;
let collection;

/**
 * Get Cosmos DB client object
 * @returns {Promise<any>|Promise<collection>}
 */
exports.getCosmosDbCollection = async (collectionName) => {
    if (collection) {
        return collection;
    }

    if (!client) {
        client = new CosmosClient({
            endpoint: process.env.COSMOSDB_ENDPOINT,
            key: process.env.COSMOSDB_KEY,
            userAgentSuffix: 'PointOfInterest', 
        });
    }

    if (!database) {
        const databases = await client.databases.readAll().fetchAll();
        database = databases.find(db => db.id === process.env.COSMOSDB_DATABASE);
    }

    collection = client.database(database.id).container(collectionName);

    return collection;
};
