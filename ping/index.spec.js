require('dotenv').config();
const expect = require('chai').expect;
const helpers = require('../spec/helpers');
const request = require('request-promise');

describe('ping testing', () => {
    it('Should be true ', async () => {
        const response = await request.get(`${helpers.API_URL}/api/v1/ping`, {
            json: true,
        });
        expect(response.text).to.contains('pong');
    });
    
});