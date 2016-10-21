var jwt = require('jsonwebtoken');

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
    }
}