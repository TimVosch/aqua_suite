var express = require('express');
var router = express.Router();
var userModel = require('../models/user');
var log = require('../models/log');
var logs = require('../api/logs');

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
    var json = {
        pageName: "Find existing log"
    };
    return log.findAll({ include: [ { model: userModel, as: 'creator' } ] }).then(function (logs) {
        json.logs = logs;
        return res.format({
            html: function (){
                res.render('logs/find', json);
            },

            json: function () {
                res.json(json);
            }
        })
    });
});

router.get('/get/:id', function (req, res, next) {
    var json = {
        pageName: "Viewing log",
    }
    log.findById(req.params.id).then(function(Log) {
        var commitHistory = JSON.parse(Log.commitHistory);
        Log.commitHistory = commitHistory;
        json.log = Log;
        return res.format({
            html: function (){
                res.render('logs/view', json);
            },

            json: function (){
                res.json(json);
            }
        })
    });
})

/**
 * Creates a new log in the database
 * body:
 * {
 *  title: 'STRING',
 *  project: 'repoowner/reponame',
 *  comments: 'TEXT',
 *  week: 4
 * }
 */
router.post('/create', function (req, res, next) {
    logs.createLog(req.user.username, req.user.id, req.body.project.split('/')[0], req.body.project.split('/')[1], req.body.title, req.body.comments, req.body.week)
    .then(function (result) {
        res.json(result);
    })
    .catch(function (e) {
        res.status(400);
        res.json(e);
    });
});

module.exports = router;