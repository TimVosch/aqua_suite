var debug = require('debug');
var info = debug('aqua:api_users');
var request = require('request');

// Database models
var user_model = require('../models/user');

var users = {};

/**
 * Retrieve all starred repositories for the user
 */
users.getProjects = function (username) {
    return new Promise(function (resolve, reject) {
        // Find user in database
        user_model.findOne({
            where: {
                username
            }
        })
        .then(function (user) {
            var projects = [];
            if (user === null || typeof user === typeof undefined) {
                return reject('User was not found');
            }
            // Get starred repos
            request(
                    {
                        url: 'https://api.github.com/users/' + user.githubname + '/starred',
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'user-agent': 'aqua_suite'
                        },
                        auth: {
                            user: process.env.GITHUB_USERNAME,
                            pass: process.env.GITHUB_PASSWORD
                        }
                    }, function (error, response, body) {
                        // After receiving a response
                        // Handle errors
                        if (error){
                            info('getProjects: githubapi returned an error: ', error);
                            return reject(error);
                        }else if(response.statusCode >= 400) {
                            info('getProjects: githubapi returned an error: ', body);
                            return reject(body);
                        }
                        // Extract projects data from repos
                        var json = JSON.parse(body);
                        for(var i=0; i < json.length; i++) {
                            var _project = {
                                name: json[i].name,
                                fullname: json[i].full_name,
                                description: json[i].description,
                                htmlUrl: json[i].html_url,
                                createdAt: json[i].created_at,
                                updatedAt: json[i].updated_at,
                                stargazersCount: json[i].stargazers_count,
                                watchersCount: json[i].watchers_count,
                                openIssuesCount: json[i].open_issues_count
                            }
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
                            projects.push(_project);
                        }
                        resolve(projects);
                    });
        })
        .catch(function (e) {
            info(e);
            reject(e);
        })
    });
};

/**
 * Retrieve a single specified repository for the user
 */
users.getProject = function(username, repo_owner, repo_name) {
    return new Promise(function (resolve, reject) {
        // Check if the user is involved in the chosen project
        users.getProjects(username)
        .then(function (result) {
            var _repo_url = (repo_owner + '/' + repo_name).toLowerCase();
            for(var i=0; i < result.length; i++) {
                // Check if repository name equals one of the involved ones.
                if ((result[i].fullname).toLowerCase() == _repo_url) {
                    _isInvolved = true;
                    return resolve(result[i]);
                }
            }
            reject('User is not involved in this project');
        })
        .catch(function (e) {
            info(e);
            reject(e);
        })
    });
};

/**
 * Retrieve commits from a user's project
 */
users.getProjectCommits = function(username, repo_owner, repo_name, since, until) {
    var since = new Date(parseInt(since));
    var until = new Date(parseInt(until));
    var githubname = undefined;
    return new Promise(function (resolve, reject) {
        // Check if user is involved
        user_model.findOne({
            where: {
                username
            }
        })
        .then(function (user){
            if (user === null || typeof user === typeof undefined) {
                return reject('User was not found');
            }
            githubname = user.githubname;
            return users.getProject(username, repo_owner, repo_name)
        })
        .then(function (result) {
            // Find user commits
            info('https://api.github.com/repos/' + result.fullname + '/commits?author=' + githubname + '&since=' + since.toISOString() + '&until=' + until.toISOString());
            request({
                url: 'https://api.github.com/repos/' + result.fullname + '/commits?author=' + githubname + '&since=' + since.toISOString() + '&until=' + until.toISOString(),
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'user-agent': 'aqua_suite'
                },
                auth: {
                    user: process.env.GITHUB_USERNAME,
                    pass: process.env.GITHUB_PASSWORD
                }
            }, function (error, response, body) {
                // After receiving a response
                // Handle errors
                if (error){
                    info('getProjects: githubapi returned an error: ', error);
                    return reject(error);
                }else if(response.statusCode >= 400) {
                    info('getProjects: githubapi returned an error: ', body);
                    return reject(body);
                }
                // Parse response body
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
                resolve(return_result);
            });
        })
        .catch(function (e) {
            info(e);
            reject(e);
        })
    });
}

module.exports = users;