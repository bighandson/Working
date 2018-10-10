var GamePlayer = require('GamePlayer');
var LoadGame = require('LoadGame');
const CfgGame = require("CfgGame");
var Porp = require("Prop");
var PING = require('Ping')
var config = require('Config');
const SSSCommand = require('SSSCommand');
var WanFa = require('Wanfa');
const MAX_RES_NUM = 5;
var Friend = require('Friend')
cc.Class({
    extends: cc.Component,
    properties: {
        players: {
            default: [],
            type: cc.Node
        },
        // normalButtons:cc.Node,
        // roomButtons:cc.Node,
        roomInfo: cc.Node,
        voiceTipsPrefab: cc.Prefab,
        chatMsgBubblePrefab: cc.Prefab,
        lookAnimPrefab: cc.Prefab,
        playerInfoDialogPrefab: cc.Prefab,
        propAnimPrefab: cc.Prefab,
        sssGunPrefab: cc.Prefab,
        cardJushu: cc.Node,//房卡局数
        mapaiNode: cc.Node,//马牌
        resultPrefab: cc.Prefab,
        timeLabel: cc.Node,
        changePrefab: cc.Prefab,
        wifi: cc.Node,
        battery: cc.Node,
        batteryTexture: cc.Node,
        wanfa: cc.Label,
        // tiqian : cc.Node,  //提前开始
        difen: cc.Node,
        taifei: cc.Node,
        gameMenu: cc.Node,
        clock: cc.Node,
        time: cc.Label,
        message : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        showLoadingAni();
        this._initDataFinish = false;

        //最大人数
        this.MAX_PLAYERS = 5;
        //init start
        SssManager.controller = this;
        SssManager.designResolution = this.node.parent.getComponent(cc.Canvas).designResolution;
        //加载资源
        this.loadRes();
        //重置玩家
        GamePlayer.reset();
        this.addListeners();
        this.roomButtons = this.gameMenu.getChildByName('gamebtns').getChildByName('yaoqing');
        this.tiqian = this.gameMenu.getChildByName('gamebtns').getChildByName('tiqiankaishi');
        this.normalButtons = this.gameMenu.getChildByName('gamebtns').getChildByName('zhunbei');
        // this.playerPos = [[0,-210],[0,280]];
        this.playerPos = [[0, 220], [0, 455]];
        this.playerPos2 = [[0, 220], [0, 220]];
        // this.pokersPrefabPos = [cc.p(500,20),cc.p(720,270),cc.p(500,485),cc.p(240,270)];
        this.pokersPrefabPos = [cc.p(490,20),cc.p(800,200),cc.p(800,450),cc.p(140,450),cc.p(140,200)];
        this.pokersPrefabPos2 = [cc.p(490,20),cc.p(800,210),cc.p(490,500),cc.p(490,500),cc.p(140,200)];
        pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
        // pomelo.on('RCMD_MatchOver',this.RCMD_MatchOver.bind(this));

        this.timeed();
        this.schedule(function () {
            // 这里的 this 指向 component
            this.timeed();
        }, 60);


        let self = this;
        let path = 'hall/friendInfo/friendInfo'
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            self.playerMessage = prefab;
        });
        PING.BindEvent(function (event) {
            if (event.type == 1) {  // 良好
                getSpriteFrameByUrl('game/majong/mahScene1/texture/wifi/wifi-3', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 2) {  // 一般
                getSpriteFrameByUrl('game/majong/mahScene1/texture/wifi/wifi-2', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 3) {  // 差
                getSpriteFrameByUrl('game/majong/mahScene1/texture/wifi/wifi-1', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }
        });

        PING.StartPing(300);


        var battery = wxapi.getCurrentBattery();
        cc.log('battery', battery);
        if (battery < 0) {
            self.batteryTexture.active = false;
        } else {
            self.battery.getComponent(cc.ProgressBar).progress = battery / 100;
            self.batteryTexture.active = true;
            cc.log('battery', battery);

        }
        this.schedule(function () {
            var battery = wxapi.getCurrentBattery();
            if (battery > 0) {
                self.battery.getComponent(cc.ProgressBar).progress = battery / 100;
            }

        }, 300);




        self.isFristGame = false
    },

    timeed: function () {
        var myDate = new Date()
        let x = myDate.getHours(); //获取当前小时数(0-23)
        let y = myDate.getMinutes(); //获取当前分钟数(0-59)
        if (parseInt(x) < 10) {
            x = '0' + x
        }
        if (parseInt(y) < 10) {
            y = '0' + y
        }
        this.timeLabel.getComponent(cc.Label).string = x + ':' + y;
    },

    onTiQianClick: function () {
        PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
            {
                cmd: SSSCommand.REQ_CMD.CMD_TCC_REQUESTSTART,
                data: {
                    userid: UserCenter.getUserID(),
                }
            }, function (data) {
                cc.log(data);
            });
    },

    checkLoadRes: function () {
        if (this.loadCount == MAX_RES_NUM) {
            cc.log("res completed initGame");
            //资源加载完成
            SssManager.isResLoadComplete = true;
            this.initGame();
        }
    },

    /**
     * 游戏初始化
     */
    initGame: function () {
        // 语音聊天
        this.node.on('DISPLAY_VOICE', this.displayVoice, this);
        this.node.on('HIDE_VOICE', this.hideVoice, this);
        //聊天
        this.node.on('SHOW_CHAT_MSG', this.showChatMsg, this);
        this.node.on('HIDE_CHAT_MSG', this.hideChatMsg, this);
        //道具
        this.node.on('SHOW_DAO', this.showDao, this);
        this.node.on('HIDE_DAO', this.hideDao, this);
        //

        this.node.on("ROLL_OVER", this.rollOver, this);
        // //监听是否需要开始托管模式（三次超时后就开启）
        // this.node.on("OPEN_AUTO_PLAY",this.openAutoPlay,this);
        //
        //道具使用监听
        pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));

        for(let i = 0; i < this.players.length; i++){
            this.players[i].on(cc.Node.EventType.TOUCH_START,this.onPlayer,this);
        }
        this.fangzhuxx = false;
        hideLoadingAni();
    },

    displayVoice: function (event) {
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('displayVoice', userid, chair);
        if (!this.voiceTips) {
            this.voiceTips = cc.instantiate(this.voiceTipsPrefab);
        }

        this.voiceTips.parent = this.players[chair];
        this.voiceTips.x = (chair == 0 || chair == 3) ? 20 : -20;
        this.voiceTips.active = true;
    },

    hideVoice: function () {
        cc.log('hideVoice');
        if (!!this.voiceTips) {
            this.voiceTips.active = false;
        }
    },

    showChatMsg: function (event) {
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        let chatId = event.detail.chatId;
        let pos;
        if (chatId < 100) {
            //常用语
            if (!this.chatMsgBubbleArray) {
                this.chatMsgBubbleArray = [];
            }

            let chatMsgBubble = this.chatMsgBubbleArray[chair];
            if (!chatMsgBubble) {
                chatMsgBubble = cc.instantiate(this.chatMsgBubblePrefab);
                chatMsgBubble.parent = this.players[chair];
                if (chair == 0 || chair == 4) {
                    pos = cc.v2(-8, 60);
                } else if (chair == 1) {
                    pos = cc.v2(-82, 57);
                } else if (chair == 3) {
                    pos = cc.v2(70, -30);
                } else {
                    pos = cc.v2(-141, -46);
                }
                chatMsgBubble.setPosition(pos);
                this.chatMsgBubbleArray[chair] = chatMsgBubble;
            }
            chatMsgBubble.active = true;
            let con = chatMsgBubble.getComponent("chatMsgBubble");
            con.onShow(chair, this.players[chair].sex, chatId);

        } else {
            cc.log("表情信息" + chatId);
            if (!this.lookAnimArray) {
                this.lookAnimArray = [];
            }

            let lookAnim = this.lookAnimArray[chair];
            if (!lookAnim) {
                lookAnim = cc.instantiate(this.lookAnimPrefab);
                lookAnim.parent = this.players[chair];
                if (chair == 0 || chair == 4) {
                    pos = cc.v2(100, 60);
                } else if (chair == 1) {
                    pos = cc.v2(-160, 33);
                } else if (chair == 3) {
                    pos = cc.v2(100, -83);
                } else {
                    pos = cc.v2(-127, -83);
                }
                lookAnim.setPosition(pos);
                this.lookAnimArray[chair] = lookAnim;
            }
            lookAnim.active = true;
            let lookAnimController = lookAnim.getComponent("lookAnimController");
            lookAnimController.playAnim(chair, chatId % 100);
        }
    },

    hideChatMsg: function (event) {
        let chair = event.detail;
        if (this.chatMsgBubbleArray) {
            let chatMsgBubble = this.chatMsgBubbleArray[chair];
            if (chatMsgBubble && chatMsgBubble.active) {
                chatMsgBubble.active = false;
            }
        }

        if (this.lookAnimArray) {
            let lookAnim = this.lookAnimArray[chair];
            if (lookAnim && lookAnim.active) {
                lookAnim.active = false;
            }
        }

    },

    showDao: function (data) {
        // let data = event.detail;
        let self = this;
        if (this.daoArray == null) {
            this.daoArray = [];
        }

        let sourceChair = this.getChairByUserid(data.suserid);
        let propAnim = this.daoArray[sourceChair];
        if (propAnim == null) {
            propAnim = cc.instantiate(self.propAnimPrefab);
            propAnim.parent = this.node.parent;
            this.daoArray[sourceChair] = propAnim;
        }


        let propAnimController = propAnim.getComponent("propAnimController");
        let sourcePlayer = this.players[this.getChairByUserid(data.suserid)];

        // if(this.roomType != 2)
        // {
        //     //更新游戏豆
        //     if(data.suserid == UserCenter.getUserID())
        //     {
        //         sourcePlayer.getChildByName("beans").getComponent(cc.Label).string = formatNum(UserCenter.userInfo.youxibiNum);
        //     }else {
        //         Porp.getProplist(function(data1,data2) {
        //             let ret = data2.results;
        //             if (ret) {
        //                 for (let i = 0; i < ret.length; i++) {
        //                     let obj = ret[i];
        //                     if(obj.bh == data.daobh)
        //                     {
        //                         sourcePlayer.beans -= parseInt(obj.dj);
        //                         sourcePlayer.getChildByName("beans").getComponent(cc.Label).string = formatNum(sourcePlayer.beans);
        //                     }
        //                 }
        //             }
        //         });
        //     }
        // }

        let targetPlayer = this.players[this.getChairByUserid(data.ruserid)];
        //！！注意，active = false的情况下，无法启动runAction
        propAnim.active = true;
        propAnimController.playAnim(sourcePlayer.getPosition(), targetPlayer.getPosition(), data.daobh);
    },
    hideDao: function (event) {
        let chair = parseInt(event.detail);
        if (this.daoArray && this.daoArray[chair]) {
            this.daoArray[chair].active = false;
        }
    },

    openAutoPlay: function () {
        if (this.autoPlay && this.autoPlay.active) {
            //已经处于托管状态了
            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY', true);
    },


    RCMD_Dao: function (data) {
        //显示道具
        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;


        if (data.flag == 0) {
            cc.log("使用道具成功", data);
            if (data.suserid == UserCenter.getUserID()) {
                //如果是玩家自己使用，更新游戏币
                //UserCenter.updateYouxibiNum(-data.consume);
            }
            // this.controller.emit("SHOW_DAO",data);
            this.showDao(data);
        } else {
            if (data.flag == 1) {
                showAlert(CfgGame.alertData.YOUXIBI_LESS);
            }
        }
    },

    /**
     * 监听
     */
    addListeners: function () {
        // 消息队列
        for (var i = 0; i < SssManager.msgRCMDQueue.length; i++) {
            var msg = SssManager.msgRCMDQueue[i];
            // cc.log(msg);
            this.node.on(msg, this[msg].bind(this));
        }
        //不需要加入队列的消息
        for (var i = 0; i < SssManager.msgRCMDList.length; i++) {
            var msg = SssManager.msgRCMDList[i];
            this.node.on(msg, this[msg].bind(this));
        }
    },

    /**
     * 移除监听
     */
    removeListeners: function () {
        for (let i = 0; i < SssManager.msgRCMDQueue.length; i++) {
            var msg = SssManager.msgRCMDQueue[i];
            this.node.off(msg, this[msg].bind(this));
        }

        //不需要加入队列的消息
        for (let i = 0; i < SssManager.msgRCMDList.length; i++) {
            var msg = SssManager.msgRCMDList[i];
            this.node.off(msg, this[msg].bind(this));
        }
    },


    onPlayer: function (event) {
        let self = this;
        if (this.roomType != 1) {
            return
        }
        let player = event.currentTarget;
        if(player.userid == UserCenter.getUserID()){
            return;
        }
        this.playerMessagePrefab = cc.instantiate(this.playerMessage);
        this.playerMessagePrefab.parent = this.node.parent;
        showLoadingAni()
        Friend.SceachFriends(player.userid, '', function (err, data) {

            if (!err) {
                let info = data.results[0]
                let playerInfoDialogController = self.playerMessagePrefab.getComponent("friendInfoScript");

                Friend.checkIsFriend(player.userid,'',function (err,data) {
                    hideLoadingAni()
                    if(!err){
                        cc.log(data)
                        playerInfoDialogController.setData(info,'',data.results[0].relation);
                    }
                })


            }
        })
        // let player = event.currentTarget;
        // if (!this.playerInfoDialog) {
        //     this.playerInfoDialog = cc.instantiate(this.playerInfoDialogPrefab);
        //     this.playerInfoDialog.parent = this.node.parent;
        // }
        //
        // if (player.chair == 0) {
        //     this.playerInfoDialog.x = player.x;
        //     this.playerInfoDialog.y = player.y + 70;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        // } else if (player.chair == 1) {
        //     this.playerInfoDialog.x = player.x - this.playerInfoDialog.width / 2 - player.width / 2;
        //     this.playerInfoDialog.y = player.y;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        //
        // } else if (player.chair == 2) {
        //     this.playerInfoDialog.x = player.x - 120;
        //     this.playerInfoDialog.y = player.y - this.playerInfoDialog.height / 2 - player.height / 2;
        //     if (this.playerInfoDialog.x > 1334 - this.playerInfoDialog.width / 2) {
        //         this.playerInfoDialog.x = 1334 / 2;
        //     }
        // } else {    //add by sword chair=3或4处理方式一样吗
        //     this.playerInfoDialog.x = player.x + this.playerInfoDialog.width / 2 + player.width / 2;
        //     this.playerInfoDialog.y = player.y - 120;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        // }
        //
        // cc.log("x,y " + this.playerInfoDialog.x + "," + this.playerInfoDialog.y);
        // let playerinfo = GamePlayer.getPlayer(player.userid);
        // let playerInfoDialogController = this.playerInfoDialog.getComponent("playerInfoDialogController");
        // playerInfoDialogController.onShow(playerinfo, this.roomType);
        //
        // // this.playerInfoDialog.parent = this.players[chair];
    },


    RCMD_Start: function (event) {
        cc.log("RCMD_Start");
        cc.log(event);
        let self = this;
        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        if (!this.currMathOverFlag) {
            //判断人齐了吗
            // this.canShowReady();
            this.roomButtons.active = false;
            this.tiqian.active = false;
            this.normalButtons.active = true;
            if (this.roomType < 2) {
                this.clock.active = true
                this.time.string = 15;
                this.schedule(self.daoJiShi, 1)
            }

            cc.log("============判断人齐了吗================")
        }
        this.userid = 0;
        SssManager.rule.msgBlocked = false;
    },

    RCMD_Ready: function (event) {
        cc.log("RCMD_Ready");
        cc.log(event);
        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        if (chair == 0) {
            this.normalButtons.active = false;
        }
        this.setReady(chair, true);
        SssManager.rule.msgBlocked = false;
    },

    RCMD_exit: function (event) {

        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('RCMD_exit : ', userid, chair);
        this.players[chair].active = false;
        // this.clearPlayStatus(chair);
        GamePlayer.removePlayer(data.userid);
        if(data.userid == UserCenter.getUserID()){
            SssManager.rule.msgBlocked = true;
        }else{
            SssManager.rule.msgBlocked = false ;
        }

    },

    RCMD_Kick: function (event) {
        cc.log("RCMD_Kick");
        cc.log(event);
    },

    RCMD_close: function (event) {
        cc.log("RCMD_close");
        cc.log(event);
    },

    RCMD_GameStart: function (event) {
        cc.log("RCMD_GameStart");
        cc.log(event);
    },

    RCMD_Timeout: function (event) {
        cc.log("RCMD_Timeout");
        cc.log(event);
    },

    RCMD_Expend: function (data) {
        cc.log('RCMD_Expend');
        cc.log(data);
        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        var expend = data.data;
        let self = this;
        if (expend.CMD == '001') {
            self.expend = expend.extData;
        }
        else if (expend.CMD == '002') {
            cc.log('cmd002')
            var ar = expend.ar;
            for (let i = 0; i < ar.length; i++) {
                if (ar[i].zhlx == 4) {
                    UserCenter.setCardNum(ar[i].je);
                }
                if (ar[i].zhlx == 3) {
                    UserCenter.setYouxibiNum(ar[i].je);
                }
            }
        }
        else if (expend.CMD == '003') {
            cc.log('cmd003')
            let self = this;
            this.userid = expend.userid;
            this.refreshJushu(0, SssManager.controller.totalGame);
            this.isGameOver = false;
            let player;
            for (let i = 0; i < 5; i++) {
                if (!!this.players[i]) {
                    player = this.players[i];
                    this.refreshScore(player, 0);
                    player.getChildByName('fangzhuSprite').active = false;
                }
            }
            var fangzhu = this.getChairByUserid(expend.userid);
            this.players[fangzhu].getChildByName('fangzhuSprite').active = true;
            this.currMathOverFlag = false;
            if (this.fangzhuxx == false) {
                this.createRoomID = expend.userid;
                this.fangzhuxx = true;
            }

        }
        else if (expend.CMD == '004') {
            cc.log('cmd004', expend)
            self.kicknum = expend.exit;
            self.renew = expend.renew;
        }
        else if (expend.CMD == '005') {
            cc.log('cmd005', expend)
            self.buttonCheck = expend.showready;
            if (!!self.buttonCheck) {
                self.normalButtons.active = true;
                self.roomButtons.active = false;
            } else {
                self.normalButtons.active = false;
                self.roomButtons.active =  wxapi.isInstallWeChat();
            }
        } else if (expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10000) {
            cc.log('CMD_EXPAND_SUB_10000', expend);
            this.maxpoint = expend.maxpoint;
            this.minpoint = expend.minpoint;
        } else if (expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10003) {
            cc.log('CMD_EXPAND_SUB_10003', expend);
            let uid = expend.UID;
            let money = expend.Money;
            let chair = this.getChairByUserid(uid);
            let player = this.players[chair];
            this.refreshScore(player, money);
        }else if(expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10004){
            let users = expend.users
            for(let i =0 ;i<users.length;i++){
                let chair = this.getChairByUserid(users[i].userid);
                let money = users[i].zhye;
                let player = this.players[chair];
                this.refreshScore(player, money);
                if(users[i] == UserCenter.getUserID()){
                    UserCenter.setYouxibiNum(money);
                }
            }
        }
        // else if(expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10002){
        //     SssManager.ruleInfo.m_nTruePlayers = expend.PlayerCount;
        // }
    },

    RCMD_signup: function (event) {
        cc.log("RCMD_signup");
        cc.log(event);
    },

    RCMD_MobileSignUp: function (event) {
        cc.log("RCMD_MobileSignUp");
        cc.log(event);
    },

    RCMD_PlayerStatus: function (event) {

        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        cc.log("RCMD_PlayerStatus");
        let data = event.detail;
        let userid = data.userid;
        let status = data.status;
        let chair = this.getChairByUserid(userid);
        this.setOfflineStatus(chair, status);
    },

    RCMD_initParam: function (event) {
    },

    RCMD_ServerHeartOut: function (event) {
        cc.log("RCMD_ServerHeartOut");
        cc.log(event);
    },

    RCMD_TaskSeat: function (event) {
        cc.log("RCMD_TaskSeat");
        cc.log(event);
        this.seatId = event.detail.seatid;
        this.tableId = event.detail.tableid;
    },

    RCMD_SitIn: function (event) {
        cc.log("RCMD_SitIn");
        cc.log(event);

        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;
        let self = this;
        let data = event.detail;
        cc.log('入座玩家信息', data)
        for (var i = 0; i < data.users.length; i++) {
            let user = data.users[i];
            if(user.userid == UserCenter.getUserID()){
                if(self.roomType ==1){
                    self.message.active = true
                    self.tableid = user.tableid;
                    cc.log(self.tableid)
                    let tishi = '房号'+self.tableid +'  ';
                    if (self.maxpoint) {
                        tishi +=  formatNum(self.minpoint) + " - " + formatNum(self.maxpoint);
                    } else {
                        tishi +=  formatNum(self.minpoint) + " 起";
                    }
                    self.message.getChildByName('message').getComponent(cc.Label).string = tishi;
                }

            }
            let player = GamePlayer.addPlayer(user);
            if (!player) continue;
            let chair = this.getChairBySeatId(user.seatid);
            this.setChairInfo(player, chair);
            if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 3 || SssManager.ruleInfo.m_nTruePlayers == 5)) {
                // this.players[chair].x = this.playerPos[1][1];
                this.players[chair].x = 583;
                this.players[chair].y = 175;
            }
        }
        this.node.emit('msgQueneStart')
        if (GamePlayer.getNum() == SssManager.ruleInfo.m_nTruePlayers && this.roomButtons.active) {
            this.roomButtons.active = false;
        }
        if (GamePlayer.getNum() == SssManager.ruleInfo.m_nTruePlayers && this.tiqian.active){
            this.tiqian.active = false;
        }
    },

    RCMD_Result: function (event) {
        cc.log("RCMD_Result");
        cc.log(event);
        let data = event.detail;
    },

    /**
     * 房卡房间结算
     */
    RCMD_MatchOver: function (event) {

        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令
        if (!this._initDataFinish) return;

        var data = event.detail;
        this.fangzhuxx = false;

        if (this.currGame == this.totalGame) {

            //正常
            this.showMathOver(data, 2);
        } else {
            //协商解散
            this.showMathOver(data, 3);
        }
    },

    /**
     * 显示结算
     * @param data
     * @param type
     */
    showMathOver: function (data, type) {
        let self = this;
        if (this.isGameOver) {
            return;
        } else {
            if (type == 3 || type == 2) {
                this.isGameOver = true;
            }
        }

        if (type == 1) {
            this.normalButtons.active = true;
            SssManager.rule.isPlaying = false;
            if (this.roomType < 2) {
                this.clock.active = true
                this.time.string = 10;
                this.schedule(self.daoJiShi, 1)
            }

        } else {
            //加载结算面板
            if (this.result == null) {
                // this.result = cc.instantiate(this.resultPrefab);


                let path;
                if (!!this.game.prefab.gameOverRank) {
                    path = 'game/{0}/prefab/gameOverRank/gameOverRank'.format(self.game.sourcePath);
                } else {
                    path = 'style/gameOverRank/gameOverRank'
                }
                cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
                    if (err) {
                        cc.log(err);
                        return;
                    }
                    self.result = cc.instantiate(prefab);
                    self.result.parent = self.node.parent;
                    self.result.setLocalZOrder(99000);
                    self.result.active = false;

                    self.resultCallback(data, type);
                });
            } else {
                this.resultCallback(data, type);
            }

        }

    },

    /**
     * 显示结算面板
     * type 1=本局结算 2=游戏结算
     */
    resultCallback: function (data, type) {
        this.result.active = true;
        // var sss3Result = this.result.getChildByName("sss3Result").getComponent("sss3Result");
        var controller = this.result.getComponent('gameOverRankScript');

        controller.show(data.users,data.count);


        // if(type == 2)
        // {
        //     this.currGameex = this.totalGame+1;
        //     cc.log('resultCallback type=2: ',this.createRoomID);
        //     let i;
        //     for(i = 0;i<5;i++){
        //         if(!!data.users[i]){
        //             var player = data.users[i];
        //             var playData = GamePlayer.getPlayer(player.userid);
        //             data.users[i].userImage=playData.userImage;
        //             data.users[i].nick=playData.nick;

        //         }
        //     }
        //     cc.log('dataxxxx',data);
        //     sss3Result.setGameOverData(data);
        //     sss3Result.onShow(this.createRoomID,data,2);
        // }else if(type == 3)
        // {
        //     //协商解散直接弹出
        //     cc.log('resultCallBack type=3',this.ruleController);
        //     sss3Result.onShow(this.createRoomID,data,2);
        // }
        // else {
        //     cc.log('createroomidxxxxx: ',this.createRoomID);
        //     sss3Result.onShow(this.createRoomID,data,type);
        // }
    },


    RCMD_Command: function (event) {
        let data = event.detail;
        let cmd = data.cmd;

        //add by sword  2017-11-15 15:30
        //todo: 未处理服务下发初始化消息之前不处理任何指令

        if (!this._initDataFinish && cmd != SSSCommand.RESP_CMD.RCMD_INITDATA) {
            return;
        }


        let retData = data.data;
        if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
            cc.log(cmd + ' RCMD_INITDATA:   ', retData);
            this.basescore = retData.basescore;
            this.roomType = retData.roomType;

            this.gameid = retData.gameid;
            this.game = config.getGameById(this.gameid);
            this.ruleController = this.node.getComponent(this.game.rule);
            this.ruleFlag = retData.ruleFlag;             // 游戏规则
            this.roomuserid = retData.createRoomID;       //房主
            this.gameMenu.getComponent('gameMenuScript').setRoomShow(retData.roomType)

            this.createRoomID = retData.createRoomID;
            this.expend = retData.expend;

            SssManager.getRule(this.ruleFlag, this.expend);

            this.seatId = retData.myseatid;

            // this.timeLabel.active = true;
            if (this.roomType < 2) {

                // SssManager.ruleInfo.m_nTruePlayers = 4

                //初始化牌组,以防后进的人未收到发牌消息
                this.acard = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];

                this.difen.active = parseInt(this.basescore) > 0

                this.taifei.active = parseInt(this.deskfee) > 0

                this.difen.children[0].getComponent(cc.Label).string = this.basescore;

                this.taifei.children[0].getComponent(cc.Label).string = this.deskfee;

                SssManager.ruleInfo.m_nTruePlayers = parseInt(((this.expend >> 1) & 0x0f));  //真实玩家
                cc.log('真实玩家数量=====',this.expend,SssManager.ruleInfo.m_nTruePlayers)
                // 普通房间
            } else if (this.roomType == 2) { // 房卡房间
                //
                // SssManager.getRule(this.ruleFlag,this.expend);
                // var wanfa = (!!SssManager.ruleInfo.m_bAllTeShuCardType?"红波浪":"多一色")
                // var zhifu = ((SssManager.ruleInfo.m_expend & 0x01)==0x01?"AA支付" : "房主支付")
                // var renshu = SssManager.ruleInfo.m_nTruePlayers;
                this.roomInfo.active = true;
                this.wanfa.string = this.getWanFa(this.ruleFlag, this.expend)
                let mapaiType = SssManager.mapai[0];

                if (mapaiType != -1) {
                    //有马牌
                    let self = this;
                    let resName;
                    this.mapaiNode.active = true;
                    self.mapaiNode.getChildByName("mapaiSprite").active = false;
                    if (mapaiType == 1) {
                        resName = "马牌：红桃A";
                    } else if (mapaiType == 5) {
                        resName = "马牌：红桃5";
                    } else if (mapaiType == 10) {
                        resName = "马牌：红桃10";
                    }

                    // cc.loader.loadRes('game/shisanshui/sssScene1/texture/'+resName,cc.SpriteFrame,function(error,spriteFrame){
                    //     if (error) {
                    //         cc.error(error.message || error);
                    //         return;
                    //     }
                    //     self.mapai.getChildByName("mapaiSprite").getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    //     self.mapaiNode.getChildByName("mapaiSprite").active = true;
                    // });
                    self.mapaiNode.getChildByName("mapaiSprite").getComponent(cc.Label).string = resName;
                    self.mapaiNode.getChildByName("mapaiSprite").active = true;
                }

                // SssManager.soundCtrl = require(this.game.sound || 'SSSSound');  // 默认普通话
                SssManager.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话

                this.roomInfo.children[0].active = false;
                this.roomInfo.children[1].active = false;
                this.roomInfo.children[2].getComponent(cc.Label).string = retData.roomcode;
                this.roomcode = '房号:' + retData.roomcode;//结算时会用到
                // this.roomInfo.children[4].getComponent(cc.Label).string = SssManager.ruleInfo.m_nTruePlayers;

                //房卡局数刷新
                this.cardJushu.active = true;
                this.refreshJushu(retData.currGame, retData.totalGame);

                // 房卡房 2人以上 才出现 提前开始
                if (this.currGame == 0) {
                    this.roomButtons.active =  wxapi.isInstallWeChat();
                    this.tiqian.active = UserCenter.getUserID() == this.roomuserid;
                }
                let self = this;
                //加载房卡组件
                var roomcontroller = this.addComponent("CardRoomController");
                roomcontroller.init(data, self);
                //玩家组合好的牌（从服务器活获得），UID为索引
                this.playerPokers = [];

                for (let i = 0; i < this.MAX_PLAYERS; i++) {
                    this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
                }

                // this.roomButtons.active = true;
            }
            if (this.roomType != 2) {
                this.playerPokers = [];
                SssManager.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话
            }

            //配牌时显示
            this.playerbackPokers = [];

            //add by sword  2017-11-15 15:30
            //todo: 后续可以处理服务端下发的数据包
            this._initDataFinish = true;
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_GameStart) {

            //开始游戏,清理一下界面
            for (let index = 0; index < 5; index++) {
                this.setGameStartStatus(index);
            }
            this.roomButtons.active = false;
            this.normalButtons.active = false;
            //清理完成
            SssManager.rule.msgBlocked = false;
            //初始化数据start
            this.isRollOver = false;

            this.basescore = retData.basescore
            this.deskfee = retData.deskfee;

            // 房卡房 不显示底分 台费
            if (this.roomType != 2) {
                this.difen.active = true;
                this.difen.children[0].getComponent(cc.Label).string = this.basescore;
                this.taifei.active = true;
                this.taifei.children[0].getComponent(cc.Label).string = this.deskfee;
            }

            //初始化数据end
            this.refreshJushu(retData.currgame, retData.totalgame);
        }
        else if (cmd == SSSCommand.RESP_CMD.RCMD_SendCard) {
            //发牌
            cc.log('cardtype',retData.cardtype);
            this.acard = retData.acard;
            this.cardtype = retData.cardtype;
            let cardNum = retData.cardNum;
            let firstSeat = retData.firstSeat;
            this.showMyPokers(this.cardtype, this.acard);
        }
        else if (cmd == SSSCommand.RESP_CMD.RCMD_CardHand) {
            cc.log('摊牌之后收到牌', retData);
            //摊牌之后收到牌
            let SpecialCardType = retData.SpecialCardType;
            let pokersIndexArray = retData.pokersIndexArray;
            let uid = retData.uid;

            let type = 1;
            if (SpecialCardType == 1  && uid == UserCenter.getUserID()) {
                //特殊牌型
                type = 3;
            }

            let chair = 0;
            //显示自己的牌
            if (uid == UserCenter.getUserID()) {

                if (this.changeDialog != null) {
                    this.changeDialog.getChildByName('change').getComponent('change').hide();
                }
                
                let pokersPrefab = this.playerPokers[chair];
                if (pokersPrefab == null) {
                    pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    this.playerPokers[chair] = pokersPrefab;
                    pokersPrefab.parent = this.node;
                }
                pokersPrefab.active = true;
                let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
                // if (this.roomType < 2) {
                //     pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                // } else {
                    if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                        pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
                    } else {
                        pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                    }
                // }
                cc.log('SssManager.ruleInfo.m_nTruePlayers', SssManager.ruleInfo.m_nTruePlayers);
                let data = [];
                for (let i = 0; i < pokersIndexArray.length; i++) {
                    data[i] = this.acard[parseInt(pokersIndexArray[i])];
                }
                sss1Pokers.onShow(data, this.players[chair], type);
            } else {
                chair = this.getChairByUserid(uid);
                let pokersPrefab = this.playerPokers[chair];
                if (pokersPrefab == null) {
                    pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    this.playerPokers[chair] = pokersPrefab;
                    pokersPrefab.parent = this.node;
                }
                pokersPrefab.active = true;
                let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
                // if (this.roomType < 2) {
                //     pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                // } else {
                    if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                        pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
                    } else {
                        pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                    }
                // }
                cc.log('SssManager.ruleInfo.m_nTruePlayers', SssManager.ruleInfo.m_nTruePlayers);
                let data = [];
                for (let i = 0; i < pokersIndexArray.length; i++) {
                    data[i] = this.acard[parseInt(pokersIndexArray[i])];
                }
                sss1Pokers.onShow(data, this.players[chair], type);
            }
            //完成组牌

            chair = this.getChairByUserid(uid);

            this.players[chair].getChildByName("completeSprite").active = true;
            this.players[chair].getChildByName("peipaiSprite").active = false;
            if (this.playerbackPokers[chair] && chair != 0) {
                this.playerbackPokers[chair].active = false;
            }

            let player = this.players[chair];
            if (chair == 0) {
                player.x = -this.playerPos[0][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 5 || SssManager.ruleInfo.m_nTruePlayers == 3)) {
                // player.x = this.playerPos[1][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
            //   if(self.roomType < 2){
            //     this.players[chair].x = this.playerPos[1][1];
            //   }else{
            //     this.players[chair].x = this.playerPos2[1][1];
            //   }
                player.x = -this.playerPos[0][1];
            }

            //放入玩家牌的列表
            // this.playerPokers[uid] =pokersIndexArray;
            //this.testPokers(chair,pokersIndexArray);
            // for(let index = 0;index < pokersIndexArray.length;index++)
            // {
            //     // acard[index] = SssManager.getCardTypeNum(parseInt(acard[index]).toString(16));
            // }
            // this.showChangeDialog(acard);
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_TSC_GAMEEND) {
            //收到结果
            // this.roomButtons.active = false;
            this.normalButtons.active = false;
            for(let i = 0;i < 5; i++){
                if (this.playerbackPokers[i] && i < this.playerbackPokers.length){
                    this.playerbackPokers[i].active = false;
                }
                if(this.playerPokers[i]  && i < this.playerPokers.length){
                    this.playerPokers[i].active = false;
                }
            }
            this.showResult(retData);
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_RestoreGame) {
            //恢复牌局
            if (retData.CommState == 1) {
                this.roomButtons.active = false;
                //玩家组合好的牌（从服务器活获得），UID为索引
                this.playerPokers = [];
                this.restoreGame(retData);
            }
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_TCC_REQUESTSTART) {
            this.ruleFlag = retData.ruleflag;
            this.expend = retData.expend;

            this.clearPlayers();
            SssManager.getRule(this.ruleFlag);
            let users = Object.keys(GamePlayer.players)
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].active = false;
            }
            for (let i = 0; i < users.length; i++) {
                let player = GamePlayer.getPlayer(users[i]);
                let chair = this.getChairByUserid(users[i]);
                console.log('撒阿达', chair, SssManager.ruleInfo.m_nTruePlayers);
                this.setChairInfo(player, chair);
                if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 3 || SssManager.ruleInfo.m_nTruePlayers == 5)) {
                // this.players[chair].x = this.playerPos[1][1];
                this.players[chair].x = 583;
                this.players[chair].y = 175;
                }
                if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
                    this.players[chair].x = this.playerPos[1][0];
                    this.players[chair].y = 275;
                }
            }
            this.wanfa.string = this.getWanFa(this.ruleFlag, this.expend);
        }
    },

    // 十三水 获取 玩法
    getWanFa: function (ruleFlag, expend) {

        cc.log("玩法参数:", ruleFlag, expend)

        SssManager.getRule(ruleFlag, expend);
        var wanfa = (!!SssManager.ruleInfo.m_bAllTeShuCardType ? "红波浪" : "多一色")
        var zhifu = ((SssManager.ruleInfo.m_expend & 0x01) == 0x01 ? "AA支付" : "房主支付")
        var renshu = SssManager.ruleInfo.m_nTruePlayers;

        let str = wanfa + "  " + zhifu + "  " + renshu + "人"
        // + ' 底分:' + ((expend >> 8) & 0xf);

        return str;
    },


    showMyPokers: function (cardtype, acard) {
        for (let index = 0; index < acard.length; index++) {
            acard[index] = SssManager.getCardTypeNum(parseInt(acard[index]).toString(16));
        }
        // acard = [[1,1],[13,4],[12,3],[12,4],[9,1],[9,2],[9,4],[7,2],[6,1],[6,4],[5,1],[5,2],[2,2]];

        if (cardtype > 0) {
            // if (!SssManager.ruleInfo.m_bAllTeShuCardType) {
            //     let type = 1;
            //     //红波浪模式直接使用特殊牌型
            //     PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
            //         {
            //             cmd: SSSCommand.REQ_CMD.CMD_IS_SPECIAL,
            //             data: {
            //                 userid: UserCenter.getUserID(),
            //                 type: type,
            //             }
            //         }
            //         , function (data) {
            //             cc.log(data);
            //         });
            // } else {
            //     let self = this;
            //     if (self.spcialAlert == null) {
            //         cc.loader.loadRes('style/poker/specialAlert/specialAlertNode', cc.Prefab, function (error, prefab) {
            //             if (error) {
            //                 cc.error(error.message || error);
            //                 return;
            //             }
            //             self.spcialAlert = cc.instantiate(prefab);
            //             self.spcialAlert.parent = self.node.parent;
            //             let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController");
            //             specialAlertController.onShow(cardtype, acard);
            //         });
            //     } else {
            //         let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController");
            //         specialAlertController.onShow(cardtype, acard);
            //     }
            // }
            this.showChangeDialog(acard,true);
        } else {
            //显示组牌界面
            this.showChangeDialog(acard);
        }
    },

    showMyPokersSpecialCallback: function (acard) {
        //播放动画
        //特殊牌型,直接亮牌
        let chair = 0;
        let pokersPrefab = this.playerPokers[chair];
        if (pokersPrefab == null) {
            pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
            pokersPrefab.parent = this.node;
            this.playerPokers[chair] = pokersPrefab;
        }
        let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
        pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
        //特殊牌型展示牌的背面，不播放翻牌动画
        sss1Pokers.onShow(acard, this.players[chair], 3);
    },

    /**
     * 恢复牌局
     * @param retData
     */
    restoreGame: function (retData) {
        for (let i = 0; i < retData.users.length; i++) {
            let data = retData.users[i];
            //是否亮牌
            if (data.islight == 0) {
                //未亮牌
                if (data.userid == UserCenter.getUserID()) {
                    //自己
                    this.cardtype = data.cardtype;
                    this.acard = data.arcard;
                    let bSpecialCardType = data.bSpecialCardType;
                    this.showMyPokers(this.cardtype, this.acard);
                } else {
                    // this.players[this.getChairByUserid(data.userid)].getChildByName("completeSprite").active = true;
                }
                cc.log('恢复配牌显示')
                this.players[this.getChairByUserid(data.userid)].getChildByName("peipaiSprite").active = true;

                let chair = this.getChairByUserid(data.userid);
                if (chair != 0) {
                    let backpokerPrefab = cc.instantiate(SssManager.backpokerPrefab);
                    this.playerbackPokers[chair] = backpokerPrefab;
                    backpokerPrefab.parent = this.node;

                    // if (this.roomType < 2) {
                    //     backpokerPrefab.setPosition(this.pokersPrefabPos[chair]);
                    // } else {
                        if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                            backpokerPrefab.setPosition(this.pokersPrefabPos2[chair]);
                        } else {
                            backpokerPrefab.setPosition(this.pokersPrefabPos[chair]);
                        }
                    // }
                }
            } else {
                //已亮牌
                //显示自己的牌
                if (data.userid == UserCenter.getUserID()) {
                    this.cardtype = data.cardtype;
                    this.acard = data.arcard;
                    let bSpecialCardType = data.bSpecialCardType;
                    let chair = 0;
                    let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
                    this.playerPokers[chair] = pokersPrefab;

                    //从服务端导入各墩牌的排序
                    let grouparr = data._grouparr;
                    let pokersIndexArray = [];
                    for (let i = 0; i < 3; ++i) {
                        for (let j = 0; j < grouparr[i]['ar'].length; ++j) {
                            pokersIndexArray.push(grouparr[i]['ar'][j]);
                        }
                    }
                    cc.log(pokersIndexArray);

                    // if (this.roomType < 2) {
                    //     pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                    // } else {
                        if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                            pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
                        } else {
                            pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                        }
                    // }
                    pokersPrefab.parent = this.node;
                    for (let index = 0; index < this.acard.length; index++) {
                        this.acard[index] = SssManager.getCardTypeNum(parseInt(this.acard[index]).toString(16));
                    }

                    //将牌按墩排序
                    let acardPokers = [];
                    for (let index = 0; index < this.acard.length; index++) {
                        acardPokers[index] = this.acard[pokersIndexArray[index]];
                    }
                    sss1Pokers.onShow(acardPokers, this.players[chair], 1);
                } else {
                    this.cardtype = data.cardtype;
                    this.acard = data.arcard;
                    let bSpecialCardType = data.bSpecialCardType;
                    let chair = this.getChairByUserid(data.userid);
                    let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
                    this.playerPokers[chair] = pokersPrefab;

                    //从服务端导入各墩牌的排序
                    let grouparr = data._grouparr;
                    let pokersIndexArray = [];
                    for (let i = 0; i < 3; ++i) {
                        for (let j = 0; j < grouparr[i]['ar'].length; ++j) {
                            pokersIndexArray.push(grouparr[i]['ar'][j]);
                        }
                    }
                    cc.log(pokersIndexArray);

                    // if (this.roomType < 2) {
                    //     pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                    // } else {
                        if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                            pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
                        } else {
                            pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                        }
                    // }
                    pokersPrefab.parent = this.node;
                    for (let index = 0; index < this.acard.length; index++) {
                        this.acard[index] = SssManager.getCardTypeNum(parseInt(this.acard[index]).toString(16));
                    }

                    //将牌按墩排序
                    let acardPokers = [];
                    for (let index = 0; index < this.acard.length; index++) {
                        acardPokers[index] = this.acard[pokersIndexArray[index]];
                    }
                    sss1Pokers.onShow(acardPokers, this.players[chair], 1);
                }
                //完成组牌
                this.players[this.getChairByUserid(data.userid)].getChildByName("completeSprite").active = true;
                this.players[this.getChairByUserid(data.userid)].getChildByName("peipaiSprite").active = false;
                if (this.playerbackPokers[this.getChairByUserid(data.userid)] && this.getChairByUserid(data.userid) != 0) {
                    this.playerbackPokers[this.getChairByUserid(data.userid)].active = false;
                }
            }

            let chair = this.getChairByUserid(data.userid);
            let player = this.players[chair];
            if (chair == 0) {
                player.x = -this.playerPos[0][1];
            }
            else if (chair == 2 && (retData.users.length == 5 || retData.users.length == 3)) {
                // player.x = this.playerPos[1][1];                
                player.x = 583;
                player.y = 175;
            }
            else if (chair == 2 && (retData.users.length == 2 || retData.users.length == 4)) {
            //   if(this.roomType < 2){
            //     this.players[chair].x = this.playerPos[1][1];
            //   }else{
            //     this.players[chair].x = this.playerPos2[1][1];
            //   }
                player.x = -this.playerPos[0][1];
            }
        }
    },

    /**
     * 刷新局数
     */
    refreshJushu: function (currGame, totalGame) {
        this.currGame = currGame;
        this.totalGame = totalGame;
        this.cardJushu.getChildByName("jushuLabel").getComponent(cc.Label).string = '局数：{0}/{1}'.format(currGame, totalGame);
    },

    showResult: function (retData, isfupan) {
        // this.bFullGun = retData.bFullGun;//全垒打
        // this.bFullSpecial = retData.bFullSpecial;//特殊牌型
        // this.bGun = retData.bGun;//打枪
        // this.bHasSpecial = retData.bHasSpecial;//是否特殊牌型
        // this.turePlayersCount = retData.turePlayersCount;//真实打牌的人个数
        if (!!isfupan) {
            this.fupan = true;
        }
        let self = this;
        this.userarray = retData.userarray;//玩家数据
        this.remaincard = retData.remaincard;//剩下的牌
        this.gunArr = []; //打枪数组
        this.specialArr = [];//特殊牌型数组
        this.allGunArr = [];//全垒打数组 一局比赛只有一个全垒打

        //按照座位录入信息
        for (let i = 0; i < this.userarray.length; i++) {
            let userdata = this.userarray[i];
            let chair = this.getChairBySeatId(userdata.seat);
            if (chair == 0) {
                this.players[chair].x = -this.playerPos[0][1];
            }
            else if (chair == 2 && (this.userarray.length == 5 || this.userarray.length == 3)) {
                // this.players[chair].x = this.playerPos[1][1];
                this.players[chair].x = 583;
                this.players[chair].y = 175;
            }
            else if (chair == 2 && (this.userarray.length == 2 || this.userarray.length == 4)) {
                // if(self.roomType < 2){
                //   this.players[chair].x = this.playerPos[1][1];
                // }else{
                //   this.players[chair].x = this.playerPos2[1][1];
                // }
                this.players[chair].x = -this.playerPos[0][1];

            }
            this.players[chair].getChildByName("completeSprite").active = false;
            this.players[chair].getChildByName("peipaiSprite").active = false;
            if (this.playerbackPokers && this.playerbackPokers[chair] && chair != 0) {
                this.playerbackPokers[chair].active = false;
            }

            //检查是否有打枪
            let gunar = userdata.gunar;
            for (let index = 0; index < gunar.length; index++) {
                if (gunar[index] > 0) {
                    let flag = false;
                    for (let j = 0; j < this.gunArr.length; j++) {
                        if (this.gunArr[j].seat == userdata.seat) {
                            flag = true;
                            break;
                        }
                    }
                    if (!flag) {
                        this.gunArr.push(userdata);
                    }
                }
            }

            //检查是否有全垒打
            if (userdata.fullgunscore > 0) {
                this.allGunArr.push(userdata)
            }

            let pokersPrefab = this.playerPokers[chair];
            if (pokersPrefab == null) {
                pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                pokersPrefab.parent = this.node;
                this.playerPokers[chair] = pokersPrefab;
            } else {
                pokersPrefab.active = true;
            }

            let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
            // if (this.roomType < 2) {
            //     pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
            // } else {
                if (this.userarray.length == 4 || this.userarray.length == 2) {
                    pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
                } else {
                    pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
                }
            // }

            //检查是否是特殊牌型
            if (userdata.specialtype > 0) {
                this.specialArr.push(userdata);
                //特殊牌型展示牌的背面，不播放翻牌动画
                sss1Pokers.onShow(userdata, this.players[chair], 3);
            } else {
                sss1Pokers.onShow(userdata, this.players[chair], 2);
            }
        }

        this.showRemaincard();
        //TODO 比完牌需要判断有没有打枪的
        //TODO 打完抢需要判断有没有特殊牌型
        //TODO 特殊牌型之后需要判断有没有全垒打
    },


    /**
     * 显示剩余的牌
     */
    showRemaincard: function () {
        // let count = 0;
        // for(let i = 0;i < 4;i++)
        // {
        //     let playerNode = this.players[i];
        //     if(playerNode!= null && playerNode.userid == null)
        //     {
        //         let chair = i;
        //         cc.log("chair",chair);
        //         let pokersPrefab = this.playerPokers[chair];
        //         if(pokersPrefab == null)
        //         {
        //             pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
        //             pokersPrefab.parent = this.node;
        //             pokersPrefab.setPosition(SssManager.emptyPokersPos[chair]);
        //             this.playerPokers[chair] = pokersPrefab;
        //         }
        //         pokersPrefab.active = true;
        //         let data = [];
        //         for(let index = 0;index < 13 ; index++)
        //         {
        //             data.push(SssManager.getCardTypeNum(parseInt(this.remaincard[index + count*13]).toString(16)));
        //         }
        //         count++;
        //         let sss1Pokers = pokersPrefab.getComponent("sss3Pokers");
        //         sss1Pokers.onShow(data,playerNode,4);
        //     }
        // }
    },

    //牌翻好了
    rollOver: function (event) {
        if (!!this.fupan) {
            return;
        }
        cc.log("rollOver");
        if (!this.isRollOver) {
            this.isRollOver = true;
            this.checkGun();
        }
    },


    //判断是否有打枪
    checkGun: function () {
        cc.log("checkGun");
        if (this.gunArr.length > 0) {
            let userdata = this.gunArr.shift();
            this.showGun(userdata);
        } else {
            //打枪统一结算
            for (let i = 0; i < this.userarray.length; i++) {
                let userdata = this.userarray[i];
                let chair = this.getChairBySeatId(userdata.seat);
                let playerNode = this.players[chair]
                playerNode.beans += userdata.gunscore;
                // this.refreshScore(playerNode,playerNode.beans);
            }
            this.checkSpecial()
        }
    },

    //判断是否有特殊牌型
    checkSpecial: function () {
        cc.log("checkSpecial");
        if (this.specialArr.length > 0) {
            let userdata = this.specialArr.shift();
            this.showSpecial(userdata);
        } else {
            //特殊牌型统一结算
            for (let i = 0; i < this.userarray.length; i++) {
                let userdata = this.userarray[i];
                let chair = this.getChairBySeatId(userdata.seat);
                let playerNode = this.players[chair]
                playerNode.beans += userdata.specialscorec;
                // this.refreshScore(playerNode,playerNode.beans);
            }
            this.checkAllGun()
        }
    },

    //判断是否有全垒打
    checkAllGun: function () {
        cc.log("checkAllGun");
        if (this.allGunArr.length > 0) {
            let userdata = this.allGunArr.shift();
            this.showSpecial(userdata, true);
        } else {

            //特殊牌型统一结算
            for (let i = 0; i < this.userarray.length; i++) {
                let userdata = this.userarray[i];
                let chair = this.getChairBySeatId(userdata.seat);
                let playerNode = this.players[chair];
                let asdf = userdata.totalwon;
                let lsScore = userdata.curwonmoney;
                playerNode.beans = userdata.totalwon;
                if (chair == 0 && this.roomType == 1) {
                    UserCenter.setYouxibiNum(userdata.totalwon);
                    this.myBeans = userdata.totalwon;
                    if ( this.myBeans < this.minpoint) {
                        this.judgeMoney();
                        playerNode.beans = UserCenter.getYouxibiNum();
                    }
                }
                this.refreshScore(playerNode, playerNode.beans,lsScore);
            }


            for (let i = 0; i < 5; i++) {
                if (!!this.playerPokers[i]) {
                    let pokers = this.playerPokers[i];
                    cc.log("pokers", pokers.active, pokers.x, pokers.y);
                }

            }

            //3秒倒计时
            this.resultcount = 0;
            this.resultScheduleCallback = function () {
                if (this.resultcount == 1) {
                    this.unschedule(this.resultScheduleCallback);
                    let retData = {};
                    retData.users = [];
                    if (this.userarray != null) {
                        for (let i = 0; i < this.userarray.length; i++) {
                            let userdata = this.userarray[i];
                            let chair = this.getChairBySeatId(userdata.seat);
                            retData.users.push({userid: this.players[chair].userid, score: userdata.curwon})
                        }
                    }

                    this.currMathOverFlag = true;
                    // if(this.currGame < this.totalGame)
                    // {

                    PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
                        {
                            cmd: SSSCommand.REQ_CMD.CMD_TCC_SHOWRESULTFINISH,
                            data: {
                                userid: UserCenter.getUserID(),
                            }
                        }
                        , function (data) {
                            cc.log(data);
                        });

                    //本局结算
                    this.showMathOver(retData, 1);
                    //通知服务端，播放完了


                    // }
                    //放开队列
                    SssManager.rule.msgBlocked = false;
                }
                this.resultcount++;
            }
            this.schedule(this.resultScheduleCallback, 0.3);
        }
    },

    //退出房间
    closeGame: function () {

        if (this.isfuban) {
            cc.director.loadScene(config.lobbyScene);
        }else{
            SssManager.rule.node.emit('onExit');
        }

        // SssManager.rule.backLobby();
    },

    judgeMoney: function () {
        let self = this;
        let jinbi = UserCenter.getYouxibiNum();
        let baoxian = UserCenter.getYinhanbiNum();
        if ((jinbi + baoxian) < this.minpoint) {
            showAlertBox('账号余额不足', function () {
                self.closeGame();
            });
        } else {
            let qugao  ;
            if(this.maxpoint){
                qugao = this.maxpoint - jinbi;
            }else{
                qugao = 10000000 - jinbi;
            }
            let qudi = this.minpoint - jinbi;
            let message = '请取出'+qudi+'-'+qugao+'金币';
            showAlertBox('请取出' + qudi + '-' + qugao + '金币', function () {
                self.time.string = 30;
                loadPrefab("hall/bank/bank", function (module) {
                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();
                    module.getComponent('bankScript').setBank(qudi, qugao,false, function (err, data) {
                        if (err) {
                            cc.log(err)
                            self.closeGame();
                            return;
                        }
                        let message = {
                            "CMD": SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10003
                        }
                        SssManager.rule.sendExpend(message, function (data) {
                            cc.log(data)
                            if (data.code == 200) {
                                // self.node.removeFromParent(true);
                            } else {
                                showAlertBox('取钱出错，请退出游戏后重试', function () {
                                    self.closeGame();
                                })
                            }
                        })
                    })
                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
                });
            }, function () {
                self.closeGame();
            })
        }
    },

    /**
     * 清理玩家页面
     */
    clearPlayers: function () {
        for (let i = 0; i < 5; i++) {
            let playerPokers = this.playerPokers[i];
            if (playerPokers != null) {
                playerPokers.active = false;
            }

            let player = this.players[i];
            if (player != null) {
                player.getChildByName("completeSprite").active = false;
                player.getChildByName("holeNode").active = false;
                if (i == 0) {
                    player.x = this.playerPos[0][0];
                } else if (i == 2) {
                    if (!!this.userarray && (this.userarray.length == 2 || this.userarray.length == 4)) {
                        // player.x = this.playerPos[1][0];
                        // player.x = 583;
                        // player.y = 175;
                        player.x = this.playerPos[0][0];
                    }
                }
            }
        }

    },

    /**
     * 播放打枪
     * @param userdata
     */
    showGun: function (userdata) {
        if (this.sssGun == null) {
            this.sssGun = cc.instantiate(this.sssGunPrefab);
            this.sssGun.parent = this.node.parent;
            this.sssGun.setLocalZOrder(10000);

        }

        let targetArr = [];
        let chair = this.getChairBySeatId(userdata.seat);
        for (let i = 0; i < userdata.gunar.length; i++) {
            if (userdata.gunar[i] > 0) {
                let tempChair = this.getChairBySeatId(userdata.gunar[i]);
                let pp = this.playerPokers[tempChair];
                pp.chair = tempChair;
                targetArr.push(pp);
                // targetArr.push(this.players[this.getChairBySeatId(userdata.gunar[i])]);
                // let tempSeat = i+1;
                // let tempChair = this.getChairBySeatId(tempSeat);
                // let tempPlayerNode =this.players[tempChair];
                // tempPlayerNode.beans += parseInt(userdata.gunar[userdata.seat-1]);
                // this.refreshScore(tempPlayerNode,tempPlayerNode.beans);
            }
        }

        let playerNode = this.players[chair];
        let pos = playerNode.getPosition();
        this.sssGun.setPosition(pos.x + SssManager.gunPostion[chair][0],
            pos.y + SssManager.gunPostion[chair][1]);
        let sssGunController = this.sssGun.getComponent("sssGunController");
        sssGunController.onShow(chair, targetArr);

        // playerNode.beans += parseInt(userdata.gunar[userdata.seat-1]);
        // playerNode.beans += userdata.gunscore;
        // this.refreshScore(playerNode,playerNode.beans);
    },

    /**
     * 播放特殊牌型
     * isQld 是否是全垒打
     */
    showSpecial: function (userdata, isQld) {
        let self = this;
        if (this.specialAnim == null) {
            cc.loader.loadRes('style/poker/special/specialAnimPrefab', cc.Prefab, function (error, prefab) {
                if (error) {
                    cc.error(error.message || error);
                    return;
                }
                self.specialAnim = cc.instantiate(prefab);
                self.specialAnim.parent = self.node.parent;
                self.specialCallback(userdata, isQld);
            });
        } else {
            self.specialCallback(userdata, isQld);
        }
    },

    testShowSpecial: function () {
        let self = this;
        cc.loader.loadRes('shisanshui/sss1/prefab/special/specialAnimPrefab', cc.Prefab, function (error, prefab) {
            if (error) {
                cc.error(error.message || error);
                return;
            }
            self.specialAnim = cc.instantiate(prefab);
            self.specialAnim.parent = self.node.parent;

            let specialAnimController = self.specialAnim.getComponent("specialAnimController");
            specialAnimController.onShowTest();
        });
    },

    specialCallback: function (userdata, isQld) {
        let specialAnimController = this.specialAnim.getComponent("specialAnimController");
        specialAnimController.onShow(userdata);
        let chair = this.getChairBySeatId(userdata.seat);
        //更新分数
        let playerNode = this.players[chair];
        if (isQld) {
            // playerNode.beans += userdata.fullgunscore;
        } else {
            //特殊牌型
            // playerNode.beans += parseInt(userdata.specialscorear[userdata.seat-1]);
        }
        //用curwon，确保分数正确,服务端给一个总分
        // this.refreshScore(playerNode,userdata.curwon);
        // this.refreshScore(playerNode,playerNode.beans);
    },


    /**
     * 刷新分数
     * @param player
     * @param playerScore
     */
    refreshScore: function (player, playerScore,lsScore = null) {

        let plusSprite = player.getChildByName("plusSprite");
        let reduceSprite = player.getChildByName("reduceSprite");
        let beanSprite = player.getChildByName("beanSprite");
        let scoreLabel;
        if (this.roomType < 2) {
            plusSprite.active = false;
            reduceSprite.active = false;
            beanSprite.active = true;
            scoreLabel = beanSprite.getChildByName("beans");
            if (playerScore >= 100000000) {
                scoreLabel.fontSize = 18;
            } else if (playerScore >= 10000) {
                scoreLabel.fontSize = 25;
            }

            if(lsScore == null){
                scoreLabel.getComponent(cc.Label).string = playerScore;
            }else{
                let lsBeans = beanSprite.getChildByName('lsBeans');

                lsBeans.active = true;
                lsBeans.getComponent(cc.Label).string = lsScore;
                lsBeans.y += 50;

                let add = lsBeans.getChildByName('add');
                let reduce = lsBeans.getChildByName('reduce');
                if(lsScore < 0){
                    add.active = false;
                    reduce.active = true;
                }else{
                    add.active = true;
                    reduce.active = false;
                }

                let ac = cc.moveTo(1, lsBeans.x, lsBeans.y - 50);

                let finished = cc.callFunc(function(target,playerScore) {
                    this.active = false;
                    this.parent.getChildByName('beans').getComponent(cc.Label).string = playerScore;
                }, lsBeans,playerScore);

                let myAction = cc.sequence(ac, finished);

                lsBeans.runAction(myAction);
            }
        } else {
            beanSprite.active = false;
            if (playerScore < 0) {
                plusSprite.active = false;
                reduceSprite.active = true;
                scoreLabel = reduceSprite.getChildByName("scoreLabel");
            } else {
                plusSprite.active = true;
                reduceSprite.active = false;
                scoreLabel = plusSprite.getChildByName("scoreLabel");
            }
            scoreLabel.getComponent(cc.Label).string = playerScore;
        }

        // if(playerScore >= 100000000){
        //   playerScore = Math.round(playerScore/10000000)+';'
        // }else if(playerScore >= 10000){
        //   playerScore = Math.round(playerScore/10000)+':'
        // }
    },


    setGameStartStatus: function (index) {
        let player = this.players[index];
        if (player.active) {
            let readySprite = player.getChildByName("readySprite");
            let offlineNode = player.getChildByName("offlineNode");
            readySprite.active = false;
            offlineNode.active = false;
            cc.log('配牌显示')
            player.getChildByName("peipaiSprite").active = true;

            let chair = index;

            if (chair != 0) {
                let backpokerPrefab = cc.instantiate(SssManager.backpokerPrefab);
                this.playerbackPokers[chair] = backpokerPrefab;
                backpokerPrefab.parent = this.node;

                // if (this.roomType < 2) {
                //     backpokerPrefab.setPosition(this.pokersPrefabPos[chair]);
                // } else {
                    if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                        backpokerPrefab.setPosition(this.pokersPrefabPos2[chair]);
                    } else {
                        backpokerPrefab.setPosition(this.pokersPrefabPos[chair]);
                    }
                // }
            }

            if (chair == 0) {
                player.x = -this.playerPos[0][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 5 || SssManager.ruleInfo.m_nTruePlayers == 3)) {
                // player.x = this.playerPos[1][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
            //   if(self.roomType < 2){
            //     this.players[chair].x = this.playerPos[1][1];
            //   }else{
            //     this.players[chair].x = this.playerPos2[1][1];
            //   }
                player.x = -this.playerPos[0][1];
            }
        }
    },

    setChairInfo: function (user, chair) {
        cc.log("user = ", user, chair);
        let player = this.players[chair];
        let beans = this.roomType == 2 ? user.score : user.money;
        let status = user.status;
        let userImage = user.userImage;
        player.active = true;

        player.getChildByName("nameRichText").getComponent(cc.RichText).string = user.nick;
        //刷新分数
        this.refreshScore(player, beans);
        // player.getChildByName("scoreLabel").getComponent(cc.Label).string = formatNum(beans);

        getSpriteFrameByUrl(userImage, function (err, spriteFrame) {
            if (err) return;
            player.getChildByName("headSprite").getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        //保存玩家信息
        player.chair = chair;
        player.userid = user.userid;
        player.sex = user.sex;
        player.nick = user.nick;
        player.beans = beans;
        player.userImage = userImage;
        let fangzhuSprite = player.getChildByName("fangzhuSprite");
        if (this.createRoomID == user.userid) {
            fangzhuSprite.active = true;
        } else {
            fangzhuSprite.active = false;
        }

        // player.beans = beans;
        this.setPlaying(chair , status == GamePlayer.PlayerState.Playing);
        this.setReady(chair, status == GamePlayer.PlayerState.Ready);
        this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
    },

    setPlaying : function (dir, bPlaying){
        this.players[dir].getChildByName("peipaiSprite").active = bPlaying;
    },

    setReady: function (dir, bReady) {
        this.players[dir].getChildByName("readySprite").active = bReady;
    },

    setOfflineStatus: function (dir, offline) {
        this.players[dir].getChildByName("offlineNode").active = offline;
    },

    showChangeDialog: function (data,issp) {
        if (this.changeDialog == null) {
            this.changeDialog = cc.instantiate(this.changePrefab);
            this.changeDialog.parent = this.node.parent;
            this.changeDialog.setLocalZOrder(10);
            // this.changeDialog.setPosition(cc.p(SssManager.designResolution.width/2,SssManager.designResolution.height/2))
        } else {
            this.changeDialog.active = true;
        }
        let change = this.changeDialog.getChildByName("change");
        let changeController = change.getComponent("change")
        changeController.onShow(data,issp);
    },

    showSpecialAnim: function (index, data) {
        if (this.specialAnim == null) {
            this.specialAnim = cc.instantiate(SssManager.specialAnimPrefab);
            this.specialAnim.parent = this.node.parent;
            // this.changeDialog.setPosition(cc.p(SssManager.designResolution.width/2,SssManager.designResolution.height/2))
        }
        let specialAnimController = this.specialAnim.getComponent("specialAnimController");
        specialAnimController.onShow(index, data);
    },

    /**
     * 准备
     */
    onReadyClick: function () {
        let self = this;
        this.clock.active = false
        cc.log("onReadyClick");
        this.unschedule(self.daoJiShi);
        self.clearPlayers();
        self.node.emit('CMD_Ready');
        self.isFristGame = true
    },


    daoJiShi: function () {
        let self = this;
        this.time.string --;
        if (this.time.string == 0) {
            if (!self.isFristGame) {
                self.onReadyClick()
            }else{
                this.onExitClick();
            }
            
            this.unschedule(self.daoJiShi);
        }else if(this.time.string == 5){
            showAlert('赶紧准备')
        }
    },

    /**
     * 邀请
     */
    onInviteClick: function () {
        cc.log("onInviteClick");
        var game = LoadGame.getCurrentGame();

        let ren = GamePlayer.getNum();
        let queren = SssManager.ruleInfo.m_nTruePlayers - ren;
        const zhuanhuan = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        
        var desc = game.name + "\n"   // 名称

        desc = desc + "房号: " + SssManager.rule.roomcode + "\n"  // 房号
        desc = desc + "玩法: " + (SssManager.ruleInfo.m_bAllTeShuCardType ? "红波浪模式" : "多一色") + "\n"  // 玩法
        desc = desc + "人数: " + (SssManager.ruleInfo.m_nTruePlayers + "人  " + zhuanhuan[ren] + "缺" + zhuanhuan[queren]) + "\n"  // 人数
        desc = desc + "支付: " + ((SssManager.ruleInfo.m_expend & 0x01) == 0x01 ? "AA支付" : "房主支付") + "\n"  // 支付

        
        wxapi.sendWxFriend(desc)
    },


    /**
     * 退出游戏
     */
    onExitClick: function () {
        this.node.emit("onExit");
        hideAlertBox()
        PING.StopPing();
    },

    /**
     * 设置
     */
    onSetClick: function () {
        cc.log('点击setting')
        let self = this;
        let path;
        if (!!this.game.prefab.setting) {
            path = 'game/{0}/prefab/setting/setting'.format(self.game.sourcePath);
        } else {
            path = 'hall/setting/setting'
        }
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
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

    },

    /**
     * 申请解散
     */
    onDissolveClick: function () {
        cc.log('onClickDissolve');
        if (!!this.fupan) {
            // this.node.removeFromParent(true);
            cc.director.loadScene(config.lobbyScene);
        } else {
            this.node.emit('CMD_forceGameOver');
        }

        // this.refreshMenuActive();
    },

    refreshMenuActive: function () {
    },

    onStandupClick: function () {
    },

    onAutoStandupClick: function () {
    },

    onChangeClick: function () {
    },
    /**
     * 加载资源
     */
    loadRes: function () {
        this.loadCount = 0;
        let self = this;
        cc.loader.loadRes("style/poker/texture/pokers", cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokersAtlas = atlas;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('style/poker/pokerPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokerPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('style/poker/pokersPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokersPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });


        cc.loader.loadRes('style/poker/backpokerPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.backpokerPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('style/poker/special/specialAnimPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.specialAnimPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        let game = LoadGame.getCurrentGame();
        if(!!game){
            let route = game.server + '.startGame';
            PomeloClient.request(route, function (data) {
                cc.log(route + '=====', data)
            });
        }

    },


    getSeatIdByChair: function (chair) {
        chair = chair || 0;
        let seatId;
        if (SssManager.ruleInfo.m_nTruePlayers == 2) {
            if (chair == 0) {
                seatId = this.seatId
            } else {
                if (this.seatId == 1) {
                    seatId = 2;
                } else {
                    seatId = 1;
                }
            }
        }
        else if (SssManager.ruleInfo.m_nTruePlayers == 3) {
            if (chair == 0) {
                seatId = this.seatId
            } else {
                if (this.seatId == 1) {
                    if (chair == 1) {
                        seatId = 2;
                    } else if (chair == 3) {
                        seatId = 3;
                    }
                } else if (this.seatId == 2) {
                    if (chair == 1) {
                        seatId = 3;
                    } else if (chair == 3) {
                        seatId = 1;
                    }
                } else if (this.seatId == 3) {
                    if (chair == 1) {
                        seatId = 1;
                    } else if (chair == 3) {
                        seatId = 2;
                    }
                }
            }
        } else {
            return (this.seatId + chair + 3) % this.MAX_PLAYERS + 1;  //add by sword ,4，5人场处理方式是否一致
        }
        return seatId;
    },

    getChairBySeatId: function (seatId) {
        let chair;
        if (SssManager.ruleInfo.m_nTruePlayers == 2) {
            if (seatId == this.seatId) {
                chair = 0;
            } else {
                chair = 2;
            }
        } else if (SssManager.ruleInfo.m_nTruePlayers == 3) {
            if (seatId == this.seatId) {
                chair = 0;
            } else {
                if (this.seatId == 1) {
                    if (seatId == 2) {
                        chair = 2;
                    } else {
                        chair = 3;
                    }
                } else if (this.seatId == 2) {
                    if (seatId == 3) {
                        chair = 2;
                    } else {
                        chair = 3;
                    }
                } else if (this.seatId == 3) {
                    if (seatId == 1) {
                        chair = 2;
                    } else {
                        chair = 3;
                    }
                }
            }
        } else if (SssManager.ruleInfo.m_nTruePlayers == 4) {
            if (seatId == this.seatId) {
                chair = 0;
            } else {
                if (this.seatId == 1) {
                    if (seatId == 2) {
                        chair = 1;
                    } else if (seatId == 3) {
                        chair = 2;
                    } else {
                        chair = 4;
                    }
                } else if (this.seatId == 2) {
                    if (seatId == 1) {
                        chair = 4;
                    } else if (seatId == 3) {
                        chair = 1;
                    } else {
                        chair = 2;
                    }
                } else if (this.seatId == 3) {
                    if (seatId == 1) {
                        chair = 2;
                    } else if (seatId == 2) {
                        chair = 4;
                    } else {
                        chair = 1;
                    }
                } else if (this.seatId == 4) {
                    if (seatId == 1) {
                        chair = 1;
                    } else if (seatId == 2) {
                        chair = 2;
                    } else {
                        chair = 4;
                    }
                }
            }
        }
        else {
            return (seatId - this.seatId + this.MAX_PLAYERS) % this.MAX_PLAYERS;
        }

        return chair;

    },

    getChairByUserid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        return this.getChairBySeatId(seatid);
    },

    testChange: function () {
        let acard = [211, 48, 33, 65, 161, 35, 162, 64, 227, 83, 193, 49, 178];
        let cardNum = 13;
        let cardtype = 0;
        let firstSeat = 1;
        for (let index = 0; index < acard.length; index++) {
            acard[index] = SssManager.getCardTypeNum(acard[index].toString(16));
        }
        this.showChangeDialog(acard);
    },

    testPokers: function (chair, data) {
        let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
        let sss1Pokers = pokersPrefab.getComponent("sss1Pokers");
        pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
        pokersPrefab.parent = this.node;
        // sss1Pokers.onShow(data,1);
        // sss1Pokers.playAnim(0);
    },

    onDestroy: function () {
        GamePlayer.removeAllPlayers();
        this.removeListeners();
        pomelo.removeAllListeners("RCMD_Dao")
        PING.StopPing();
        this.unscheduleAllCallbacks();
    },


});

