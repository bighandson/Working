
window.postXHREvent = function (url,param,cb) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            //cc.log(xhr.response);
            if(!!cb) cb(null,JSON.parse(xhr.response));
        }else if(xhr.readyState == 4 ){
            //cc.log(xhr.response);
            if(!!cb) cb(new Error(xhr.status),xhr.response);
        }
    }
    xhr.onerror = function () {
        if(cb) cb(new Error('连接网络失败'));
    }
    // 超时
    xhr.ontimeout = function () {
        if(cb) cb(new Error("连接网络超时"));
    }
    xhr.timeout = 10000;  // 10秒超时
    xhr.open('POST', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(param);
    cc.log(param);
}

window.getXHREvent = function (url,cb) {
    var xhr  = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207))
        {
            var json = JSON.parse(xhr.response);
            if(cb) cb(null,json);
        }else{
            if(!!cb) cb(new Error(xhr.status),xhr.response);
        }
    }

    xhr.onerror = function () {
        if(cb) cb(new Error('连接网络失败'));
    }
    // 超时
    xhr.ontimeout = function () {
        if(cb) cb(new Error("连接网络超时"));
    }
    xhr.timeout = 10000;  // 10秒超时
    xhr.open('GET', url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
}

/**
 * 网络变换消息
 */
window.networkAvailable = function (available) {
    cc.log('networkAvailable : ',available);
    GlobEvent.emit('networkAvailable',parseInt(available));
}

/**
 * 网络是否可用
 * @returns {boolean}
 */
window.isNetAvailable = function () {
    var ret = true;
    if(!cc.sys.isNative){  //
        return true;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        ret = jsb.reflection.callStaticMethod('NativeOcClass','isNetConnected');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        ret = jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','isNetWorkConnected', '()Z');
    }
    return ret;
}