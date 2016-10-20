var express = require('express');
var router = express.Router();

var debug = require('debug');
var gitapi_info = debug('aqua:gitapi');
var user = require('../models/user');
var request = require('request');

router.get('/:name', function (req, res, next) {
    return res.json({ error: true, message: 'Not yet implemented' });
});

router.get('/:name/projects', function (req, res, next) {
    // Find the requested user for his/hers github name
    var username = req.params.name;
    if (req.params.name == 'self') {
        username = req.user.username
    }
    return user.find({
        where: {
            username
        }
    })
    .then(function (_user) {
        // Retrieve subscribed repositories from user through github api
        request.get(
        {
            url: 'https://api.github.com/users/' + _user.githubname + '/starred',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'user-agent': 'aqua_suite'
            },
            auth: {
                user: process.env.GITHUB_USERNAME,
                pass: process.env.GITHUB_PASSWORD
            }
        }, function(error, response, body){
            if (response.statusCode >= 400) {
                gitapi_info('error -> ' + body);
                return res.json({ error: true, message: 'Github api reported an error' });
            }
            // Find all and calculate project age in weeks
            var gitapi_result = JSON.parse(body);
            var projects = [];
            for (var i=0; i < gitapi_result.length; i++) {
                var _project = {};
                var _gitproject = gitapi_result[i];
                // Copy several variables
                _project.name = _gitproject.name;
                _project.fullname = _gitproject.full_name;
                _project.createdAt = _gitproject.created_at
                // Calculate amount of weeks since sunday before creation of repo
                // Get created at date
                var date = new Date(_project.createdAt);
                // Get sunday
                date.setDate(date.getDate() - date.getDay());
                // Difference in milliseconds
                var date_difference = (new Date()).getTime() - date.getTime();
                // Divide milliseconds by milliseconds per week
                var weeks = Math.ceil(date_difference / (1000 * 60 * 60 * 24 * 7));
                _project.weeks = weeks;

                // Add this project to projects array
                projects.push(_project);
            }
            res.json(projects);
        });
    });
});

router.get('/:name/projects/:repo_owner/:repo_name', function (req, res, next) {
    // Find the requested user for his/hers github name
    var username = req.params.name;
    if (req.params.name == 'self') {
        username = req.user.username
    }
    return user.find({
        where: {
            username
        }
    })
    .then(function (_user) {
        var _since = new Date(parseInt(req.query.since));
        var _until = new Date(parseInt(req.query.until));
        request({
                url: 'https://api.github.com/repos/' + req.params.repo_owner + '/' + req.params.repo_name + '/commits?author=' + _user.githubname + '&since=' + _since.toISOString() + '&until=' + _until.toISOString(),
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'user-agent': 'aqua_suite'
                },
                auth: {
                    user: process.env.GITHUB_USERNAME,
                    pass: process.env.GITHUB_PASSWORD
                }
        }, function (error, response, body) {
            if (response.statusCode >= 400) {
                gitapi_info('error -> ' + body);
                return res.json({ error: true, message: 'Github api reported an error' });
            }

            var gitapi_result = JSON.parse(body);
            var return_result = [];
            for (var i=0; i < gitapi_result.length; i++) {
                var _git_commit = gitapi_result[i];
                var _commit = {};
                _commit.author = _git_commit.commit.author;
                _commit.html_url = _git_commit.html_url;
                _commit.message = _git_commit.commit.message;
                return_result.push(_commit);
            }
            res.json(return_result);
        });
    });
});

module.exports = router;