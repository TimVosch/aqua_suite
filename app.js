var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Promise = require("bluebird");
var dotenv = require('dotenv');
dotenv.config({ silent: true });

// Routes
var login = require('./routes/login');
var frontpage = require('./routes/frontpage');

// Middleware
var jwt = require('./middleware/jwt');
var jsonwebtoken = require('express-jwt');

// Other
var sequelize = require('./database');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * ROUTES
 */
app.use('/login', jsonwebtoken({
    secret: process.env.SHARED_SECRET,
    credentialsRequired: false,
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwtoken) {
            return req.cookies.jwtoken;
        }
        return null;
    }
}), login);
app.use('/', jwt, frontpage);
// app.use('/logs', jwt, login)

/**
 * Error handling
 */
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// If UnauthorizedError and is viewed in browser then redirect to login
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError' && err.status == 401) {
        res.format({
            // Redirect to login if requester is viewer
            html: function () {
                return res.redirect('/login');
            },

            // Send 403 FORBIDDEN if requester is for api
            json: function () {
                return res.sendStatus(403);
            }
        });
    }
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            pageName: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        pageName: err.message,
        error: {}
    });
});

module.exports = app;
