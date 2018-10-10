
/**
 *  通用模块
 */

var config = require('Config');
var querystring = require('querystring');
var LoadGame = require('LoadGame');

// jsb error Handler 提交异常
window.__errorHandler = function () {
    cc.log('__errorHandler : ',arguments[0],arguments[1],arguments[2]);
    let qs = querystring.stringify({
        userid : UserCenter.getUserID() || 0,
        version : config.version,
        os      : cc.sys.os,
        file   : arguments[0],
        line   : arguments[1],
        error  : arguments[2]
    });
    //
    postXHREvent(config.weburl + '/errorHandler',qs,function (err,data) {

    });
}

window.YMEvent = function (eventId,eventTag) {
    if(!cc.sys.isNative){
        return;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('AppController','YouMenEvent:Tag:',eventId,eventTag);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","YMEvent", "(Ljava/lang/String;Ljava/lang/String;)V",eventId,eventTag.toString());
    }
}

/**
 *  检测版本更新
 */
function checkUpdate(expend,cb) {
    if(typeof expend == 'function'){
        cb = expend;
        expend = '';
    }
    let qs = querystring.stringify({
        jgm : config.jgm,
        vercode : 2,//Device.getBundleVersion(),
        os : '1',//Device.getOS(),
        resver : '1.0.0',
        expend : expend
    });

    postXHREvent(config.weburl + '/proxy/check',qs,function (err,data) {
        // console.log(data ,typeof data);
        cb(err,data);
    });
}


// window.PULL_TYPE = 0;
window.PULL_ROOMID = '0';
window.PULL_GAMEID = '0';


/* by Amao 2018.3.23
** 从外部拉起游戏
* TYPE 0 复制  1 魔窗  2 闲聊
*/
window.PullGame = function () {
    // 从剪切板拉起
    getShareParams();
};

var isBack = false; 

var Hidetime = 0

/**
 * 监听app切换前台消息
 */
cc.game.on(cc.game.EVENT_SHOW,function () {
    if (isBack) {
        return;
    }

    var time = new Date().getTime()
    var gap = Math.floor((time - Hidetime)/1000)
    cc.log('-------获取进入时间---------',time,'间隔:',gap)


    if (gap > 1800 && Hidetime) {  // 半个小时间隔  重新登录  直接跳转 检查更新界面
        PomeloClient.isConnected = false;
        pomelo.removeAllListeners();
        pomelo.disconnect();
        cc.log('-------重启---------')
        cc.director.loadScene('startScene')
        return
    }

    isBack = true;
    SettingMgr.onResume();
    var timeid = setTimeout(function () {
        isBack = false;
        // 检测是否魔窗启动
        clearTimeout(timeid);
        if(!PomeloClient.isConnected){
            return;
        }
        // 检测是否从外部拉起
        PullGame()
    },1000);
});

cc.game.on(cc.game.EVENT_HIDE,function () {
    SettingMgr.onPause();
    Hidetime = new Date().getTime()

    cc.log('-------记录退出时间---------',Hidetime)

});


module.exports = {
    checkUpdate : checkUpdate
}