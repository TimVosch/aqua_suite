var jwt = require('express-jwt');
module.exports = jwt({
    secret: process.env.SHARED_SECRET,
    getToken: function (req) {
        if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
            return req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwtoken) {
            return req.cookies.jwtoken;
        }
        return null;
    }
});
