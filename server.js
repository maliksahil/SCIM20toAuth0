var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var morgan      = require('morgan');
var async       = require('async');
var Translate   = require('./lib/translate');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');


var Auth0ManagementClient = require('auth0').ManagementClient;
var auth0Client = new Auth0ManagementClient({
  domain: '<tenant>.auth0.com',
  token: '<apikey>'
});

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;
var router = express.Router();

// endpoints
router.route('/users')
  .post(function (req, res, next) {
    var scimUser = req.body;    
    return Translate.toAuth0(scimUser, (err, auth0_user) => {
      if (err) return next(err);
      
      auth0Client.users.create(auth0_user, (err, newAuth0User) => {
        if (err) return next(err);
        
        Translate.fromAuth0(newAuth0User, (err, newScimUser) => {
          if (err) return next(err);
          
          res.status(201).json(newScimUser);
        });
      });
    });
  })

  .get(function (req, res, next) {
    // TODO: support paging/search/etc
    auth0Client.users.getAll(function (err, auth0Users) {
      if (err) return next(err);

      async.map(auth0Users || [], Translate.fromAuth0, (err, scimUsers) => {
        if (err) return next(err);
        res.json(scimUsers);
      });
    });
  });

router.route('/users/:user_id')
  .get(function (req, res, next) {
    auth0Client.users.get({ id: req.params.user_id }, function (err, auth0User) {
      if (err) return next(err);
      if (!auth0User) return res.send(404);

      Translate.fromAuth0(auth0User, (err, scimUser) => {
        if (err) return next(err);
        
        res.json(scimUser);
      });
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

// TODO: authenticate requests
//app.all('*', requireAuthentication);
app.use('/scim', router);

app.use(function (err, req, res, next) {
  var status = err.statusCode || 500;
  res.status(status).send(err.message);
});

app.listen(port);
console.log('Listening on port ' + port);
