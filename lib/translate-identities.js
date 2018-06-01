/** 
	Performs conversion of the Identities Section of the User 
*/

'use strict';

module.exports = {
    toScim,    
};

/** Converts the Auth0 Identities Array to a Valid SCIM Structure **/
function toScim(auth0Identities) {

	// Iterate each Auth0 User Identity and map it to a valid SCIM structure
	var scimIdentities = (auth0Identities || []).map((auth0Identity) => {
		return {
			connection: auth0Identity.connection,
			userId: auth0Identity.user_id,
			provider: auth0Identity.provider,
			isSocial: auth0Identity.isSocial,
			accessToken: auth0Identity.access_token,
			expiresIn: auth0Identity.expires_in,
			isSocial: auth0Identity.isSocial
		}
	} );

 	return scimIdentities;
}
