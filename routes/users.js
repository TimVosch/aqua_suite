var express = require('express');
var router = express.Router();
var users = require('../api/users');

var debug = require('debug');
var gitapi_info = debug('aqua:gitapi');
var info = debug('aqua:users_route');
var user = require('../models/user');
var request = require('request');

// Routes 
router.get('/:name', function (req, res, next) {
    return res.json({ error: true, message: 'Not yet implemented' });
});

/**
 * Get a user's projects.
 * These projects are just the user's starred repositories.
 */
router.get('/:name/projects', function (req, res, next) {
    return res.format({
        html: function() {
            res.send('This route is for the api.');
        },

        json: function() {
            // replace self with current user
            var username = req.params.name;
            if (username == 'self') {
                username = req.user.username;
            }
            // return projects
            users.getUserProjects(username)
            .then(function (result) {
                res.json(result);
            })
            .catch(function (err) {
                res.status(400);
                res.json({ error: true, message: err });
            });
        }
    });
});

/**
 * Get a specific project
 */
router.get('/:name/projects/:repo_owner/:repo_name', function (req, res, next) {
    // replace self with current user
    var username = req.params.name;
    if (username == 'self') {
        username = req.user.username;
    }
    // return specific information
    users.getUserProject(username, req.params.repo_owner, req.params.repo_name)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (e) {
            info(e);
            res.status(400);
            res.json({ error: true, message: e });
        })
});

/**
 * Get commits for the user since,until
 */
router.get('/:name/projects/:repo_owner/:repo_name/commits', function (req, res, next) {
    // Find the requested user for his/hers github name
    var username = req.params.name;
    if (req.params.name == 'self') {
        username = req.user.username
    }
    // Return specific commits
    users.getProjectCommits(username, req.params.repo_owner, req.params.repo_name, req.query.since, req.query.until)
        .then(function (result) {
            res.json(result);
        })
        .catch(function (e){
            res.status(400);
            res.json({ error:true, message: e });
        });
});

module.exports = router;