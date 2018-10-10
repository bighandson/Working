
var LoadGame = require('LoadGame');
var WanFa = require('Wanfa');
var config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad : function () {
        pomelo.on('RCMD_forceGameOver',this.msgQuene.bind(this));
        pomelo.on('RCMD_replyForceGameOver',this.msgQuene.bind(this));
        pomelo.on('RCMD_Expend',this.RCMD_Expend.bind(this));
        pomelo.on('RCMD_MatchOver',this.RCMD_MatchOver.bind(this));
        this.node.on('RCMD_GameStart',this.gameStart,this);
        this.node.on('CMD_forceGameOver',this.CMD_forceGameOver,this);
        // this.node.on('RCMD_MatchOver',this.RCMD_MatchOver,this);
        this._animStatus = false;
        this.msgList = [];
    },

    // 初始化参数
    init : function (data) {
        cc.log(data);
        this._currGame = data.currGame;
        this._totalGame = data.totalGame;
        this._roomcode = data.roomcode;
        this._ruleFlag = data.ruleFlag;
        if(wxapi.isInstallWeChat() && data.roomcode){
            this.showInviteBtn(data.currGame == 0);
        }
    },
    RCMD_Expend:function (data) {
        cc.log('CradRoomexpend',data.data)
        let self = this;
        if(data.data.CMD == '001'){
            self.expend = data.data.extData;

        }

    },

    /**
     * 分享给微信好友
     */
    inviteWXFriend : function () {
        var game = LoadGame.getCurrentGame();
        var title =game.name + ' 房号:{0} ({1}局)';

        title = title.format(this._roomcode,this._totalGame);
        var descript =  '我在'
        descript += !!config.appName?config.appName:game.name;
        descript +=','
        descript +=!!game.getWanfa?game.getWanfa(this._ruleFlag,this.expend):WanFa.getWanfa(game,this._ruleFlag);
        descript += ',赶快来加入！'
        cc.log(title,descript);

        if(!!config.magicLink){
            var url = (config.magicLink + '?gameid={0}&roomcode={1}').format(LoadGame.getCurrentGameId(),this._roomcode);
            wxapi.sendWebPageToWxReq(title,descript,url,0);
        }else {
            wxapi.initWXFriend(title,LoadGame.getCurrentGameId(),this._roomcode,descript);
        }
    },

    nextMessage : function () {
        let msg = this.msgList.shift();
        if(!msg){
            this._animStatus = false;
            return;
        }

        let route = msg.route;
        cc.log(msg);
        this[route](msg);
    },

    // 消息队列
    msgQuene : function (data) {
        if(!this._animStatus){
            this._animStatus = true;
            this[data.route](data);
        }else{
            this.msgList.push(data);
        }
    },

    // 显示邀请好友按钮
    showInviteBtn : function (bShow) {
        if(!bShow && !this._wxbtn){
            return;
        }

        if(!this._wxbtn){
            let self = this;
            cc.loader.loadRes('game/common1/CardRoom/texture/invate',cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                self._wxbtn = new cc.Node();
                let sprite = self._wxbtn.addComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
                self._wxbtn.parent = self.node.parent;
                self._wxbtn.y = -200;
                self._wxbtn.on(cc.Node.EventType.TOUCH_END,self.inviteWXFriend,self);
                self._wxbtn.active = !self._isGamePlay && bShow;
            });
        }else {
            this._wxbtn.active = bShow;
        }
    },

    hideInviteBtn : function () {
        var self = this;
        if(!!this._wxbtn){
            // this._wxbtn.active = false;
            this._wxbtn.off(cc.Node.EventType.TOUCH_END,self.inviteWXFriend,this);
            this._wxbtn.removeFromParent(true);
            this._wxbtn = null;
        }
    },

    gameStart : function () {
        this._isGamePlay = true;
        this.hideInviteBtn();
    },

    /**
     * 请求解散房间
     */
    CMD_forceGameOver : function () {
        var game = LoadGame.getCurrentGame();
        var route = game.server + '.CMD_forceGameOver';
        cc.log('CMD_forceGameOver',route);
        PomeloClient.request(route,function (data) {
            cc.log(data);
        });
    },

    /**
     * 转发请求结算房间
     * @param data
     * userid  : 发起结算的userid
     * timeSpan : 发起解散倒计时剩余时间
     */
    RCMD_forceGameOver: function (data) {
        cc.log('RCMD_forceGameOver', data);
        var game = LoadGame.getCurrentGame();
        let self = this;
        let path;
        if (!!game.prefab.dissolve) {
            path = 'game/{0}/prefab/dissolve/dissolve'.format(game.sourcePath);
        } else {
            path = 'style/dissolve/dissolve'
        }
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;

            }
            var node = cc.instantiate(prefab);
            node.parent = self.node.parent;
            node.setLocalZOrder(99100);
            self._agreeDissolve = node.getComponent('dissolveScript');
            self._agreeDissolve.init(data.userid, data.timeSpan);
            self.nextMessage();   // 1s延时
        });
    },

    /**
     *
     * @param data
     */
    RCMD_MatchOver : function (data) {
        if(!!this._agreeDissolve){
            this._agreeDissolve.node.active = false;
            this._agreeDissolve.node.removeFromParent(true);
        }
    },
    /**
     * 转发是否同意解散房间
     * @param data
     */
    RCMD_replyForceGameOver:function(data){
        cc.log('CMD_ReplyForceGameOver : ',data);
        if(!this._agreeDissolve){
            return;
        }
        this._agreeDissolve.changeStatus(data.userid,data.bAgree);
        this.nextMessage();
    },


    onDestroy : function () {
        pomelo.removeAllListeners('RCMD_forceGameOver');
        pomelo.removeAllListeners('RCMD_replyForceGameOver');
    }
});
