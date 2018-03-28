var express = require('express');
var Promise = require('bluebird');
var config = require('./lib/config');
var Token = require('./lib/token');
var RAQ = require('./lib/RAQ');
var RA2101 = require('./lib/RAsender/2101');
var router = express.Router();

router.post('/', function (req, res, next) {
    console.log("Cookies: ");
    console.log(req.cookies);
    if (req.cookies["RAE_token"] != null) {
        var tempToken = Token.checkToken(req.cookies["RAE_token"]);
        if (tempToken != null) {
            res.cookie("RAE_token", tempToken, {maxAge: config.tokenTimeout * 1000});
            res.header("RAE_token", tempToken);
            var tokenInfo = Token.getInfoFromToken(tempToken);

            var applyInfo = {};
            applyInfo["Type"] = "1";
            applyInfo["CertType"] = req.body.certType.split("_")[3];
            applyInfo["CustomerType"] = req.body.certType.split("_")[2];
            applyInfo["UserName"] = req.body.UserName;
            applyInfo["UserNameInDn"] = req.body.UserNameInDn;
            applyInfo["UserIdent"] = req.body.UserIdent;
            applyInfo["IdentType"] = req.body.IdentType.split("_")[0];
            applyInfo["IdentNo"] = req.body.IdentNo;
            applyInfo["KeyAlg"] = req.body.KeyAlg;
            applyInfo["KeyLength"] = req.body.KeyLength;
            applyInfo["Email"] = req.body.Email;
            applyInfo["PhoneNo"] = req.body.PhoneNo;
            applyInfo["Address"] = req.body.Address;
            applyInfo["Duration"] = req.body.Duration;
            applyInfo["BranchCode"] = tokenInfo['orgCode'];
            applyInfo["EndTime"] = req.body.EndTime.replace(/:/g, "").replace(/-/g, "").replace(/ /g, "");
            if (req.body.AddIdentNoExt === "on")
                applyInfo["AddIdentNoExt"] = "true";
            else
                applyInfo["AddIdentNoExt"] = "";
            if (req.body.AddEmailExt === "on")
                applyInfo["AddEmailExt"] = "true";
            else
                applyInfo["AddEmailExt"] = "";
            applyInfo["SelfExtValue"] = req.body.SelfExtValue;

            RA2101.send(applyInfo)
                .then(function (response) {
                    console.log("[[Routes][certApply][POSt] - ]" + response);
                    res.render('layout', {
                        orgName: tokenInfo['orgName'],
                        userName: tokenInfo['userName'],
                        contentpath: 'content/R_certApply',
                        menuName: 'certApply@cert',
                        contentargs: {
                            _Dn: response['Dn'],
                            _KeyLen: applyInfo["KeyLength"],
                            _SequenceNo: response['SequenceNo'],
                            _SerialNo: response['SerialNo'],
                            _AuthCode: response['AuthCode'],
                            _StartTime: response['StartTime'].substr(0, 4) + "年" + response['StartTime'].substr(4, 2) + "月" + response['StartTime'].substr(6, 2) + "日 " + response['StartTime'].substr(8, 2) + ":" + response['StartTime'].substr(10, 2) + ":" + response['StartTime'].substr(12, 2),
                            _EndTime: response['EndTime'].substr(0, 4) + "年" + response['EndTime'].substr(4, 2) + "月" + response['EndTime'].substr(6, 2) + "日 " + response['EndTime'].substr(8, 2) + ":" + response['EndTime'].substr(10, 2) + ":" + response['EndTime'].substr(12, 2)
                        },
                        initscript: ""
                    })
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
