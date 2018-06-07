var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var config = require('../config')

'use strict';

module.exports = {
    jwtCheck: jwt({
	  secret: jwks.expressJwtSecret({
	      cache: true,
	      rateLimit: true,
	      jwksRequestsPerMinute: 5,
	      jwksUri: "https://" + config.AUTH0_TENANT + ".auth0.com/.well-known/jwks.json"
	  }),
	  audience: config.AUTH0_API_AUDIENCE,
	  issuer: "https://" + config.AUTH0_TENANT + ".auth0.com/",
	  algorithms: [config.AUTH0_HASHING_ALGORITHM] // ex. ['RS256']
	})
};