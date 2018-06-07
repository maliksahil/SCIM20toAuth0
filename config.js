var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

'use strict';

module.exports = {
    AUTH0_CLIENT_DOMAIN: 'DOMAIN',
    AUTH0_MANAGEMENT_API_TOKEN: 'TOKEN',

    AUTH0_TENANT: 'TENANT',
    AUTH0_API_AUDIENCE: 'AUDIENCE',

    AUTH0_HASHING_ALGORITHM: 'ALGORITHM'
};
