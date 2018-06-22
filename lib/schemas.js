'use strict';

module.exports = function Schemas() {

    // The available schemas this server manages
    // If another one is added in the future, just add it to the list.
    const schemasIds = ['urn:ietf:params:scim:schemas:core:2.0:User',
        'urn:ietf:params:scim:schemas:extension:auth0:2.0:User'];

    // the schemas information
    const schemas = [];
    const schemasById = [];

    // loads all the schemas from file
    function loadSchemas() {
        /*schemasIds.forEach((schemaId) => {
            const schema = require('../schemas/' + schemaId);
            schemas.push(schema);
            schemasById[schemaId] = schema;
        });*/
    }

    /** Returns an array of all the schemas **/
    function all() {
        return schemas;
    }

    /** Returns a schema by ID **/
    function byId(schemaId) {
        return schemasById[schemaId];
    }

    // load schemas from file
    loadSchemas();

    return {
        all: all,
        byId: byId
    };
};