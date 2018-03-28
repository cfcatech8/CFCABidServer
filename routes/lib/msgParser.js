var xml2js = require('xml2js');
var Promise = require('bluebird');

var jsonBuilder = new xml2js.Builder({
    rootName: 'Request',
    xmldec: {
        version: '1.0',
        'encoding': 'UTF-8'
    }
}); //json -> xml
var xmlParser = new xml2js.Parser({explicitArray: false, ignoreAttrs: true}); // xml -> json

var msgParser = {
    json2xml: function (json) {
        var temp = jsonBuilder.buildObject(json);
        console.log('json解析成xml:  ' + temp);
        if (temp) {
            return temp;
        } else {
            return "";
        }
    },

    xml2json: function (xml) {
        return new Promise(function (resolve, reject) {
            xmlParser.parseString(xml, function (err, result) {
                if (result) {
                    console.log('xml解析成json:' + JSON.stringify(result));
                    resolve (result);
                } else {
                    reject(err);
                }
            });
        });
    }
}

module.exports = msgParser;