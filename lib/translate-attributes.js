var jp = require('jsonpath');
var Translate   = require('./translate');

module.exports = {
	toAuth0Fields
};

// This specifies fields mappings between SCIM User Structure and Auth0 User Structure
// On the left side you have SCIM attributes, and on the right side you get AUTH0 attributes
const mappings = {
    id: 'user_id',
    userName: 'username',
    name: { formatted: 'name',
            givenName: 'given_name',
            familyName: 'family_name' },
    displayName: 'name',
    nickName: 'nickname',
    locale: 'locale',
    emails: { 
    	__root: 'email',
    	value: 'email' 
    },
    photos: { 
    	__root: 'picture', 
    	value: 'picture',
    	type: 'picture',
    	primary: 'picture'
    },
    phoneNumbers: { value: 'phone_number'},
    auth0User:{
        identities: {
        	__root: 'identities',
            connection: 'identities.connection',
            userId: 'identities.user_id',
            provider: 'identities.provider',
            isSocial: 'identities.isSocial',
            accessToken: 'identities.access_token',
            expiresIn: 'identities.expires_in',            
        },
        appMetadata: { 
        	__root: 'app_metadata',
        	type: 'app_metadata',
        	value: 'app_metadata'
		},
        userMetadata: { 
        	__root: 'app_metadata',
        	type: 'app_metadata',
        	value: 'app_metadata'
		},       
        multifactor: 'multifactor',
        lastIp: 'last_ip',
        lastLogin: 'last_login',
        loginsCount: 'logins_count',
        blocked: 'blocked',
        emailVerified: 'email_verified',
        phonesVerified: 'phone_verified',
    }   
};

/** Converts SCIM parameters to AUTH0 parameters */
function toAuth0Fields(scimAttributes){

	// split attributes
	if(!scimAttributes) return undefined;

	// spit by comma
 	scimAttributes = scimAttributes.split(',');

 	// if the list does not contains the id, lets add it, since it is always returned
 	// this should be done taking the information from the schema, but
 	// due to time, we will do it this way.
 	if(!scimAttributes.includes('id')) scimAttributes.push('id');

 	// convert scim attributes to auth0 fields
    var auth0Fields = (scimAttributes || []).reduce(function(result, scimAttribute) {
        scimAttribute = scimAttribute.replace("urn:auth0:2.0:User", "auth0User")
        var auth0param = jp.query(mappings, scimAttribute);        
        if(auth0param.length) {
        	result.push((typeof auth0param[0] == "object")? auth0param[0].__root : auth0param[0]);
        }
        return result;
    }, []);

    // convert into a valid auth0 fields option
    auth0Fields = auth0Fields.join(',');
    return auth0Fields;
}