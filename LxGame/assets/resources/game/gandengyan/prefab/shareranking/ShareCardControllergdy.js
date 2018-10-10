
var GamePlayer = require('GamePlayer');

cc.Class({
    extends: cc.Component,

    properties: {/****xxxx***aaaa****bbbb*****cccc****dddd****/
        contentrank1:cc.Node,
        roomid:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        });
    },/****xxxx***aaaa****bbbb*****cccc****dddd****/

    /**
     *
     * @param data
     */
    show : function (roomuserid,users,roomid) {
        let self = this;
        if(!users){
            return
        }
        users.sort(function (a, b) {
            return b.score - a.score;/****xxxx***aaaa****bbbb*****cccc****dddd****/
        });
        for(let i=0;i<5;i++){
            self.contentrank1.children[i].active = false;
        }
        for(let i = 0;i<users.length;i++){
            self.contentrank1.children[i].active = true;/****xxxx***aaaa****bbbb*****cccc****dddd****/
            var data =GamePlayer.getPlayer(users[i].userid);
            if (!!data.userImage) {
                getSpriteFrameByUrl(data.userImage, function (err, spriteFrame) {
                    if (err) {
                        return;
                    }/****xxxx***aaaa****bbbb*****cccc****dddd****/
                    self.contentrank1.children[i].children[1].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }
            self.contentrank1.children[i].children[1].children[0].children[0].getComponent(cc.Label).string = "{0}({1})".format(data.nick,data.userid);
            self.contentrank1.children[i].children[1].children[0].children[1].getComponent(cc.Label).string = users[i].wins;
            self.contentrank1.children[i].children[3].getComponent(cc.Label).string =users[i].score ;
        }
        self.roomid.getComponent(cc.Label).string = "{0} 房号:{1}".format( self.timeed(),roomid)
    },/****xxxx***aaaa****bbbb*****cccc****dddd****/

    timeed:function () {
        var myDate = new Date()
        let x =myDate.getHours(); //获取当前小时数(0-23)
        let y =myDate.getMinutes(); //获取当前分钟数(0-59)
        if(parseInt(x)<10){
            x= '0'+x
        }
        if(parseInt(y)<10){
            y= '0'+y
        }
        return x+':'+y ;
        //this.time.string = x+':'+y ;
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
        var prePos = this.contentrank1.getPosition();
        this.contentrank1.setPosition(cc.p(0,0));
        captureScreen(this.contentrank1,cc.size(cc.director.getVisibleSize().width, 750),function (err,path) {
            self._isShareing = false;
            self.contentrank1.setPosition(prePos);
            if(err){
                cc.log(err);/****xxxx***aaaa****bbbb*****cccc****dddd****/
                return;
            }
            wxapi.sendImageToWxReq(path,shareTo);
        });
    },
    

    onClose : function () {/****xxxx***aaaa****bbbb*****cccc****dddd****/
        //this.node.active = false;
        this.node.removeFromParent(true);
        //GlobEvent.emit('PREFAB_SHOW');
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
