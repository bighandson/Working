var LoadGame = require('LoadGame');
var WanFa = require('Wanfa');
var config = require('Config');
var GamePlayer = require('GamePlayer');
cc.Class({
    extends: cc.Component,

    properties: {
    },

    onLoad: function () {
        pomelo.on('RCMD_forceGameOver', this.msgQuene.bind(this));
        pomelo.on('RCMD_replyForceGameOver', this.msgQuene.bind(this));
        pomelo.on('RCMD_MatchOver', this.RCMD_MatchOver.bind(this));
        pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
        this.node.on('msgQueneStart',this.msgQueneStart.bind(this))
        this.node.on('RCMD_GameStart', this.gameStart, this);
        this.node.on('RCMD_Start', this.gameStart, this);
        this.node.on('CMD_forceGameOver', this.CMD_forceGameOver, this);

        this._animStatus = true;

        this.msgList = [];

    },

    // 初始化参数
    init: function (data,MJGame) {
        cc.log(data);
        let self = this;
        this._currGame = data.currGame;
        this._totalGame = data.totalGame;
        this._roomcode = data.roomcode;
        this._ruleFlag = data.ruleFlag;
        if(MJGame.gameid == 308 || MJGame.gameid == 311){
            return
        }else{
            this._wxbtn = MJGame.gameMenu.getChildByName('gamebtns').getChildByName('yaoqing');
            this._wxbtn.on(cc.Node.EventType.TOUCH_END, self.inviteWXFriend, self);
            if (wxapi.isInstallWeChat()) {
                this.showInviteBtn(data.currGame == 0);
            }
        }


        // this._wxbtn.active =true
    },
    msgQueneStart:function () {
	    if(this.msgQueneisStart){
		    return
	    }
	    this.msgQueneisStart = true
        this._animStatus = false;
        this.nextMessage();
    },

    /**
     * 分享给微信好友
     */
    inviteWXFriend: function () {
        if(!this._wxbtn.active){ return; }

        var game = LoadGame.getCurrentGame();

        if(game.gameid >300){ return }
        let zongren;
        if (this.expend > 0) {
            zongren = ((this.expend & 0xff) >> 1);
        }

        let ren = GamePlayer.getNum();
        let queren = zongren - ren;
        const zhuanhuan = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        // var title = (game.shareName || game.name) + '[房号:{0} ({1}局)]';
        // title = title.format(this._roomcode, this._totalGame);

        // let wanfaStr = game.getWanfa(this._ruleFlag,this.expend);

        // let descript = (game.shareName || game.name);
        // descript += '房号:{0}({1}局)'.format(this._roomcode,this._totalGame);
        // descript += wanfaStr;
        // descript += '  支付 : {0}'.format(wanfaStr.zhifu);


        // this.shareText ='['+wanfaStr+']';   


        var info = game.getInfoForSendFriend(this._ruleFlag,this.expend)

        var desc = game.name + "\n"   // 名称
        desc = desc + '房号: ' + this._roomcode + "\n"  // 房号
        if (info.wanfa != '') {
            desc = desc + '玩法: ' + info.wanfa + "\n"  // 玩法
        }
        desc = desc + '人数: ' + zongren + "人  "+ zhuanhuan[ren] + "缺"+ zhuanhuan[queren] + "\n"  // 人数

        desc = desc + '支付: ' + info.zhifu + "\n"  // 支付

        
        wxapi.sendWxFriend(desc)
        

        // xlapi.sendLinkToXL(title,this.shareText,LoadGame.getCurrentGameId(),this._roomcode)
    },

    nextMessage: function () {
        let msg = this.msgList.shift();
        if (!msg) {
            this._animStatus = false;
            return;
        }

        let route = msg.route;
        cc.log(msg);
        this[route](msg);

    },
    RCMD_Expend: function (data) {
        cc.log('expend', data.data)
        if (data.data.CMD == '001') {
            this.expend = data.data.extData;
        }
    },

    // 消息队列
    msgQuene: function (data) {
        if (!this._animStatus) {
            this._animStatus = true;
            this[data.route](data);
        } else {
            this.msgList.push(data);
        }
    },

    // 显示邀请好友按钮
    showInviteBtn: function (bShow) {
        if (!bShow) {
            return;
        }

        this._wxbtn.active =  bShow;

    },

    hideInviteBtn: function () {
        if (!!this._wxbtn) {
            this._wxbtn.active = false;
            this._wxbtn.off(cc.Node.EventType.TOUCH_END, this.inviteWXFriend, this);
            this._wxbtn.removeFromParent(true);
            this._wxbtn = null;
        }
    },

    gameStart: function () {
        this._isGamePlay = true;
        this.hideInviteBtn();
    },

    /**
     * 请求解散房间
     */
    CMD_forceGameOver: function () {
        var game = LoadGame.getCurrentGame();
        var route = game.server + '.CMD_forceGameOver';
        cc.log('CMD_forceGameOver', route);
        PomeloClient.request(route, function (data) {
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
    RCMD_MatchOver: function (data) {
        if (!!this._agreeDissolve) {
            this._agreeDissolve.node.active = false;
            this._agreeDissolve.node.removeFromParent(true);

        }
    },
    /**
     * 转发是否同意解散房间
     * @param data
     */
    RCMD_replyForceGameOver: function (data) {

        cc.log('CMD_ReplyForceGameOver : ', data);
        if (!this._agreeDissolve) {
            return;
        }
        this._agreeDissolve.changeStatus(data.userid, data.bAgree);
        this.nextMessage();

    },


    onDestroy: function () {
        pomelo.removeAllListeners('RCMD_forceGameOver');
        pomelo.removeAllListeners('RCMD_replyForceGameOver');
        pomelo.removeAllListeners('RCMD_MatchOver');
    }
});
