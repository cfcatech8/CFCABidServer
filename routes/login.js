var express = require('express');
var uaParser = require('ua-parser-js');
var config = require('./lib/config');
var Token = require('./lib/token');
var sadk = require('./lib/sadkAPI');
var RAQ = require('./lib/RAQ');
var router = express.Router();

router.post('/', function (req, res, next) {
    var DN = req.body.login_DN;
    var SN = req.body.login_SN;
    var P7Sign = req.body.P7Sign;
    console.log("[Router][login][POST] - login_DN => " + DN);
    if (P7Sign && Token.verifyRandSign(req.cookies["RAE_Rsig"], P7Sign) === "OK") {
        var logCertSN = sadk.P7ReadSN(P7Sign);
        console.log("[Router][login][POST] - login_SN => " + logCertSN);
        RAQ.getRoleID(logCertSN)
            .then(function (RoleID) {
                if (RoleID != "0") {
                    console.log("[Router][login][POST] - login ok @" + Date.now());
                    var login_orgName = "";
                    var login_orgCode = "";
                    var login_userName = "";
                    RAQ.getBelongOrg(SN)
                        .then(function (orgInfo) {
                            login_orgName = orgInfo['BRANCH_NAME'];
                            login_orgCode = orgInfo['BRANCH_CODE'];
                            RAQ.getUserName(SN)
                                .then(function (userName) {
                                    login_userName = userName;
                                    var tempToken = Token.createToken('DN:' + DN + '@^_^@SN:' + SN + '@^_^@userName:' + login_userName + '@^_^@orgName:' + login_orgName + '@^_^@orgCode:' + login_orgCode, config.tokenTimeout);
                                    res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
                                    res.header("RAE_token", tempToken);
                                    res.redirect('/');
                                })
                                .catch(function (err) {
                                    console.log("[Router][login][POST][ERROR] - " + err);
                                    res.render("error");
                                })
                        })
                        .catch(function (err) {
                            console.log("[Router][login][POST][ERROR] - " + err);
                            res.render("error");
                        })


                } else {
                    console.log("[Router][login][POST] - user not found");
                    /*
                    var ua = uaParser(req.headers['user-agent']);
                    console.log("[Router][login][POST] - browser is:" + ua.browser["name"] + "  cpu:" + ua.cpu["architecture"]);
                    if (ua.browser["name"] === "IE") {
                        res.render('login', {
                            cryptoPlugin: "<object id=\"CryptoAgent\" codebase=\"https://www.gps949.com/download/CryptoKit.Ultimate.x86.cab\" classid=\"clsid:4C588282-7792-4E16-93CB-9744402E4E98\" ></object>",
                            issuerDNFilter: config.issuerDNFilter,
                            msg: "所选非管理员证书",
                            msgLink: "#",
                            scriptpath: "scripts/IESign",
                            scriptargs: {}
                        });
                    } else {
                    */
                    res.render('login', {
                        cryptoPlugin: "",
                        issuerDNFilter: config.issuerDNFilter,
                        msg: "下载签名小工具",
                        msgLink: "https://www.gps949.com/download/LocalSign.exe",
                        scriptpath: "scripts/NIESign",
                        scriptargs: {}
                    });
                    //}
                }
            })
            .catch(function () {
                console.log("MYSQL Ruery ERROR111!");
                return false;
            })
    } else {
        console.log("[Router][login][POST] - bad signature");
        /*
        var ua = uaParser(req.headers['user-agent']);
        console.log("[Router][login][POST] - browser is:" + ua.browser["name"] + "  cpu:" + ua.cpu["architecture"]);
        if (ua.browser["name"] === "IE") {
            res.render('login', {
                cryptoPlugin: "<object id=\"CryptoAgent\" codebase=\"https://www.gps949.com/download/CryptoKit.Ultimate.x86.cab\" classid=\"clsid:4C588282-7792-4E16-93CB-9744402E4E98\" ></object>",
                issuerDNFilter: config.issuerDNFilter,
                msg: "证书签名验证失败",
                msgLink: "#",
                scriptpath: "scripts/IESign",
                scriptargs: {}
            });
        } else {
        */
        res.render('login', {
            cryptoPlugin: "",
            issuerDNFilter: config.issuerDNFilter,
            msg: "下载签名小工具",
            msgLink: "https://www.gps949.com/download/LocalSign.exe",
            scriptpath: "scripts/NIESign",
            scriptargs: {}
        });
        //}
    }

});

router.get('/', function (req, res, next) {
    console.log("[Router][login][GET] - Cookies: ");
    console.log(req.cookies);
    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);
            res.redirect('/');
        }
    }

    var tempRand = Token.createRand(config.randTimeout);
    res.cookie("RAE_Rsig", tempRand, {maxAge: config.randTimeout * 1000});
    res.header("RAE_Rsig", tempRand);
    res.cookie("RAE_rand", Token.decodeRand(tempRand).payload.rand, {maxAge: config.randTimeout * 1000});
    res.header("RAE_rand", Token.decodeRand(tempRand).payload.rand);
    console.log("[Router][login][GET] - the new Rand is => " + Token.decodeRand(tempRand).payload.rand);

    /*
    var ua = uaParser(req.headers['user-agent']);
    console.log("[Router][login][GET] - browser is:" + ua.browser["name"] + "  cpu:" + ua.cpu["architecture"]);
    if (ua.browser["name"] === "IE") {
        res.render('login', {
            cryptoPlugin: "<object id=\"CryptoAgent\" codebase=\"https://www.gps949.com/download/CryptoKit.Ultimate.x86.cab\" classid=\"clsid:4C588282-7792-4E16-93CB-9744402E4E98\" ></object>",
            issuerDNFilter: config.issuerDNFilter,
            msg: "",
            msgLink: "#",
            scriptpath: "scripts/IESign",
            scriptargs: {}

        });
    } else {
    */
    res.render('login', {
        cryptoPlugin: "",
        issuerDNFilter: config.issuerDNFilter,
        msg: "下载签名小工具",
        msgLink: "https://www.gps949.com/download/LocalSign.exe",
        scriptpath: "scripts/NIESign",
        scriptargs: {}

    });
    //}
});

module.exports = router;
