var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var morgan      = require('morgan');
var apiProxy    = require('./lib/api-proxy');
var errors      = require('./lib/error-response');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var Auth0ManagementClient = require('auth0').ManagementClient;
var auth0Client = new Auth0ManagementClient({
  domain: 'DOMAIN',
  token: 'TOKEN'
});

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8081;
var router = express.Router();

/**  endpoints **/

router.route('/users')
  .post(function (req, res, next) {
    var scimUser = req.body;
    return apiProxy.createUser(auth0Client, scimUser, (err, newScimUser) => {
          if (err) return next(err);
          res.status(201).json(newScimUser);
    });    
  })
  .get(function (req, res, next) {
    return apiProxy.getUsers(auth0Client, (err, scimUsers) => {
          if (err) return next(err);
          res.status(200).json(scimUsers);
    });
  });

router.route('/users/:user_id')
  .get(function (req, res, next) {
    return apiProxy.getUser(auth0Client, { id: req.params.user_id }, (err, scimUser) => {
      if (err) return next(err);
      res.status(200).json(scimUser);
    });    
  })

  .patch(function (req, res, next) {
    var scimUser = req.body;
    return apiProxy.updateUser(auth0Client, { id: req.params.user_id }, scimUser, (err, editedScimUser) => {
      if (err) return next(err);
      res.status(200).json(editedScimUser);
    });
  })

  .delete(function (req, res, next) {
    return apiProxy.deleteUser(auth0Client, { id: req.params.user_id }, (err) => {
      if (err) return next(err); // TODO: If user does not exists, it should return 404 according to the SCIM specification, but auth0 API does not!
      res.sendStatus(204); // 204:No-Content
    });
  });

// OIDC auth verfication code for API
// Required setup be done at - https://manage.auth0.com/#/apis/
// Reference for configuring an API in Auth0 is at - https://auth0.com/docs/apis#how-to-configure-an-api-in-auth0
// The Quick Start code after configuration can be use to replace the function below
var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: "https://<tenant>.auth0.com/.well-known/jwks.json"
  }),
  audience: '<your API endpoint>',
  issuer: "https://<tenant>.auth0.com>/",
  algorithms: ['<Hashing Algorithm selected in your API configuration>'] // ex. ['RS256']
});

app.use(jwtCheck, router);

app.get('/authorized', function (req, res) {
  res.send('Secured Resource');
});

// End OIDC auth verfication code for API

app.use('/scim', router);

app.use(function (err, req, res, next) {
  var status = (err.statusCode >= 100 && err.statusCode < 600 ? err.statusCode : 500) || 500;
  res.status(status).send(errors.wrap(err));
});

app.listen(port);
console.log('Listening on port ' + port);