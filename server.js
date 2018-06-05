var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var morgan      = require('morgan');
var apiProxy    = require('./lib/api-proxy');
var errors      = require('./lib/error-response');
var config      = require('./config')
var auth        = require('./lib/authentication')

var Auth0ManagementClient = require('auth0').ManagementClient;
var auth0Client = new Auth0ManagementClient({
  domain: config.AUTH0_CLIENT_DOMAIN,
  token: config.AUTH0_MANAGEMENT_API_TOKEN
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

app.use(auth.jwtCheck, router);
app.use('/scim', router);

app.use(function (err, req, res, next) {
  var status = (err.statusCode >= 100 && err.statusCode < 600 ? err.statusCode : 500) || 500;
  res.status(status).send(errors.wrap(err));
});

app.listen(port);
console.log('Listening on port ' + port);