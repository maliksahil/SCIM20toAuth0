/**
	Performs conversions of the Metadata (User Metadata and App Metadata)
*/

'use strict';

module.exports = {
    toScim,
    toAuth0
};

/** Converts the Auth0 Metadata Object to a Valid SCIM Structure **/
function toScim(auth0Metadata) {

	if(!auth0Metadata) return undefined;

	//let scimMetadata = {};

	// Iterate each Auth0 metadata value and convert into
	// an array of {name, value}
    const scimMetadata = Object.entries(auth0Metadata).map((obj) => {
		return {
			type: obj[0],
			value: obj[1]
		}
	} );

 	return scimMetadata;
}

/** Converts the CSIM Auth0 User Extension Metadata Object to a Valid Auth0 Metadata Structure **/
function toAuth0(csimMetadata) {

	if(!csimMetadata) return null;

    const auth0Metadata = {};

	// Iterate each pair [type,value] and assign it to Auth0 Metadata object
	csimMetadata.forEach((node) => {
	  auth0Metadata[node.type] = node.value;
	});

 	return auth0Metadata;
}
