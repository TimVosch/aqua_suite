var debug = require('debug');
var info = debug('aqua:api_users');
var request = require('request');

// Database models
var user_model = require('../models/user');

module.exports = {

    getUserProjects: function (username) {
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
                                reject(error);
                            }else if(response.statusCode >= 400) {
                                reject({ statusCode: response.statusCode, message: body });
                            }
                            // Extract projects data from repos
                            var json = JSON.parse(body);
                            for(var i=0; i < json.length; i++) {
                                var _project = {
                                    name: json[i].name,
                                    fullname: json[i].full_name,
                                    createdAt: json[i].created_at
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
            .catch(function (err) {
                reject(err);
            })
        });
    },

    /**
     * Get all starred repos from a user
     * PRABLAWM!: Test it, observe, aha problem!
     */
    getUserProjects2: function (username) {
        // Find the requested user for his/hers github name
        return new Promise(function (resolve, reject) {
            user_model.find({
                where: {
                    username: username
                }
            })
                .then(function (_user) {
                    if (!_user) {
                        info('getUserProjects: given user was not found');
                        return reject({ message: 'User not found' });
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
                        }, function (error, response, body) {
                            if (error || response.statusCode >= 400) {
                                info('getUserProjects: github api responded bad', body);
                                return reject({ message: 'Github api reported an error' });
                            }
                            // Find all and calculate project age in weeks
                            var gitapi_result = JSON.parse(body);
                            var projects = [];
                            for (var i = 0; i < gitapi_result.length; i++) {
                                var _gitproject = gitapi_result[i];
                                var _project = {
                                    name: _gitproject.name,
                                    fullname: _gitproject.full_name,
                                    createdAt: _gitproject.created_at
                                };
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
                            return resolve(projects);
                        });
                });
        });
    }


}