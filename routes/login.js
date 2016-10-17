var Account = require('../models/account');
var jwt = require('jsonwebtoken');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var json = { pageName: 'login' };
    res.format({
        html: function() {
            return res.render('login', json);
        },

        json: function() {
            return res.json({error: true, message: "POST for api login"});
        }
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
                }, process.env.SHARED_SECRET);
                return res.json({ token });
            } else {
                return res.json({ error: true, message: "Login failed" });
            }
        });
});

module.exports = router;