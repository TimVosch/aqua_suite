var debug = require('debug');
var info = debug('aqua:api_users');
var request = require('request');

// Database models
var user_model = require('../models/user');

var users = {};

/**
 * Retrieve all starred repositories for the user
 */
users.getUserProjects = function (username) {
    return new Promise(function (resolve, reject) {
        // Find user in database
        user_model.findOne({
            where: {
                username
            }
        })
        .then(function (user) {
            var projects = [];
            /**
             * TO CHECK: can user be empty?
             */
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
                            info('getUserProjects: githubapi returned an error: ', error);
                            reject(error);
                        }else if(response.statusCode >= 400) {
                            info('getUserProjects: githubapi returned an error: ', body);
                            reject(body);
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
users.getUserProject = function(username, repo_owner, repo_name) {
    return new Promise(function (resolve, reject) {
        // Check if the user is involved in the chosen project
        users.getUserProjects(username)
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

module.exports = users;