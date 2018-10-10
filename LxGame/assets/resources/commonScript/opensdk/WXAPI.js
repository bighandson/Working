/**
 * 微信接口
 */

window.wxapi = {};
var _currentBattyer = -1;
var _longitude = 0;
var _latitude = 0;


window.wxapi.getCurrentBatteryCallBack = function( battery)
{
    _currentBattyer = battery;
    // cc.log('batteryxxxx',_currentBattyer);
}

window.wxapi.getCurrentBattery = function()
{
    if( !cc.sys.isNative)
    {
        return -1;
    }
    if(_currentBattyer>=0){
        return _currentBattyer;
    }else{
        // if(cc.sys.os == cc.sys.OS_IOS){
        //     return jsb.reflection.callStaticMethod('NativeOcClass','getCurrentBattery');
        // }
         if(cc.sys.os == cc.sys.OS_ANDROID){
            return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','getCurrentBattery','()I');
        }else {
             return -1
         }

    }


     /*

    */
}

/**
 * 获取GPS信息
 */
window.wxapi.getGPSCallBack = function( longitude,latitude)
{
    //this._currentBattyer = battery;
    _longitude = longitude;
    _latitude = latitude;
}


window.wxapi.getGPS = function()
{  
    return [_longitude,_latitude];
}



/**
 *  判断微信是否安装
 */
window.wxapi.isInstallWeChat = function () {
    if(!cc.sys.isNative){
        return true;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','isInstallWeChat');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','isInstallWeChat','()Z');
    }

    return false;
}

/**
 * 'snsapi_userinfo','none'
 * @param scope  'snsapi_userinfo'  授权作用域
 * @param state  自定义，防止串改
 */
window.wxapi.sendWeChatAuthReq = function (scope,state) {
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendWeChatAuthReq:andState:',scope,state);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendWeChatAuthReq',"(Ljava/lang/String;Ljava/lang/String;)V",
            scope,state);
    }
}

/**
 * 分享文本
 * @param text
 * @param shareTo 分享目标位置 0 : 分享的目标，0 聊天窗口，1 朋友圈，2 收藏
 */

window.wxapi.sendMessageToWxReq = function (text,shareTo) {
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendMessageToWxReq:shareTo:',text,shareTo);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendMessageToWxReq', '(Ljava/lang/String;I)V',text,shareTo);
    }
}

/**
 * 分享图片
 */
window.wxapi.sendImageToWxReq = function (imagePath,shareTo) {
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendImageToWxReq:shareTo:',imagePath,shareTo);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendImageToWxReq', '(Ljava/lang/String;I)V',imagePath,shareTo);
    }
}

/**
 *  android 分享资源目录
 * @param imagePath
 * @param shareTo
 */
window.wxapi.sendAssetsImageToWxReq = function (imagePath,shareTo) {
    if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendAssetsImageToWxReq', '(Ljava/lang/String;I)V',imagePath,shareTo);
    }
}


/**
 * 分享连接
 * @param title
 * @param description
 * @param url
 * @param shareTo
 */
window.wxapi.sendWebPageToWxReq = function (title,description,url,shareTo) {
    if(!cc.sys.isNative){
        return;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendWebPageToWxReq:description:URL:shareTo:'
            ,title,description,url,shareTo);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendWebPageToWxReq',
            '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;I)V',title,description,url,shareTo);
    }
}


/**
 * 邀请微信好友
 * @param gameid
 * @param roomcode
 */
window.wxapi.initWXFriend = function (title,gameid,roomcode,descript) {
    if(!cc.sys.isNative){
        return;
    }

    if(cc.sys.os == cc.sys.OS_IOS){
        cc.log(title,gameid,roomcode);
        jsb.reflection.callStaticMethod('NativeOcClass','initWXFriend:Gameid:roomCode:Description:',title,gameid.toString(),roomcode,descript);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','initWXFriend','(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V',
            title,gameid.toString(),roomcode,descript);
    }
}


/**粘贴复制 邀请好友   
** by Amao 2018.4.11 
*/

window.wxapi.sendWxFriend = function (text) {
    var config = require('Config')
    loadPrefab("style/commonPreb/gameSendFriend", function (module) {
        module.x = cc.winSize.width / 2;
        module.y = cc.winSize.height / 2;
        module.parent = cc.director.getScene();

        module.getChildByName('box').getChildByName('txt').getComponent(cc.Label).string = text

        module.getChildByName('box').getChildByName('share').on(cc.Node.EventType.TOUCH_END, function (event) {
            let txt = text + '复制这条信息后打开乐享<乐享游戏天天>'+'\n' + '若没下载的点击链接：' + config.downLink + '下载后打开'
            module.removeFromParent();
            Device.copyClipboard(txt);
            Device.goWebURL('weixin://');

            cc.log('===========================================================')
        });

        module.getChildByName('box').getChildByName('close').on(cc.Node.EventType.TOUCH_END, function (event) {
            module.removeFromParent();
        });

        module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
    }); 
}


/**
 * 微信支付
 * @param partnerId
 * @param prepayId
 * @param nonceSt
 * @param timeStamp
 * @param sign
 */
window.wxapi.sendWXPay = function (partnerId,prepayId,nonceSt,timeStamp,sign) {
    if(!cc.sys.isNative){
       this.WXPayCallback('0');
        return;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendWXPay:PrepayId:NonceStr:timeStamp:Sign:'
            ,partnerId,prepayId,nonceSt,timeStamp.toString(),sign);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendWXPay',
            '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V'
            ,partnerId,prepayId,nonceSt,timeStamp.toString(),sign);
    }
}

/**
 * 微信支付回调
 * @param errCode
 */
window.wxapi.WXPayCallback = function (errCode) {
    GlobEvent.emit('WXPayCallback',errCode);
}

/**
 * 微信授权成功回调
 * @param appid   微信app_key
 * @param code    微信授权code
 * @param state   授权随机吗
 */
window.wxapi.WXAuthCodeCallback = function (appid,code,state) {
    GlobEvent.emit('WXAuthCode',appid,code,state);
}

window.wxapi.WXShareCallback = function (errCode) {
    var code = !!errCode ? parseInt(errCode) : 0;
    GlobEvent.emit('WXShare', code);
}