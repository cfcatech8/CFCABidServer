var Promise = require('bluebird');
var rp = require('request-promise');
var config = require ('./config');
var msgParser= require('./msgParser');

var msgSender = {

    send: function (json){
        return new Promise ( function (resolve, reject){
            console.log("[msgSender][send] - Sender Start");
            var reqxml = msgParser.json2xml(json);
            var options = {
                method: 'POST',
                uri: 'http://' + config.raIP + ':' + config.raPort + '/CSHttpServlet',
                headers: {
                    'Content-Type': "text/xml"
                },
                body: reqxml
            };
            console.log("[msgSender][send] - The request is => "+reqxml);
            rp(options)
                .then(function (htmlString) {
                    console.log("[msgSender][send] - The RA response is => "+htmlString);
                    resolve (htmlString);
                })
                .catch(function (err) {
                    console.log("XML send test FAIL: "+err);
                    reject ("");
                });
            console.log("[msgSender][send] - Sender END");
            }
        )
    }
};

module.exports=msgSender;











