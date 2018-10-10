var config = require("Config")
var Login = require('Login');
var Activity = require('Activitylist');
var config = require('Config');

cc.Class({
    extends: cc.Component,

    properties: {
        wxbutton: cc.Node,
        qkbutton: cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.wxbutton.active = wxapi.isInstallWeChat();
        this.qkbutton.active = !wxapi.isInstallWeChat();
        if(!cc.sys.isNative){
            this.qkbutton.active = true;
            this.wxbutton.active = false;
        }
        
        GlobEvent.on('WXAuthCode', this.WXAuthCode.bind(this));
        GlobEvent.on('XLAuthCode', this.XLAuthCode.bind(this));

        Activity.showactivity();
        hideLoadingAni();
    },

    onClickWchat: function () {
        wxapi.sendWeChatAuthReq('snsapi_userinfo','none');
        // if (xlapi.isInstallXL()) {
        //    xlapi.sendAuthReqXL('snsapi_userinfo','none'); 
        // }else{
        //     showAlertBox('请先安装闲聊');
        // }
    },

    onClickQuick: function () {
        showLoadingAni();
        Login.loginByVisitor(function (err,data) {
            hideLoadingAni();
            if(err) showAlertBox(data);
        });
    },
    WXAuthCode: function (appid, code, state) {
        showLoadingAni();
        Login.loginByWeixin(appid, code, state, function (err, data) {
            hideLoadingAni();
            if (err) showAlertBox(data);
        });
    },

    XLAuthCode: function (appid, code, state) {
        showLoadingAni();
        cc.log('闲聊授权成功',appid,code,state)
        Login.loginByWeixin(appid, code, state, function (err, data) {
            hideLoadingAni();
            if (err) showAlertBox(data);
        });
    },

    onDestroy : function () {
        GlobEvent.removeAllListeners('WXAuthCode');
        GlobEvent.removeAllListeners('XLAuthCode');
    }
  
});
