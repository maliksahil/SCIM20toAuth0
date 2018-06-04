'use strict';
var async       = require('async');
var Translate   = require('./translate');

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};

/** Get All Users **/
function getUsers(auth0Client, cb) {

    // TODO: support paging/search/etc
    auth0Client.users.getAll(function (err, auth0Users) {
      if (err) return cb(err, null);

      async.map(auth0Users || [], Translate.toScim, (err, scimUsers) => {
    	  if (err) return cb(err, null);
	      return cb(null, toListResponse(scimUsers));
      });
    });
}

/** Converts a List of Resources into ListResponse **/
/** TODO: This should handle pagination, etc **/
/** TODO: Should each resource include the schema? Research this **/
function toListResponse(resources){
	return {
		schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
		totalResults: resources.length,
		Resources: resources
	};
}

/** Get User By Filter **/
function getUser(auth0Client, filter, cb) {

    auth0Client.users.get(filter, function (err, auth0User) {
      if (err) return cb(err, null);
      if (!auth0User) cb(null, null);

      Translate.toScim(auth0User, (err, scimUser) => {
        if (err) return cb(err, null);        
        cb(null, scimUser);
      });
    });
}

/** Create User **/
function createUser(auth0Client, scimUser, cb) {

	// translate scim user to auth0 user
	return Translate.toAuth0(scimUser, (err, auth0_user) => {
      
        if (err) return cb(err, null);
      
      // create user in auth0
      auth0Client.users.create(auth0_user, (err, newAuth0User) => {
        if (err) return cb(err, null);

        // translate new auth0 user to scim user
        Translate.toScim(newAuth0User, (err, newScimUser) => {
          if (err) return cb(err, null);

          cb(null, newScimUser);
        });
      });
    });
}

/** Update User **/
function updateUser(auth0Client, params, scimUser, cb) {

	// translate scim user to auth0 user
	return Translate.toAuth0(scimUser, (err, auth0_user) => {

      if (err) return cb(err, null);

      // update user in auth0
      auth0Client.users.update(params, auth0_user, (err, editedAuth0User) => {

        if (err) return cb(err, null);

        // translate new auth0 user to scim user
        Translate.toScim(editedAuth0User, (err, editedScimUser) => {

          if (err) return cb(err, null);

          cb(null, editedScimUser);
        });
      });
    });
}

/** Delete User **/
function deleteUser(auth0Client, params, cb) {

      // delete user in auth0
      auth0Client.users.delete(params, (err) => {
		if (err) return cb(err, null);
		return cb(null, null);
    });
}