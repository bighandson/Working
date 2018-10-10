
/**
 *  魔窗接口
 */

window.getMagicParams = function () {
    var params = '0/0';
    if(!cc.sys.isNative){
        return params;
    }

    /**
     * 参数返回格式  gameid/roomcode 129/123456
     */
    if(cc.sys.os == cc.sys.OS_IOS){
        params = jsb.reflection.callStaticMethod('NativeOcClass','getOpenURLData');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        params = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","getMagicWindowData", "()Ljava/lang/String;");
    }

    return params;
};


window.getXLParams = function () {
    var params = '0/0';
    if(!cc.sys.isNative){
        return params;
    }

    /**
     * 参数返回格式  gameid/roomcode 129/123456
     */
    if(cc.sys.os == cc.sys.OS_IOS){
        params = jsb.reflection.callStaticMethod('NativeOcClass','getOpenURLData');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        params = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity","getMagicWindowData", "()Ljava/lang/String;");
    }

    return params;
};


// 获取剪切板 分享游戏房间信息
window.getShareParams = function (callback) {
    if(!cc.sys.isNative){
        return '000000';
    }
    var config = require('Config')
    var text = Device.getClipboard(config.appName);  // 取出剪贴板内容
}


// 剪切板 拿到内容 回调
window.getShareParamsCallBack = function(text){
    Device.copyClipboard('');  // 清空剪贴板
    cc.log('剪贴板',text)
    var num = '' + text;

    PULL_ROOMID = num.substring(0,6)

    cc.log('从剪贴板拿到内容:',text,PULL_ROOMID)

    PULL_GAMEID = '123456';

    if (!parseInt(PULL_ROOMID) || PULL_ROOMID.length != 6 || PULL_ROOMID == '000000') {
        PULL_ROOMID = '0'
        PULL_GAMEID = '0'
        cc.log('从外部拉起游戏  roomId 错误');
        return;
    }

    cc.log('===PULL_ROOMID:',PULL_ROOMID,"===PULL_GAMEID:",PULL_GAMEID);

    var LoadGame = require('LoadGame');

    LoadGame.reinRoom(function (gameid,type) {
        if (!gameid) {
            // 请求加入游戏房间
            PomeloClient.request('mjcard.cardHandler.magic',{
                key         : UserCenter.getUserInfo().token,
                sign        : UserCenter.getUserInfo().sign,
                gameid      : parseInt(PULL_GAMEID),
                roomcode    : parseInt(PULL_ROOMID),
            },function (data) {
                PULL_ROOMID = '0'
                PULL_GAMEID = '0'
                if(data.code == 300){ // 在游戏中
                    LoadGame.enterActGame(data.gameid,data.type);
                }
            });
        }
    })
}