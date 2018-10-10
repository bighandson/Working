var config = require('Config');

//校验版本更新
var getVerification = function (url,param,success,error)  {

    let WebUrl = 'http://m.bnngoo.com/home/GetUpdateVer';
    let os = Device.getOS();
    let vercode = Device.getBundleVersion(); 
    let jgm = config.jgm;
    let resver = config.version;
    let envir = config.isRelease; //0: 测试  1: 生产
    url = 'jgm='+ jgm+ '&os='+ os +'&vercode='+ vercode + '&resver='+ resver+'&envir='+envir;

var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            if (!!success) success(xhr.responseText);
        } else if (xhr.readyState == 4) {
            //cc.log(xhr.responseText);
            //cc.log(xhr.status);
            if (error) error(new Error('登陆失败'));
        }
    }
    xhr.onerror = function () {
        if (error) error(new Error('连接网络失败'));
    }
    // 超时
    xhr.ontimeout = function () {
        if (error) error(new Error("连接网络超时"));
    }
    xhr.timeout = 5000;  // 10秒超时
    xhr.open('POST', WebUrl,false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	  xhr.setRequestHeader("Content-length",url.length);
    xhr.send(url);
    cc.log(param);
}


 module.exports = {
    getVerification:getVerification,
}