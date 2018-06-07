'use strict';


const Code = require('code');
const Lab = require('lab');
const Translate = require('../lib/translate');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;

const expect = Code.expect;

describe('Schema translation', () => {
    it('Auth0 --> SCIM', done => {

        // load an Auth0 user
        const auth0User = require('../fixtures/auth0-user.json');
        // load the translated version of the user
        const scimUser = require('../fixtures/scim-user-translated-from-auth0.json');

        // convert user from Auth0 to Scim and make sure conversion is correct
        return Translate.toScim(auth0User, (error, json) => {
            expect(error).to.not.exist();
            expect(json).to.be.an.object();
            expect(json).to.be.equal(scimUser);
        });
    });
    
    it('SCIM --> Auth0', done => {

        // load a scim user (this one specifies things like password)
        const scimUser = require('../fixtures/scim-user-to-create-in-auth0.json');
        const auth0User = require('../fixtures/auth0-user-to-be-created.json');
        
        return Translate.toAuth0(scimUser, (error, json) => {
            expect(error).to.not.exist();
            expect(json).to.be.an.object();
            expect(json).to.be.equal(auth0User);
        });
    });

});


if (require.main === module) {
    Lab.report([lab], { output: process.stdout, progress: 2 });
}
