
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
        sendName        : cc.Label,
        sendMsg         : cc.Label,
        qrBtn           : cc.Node,
        nextBtn         : cc.Node,
        addBtn          : cc.Node,
        huifu           : cc.Node,
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});

        this.setInfo()
    },

    setInfo : function () {
        let self = this;

        let msg = Global.FriendMsgList[0]

        Global.FriendMsgList.shift();  // 删除第一位

        this.qrBtn.getComponent(cc.Button).interactable = false
        this.nextBtn.getComponent(cc.Button).interactable = false
        this.addBtn.getComponent(cc.Button).interactable = false
        this.huifu.getComponent(cc.Button).interactable = false

        this.qrBtn.active = Global.FriendMsgList.length == 0
        this.nextBtn.active = Global.FriendMsgList.length != 0

        showLoadingAni()
        
        Friend.checkIsFriend(msg.sendId,'',function (err,data) {
            hideLoadingAni()
            if (!err) {
                cc.log('checkIsFriend',data.results[0].relation)
                let isFriend = data.results[0].relation

                self.qrBtn.getComponent(cc.Button).interactable = true
                self.nextBtn.getComponent(cc.Button).interactable = true
                self.addBtn.getComponent(cc.Button).interactable = true
                self.huifu.getComponent(cc.Button).interactable = true

                self.huifu.active = isFriend
                self.addBtn.active = !isFriend
            } else {
                showAlertBox(data)
            }
        })


        this.info = msg
        this.sendName.string = msg.sendName
        this.sendMsg.string = msg.msg

        GlobEvent.emit('changeFriendMsg');
    },

    // 返回大厅
    onclose: function () {
        this.node.removeFromParent(true);
    },

    // 下一条
    onNext : function () {
        this.setInfo()
    },

    // 加好友
    addFriend : function () {
        showLoadingAni()
        let self = this;
        Friend.addFriend(this.info.sendId,'',function (err,data) {
            hideLoadingAni()
            if (!err) {
                showAlertBox('添加好友成功!')
            } else {
                showAlertBox(data)
            }
        })
    },

    // 快速回复

    qiuckSendMsg : function () {
        let  self = this;
        loadPrefab("hall/friend/sendMsg",function (module) {

            module.getComponent('sendMsgScript').initData({nc : self.info.sendName,userid : self.info.sendId})
            
            self.onclose()
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))
        });
    },
});
