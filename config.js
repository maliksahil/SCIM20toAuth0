var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

'use strict';

module.exports = {
    AUTH0_TENANT: 'TENANT', // your <tenant>
    AUTH0_MANAGEMENT_API_TOKEN: 'TOKEN', // grab this from Auth0 Management API https://manage.auth0.com/#/apis/xxx/test
    AUTH0_API_AUDIENCE: 'AUDIENCE', // You'll need to setup a API, and define an audience(identifier) for it. This is that audience.
    AUTH0_HASHING_ALGORITHM: 'ALGORITHM' // RS256
};