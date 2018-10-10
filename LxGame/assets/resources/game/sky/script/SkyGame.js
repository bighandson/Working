const CfgGame = require('CfgGame');
var Loadgame = require('LoadGame');
var GamePlayer = require('GamePlayer');
var Porp = require("Prop");
const SkyCommand = require('SkyCommand');
var config = require('Config');
var WanFa = require('Wanfa');
var SoundCtrl = require('SkySound');
var Friend = require('Friend')
var hintSpritesEnum = {
    jiaoSprite: 0,
    bujiaoSprite: 1,
    qiangSprite: 2,
    buqiangSprite: 3,
    mingpaiSprite: 4,
    jiabeiSprite: 5,
    bujiabeiSprite : 6,
};
var stepEnum = {
    mingpaiStep: 1,
    jiaoStep : 2,
    qiangStep: 3,
    jiabeiStep: 4,
    chupaiStep: 5,
    jieshanStep : 6,
};
const MAX_PLAYERS = 4;
cc.Class({
    extends: cc.Component,

    properties: {
        players:{
            default:[],
            type:cc.Node
        },
        difenLabel : cc.Label,
        beishuLabel:cc.Label,
        normalButtons:cc.Node,
        startBox:cc.Node,
        mingpaiStartBtn:cc.Node,
        jiaodizhuBox:cc.Node,
        mingpaiBox:cc.Node,
        roommenu : cc.Node,
        roomInfo:cc.Node,
        roomIdLabel:cc.Label,
        wanfaLabel : cc.Label,
        roomButton:cc.Node,
        voiceTipsPrefab:cc.Prefab,
        lookAnimPrefab :cc.Prefab,
        playerInfoDialogPrefab:cc.Prefab,
        propAnimPrefab:cc.Prefab,
        chatMsgBubblePrefab:cc.Prefab,
        chatNode:cc.Node,
        cardJushu:cc.Node,
        exitButton:cc.Node,
        colseNode:cc.Node,
        chupaiHintKuangSprite:cc.SpriteFrame,
        headBgSprite:cc.SpriteFrame,
        // partenerHandLayout:cc.Node,
        hintSprites: {
            default:[],
            type:cc.SpriteFrame
        },
        dipaiLayout : cc.Node,
        dipaiKuangNode : cc.Node,
        effectNode : cc.Node

    },

    // use this for initialization
    onLoad: function () {
        // this.node.on('RCMD_initParam',this.RCMD_initParam.bind(this));
        // this.node.on('RCMD_Expend',this.RCMD_Expend.bind(this));
        showLoadingAni();
        SkyManager.controller = this;
        SkyManager.designResolution = this.node.parent.getComponent(cc.Canvas).designResolution;

        this.node.on("msg_lightStart",this.lightStart.bind(this));
        this.node.on("msg_onceAgain",this.ready.bind(this));
        this.node.on("resultClose",this.resultClose.bind(this));

        GlobEvent.on('chuntianFinished',this.chunTianAniFinished.bind(this));
        // this.hintSprites = [];
        this.loadRes();
        GamePlayer.reset();
        this.addListeners();
        let path = 'hall/friendInfo/friendInfo'
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            self.playerMessage = prefab;
        });
        for(let i=0;i<MAX_PLAYERS;i++)
        {
            this.players[i].on(cc.Node.EventType.TOUCH_START,this.onPlayer,this);
        }
        this.isMingpaiStart = 0;
        this.timeLimit = false;
        this.isfeizha = false;
        this.isfeiwang = false;
        this.isshuangfei = false;
        this.myIsfeizha = false;
        this.myIsfeiwang = false;
        this.myshuangfei = false;
        this.dizhuID = 0;
        this.isfapaiOver = false;
        SkyManager.autoplaySign = false;
        this.jiaotime = 1
    },

    lightStart :function (event) {
        var msg = {
            cmd : SkyCommand.REQ_CMD.CMD_LightStart,
            data:{
                userid:UserCenter.getUserID(),
            }


        };
        this.sendCmd(".CMD_Command", msg);
    },
    ready :function (event) {
        this.sendCmd('.CMD_Ready');
    },

    resultClose :function () {
        this.startBox.active = true;
    },
    chunTianAniFinished : function () {
        cc.log('------------------chunTianAniFinished');

        let self = this;
        this.cancelAutoPlay()
        let Controller;
        if (self.winStatus) {
            cc.log(self.resultprefab);
            self.resultprefab.parent = self.node.parent;
            Controller = self.resultprefab.getComponent("SkyResultCtrl");
        } else {
            cc.log(self.loseResultprefab);
            self.loseResultprefab.parent = self.node.parent;
            Controller = self.loseResultprefab.getComponent("SkyResultCtrl");
        }

        // var result = this.resultprefab.getChildByName("resultNode");
        // let resultprefab = this.resultprefab.getChildByName("controller");
        Controller.showResult(this.resultData);

    },
    onClickJiaodizhuOrBujiao:function(event, jiaobujiao)
    {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var msg = {

            cmd : SkyCommand.REQ_CMD.CMD_CallLandOwner,
            data:{
                userid:UserCenter.getUserID(),
                isCall : jiaobujiao,
                // tableid: this.tableId,
                // seatid: this.seatId,
            }


        };
        // this.showClock(UserCenter.getUserID(),false);
        this.sendCmd(".CMD_Command", msg);
        node.parent.active = false;

    },
    onClickQiangdizhuOrBuqiang:function(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var msg = {
            cmd : SkyCommand.REQ_CMD.CMD_GrabLandOwner,
            data:{
                userid:UserCenter.getUserID(),
                isGrab : customEventData,
            }


        };
        this.sendCmd(".CMD_Command", msg);
        node.parent.active = false;

    },
    onClickStartGame:function(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        this.sendCmd('.CMD_Ready');
        // node.active = false;
        node.parent.active = false;

    },

    onClickMingpaiKaishi:function(event, customEventData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        // var msg = {
        //     cmd : SkyCommand.REQ_CMD.CMD_LightCard,
        //     data:{
        //         userid:UserCenter.getUserID(),
        //         isSee : 1,
        //         times : 5
        //     }
        // };
        var msg = {
            cmd : SkyCommand.REQ_CMD.CMD_LightStart,
            data:{
                userid:UserCenter.getUserID(),
            }


        };
        this.sendCmd(".CMD_Command", msg);
        node.parent.active = false;
    },
    onClickMingpai:function(event, mingpaiData) {
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var msg = {
            cmd : SkyCommand.REQ_CMD.CMD_LightCard,
            data:{
                userid:UserCenter.getUserID(),
                isSee : 0,
                times : 0
            }


        };
        this.sendCmd(".CMD_Command", msg);
        node.parent.active = false;
    },
    onClickJiabeiOrBujiaobei:function(event, jiabei) {
        this.showClock(UserCenter.getUserID(),false);
        var node = event.target;
        var button = node.getComponent(cc.Button);
        var beishu = 0;
        if (jiabei) {
            beishu = 2;
        }
        var msg = {
            cmd : SkyCommand.REQ_CMD.CMD_AddTimes,
            data:{
                userid:UserCenter.getUserID(),
                isAdd : jiabei,
                times : beishu
            }
        };
        this.sendCmd(".CMD_Command", msg);
        node.parent.active = false;
    },

    sendCmd : function (route,param) {

        cc.log("客户端下发命令------------",route,JSON.stringify(param));
        if (!!param) {
            PomeloClient.request(this.game.server + route,param,function (data) {
                cc.log(JSON.stringify(data));
            });
        } else {
            PomeloClient.request(this.game.server + route, function (data) {
                cc.log(JSON.stringify(data));
            });
        }

    },
    CMD_Ready:function()
    {
        var route = this.game.server + '.CMD_Ready';
        PomeloClient.request(route);
    },
    loadRes:function()
    {
        this.loadCount = 0;
        let self = this;
        cc.loader.loadRes("game/sky/prefab/SkypokerTexture/pokers", cc.SpriteAtlas, function (err, atlas) {
            if(err){
                cc.log(err);
                return;
            }
            SkyManager.pokersAtlas = atlas;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/sky/prefab/SkypokerSpriteS',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.pokerPrefabS = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
        cc.loader.loadRes("game/sky/prefab/SkypokerTexture/pokers_s", cc.SpriteAtlas, function (err, atlas) {
            if(err){
                cc.log(err);
                return;
            }
            SkyManager.pokersAtlasS = atlas;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/sky/prefab/SkypokerSprite',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.pokerPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
        cc.loader.loadRes('game/sky/prefab/SkypokerSpriteSS',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.pokerPrefabSS = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/sky/prefab/SkyhandCardPrefab',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.HandCardPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
        cc.loader.loadRes('game/sky/prefab/SkyWinResult',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.resultPrefab = prefab;
            self.resultprefab = cc.instantiate(prefab);
            self.loadCount++;
            self.checkLoadRes();
        });
        cc.loader.loadRes('game/sky/prefab/SkyLoseResult',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.loseResultPrefab = prefab;
            self.loseResultprefab = cc.instantiate(prefab);
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/sky/prefab/SkycutcardPre',cc.Prefab,function (err,prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SkyManager.cutcardPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
    },

    checkLoadRes:function()
    {

        if(this.loadCount == 9)
        {
            ///////-----cc.log("res completed");
            SkyManager.isResLoadComplete = true;

            this.initGame();
        }
    },



    initGame:function()
    {
        cc.log('initgame')
        this.node.on('DISPLAY_VOICE',this.displayVoice,this);
        this.node.on('HIDE_VOICE',this.hideVoice,this);

        this.node.on('SHOW_CHAT_MSG',this.showChatMsg,this);
        this.node.on('HIDE_CHAT_MSG',this.hideChatMsg,this);

        this.node.on('SHOW_DAO',this.showDao,this);
        this.node.on('HIDE_DAO',this.hideDao,this);

        this.node.on("OPEN_AUTO_PLAY",this.openAutoPlay,this);

        pomelo.on('RCMD_Expend',this.RCMD_Expend.bind(this));
        pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));
        GlobEvent.on('LANGUAGE_CHANGE',this.languageChange.bind(this));

        for(let i = 0; i < 4; i++){
            this.players[i].on(cc.Node.EventType.TOUCH_START,this.onPlayer,this);
        }
        let game = Loadgame.getCurrentGame();

        let route = game.server + '.startGame';
        PomeloClient.request(route, function (data) {
            cc.log(route + '=====', data)
        });
        hideLoadingAni();
    },
    initCurrGame:function () {
        for(var i=1;i<4;i++) {
            var player = this.players[i];
            var mingpaiLayout = player.getChildByName("mingpaiLayout");
            mingpaiLayout.removeAllChildren();
            player.getChildByName("outCardLayout").removeAllChildren();
        }
        if(this.handCardprefab==null)
        {
            this.handCardprefab = cc.instantiate(SkyManager.HandCardPrefab);
            this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
            this.handCardprefab.getChildByName("control").getComponent("SkyhandCard").roomType = this.roomType;
        }
        let handCard=this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("SkyhandCard");
        handCardController.gameBtnLayout.active=false;
        handCardController.handCardLayout.removeAllChildren(true);
        handCardController.outCardLayout.removeAllChildren(true);
        var a = [];
        this.showDipai(this.dipaiLayout,[]);

    },
    RCMD_Expend:function (data) {
        cc.log('game expend');
        let self = this;
        if(data.data.CMD == '001'){
            self.expend = data.data.extData;
            var game = LoadGame.getCurrentGame();
            cc.log('ruleFlag:',this.ruleFlag,'expend:',this.expend);
            var wanfaDes =!!game.getWanfa?game.getWanfa(this.ruleFlag,this.expend):WanFa.getWanfa(game,this.ruleFlag);
            cc.log(wanfaDes);
            this.wanfaLabel.string = wanfaDes;

        }else if(data.data.CMD == '002'){
            let expend = data.data;
            let arr = expend.ar;
            UserCenter.setList(arr);
            GlobEvent.emit('update_UserCenter')
        }else if (data.data.CMD == '10000') {
            cc.log('10000')
            this.minpoint = data.data.minpoint;
            this.maxpoint = data.data.maxpoint;
            cc.log(this.minpoint)
        }
        else if(data.data.CMD == '10001'){
            let expend = data.data;
            self.difenLabel.string = expend.basemoney;
        }else if (data.data.CMD == '10003') {
            //更新游戏豆
            let chair = this.getChairByUserid(data.data.UID);
            let money = data.data.Money;
            this.players[chair].getChildByName("totalScore").getComponent(cc.Label).string =formatNum(money);
            UserCenter.setYouxibiNum(money);
        }else if (data.data.CMD == '10004') {
            //更新游戏豆
            let users = data.data.users
            for (let i = 0; i < users.length; i++) {
                let chair = this.getChairByUserid(users[i].userid);
                let money = users[i].zhye;
                this.players[chair].getChildByName("totalScore").getComponent(cc.Label).string = formatNum(money);
                if (users[i] == UserCenter.getUserID()) {
                    UserCenter.setYouxibiNum(money);
                }
            }
        }

    },

    languageChange:function (event) {
        this.bLanguageSound = event;
        if(!this.soundCtrl){
            return;
        }
        this.soundCtrl.setPlayLanguageSound(this.bLanguageSound);
        ///////-----cc.log(this.bLanguageSound)
        //cc.sys.localStorage.setItem('');
    },

    addListeners:function()
    {
        for(var i = 0;i<SkyManager.msgRCMDQueue.length;i++)
        {
            var msg = SkyManager.msgRCMDQueue[i];
            /////////-----cc.log(msg);
            this.node.on(msg,this[msg].bind(this));
        }

        for(var i = 0;i<SkyManager.msgRCMDList.length;i++)
        {
            var msg = SkyManager.msgRCMDList[i];
            this.node.on(msg,this[msg].bind(this));
        }
    },

    removeListeners:function()
    {
        for(var i = 0;i<SkyManager.msgRCMDQueue.length;i++)
        {
            var msg = SkyManager.msgRCMDQueue[i];
            ///////-----cc.log(msg);
            this.node.off(msg,this[msg].bind(this));
        }

        for(var i = 0;i<SkyManager.msgRCMDList.length;i++)
        {
            var msg = SkyManager.msgRCMDList[i];
            this.node.off(msg,this[msg].bind(this));
        }
        GlobEvent.removeAllListeners('LANGUAGE_CHANGE');
    },

    onPlayer:function(event){
        let player = event.currentTarget;
        this.playerInfoDialog = cc.instantiate(this.playerInfoDialogPrefab);
        this.playerInfoDialog.parent = this.node.parent;

        if(player.chair == 0)
        {
            this.playerInfoDialog.x = player.x  + this.playerInfoDialog.width / 2 + player.width / 2-50;
            this.playerInfoDialog.y = player.y -20 ;
            if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height)
            {
                this.playerInfoDialog.y = this.playerInfoDialog.height;
            }
        }else if(player.chair == 1)
        {
            this.playerInfoDialog.x = player.x  - this.playerInfoDialog.width / 2 - player.width / 2+50;
            this.playerInfoDialog.y = player.y -20 ;
            if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height)
            {
                this.playerInfoDialog.y = this.playerInfoDialog.height;
            }

        }else if(player.chair == 2)
        {
            this.playerInfoDialog.x = player.x +330;
            this.playerInfoDialog.y = player.y  - this.playerInfoDialog.height / 2 - player.height / 2+150;
            if(this.playerInfoDialog.x > 1334 - this.playerInfoDialog.width/2)
            {
                this.playerInfoDialog.x = 1334 / 2;
            }
        }else {
            this.playerInfoDialog.x = player.x  + this.playerInfoDialog.width / 2 + player.width / 2-50;
            this.playerInfoDialog.y = player.y -20 ;
            if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height)
            {
                this.playerInfoDialog.y = this.playerInfoDialog.height;
            }
        }

        ///////-----cc.log("x,y "+this.playerInfoDialog.x+","+this.playerInfoDialog.y);
        let playerinfo = GamePlayer.getPlayer(player.userid);
        let lpayerInfoController = this.playerInfoDialog.getComponent("playerInfoDialogController");
        lpayerInfoController.onShow(playerinfo,this.roomType);
    },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RCMD_Kick:function(event){
        cc.log("RCMD_Kick");
        ///////-----cc.log(event);
    },



    RCMD_signup:function(event){
        cc.log("RCMD_signup");
        ///////-----cc.log(event);
    },

    RCMD_MobileSignUp:function(event){
        cc.log("RCMD_MobileSignUp");
        ///////-----cc.log(event);
    },

    RCMD_PlayerStatus:function(event)
    {

        cc.log("RCMD_PlayerStatus",JSON.stringify(event.detail));
        let data = event.detail;
        let userid = data.userid;
        let status = data.status;
        let chair = this.getChairByUserid(userid);
        this.setOfflineStatus(chair,status);

    },



    RCMD_ServerHeartOut:function(event){
        cc.log("RCMD_ServerHeartOut");
        ///////-----cc.log(event);
    },

    RCMD_Timeout:function(event){
        cc.log("RCMD_Timeout");
        ///////-----cc.log(event);
    },

    RCMD_close:function(event){
        cc.log("RCMD_close");
        ///////-----cc.log(event);
    },



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RCMD_initParam:function(event)
    {
        //hideLoadingAni();
        cc.log("RCMD_initParam");
        ///////-----cc.log(data);

        let data = event.detail;
        this.roomType = data.roomType;
        this.gameid = data.gameid;
        this.ruleFlag = data.ruleFlag;
        this.roomuserid = data.roomuserid;//data.roomuserid;

        if(this.roomType < 2){
            /*this.roomInfo.children[0].active = false;
             this.roomInfo.children[1].active = true;
             this.roomInfo.children[2].getComponent(cc.Label).string = data.basescore;*/

        }else if(this.roomType == 2){
            this.roomInfo.children[0].active = true;
            this.roomInfo.children[1].active = false;
            this.roomInfo.children[2].getComponent(cc.Label).string = data.roomcode;
        }

        if(this.roomType != 2)
        {

            this.roommenu.getChildByName("content").getChildByName("disRoomButton").active = false;
            this.chatNode.getChildByName("speech").active = false;
        }

        this.chatNode.active = this.roomType < 20;

    },

    InitData:function()
    {
        this.outCardType=0;
        this.outcardseatid=0;
        this.num=2;
        this.length=0;
        this.X = 1;
        this.PokScore = 0;
        this.opUserId = 0;
        this.isfapaiOver = false;
    },
    // showFenZCard
    xianshiFen : function () {
        let data = this.fendata;
        cc.log('分牌',data)
        // this.showFenZCard(data);
    },
    // addfenpai :function (arr) {
    //     for(let i=0;i<arr.length;i++){
    //         if((arr[i]&0x3F) == 0x05){
    //             this.fendata[0].push(arr[i])
    //         }else if((arr[i]&0x3F) == 0x0A){
    //             this.fendata[1].push(arr[i])
    //         }else if((arr[i]&0x3F) == 0x0D){
    //             this.fendata[2].push(arr[i])
    //         }
    //     }
    //     // this.xianshiFen();
    // },

    showClock : function (userid,isshow,time) {
        if (this.timeLimit == false){
            return
        }
        if (isshow) {
            let opChair = this.getChairByUserid(userid);
            this.opChair = opChair;
            var opPlayer = this.players[opChair];
            var clockNode = opPlayer.getChildByName("clock");
            clockNode.active = true;
            this.clockLabel = clockNode.getChildByName('clockLabel').getComponent(cc.Label);
            this.showtime(time);
        } else {
            let opChair = this.getChairByUserid(userid);
            var opPlayer = this.players[opChair];
            var clockNode = opPlayer.getChildByName("clock");
            clockNode.active = false;
            this.clockLabel = null;
            this.timeCount = 0;
            this.unschedule(this.callback);
            if (userid == UserCenter.getUserID()) {
                this.jiaodizhuBox.active = false;
            }
        }

    },

    showtime:function(time)
    {
        this.timeCount = time;
        this.clockLabel.string = this.timeCount;
        this.schedule(this.callback, 1);
        //this.schedule(this.Btncallback,0.01);
    },
    callback:function () {
        this.timeCount--;

        cc.log("----------------step",this.step);
        this.clockLabel.string = this.timeCount;

        if (this.timeCount == 0) {

            this.clockLabel.node.parent.active = false;
            //时间到了
            this.unschedule(this.callback);
            if (this.opChair == 0) {
                if (this.step == stepEnum.jiaoStep) {
                    this.jiaodizhuBox.active = false;
                    var msg = {

                        cmd : SkyCommand.REQ_CMD.CMD_CallLandOwner,
                        data:{
                            userid:UserCenter.getUserID(),
                            isCall : 0,
                        }

                    };
                    this.sendCmd(".CMD_Command", msg);
                } 
            }
            if (this.step = 0 ) {

            }
            // this.overTime();
            // if (this.roomType < 2) {
            //     if (this.gameBtnLayout.getChildByName("noCard").active == false ) {
            //         this.onClickTips();
            //         this.onClickOutCard();
            //     } else {
            //         this.onClickNoCard();
            //     }
            // }
        }
    },
    RCMD_Command:function(event)
    {
        let data = event.detail;
        let cmd = data.cmd;
        let retData = data.data;
        cc.log("服务端下发(game)------RCMD_Command", parseInt(data.cmd,16),JSON.stringify(event.detail));
        if(cmd == SkyCommand.RESP_CMD.RCMD_INITDATA)
        {
            cc.log("RCMD_INITDATA");
            // cc.log(retData);
            this.roomType = retData.roomType;
            this.gameid = retData.gameid;
            this.difenLabel.string = retData.basescore;

            this.opChair = 0;
            this.game = config.getGameById(this.gameid);
            SettingMgr.stopBg();
            SettingMgr.playBg(this.game.backMusic);
            this.soundCtrl = this.node.addComponent(this.game.sound || 'DdzSound');  // 默认普通话
            this.node.addComponent(SoundCtrl);
            // SoundCtrl.playJiao(1,1);

            // require('Wanfa')
            if(this.roomType < 2){
                this.timeLimit = true
                this.roomInfo.active = false;
            }else if(this.roomType == 2){ //
                //
                this.roomInfo.active = true;
                this.roomInfo.children[1].active = false;
                this.roomIdLabel.getComponent(cc.Label).string = '房间号:' + retData.roomcode;
                this.roomIdLabel.node.active = true;
                /*this.Info.children[0].getComponent(cc.Label).string = SkyManager.rule.playerNum;
                this.Info.children[0].active = true;
                this.Info.children[1].active = true;
                this.Info.children[1].getComponent(cc.Label).string = SkyManager.rule.cardSendNum;*/
                this.ruleFlag = retData.ruleFlag;
                // this.isXianzhi = (this.ruleFlag>>2);
                this.expend = retData.expend;
                var game = Loadgame.getCurrentGame();
                cc.log('ruleFlag:',this.ruleFlag,'expend:',this.expend);
                let timeL = this.ruleFlag & 0x02;
                if (timeL == 2)
                {
                    this.timeLimit = true
                }
                let feizha = this.ruleFlag & 0x04;
                if (feizha == 4){
                    this.isfeizha = true;
                }
                let feiwang = this.ruleFlag & 0x08;
                if (feiwang == 8){
                    this.isfeiwang = true;
                }

                if(this.isfeizha && this.isfeiwang){
                    this.isshuangfei = true
                }
        

                var wanfaDes =!!game.getWanfa?game.getWanfa(this.ruleFlag,this.expend):WanFa.getWanfa(game,this.ruleFlag);
                cc.log(wanfaDes);
                this.wanfaLabel.string = wanfaDes;

                this.cardJushu.active = true;
                if(retData.currGame == 0)
                {
                    this.roomButton.active = true;
                }
                this.curGame = retData.currGame;
                this.refreshJushu(retData.currGame,retData.totalGame);
                this.cardRoomInitFlag = false;
                if (!this.cardRoomInitFlag) {
                    var roomcontroller = this.addComponent("DdzCardRoomController");
                    roomcontroller.init(data);
                    this.cardRoomInitFlag = true;
                }

            }

            if(this.roomType != 2)
            {
                this.roommenu.getChildByName("content").getChildByName("disRoomButton").active = false;
                this.chatNode.getChildByName("speech").active = false;
            }
            this.InitData();

            this.chatNode.active = this.roomType < 20;
        } else if (cmd == SkyCommand.RESP_CMD.RCMD_WhoCall){
            this.step = stepEnum.jiaoStep;
            cc.log("系统指定叫牌",data)
            let userid = retData.userid;
            let chair = this.getChairByUserid(userid);
            let player=this.players[chair];
            var effectNode=player.getChildByName("effectNode");
            var timeCallback1 = function (dt) {
                this.showClock(userid,true,10);
                if(chair == 0){
                    this.jiaodizhuBox.active = true;
                }
            };
            this.scheduleOnce(timeCallback1, this.jiaotime);
            
        }else if (cmd == SkyCommand.RESP_CMD.RCMD_CallLandOwner) {
            cc.log("RCMD_CallLandOwner");
            this.isfapaiOver = true
            let userid = retData.userid;
            let chair = this.getChairByUserid(userid);
            let player=this.players[chair];
            var opPlayerInfo = GamePlayer.getPlayer(userid);
            var effectNode=player.getChildByName("effectNode");
            if(this.isfeizha && this.isfeiwang == false ){
                if (userid == UserCenter.getUserID()&& retData.isCall == 0){
                    this.myIsfeizha = true;
                }
                this.setIsFei(chair,retData.isCall == 0,1)
            }
            if(this.isfeiwang && this.isfeizha == false){
                if (userid == UserCenter.getUserID() && retData.isCall == 0){
                    this.myIsfeiwang = true;
                }
                this.setIsFei(chair,retData.isCall == 0,2)
            }
            if (this.isshuangfei){
                if (userid == UserCenter.getUserID()&& retData.isCall == 0){
                    this.myshuangfei = true;
                }
                this.setIsFei(chair,retData.isCall == 0,3)
            }
            this.showClock(userid,false);

            if (retData.isCall) {
                this.setHintNode(chair,true,hintSpritesEnum.jiaoSprite);
                this.soundCtrl.playAboutLandOwner(2,opPlayerInfo.sex);
            } else {
                this.setHintNode(chair,true,hintSpritesEnum.bujiaoSprite);
                this.soundCtrl.playAboutLandOwner(1,opPlayerInfo.sex);
            }
            if (retData.dizhu) {
                // this.dipaiKuangNode.active = true;
                
                let dizhuChair = this.getChairByUserid(retData.dizhu);
                this.setIsDizhu(dizhuChair,true,retData.callsort+1)
                for(var index = 0;index < 4;index++)
                {
                    this.setHintNode(index,false);
                    let NUMSprite = this.players[index].getChildByName("NUM");
                    if (index == dizhuChair) {
                        NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 33;
                    }
                }
                this.showDipai(this.dipaiLayout,retData.dzcards);
                if (dizhuChair == 0) {
                    this.addDipai(retData.dzcards);
                }
                // this.showClock(UserCenter.getUserID(),true,10);
                this.clockLabel = this.players[0].getChildByName("clock").getChildByName('clockLabel').getComponent(cc.Label);
                // this.showtime(5);
            } else {
                if(retData.nextid) {
                    let nextChair = this.getChairByUserid(retData.nextid);
                    this.showClock(retData.nextid,true,10);
                    if(nextChair == 0) {
                        this.jiaodizhuBox.active = true;
                    } 
                }
            }

        } 
        else if (cmd == SkyCommand.RESP_CMD.RCMD_GameStart)
        {
            cc.log("RCMD_GameStart");

            cc.log(retData);
            
            for(let index = 0;index < 4;index++)
            {
                this.setGameStartStatus(index);
            }
            this.jiaotime = 4
            this.soundCtrl.playStart();
            this.initCurrGame();
            this.rank=0;
            this.refreshJushu(retData.currGame,retData.totalGame);

            this.InitData();

            SkyManager.rule.setMsgBlocked(false);


        } else if (cmd == SkyCommand.RESP_CMD.RCMD_SendTimesInfo) {
            cc.log('RCMD_SendTimesInfo');
            this.beishuLabel.string = retData.gametimes;

        } else if (cmd == SkyCommand.RESP_CMD.RCMD_SendPlayerInfo){
            cc.log('RCMD_SendPlayerInfo');
            this.step = retData.step;

            if (retData.users.length == 4) {
                if (retData.step == 2) {
                    this.showDipai(this.dipaiLayout,retData.cardarray);
                    for(var i = 0; i < retData.users.length; i++)
                    {
                        let user = retData.users[i];
                        let chair = this.getChairByUserid(user.userid);
                        if(user.isLandOwner > 0){
                            this.dizhuID = user.userid;
                        }
                        this.setIsDizhu(chair,user.isLandOwner > 0,retData.callsort+1);
                        if (this.isfeizha && this.isfeiwang== false){
                            if (user.userid == UserCenter.getUserID() && user.calledLandOwner == 0 ){
                                this.myIsfeizha = true;
                            }
                            this.setIsFei(chair,user.calledLandOwner == 0,1)
                        }
                        if (this.isfeiwang && this.isfeizha== false){
                            if (user.userid == UserCenter.getUserID() && user.calledLandOwner == 0 ){
                                this.myIsfeiwang = true;
                            }
                            this.setIsFei(chair,user.calledLandOwner == 0,2)
                        }
                        if (this.isshuangfei){
                            if (user.userid == UserCenter.getUserID() && user.calledLandOwner == 0 ){
                                this.myshuangfei = true;
                            }
                            this.setIsFei(chair,user.calledLandOwner == 0,3)
                        }
                    }
                }

            } 
        }
        else if(cmd == SkyCommand.RESP_CMD.RCMD_SendLightCardID)
        {
            cc.log('RCMD_SendLightCardID');
            var Id1 = retData.uid1;
            var Id2 = retData.uid2;
            var chair1 = this.getChairByUserid(Id1);
            var chair2 = this.getChairByUserid(Id2);
            if(chair1==chair2||(chair1+2)==chair2||(chair1-2)==chair2){
                this.showCardNUM();
            }

            var player1 = this.players[chair1];
            var player2 = this.players[chair2];

            var node1 = player1.getChildByName('LightCard');
            var node2 = player2.getChildByName('LightCard');

            var position1 = player1.getChildByName('LightCard').getPosition();
            var position2 = player2.getChildByName('LightCard').getPosition();
            if(Id1==Id2)
            {
                if(chair2!=1)
                {
                    position2 = cc.p(position2.x+100,position2.y);
                }
                else
                {
                    position2 = cc.p(position2.x-100,position2.y);
                }
            }

            var wPos1 = node1.convertToWorldSpaceAR(position1);
            var wPos2 = node2.convertToWorldSpaceAR(position2);


            var lightcard = this.cutcardPrefab.getChildByName('lightcard');
            cc.log('XXXXXXXXXXXxlightcard',lightcard);
            position1 = lightcard.convertToNodeSpaceAR(wPos1);
            position2 = lightcard.convertToNodeSpaceAR(wPos2);

            var BigLight =lightcard.children[0];
            var SmallLight = lightcard.children[1];
            if(SkyManager.rule.playerNum==4){
                SmallLight.active = true;
            }


            var Action1 = cc.spawn(cc.moveTo(0.5,position1),cc.rotateBy(0.5,360));
            var Action2 = cc.spawn(cc.moveTo(0.5,cc.p(position2.x,position2.y)),cc.rotateBy(0.5,360));


            BigLight.runAction(cc.sequence(Action1,cc.delayTime(1.5),cc.callFunc(function(){
                BigLight.removeFromParent();
                SkyManager.rule.setMsgBlocked(false);
            })));
            SmallLight.runAction(cc.sequence(cc.delayTime(0.1),Action2,cc.delayTime(1.4),cc.callFunc(function(){
                SmallLight.removeFromParent();
            })));
        }else if (cmd == SkyCommand.RESP_CMD.RCMD_SendCard)
        {
            cc.log('RCMD_SendCard');
            cc.log(retData);

            let userId=retData.userid;

            let card = retData.ar;
            let cardnum = retData.cardscount;
            var chair=this.getChairByUserid(userId);
            let player=this.players[chair];
            this.setGameStartStatus(chair);

            if(this.handCardprefab==null)
            {
                this.handCardprefab = cc.instantiate(SkyManager.HandCardPrefab);
                this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
                this.handCardprefab.getChildByName("control").getComponent("SkyhandCard").roomType = this.roomType;
                this.handCardprefab.getChildByName("control").getComponent("SkyhandCard").timeLimit = this.timeLimit;
                // cc.log('---------房间时间限制----------',this.timeLimit)
            }else{
                this.handCardprefab.getChildByName("control").getComponent("SkyhandCard").timeLimit = this.timeLimit;
                // cc.log('---------房间时间限制----------',this.timeLimit)
            }


            var isPlayAni = retData.aniflag;
            if (chair != 0) {
                let NUMSprite = player.getChildByName("NUM");
                NUMSprite.active = true;
                NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = cardnum;
            }

            if (retData.isGameOver) {
                if((chair != 0 && cardnum >0))
                {
                    var mingpaiLayout = player.getChildByName("mingpaiLayout");
                    mingpaiLayout.removeAllChildren();
                    this.showOutCard(mingpaiLayout,card,3,chair);
                }
            } else {
                // if((chair != 0))
                // {
                //     var mingpaiLayout = player.getChildByName("mingpaiLayout");
                //     mingpaiLayout.removeAllChildren();
                //
                //     // this.showMingpaiLayout(mingpaiLayout,card);
                //     this.showOutCard(mingpaiLayout,card,3,chair);
                // }
                if(userId==UserCenter.getUserID())
                {
                    // card = [48,49,50,51,64,65,66,67,80,81,82,83,96,97,98,99,112,113,114,115,240,241,242,243,17];
                    // card = [176,177,178,179,192,193,194,195,208,209,210,211,224,225,226,227,240,241,242,243,240,48,49,17];
                    // card = [146,147,177,178,179,160,161,193,194,195,208,209,210,211,224,225,226,227,242,243,240,48,16,17];
                    for(let index = 0;index<card.length;index++)
                    {
                        card[index] = SkyManager.getCardTypeNum(card[index]);
                    }

                    this.showHandCard(card,isPlayAni);
                    if(isPlayAni==1)
                    {
                        for(var index = 0;index < 3;index++)
                        {
                            this.setHintNode(index,false);
                        }
                        // this.mingpaiBox.active = true;
                        var timeCallback = function (dt) {
                            this.soundCtrl.playFapai();
                        };
                        // NUMSprite.active=false;
                        this.scheduleOnce(timeCallback, 0.7);
                    }
                }
                else
                {
                    // if(cardnum>0&&isPlayAni!=1)
                    // {
                    //     NUMSprite.active=true;
                    // }
                    SkyManager.rule.setMsgBlocked(false);
                }
            }
        }
        else if (cmd == SkyCommand.RESP_CMD.RCMD_CleanCard)
        {
            cc.log("RCMD_CleanCard");
            cc.log(retData);
            let CleanUserId = retData.userid;
            let chair = this.getChairByUserid(CleanUserId);
            let outcard=this.players[chair].getChildByName("outCardLayout");
            outcard.removeAllChildren(true);
            if(CleanUserId == UserCenter.getUserID())
            {
                var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
                outcardLayout.removeAllChildren(true);
            }
            SkyManager.rule.setMsgBlocked(false);
        }
        //该谁出牌
        else if (cmd == SkyCommand.RESP_CMD.RCMD_First)
        {
            cc.log('RESP_CMD.RCMD_First')
            this.isGameStart = true;
            let firstID=retData.userid;
            this.step = stepEnum.chupaiStep;
            this.firstSendCardID = retData.userid;
            if (firstID != UserCenter.getUserID()) {
                this.showClock(firstID,true,retData.playtime-2);
            }

            let time = retData.playtime;
            let chair = this.getChairByUserid(firstID);
            let seatid = GamePlayer.getPlayer(firstID).seatid;
            let player=this.players[chair];
            player.getComponent(cc.Sprite).spriteFrame = this.chupaiHintKuangSprite;
            let outcardLayout=player.getChildByName("outCardLayout");
            let pass = player.getChildByName("pass");
            pass.active=false;
            outcardLayout.removeAllChildren(true);

            if(seatid==this.outcardseatid)
            {
                cc.log("------seatid = this.outcatdid",seatid);
                this.outCardType=0;
                this.PokScore = 0;
                for(var i=1;i<=3;i++)
                {
                    if(i!=seatid)
                    {
                        let passchair=this.getChairBySeatId(i);
                        this.players[passchair].getChildByName("pass").active=false;
                        let outcard=this.players[chair].getChildByName("outCardLayout");
                        outcard.removeAllChildren(true);
                    }
                }

            }
            if(firstID==UserCenter.getUserID())
            {
                let handCard=this.handCardprefab.getChildByName("control");
                let handCardController = handCard.getComponent("SkyhandCard");
                var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
                handCardController.changeCardOut();
                if(outcardLayout!=null)
                {
                    outcardLayout.removeAllChildren(true);
                }
                this.handCardprefab.getChildByName("gameBtn").active=true;
                if(this.outCardType==0)
                {
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active=false;
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("Tips").active=false;
                }
                else
                {
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active=true;
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("Tips").active=true;
                }
                cc.log(" seatid-------cardtype-----seatid---------",this.outcardseatid,this.outCardType,seatid);
                handCardController.getCardData(this.tableId,seatid,this.outCardType,this.length,this.num,this.X,true);
                if (this.timeLimit || SkyManager.autoplaySign){
                    if(this.timeLimit ){
                       handCardController.clockSprite.active = true; 
                    }
                    cc.log("断线重连出牌剩余时间------",time)
                    if (time>0 ){
                        handCardController.showtimeOutPai(time-2); 
                    }
                }
                
                
            }

            SkyManager.rule.setMsgBlocked(false);
        }
        else if (cmd == SkyCommand.RESP_CMD.RCMD_OutCardDLink)
        {
            cc.log("RCMD_OutCardDLink");
            for (var index = 0;index < retData.users.length; index++) {

                let user = retData.users[index];
                let cardarray=user.cardarray;
                cc.log(cardarray);
                let cardtype=user.cardtype;

                let seatid= user.seatid;

                cc.log(cardarray);
                let chair = this.getChairBySeatId(seatid);
                if (retData.lastIndex == user.outcardindex && retData.lastUserId != UserCenter.getUserID()) {
                    if(cardtype == 4 ||cardtype == 8){
                        var num=SkyManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
                    }else if(cardtype == 8){
                        var num=SkyManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
                    }
                    else{
                        var num=SkyManager.getCardTypeNum(cardarray[cardarray.length-1]);
                    }
                    let handCard = this.handCardprefab.getChildByName("control");

                    let handCardController = handCard.getComponent("SkyhandCard");
                    handCardController.timeLimit = this.timeLimit;
                    cc.log('-------断线重连时间限制-------',handCardController.timeLimit)
                    this.outcardseatid = seatid;
                    this.outCardType=user.cardtype;
                    this.length=cardarray.length;
                    this.num=num[1];
                    handCardController.getCardData(this.tableId,this.outcardseatid,cardtype,this.length,this.num,this.X,false);

                    SkyManager.rule.setMsgBlocked(false);

                }
                let player = this.players[chair];
                var baseNode=player.getChildByName("outCardLayout");
                baseNode.active=true;
                this.showOutCard(baseNode,cardarray,2,chair);
            }
        }
        //出牌
        else if (cmd == SkyCommand.RESP_CMD.RCMD_OutCard)
        {

            cc.log("RCMD_OutCard");
            // cc.log(retData)
            // this.addfenpai(retData.cardarray);
            let userid = retData.userid;
            if (userid != UserCenter.getUserID()) {
                this.showClock(userid,false);
            }

            let cardarray=retData.cardarray;
            let cardtype=retData.cardtype;
            let seatid= retData.seatid;
            let length=cardarray.length;
            let selfUsrid = UserCenter.getUserID();
            //let num=SkyManager.getCardTypeNum(cardarray[cardarray.length-1]);
            if(cardtype == 4 ||cardtype == 8){
                var num=SkyManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
            }else if(cardtype == 8){
                var num=SkyManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
            }
            else{
                var num=SkyManager.getCardTypeNum(cardarray[cardarray.length-1]);
            }

            var chair = this.getChairByUserid(userid);


            let player=this.players[chair];

            player.getComponent(cc.Sprite).spriteFrame = this.headBgSprite;
            var baseNode=player.getChildByName("outCardLayout");
            var effectNode=player.getChildByName("effectNode");
            baseNode.active=true;
            this.outcardseatid=seatid;
            this.outCardType=cardtype;
            cc.log(" seatid-------cardtype--------------",this.outcardseatid,this.outCardType);
            this.length=length;
            let NUMSprite = player.getChildByName("NUM");
            var numValue = NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string;
            numValue=parseInt(numValue);
            numValue-=length;
            if ((numValue == 1 || numValue == 2) && chair != 0) {
                this.soundCtrl.playBaojing();
                let baojingNode = player.getChildByName("baojingNode");
                this.showOutCardAni(baojingNode,16);
            }
            NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = numValue;

            if (chair != 0) {
                if(retData.isSee)
                {
                    var mingpaiLayout = player.getChildByName("mingpaiLayout");
                    if(mingpaiLayout.childrenCount!=0)
                    {
                        for(var i=0;i<cardarray.length;i++)
                        {
                            var card = cardarray[i];
                            for(var j = 0;j<mingpaiLayout.childrenCount;j++)
                            {
                                var cardObject=mingpaiLayout.children[j];
                                var pokerCtr = cardObject.getComponent("SkypokerCtrSS");
                                if(card==pokerCtr.info)
                                {
                                    cardObject.removeFromParent();
                                    break;
                                }
                            }
                        }
                    }

                }
                this.showOutCard(baseNode,cardarray,2,chair);
                this.showOutCardAni(effectNode, this.outCardType);
            }
            this.num=num[1];
            let handCard=this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("SkyhandCard");
            handCardController.getCardData(this.tableId,this.outcardseatid,this.outCardType,this.length,this.num,this.X,false);
            var type = handCardController.changeCardType(cardtype);
            cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!",cardtype,type);
            let user = GamePlayer.getPlayer(userid);
            this.playSound(user.sex,type,this.num);
            // this.playBoomEffect(cardtype);
            SkyManager.rule.setMsgBlocked(false);
        }
        //过牌
        else if (cmd == SkyCommand.RESP_CMD.RCMD_GiveUpOutCard)
        {

            cc.log("RCMD_GiveUpOutCard");
            let userid = retData.userid;
            if (userid != UserCenter.getUserID()) {
                this.showClock(userid,false);
            }
            let chair = this.getChairByUserid(userid);
            let player=this.players[chair];

            player.getComponent(cc.Sprite).spriteFrame = this.headBgSprite;
            var passSprite = player.getChildByName("pass");
            passSprite.active = true;
            let handCard=this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("SkyhandCard");
            this.soundCtrl.playPass();
            handCardController.getCardData(this.tableId,this.outcardseatid,this.outCardType,this.length,this.num,this.X,false);
            SkyManager.rule.setMsgBlocked(false);
        }
        //结算界面
        else if (cmd == SkyCommand.RESP_CMD.RCMD_Result  ) {
            let self = this;
            cc.log("RCMD_Result");
            cc.log(retData);
            this.cancelAutoPlay()
            if (this.roomType < 2) {
                SkyManager.rule.isPlaying = false;
            }
            for (let i = 0; i <4 ; i++) {
                let player = this.players[i];
                player.getChildByName("pass").active = false;
            }
            this._updatePlayers(retData.ar);
            for(var index = 0;index<retData.ar.length;index++ )
            {
                if(retData.ar[index].userid==UserCenter.getUserID())
                {
                    if(retData.ar[index].isWin>0)
                    {
                        self.winStatus = true;
                        cc.log('==============赢了');
                        this.soundCtrl.playWin();
                        // this.resultprefab = cc.instantiate(SkyManager.resultPrefab);
                    }
                    else{
                        self.winStatus = false;
                        cc.log('==============输了');
                        this.soundCtrl.playLose();
                        // this.resultprefab = cc.instantiate(SkyManager.loseResultPrefab);
                    }
                }
            }
            if (retData.isSpring) {
                this.resultData = retData;
                this.showOutCardAni(this.effectNode,17);

            } else {
                let Controller
                if (self.winStatus) {
                    this.resultprefab.parent = this.node.parent;
                    Controller = this.resultprefab.getComponent("SkyResultCtrl");
                } else {
                    this.loseResultprefab.parent = this.node.parent;
                    Controller = this.loseResultprefab.getComponent("SkyResultCtrl");
                }


                // var result = this.resultprefab.getChildByName("resultNode");
                // let resultprefab = this.resultprefab.getChildByName("controller");
                Controller.showResult(retData);
            }
        }
        
        SkyManager.rule.setMsgBlocked(false);

    },

    refreshPartenerHandCard:function(basenode)
    {
        let length = basenode.childrenCount;
        let startX;
        var Layout = basenode.getComponent(cc.Layout);
        // if(length>=2&&length<=27)
        // {
        //     Layout.spacingX = (-92+(27-length));
        // }
        // else if(length>0&&length<=2)
        // {
        //     Layout.spacingX = -67;
        // }
        // if(length%2 == 1)
        // {
        //     //单数
        //     startX = Math.floor(length/2)*(-46);
        // }else
        // {
        //     //双数
        //     startX = -46/2-(Math.floor(length/2) - 1)*46;
        // }

        SkyManager.rule.sortHandPokersBToS(basenode.children);
        // for(let i = 0;i < length ;i++)
        // {
        //     let poker =basenode.children[i];
        //     poker.x = startX+46*i;
        //     poker.setLocalZOrder(10000+i);
        //     poker.getComponent("SkypokerCtr").index = i;
        // }

    },


    playSound:function(sex,type,num)
    {

        cc.log('num',num);
        if(num == 15)
        {
            num=1;
        }
        else if(num == 16)
        {
            num = 14
        }
        else if(num == 17)
        {
            num =15;
        }
        else{
            num-=1;
        }
        this.soundCtrl.playPai(sex,num,type);
    },

    playBoomEffect : function(type){

        if(type == 9 || type == 10){
            this.soundCtrl.playBoom1();
        }else if(type == 11 || type == 12){
            this.soundCtrl.playBoom2();
        }else if(type == 13){
            this.soundCtrl.playBoom3();
        }else if(type == 14){
            this.soundCtrl.playBoom5();
        }else{
            this.soundCtrl.playOutpai();
        }
    },

    refreshTable:function()
    {
        for(var i =0;i<4;i++)
        {
            let player = this.players[i];
            for(var j = 1;j<4;j++)
            {
                player.getChildByName("rankImg"+j).active=false;
            }
            player.getChildByName("pass").active=false;
            let outCardLayout=player.getChildByName("outCardLayout");
            outCardLayout.removeAllChildren(true);
            player.getChildByName("NUM").active=false;
            this.handCardprefab.getChildByName("handLayout").removeAllChildren(true);
        }
        // this.Info.active = false;
        this.PokScore = 0;
        // this.Info.children[0].getComponent(cc.Label).string = this.PokScore;
        this.partenerHandLayout.removeAllChildren(true);
        this.handCardprefab.getChildByName("outCardLayout").removeAllChildren(true);
    },

    showHintAni:function(effectnode,type) {
        cc.loader.loadRes("game/ddz/anim/jiaodizhuAni", cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            var module = cc.instantiate(prefab);

            module.parent = effectnode;
            var Ctrl = module.getComponent('jiaodizhuAniCtrl');
            Ctrl.onShow(type);
        });
    },
    showOutCardAni:function(effectnode,type)
    {
        cc.log('炸弹',effectnode,type)
        var effectName ='';

        if(type == 5)
        {
            effectName='Shunzi/ShunziNode';
        }
        else if(type == 6){
            effectName='LianDui/LianduiNode';
        }
        else if(type == 8){
            effectName='FeiJi/FeijiNode';
        }
        else if(type>=9 && type <=13)
        {
            effectName='Bomb/Bomb';
        }else if(type==14)
        {
            effectName='SiWang/SiWang';
        }else if(type==16)
        {
            effectName='Bomb/baojingAni';
        }else if(type==17)
        {
            effectName='Bomb/chuntian';
        }
        if(effectName!=''){
            let path = "game/ddz/effect/"+effectName
            cc.log(path)
            cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
                if (err) {
                    cc.log(err);
                    return;
                }
                var module = cc.instantiate(prefab);
                module.parent = effectnode;
            });
        }
    },

    addDipai :function (dzcards) {
        for(let index = 0;index<dzcards.length;index++)
        {
            dzcards[index] = SkyManager.getCardTypeNum(dzcards[index]);
        }
        let handCard=this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("SkyhandCard");
        handCardController.addDiPai(dzcards);
    },
    showMingpaiLayout : function (baseNode,data) {
        let z = 100;
        baseNode.removeAllChildren(true);
        for(let i = 0;i<data.length;i++){

            let cards = data[i];
            let card = SkyManager.getCardTypeNum(cards);
            var pokerPrefab = cc.instantiate(SkyManager.pokerPrefabSS);

            pokerPrefab.setLocalZOrder(z + i);
            pokerPrefab.parent = baseNode;

            let type = card[0];
            let num  = card[1];
            let info = card[2];

            var pokerController = pokerPrefab.getComponent("SkypokerCtrSS");
            pokerController.init(SkyManager.pokersAtlas,{num:num,type:type},info,i);
        }
    },
    showDipai : function (baseNode,data) {
        let z = 100;
        baseNode.removeAllChildren(true);
        for(let i = 0;i<data.length;i++){

            let cards = data[i];
            let card = SkyManager.getCardTypeNum(cards);
            var pokerPrefab = cc.instantiate(SkyManager.pokerPrefab);

            pokerPrefab.setLocalZOrder(z + i);
            pokerPrefab.parent = baseNode;

            let type = card[0];
            let num  = card[1];
            let info = card[2];

            var pokerController = pokerPrefab.getComponent("SkypokerCtr");
            pokerController.init(SkyManager.pokersAtlas,{num:num,type:type},info,i);
        }
    },
    showOutCard:function(baseNode,data,isS,chair)
    {
        let z = 100;
        var temp = [];
        if(chair==1){
            // baseNode.setPositionX(-190-28*data.length);
            if(data.length<10){
                // baseNode.setPositionX(-145+28*(9-data.length));
                baseNode.setPositionX(-190-28*data.length);
            }
            else{
                baseNode.setPositionX(-190 - 28*10);
            }

        }

        for(let index=0;index<data.length;index++)
        {
            let cards = data[index];
            let card = SkyManager.getCardTypeNum(cards);
            var pokerPrefab;
            if(isS == 3)
            {
                pokerPrefab = cc.instantiate(SkyManager.pokerPrefabSS);
                //
            }
            else if(isS == 2)
            {
                pokerPrefab = cc.instantiate(SkyManager.pokerPrefab);
                this.X = SkyManager.rule.JudgeX(baseNode.children);
            }
            else  {
                pokerPrefab = cc.instantiate(SkyManager.pokerPrefab);
            }
            pokerPrefab.setLocalZOrder(z + index);
            pokerPrefab.parent = baseNode;

            let type = card[0];
            let num  = card[1];
            let info = card[2];
            temp.push(pokerPrefab);
            var pokerController;
            // if(num==5){
            //     this.PokScore+=5;
            // }else if(num==10){
            //     this.PokScore+=10;
            // }else if(num==13){
            //     this.PokScore+=10;
            // }

            if(isS == 3){
                pokerController = pokerPrefab.getComponent("SkypokerCtrSS");
                pokerController.init(SkyManager.pokersAtlas,{num:num,type:type},info,1);
            }
            else if(isS == 2) {
                pokerController = pokerPrefab.getComponent("SkypokerCtr");
                pokerController.init(SkyManager.pokersAtlas,{num:num,type:type},info);
            }
            else
            {
                pokerController = pokerPrefab.getComponent("SkypokerCtr");
                pokerController.init(SkyManager.pokersAtlas,{num:num,type:type},info,1);
            }

        }
        // SkyManager.rule.sortHandPokersBToS(temp);
        //SkManage.rule.sortHandPokersBToS(temp);
    },
    refreshPartenerHandCard:function()
    {
        let length = this.partenerHandLayout.childrenCount;
        let startX;
        var Layout = this.partenerHandLayout.getComponent(cc.Layout);
        if(length>=2&&length<=27)
        {
            Layout.spacingX = (-92+(27-length));
        }
        else if(length>0&&length<=2)
        {
            Layout.spacingX = -67;
        }
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-46);
        }else
        {
            //双数
            startX = -46/2-(Math.floor(length/2) - 1)*46;
        }

        SkyManager.rule.sortHandPokersBToS(this.partenerHandLayout.children);
        for(let i = 0;i < length ;i++)
        {
            let poker =this.partenerHandLayout.children[i];
            poker.x = startX+46*i;
            poker.setLocalZOrder(10000+i);
            poker.getComponent("SkypokerCtr").index = i;
        }

    },
    getCardNum:function(data)
    {
        let cardArr = [];
        for(var index = 0;index<data.length;index++)
        {
            var cards = data[index];
            var card = SkyManager.getCardTypeNum(cards);
            cardArr.push(card[1]);
        }
        SkyManager.rule.JudgeX(cardArr);
    },
    /**
     *
     */
    refreshJushu:function (currGame,totalGame)
    {
        this.cardJushu.getChildByName("num").getComponent(cc.Label).string = '局数：{0}/{1}'.format(currGame,totalGame);
        for(var i = 0;i<this.players.length;i++)
        {
            var player = this.players[i];
            var prisebox = player.getChildByName('scoreView');
            prisebox.children[0].getComponent(cc.Label).string = 0;
            prisebox.children[1].getComponent(cc.Label).string = 0;
            // var prisebox = player.getChildByName('prisebox');
            // prisebox.children[0].getComponent(cc.Label).string = formatNum(gong);
        }
    },

    onClickDissolve:function(){
        cc.log('onClickDissolve');
        this.node.emit('CMD_forceGameOver');
        this.refreshMenuActive();
    },

    /*getruleFlagCard:function(flag){
     cc.log('flag',flag);
     cc.log("flag&&&",flag&0x0F);
     switch(flag&0x0F){
     case 1:return 1;
     case 2:return 3;
     case 4:return 6;
     case 8:return 9;
     }
     },
     getruleFlagPlayer:function(flag){
     cc.log('flag',flag);
     cc.log("flag&&&",flag&0x10);
     if(flag&0x10==0x10){
     return 4;
     }
     else
     {
     return 2;
     }
     },*/

    onClickInviteBtn:function()
    {
        var game = Loadgame.getCurrentGame();
        var title =game.name + ' 房号:{0} ({1}局)';
        title = title.format(SkyManager.rule.roomcode,SkyManager.rule.totalGame);
        var descript =  '我在'
        descript += !!config.appName?config.appName:game.name;
        descript +=','
        descript +=!!game.getWanfa?game.getWanfa(this.ruleFlag,this.expend):WanFa.getWanfa(game,this.ruleFlag);
        descript += ',赶快来加入！'
        cc.log(title,descript);
        if(!!config.magicLink){
            var url = (config.magicLink + '?gameid={0}&roomcode={1}').format(Loadgame.getCurrentGameId(),SkyManager.rule.roomcode);
            wxapi.sendWebPageToWxReq(title,descript,url,0);
        }else {
            wxapi.initWXFriend(title,Loadgame.getCurrentGameId(),SkyManager.rule.roomcode,descript);
        }

    },
    showHandCard:function(data,isPlayAni)
    {
        if(this.handCardprefab==null)
        {
            this.handCardprefab = cc.instantiate(SkyManager.HandCardPrefab);

            this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
            this.handCardprefab.getChildByName("control").getComponent("SkyhandCard").roomType = this.roomType;

        }
        let handCard=this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("SkyhandCard");
        handCardController.gameServer = this.game.server;
        this.handCardprefab.getChildByName("gameBtn").active=false;
        handCardController.onShow(data,isPlayAni,this.isMingpaiStart,false);
    },

    setGameStartStatus:function(index)
    {
        let player = this.players[index];
        let readySprite = player.getChildByName("ready");

        readySprite.active = false;
    },


    RCMD_MatchOver : function (event) {

        //this.soundCtrl.playEnd();
        var data = event.detail;
        var self = this;
        let path = 'style/gameOverRank/gameOverRank'
        // if (!!this.game.prefab.gameOverRank) {
        //     path = 'game/{0}/prefab/gameOverRank/gameOverRank'.format(self.game.sourcePath);
        // } else {

        // }
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            self.result = cc.instantiate(prefab);
            self.result.parent = self.node.parent;
            self.result.setLocalZOrder(99000);
            self.resultCallback(data);
        });
    },

     resultCallback: function (data, type) {
        var controller = this.result.getComponent('gameOverRankScript');
        controller.show(data.users, data.count);
        // var skResult = this.result.getChildByName("skResult").getComponent("skResult");
        // skResult.onShow(this.roomuserid,data,type)
    },


    RCMD_SitIn:function(event)
    {
        let data = event.detail;
        cc.log("RCMD_SitIn",JSON.stringify(data));
        for(var i = 0; i < data.users.length; i++)
        {
            let user = data.users[i];
            if( user.userid == UserCenter.getUserID())
            {
                this.seatId = user.seatid;
                break;
            }

        }
        for(var i = 0; i < data.users.length; i++)
        {
            let user = data.users[i];
            let player = GamePlayer.addPlayer(user);
            if(!player) continue;

            if(!isUrl(player.userImage)){
                // player.userImage = 'doudizhu/texture/youxiScene/head1_{0}'.format(player.sex==1?'man':'woman')
                player.userImage = 'game/ddz/texture/head1';
            }
            let chair = this.getChairBySeatId(user.seatid);

            this.setChairInfo(player,chair,true);
            // this.cancelAutoPlay();
        }
        cc.log("-----GamePlayer.getPlayerNum()-----",GamePlayer.getNum())
        // if(GamePlayer.getNum() == 4) {
        //     this.roomButton.active = false;
        //     this.roomButton.getChildByName("inviteBtn").interactable = false ;
        // }
    },

    RCMD_Start:function()
    {
        cc.log('RCMD_Start');
        if(this.mathOverFlag == null)
        {
            //判断人齐了吗
            this.roomButton.active = false;
            this.roomButton.getChildByName("inviteBtn").interactable = false ;
            this.normalButtons.active = true;
            this.startBox.active = true;
            // if (this.isXianzhi) {
            //     this.mingpaiStartBtn.active = false;
            //     // this.isMingpai = true;
            // }
        }
        /*this.currGame == 0*/
        SkyManager.rule.setMsgBlocked(false);
    },

    RCMD_Ready:function(event)
    {
        let data = event.detail;
        cc.log("RCMD_Ready",JSON.stringify(data));
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        // this.initCurrGame();
        // if(this.currentGame >=1 && chair == 0)
        // {
        //     // this.showNormalBtn(false);
        //     this.initCurrGame();
        // }
        if (userid == UserCenter.getUserID()) {
            this.isMingpaiStart = 0;
            this.startBox.active = false;
        }

        this.setReady(chair,true);
        SkyManager.rule.setMsgBlocked(false);
    },

    RCMD_Result : function (event)
    {
        let data = event.detail;
        ///////-----cc.log(data);
    },


    _updatePlayers : function (data) {
        var users = data;
        for(var i = 0; i < users.length; i++){
            var user = users[i];
            var player = GamePlayer.getPlayer(user.userid);
            var chair = this.getChairByUserid(user.userid);
            if(this.roomType == 2){
                player.score += user.curwon;
                var totalScoreNode = this.players[chair].getChildByName('totalScore');
                totalScoreNode.getComponent(cc.Label).string = formatNum(player.score);
            }else{
                player.money += user.curwon;
                if(UserCenter.getUserID() == player.userid){
                    UserCenter.setYouxibiNum(player.money);
                    // UserCenter.getUserInfo().youxibi = player.money;
                }
                var totalScoreNode = this.players[chair].getChildByName('totalScore');
                totalScoreNode.getComponent(cc.Label).string = formatNum(player.money);
                GlobEvent.emit('update_UserCenter');
            }
        }
    },

    showNormalBtn:function(isVisible)
    {
        this.normalButtons.active = isVisible;
        this.normalButtons.getChildByName("readyBtn").interactable = isVisible ;
    },
    showRoomBtn:function(isVisible)
    {
        this.InviteButton.active = isVisible;
    },

    exchangeChair:function(user1,user2,seatid0,seatid1){

        var self = this;
        cc.log('cccccccccccccccccc--exchangeChair');
        for(var i = 1;i<4;i++){
            this.players[i].active = false;
        }

        var player = this.players[0];
        var Node = player.getParent();
        if(user1==UserCenter.getUserID()||user2==UserCenter.getUserID())
        {

            var chair ;
            if(user1==UserCenter.getUserID()){
                chair = this.getChairByUserid(user2);
            }else{
                chair = this.getChairByUserid(user1);
            }
            if(chair == 1){
                var position1 = this.players[1].getPosition();
                var position2 = this.players[2].getPosition();
                var position3 = this.players[3].getPosition();
                var node1 = cc.instantiate(this.players[1]);
                cc.log('-----------------node1',node1);
                cc.log('-----------------this.players',this.players);
                node1.parent = Node;
                node1.active = true;
                node1.setPosition(position1);

                var node2 = cc.instantiate(this.players[2]);
                node2.parent = Node;
                node2.active = true;
                node2.setPosition(position2);

                var node3 = cc.instantiate(this.players[3]);
                node3.parent = Node;
                node3.active = true;
                node3.setPosition(position3);


                var Action1 = cc.sequence(cc.moveTo(0.6,position3).easing(cc.easeCubicActionInOut()),cc.delayTime(0.3),cc.moveBy(0.4,cc.p(-150,0)),cc.callFunc(function(){
                    node2.removeFromParent();
                }));
                var Action2 = cc.sequence(cc.moveTo(0.6,position2).easing(cc.easeCubicActionInOut()),cc.delayTime(0.7),cc.callFunc(function(){
                    node3.removeFromParent();
                }));
                var Action3 = cc.sequence(cc.delayTime(0.9),cc.moveBy(0.4,cc.p(150,0)),cc.callFunc(function(){
                    node1.removeFromParent();self.showPlayer(user1,user2,seatid0,seatid1,true);
                }));

                this.players[3].setPosition(cc.p(position3.x-150,position3.y));
                this.players[1].setPosition(cc.p(position1.x+150,position1.y));


                node2.runAction(Action1);
                node3.runAction(Action2);
                node1.runAction(Action3);

            }
            else if(chair == 3){
                var position1 = this.players[1].getPosition();
                var position2 = this.players[2].getPosition();
                var position3 = this.players[3].getPosition();
                var node1 = cc.instantiate(this.players[1]);
                cc.log('-----------------node1', node1);
                cc.log('-----------------this.players',this.players);
                node1.parent = Node;
                node1.active = true;
                node1.setPosition(position1);

                var node2 = cc.instantiate(this.players[2]);
                node2.parent = Node;
                node2.active = true;
                node2.setPosition(position2);

                var node3 = cc.instantiate(this.players[3]);
                node3.parent = Node;
                node3.active = true;
                node3.setPosition(position3);


                var Action1 = cc.sequence(cc.spawn(cc.moveTo(0.6,position1).easing(cc.easeCubicActionInOut()),cc.rotateBy(0.6,360)),cc.delayTime(0.3),cc.moveBy(0.4,cc.p(150,0)),cc.callFunc(function(){
                    node2.removeFromParent();
                }));
                var Action2 = cc.sequence(cc.spawn(cc.moveTo(0.6,position2).easing(cc.easeCubicActionInOut()),cc.rotateBy(0.6,360)),cc.delayTime(0.7),cc.callFunc(function(){
                    node1.removeFromParent();
                }));
                var Action3 = cc.sequence(cc.delayTime(0.9),cc.moveBy(0.2,cc.p(-150,0)).easing(cc.easeCubicActionInOut()),cc.callFunc(function(){
                    node3.removeFromParent();self.showPlayer(user1,user2,seatid0,seatid1,true);
                }));

                this.players[1].setPosition(cc.p(position1.x+150,position1.y));
                this.players[3].setPosition(cc.p(position3.x-150,position3.y));

                node1.runAction(Action2);
                node2.runAction(Action1);
                node3.runAction(Action3);
            }

        }
        else{
            var chair1 = this.getChairByUserid(user1);
            var chair2 = this.getChairByUserid(user2);
            for(var i =1;i<4;i++){
                if(i!=chair1&&i!=chair2){
                    var position3 = this.players[i].getPosition();
                    var node3 = cc.instantiate(this.players[i]);
                    node3.parent = Node;
                    node3.active = true;
                    node3.setPosition(position3);
                }

            }
            var position1 = this.players[chair1].getPosition();
            var position2 = this.players[chair2].getPosition();
            var node1 = cc.instantiate(this.players[chair1]);
            cc.log('-----------------node1', node1);
            cc.log('-----------------this.players',this.players);
            node1.parent = Node;
            node1.active = true;
            node1.setPosition(position1);

            var node2 = cc.instantiate(this.players[chair2]);
            node2.parent = Node;
            node2.active = true;
            node2.setPosition(position2);
            var Action1;
            var Action2;
            if(chair1==1||chair2==1){
                Action1 = cc.sequence(cc.spawn(cc.moveTo(1.3,position2).easing(cc.easeCubicActionInOut()),cc.rotateBy(1.3,360)),cc.callFunc(function(){
                    node1.removeFromParent();node3.removeFromParent();
                }));
                Action2 = cc.sequence(cc.spawn(cc.moveTo(1.3,position1).easing(cc.easeCubicActionInOut()),cc.rotateBy(1.3,360)),cc.callFunc(function(){
                    node2.removeFromParent();self.showPlayer(user1,user2,seatid0,seatid1,false);
                }));
            }
            else{
                Action1 = cc.sequence(cc.moveTo(1.3,position2).easing(cc.easeCubicActionInOut()),cc.callFunc(function(){
                    node1.removeFromParent();node3.removeFromParent();
                }));
                Action2 = cc.sequence(cc.moveTo(1.3,position1).easing(cc.easeCubicActionInOut()),cc.callFunc(function(){
                    node2.removeFromParent();self.showPlayer(user1,user2,seatid0,seatid1,false);
                }));
            }

            node1.runAction(Action1);
            node2.runAction(Action2);
        }
    },

    showPlayer:function(user1,user2,seatid0,seatid1,ismove){
        var self = this;

        if(user1==UserCenter.getUserID()||user2==UserCenter.getUserID())
        {
            if(user1==UserCenter.getUserID())
            {
                this.seatId=seatid0;
            }
            if(user2==UserCenter.getUserID())
            {
                this.seatId=seatid1;
            }

        }
        var player1 = GamePlayer.getPlayer(user1);
        player1.seatid = seatid0;
        var player2 = GamePlayer.getPlayer(user2);
        player2.seatid = seatid1;

        for(var usrid in GamePlayer.players){
            var player = GamePlayer.getPlayer(usrid);
            let chair = this.getChairByUserid(usrid);
            this.setChairInfo(player,chair,false);
            if((chair==1&&ismove)||(chair==3&&ismove)){
                if(chair == 1){
                    this.players[1].runAction(cc.moveBy(0.3,cc.p(-150,0)).easing(cc.easeCubicActionInOut()));
                }
                else{
                    this.players[3].runAction(cc.moveBy(0.3,cc.p(150,0)).easing(cc.easeCubicActionInOut()));
                }
            }
        }
        this.players[0].runAction(cc.sequence(cc.delayTime(0.3),cc.callFunc(function(){
            SkyManager.rule.setMsgBlocked(false);self.showCardNUM();
        })));
    },

    showCardNUM:function(){

        for(let index = 0;index < 4;index++)
        {
            this.setGameStartStatus(index);
        }
    },

    setChairInfo:function(user,chair,isPlayFog)
    {

        let player = this.players[chair];
        let beans = this.roomType == 2 ? user.score : user.money;
        let status = user.status;
        let userImage = user.userImage;
        this.sex = user.sex;
        player.active = true;
        player.children[1].getComponent(cc.Label).string = user.nick;
        player.children[2].getComponent(cc.Label).string = formatNum(beans);
        // scorebox.children[0].getComponent(cc.Label).string = formatNum(beans);///

        getSpriteFrameByUrl(userImage,function (err,spriteFrame) {
            if(err) return;
            player.getChildByName("head").getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });

        player.chair = chair;
        player.seatid = this.getSeatIdByChair(chair);
        player.userid = user.userid;
        player.sex = user.sex;
        player.beans = beans;
        player.userImage = userImage;

        //设置zorder
        player.setLocalZOrder(player.seatid);

        if(isPlayFog){
            cc.loader.loadRes("game/ddz/effect/ChairFog/FogNode", cc.Prefab, function (err, prefab) {
                if (err) {
                    return;
                }
                var module = cc.instantiate(prefab);
                module.parent = player;
            });
        }


        this.setReady(chair,status == GamePlayer.PlayerState.Ready);
        this.setOfflineStatus(chair,status >= GamePlayer.PlayerState.Offline);
    },

    setOpChair:function(dir,type)
    {
        // this.unschedule(this.callback);
        // if (type) {
        //     this.players[dir].getChildByName("dizhu").active = true;
        // } else {
        //     this.players[dir].getChildByName("nongmin").active = true;
        // }

    },
    setIsDizhu:function(dir,type,index)
    {
        if (type) {
            let path = 'game/sky/texture/'+index+'bao'
            let self = this;
            getSpriteFrameByUrl(path, function (err, spriteFrame) {
                if (err) {
                    cc.log(err);
                    return;
                }
                self.players[dir].getChildByName("dizhu").active = true;
                self.players[dir].getChildByName('dizhu').getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
        }

    },
    setIsFei:function(chair,show,type) {
        let fei = this.players[chair].getChildByName("fei");
        if (show){
            if (type == 1){
                fei.getChildByName("feizha").active = true;
            }else if(type == 2){
                fei.getChildByName("feiwang").active = true;
            }else if(type == 3){
                fei.getChildByName("feizha").active = true;
                fei.getChildByName("feiwang").active = true;
            }
        }
    },
    setHintNode:function(dir,show,type)
    {
        var hintNode = this.players[dir].getChildByName("hintNode");
        if (show) {
            hintNode.getComponent(cc.Sprite).spriteFrame = this.hintSprites[type];

        }
        hintNode.active = show;


    },
    setIsJiabei:function(dir,type)
    {
        this.players[dir].getChildByName("jiabeiIcon").active = type;
    },
    setReady:function(dir,bReady)
    {
        this.players[dir].getChildByName("ready").active = bReady;
    },

    setOfflineStatus:function(dir,Offline)
    {
        this.players[dir].children[0].children[0].active = Offline;
    },


    RCMD_Dao:function(data){
        if(data.flag  == 0)
        {
            if(data.suserid ==UserCenter.getUserID())
            {
                UserCenter.updateYouxibiNum(-data.consume);
            }
            this.showDao(data);
        }else
        {
            if(data.flag  == 1)
            {
                showAlert(CfgGame.alertData.YOUXIBI_LESS);
            }
        }
    },



    showDao:function(data){
        // let data = event.detail;
        if(this.daoArray == null)
        {
            this.daoArray = [];
        }

        let sourceChair = this.getChairByUserid(data.suserid);
        let propAnim =this.daoArray[sourceChair];
        if(propAnim == null)
        {
            propAnim = cc.instantiate(this.propAnimPrefab);
            propAnim.parent = this.node.parent;
            this.daoArray[sourceChair] = propAnim ;
        }


        let propAnimController = propAnim.getComponent("propAnimController");
        let sourcePlayer = this.players[this.getChairByUserid(data.suserid)];

        if(this.roomType != 2)
        {
            if(data.suserid == UserCenter.getUserID())
            {
                sourcePlayer.getChildByName("totalScore").getComponent(cc.Label).string = formatNum(UserCenter.userInfo.youxibiNum);
            }else {
                Porp.getProplist(function(data1,data2) {
                    let ret = data2.results;
                    if (ret) {
                        for (let i = 0; i < ret.length; i++) {
                            let obj = ret[i];
                            if(obj.bh == data.daobh)
                            {
                                sourcePlayer.beans -= parseInt(obj.dj);
                                sourcePlayer.getChildByName("totalScore").getComponent(cc.Label).string = formatNum(sourcePlayer.beans);
                            }
                        }
                    }
                });
            }
        }


        let targetPlayer = this.players[this.getChairByUserid(data.ruserid)];
        propAnim.active = true;
        propAnimController.playAnim(sourcePlayer.getPosition(),targetPlayer.getPosition(),data.daobh);
    },
    hideDao:function(event)
    {
        let chair = parseInt(event.detail);
        if(this.daoArray && this.daoArray[chair])
        {
            this.daoArray[chair].active = false;
        }
    },

    RCMD_TaskSeat:function(event)
    {
        cc.log('RCMD_TaskSeat');
        cc.log(event.detail);
        let data = event.detail;
        this.seatId = data.seatid;
        this.tableId = data.tableid;
    },

    RCMD_GameStart:function(event)
    {
        cc.log('RCMD_GameStart');
        this.isGameStart = true;
        let data = event.detail;
        for(let i = 0;i < MAX_PLAYERS;i++)
        {
            this.setReady(i,false);
        }
    },

    setRank:function(id)
    {
        this.id = id;
        let chair = this.getChairByUserid(id);
        if(chair<0) return;
        this.players[chair].children[4].active=true;
    },

    RCMD_exit:function(event)
    {

        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('RCMD_exit : ',userid,chair);

        if(this.roomType == 2){
            if(this.normalButtons.active)
            {
                this.normalButtons.active = false;
                this.roomButton.active = true;
            }
        }

        this.players[chair].getChildByName("ready").active = false;


        this.players[chair].active = false;
        GamePlayer.removePlayer(data.userid);
        SkyManager.rule.setMsgBlocked(false);
    },



    clearPlaystatus:function(chair)
    {
        this.players[chair].children[3].active = false;
        this.players[chair].children[4].active = false;
    },

    hidMenu : function(){
        if(this.roommenu.active){
            this.onClickMenu();
        }
    },

    onClickMenu : function ()
    {
        //this.exchangeChair(10014235,10014108,2,3);
        this.refreshMenuActive();
    },

    onClickExit : function () {

        this.node.emit('onExit');
    },
    getSeatIdByChair:function(chair)
    {
        chair = chair||0;
        if(SkyManager.rule.playerNum==4){
            return (this.seatId+chair+3)%MAX_PLAYERS+1;
        }
        else{
            if(chair == 0){
                return this.seatId;
            }
            else{
                if(this.seatId==1){
                    return 2;
                }
                else{
                    return 1;
                }
            }
        }
        // (this.seatId+chair+3)%MAX_PLAYERS+1;

    },
    getChairByUserid : function (userid)
    {
        var seatid = GamePlayer.getSeatByUserid(userid);
        var chair = this.getChairBySeatId(seatid)
        return chair;
    },
    getChairBySeatId:function(seatId)
    {
        //return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
        if(SkyManager.rule.playerNum==4){
            return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
        }
        else{
            if(seatId == this.seatId){
                return 0;
            }else{
                return 2;
            }
        }

    },
    displayVoice:function(event)
    {
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        ///////-----cc.log('displayVoice',userid,chair);
        if(!this.voiceTips)
        {
            this.voiceTips = cc.instantiate(this.voiceTipsPrefab);
        }

        this.voiceTips.parent = this.players[chair];
        this.voiceTips.x = (chair == 0 || chair == 3) ? 20:-20;
        this.voiceTips.active = true;
    },

    hideVoice:function()
    {
        if(!!this.voiceTips)
        {
            this.voiceTips.active = false;
        }
    },


    showChatMsg:function(event)
    {
        cc.log(event)
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        let chatId = event.detail.chatId;
        let pos;
        if (chatId < 100) {

            if(!this.chatMsgBubbleArray)
            {
                this.chatMsgBubbleArray  = [];
            }


            let chatMsgBubble = this.chatMsgBubbleArray[chair];
            if (!chatMsgBubble) {
                chatMsgBubble = cc.instantiate(this.chatMsgBubblePrefab);
                chatMsgBubble.parent = this.players[chair];
                if (chair == 0 ) {
                    pos = cc.v2(-8, 60);
                } else if (chair == 1) {
                    pos = cc.v2(-82, 57);
                } else if(chair == 3|| chair == 2) {
                    pos = cc.v2(0, 0);
                }
                chatMsgBubble.setPosition(pos);
                this.chatMsgBubbleArray[chair] = chatMsgBubble;
            }
            chatMsgBubble.active = true;
            let con = chatMsgBubble.getComponent("chatMsgBubble");
            con.onShow(chair,this.players[chair].sex, chatId);

        } else
        {
            ///////-----cc.log("" + chatId);
            if(!this.lookAnimArray)
            {
                this.lookAnimArray  = [];
            }

            let lookAnim = this.lookAnimArray[chair];
            if (!lookAnim) {
                lookAnim = cc.instantiate(this.lookAnimPrefab);
                lookAnim.parent = this.players[chair];
                if (chair == 0 || chair == 3) {
                    pos = cc.v2(100, 30);
                } else if (chair == 1) {
                    pos = cc.v2(-160, 33);
                } else {
                    pos = cc.v2(100, 30);
                }
                lookAnim.setPosition(pos);
                this.lookAnimArray[chair] = lookAnim;
            }
            lookAnim.active = true;
            let lookAnimController = lookAnim.getComponent("lookAnimController");
            lookAnimController.playAnim(chair,chatId%100);
        }
    },


    hideChatMsg:function(event)
    {
        let chair = event.detail;
        if(this.chatMsgBubbleArray)
        {
            let  chatMsgBubble = this.chatMsgBubbleArray[chair];
            if(chatMsgBubble && chatMsgBubble.active)
            {
                chatMsgBubble.active = false;
            }
        }

        if(this.lookAnimArray)
        {
            let lookAnim = this.lookAnimArray[chair];
            if(lookAnim && lookAnim.active)
            {
                lookAnim.active = false;
            }
        }

    },

    refreshMenuActive:function()
    {
        this.roommenu.active = !this.roommenu.active;
        this.chatNode.active = !this.chatNode.active;
        this.colseNode.active = this.roommenu.active;
    },

    onSettingClick:function () {
        let self = this;
        cc.loader.loadRes('hall/setting/setting', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            module.getComponent('settingScript').gameIn(self.gameid)
        });

        self.refreshMenuActive();
    },


    onClickAuto: function () {
        if (!this.isGameStart) {
            showAlert(CfgGame.alertData.GAME_NOT_START);
            return;
        }
        else if (this.autoPlay && this.autoPlay.active) {
            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }
        ///////-----cc.log("onClickAuto");

        if (!this.autoPlay) {
            let self = this;
            cc.loader.loadRes('style/gameMenu/autoPlay/autoPlay', cc.Prefab, function (error, prefab) {

                if (error) {
                    cc.error(error.message || error);
                    return;
                }
                self.autoPlay = cc.instantiate(prefab);

                self.autoPlay.x = cc.winSize.width / 2;
                self.autoPlay.y = 0;
                self.autoPlay.parent = cc.director.getScene();

                self.refreshAutoPlay();
            });
        } else {
            this.refreshAutoPlay();
        }
    },



    refreshAutoPlay:function()
    {
        this.refreshMenuActive();
        SkyManager.autoplaySign = true;
        this.autoPlay.active = true;
        // GlobEvent.emit('AUTO_PLAY',true);
        let handCard=this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("SkyhandCard");
        if (UserCenter.getUserID() == this.firstSendCardID){
            handCardController.showtimeOutPai(24);
        }

    },

    cancelAutoPlay : function () {
        if(!!this.autoPlay){
            this.autoPlay.active = false;
            SkyManager.autoplaySign = false;
            this.timeLimit = false; 
            // GlobEvent.emit('AUTO_PLAY',false);
        }
    },

    openAutoPlay:function()
    {
        if(this.autoPlay && this.autoPlay.active)
        {

            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }
        this.autoPlay.active = true;
        // GlobEvent.emit('AUTO_PLAY',true);
    },

    /**
     * 玩法介绍
     */
    onClickInstructions: function () {
        let self = this;
        if (!this.rule) {
            cc.loader.loadRes('game/mahjong/mahScene1/prefab/rule/rule', cc.Prefab, function (error, prefab) {

                if (error) {
                    cc.error(error.message || error);
                    return;

                }
                cc.log('加载成功')
                self.rule = cc.instantiate(prefab);

                self.rule.x = cc.winSize.width / 2;
                self.rule.y = cc.winSize.height / 2;
                self.rule.parent = cc.director.getScene();
                let controller = self.rule.getChildByName("controller").getComponent("rule");
                controller.setRuleFlag(self.ruleFlag);
                controller.setExpend(self.expend);
                self.refreshInstructions();
            });
        } else {
            self.refreshInstructions();
        }
    },

    refreshInstructions:function()
    {
        this.refreshMenuActive();
        this.rule.active = true;
    },
    refreshMenuActive:function()
    {
        if (this.roomType < 20){
            this.roommenu.active = !this.roommenu.active;
            this.chatNode.active = !this.roommenu.active;
            if(this.menuIcon1 && this.menuIcon2){
                this.menuIcon1.active = !this.roommenu.active;
                this.menuIcon2.active = this.roommenu.active;
            }
        }else {
            this.roommenu.active = !this.roommenu.active;
            if(this.menuIcon1 && this.menuIcon2){
                this.menuIcon1.active = !this.roommenu.active;
                this.menuIcon2.active = this.roommenu.active;
            }
        }

    },

    onClickMessage : function(){

    },

    onClickVoice : function(){
        ///////-----cc.log('onClickVoice')
    },
    onDestroy:function()
    {
        pomelo.removeAllListeners("RCMD_Dao");
        pomelo.removeAllListeners("RCMD_Expend");
        GlobEvent.removeAllListeners("chuntianFinished");
    },
});
