var express     = require('express');
var bodyParser  = require('body-parser');
var app         = express();
var morgan      = require('morgan');
var ApiProxy    = require('./lib/api-proxy');

var Auth0ManagementClient = require('auth0').ManagementClient;
var auth0Client = new Auth0ManagementClient({
  domain: 'DOMAIN',
  token: 'TOKEN HERE'
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
    return ApiProxy.createUser(auth0Client, scimUser, (err, newScimUser) => {
          if (err) return next(err);          
          res.status(201).json(newScimUser);
    });    
  })
  .get(function (req, res, next) {
    return ApiProxy.getUsers(auth0Client, (err, scimUsers) => {
          if (err) return next(err);          
          res.status(201).json(scimUsers);
    });
  });


router.route('/users/:user_id')
  .get(function (req, res, next) {
    return ApiProxy.getUser(auth0Client, { id: req.params.user_id }, (err, scimUser) => {
      if (err) return next(err);
      if (!scimUser) return res.send(404);
      res.status(201).json(scimUser);
    });    
  });


// TODO: authenticate requests
//app.all('*', requireAuthentication);
app.use('/scim', router);

app.use(function (err, req, res, next) {
  var status = err.statusCode || 500;
  res.status(status).send(err.message);
});

app.listen(port);
console.log('Listening on port ' + port);