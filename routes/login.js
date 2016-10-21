var user = require('../models/user');
var jwt = require('jsonwebtoken');
var login = require('../api/login');

var express = require('express');
var router = express.Router();

/**
 * Get login page or 'session' page (contains logout button)
 * This has no API functionality
 */
router.get('/', function (req, res, next) {
    var json = { pageName: 'login', user: req.user};

    // Display view of loggedin user
    if (req.user) {
        return res.format({
            html: function() {
                return res.render('login/login_active', json);
            },

            json: function() {
                return res.json({error: true, message: "POST for api login, GET to check token"});
            }
        });
    }

    // Display login view
    return res.format({
        html: function() {
            return res.render('login/login', json);
        },

        json: function() {
            return res.json({error: true, message: "POST for api login, GET to check token"});
        }
    });
});

/**
 * Used to verify tokens/sessions
 */
router.get('/:token', function (req, res, next) { 
    return res.format({
        html: function() {
            res.send('This route is for the api.');
        },

        json: function() {
            login.verifySession(req.params.token)
                .then(function (valid) {
                    res.json({ valid });
                });
        }
    });
});

/**
 * Create a session (AKA login)
 */
router.post('/', function (req, res, next) {
    return res.format({
        html: function() {
            res.send('This route is for the api.');
        },

        json: function() {
            if (!req.body.username || !req.body.password) {
                return res.json({error: true, message: "Missing username or password"});
            }
            login.createSession(req.body.username, req.body.password)
            .then(function (token) {
                res.json(token);
            })
            .catch(function (error) {
                res.status(403);
                res.json({ error: true, message: error });
            });
        }
    });
});

module.exports = router;