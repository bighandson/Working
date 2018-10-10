var Friend = require('Friend')

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        input    : cc.EditBox,
        nickname     : cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },

    initData : function (info) {
        this.info = info
        this.nickname.string = info.nc;
    },

    // 返回大厅
    onclose: function () {
        this.node.removeFromParent(true);
    },

    // 确认
    onClickSend : function () {
        if (this.input.string == '') {
            showAlertBox('消息不能为空!')
            return;
        }

        showLoadingAni()

        let self = this;

        // 发送好友留言
        PomeloClient.request('user.userHandler.transP2P',{
            route        : 'Resp_transP2P',
            receiveID    : self.info.userid,
            msgType      : 0,
            data : {
                receiveId    : self.info.userid,
                sendId      : UserCenter.getUserInfo().userid,
                sendName    : UserCenter.getUserInfo().nc,       
                reciveNmae  : self.info.nc,
                msg         : self.input.string,
            }
        },function (data) {
            cc.log('transP2P',data)
            hideLoadingAni();
            if(data.code == 200){
                showAlert('消息发送成功!')
            }else if(data.code == 300){
                showAlert('对方不在线，消息发送失败')
            }
            self.node.removeFromParent(true);
        })
    },

    // 分取消
    onClickCancel : function () {
        this.node.removeFromParent(true);
    },
});
