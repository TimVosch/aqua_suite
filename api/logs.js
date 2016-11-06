var debug = require('debug');
var info = debug('aqua:api_logs');
var logModel = require('../models/log');
var logInfoModel = require('../models/log_info');
var utils = require('./utils');
var users = require('./users');

var logs = {};

/**
 * Create a new log and log_meta.
 */
logs.createLog = function(username, userId, repo_owner, repo_name, title, comments, week) {
    return new Promise(function (resolve, reject) {
        // First retrieve the project this log is for
        users.getProject(username, repo_owner, repo_name)
        .then(function (project) {
            // Get project commits 
            var dates = utils.weekToDates(project.createdAt, week);
            return users.getProjectCommits(username, repo_owner, repo_name, dates.since, dates.until);
        })
        .then(function (commits) {
            // build models
            var log = logModel.create({
                commitHistory: JSON.stringify(commits),
                comments,
                logInfo: {
                    title,
                    project: repo_owner + '/' + repo_name,
                    creatorId: userId,
                    week
                }
            }, {
                include: [logInfoModel]
            });
            resolve(log);
        })
        .catch(function(e) {
            info(e);
            reject(e);
        })
    });
};

module.exports = logs;