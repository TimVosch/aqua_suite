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
    return user.find({
        where: {
            username: req.params.name
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
            }
        }, function(error, response, body){
            gitapi_info(response.statusCode);
            if (!error && response.statusCode >= 400) {
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

module.exports = router;