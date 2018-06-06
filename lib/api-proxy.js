'use strict';
var async       = require('async');
var Translate   = require('./translate');
var Attributes  = require('./translate-attributes')

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
};

/** Get All Users **/
function getUsers(auth0Client, params, cb) {


    // We need to convert the SCIM parameters to Auth0 Parameters
    var options = {
      fields: Attributes.toAuth0Fields(params.attributes),
    };

    // we are using pagination
    if(params.startIndex){
      options.startIndex = (params.startIndex <= 0)? 1 : params.startIndex - 1; // CSIM is 1-based and Auth0 is 0-based
      options.per_page = params.count;
      options.include_totals = true; // CSIM RFC tells us we need to display totals
      // AUTH expects pages index, not record index. Lets get the page number.
      // Please note that this imposes a limitatation, since startIndex should be
      // a multiple of the per_page value, plus one (since it is 1-based).
      // for instance, if page_size is 3, you would request startIndex: 1,4,7 and so on
      options.page = parseInt(options.startIndex / options.per_page);
    }


    // Get all Clients
    auth0Client.users.getAll(options, function (err, result) {
      if (err) return cb(err, null);

      // get totals if we are using pagination
      var totals = undefined;
      if(result.users){
        totals = {
          start: result.start,
          limit: result.limit,
          length: result.length,
          total: result.total,
          perPage: options.per_page
        }
      }

      // now convert the auth0 users to scim users
      var auth0users = result.users || result;
      async.map(auth0users || [], Translate.toScim, (err, scimUsers) => {
        if (err) return cb(err, null);
        return cb(null, toListResponse(scimUsers, totals));
      });
    });
}

/** Get User By Filter **/
function getUser(auth0Client, params, cb) {

    // get Auth0 options from parameters
    var options = {
      fields: Attributes.toAuth0Fields(params.attributes),
      id: params.user_id
    }

    // get user
    auth0Client.users.get(options, function (err, auth0User) {
      if (err) return cb(err, null);
      if (!auth0User) cb(null, null);

      // convert user to scim
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

/** Converts a List of Resources into ListResponse **/
/** TODO: This should handle pagination, etc **/
/** TODO: Should each resource include the schema? Research this **/
function toListResponse(resources, totals){

  // add the basic information to the result.
  var result = {
      schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
      totalResults: resources.length,
      Resources: resources
  };

  // if we have totals, we can add some more information
  if(totals){
    result.startIndex = totals.start + 1; // remember, SCIM is 1-based
    result.itemsPerPage = totals.perPage;
    result.totalResults = totals.total;
  }

  // return result;
  return result;
}