var express = require('express');
var Token = require('./lib/token');
var msgSener = require('./lib/msgSender');
var config = require('./lib/config');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
    console.log("[Router][index][get] - Start");
    console.log("Cookies: ");
    console.log(req.cookies);
    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            var tokenInfo = Token.getInfoFromToken(tempToken);
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);
            res.render('layout', {
                orgName: tokenInfo['orgName'],
                userName: tokenInfo['userName'],
                contentpath: 'content/index',
                menuName: "index",
                contentargs: {message: "欢迎使用小北极星的RA门户系统"},
                initscript: ""
            });
        } else {
            res.redirect('login');
        }
    } else {
        res.redirect('login');
    }
});

router.post('/', function (req, res) {
    console.log("Cookies: ");
    console.log(req.cookies);
    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            var tokenInfo = Token.getInfoFromToken(tempToken);
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);
            res.render('layout', {
                orgName: tokenInfo['orgName'],
                userName: tokenInfo['userName'],
                contentpath: 'content/index',
                menuName: "index",
                contentargs: {message: "欢迎使用小北极星的RA门户系统"},
                initscript: ""
            });
        } else {
            res.redirect('login');
        }
    } else {
        res.redirect('login');
    }

});

module.exports = router;
