var jwt = require('jsonwebtoken');
var userModel = require('../models/user');

module.exports = {

    /**
     * Verify token/session
     */
    verifySession: function (token) {
        return new Promise(function (resolve, reject) {
            jwt.verify(token, process.env.SHARED_SECRET, function (err, payload) {
                if (err) {
                    return resolve(false);
                }
                // TODO: add schema checking
                resolve(true);
            })
        });
    },

    /**
     * Create a session (AKA login)
     */
    createSession: function (username, password) {
        return new Promise(function (resolve, reject) {
            // Find corresponding user in database
            userModel.findOne({
                where: { username }
            })
            .then(function (_user) {
                // If user is found and passwords are equal then login is correct
                if (_user && _user.password == password) {
                    // Create token
                    var token = jwt.sign({
                        id: _user.id,
                        username: _user.username,
                        firstname: _user.firstname,
                        githubname: _user.githubname
                    }, process.env.SHARED_SECRET, { expiresIn: 60 * 60 * 12 });
                    
                    return resolve(token);
                }
                return reject('Invalid username/password');
            });
        });
    }
}