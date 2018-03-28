var msgSender = require('../msgSender');
var msgParser = require('../msgParser');
var Promise = require('bluebird');
var moment = require('moment');

var tx2101 = {
    send: function (applyInfo) {
        return new Promise(function (resolve, reject) {
            console.log("[RASender][tx2101] - Start to apply the cert!");
            var reqjson = {
                Head: {},
                Body: {}
            };
            reqjson.Head["TxCode"] = "2101";
            reqjson.Head["Remark"] = "来自小北极星RAE的问候";
            reqjson.Head["Locale"] = "";
            if (applyInfo["Type"] === "1") {
                reqjson.Body["CertType"] = applyInfo["CertType"];
                reqjson.Body["CustomerType"] = applyInfo["CustomerType"];
                reqjson.Body["UserName"] = applyInfo["UserName"];
                reqjson.Body["UserNameInDn"] = applyInfo["UserNameInDn"];
                reqjson.Body["UserIdent"] = applyInfo["UserIdent"];
                reqjson.Body["IdentType"] = applyInfo["IdentType"];
                reqjson.Body["IdentNo"] = applyInfo["IdentNo"];
                reqjson.Body["KeyAlg"] = applyInfo["KeyAlg"];
                reqjson.Body["KeyLength"] = applyInfo["KeyLength"];
                reqjson.Body["BranchCode"] = applyInfo["BranchCode"];
                reqjson.Body["Email"] = applyInfo["Email"];
                reqjson.Body["PhoneNo"] = applyInfo["PhoneNo"];
                reqjson.Body["Address"] = applyInfo["Address"];
                reqjson.Body["StartTime"] = moment().format("YYYYMMDDHHmmss");
                reqjson.Body["Duration"] = applyInfo["Duration"];
                reqjson.Body["EndTime"] = applyInfo["EndTime"];
                reqjson.Body["AddIdentNoExt"] = "";
                reqjson.Body["AddEmailExt"] = "";
                reqjson.Body["SelfExtValue"] = "";
                reqjson.Body["DomainName"] = "";
                reqjson.Body["DeviceIdentifier"] = "";
                reqjson.Body["DepartmentNameInCert"] = "";
                reqjson.Body["OrganizationNameInCert"] = "";
                reqjson.Body["Locality"] = "";
                reqjson.Body["StateOrProvince"] = "";
                reqjson.Body["Country"] = "";
            } else {
                reqjson.Body["CertType"] = "";
                reqjson.Body["CustomerType"] = "";
                reqjson.Body["UserName"] = "";
                reqjson.Body["UserNameInDn"] = "";
                reqjson.Body["UserIdent"] = "";
                reqjson.Body["IdentType"] = "";
                reqjson.Body["IdentNo"] = "";
                reqjson.Body["KeyAlg"] = "";
                reqjson.Body["KeyLength"] = "";
                reqjson.Body["BranchCode"] = applyInfo["BranchCode"];
                reqjson.Body["Email"] = "";
                reqjson.Body["PhoneNo"] = "";
                reqjson.Body["Address"] = "";
                reqjson.Body["StartTime"] = moment().format("YYYYMMDDHHmmss");
                reqjson.Body["Duration"] = "";
                reqjson.Body["EndTime"] = "";
                reqjson.Body["AddIdentNoExt"] = "";
                reqjson.Body["AddEmailExt"] = "";
                reqjson.Body["SelfExtValue"] = "";
                reqjson.Body["DomainName"] = "";
                reqjson.Body["DeviceIdentifier"] = "";
                reqjson.Body["DepartmentNameInCert"] = "";
                reqjson.Body["OrganizationNameInCert"] = "";
                reqjson.Body["Locality"] = "";
                reqjson.Body["StateOrProvince"] = "";
                reqjson.Body["Country"] = "";
            }

            msgSender.send(reqjson)
                .then(function (rx) {
                    msgParser.xml2json(rx)
                        .then(function (rxJSON) {
                            rxJSON = rxJSON['Response']['Body'];
                            resolve(rxJSON);
                        })
                        .catch(function (err) {
                            console.log("[RASender][tx2101][ERROR] - response transfer from xml to json failed." + err);
                            reject(err);
                        });
                })
                .catch(function (err) {
                    console.log("[RASender][tx2101][ERROR] - send RA tx2101 failed. " + err);
                    reject(err);
                })
        });
    }
};

module.exports = tx2101;