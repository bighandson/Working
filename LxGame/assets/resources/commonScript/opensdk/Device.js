/**
 * 设备管理类.
 */

window.Device = {
};

// 获取appID
window.Device.getAppID = function () {
    if(!cc.sys.isNative){
        return 'wx43f8140facc3a8aa';
    }

    if(cc.sys.os == cc.sys.OS_ANDROID){
        return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','getAppID','()Ljava/lang/String;');
    }else if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','getAppID');
    }
    return 'wx43f8140facc3a8aa';
}

// 获取iOS bundle
// android version
window.Device.getBundleVersion = function () {
    if(!cc.sys.isNative){
        return 999999999;
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','getBundle');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        var version = jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','getVersion','()Ljava/lang/String;');
        return parseInt(version);
    }
    return 999999999;
}

// 获取uuid
window.Device.getUUID = function () {
    if(!cc.sys.isNative){
        return guid();
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','getDeviceID');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        return guid();
        //return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','startRecord','(Ljava/lang/String;)V',url);
    }

    return guid();
}

// 跳转链接
window.Device.goWebURL = function (url) {
    if(!cc.sys.isNative){
        return;
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','goAppStore:',url);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','goURL','(Ljava/lang/String;)V',url);
    }
}

// 获取操作系统
window.Device.getOS = function () {
    //return 3;
    return cc.sys.platform >>> 0;
}

/**
 *  ios网络是否允许设置
 */
window.Device.cellularDataRestricted = function () {
    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','cellularDataRestricted');
    }

    return true;
}

// 跳转设置
window.Device.goAPPSetting = function () {
    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','goAPPSetting');
    }
}

window.Device.gotoDownLoad = function (url) {
    if(!cc.sys.isNative) return;
    if(cc.sys.os == cc.sys.OS_ANDROID){
        return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','goURL','(Ljava/lang/String;)V',url);
    }else if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','copyClipboard:',url);
    }
}
/**
 * 复制到剪贴板
 * @param text
 */
window.Device.copyClipboard = function (text) {
    if(!cc.sys.isNative) return;
    if(cc.sys.os == cc.sys.OS_ANDROID){
        return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','copyClipboard','(Ljava/lang/String;)V',text);
    }else if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','copyClipboard:',text);
    }
}

/*
* 获取剪切板内容
*
*/
window.Device.getClipboard = function (appName) {
    if(!cc.sys.isNative) return;

    if(cc.sys.os == cc.sys.OS_ANDROID){
        return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','getClipboard','(Ljava/lang/String;)V',appName);
    }else if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','getClipboard:',appName);
    }
}




// android 日志
window.Device.log = function (text) {
    if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','log','(Ljava/lang/String;)V',text);
    }
}

function guid() {
    var uuid  = cc.sys.localStorage.getItem('localUUID');
    if(uuid){
        return uuid;
    }else{
        uuid = (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        cc.sys.localStorage.setItem('localUUID',uuid);
        return uuid;
    }
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}