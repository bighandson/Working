/**
 * 语音录制 播放
 */

window.NativeAudio = {};

/**
 * 开始录制语音
 * @param url 上传地址
 */
window.NativeAudio.startRecord = function (url) {
    if(!cc.sys.isNative){
        return ;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','recordStart:',url);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','startRecord','(Ljava/lang/String;)V',url);
    }

    return;
}

/**
 * 暂停录制语音，语音录制完成
 */
window.NativeAudio.stopRecord = function () {
    if(!cc.sys.isNative){
        GlobEvent.emit('UploadAudio',0,'http://123.com');
        return;
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','recordStop');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','stopRecord','()V');
    }
}

/**
 * 取消录制语音
 */
window.NativeAudio.cancelRecord = function () {
    if(!cc.sys.isNative){
        return;
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','recordCancel');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','recordCancel','()V');
    }
}

/**
 * 语音上传完成
 * @param flag
 * @param url
 */
window.NativeAudio.uploadAudio = function (flag,url,time) {
    cc.log('uploadAudio : ',flag,url,time);
    GlobEvent.emit('UploadAudio',parseInt(flag),url,time);
}

/**
 * 播放声音
 * @param path
 */
window.NativeAudio.playAudio = function (path) {
    if(!cc.sys.isNative){
        setTimeout(function () { // 测试，6s播放完成
            GlobEvent.emit('AudioPlay',0);
        },6000);
        return;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','playAudio:',path);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','playAudio','(Ljava/lang/String;)V',path);
    }

    return;
}

/**
 * 语音播放回调
 * @param flag
 */
window.NativeAudio.audioPlayCallback = function (flag) {
    cc.log('AudioPlay : ',flag);
    GlobEvent.emit('AudioPlay',flag);
}
