'use strict';

module.exports = {
    wrap
};

/** Wraps error into an Error Schema **/
function wrap(err) {
    return {
        "schemas": ["urn:ietf:params:scim:api:messages:2.0:Error"],
        "detail": err.message,
        "status": err.statusCode
    }
}