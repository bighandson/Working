/**
 * Created by xiao cai on 2017/4/24.
 */
var CryptoJS = require('crypto-js');

/**
 * data 加密
 * @param data
 * @param key
 * @returns {String}
 */
module.exports.encrypt = function (data,key) {
    var enc = CryptoJS.AES.encrypt(JSON.stringify(data),key);
    return enc.toString();
}

/**
 * data 解密
 * @param data
 * @param key
 * @returns {null}
 */
module.exports.decrypto = function (data,key) {
    var bytes = CryptoJS.AES.decrypt(data,key);
    if(!bytes){
        return null;
    }
    try {
        var str = bytes.toString(CryptoJS.enc.Utf8);
        var decryptedData = JSON.parse(str);
        return decryptedData;
    }catch (e){
        cc.log(e.message);
        return null;
    }
}