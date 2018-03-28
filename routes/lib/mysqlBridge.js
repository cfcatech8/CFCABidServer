var Promise = require('bluebird');
var mysql = require('mysql');
var config = require('./config');

var Pool = mysql.createPool({
    connectionLimit: 20,
    host: config.mysqlIP,
    user: config.mysqlUser,
    password: config.mysqlPwd,
    port: config.mysqlPort,
    database: config.mysqlDB,
    supportBigNumbers: true
});

var mysqlBridge = {
    query: function (sql) {
        return new Promise(function (resolve, reject) {
                //Get the Connection
                Pool.getConnection(function (err, connection) {
                    if (err) {
                        reject("ERROR");
                    }
                    // Use the connection
                    connection.query(sql, function (err, result) {
                        // Release the connection
                        connection.release();
                        if (err) {
                            console.log('[msgBridge][query][SELECT ERROR] - ', err.message);
                            reject("ERROR");
                        }
  //                      console.log("[msgBridge][query] - result: "+result);
                        resolve(result);
                    });
                });
            }
        );
    }

};

module.exports = mysqlBridge;
