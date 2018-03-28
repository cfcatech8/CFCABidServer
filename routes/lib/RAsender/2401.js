var msgSender = require('../msgSender');
var msgParser = require('../msgParser');
var Promise = require('bluebird');
var moment = require('moment');

var tx2401 = {
    send: function (applyInfo) {
        return new Promise(function (resolve, reject) {
            console.log("[RASender][tx2401] - Start to download the cert!");
            var reqjson = {
                Head: {},
                Body: {}
            };
            reqjson.Head["TxCode"] = "2401";
            reqjson.Head["Remark"] = "来自小北极星RAE的问候";
            reqjson.Head["Locale"] = "";
            if (applyInfo["Type"] === "1") {
                reqjson.Body["SerialNo"] = applyInfo["SerialNo"];
                reqjson.Body["AuthCode"] = applyInfo["AuthCode"];
                reqjson.Body["P10"] = applyInfo["P10"];
                reqjson.Body["P10Sub"] = "";
            } else {
                reqjson.Body["SerialNo"] = applyInfo["SerialNo"];
                reqjson.Body["AuthCode"] = applyInfo["AuthCode"];
                reqjson.Body["P10"] = applyInfo["P10"];
                reqjson.Body["P10Sub"] = "";
            }

            msgSender.send(reqjson)
                .then(function (rx) {
                    msgParser.xml2json(rx)
                        .then(function (rxJSON) {
                            rxJSON = rxJSON['Response']['Body'];
                            resolve(rxJSON);
                        })
                        .catch(function (err) {
                            console.log("[RASender][tx2401][ERROR] - response transfer from xml to json failed." + err);
                            reject(err);
                        });
                })
                .catch(function (err) {
                    console.log("[RASender][tx2401][ERROR] - send RA tx2401 failed. " + err);
                    reject(err);
                })
        });
    }
};

module.exports = tx2401;