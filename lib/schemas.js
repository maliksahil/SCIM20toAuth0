var jwt = require('express-jwt');
var jwks = require('jwks-rsa');
var config = require('../config')

'use strict';

module.exports = function Schemas() {

	// The available schemas this server manages
	// If another one is added in the future, just add it to the list.
	var schemasIds =  ['urn:ietf:params:scim:schemas:core:2.0:User', 
	                   'urn:ietf:params:scim:schemas:extension:auth0:2.0:User'];

	// the schemas information
	var schemas = [];
	var schemasById = [];

	// loads all the schemas from file
	function loadSchemas() {
		schemasIds.forEach((schemaId) => {
			var schema = require('../schemas/' + schemaId);
			schemas.push(schema);
			schemasById[schemaId] = schema;
		});
	}

	/** Returns an array of all the schemas **/
	function all(){
		return schemas;
	}

	/** Returns a schema by ID **/
	function byId(schemaId){
		return schemasById[schemaId];
	}

	// load schemas from file
	loadSchemas();

    return {
        all: all,      
        byId: byId
    };
};