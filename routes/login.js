var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var json = { pageName: 'login' };
    res.format({
        html: function() {
            res.render('login', json);
        },

        json: function() {
            res.json({error: true, message: "API Login not allowed!"});
        }
    });
});

module.exports = router;