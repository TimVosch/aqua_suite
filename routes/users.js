var express = require('express');
var router = express.Router();

var debug = require('debug');
var gitapi_info = debug('aqua:gitapi');
var info = debug('aqua:users_route');
var user = require('../models/user');
var request = require('request');

// Pre-defined functions
/**
 * Get all starred repos from a user
 */
function getUserProjects(username) {
    // Find the requested user for his/hers github name
    return user.find({
        where: {
            username
        }
    })
    .then(function (_user) {
        return new Promise(function (resolve, reject) {
            if (!_user) {
                return resolve({ statusCode: 404, data: { error: true, message: 'User not found' } })
            }
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
                    return resolve({ statusCode: 500, data: { error: true, message: 'Github api reported an error' }});
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
                return resolve({ statusCode: 200, data: projects });
            });
        });
    });
}

/**
 * Get information about user' project
 */
function getUserProject(username, repo_owner, repo_name) {
    return new Promise(function (resolve, reject) {
        getUserProjects(username)
            .then(function (result) {
                // Error handling
                if (result.statusCode == 404) {
                    return resolve({ statusCode: 404, data: result.data });
                }
                var _isInvolved = false;
                // Check which is equal
                for (var i=0; i < result.data.length; i++) {
                    if ((result.data[i].fullname).toLowerCase() == (repo_owner + '/' + repo_name).toLowerCase()) {
                        _isInvolved = true;
                        // Request gitapi details for repo
                        request.get({
                            url: 'https://api.github.com/repos/' + repo_owner + '/' + repo_name,
                            headers: {
                                'Accept': 'application/vnd.github.v3+json',
                                'user-agent': 'aqua_suite'
                            },
                            auth: {
                                user: process.env.GITHUB_USERNAME,
                                pass: process.env.GITHUB_PASSWORD
                            }
                        }, function (error, response, body) {
                            // Error handling
                            if (error || response.statusCode >= 400) {
                                return resolve({ statusCode: 500, data: { error: true, message: 'Github api responded with an error' }});
                            }
                            var _gitapiResult = JSON.parse(body);
                            // Only copy certain information
                            var _data = {
                                name: _gitapiResult.name,
                                fullname: _gitapiResult.fullname,
                                description: _gitapiResult.description,
                                htmlUrl: _gitapiResult.html_url,
                                createdAt: _gitapiResult.created_at,
                                updatedAt: _gitapiResult.updated_at,
                                stargazersCount: _gitapiResult.stargazers_count,
                                watchersCount: _gitapiResult.watchers_count,
                                openIssuesCount: _gitapiResult.open_issues_count
                            };
                            return resolve({ statusCode: 500, data: _data });
                        });
                    }
                }
                if (!_isInvolved) {
                    // We haven't returned yet and thus the user is not involed
                    return resolve({ statusCode:403,  data: { error: true, message: 'User is not involved in this project' } });
                }
            })
        });
}

/**
 * Get specific commits from a repo
 */
function getSpecificProjectCommits(username, repo_owner, repo_name, since, until) {
    return user.find({
        where: {
            username
        }
    })
    .then(function (_user) {
        return new Promise(function(resolve, reject){
            var _since = new Date(parseInt(since));
            var _until = new Date(parseInt(until));
            request({
                    url: 'https://api.github.com/repos/' + repo_owner + '/' + repo_name + '/commits?author=' + _user.githubname + '&since=' + _since.toISOString() + '&until=' + _until.toISOString(),
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
                    return resolve({ statusCode: 500, data: { error: true, message: 'Github api reported an error' }});
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
                return resolve({ statusCode: 200, data: return_result });
            });
        });
    });
}

// Routes 
router.get('/:name', function (req, res, next) {
    return res.json({ error: true, message: 'Not yet implemented' });
});

router.get('/:name/projects', function (req, res, next) {
    // replace self with current user
    var username = req.params.name;
    if (username == 'self') {
        username = req.user.username;
    }
    // return projects
    getUserProjects(username)
        .then(function (result) {
            res.status(result.statusCode)
            res.json(result.data);
        });
});

router.get('/:name/projects/:repo_owner/:repo_name', function (req, res, next) {
    // replace self with current user
    var username = req.params.name;
    if (username == 'self') {
        username = req.user.username;
    }
    // return specific information
    getUserProject(username, req.params.repo_owner, req.params.repo_name)
        .then(function (result) {
            res.status(result.statusCode);
            res.json(result.data);
        });
});

router.get('/:name/projects/:repo_owner/:repo_name/commits', function (req, res, next) {
    // Find the requested user for his/hers github name
    var username = req.params.name;
    if (req.params.name == 'self') {
        username = req.user.username
    }
    // Return specific commits
    getSpecificProjectCommits(username, req.params.repo_owner, req.params.repo_name, req.query.since, req.query.until)
        .then(function (result) {
            res.status(result.statusCode)
            res.json(result.data);
        });
});

module.exports = router;