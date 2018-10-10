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
        headImg: cc.Sprite,
        nc: cc.Label,
        id: cc.Label,
        ip: cc.Label,
        qianming: cc.Label,
        tongbao: cc.Label,
        jinbi: cc.Label,
        zuanshi: cc.Label,
        sex : cc.Node,
        addFriendBtn : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },

    setData : function (info,cb,isMyFriend) {
        this.info = info
        this.cb = cb
        let  self = this;
        cc.log(isMyFriend)
        let tx = info.tx || '';
        let sexs = info.xb == 1 ? 'man' : 'woman';

        if (!isUrl(tx)) {
            tx = 'commonRes/other/' + sexs;
        }

        loadHead(tx, function (err,spriteFrame) {
            if (err){
                cc.log(err);
                return;
            }
            self.headImg.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.headImg.node.setContentSize(150,150);
        });

        self.nc.string = info.nc;

        self.id.string = info.userid;

        self.qianming.string = info.gxqm;

        for (var i = info.list.length - 1; i >= 0; i--) {
            let ii = info.list[i];
            if (ii.zhlx == 3) {
                self.jinbi.string = ii.zhye
            }else if (ii.zhlx == 4) {
                self.zuanshi.string = ii.zhye
            }
        }

        self.sex.children.forEach(function (item,index) {
            item.ischecked = info.xb == 1
        })

        if (isMyFriend) {
            self.addFriendBtn.active = false
        }
    },

    // 返回大厅
    onclose: function () {
        this.node.removeFromParent(true);
    },

    // 加为好友
    onAdd: function () {
        showLoadingAni()
        let self = this;
        Friend.addFriend(this.info.userid,'',function (err,data) {
            hideLoadingAni()
            if (!err) {
                self.onclose()
                showAlertBox('添加好友成功!')
                if (self.cb) {self.cb(self.info)}
            } else {
                showAlertBox(data)
            }
        })
    },

    // 发送消息
    onSend: function () {
        let  self = this;
        loadPrefab("hall/friend/sendMsg",function (module) {

            module.getComponent('sendMsgScript').initData(self.info)
            
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))
        });
    },
});
