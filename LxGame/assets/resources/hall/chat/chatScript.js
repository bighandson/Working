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

        chatNode : cc.Node,
        view     : cc.Node,
        inputMsg : cc.EditBox,
    },


    onClose : function () {
        this.node.removeFromParent(true);
        GlobEvent.removeListener('addChatMsg',this.onaddMsg.bind(this));
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {

        });

        for (var i = 0; i <= Global.ChatMsgList.length - 1; i++) {
            this.onaddMsg(Global.ChatMsgList[i])
        }

        GlobEvent.on('addChatMsg',this.onaddMsg.bind(this))
    },

    onaddMsg : function (mm) {
        let type = mm.msgType;

        let typeMode = type == 0 ? 'user' : 'system'

        let self = this;

        loadPrefab("hall/chat/msgNode",function (module) {

            module.getChildByName(typeMode + 'name').active = true

            module.getChildByName(typeMode + 'msg').active = true

            module.getChildByName(typeMode + 'name').getComponent(cc.Label).string = '['+ mm.nickName +']: ';

            module.getChildByName(typeMode + 'msg').getComponent(cc.Label).string = mm.msg;

            module.parent = self.view;
        });
    },

  
    //点击聊天框 打开聊天界面
    onClickSendMsg : function () {
        let self = this;
        let text = this.inputMsg.string

        if (text == '') {/****xxxx***aaaa****bbbb*****cccc****dddd****/
            showAlert('输点什么吧')
            return;
        }

        PomeloClient.request('user.userHandler.transBoardCast',{
            route    : 'Resp_transBoardCast',
            data : {
                nickName : UserCenter.getUserInfo().nc,
                msg      : text,
                msgType  : 0,
            }
        },function (data) {
            hideLoadingAni();
            if(data.code == 200 ){/****xxxx***aaaa****bbbb*****cccc****dddd****/
                // showAlertBox('发送成功');
                self.inputMsg.string = ''
            }else{
                showAlertBox('发送失败');
            }
        })
    },
    
});
