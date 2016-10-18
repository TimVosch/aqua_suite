var Account = require('../models/account');
var jwt = require('jsonwebtoken');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var json = { pageName: 'login'};
    if (req.user) {
        return res.redirect('/');
    }
    res.format({
        html: function() {
            return res.render('login', json);
        },

        json: function() {
            return res.json({error: true, message: "POST for api login, GET to check token"});
        }
    });
});

router.get('/:token', function (req, res, next) { 
    jwt.verify(req.params.token, process.env.SHARED_SECRET, function (err, payload) {
        if (err) {
            return res.send({ error: true, message: "Token is invalid"});
        }
        return res.send({ valid: true, message: "Token is valid" });
    });
});

router.post('/', function (req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.json({error: true, message: "Missing username or password"});
    }
    
    Account.findOne({ where: { username: req.body.username } })
        .then(function (account){
            if (account.get('password') == req.body.password) {
                var token = jwt.sign({
                    username: account.username,
                    firstname: account.firstname
                }, process.env.SHARED_SECRET, { expiresIn: 60 * 60 * 12 });
                return res.json({ token });
            } else {
                return res.json({ error: true, message: "Login failed" });
            }
        });
});

module.exports = router;