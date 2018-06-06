'use strict';

const Joi = require('joi');
const Translate = {
    Identities: require('./translate-identities'),
    Metadata: require('./translate-metadata')  
};

module.exports = {
    toAuth0,
    toScim,
    validateScim,
};

// The Auth0 User Extension Name
const usersExtensionPath = 'urn:ietf:params:scim:schemas:extension:auth0:2.0:User';

// Default Connectio Name
const default_conn_name = 'Username-Password-Authentication';

/** Converts SCIM User to Auth0 User **/
function toAuth0(scimUser, cb) {

    // get the Auth0Extension part of the Scim User
    var auth0Extension = scimUser[usersExtensionPath] || {};
    // define some values if they are not
    scimUser.phoneNumbers = scimUser.phoneNumbers || {};
    scimUser.emails = scimUser.emails || {};
    auth0Extension.identities =  auth0Extension.identities || {};
    auth0Extension.phonesVerified =  auth0Extension.phonesVerified || {};

    // build Auth0 User
    const auth0User = {
      "connection": (auth0Extension.identities.length && auth0Extension.identities[0].connection) || default_conn_name,
      "email": (scimUser.emails.length && scimUser.emails[0].value) || undefined,
      "username": scimUser.userName,
      "password": scimUser.password,
      "phone_number": (scimUser.phoneNumbers.length && scimUser.phoneNumbers[0].value) || undefined,
      "phone_verified": (auth0Extension.phonesVerified.length && auth0Extension.phonesVerified[0]) || undefined,
      "email_verified": (auth0Extension.emailVerified) || undefined,
      "app_metadata" : Translate.Metadata.toAuth0(auth0Extension.appMetadata),
      "user_metadata" : Translate.Metadata.toAuth0(auth0Extension.userMetadata),
      "blocked": (auth0Extension.blocked) || undefined,

      /* The next ones are not really part of the user, but specific
         to the update / create opeartions. They could be on a different
         SCIM schema, particular to upload / create operations. */
      "client_id": (auth0Extension.clientId) || undefined,
      "verify_email": (auth0Extension.verifyEmail) || undefined,
      "verify_phone_number": (auth0Extension.verifyPhoneNumber) || undefined,
    };

    cb(null, auth0User);
}

/** Converts Auth0 User to SCIM User **/
function toScim(auth0User, cb) {

    // the base user schema attributes
    var scimUser = {
        "schemas": [
            "urn:ietf:params:scim:schemas:core:2.0:User",
            usersExtensionPath
        ],
        "id" : auth0User.user_id,
        "externalId" : auth0User.userName || auth0User.email, 
        "userName": auth0User.userName || auth0User.email,
        "name": {
            "formatted" : auth0User.name,
            "givenName": auth0User.given_name,
            "familyName": auth0User.family_name          
        },
        "displayName": auth0User.name,
        "nickName": auth0User.nickname,
        "locale": auth0User.locale,
        "emails": [{
            "value": auth0User.email,
            "primary": true
        }],
        "photos": [{
            "value": auth0User.picture,
            "type": "photo",
            "primary": true
        }],
        "meta": {
            "resourceType" : "User",
            "created" : auth0User.created_at,
            "lastModified" : auth0User.updated_at
        }        
    };

    // the auth0 extension schema attributes    
    var auth0UserObj = {            
        "identities" : Translate.Identities.toScim(auth0User.identities),
        "appMetadata" : Translate.Metadata.toScim(auth0User.app_metadata),
        "userMetadata" : Translate.Metadata.toScim(auth0User.user_metadata),
        "multifactor" : auth0User.multifactor,
        "lastIp" : auth0User.last_ip,
        "lastLogin" : auth0User.last_login,
        "loginsCount" : auth0User.logins_count,
        "blocked" : auth0User.blocked,
        "emailVerified": auth0User.email_verified
    }

    // add Phone Information if defined
    if(auth0User.phone_number){
        // set the phone numbers array
        scimUser.phoneNumbers = [{ value: auth0User.phone_number, primary:true }];
        // add a phone verified array in the extension
        auth0UserObj.phonesVerified = [auth0User.phone_verified];
    }

    // assign the Auth0 Extension Data to SCIM response
    scimUser[usersExtensionPath] = auth0UserObj;
    
    // invoke call back
    process.nextTick(() => cb(null, scimUser));
}

function validateScim(payload, cb) {
    const schema = Joi.object({
       
    });
    
    return Joi.validate(payload, schema, cb);
}