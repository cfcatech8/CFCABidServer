var crypto = require("crypto");
var config = require("./config");
var sadk = require('./sadkAPI')
var Token = {

    genRand: function (len) {
        var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var rand = "";
        for (var i = 0; i < len; i++) {
            var id = Math.ceil(Math.random() * 35);
            rand += chars[id];
        }
        return rand;
    },

    createToken: function (obj, timeout) {
        console.log(parseInt(timeout) || 120);
        var obj2 = {
            data: obj,//payload
            created: parseInt(Date.now() / 1000),//token生成的时间的，单位秒
            exp: parseInt(timeout) || 120//token有效期
        };

        //payload信息
        var base64Str = Buffer.from(JSON.stringify(obj2), "utf8").toString("base64");

        //添加签名，防篡改
        var secret = "key-rae.gps949.com";
        var hash = crypto.createHmac('sha256', secret);
        hash.update(base64Str);
        var signature = hash.digest('base64');

        return base64Str + "." + signature;
    },

    decodeToken: function (token) {
        var decArr = token.split(".");
        if (decArr.length < 2)
        //token不合法
            return false;

        var payload = {};
        //将payload json字符串 解析为对象
        try {
            payload = JSON.parse(Buffer.from(decArr[0], "base64").toString("utf8"));
        } catch (e) {
            return false;
        }
        //检验签名
        var secret = "key-rae.gps949.com";
        var hash = crypto.createHmac('sha256', secret);
        hash.update(decArr[0]);
        var checkSignature = hash.digest('base64');

        return {
            payload: payload,
            signature: decArr[1],
            checkSignature: checkSignature
        }
    },

    getInfoFromToken: function (token) {
        var resDecode = this.decodeToken(token);
        if (!resDecode)
            return "";
        //是否过期
        var expState = (parseInt(Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp) ? false : true;
        if (resDecode.signature === resDecode.checkSignature && expState)
            return {
                SN: resDecode.payload.data.split('@^_^@')[1].split(':')[1],
                userName: resDecode.payload.data.split('@^_^@')[2].split(':')[1],
                orgName: resDecode.payload.data.split('@^_^@')[3].split(':')[1],
                orgCode: resDecode.payload.data.split('@^_^@')[4].split(':')[1]
            };
        return "";
    },

    checkToken: function (token) {
        var resDecode = this.decodeToken(token);
        if (!resDecode)
            return false;
        //是否过期
        var expState = (parseInt(Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp) ? false : true;
        if (resDecode.signature === resDecode.checkSignature && expState) {
            var tempToken = this.createToken(resDecode.payload.data, config.tokenTimeout);
            return tempToken;
        }
        return null;
    },

    createRand: function (timeout) {
        console.log(parseInt(timeout) || 120);
        var obj2 = {
            rand: this.genRand(8),//payload
            created: parseInt(Date.now() / 1000),//token生成的时间的，单位秒
            exp: parseInt(timeout) || 120//token有效期
        };

        //payload信息
        var base64Str = Buffer.from(JSON.stringify(obj2), "utf8").toString("base64");

        //添加签名，防篡改
        var secret = "key-rae.gps949.com";
        var hash = crypto.createHmac('sha256', secret);
        hash.update(base64Str);
        var signature = hash.digest('base64');

        return base64Str + "." + signature;
    },

    decodeRand: function (rand) {
        var decArr = rand.split(".");
        if (decArr.length < 2)
        //Rand不合法
            return false;

        var payload = {};
        //将payload json字符串 解析为对象
        try {
            payload = JSON.parse(Buffer.from(decArr[0], "base64").toString("utf8"));
        } catch (e) {
            return false;
        }
        //检验签名
        var secret = "key-rae.gps949.com";
        var hash = crypto.createHmac('sha256', secret);
        hash.update(decArr[0]);
        var checkSignature = hash.digest('base64');

        return {
            payload: payload,
            signature: decArr[1],
            checkSignature: checkSignature
        }
    },

    verifyRandSign: function (rand, signature) {
        var resDecode = this.decodeRand(rand);
        if (!resDecode)
            return "Timeout";

        //是否过期
        var expState = (parseInt(Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp) ? false : true;
        if (resDecode.signature === resDecode.checkSignature && expState) {
            var rand = resDecode.payload.rand;
            if (sadk.P7Verify(rand, signature))
                return "OK";
            else
                return "Fail";
        }
        return "Timeout";
    },

    updateRand: function (rand) {
        var resDecode = this.decodeRand(rand);
        if (!resDecode)
            return false;
        //是否过期
        var expState = (parseInt(Date.now() / 1000) - parseInt(resDecode.payload.created)) > parseInt(resDecode.payload.exp) ? false : true;
        if (resDecode.signature === resDecode.checkSignature && expState) {
            var tempToken = this.createToken(resDecode.payload.data, config.tokenTimeout);
            return tempToken;
        }
        return null;
    }

};

module.exports = Token;