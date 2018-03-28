var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    console.log("[Router][logout][GET] - Cookies: ");
    console.log(req.cookies);
    res.cookie("RAE_token", "", {expires: new Date(0)});
    res.redirect('/login');
});

module.exports = router;
