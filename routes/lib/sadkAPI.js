var java = require("java");
var config = require("./config")


var sadkAPI = {
    P7Verify: function (src, signature) {
        java.classpath.push("public/lib/sadk3400API.jar");
        try {
            var result = java.callStaticMethodSync("gps949.sadkapi.RSAP7DetachVerify", "doit", src, signature, config.trustCA);
            if (result != 0) {
                console.log("The Verify result is:" + result.toString());
                //1.signature bad; 2.Cert bad; 3.Cert expired;
                return false;
            }
        } catch (ex) {
            return false;
        }
        return true;
    },
    P7ReadSN: function (signature) {
        java.classpath.push("public/lib/sadk3400API.jar");
        try {
            var result = java.callStaticMethodSync("gps949.sadkapi.ReadP7Info", "getSN", signature);
            if (result) {
                console.log("The P7Sign's SN is:" + result);
                //1.signature bad; 2.Cert bad; 3.Cert expired;
                return result;
            }
        } catch (ex) {
            return "";
        }
        return "";
    }

}

module.exports = sadkAPI;