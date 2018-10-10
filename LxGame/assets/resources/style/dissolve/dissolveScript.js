var GamePlayer = require('GamePlayer');
var LoadGame = require('LoadGame');
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
        shenqingRen     : cc.Label,
        wanjia          : cc.Node,
        daojishi            : cc.Label,
        menu : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },
    init:function (applyuserid,time) {
        let self = this;
        let players = GamePlayer.players;
        this.daojishi.string = time||300;
        this.wanjia.children.forEach(function (item,index) {
            let userids = Object.keys(players)
            if(index > userids.length-1){
                item.active = false
            }else{
                let userid = userids[index]
                if(applyuserid == UserCenter.getUserID()){
                    self.menu.active = false;
                }
                if(userid == applyuserid){
                    self.shenqingRen.string = players[userid].nick;
                    self.wanjia.children[index].active = false;
                }else{
                    self.wanjia.children[index].userid = players[userid].userid;
                    item.getChildByName('name').getComponent(cc.Label).string = players[userid].nick;
                    item.getChildByName('id').getComponent(cc.Label).string = players[userid].userid;
                    let tx = players[userid].userImage;
                    let sexs = players[userid].sex ==1 ? 'man':'woman';
                    if (!isUrl(tx)){
                        tx = 'commonRes/other/'+sexs;
                    }
                    getSpriteFrameByUrl(tx, function (err,spriteFrame) {
                        if (err){
                            cc.log(err);
                            return;
                        }
                        item.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                        item.getChildByName('head').setContentSize(150,150);
                    });
                }
            }

        })

        this.schedule(this.timeTick,1.0);
    },
    /**
     *
     * @param userid
     * @param bAgree 0 拒绝 1 同意
     */
    changeStatus : function (userid,bAgree) {
        cc.log('changeStatus : ',userid,bAgree);
        if(userid == UserCenter.getUserID()){  // 收到自己的，隐藏
            this.menu.active = false;
        }
        cc.log(this.wanjia.children.length)
        for(let i =0;i<this.wanjia.children.length;i++){
            if(this.wanjia.children[i].userid == userid ){
                cc.log(i)
                cc.log(this.wanjia.children)
                this.wanjia.children[i].getChildByName('tj').getComponent(cc.Label).string = bAgree? '同意': '拒绝'
                this.wanjia.children[i].getChildByName('tj').color = !bAgree? cc.color(1,160,61) : cc.color(201,91,46)
            }
        }
        if(!bAgree){
            this.scheduleOnce(this.onClose,2.0);
        }
    },


    timeTick : function () {
        this.daojishi.string --;
        if(this.daojishi.string <= 0){
            this.CMD_ReplyForceGameOver(1);         // 超时同意解散房间
            this.onClose();
        }
    },

    // 关闭
    onClose: function () {
        this.node.removeFromParent(true);
        this.unschedule(this.timeTick);
    },

    //同意
    onClickOK : function () {
        this.CMD_ReplyForceGameOver(1);
    },

    //拒绝
    onClickNo : function () {
        this.CMD_ReplyForceGameOver(0);
    },
    CMD_ReplyForceGameOver : function (bAgree) {
        var game = LoadGame.getCurrentGame();
        PomeloClient.request(game.server + '.CMD_ReplyForceGameOver',{
            bAgree : bAgree
        },function (data) {/****xxxx***aaaa****bbbb*****cccc****dddd****/
        cc.log(data);
        });
    },


});
