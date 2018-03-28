var Promise = require('bluebird');
var dber = require('./mysqlBridge');
var util = require('./util');

// result: <string> - user name
function _getUserName(certSN) {
    console.log("[RAQ][getUserName] - Start getting the " + certSN + "'s user name.");
    return new Promise(function (resolve, reject) {
        dber.query("SELECT USER_ID FROM CERT WHERE SERIAL_NO='" + certSN + "'")
            .then(function (UserID) {
                if (UserID.length < 1) {
                    resolve("N/A");
                } else {
                    dber.query("SELECT USER_NAME FROM USER_INFO WHERE USER_ID='" + UserID[0].USER_ID + "'")
                        .then(function (UserName) {
                            if (UserName.length > 0) {
                                resolve(UserName[0].USER_NAME);
                            } else {
                                resolve("N/A");
                            }
                        })
                        .catch(function (err) {
                            console.log("[RAQ][getUserName] - <ERROR1>");
                            reject(err);
                        })
                }
            })
            .catch(function (err) {
                console.log("[RAQ][getUserName] - <ERROR2>");
                reject(err);
            })
    })
}

// result: {BRANCH_NAME,BRANCH_CODE,OU}
function _getBelongOrg(certSN) {
    console.log("[RAQ][getBelongOrg] - Start checking which Org is the " + certSN + " belong to.");
    return new Promise(function (resolve, reject) {
        dber.query("SELECT BRANCH_ID FROM CERT WHERE SERIAL_NO='" + certSN + "'")
            .then(function (BranchID) {
                if (BranchID.length < 1) {
                    resolve(null);
                } else {
                    dber.query("SELECT BRANCH_NAME,BRANCH_CODE,OU FROM BRANCH WHERE BRANCH_ID='" + BranchID[0].BRANCH_ID + "'")
                        .then(function (OrgInfo) {
                            if (OrgInfo.length > 0) {
                                resolve(OrgInfo[0]);
                            } else {
                                resolve(null);
                            }
                        })
                        .catch(function (err) {
                            console.log("[RAQ][getBelongOrg] - <ERROR1>");
                            reject(err);
                        })
                }
            })
            .catch(function (err) {
                console.log("[RAQ][getBelongOrg] - <ERROR2>");
                reject(err);
            })
    })
}

// result: 0 - Not A Role, -1 - System Admin, other - RoleID
function _getRoleID(certSN) {
    console.log("[RAQ][getRoleID] - Start check if the " + certSN + " is able to log.");
    return new Promise(function (resolve, reject) {
        dber.query("SELECT CERT_ID FROM CERT WHERE SERIAL_NO='" + certSN + "'")
            .then(function (CertID) {
                if (CertID.length < 1) {
                    resolve("0");
                }
                else if (CertID[0].CERT_ID === -1) {
                    resolve("-1");
                } else {
                    dber.query("SELECT ROLE_ID FROM CERT_ROLE WHERE CERT_ID='" + CertID[0].CERT_ID + "'")
                        .then(function (RoleID) {
                            if (RoleID.length > 0) {
                                resolve(RoleID[0].ROLE_ID);
                            } else {
                                resolve("0");
                            }
                        })
                        .catch(function (err) {
                            console.log("[RAQ][getRoleID] - <ERROR1>");
                            reject(err);
                        })
                }
            })
            .catch(function (err) {
                console.log("[RAQ][getRoleID] - <ERROR2>");
                reject(err);
            })
    })
}

function _queryCertTypesBySN(certSN) {
    console.log("[RAQ][queryCertTypesBySN] - Start to collect all usable certTypes for " + certSN);
    return new Promise(function (resolve, reject) {
            _getRoleID(certSN)
                .then(function (RoleID) {
                        return new Promise(function (resolve, reject) {
                            var certIDsql = "SELECT CERT_TYPE_ID FROM ROLE_CERT_TYPE";
                            if (RoleID !== "0") {
                                if (RoleID !== "-1")
                                    certIDsql = certIDsql + " WHERE ROLE_ID='" + RoleID + "'";
                                dber.query(certIDsql)
                                    .then(function (CertTypeID) {
                                        if (CertTypeID.length > 0) {
                                            if (RoleID === "-1")
                                                CertTypeID = util.compressArrayByKey(CertTypeID, "CERT_TYPE_ID");
                                            var certTypeInfoList = [];
                                            var counter = 0;
                                            for (var i = 0; i < CertTypeID.length; i++) {
                                                dber.query("SELECT CERT_TYPE_ID,CERT_TYPE_NAME,CERT_TYPE_FLAG,CERT_TYPE_SORT,KEY_ALG,MIN_KEY_LENGTH FROM CERT_TYPE WHERE CERT_TYPE_ID='" + CertTypeID[i].CERT_TYPE_ID + "'")
                                                    .then(function (certInfo) {
                                                        if (certInfo[0].CERT_TYPE_SORT !== "4" && certInfo[0].CERT_TYPE_SORT !== "5")
                                                            certTypeInfoList.push(certInfo[0]);
                                                        counter++;

                                                        if (counter == CertTypeID.length)
                                                            resolve(certTypeInfoList);
                                                    })
                                                    .catch(function (err) {
                                                        reject(err);
                                                    })
                                            }
                                        } else
                                            resolve([]);
                                    })
                                    .catch(function (err) {
                                        reject(err);
                                    })
                            } else
                                reject("YOU ARE NOT ADMIN!");
                        })
                    }
                )
                .then(function (certTypeInfoList) {
                    certTypeInfoList = util.sortArrayByKey(certTypeInfoList, "CERT_TYPE_ID", "up");
                    var result = [];
                    for (var i = 0; i < certTypeInfoList.length; i++) {
                        result.push({
                            ID: certTypeInfoList[i].KEY_ALG + "_" + certTypeInfoList[i].MIN_KEY_LENGTH + "_" + certTypeInfoList[i].CERT_TYPE_SORT + "_" + certTypeInfoList[i].CERT_TYPE_FLAG,
                            Desc: certTypeInfoList[i].CERT_TYPE_NAME
                        })
                    }
                    resolve(result);
                })
                .catch(function (err) {
                        console.log("[RAQ][queryCertTypesBySN] - <ERROR2>");
                        reject(err);
                    }
                );
        }
    )
}

function _queryIDTypes() {
    console.log("[RAQ][_queryIDTypes] - Start query all ID types.");
    var IDTypes = [];
    return new Promise(function (resolve, reject) {
        dber.query("SELECT IDENT_TYPE_NAME,IDENT_TYPE_CODE,IDENT_CERT_TYPE FROM IDENT_TYPE")
            .then(function (result) {
                if (result.length > 0) {
                    for (var i = 0; i < result.length; i++) {
                        IDTypes.push({
                            ID: result[i].IDENT_TYPE_CODE + "_" + result[i].IDENT_CERT_TYPE,
                            Desc: result[i].IDENT_TYPE_NAME
                        });
                    }
                    resolve(IDTypes);
                } else
                    reject("IDENT_TYPE EMPTY!");
            })
            .catch(function (err) {
                reject(err);
            })
    });
}

var RAQ = {
    // 根据证书序列号查询是否允许登陆
    getUserName: _getUserName,
    getBelongOrg: _getBelongOrg,
    getRoleID: _getRoleID,
    queryCertTypesBySN: _queryCertTypesBySN,
    queryIDTypes: _queryIDTypes
};

module.exports = RAQ;