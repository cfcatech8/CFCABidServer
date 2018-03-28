var express = require('express');
var Promise = require('bluebird');
var config = require('./lib/config');
var Token = require('./lib/token');
var RAQ = require('./lib/RAQ');
var RA2401 = require('./lib/RAsender/2401');
var router = express.Router();

router.post('/', function (req, res, next) {
    console.log("Cookies: ");
    console.log(req.cookies);

    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);

            var applyInfo = {};
            applyInfo["Type"] = "1";
            applyInfo["SerialNo"] = req.body.SN;
            applyInfo["AuthCode"] = req.body.AuthCode;
            applyInfo["P10"] = req.body.P10;

            RA2401.send(applyInfo)
                .then(function (response) {
                    console.log("[[Routes][certApply][POST] - ]" + response);

                    res.status(200).json({ResultCode:response['ResultCode'],SignatureCert:response['SignatureCert']});
                })
                .catch(function (err) {
                    console.log("[Routes][certApply][POST][ERROR] - " + err.toString());
                    res.render('error')
                })
        } else {
            res.redirect('login');
        }
    } else {
        res.redirect('login');
    }
});

router.get('/', function (req, res, next) {
    console.log("Cookies: ");
    console.log(req.cookies);
    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);

            var tokenInfo = Token.getInfoFromToken(tempToken);
            var certSN = tokenInfo['SN'];
            var certTypeInfo;
            RAQ.queryCertTypesBySN(certSN)
                .then(function (result_queryCertTypesBySN) {
                        certTypeInfo = result_queryCertTypesBySN;
                        return RAQ.queryIDTypes()
                    }
                )
                .then(function (IdentTypeInfo) {
                        res.render('layout', {
                            orgName: tokenInfo['orgName'],
                            userName: tokenInfo['userName'],
                            contentpath: 'content/certApply',
                            menuName: 'certApply@cert',
                            contentargs: {
                                certTypes: certTypeInfo,
                                IdentTypes: IdentTypeInfo,
                                certTermUnit: config.certTermUnit
                            },
                            initscript: "certTypeChange();"
                        })
                    }
                )
                .catch(function (err) {
                    console.log("[Routes][certApply][GET][ERROR] - " + err.toString());
                })
        } else {
            res.redirect('login');
        }
    } else {
        res.redirect('login');
    }
});

module.exports = router;
