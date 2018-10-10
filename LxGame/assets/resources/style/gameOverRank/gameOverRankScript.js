var GamePlayer = require('GamePlayer');
var config = require('Config')
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
        view        : cc.Node,
        box : cc.Node,
        shareBg : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },
    show :function (users,count) {
        let self = this;
        if(!users){
            return
        }
        cc.log(users)
        users.sort(function (a, b) {
            return b.score - a.score;
        });
        for(let i=0;i<self.view.children.length;i++){
            self.view.children[i].active = false;
        }
        for(let i = 0;i<users.length;i++){
            self.view.children[i].active = true;
            var data =GamePlayer.getPlayer(users[i].userid);
            cc.log('rank',data)
            getSpriteFrameByUrl(data.userImage, function (err, spriteFrame) {
                if (err) {
                    cc.log(err)
                    return;
                }
                self.view.children[i].getChildByName('tx').getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            self.view.children[i].getChildByName('name').getComponent(cc.Label).string = data.nick;
            self.view.children[i].getChildByName('duijushu').getComponent(cc.Label).string = count;
            self.view.children[i].getChildByName('huoshengju').getComponent(cc.Label).string = users[i].wins;
            self.view.children[i].getChildByName('leiji').getComponent(cc.Label).string = users[i].score;
        }
    },

    onShowShare:function () {
        this.shareBg.active = true;
    },
    /**
     * 分享到微信
     * @param event
     * @param to 0 : 微信好友 1 ： 微信朋友圈
     */
    onShareToWXScene : function (event,to) {
        var self = this;
        if(!!self._isShareing) return;
        self._isShareing = true;/****xxxx***aaaa****bbbb*****cccc****dddd****/
        var shareTo = parseInt(to);
        var prePos = this.box.getPosition();
        this.box.setPosition(cc.p(0,0));
        captureScreen(this.box,cc.size(cc.director.getVisibleSize().width, 750),function (err,path) {
            self._isShareing = false;
            self.box.setPosition(prePos);
            if(err){
                cc.log(err);/****xxxx***aaaa****bbbb*****cccc****dddd****/
                return;
            }
            wxapi.sendImageToWxReq(path,shareTo);
        });
    },

    //退出房间
    closeGmae : function () {
        this.node.removeFromParent(true);
        let backscene =  config.lobbyScene;
        cc.director.loadScene(backscene);
    },

});
