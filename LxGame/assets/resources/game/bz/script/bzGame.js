var GamePlayer = require('GamePlayer');
var LoadGame = require('LoadGame');
const CfgGame = require("CfgGame");
var Porp = require("Prop");
var config = require('Config');
const SSSCommand = require('SSSCommand');
var WanFa = require('Wanfa');
var PING = require('Ping');
var bzSoundC = require('bzSoundController');
var Friend = require('Friend')
const MAX_RES_NUM = 6;

cc.Class({
    extends: cc.Component,
    properties: {
        players: {
            default: [],
            type: cc.Node
        },
        normalButtons: cc.Node,
        roomButtons: cc.Node,
        roomInfo: cc.Node,
        voiceTipsPrefab: cc.Prefab,
        chatMsgBubblePrefab: cc.Prefab,
        lookAnimPrefab: cc.Prefab,
        propAnimPrefab: cc.Prefab,
        cardJushu: cc.Node,//房卡局数
        mapaiNode: cc.Node,//马牌
        timeLabel: cc.Node,
        tiqian: cc.Node,  //提前开始
        info: cc.Node,
        menuNode: cc.Node,
        roomInfo1: cc.Node,    // 游戏场 房间信息
        roomInfo2: cc.Node,    // 好友场 房间信息
        clock: cc.Node,
        time: cc.Label,
        message : cc.Node,
        batteryTexture : cc.Node,
        battery: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        showLoadingAni()
        //init start
        //SssManager.game = LoadGame.getCurrentGame();
        SssManager.game = config.getGameById(306);
        SssManager.controller = this;
        SssManager.designResolution = this.node.parent.getComponent(cc.Canvas).designResolution;
        this.isInitFinished = false;
        //加载资源
        this.loadRes();
        //重置玩家
        GamePlayer.reset();
        pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
        this.addListeners();
        this.playerPos = [[0, -360], [0, 455]];
        this.playerPos2 = [[0, -360], [150, 220]];
        this.playerPos3 = [[0, -245], [600, -40], [-140, 320], [-600, 200], [-600, -40], [600, 200]];
        this.playerPos4 = [[0, -245], [600, 32], [0, 320], [-400, 320], [-600, 32], [400, 320]];

        this.pokersPrefabPos = [cc.p(465, 20), cc.p(830, 210), cc.p(700, 485), cc.p(300, 485), cc.p(120, 210)];
        this.pokersPrefabPos2 = [cc.p(465, 20), cc.p(830, 210), cc.p(465, 485), cc.p(465, 485), cc.p(120, 210)];
        this.pokersPrefabPos3 = [cc.p(470, -5), cc.p(925, 120), cc.p(540, 500), cc.p(90, 400), cc.p(90, 120), cc.p(925, 400)];

        this.playerPokers = [];

        this.timeed();
        this.schedule(function () {
            // 这里的 this 指向 component
            this.timeed();
        }, 60);

        let self = this;
        PING.BindEvent(function (event) {
            if (event.type == 1) {  // 良好
                getSpriteFrameByUrl('game/poker/shisanshui/sssScene2/texture/wifi-3', function (err, spriteFrame) {
                    if (err) return;
                    self.info.getChildByName('wifi').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 2) {  // 一般
                getSpriteFrameByUrl('game/poker/shisanshui/sssScene2/texture/wifi-2', function (err, spriteFrame) {
                    if (err) return;
                    self.info.getChildByName('wifi').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 3) {  // 差
                getSpriteFrameByUrl('game/poker/shisanshui/sssScene2/texture/wifi-1', function (err, spriteFrame) {
                    if (err) return;
                    self.info.getChildByName('wifi').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }
        });
        let path = 'hall/friendInfo/friendInfo'
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            self.playerMessage = prefab;
        });
        PING.StartPing(60);
        var battery = wxapi.getCurrentBattery();
        // var battery = 100;
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



        let game = LoadGame.getCurrentGame();
        if (!game) {
            game = LoadGame.getFuPanCurrentGame();
        }
        let route = game.server + '.startGame';
        PomeloClient.request(route, function (data) {
        });


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
        SssManager.timeString = x + ':' + y;
        this.timeLabel.getComponent(cc.Label).string = x + ':' + y;
    },


    checkLoadRes: function () {
        if (this.loadCount == MAX_RES_NUM) {
            cc.log("res completed");
            hideLoadingAni()
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
        //道具使用监听
        pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));
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
                if (chair == 0 || chair == 3 || chair == 4) {
                    pos = cc.v2(-8, 60);
                } else if (chair == 1 || chair == 5) {
                    pos = cc.v2(-82, 57);
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
                if (chair == 0 || chair == 3 || chair == 4) {
                    pos = cc.v2(100, 60);
                } else if (chair == 1) {
                    pos = cc.v2(-160, 33);
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
        if (this.daoArray == null) {
            this.daoArray = [];
        }

        let sourceChair = this.getChairByUserid(data.suserid);
        let propAnim = this.daoArray[sourceChair];
        if (propAnim == null) {
            propAnim = cc.instantiate(this.propAnimPrefab);
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
        if (data.flag == 0) {
            cc.log("使用道具成功");
            if (data.suserid == UserCenter.getUserID()) {
                //如果是玩家自己使用，更新游戏币
                // UserCenter.updateYouxibiNum(-data.consume);
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
            cc.log(msg);
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
        //     this.playerInfoDialog = cc.instantiate(SssManager.playerInfoDialogPrefab);
        //     this.playerInfoDialog.parent = this.node.parent;
        // }
        //
        // this.playerInfoDialog.x = 0;
        // this.playerInfoDialog.y = 0;
        //
        // let playerinfo = GamePlayer.getPlayer(player.userid);
        // let playerInfoDialogController = this.playerInfoDialog.getComponent("playerInfoDialogController");
        // playerInfoDialogController.onShow(playerinfo);
    },


    RCMD_Start: function (event) {
        cc.log("RCMD_Start");
        cc.log(event);
        let self = this;
        if (this.currMathOverFlag == null) {
            //判断人齐了吗
            // this.canShowReady();
            this.isStartGame = true;
            this.tiqian.active = false;
            this.roomButtons.active = false;
            this.normalButtons.active = true;
            if (this.roomType < 2) {
                this.clock.active = true
                this.time.string = 15;
                this.schedule(self.daoJiShi, 1)
            }
        }
        SssManager.rule.msgBlocked = false;
    },

    RCMD_Ready: function (event) {
        cc.log("RCMD_Ready");
        cc.log(event);

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
        if (!this.isInitFinished) return;
        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('RCMD_exit : ', userid, chair);
        this.players[chair].active = false;
        // this.clearPlayStatus(chair);
        GamePlayer.removePlayer(data.userid);
        SssManager.rule.msgBlocked = false;
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

    RCMD_Expend: function (event) {
        cc.log("RCMD_Expend");
        cc.log(event);
        if (!this.isInitFinished) return;

        let expend = event.data;
        let self = this;
         if (expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10000) {
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
        }else if (expend.CMD == SSSCommand.EXPEND_SUB_CMD.CMD_EXPAND_SUB_10004) {
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
        let self = this;
        if (!this.isInitFinished) return;
        cc.log("RCMD_SitIn");
        cc.log(event);

        let data = event.detail;
        for (var i = 0; i < data.users.length; i++) {
            let user = data.users[i];
            if(user.userid == UserCenter.getUserID()){
                if(self.roomType ==1){
                    this.message.active = true
                    self.tableid = user.tableid;
                    cc.log(self.tableid)
                    let tishi = '房号'+self.tableid +'  ';
                    if (this.maxpoint) {
                        tishi +=  formatNum(self.minpoint) + " - " + formatNum(self.maxpoint);
                    } else {
                        tishi +=  formatNum(self.minpoint) + " 起";
                    }
                    this.message.getChildByName('message').getComponent(cc.Label).string = tishi;
                }

            }
            let player = GamePlayer.addPlayer(user);
            if (!player) continue;
            let chair = this.getChairBySeatId(user.seatid);
            this.setChairInfo(player, chair);
            if (chair == 0) {
                if (SssManager.ruleInfo.m_nTruePlayers == 6) {
                    for (let j = 0; j < 6; j++) {
                        this.players[j].x = this.playerPos3[j][0];
                        this.players[j].y = this.playerPos3[j][1];
                    }
                } else {
                    for (let j = 0; j < 6; j++) {
                        this.players[j].x = this.playerPos4[j][0];
                        this.players[j].y = this.playerPos4[j][1];
                    }
                }
            }

            if ((SssManager.ruleInfo.m_nTruePlayers == 3 || SssManager.ruleInfo.m_nTruePlayers == 5)) {
                this.players[2].x = this.playerPos[1][1];
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
        var data = event.detail;


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
            if (!this.isfuban) {
                this.normalButtons.active = true;
                SssManager.rule.isPlaying = false;
                if (this.roomType < 2) {
                    this.clock.active = true
                    this.time.string = 10;
                    this.schedule(self.daoJiShi, 1)
                }
            }
        } else {
            //加载结算面板
            if (this.result == null) {
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
        var controller = this.result.getComponent('gameOverRankScript');
        controller.show(data.users,data.count);

        // this.result.active = true;
        // let sss4Result;
        // if (!!SssManager.game.sssPrefabs.resultPrefab) {
        //     sss4Result = this.result.getChildByName("sss1Result").getComponent("sss1Result");
        // }else{
        //     sss4Result = this.result.getChildByName("sss4Result").getComponent("sss4Result");
        // }
        // if(type == 2)
        // {
        //     this.currGameex = this.totalGame+1;
        //     sss4Result.onShow(this.roomuserid,data,2);
        //     //sss4Result.setGameOverData(data);
        // }else if(type == 3)
        // {
        //     //协商解散直接弹出
        //     sss4Result.onShow(this.roomuserid,data,2);
        // }
        // else {
        //     sss4Result.onShow(this.roomuserid,data,type);
        // }
    },

    // 设置房间信息
    changeRoomInfo: function (retData) {
        // this.roomInfo1.active = this.roomType == 1
        this.roomInfo2.active = this.roomType == 2

        if (retData.roomType == 2) { // 房卡房
            this.roomInfo2.getChildByName('roomid').getChildByName('num').getComponent(cc.Label).string = retData.roomcode || SssManager.roomCodeString;
            this.roomInfo2.getChildByName('paixing').getChildByName('num').getComponent(cc.Label).string = retData.roomcode;
            // 玩法
            this.roomInfo2.getChildByName('wanfa1').getComponent(cc.Label).string = LoadGame.getCurrentGame().getWanfa1()[0] + LoadGame.getCurrentGame().getWanfa1()[1];
            this.roomInfo2.getChildByName('wanfa2').getComponent(cc.Label).string = LoadGame.getCurrentGame().getWanfa1()[2];
            //房卡局数刷新
            this.refreshJushu(retData.currGame, retData.totalGame);
        } else {  // 游戏场
            if(!!retData.deskfee && retData.basescore ){
                this.roomInfo1.active = this.roomType == 1
                this.roomInfo1.getChildByName('tanfei').getChildByName('num').getComponent(cc.Label).string = retData.deskfee;
                this.roomInfo1.getChildByName('jichufen').getChildByName('num').getComponent(cc.Label).string = retData.basescore;
            }
        }

        // by Amao  设置游戏界面哪些按钮需要显示 哪些需要隐藏  传入 游戏类型
        this.menuNode.getComponent('gameMenuScript').setRoomShow(this.roomType)
    },


    RCMD_Command: function (event) {
        let data = event.detail;
        let cmd = data.cmd;
        let retData = data.data;
        if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
            cc.log('RCMD_INITDATA   :====', retData)
            this.roomType = retData.roomType;
            this.gameid = retData.gameid;
            this.game = config.getGameById(this.gameid);
            this.ruleFlag = retData.ruleFlag;             // 游戏规则
            this.roomuserid = retData.createRoomID;       // 房主
            this.seatId = retData.myseatid;               // 座位编号
            this.expend = retData.extData;
            
            
            SssManager.soundCtrl = this.node.addComponent(SssManager.game.sound || 'SSSSound');  // 默认普通话

            //初始化牌组,以防后进的人未收到发牌消息
            this.acard = [255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];

            if (this.roomType == 2) { // 房卡房间
                //
                // SssManager.getRule(this.ruleFlag);
                SssManager.getRule(this.ruleFlag, this.expend);
                SssManager.roomCodeString = retData.roomcode;

            
                //加载房卡组件
                var roomcontroller = this.addComponent("CardRoomControllerPoker");

                roomcontroller.init(data);

                //玩家组合好的牌（从服务器活获得），UID为索引
                this.playerPokers = [];

                //最大人数
                this.MAX_PLAYERS = 6;


            }else{
                for (let i = 0; i < this.players.length; i++) {
                    this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
                }

                SssManager.ruleInfo.m_nTruePlayers = parseInt(((this.expend >> 1) & 0x0f));  //真实玩家
                cc.log('真实玩家数量=====',this.expend,SssManager.ruleInfo.m_nTruePlayers)
            }

            //默认新登话
            setMJLanguageSound('4');
            GlobEvent.emit('LANGUAGE_CHANGE', 4);
            this.isInitFinished = true;

            // 设置房间信息
            this.changeRoomInfo(retData)

            if (this.currGame == 0 && this.roomType == 2) {
                this.roomButtons.active =  wxapi.isInstallWeChat();
                cc.log('xxxx',wxapi.isInstallWeChat())
                this.tiqian.active = UserCenter.getUserID() == this.roomuserid;
            }
            
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_GameStart) {
            cc.log('RCMD_GameStart ==== ', retData)
            //开始游戏,清理一下界面
            for (let index = 0; index < 6; index++) {
                this.setGameStartStatus(index);
            }
            //清理完成
            SssManager.rule.msgBlocked = false;
            //初始化数据start
            this.isRollOver = false;
            //初始化数据end
            this.refreshJushu(retData.currgame, retData.totalgame);

            // 设置房间信息
            this.changeRoomInfo(retData)
        }
        else if (cmd == SSSCommand.RESP_CMD.RCMD_SendCard) {
            //发牌
            this.acard = retData.acard;
            this.cardtype = retData.cardtype;
            let cardNum = retData.cardNum;
            let firstSeat = retData.firstSeat;
            //this.testChange();
            this.showMyPokers(this.cardtype, this.acard);
        }
        else if (cmd == SSSCommand.RESP_CMD.RCMD_CardHand) {
            //摊牌之后收到牌
            let SpecialCardType = retData.SpecialCardType;
            let pokersIndexArray = retData.pokersIndexArray;
            let uid = retData.uid;

            let type = 1;
            if (SpecialCardType == 1) {
                //特殊牌型
                type = 3;
            }

            //显示自己的牌
            if (uid == UserCenter.getUserID()) {
                if (this.changeDialog != null) {
                    this.changeDialog.getChildByName('change4').getComponent('change4').hide();
                }
                let chair = 0;
                let pokersPrefab = this.playerPokers[chair];
                if (pokersPrefab == null) {
                    pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    this.playerPokers[chair] = pokersPrefab;
                    pokersPrefab.parent = this.node;
                }
                pokersPrefab.active = true;
                let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
                pokersPrefab.setPosition(SssManager.fbzpokersPrefabPos[chair]);
                let data = [];
                for (let i = 0; i < pokersIndexArray.length; i++) {
                    data[i] = this.acard[parseInt(pokersIndexArray[i])];
                }
                sss4Pokers.onShow(data, this.players[chair], type, false);
            } else {
            }
            //完成组牌
            this.players[this.getChairByUserid(uid)].getChildByName("completeSprite").active = true;
            this.players[this.getChairByUserid(uid)].getChildByName("playingSprite").active = false;

            for (let chair = 0; chair < this.players.length; ++chair) {
                let player = this.players[chair];
                if (SssManager.ruleInfo.m_nTruePlayers != 6) {
                    if (chair == 0 && player.x != this.playerPos[0][1]) {
                        player.x = this.playerPos[0][1];
                    } else if (chair == 2 && player.x != this.playerPos[1][1]) {
                        player.x = this.playerPos2[1][1];
                    }
                } else {
                    if (chair == 0 && player.x != this.playerPos2[1][0]) {
                        player.x = this.playerPos2[1][0];
                    }
                }
            }
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_TSC_GAMEEND) {
            //收到结果
            cc.log('开始比牌', retData);
            this.normalButtons.active = false;//准备按钮隐藏
            if (!!SssManager.game.sssPrefabs.bzSound) {
                bzSoundC.playSound('bipai');
            }
            let self = this;
            let callBack = function () {
                self.showResult(retData);
            };
            this.scheduleOnce(callBack, 1.2);
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_RestoreGame) {
            //恢复牌局
            if (retData.CommState == 1) {
                this.roomButtons.active = false;
                //玩家组合好的牌（从服务器活获得），UID为索引
                this.playerPokers = [];
                this.restoreGame(retData);
            }
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_TCC_REQUESTSTART) {
            cc.log('提前下行')
            this.ruleFlag = retData.ruleflag;
            this.clearPlayers();
            SssManager.getRule(this.ruleFlag);
            let users = Object.keys(GamePlayer.players)
            for (let i = 0; i < this.players.length; i++) {
                this.players[i].active = false;
            }
            for (let i = 0; i < users.length; i++) {
                let player = GamePlayer.getPlayer(users[i]);
                let chair = this.getChairByUserid(users[i]);
                console.log(chair,)
                this.setChairInfo(player, chair);
                if (chair == 0) {
                    if (SssManager.ruleInfo.m_nTruePlayers == 6) {
                        for (let j = 0; j < 6; j++) {
                            this.players[j].x = this.playerPos3[j][0];
                            this.players[j].y = this.playerPos3[j][1];
                        }
                    } else {
                        for (let j = 0; j < 6; j++) {
                            this.players[j].x = this.playerPos4[j][0];
                            this.players[j].y = this.playerPos4[j][1];
                        }
                    }
                }
                if ((SssManager.ruleInfo.m_nTruePlayers == 3 || SssManager.ruleInfo.m_nTruePlayers == 5)) {
                    this.players[2].x = this.playerPos2[1][1];
                }
                if ((SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
                    this.players[2].x = this.playerPos2[1][1];
                }
            }
            // 玩法
            this.roomInfo2.getChildByName('wanfa1').getComponent(cc.Label).string = LoadGame.getCurrentGame().getWanfa1()[0] + LoadGame.getCurrentGame().getWanfa1()[1];
            this.roomInfo2.getChildByName('wanfa2').getComponent(cc.Label).string = LoadGame.getCurrentGame().getWanfa1()[2];
        }
    },

    showMyPokers: function (cardtype, acard) {
        for (let index = 0; index < acard.length; index++) {
            acard[index] = SssManager.getCardTypeNum(acard[index]);
        }

        // if(cardtype > 4)
        // {
        //     if(SssManager.ruleInfo.m_bAllTeShuCardType)
        //     {
        //         let type = 1;
        //         //红波浪模式直接使用特殊牌型
        //         PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
        //             {
        //                 cmd : SSSCommand.REQ_CMD.CMD_IS_SPECIAL,
        //                 data : {
        //                     userid:UserCenter.getUserID(),
        //                     type:type,
        //                 }
        //             }
        //             ,function (data) {
        //                 cc.log(data);
        //             });
        //     }else {
        //         let self = this;
        //         if(self.spcialAlert == null)
        //         {
        //             cc.loader.loadRes('shisanshui/sss4/prefab/specialAlert/specialAlertNode',cc.Prefab,function(error,prefab){
        //                 if (error) {
        //                     cc.error(error.message || error);
        //                     return;
        //                 }
        //                 self.spcialAlert = cc.instantiate(prefab);
        //                 self.spcialAlert.parent = self.node.parent;
        //                 let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController4");
        //                 specialAlertController.onShow(cardtype,acard);
        //             });
        //         }else {
        //             let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController4");
        //             specialAlertController.onShow(cardtype,acard);
        //         }
        //     }
        // }else{
        //显示组牌界面
        this.showChangeDialog(acard, cardtype);
        // this.players[0].x = this.playerPos[0][1];
        // this.players[3].x = this.playerPos[1][1];
        // }
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
        let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
        pokersPrefab.setPosition(SssManager.fbzpokersPrefabPos[chair]);
        //特殊牌型展示牌的背面，不播放翻牌动画
        sss4Pokers.onShow(acard, this.players[chair], 3, false);
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
                this.players[this.getChairByUserid(data.userid)].getChildByName("playingSprite").active = true;
            } else {
                //已亮牌
                //显示自己的牌
                if (data.userid == UserCenter.getUserID()) {
                    this.cardtype = data.cardtype;
                    this.acard = data.arcard;
                    let bSpecialCardType = data.bSpecialCardType;
                    let chair = 0;
                    let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
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

                    pokersPrefab.setPosition(SssManager.fbzpokersPrefabPos[chair]);
                    pokersPrefab.parent = this.node;
                    for (let index = 0; index < this.acard.length; index++) {
                        this.acard[index] = SssManager.getCardTypeNum(this.acard[index]);
                    }

                    //将牌按墩排序
                    let acardPokers = [];
                    for (let index = 0; index < this.acard.length; index++) {
                        acardPokers[index] = this.acard[pokersIndexArray[index]];
                    }
                    sss4Pokers.onShow(acardPokers, this.players[chair], 1);
                } else {
                    this.cardtype = data.cardtype;
                    this.acard = data.arcard;
                    let bSpecialCardType = data.bSpecialCardType;
                    let chair = this.getChairByUserid(data.userid);
                    let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
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

                    pokersPrefab.setPosition(SssManager.fbzpokersPrefabPos[chair]);
                    pokersPrefab.parent = this.node;
                    for (let index = 0; index < this.acard.length; index++) {
                        this.acard[index] = SssManager.getCardTypeNum(this.acard[index]);
                    }

                    //将牌按墩排序
                    let acardPokers = [];
                    for (let index = 0; index < this.acard.length; index++) {
                        acardPokers[index] = this.acard[pokersIndexArray[index]];
                    }
                    sss4Pokers.onShow(acardPokers, this.players[chair], 1);
                }
                //完成组牌
                this.players[this.getChairByUserid(data.userid)].getChildByName("completeSprite").active = true;
                this.players[this.getChairByUserid(data.userid)].getChildByName("playingSprite").active = false;
            }

            let chair = this.getChairByUserid(data.userid);
            let player = this.players[chair];
            if (chair == 0) {
                if (SssManager.ruleInfo.m_nTruePlayers != 6) {
                    player.x = this.playerPos[0][1];
                } else {
                    player.x = this.playerPos2[1][0];
                }
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 5 || SssManager.ruleInfo.m_nTruePlayers == 3)) {
                player.x = this.playerPos[1][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
                player.x = this.playerPos2[1][1];
            }
        }
    },

    /**
     * 刷新局数
     */
    refreshJushu: function (currGame, totalGame) {
        this.currGame = currGame;
        this.totalGame = totalGame;
        this.roomInfo2.getChildByName('jushu').getChildByName('num').getComponent(cc.Label).string = '{0}/{1}局'.format(currGame, totalGame);
    },

    showResult: function (retData, isfuban) {
        this.isfuban = isfuban;
        // this.bFullGun = retData.bFullGun;//全垒打
        // this.bFullSpecial = retData.bFullSpecial;//特殊牌型
        // this.bGun = retData.bGun;//打枪
        // this.bHasSpecial = retData.bHasSpecial;//是否特殊牌型
        // this.turePlayersCount = retData.turePlayersCount;//真实打牌的人个数
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
                if (SssManager.ruleInfo.m_nTruePlayers != 6) {
                    this.players[chair].x = this.playerPos[0][1];
                } else {
                    this.players[chair].x = this.playerPos2[1][0];
                }
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 5 || SssManager.ruleInfo.m_nTruePlayers == 3)) {
                this.players[chair].x = this.playerPos[1][1];
            }
            else if (chair == 2 && (SssManager.ruleInfo.m_nTruePlayers == 2 || SssManager.ruleInfo.m_nTruePlayers == 4)) {
                this.players[chair].x = this.playerPos2[1][1];
            }
            this.players[chair].getChildByName("completeSprite").active = false;
            this.players[chair].getChildByName("playingSprite").active = false;
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

            let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");

            if (SssManager.ruleInfo.m_nTruePlayers == 4 || SssManager.ruleInfo.m_nTruePlayers == 2) {
                pokersPrefab.setPosition(this.pokersPrefabPos2[chair]);
            } else if (SssManager.ruleInfo.m_nTruePlayers == 6) {
                pokersPrefab.setPosition(this.pokersPrefabPos3[chair]);
            } else {
                pokersPrefab.setPosition(this.pokersPrefabPos[chair]);
            }

            //检查是否是特殊牌型
            if (userdata.specialtype > 0) {
                this.specialArr.push(userdata);
                //特殊牌型展示牌的背面，不播放翻牌动画
                sss4Pokers.onShow(userdata, this.players[chair], 3, true);
            } else {
                sss4Pokers.onShow(userdata, this.players[chair], 2);
            }
        }

        // this.showRemaincard();
        //TODO 比完牌需要判断有没有打枪的
        //TODO 打完抢需要判断有没有特殊牌型
        //TODO 特殊牌型之后需要判断有没有全垒打
    },


    /**
     * 显示剩余的牌
     */
    showRemaincard: function () {
        let count = 0;
        for (let i = 0; i < 4; i++) {
            let playerNode = this.players[i];
            if (playerNode != null && playerNode.userid == null) {
                let chair = i;
                cc.log("chair", chair);
                let pokersPrefab = this.playerPokers[chair];
                if (pokersPrefab == null) {
                    pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
                    pokersPrefab.parent = this.node;
                    pokersPrefab.setPosition(SssManager.emptyPokersPos[chair]);
                    this.playerPokers[chair] = pokersPrefab;
                }
                pokersPrefab.active = true;
                let data = [];
                for (let index = 0; index < 8; index++) {
                    data.push(SssManager.getCardTypeNum(this.remaincard[index + count * 8]));
                }
                count++;
                let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
                sss4Pokers.onShow(data, playerNode, 4);
            }
        }
    },

    //牌翻好了
    rollOver: function (event) {
        cc.log("rollOver");
        if (!this.isRollOver) {
            this.isRollOver = true;
            this.checkGun();
        }
        // //恢复对局的时候,将准备按钮显示
        // if(this.isRestoreGame){
        //     this.normalButtons.active = true;
        //     this.isRestoreGame = false;
        // }
    },


    //判断是否有打枪
    checkGun: function () {
        cc.log("checkGun");
        if (this.gunArr.length > 0) {
            let userdata = this.gunArr.shift();
            let self = this;
            let callBack = function () {
                self.showGun(userdata);
            };
            this.scheduleOnce(callBack, 0.5);
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
            for (let i = 0; i < this.specialArr.length; i++) {
                let userdata = this.specialArr.shift();
                this.showSpecial(userdata);
            }
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
    judgeMoney: function () {
        let self = this;
        let jinbi = UserCenter.getYouxibiNum();
        let baoxian = UserCenter.getYinhanbiNum();
        if ((jinbi + baoxian) < this.minpoint) {
            showAlertBox('账号余额不足', function () {
                self.onExitClick();
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
            showAlertBox(message, function () {
                self.time.string = 30;
                loadPrefab("hall/bank/bank", function (module) {
                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();
                    cc.log('setbank')
                    module.getComponent('bankScript').setBank(qudi, qugao, false, function (err, data) {
                        if (err) {
                            cc.log(err)
                            self.onExitClick();
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
                                    self.onExitClick();
                                })
                            }
                        })
                    })
                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
                });
            }, function () {
                self.onExitClick();
            })
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
                let lsScore = userdata.curwonmoney;
                let asdf = userdata.totalwon;
                playerNode.beans = userdata.totalwon;
                if (chair == 0 && this.roomType == 1) {
                    UserCenter.setYouxibiNum(userdata.totalwon);
                    this.myBeans = userdata.totalwon;
                    cc.log('judgeMoney',this.minpoint)
                    if (this.myBeans < this.minpoint) {
                        this.judgeMoney();
                        playerNode.beans = UserCenter.getYouxibiNum();
                    }
                }
                this.refreshScore(playerNode, playerNode.beans, chair,lsScore);
            }


            for (let i = 0; i < 4; i++) {
                let pokers = this.playerPokers[i];
                if (pokers != null) {
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
                    //本局结算
                    this.showMathOver(retData, 1);
                    // }
                    //放开队列
                    SssManager.rule.msgBlocked = false;
                }
                this.resultcount++;
            }
            this.schedule(this.resultScheduleCallback, 0.3);
        }
    },

    /**
     * 清理玩家页面
     */
    clearPlayers: function () {
        cc.log('=====================', this.playerPokers)


        for (let i = 0; i < 6; i++) {
            let playerPokers = this.playerPokers[i];
            if (playerPokers != null) {
                playerPokers.active = false;
            }

            let player = this.players[i];
            if (player != null) {
                player.getChildByName("completeSprite").active = false;
                player.getChildByName("playingSprite").active = false;
                player.getChildByName("holeNode").active = false;
                // if(i == 0)
                // {
                //     player.x = this.playerPos[0][0];
                // }else if(i == 3)
                // {
                //     player.x = this.playerPos[1][0];
                // }
            }
        }

    },

    /**
     * 播放打枪
     * @param userdata
     */
    showGun: function (userdata) {
        if (this.sssGun == null) {
            this.sssGun = cc.instantiate(SssManager.sssGunPrefab);
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
        this.sssGun.setPosition(pos.x + SssManager.bzgunPostion[chair][0],
            pos.y + SssManager.bzgunPostion[chair][1]);
        let sssGunController = this.sssGun.getComponent("sssGunController");
        cc.log("targetArr", targetArr);
        sssGunController.onShow(chair, targetArr, this.players);

        // playerNode.beans += parseInt(userdata.gunar[userdata.seat-1]);
        // playerNode.beans += userdata.gunscore;
        // this.refreshScore(playerNode,playerNode.beans);
    },

    /**
     * 播放特殊牌型
     * isQld 是否是全垒打
     */
    showSpecial: function (userdata, isQld) {
        if (this.specialAnim == null) {
            this.specialAnim = cc.instantiate(SssManager.specialAnimPrefab);
            this.specialAnim.parent = this.node.parent;
            this.specialCallback(userdata, isQld);
        } else {
            this.specialCallback(userdata, isQld);
        }
    },

    testShowSpecial: function () {
        let self = this;
        cc.loader.loadRes('game/bz/prefab/special/specialAnimPrefab', cc.Prefab, function (error, prefab) {
            if (error) {
                cc.error(error.message || error);
                return;
            }
            self.specialAnim = cc.instantiate(prefab);
            self.specialAnim.parent = self.node.parent;

            let specialAnimController = self.specialAnim.getComponent("specialAnimController4");
            specialAnimController.onShowTest();
        });
    },

    specialCallback: function (userdata, isQld) {
        let specialAnimController = this.specialAnim.getComponent("specialAnimController4");
        let chair = this.getChairBySeatId(userdata.seat);
        //更新分数
        let playerNode = this.players[chair];
        specialAnimController.onShow(userdata, playerNode);
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
    refreshScore: function (player, playerScore, chair,lssScore = null) {
        let scoreLable = player.getChildByName("infobg").getChildByName("score")

        let tip = ''


        if (this.roomType == 2) {
            tip = playerScore < 0 ? '- ' : '+ '
        }

        let score = formatNum(Math.abs(playerScore))

        if(lssScore == null){
            scoreLable.getComponent(cc.Label).string = tip + score
        }else {
            let lsScore = player.getChildByName('infobg').getChildByName('lsScore');

            lsScore.active = true;
            lsScore.y += 50;
            lsScore.getComponent(cc.Label).string = lssScore > 0 ? '+' + lssScore:lssScore;

            let ac = cc.moveTo(1, lsScore.x, lsScore.y - 50);

            let finished = cc.callFunc(function(target, playerScore) {
                this.active = false;
                this.parent.getChildByName('score').getComponent(cc.Label).string = playerScore;
            }, lsScore, score);

            let myAction = cc.sequence(ac, finished);

            lsScore.runAction(myAction);
        }

        


        // let plusSprite   = player.getChildByName("plusSprite");
        // let reduceSprite = player.getChildByName("reduceSprite");
        // let scoreLabel;
        // let scoreSprite;
        // if(playerScore < 0)
        // {
        //     plusSprite.active = false;
        //     reduceSprite.active = true;
        //     scoreSprite = reduceSprite;
        //     scoreLabel = reduceSprite.getChildByName("scoreLabel");
        // }else
        // {
        //     plusSprite.active = true;
        //     reduceSprite.active = false;
        //     scoreSprite = plusSprite;
        //     scoreLabel = plusSprite.getChildByName("scoreLabel");
        // }


        // scoreLabel.getComponent(cc.Label).string = playerScore;

        // if(chair == 1 || chair == 2){
        //     if(Math.abs(playerScore) > 100){
        //         scoreSprite.x = -22;
        //     }else if(Math.abs(playerScore) > 1000){
        //         scoreSprite.x = -52;
        //     }
        // }
    },


    setGameStartStatus: function (index) {
        let player = this.players[index];
        let readySprite = player.getChildByName("readySprite");
        let offlineNode = player.getChildByName("offlineNode");
        readySprite.active = false;
        offlineNode.active = false;
        player.getChildByName("playingSprite").active = true;
    },

    setChairInfo: function (user, chair) {
        cc.log("user ============= ", user,chair,this.seatId,SssManager.ruleInfo.m_nTruePlayers);
        let player = this.players[chair];
        let beans = this.roomType == 2 ? user.score : user.money;
        let status = user.status;
        let userImage = user.userImage;
        player.active = true;

        player.getChildByName("nameRichText").getComponent(cc.RichText).string = user.nick;
        //刷新分数
        this.refreshScore(player, beans, chair);
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
        // player.beans = beans;

        this.setPlaying(chair , status == GamePlayer.PlayerState.Playing);
        this.setReady(chair, status == GamePlayer.PlayerState.Ready);
        this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
    },

    setPlaying : function (dir, bPlaying){
        this.players[dir].getChildByName("playingSprite").active = bPlaying;
    },

    setReady: function (dir, bReady) {
        this.players[dir].getChildByName("readySprite").active = bReady;
    },

    setOfflineStatus: function (dir, offline) {
        this.players[dir].getChildByName("offlineNode").active = offline;
    },

    showChangeDialog: function (data, cardtype) {
        if (this.changeDialog == null) {
            this.changeDialog = cc.instantiate(SssManager.changePrefab);
            this.changeDialog.parent = this.node.parent;
            // this.changeDialog.setPosition(cc.p(SssManager.designResolution.width/2,SssManager.designResolution.height/2))
        } else {
            this.changeDialog.active = true;
        }
        let change = this.changeDialog.getChildByName("change4");
        let changeController = change.getComponent("change4")
        changeController.onShow(data, cardtype);
    },

    showSpecialAnim: function (index, data) {
        if (this.specialAnim == null) {
            this.specialAnim = cc.instantiate(SssManager.specialAnimPrefab);
            this.specialAnim.parent = this.node.parent;
            // this.changeDialog.setPosition(cc.p(SssManager.designResolution.width/2,SssManager.designResolution.height/2))
        }
        let specialAnimController = this.specialAnim.getComponent("specialAnimController4");
        specialAnimController.onShow(index, data);
    },

    /**
     * 提前开始
     */
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
        this.time.string--;
        if (this.time.string == 0) {
            if (!self.isFristGame) {
                this.onReadyClick()
            }else{
                this.onExitClick()
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
        let ren = GamePlayer.getNum();
        let queren = SssManager.ruleInfo.m_nTruePlayers - ren;
        const zhuanhuan = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

        let  wanfa = ''
        if(SssManager.ruleInfo.m_bAllTeShuCardType){
            wanfa += "特殊牌型 ";
        }

        if(SssManager.ruleInfo.HasJoker){
            wanfa += "大小王 ";
        }

        if(SssManager.ruleInfo.HasRedWave){
            wanfa += "红波浪模式 ";
        }else{
            wanfa += "不打枪 ";
        }


        let zhifu = "房主支付";
        if(SssManager.ruleInfo.zhifu){
            zhifu = 'AA支付!';
        }


        var game = LoadGame.getCurrentGame();

        var desc = game.name + "\n"   // 名称

        desc = desc + '房号: ' + SssManager.rule.roomcode + "\n"  // 房号

        desc = desc + '玩法: ' + wanfa + "\n"  // 玩法

        desc = desc + '人数: ' + SssManager.ruleInfo.m_nTruePlayers + "人  "+ zhuanhuan[ren] + '缺' + zhuanhuan[queren] + "\n"  // 人数

        desc = desc + '支付: ' + zhifu + "\n"  // 支付

        
        wxapi.sendWxFriend(desc)
    },

    /**
     * 菜单
     */
    onMenuClick: function () {
        // this.roommenu.getChildByName("bg").active = !this.roommenu.getChildByName("bg").active;
        // this.refreshMenuActive();
    },

    /**
     * 退出游戏
     */
    onExitClick: function () {
        if (this.isfuban) {
            cc.director.loadScene(config.lobbyScene);
        } else {
            SssManager.rule.node.emit('onExit');
        }
    },

    //游戏规则
    onRuleClick: function () {
        let self = this;
        cc.loader.loadRes('game/poker/shisanshui/sssScene2/scene/prefab/sssRule/sssrule', cc.Prefab, function (error, prefab) {
            if (error) {
                cc.error(error.message || error);
                return;
            }
            cc.log('加载成功')
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            //self.onMenuClick();
        });
    },

    /**
     * 设置
     */
    onSetClick: function () {
        let self = this;
        // let path;
        // if (!!this.game.prefab.setting) {
        //     path = 'game/{0}/prefab/setting/setting'.format(self.game.sourcePath);
        // } else {
        //     path = 'hall/setting/setting'
        // }
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
    },

    /**
     * 申请解散
     */
    onDissolveClick: function () {
        if (this.isfuban) {
            cc.director.loadScene(config.lobbyScene);
        } else {
            cc.log('onClickDissolve');
            this.node.emit('CMD_forceGameOver');
            this.onMenuClick();
            // this.refreshMenuActive();
        }
    },

    refreshMenuActive: function () {
        // this.roommenu.active = !this.roommenu.active;
        // this.chatNode.active = !this.roommenu.active;
    },

    onStandupClick: function () {
        this.onMenuClick();
    },

    onAutoStandupClick: function () {
        this.onMenuClick();
    },

    onChangeClick: function () {
        this.onMenuClick();
    },

    onclickMessage: function () {

    },
    /**
     * 加载资源
     */
    loadRes: function () {
        this.loadCount = 0;
        let self = this;
        cc.loader.loadRes('style/poker/texture/pokers', cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokersAtlas = atlas;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/bz/prefab/poker/pokerPrefab2', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokerPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/bz/prefab/poker/pokersPrefab2', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.pokersPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/bz/prefab/special/specialAnimPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.specialAnimPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/bz/prefab/change/changePrefab2', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.changePrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('style/poker/gun/sssGun', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            SssManager.sssGunPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
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
                    if (chair == 2) {
                        seatId = 2;
                    } else if (chair == 4) {
                        seatId = 3;
                    }
                } else if (this.seatId == 2) {
                    if (chair == 2) {
                        seatId = 3;
                    } else if (chair == 4) {
                        seatId = 1;
                    }
                } else if (this.seatId == 3) {
                    if (chair == 2) {
                        seatId = 1;
                    } else if (chair == 4) {
                        seatId = 2;
                    }
                }
            }
        } else if (SssManager.ruleInfo.m_nTruePlayers == 4) {
            if (chair == 0) {
                seatId = this.seatId
            } else {
                if (this.seatId == 1) {
                    if (chair == 2) {
                        seatId = 2;
                    } else if (chair == 3) {
                        seatId = 3;
                    } else if (chair == 4) {
                        seatId = 4;
                    }
                } else if (this.seatId == 2) {
                    if (chair == 3) {
                        seatId = 3;
                    } else if (chair == 2) {
                        seatId = 1;
                    } else if (chair == 4) {
                        seatId = 4;
                    }
                } else if (this.seatId == 3) {
                    if (chair == 2) {
                        seatId = 1;
                    } else if (chair == 3) {
                        seatId = 2;
                    } else if (chair == 4) {
                        seatId = 4;
                    }
                } else if (this.seatId == 4) {
                    if (chair == 2) {
                        seatId = 1;
                    } else if (chair == 3) {
                        seatId = 2;
                    } else if (chair == 4) {
                        seatId = 3;
                    }
                }
            }
        } else if (SssManager.ruleInfo.m_nTruePlayers == 5) {
            if (chair == 0) {
                seatId = this.seatId
            } else {
                if (this.seatId == 1) {
                    if (chair == 1) {
                        seatId = 2;
                    } else if (chair == 2) {
                        seatId = 3;
                    } else if (chair == 3) {
                        seatId = 4;
                    } else if (chair == 4) {
                        seatId = 5;
                    }
                } else if (this.seatId == 2) {
                    if (chair == 2) {
                        seatId = 3;
                    } else if (chair == 1) {
                        seatId = 1;
                    } else if (chair == 3) {
                        seatId = 4;
                    } else if (chair == 4) {
                        seatId = 5;
                    }
                } else if (this.seatId == 3) {
                    if (chair == 1) {
                        seatId = 1;
                    } else if (chair == 2) {
                        seatId = 2;
                    } else if (chair == 3) {
                        seatId = 4;
                    } else if (chair == 4) {
                        seatId = 5;
                    }
                } else if (this.seatId == 4) {
                    if (chair == 1) {
                        seatId = 1;
                    } else if (chair == 2) {
                        seatId = 2;
                    } else if (chair == 3) {
                        seatId = 3;
                    } else if (chair == 4) {
                        seatId = 5;
                    }
                } else if (this.seatId == 5) {
                    if (chair == 1) {
                        seatId = 1;
                    } else if (chair == 2) {
                        seatId = 2;
                    } else if (chair == 3) {
                        seatId = 3;
                    } else if (chair == 4) {
                        seatId = 4;
                    }
                }
            }
        } else {
            return (this.seatId + chair + 5) % this.MAX_PLAYERS + 1;
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
        } else if (SssManager.ruleInfo.m_nTruePlayers == 6) {
            if (seatId == this.seatId) {
                chair = 0;
            } else {
                if (this.seatId == 1) {
                    if (seatId == 2) {
                        chair = 1;
                    } else if (seatId == 3) {
                        chair = 5;
                    } else if (seatId == 4) {
                        chair = 2;
                    } else if (seatId == 5) {
                        chair = 3;
                    } else {
                        chair = 4;
                    }
                } else if (this.seatId == 2) {
                    if (seatId == 1) {
                        chair = 4;
                    } else if (seatId == 3) {
                        chair = 1;
                    } else if (seatId == 4) {
                        chair = 5;
                    } else if (seatId == 5) {
                        chair = 2;
                    } else {
                        chair = 3;
                    }
                } else if (this.seatId == 3) {
                    if (seatId == 1) {
                        chair = 3;
                    } else if (seatId == 2) {
                        chair = 4;
                    } else if (seatId == 4) {
                        chair = 1;
                    } else if (seatId == 5) {
                        chair = 5;
                    } else {
                        chair = 2;
                    }
                } else if (this.seatId == 4) {
                    if (seatId == 1) {
                        chair = 2;
                    } else if (seatId == 2) {
                        chair = 3;
                    } else if (seatId == 3) {
                        chair = 4;
                    } else if (seatId == 5) {
                        chair = 1;
                    } else {
                        chair = 5;
                    }
                } else if (this.seatId == 5) {
                    if (seatId == 1) {
                        chair = 5;
                    } else if (seatId == 2) {
                        chair = 2;
                    } else if (seatId == 3) {
                        chair = 3;
                    } else if (seatId == 4) {
                        chair = 4;
                    } else {
                        chair = 1;
                    }
                }
                else if (this.seatId == 6) {
                    if (seatId == 1) {
                        chair = 1;
                    } else if (seatId == 2) {
                        chair = 2;
                    } else if (seatId == 3) {
                        chair = 5;
                    } else if (seatId == 4) {
                        chair = 3;
                    } else {
                        chair = 4;
                    }
                }
            }
        }
        else {
            return (seatId - this.seatId + 5) % 5;
        }

        return chair;
    },

    getChairByUserid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        return this.getChairBySeatId(seatid);
    },

    testChange: function () {
        let acard = [145, 144, 80, 81, 244, 245, 146, 147, 82, 83, 32, 33, 34];
        let cardNum = 13;
        let cardtype = 0;
        let firstSeat = 1;
        for (let index = 0; index < acard.length; index++) {
            acard[index] = SssManager.getCardTypeNum(acard[index]);
        }
        this.showChangeDialog(acard);
    },

    testPokers: function (chair, data) {
        let pokersPrefab = cc.instantiate(SssManager.pokersPrefab);
        let sss4Pokers = pokersPrefab.getComponent("sss4Pokers");
        pokersPrefab.setPosition(SssManager.fbzpokersPrefabPos[chair]);
        pokersPrefab.parent = this.node;
        // sss4Pokers.onShow(data,1);
        // sss4Pokers.playAnim(0);
    },

    onDestroy: function () {
        GamePlayer.removeAllPlayers();
        this.removeListeners();
        PING.StopPing();
    },

});
