var jwt = require('jsonwebtoken');
var userCredentialsModel = require('../models/user_credentials');
var user = require('../models/user');

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
            userCredentialsModel.findOne({
                where: { username },
                include: [user]
            })
            .then(function (_userCredentials) {
                // If user is found and passwords are equal then login is correct
                if (_userCredentials && _userCredentials.password == password) {
                    // Create token
                    console.log(_userCredentials);
                    var token = jwt.sign({
                        id: _userCredentials.id,
                        username: _userCredentials.username,
                        firstname: _userCredentials.user.firstname,
                        githubname: _userCredentials.user.githubname
                    }, process.env.SHARED_SECRET, { expiresIn: 60 * 60 * 12 });
                    
                    return resolve(token);
                }
                return reject('Invalid username/password');
            });
        });
    }
}