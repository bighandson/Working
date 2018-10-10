var GamePlayer = require('GamePlayer');
var CfgGame = require("CfgGame");
var Porp = require("Prop");
var config = require('Config');
var PING = require('Ping');
var LoadGame = require('LoadGame');
var Friend = require('Friend')
// var CfgChat = require("CfgChat");

const MAX_PLAYERS = 4;
cc.Class({
    extends: cc.Component,

    properties: {
        players: {
            default: [],
            type: cc.Node
        },
        btnReady: cc.Node,
        btnChangeDesk: cc.Node,
        roommenu: cc.Node,
        roomInfo: cc.Node,
        voiceTipsPrefab: cc.Prefab,
        chatMsgBubblePrefab: cc.Prefab,
        lookAnimPrefab: cc.Prefab,
        propAnimPrefab: cc.Prefab,
        chatNode: cc.Node,
        time: cc.Label,
        titleSprite: cc.Sprite,          // 游戏标题
        menuIcon1: cc.Node,
        menuIcon2: cc.Node,
        wanfa: cc.Label,
        wifi: cc.Node,
        battery: cc.Node,
        batteryTexture: cc.Node,
        gameMenu: cc.Node,
        clock: cc.Node,
        timeLabel: cc.Label,
        message: cc.Node,
        position: cc.Node,
        BDFrame: cc.Node,
        scriptName : cc.String,
    },

    // use this for initialization
    onLoad: function () {
        GamePlayer.removeAllPlayers();
        this.node.on('RCMD_initParam', this.RCMD_initParam.bind(this));
        // this.node.on('RCMD_TaskSeat', this.RCMD_TaskSeat.bind(this));
        this.node.on('RCMD_SitIn', this.RCMD_SitIn, this);
        this.node.on('RCMD_PlayerStatus', this.RCMD_PlayerStatus, this);
        this.node.on('RCMD_exit', this.RCMD_exit, this);
        this.node.on('RCMD_Ready', this.RCMD_Ready, this);
        this.node.on('RCMD_GameStart', this.RCMD_GameStart, this);
        this.node.on('RCMD_Start', this.RCMD_Start, this);
        this.node.on('RCMD_ActData', this.RCMD_ActData, this);
        this.node.on('RCMD_Result', this.RCMD_Result, this);
        this.node.on('RCMD_MatchOver', this.RCMD_MatchOver, this);
        this.node.on('AutoDo', this.onClickAuto, this)
        this.node.on('RCMD_MissCarry', this.RCMD_MissCarry, this)
        pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));

        // 语音聊天
        this.node.on('DISPLAY_VOICE', this.displayVoice, this);
        this.node.on('HIDE_VOICE', this.hideVoice, this);
        //聊天
        this.node.on('SHOW_CHAT_MSG', this.showChatMsg, this);
        this.node.on('HIDE_CHAT_MSG', this.hideChatMsg, this);
        //道具
        this.node.on('SHOW_DAO', this.showDao, this);
        this.node.on('HIDE_DAO', this.hideDao, this);

        //监听是否需要开始托管模式（三次超时后就开启）
        this.node.on("OPEN_AUTO_PLAY", this.openAutoPlay, this);

        //道具使用监听
        pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
        }

        this.timeed();
        this.schedule(function () {
            // 这里的 this 指向 component
            this.timeed();
        }, 60);

        this.start = false;
        //默认关闭，防止UI文件被冲掉
        this.chatNode.active = false;
        let self = this;
        PING.BindEvent(function (event) {
            if (event.type == 1) {  // 良好
                getSpriteFrameByUrl('style/majong/mahScene1/texture/wifi/wifi-3', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 2) {  // 一般
                getSpriteFrameByUrl('style/majong/mahScene1/texture/wifi/wifi-2', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            } else if (event.type == 3) {  // 差
                getSpriteFrameByUrl('style/majong/mahScene1/texture/wifi/wifi-1', function (err, spriteFrame) {
                    if (err) return;
                    self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }
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

        if (game) {
            let route = game.server + '.startGame'; 
            PomeloClient.request(route, function (data) {
                cc.log(data)
            });
        }
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

        this.time.string = x + ':' + y;
    },
    RCMD_MissCarry: function () {
        if (this.roomType == 1) {
            this.clock.active = true;
            this.timeLabel.string = 15;
            this.missCarry = true
            this.schedule(this.daoJiShi, 1)
        }
    },

    // 游戏初始化， 显示界面
    RCMD_initParam: function (event) {
        hideLoadingAni();
        let self = this;
        let data = event.detail;
        this.roomType = data.roomType;
        this.gameid = data.gameid;
        this.seatId = data.myseatid;
        this.game = config.getGameById(this.gameid);
        this.ruleFlag = data.ruleFlag;             // 游戏规则
        cc.log('ruleflag', this.ruleFlag);
        this.roomuserid = data.roomuserid;//data.roomuserid;         // 房主 普通房间为0
        this.gameMenu.getComponent('gameMenuScript').setRoomShow(data.roomType)
        let path = 'hall/friendInfo/friendInfo'
        // if (!!this.game.prefab.playerInfoDialog) {
        //     path = 'game/{0}/prefab/playerInfoDialog/playerInfoDialog'.format(self.game.sourcePath);
        // } else {
        //     path = 'style/chat/effect/dao/playerInfoDialog';
        //
        // }
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            self.playerMessage = prefab;
        });


        if (this.roomType < 2) { // 普通房间
            this.roomInfo.active = false;
            this.roomInfo.children[0].active = false;
            this.roomInfo.children[1].active = true;
            this.roomInfo.children[2].active = true;
            this.message.active = true
        } else if (this.roomType == 2) { // 房卡房间
            this.roomInfo.active = true;
            this.roomInfo.children[0].active = true;
            this.roomInfo.children[1].active = false;
            this.roomInfo.children[2].active = false;
            this.message.active = false
            this.roomInfo.children[0].children[0].getComponent(cc.Label).string = data.roomcode;//房间号
            console.log('加载房卡组件')
            var roomcontroller = this.addComponent("CardRoomController");
            roomcontroller.init(data, self);

        }

        // if (this.roomType != 2) {
        //     //只有房卡模式有解散模式!
        //     this.roommenu.getChildByName("content").getChildByName("dissolve").active = false;
        //     this.chatNode.getChildByName("voice").active = false;
        // }
        // if(this.roomType >20){
        //     this.roommenu.getChildByName("content").getChildByName("auto").active = false;
        //     this.roommenu.getChildByName("content").getChildByName("instructions").active = false;
        // }

        this.chatNode.active = this.roomType < 20;   // 复盘不显示
        this._showTitleSprite();

        for (let i = 0; i < 4; i++) {
            this.players[i].children[0].children[1].active = false;
        }
        this.ruleController = this.node.getComponent(this.game.rule);    // MGRule
        this.ruleController._initDataFinish = true;
        // let tishi = '房号'+self.tableid+' ';
        // cc.log(self.tableid)
        // if (this.maxpoint) {
        //     tishi +=  formatNum(self.minpoint) + " - " + formatNum(self.maxpoint);
        // } else {
        //     tishi +=  formatNum(self.minpoint) + " 起";
        // }
        // this.message.getChildByName('message').getComponent(cc.Label).string = tishi;
    },


    RCMD_Dao: function (data) {
        //显示道具
        if (data.flag == 0) {
            cc.log("使用道具成功");
            if (data.suserid == UserCenter.getUserID()) {
                //如果是玩家自己使用，更新游戏币
                UserCenter.updateYouxibiNum(-data.consume);
            }
            // this.controller.emit("SHOW_DAO",data);
            this.showDao(data);
        } else {
            if (data.flag == 1) {
                showAlert(CfgGame.alertData.YOUXIBI_LESS);
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

        if (this.roomType != 2) {
            //更新游戏豆
            if (data.suserid == UserCenter.getUserID()) {
                sourcePlayer.getChildByName("beans").getComponent(cc.Label).string = formatNum(UserCenter.userInfo.youxibiNum);
            } else {
                Porp.getProplist(function (data1, data2) {
                    let ret = data2.results;
                    if (ret) {
                        for (let i = 0; i < ret.length; i++) {
                            let obj = ret[i];
                            if (obj.bh == data.daobh) {
                                sourcePlayer.beans -= parseInt(obj.dj);
                                sourcePlayer.getChildByName("beans").getComponent(cc.Label).string = formatNum(sourcePlayer.beans);
                            }
                        }
                    }
                });
            }
        }


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

    onPlayer: function (event) {
        let self = this;
        if (this.roomType != 1) {
            return
        }
        let player = event.currentTarget;
        if (player.userid == UserCenter.getUserID()) {
            return;
        }
        this.playerMessagePrefab = cc.instantiate(this.playerMessage);
        this.playerMessagePrefab.parent = this.node.parent;
        showLoadingAni()
        Friend.SceachFriends(player.userid, '', function (err, data) {

            if (!err) {
                let info = data.results[0]
                let playerInfoDialogController = self.playerMessagePrefab.getComponent("friendInfoScript");

                Friend.checkIsFriend(player.userid, '', function (err, data) {
                    hideLoadingAni()
                    if (!err) {
                        cc.log(data)
                        playerInfoDialogController.setData(info, '', data.results[0].relation);
                    }
                })


            }
        })
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
        cc.log('播放俏皮话')
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
                if (chair == 0 || chair == 3) {
                    pos = cc.v2(-8, 60);
                } else if (chair == 1) {
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
                if (chair == 0 || chair == 3) {
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

    RCMD_Expend: function (data) {
        cc.log('game expend', data.data);
        let self = this;
        var expend = data.data;

        if (expend.CMD == '001') {
            self.expend = data.data.extData;
            var game = LoadGame.getCurrentGame();
            cc.log('ruleFlag:', this.ruleFlag, 'expend:', this.expend);
            var wanfaDes = !!game.getWanfa ? game.getWanfa(this.ruleFlag, this.expend) : WanFa.getWanfa(game, this.ruleFlag);
            cc.log(wanfaDes);
            self.wanfa.string = wanfaDes;
        }
        else if (expend.CMD == '10003') {
            //更新游戏豆UID
            let chair = this.getChairByUserid(expend.UID);
            let money = expend.Money;
            this.players[chair].getChildByName("beans").getComponent(cc.Label).string = formatNum(money);
            if(expend.UID == UserCenter.getUserID()){
                UserCenter.setYouxibiNum(money);
            }

        } else if (expend.CMD == '10002') {
            this.youxirenshu = expend.PlayerCount
        } else if (expend.CMD == '10001') {
            //房间桌费
            this.roomInfo.children[2].children[0].getComponent(cc.Label).string = expend.deskfee;

            this.roomInfo.children[1].children[0].getComponent(cc.Label).string = expend.basemoney;  //断线 底分
            // if(this.youxirenshu ==2){
            //     this.roomInfo.children[1].children[0].getComponent(cc.Label).string += 'x3'
            // }
        } else if (expend.CMD == '10004') {
            let users = expend.users
            for (let i = 0; i < users.length; i++) {
                let chair = this.getChairByUserid(users[i].userid);
                let money = users[i].zhye;
                this.players[chair].getChildByName("beans").getComponent(cc.Label).string = formatNum(money);
                if (users[i].userid == UserCenter.getUserID()) {
                    UserCenter.setYouxibiNum(money);
                }
            }
        } else if (expend.CMD == '10000') {
            this.minpoint = expend.minpoint;
            this.maxpoint = expend.maxpoint;
            cc.log(this.minpoint)
        }

    },

    RCMD_Result: function (event) {
        let data = event.detail;
        cc.log(data);
        if (this.roomType < 2) {
            this.roomInfo.active = true;
            this.start = true;
        }
        this.cancelAutoPlay();

        this._updatePlayers(data);
    },

    /**
     * 房卡房间结算
     */
    RCMD_MatchOver: function (event) {
        var data = event.detail;
        var self = this;
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
            var node = cc.instantiate(prefab);
            node.parent = self.node.parent;
            var controller = node.getComponent('gameOverRankScript');
            controller.show(data.users, data.count);
        });
    },
    // 玩家入座
    RCMD_SitIn: function (event) {
        let self = this;
        let data = event.detail;
        if (this.gameid > 0) {

            for (var i = 0; i < data.users.length; i++) {
                let user = data.users[i];
                if (user.userid == UserCenter.getUserID()) {
                    if (self.roomType == 1) {
                        self.tableid = user.tableid;
                        cc.log(self.tableid)
                        let tishi = '房号' + self.tableid + '  ';
                        if (this.maxpoint) {
                            tishi += formatNum(self.minpoint) + " - " + formatNum(self.maxpoint);
                        } else {
                            tishi += formatNum(self.minpoint) + " 起";
                        }
                        this.message.getChildByName('message').getComponent(cc.Label).string = tishi;
                    }

                }
                let player = GamePlayer.addPlayer(user);
                if (!player) continue;
                let chair = this.getChairBySeatId(user.seatid);
                if ((this.ruleFlag & 0x01) == 0x01) {
                    cc.log('二人麻将');
                    chair = this.getChairBySeatId2(user.seatid);
                } else if ((this.ruleFlag & 0x02) == 0x02) {
                    cc.log('三人麻将');
                    chair = this.getChairBySeatId3(user.seatid);
                }
                if (this.roomType < 2) {
                    cc.log(this.roomType);
                    if (this.youxirenshu == 2) {
                        cc.log('二人麻将');
                        chair = this.getChairBySeatId2(user.seatid);
                    } else if (this.youxirenshu == 3) {
                        chair = this.getChairBySeatId3(user.seatid);
                    } else {
                        chair = this.getChairBySeatId(user.seatid);
                    }
                }
                this.setChairInfo(player, chair);
            }

        } else {
            for (var i = 0; i < data.users.length; i++) {
                let user = data.users[i];
                let player = GamePlayer.addPlayer(user);
                if (!player) continue;
                let chair = this.getChairBySeatId(user.seatid);
                this.setChairInfo(player, chair);
            }
        }
        this.node.emit('msgQueneStart')
    },

    RCMD_Start: function () {
        cc.log('RCMD_Start', '显示准备消息');
        this.cancelAutoPlay();
        this.btnReady.active = true;
        cc.log(this.start)
        if (this.roomType == 1 && !this.start) {
            this.clock.active = true;
            this.timeLabel.string = 15;
            this.schedule(this.daoJiShi, 1)

        }
    },
    daoJiShi: function () {
        let self = this;
        this.timeLabel.string--;
        if (this.timeLabel.string == 0) {
            cc.log('this.missCarry',this.missCarry)
            if (this.missCarry) {
                this.onClickExit()
            } else {
                this.onClickReady();
                this.unschedule(self.daoJiShi);
            }

        } else if (this.timeLabel.string == 5) {
            showAlert('赶紧准备')
        }

    },

    // 玩家状态改变
    RCMD_PlayerStatus: function (event) {
        let data = event.detail;
        let userid = data.userid;
        let status = data.status;
        let chair = this.getChairByUserid(userid);
        this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline && status < 5);
    },

    // RCMD_TaskSeat: function (event) {
    //     let data = event.detail;
    //     this.seatId = data.seatid;
    // },

    RCMD_GameStart: function (event) {
        this.isGameStart = true;
        let data = event.detail;
        for (let i = 0; i < MAX_PLAYERS; i++) {
            this.setReady(i, false);
        }
        if (this.roomType < 2) {
            this.roomInfo.active = true;
            // this.roomInfo.children[2].getComponent(cc.Label).string = data.basemoney;
            // this.ruleController.baseMoney =  data.basemoney
        }

        this.setMaster(data.userid);
    },

    // 数据恢复
    RCMD_ActData: function (event) {
        let data = event.detail;
        cc.log(data);
        this.isGameStart = true;
        if (this.roomType < 2) {
            this.roomInfo.active = true;
        }
        this.setMaster(data.masterid);
        for (let i = 0; i < MAX_PLAYERS; i++) {
            this.setReady(i, false);
        }
    },

    // 玩家准备
    RCMD_Ready: function (event) {
        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('game RCMD_Ready', userid, chair);
        if (chair == 0) {
            this.showNormalBtn(false);
        }
        this.setReady(chair, true);
    },
    onSettingClick: function () {
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

        self.refreshMenuActive();
    },

    /**
     * 玩法介绍
     */
    onClickInstructions: function () {
        let self = this;
        if (!this.rule) {
            let path;

            if (!!this.game.prefab.guize) {
                path = 'game/{0}/prefab/guize/guize'.format(self.game.sourcePath);
            } else {
                path = 'style/guize/guize'
            }

            cc.loader.loadRes(path, cc.Prefab, function (error, prefab) {

                if (error) {
                    cc.error(error.message || error);
                    return;
                }
                cc.log('加载成功')
                self.rule = cc.instantiate(prefab);
                self.rule.x = cc.winSize.width / 2;
                self.rule.y = cc.winSize.height / 2;
                self.rule.parent = cc.director.getScene();
                let controller = self.rule.getChildByName("controller").getComponent('mahrule');
                controller.setRuleFlag(self.ruleFlag);
                self.refreshInstructions();
            });
        } else {
            self.refreshInstructions();
        }
    },

    refreshInstructions: function () {
        this.refreshMenuActive();
        this.rule.active = true;
    },

    onClickAuto: function () {
        cc.log("onClickAuto");
        if (!this.isGameStart) {
            showAlert(CfgGame.alertData.GAME_NOT_START);
            return;
        }
        else if (this.autoPlay && this.autoPlay.active) {
            //已经处于托管状态了
            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }


        if (!this.autoPlay) {
            let self = this;

            cc.loader.loadRes('style/gameMenu/autoPlay/autoPlay'.format(self.game.gameScenePath), cc.Prefab, function (error, prefab) {

                if (error) {
                    cc.error(error.message || error);
                    return;
                }
                cc.log('加载成功')
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

    refreshAutoPlay: function () {
        this.refreshMenuActive();
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY', true);
    },

    cancelAutoPlay: function () {
        if (!!this.autoPlay) {
            this.autoPlay.active = false;
            GlobEvent.emit('AUTO_PLAY', false);
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

    // 玩家离开
    RCMD_exit: function (event) {
        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('RCMD_exit : ', userid, chair);
        this.players[chair].active = false;
        this.clearPlayStatus(chair);
        GamePlayer.removePlayer(data.userid);
    },

    RCMD_Chat: function (event) {
        cc.log("RCMD_Chat");
        let data = event.detail;
        cc.log(data.userid);
    },

    getSeatIdByChair: function (chair) {
        chair = chair || 0;
        return (this.seatId + chair + 3) % MAX_PLAYERS + 1;

    },

    getChairBySeatId: function (seatId) {
        return (seatId - this.seatId + MAX_PLAYERS) % MAX_PLAYERS;
    },

    getChairByUserid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        if (this.gameid > 0) {
            var chair;
            if (this.roomType < 2) {
                cc.log(this.roomType);
                if (this.youxirenshu == 2) {
                    cc.log('二人麻将');
                    chair = this.getChairBySeatId2(seatid);
                } else if (this.youxirenshu == 3) {
                    chair = this.getChairBySeatId3(seatid);
                } else {
                    chair = this.getChairBySeatId(seatid);
                }
            } else {
                switch (this.ruleFlag & 0x07) {
                    case 0x01:
                        chair = this.getChairBySeatId2(seatid);
                        break;
                    case 0x02:
                        chair = this.getChairBySeatId3(seatid);
                        break;
                    case 0x04:
                        chair = this.getChairBySeatId(seatid);
                        break;
                }
            }
            cc.log('xxxxxxxx: ', chair);
            return chair;
        } else {
            return this.getChairBySeatId(seatid);
        }

    },
    // use this for initialization
    getChairBySeatId3: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 2) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 3) {
            if (chair == 2) {
                chair = 3;
            }
        }
        return chair;
    },

    getChairBySeatId2: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 3) {
                chair = 2;
            }
        } else if (seatId == 2) {
            if (chair == 1) {
                chair = 2;
            }
        }
        return chair;
    },

    initPosition: function (chair) {
        this._position.initUI(chair);
    },

    setMaster: function (masterid) {
        if (this.roomType < 10) {
            this.masterid = masterid;
            for (let i = 0; i < MAX_PLAYERS; i++) {
                this.players[i].children[4].active = false;
            }
            let chair = this.getChairByUserid(masterid);
            if (chair < 0) return;
            this.players[chair].children[4].active = true;
            if (this.roomType == 2) {
                chair = this.getChairByUserid(this.roomuserid);
                this.players[chair].children[0].children[1].active = true;
            }
        }


    },

    setChairInfo: function (user, chair) {
        cc.log("user = ", user);
        let player = this.players[chair];
        let beans = this.roomType == 2 ? user.score : user.money;
        let status = user.status;
        let userImage = user.userImage;
        if (!isUrl(userImage)) {
            let sexs = user.sex == 1 ? 'man' : 'woman';
            userImage = 'commonRes/other/' + sexs;
        }
        player.active = true;
        player.children[1].getComponent(cc.Label).string = user.nick;
        player.children[2].getComponent(cc.Label).string = formatNum(beans);
        // if(player.children[5]){
        //     player.children[5].getComponent(cc.Label).string = user.userid;
        // }

	    loadHead(userImage, function (err, spriteFrame) {
            if (err) {
                cc.log(err)
                return
            }
            player.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
        //保存玩家信息
        player.chair = chair;
        player.userid = user.userid;
        player.sex = user.sex;
        player.beans = beans;
        this.setReady(chair, status == GamePlayer.PlayerState.Ready);
        this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline && status < 5 );
    },

    /**
     *  更新结算信息
     * @param data
     * @private
     */
    _updatePlayers: function (data) {
        var users = data.users;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var player = GamePlayer.getPlayer(user.userid);
            var chair = this.getChairByUserid(user.userid);
            if (this.roomType == 2) {
                player.score = user.score;
                this.players[chair].children[2].getComponent(cc.Label).string = player.score;
            } else if(this.roomType < 2) {
                player.money = user.money;
                if (UserCenter.getUserID() == player.userid) {
                    UserCenter.setYouxibiNum(player.money);
                    GlobEvent.emit('update_UserCenter')
                }
                cc.log('player', chair)
                this.players[chair].children[2].getComponent(cc.Label).string = formatNum(player.money);
            }
        }
    },

    onClickMessage: function () {

    },

    onClickMenu: function () {
        this.refreshMenuActive();
    },
    refreshMenuActive: function () {
        // cc.log('this.roomType')
        // this.roommenu.active = !this.roommenu.active;
        // this.chatNode.active = !this.roommenu.active;
        // if (this.menuIcon1 && this.menuIcon2) {
        //     this.menuIcon1.active = !this.roommenu.active;
        //     this.menuIcon2.active = this.roommenu.active;
        // }
        // if(this.roomType >20){
        //     this.roommenu.getChildByName("content").getChildByName("auto").active = false;
        //     this.roommenu.getChildByName("content").getChildByName("instructions").active = false;
        // }
        // this.chatNode.active = this.roomType < 20;   // 复盘不显示
    },

    onClickVoice: function () {
        cc.log('onClickVoice click');
    },

    showNormalBtn: function (isVisible) {
        this.btnReady.active = isVisible;
    },

    setReady: function (dir, bReady) {
        this.players[dir].children[3].active = bReady;
    },

    setOfflineStatus: function (dir, offline) {
        this.players[dir].children[0].children[0].active = offline;
    },

    onClickReady: function () {
        let self = this;
        this.unschedule(this.daoJiShi);
        this.clock.active = false;
        this.showNormalBtn(false);
        if(this.missCarry){
            if(this.roomType < 2){
                if(!!this.minpoint){
                    let jinbi = UserCenter.getYouxibiNum();
                    let baoxian = UserCenter.getYinhanbiNum();
                    if(jinbi < this.minpoint){
                        if( jinbi+ baoxian < this.minpoint){
                            showAlertBox('账户金币不足',function () {
                                self.closeGmae();
                            })
                        }else{
                            cc.log(this.minpoint,jinbi)
                            let qugao  ;
                            if(this.maxpoint){
                                qugao = this.maxpoint - jinbi;
                            }else{
                                qugao = 10000000 - jinbi;
                            }
                            let qudi = this.minpoint - jinbi;
                            let message = '请取出'+qudi+'-'+qugao+'金币';

                            showAlertBox(message,function () {
                                loadPrefab("hall/bank/bank",function (module) {
                                    module.x = cc.winSize.width / 2;
                                    module.y = cc.winSize.height / 2;
                                    module.parent = cc.director.getScene();
                                    module.getComponent('bankScript').setBank(qudi,qugao,true,function (err,data) {
                                        if(err){
                                            cc.log(err)
                                            hideLoadingAni()
                                            self.closeGmae();
                                            return;
                                        }
                                        let message ={
                                            "CMD":"10003"
                                        }
                                        cc.log('100031',data)
                                        self.sendExpend(message,function (data) {
                                            cc.log('10003',data)
                                            hideLoadingAni()
                                            if(data.code == 200){
                                                self.node.emit('CMD_Ready');
                                            }else{
                                                showAlertBox('取钱出错，请退出游戏后重试',function () {
                                                    self.closeGmae()
                                                })
                                            }

                                        })
                                    })
                                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05,1.1),cc.scaleTo(0.05,1)))
                                });
                            },function () {
                                self.closeGmae()
                            })
                        }
                    }else{
                        self.node.emit('CMD_Ready');
                    }

                }else{
                    showAlertBox('获取金币最小值失败，请退出游戏后再试',function () {
                        self.closeGmae()
                    })
                }
            }else{
                self.node.emit('CMD_Ready');

            }
        }else{
            self.node.emit('CMD_Ready');
        }

        this.start = true;
        this.missCarry = false
    },

    sendExpend: function (data, cb) {
        PomeloClient.request(this.game.server + '.CMD_Expend', {
            data: data
        }, function (data) {
            if (!!cb) {
                cb(data)
            }
            cc.log(data);
        });
    },
    sendGameOver: function () {
        cc.log('开始解散')
        this.node.emit('CMD_forceGameOver');
    },
    //房卡模式解散房间
    onClickDissolve: function () {
        cc.log('onClickDissolve');
        this.node.emit('CMD_forceGameOver');
        this.refreshMenuActive();
    },

    onClickExit: function () {
        cc.log('exit');
        this.node.emit('onExit');
    },

    // 玩家离开，清理状态
    clearPlayStatus: function (chair) {
        this.players[chair].children[3].active = false;
        this.players[chair].children[4].active = false;
    },

    // 初始化房间信息
    showTableInfo: function (data) {

    },

    _showTitleSprite: function () {
        var game = config.getGameById(this.gameid);
        var self = this;
        cc.loader.loadRes(game.title, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }

            self.titleSprite.spriteFrame = spriteFrame;
        });
    },

    onDestroy: function () {
        pomelo.removeAllListeners("RCMD_Dao");
        pomelo.removeAllListeners("RCMD_Expend");
        PING.StopPing();
    },
});
