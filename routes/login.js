var user = require('../models/user');
var jwt = require('jsonwebtoken');
var login = require('../api/login');

var express = require('express');
var router = express.Router();

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

router.post('/', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.json({error: true, message: "Missing username or password"});
    }
    
    return user.findOne({ where: { username: req.body.username } })
        .then(function (_user){
            if ( _user && _user.get('password') == req.body.password) {
                var token = jwt.sign({
                    id: _user.id,
                    username: _user.username,
                    firstname: _user.firstname,
                    githubname: _user.githubname
                }, process.env.SHARED_SECRET, { expiresIn: 60 * 60 * 12 });
                return res.json({ token });
            } else {
                return res.json({ error: true, message: "Login failed" });
            }
        });
});

module.exports = router;