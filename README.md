# SCIM 2.0 to Auth0 bridge API
This proejct creates an API that exposes Auth0 management API as a SCIM 2.0 compliant API. This is not a complete implementation, this is intended to be a "starter POC". 

# Setup

First setup an API in your manage.auth0.com area.
This will need you to specify an audience/identifier. Note down that value.

Grab a management key token for your Auth0 tenant, and update config.js with

1. client domain
2. management api token
3. tenant
4. api audience
5. hashing algorithm

How do I get a management API token? https://auth0.com/docs/api/management/v2/tokens

Next,

1. Run `npm i`
2. Run `node server`
3. Load the JSON from POSTMAN folder into POSTMAN, ensure that you put the appropriate bearer token. You can grab the bearer token from the "TEST" area of the SCIM API you set up earlier.
4. Make your requests to `http://localhost:8080/scim/*`, the only method currently implemented is /users and /users:userid, so you can make a call to `http:///localhost:8080/scim/users`

### Example call
```
curl -X GET \
  http://localhost:8080/scim/users \
  -H 'Cache-Control: no-cache' \
  -H 'Postman-Token: c868f1b7-add5-4bbd-8e2c-5f1ce7f50404'
```

### Example return (redacted)
```
[
    {
        "schemas": [
            "urn:ietf:params:scim:schemas:core:2.0:User",
            "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User"
        ],
        "id": "auth0|....",
        "externalId": "testuser@testdomain.com",
        "userName": "testuser@testdomain.com",
        "name": {},
        "emails": [
            {
                "value": "testuser@testdomain.com",
                "primary": true
            }
        ],
        "photos": [
            {
                "value": "...",
                "type": "photo"
            }
        ],
    }
]
```

You can now extend this API as you wish!
You might find this package useful as your project becomes more complex - https://github.com/auth0-extensions/auth0-extension-express-tools