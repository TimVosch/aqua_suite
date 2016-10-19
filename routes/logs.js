var express = require('express');
var router = express.Router();
var user = require('../models/user');
var log_info = require('../models/log_info');
var log = require('../models/log');

router.get('/create', function (req, res, next) {
    var json = { pageName: 'Create log', user: req.user };
    return res.format({
        html: function () {
            res.render('logs/create', json);
        },

        json: function () {
            res.json(json);
        }
    });
});

router.get('/find', function (req, res, next) {
    return log_info.findAll().then(function (metas) {
        res.json(metas);
    });
});

module.exports = router;