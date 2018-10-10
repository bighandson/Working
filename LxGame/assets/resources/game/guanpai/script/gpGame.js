const CfgGame = require('CfgGame');
var GamePlayer = require('GamePlayer');
var Porp = require("Prop");
const gpCommand = require('gpCommand');
var config = require('Config');
var WanFa = require('Wanfa');
var LoadGame = require('LoadGame');
var Friend = require('Friend')
var PING = require('Ping');
const MAX_PLAYERS = 2;

cc.Class({
    extends: cc.Component,

    properties: {
        players: {
            default: [],
            type: cc.Node
        },
        btnReady: cc.Node,
        // roommenu : cc.Node,
        roomInfo: cc.Node,
        wanfaLabel: cc.Label,
        Info: cc.Node,
        Invite: cc.Node,
        voiceTipsPrefab: cc.Prefab,
        lookAnimPrefab: cc.Prefab,
        // playerInfoDialogPrefab:cc.Prefab,
        propAnimPrefab: cc.Prefab,
        chatMsgBubblePrefab: cc.Prefab,
        chatNode: cc.Node,
        cardJushu: cc.Node,
        // exitButton:cc.Node,
        // colseNode:cc.Node,
        partenerHandLayout: cc.Node,
        clock: cc.Node,
        allEffectLayout: cc.Node,
        gameroominfo: cc.Node,

        gameMenu: cc.Node,  // by Amao 添加 游戏界面按钮预制体
        message: cc.Node,
        wifi: cc.Node,
        battery: cc.Node,
        batteryTexture: cc.Node,
        time: cc.Label,
        jinbi1: cc.Node,
        jinbi2: cc.Node


    },

    // use this for initialization
    onLoad: function () {
        showLoadingAni();
        let self = this;
        gpManager.controller = this;
        gpManager.designResolution = this.node.parent.getComponent(cc.Canvas).designResolution;

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
        this.playersImage = [];
        this.playersNick = [];
        this.timeed();
        this.schedule(function () {
            // 这里的 this 指向 component
            this.timeed();
        }, 60);

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
    //  加载资源
    loadRes: function () {
        this.loadCount = 0;
        let self = this;
        cc.loader.loadRes("style/poker/texture/pokers", cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                cc.log(err);
                return;
            }
            gpManager.pokersAtlas = atlas;
            gpManager.pokersAtlasS = atlas;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/guanpai/prefab/pokers/gppokerSpriteS', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            gpManager.pokerPrefabS = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/guanpai/prefab/pokers/gppokerSprite', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            gpManager.pokerPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/guanpai/prefab/handCard/gpcardPrefab', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            gpManager.HandCardPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
        cc.loader.loadRes('game/guanpai/prefab/result/gpresultPre', cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log(err);
                return;
            }
            gpManager.resultPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });

        cc.loader.loadRes('game/guanpai/prefab/cutCard/gpcutcardPre', cc.Prefab, function (err, prefab) {
            if (err) {

                return;
            }
            gpManager.cutcardPrefab = prefab;
            self.loadCount++;
            self.checkLoadRes();
        });
    },

    // 检查资源是否加载完成
    checkLoadRes: function () {
        if (this.loadCount == 6) {
            gpManager.isResLoadComplete = true;
            this.initGame();
        }
    },


    // 初始化游戏
    initGame: function () {
        // cc.log('initgame')
        this.node.on('DISPLAY_VOICE', this.displayVoice, this);   // 语言?
        this.node.on('HIDE_VOICE', this.hideVoice, this);         // 语言?

        this.node.on('SHOW_CHAT_MSG', this.showChatMsg, this);
        this.node.on('HIDE_CHAT_MSG', this.hideChatMsg, this);

        this.node.on('SHOW_DAO', this.showDao, this);
        this.node.on('HIDE_DAO', this.hideDao, this);


        this.node.on("OPEN_AUTO_PLAY", this.openAutoPlay, this);   //托管?
        GlobEvent.on("AUTO_PLAY", this.AUTO_PLAY.bind(this));
        pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
        pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));
        GlobEvent.on('LANGUAGE_CHANGE', this.languageChange.bind(this));

        for (let i = 0; i < 2; i++) {
            this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
        }
        let game = LoadGame.getCurrentGame();
        if (!game) {
            game = LoadGame.getFuPanCurrentGame();
        }
        let route = game.server + '.startGame';
        PomeloClient.request(route, function (data) {
            cc.log(route + '=====', data)
        });
        cc.log('intigame')
        hideLoadingAni();// 关闭loading
    },

    RCMD_Expend: function (data) {
        cc.log('RCMD_Expend', data);
        let self = this;
        let expend = data.data;
        if (expend.CMD == '001') {
            self.expend = data.data.extData;
            var game = LoadGame.getCurrentGame();
            //cc.log('ruleFlag:',this.ruleFlag,'expend:',this.expend);
            var wanfaDes = !!game.getWanfa ? game.getWanfa(this.ruleFlag, this.expend) : WanFa.getWanfa(game, this.ruleFlag);
            //cc.log(wanfaDes);
            this.wanfaLabel.string = wanfaDes;

        } else if (expend.CMD == '002') {

            let arr = expend.ar;
            UserCenter.setList(arr);
            GlobEvent.emit('update_UserCenter')
        } else if (expend.CMD == '10000') {
            cc.log('10000')
            this.minpoint = expend.minpoint;
            this.maxpoint = expend.maxpoint;
            cc.log(this.minpoint)
        } else if (expend.CMD == '10003') {
            //更新游戏豆
            cc.log()
            let chair = this.getChairByUserid(expend.UID);
            let money = expend.Money;
            this.players[chair].getChildByName("countText").getComponent(cc.Label).string = money;
            UserCenter.setYouxibiNum(money);
        } else if (expend.CMD == '10004') {
            //更新游戏豆
            let users = expend.users
            for (let i = 0; i < users.length; i++) {
                let chair = this.getChairByUserid(users[i].userid);
                let money = users[i].zhye;
                this.players[chair].getChildByName("countText").getComponent(cc.Label).string = money;
                if (users[i] == UserCenter.getUserID()) {
                    UserCenter.setYouxibiNum(money);
                }
            }
        }

    },

    // 语音包change
    languageChange: function (event) {
        this.bLanguageSound = event;
        if (!this.soundCtrl) {
            return;
        }
        this.soundCtrl.setPlayLanguageSound(this.bLanguageSound);
        ///////-----cc.log(this.bLanguageSound)
        //cc.sys.localStorage.setItem('');
    },
    //注册消息事件监听
    addListeners: function () {
        for (var i = 0; i < gpManager.msgRCMDQueue.length; i++) {
            var msg = gpManager.msgRCMDQueue[i];
            /////////-----cc.log(msg);
            this.node.on(msg, this[msg].bind(this));
        }

        for (var i = 0; i < gpManager.msgRCMDList.length; i++) {
            var msg = gpManager.msgRCMDList[i];
            this.node.on(msg, this[msg].bind(this));
        }
    },

    removeListeners: function () {
        for (var i = 0; i < gpManager.msgRCMDQueue.length; i++) {
            var msg = gpManager.msgRCMDQueue[i];
            ///////-----cc.log(msg);
            this.node.off(msg, this[msg].bind(this));
        }

        for (var i = 0; i < gpManager.msgRCMDList.length; i++) {
            var msg = gpManager.msgRCMDList[i];
            this.node.off(msg, this[msg].bind(this));
        }
        GlobEvent.removeAllListeners('LANGUAGE_CHANGE');
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

        // if (player.chair == 0) {
        //     this.playerInfoDialog.x = player.x + this.playerInfoDialog.width / 2 + player.width / 2 - 50;
        //     this.playerInfoDialog.y = player.y - 20;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        // } else if (player.chair == 1) {
        //     this.playerInfoDialog.x = player.x - this.playerInfoDialog.width / 2 - player.width / 2 + 50;
        //     this.playerInfoDialog.y = player.y - 20;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        //
        // } else if (player.chair == 2) {
        //     this.playerInfoDialog.x = player.x + 330;
        //     this.playerInfoDialog.y = player.y - this.playerInfoDialog.height / 2 - player.height / 2 + 200;
        //     if (this.playerInfoDialog.x > 1334 - this.playerInfoDialog.width / 2) {
        //         this.playerInfoDialog.x = 1334 / 2;
        //     }
        // } else {
        //     this.playerInfoDialog.x = player.x + this.playerInfoDialog.width / 2 + player.width / 2 - 50;
        //     this.playerInfoDialog.y = player.y - 20;
        //     if (this.playerInfoDialog.y > 750 - this.playerInfoDialog.height) {
        //         this.playerInfoDialog.y = this.playerInfoDialog.height;
        //     }
        // }
        //
        // ///////-----cc.log("x,y "+this.playerInfoDialog.x+","+this.playerInfoDialog.y);
        // let playerinfo = GamePlayer.getPlayer(player.userid);
        // let lpayerInfoController = this.playerInfoDialog.getComponent("playerInfoDialogController");
        // lpayerInfoController.onShow(playerinfo);
    },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RCMD_Kick: function (event) {
        cc.log("RCMD_Kick");
        ///////-----cc.log(event);
    },


    RCMD_signup: function (event) {
        cc.log("RCMD_signup");
        ///////-----cc.log(event);
    },

    RCMD_MobileSignUp: function (event) {
        cc.log("RCMD_MobileSignUp");
        ///////-----cc.log(event);
    },

    RCMD_PlayerStatus: function (event) {

        cc.log("RCMD_playerStatus");
        cc.log("RCMD_PlayerStatus");
        let data = event.detail;
        let userid = data.userid;
        let status = data.status;
        let chair = this.getChairByUserid(userid);
        this.setOfflineStatus(chair, status);

    },


    RCMD_ServerHeartOut: function (event) {
        cc.log("RCMD_ServerHeartOut");
        ///////-----cc.log(event);
    },

    RCMD_Timeout: function (event) {
        cc.log("RCMD_Timeout");
        ///////-----cc.log(event);
    },

    RCMD_close: function (event) {
        cc.log("RCMD_close");
        ///////-----cc.log(event);
    },


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    RCMD_initParam: function (event) {
        //hideLoadingAni();
        cc.log("RCMD_initParam");
        ///////-----cc.log(data);

        let data = event.detail;
        this.roomType = data.roomType;
        this.gameid = data.gameid;
        this.ruleFlag = data.ruleFlag;
        this.roomuserid = data.roomuserid;//data.roomuserid;

        if (this.roomType == 2) {
            this.roomInfo.children[0].getComponent(cc.Label).string = data.roomcode;
            this.roomcode = data.roomcode;
        }

        // if(this.roomType != 2) 
        // {
        //     this.roommenu.getChildByName("content").getChildByName("disInvite").active = false;
        //     this.chatNode.getChildByName("speech").active = false;
        // }

        // by Amao  设置游戏界面哪些按钮需要显示 哪些需要隐藏  传入 游戏类型
        this.gameMenu.getComponent('gameMenuScript').setRoomShow(this.roomType)

        this.chatNode.active = this.roomType < 20;
    },

    InitData: function () {
        this.outCardType = 0;
        this.outcardseatid = 0;
        this.num = 2;
        this.length = 0;
        this.X = 1;
        this.PokScore = 0;
    },

    clockCallback: function () {
        this.clockCount--;

        this.clock.getChildByName("time").getComponent(cc.Label).string = this.clockCount;

        if (this.clockCount == 0) {
            //时间到了
            this.unschedule(this.clockCallback);
            this.clock.active = false;
        }
    },

    //闹钟移动动画
    playClockAni: function (chair, time) {
        if (chair == 1) {
            this.clock.active = true
            this.clock.opacity = 0
            // cc.log("this.clock======",this.clock.position)
            this.clock.setPosition(cc.p(530, 100))
            this.clock.getChildByName("time").getComponent(cc.Label).string = time;
            this.clockCount = time
            this.schedule(this.clockCallback, 1);

            var move = cc.sequence(cc.spawn(cc.fadeIn(0.3), cc.moveTo(0.3, cc.p(530, 200))));
            this.clock.runAction(move)

        } else {
            this.unschedule(this.clockCallback);
            this.clock.active = false;
        }
    },
    daoJiShi: function () {
        let self = this;
        this.clock.getChildByName("time").getComponent(cc.Label).string--;
        if (this.clock.getChildByName("time").getComponent(cc.Label).string == 0) {
            this.onClickReady();
            this.unschedule(self.daoJiShi);
        } else if (this.clock.getChildByName("time").getComponent(cc.Label).string == 5) {
            showAlert('赶紧准备')
        }

    },

    RCMD_Command: function (event) {
        let self = this
        let data = event.detail;
        let cmd = data.cmd;
        let retData = data.data;

        // cc.log("RCMD_Command",'------',cmd);

        if (cmd == gpCommand.RESP_CMD.RCMD_INITDATA) {
            cc.log("RCMD_INITDATA          :  ");
            cc.log(retData);
            this.roomType = retData.roomType;
            this.gameid = retData.gameid;
            this.ruleFlag = retData.ruleFlag;
            this.roomInfo.active = true;
            this.seatId = retData.myseatid;

            this.game = config.getGameById(this.gameid);
            this.soundCtrl = this.node.addComponent(this.game.sound || 'gpSound');  // 默认普通话
            if (this.roomType < 2) {
                this.jinbi1.active = true;
                this.jinbi2.active = true;
                this.roomInfo.active = false;
                this.cardJushu.active = false;
                if (retData.basescore > 0) {
                    this.gameroominfo.active = true;
                    this.gameroominfo.children[0].getComponent(cc.Label).string = retData.basescore;
                    this.gameroominfo.children[1].getComponent(cc.Label).string = retData.deskfee;
                }
            } else if (this.roomType == 2) { // 房卡房间

                // this.roomInfo.children[0].active = true;
                // this.roomInfo.children[1].active = false;
                this.roomInfo.children[0].getComponent(cc.Label).string = retData.roomcode;
                this.roomcode = '房号:' + retData.roomcode;
                // this.roomInfo.children[2].active = true;

                gpManager.isBeans = (this.ruleFlag & 0x01 == 0x01 ? 1 : 0);
                this.expend = retData.expend;
                var game = LoadGame.getCurrentGame();

                var wanfaDes = !!game.getWanfa ? game.getWanfa(this.ruleFlag, this.expend) : WanFa.getWanfa(game, this.ruleFlag);
                cc.log(wanfaDes);
                this.wanfaLabel.string = wanfaDes;

                this.cardJushu.active = true;
                if (retData.currGame == 0) {
                    this.Invite.active =  wxapi.isInstallWeChat();
                }
                this.refreshJushu(retData.currGame, retData.totalGame);
                this.cardRoomInitFlag = false;
                if (!this.cardRoomInitFlag) {
                    var roomcontroller = this.addComponent("CardRoomController");
                    roomcontroller.init(data, self);
                    this.cardRoomInitFlag = true;
                }
            }

            // if(this.roomType != 2)
            // {
            //     this.roommenu.getChildByName("content").getChildByName("disInvite").active = false;
            //     this.chatNode.getChildByName("speech").active = false;
            // }

            // by Amao  设置游戏界面哪些按钮需要显示 哪些需要隐藏  传入 游戏类型
            this.gameMenu.getComponent('gameMenuScript').setRoomShow(this.roomType)

            this.InitData();

            this.chatNode.active = this.roomType < 20;
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_GameStart) {
            cc.log("RCMD_GameStart");
            cc.log(retData);
            if (this.roomType < 2) {
                this.gameroominfo.active = true;
                this.gameroominfo.children[0].getComponent(cc.Label).string = retData.basescore;
                this.gameroominfo.children[1].getComponent(cc.Label).string = retData.deskfee;


            }
            for (let index = 0; index < 4; index++) {
                this.setGameStartStatus(index);
            }
            this.cardData = retData.lightcard;
            var cardData = gpManager.getCardTypeNum(retData.lightcard);

            this.cutcardPrefab = cc.instantiate(gpManager.cutcardPrefab);
            this.cutcardPrefab.parent = this.node.parent.getChildByName('cutCard');
            var cutcard = this.cutcardPrefab.getChildByName('control');
            var Ctrl = cutcard.getComponent('gpcutcardCtrl');
            Ctrl.showLightCard(cardData, 1);


            this.soundCtrl.playStart();
            this.rank = 0;
            this.refreshJushu(retData.currGame, retData.totalGame);

            this.InitData();

            gpManager.rule.setMsgBlocked(false);

        } else if (cmd == gpCommand.RESP_CMD.RCMD_SendLightCardID) {
            cc.log('RCMD_SendLightCardID', retData);
            var Id1 = retData.uid1;
            var Id2 = retData.uid2;
            var chair1 = this.getChairByUserid(Id1);
            var chair2 = this.getChairByUserid(Id2);
            if (chair1 == chair2 || (chair1 + 2) == chair2 || (chair1 - 2) == chair2) {
                this.showCardNUM();
            }

            var player1 = this.players[chair1];
            var player2 = this.players[chair2];

            var node1 = player1.getChildByName('LightCard');
            var node2 = player2.getChildByName('LightCard');

            var position1 = player1.getChildByName('LightCard').getPosition();
            var position2 = player2.getChildByName('LightCard').getPosition();
            if (Id1 == Id2) {
                if (chair2 != 1) {
                    position2 = cc.p(position2.x + 100, position2.y);
                }
                else {
                    position2 = cc.p(position2.x - 100, position2.y);
                }
            }

            var wPos1 = node1.convertToWorldSpaceAR(position1);
            var wPos2 = node2.convertToWorldSpaceAR(position2);


            var lightcard = this.cutcardPrefab.getChildByName('lightcard');

            position1 = lightcard.convertToNodeSpaceAR(wPos1);
            position2 = lightcard.convertToNodeSpaceAR(wPos2);

            var BigLight = lightcard.children[0];
            var SmallLight = lightcard.children[1];
            if (gpManager.rule.playerNum == 4) {
                SmallLight.active = true;
            }


            var Action1 = cc.spawn(cc.moveTo(0.5, position1), cc.rotateBy(0.5, 360));
            var Action2 = cc.spawn(cc.moveTo(0.5, cc.p(position2.x, position2.y)), cc.rotateBy(0.5, 360));


            BigLight.runAction(cc.sequence(Action1, cc.delayTime(1.5), cc.callFunc(function () {
                BigLight.removeFromParent();
                gpManager.rule.setMsgBlocked(false);
            })));
            SmallLight.runAction(cc.sequence(cc.delayTime(0.1), Action2, cc.delayTime(1.4), cc.callFunc(function () {
                SmallLight.removeFromParent();
            })));


        } else if (cmd == gpCommand.RESP_CMD.RCMD_SendCard) {

            cc.log('RCMD_SendCard');
            cc.log(retData);

            let userId = retData.userid;

            let card = retData.ar;
            let cardnum = card.length;
            var cansee = retData.bcansee;
            let chair = this.getChairByUserid(userId);
            let player = this.players[chair];
            this.setGameStartStatus(chair);
            var isPlayAni = retData.aniflag;
            let NUMSprite = player.getChildByName("NUM");
            NUMSprite.active = true;
            NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = cardnum;

            if (chair == 1) {
                this.setOtherCardNumb(player.getChildByName('otherHandLayout'), cardnum);
            }

            // if(chair == 2&&cansee == 1)
            // {
            //     this.showOutCard(this.partenerHandLayout,card,false,chair);
            //     this.refreshPartenerHandCard();
            // }
            if (userId == UserCenter.getUserID()) {
                for (let index = 0; index < card.length; index++) {
                    card[index] = gpManager.getCardTypeNum(card[index]);
                }
                this.showHandCard(card, isPlayAni);
                // NUMSprite.active=true;
                if (isPlayAni == 1) {
                    var timeCallback = function (dt) {
                        this.soundCtrl.playFapai();
                    };
                    // NUMSprite.active=false;
                    this.scheduleOnce(timeCallback, 0.1);
                }
            }
            else {
                if (cardnum > 0 && isPlayAni != 1) {
                    // NUMSprite.active=true;
                }
                gpManager.rule.setMsgBlocked(false);
            }

            NUMSprite.active = false;
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_Change) {
            cc.log('RCMD_Change', retData);
            let userid0 = retData.userid0;
            let userid1 = retData.userid1;
            let seatid0 = retData.seat0;
            let seatid1 = retData.seat1;

            this.exchangeChair(userid0, userid1, seatid0, seatid1);

        } else if (cmd == gpCommand.RESP_CMD.RCMD_Eastwind) {
            cc.log('RCMD_Eastwind', retData);
            this.outCardType = 0;
            this.outcardseatid = 0;
            this.num = 2;
            this.PokScore = 0;
            this.Info.children[0].getComponent(cc.Label).string = this.PokScore;
            this.length = 0;
            this.X = 1;
            for (var i = 1; i <= 4; i++) {
                let chair = this.getChairBySeatId(i);
                this.players[chair].getChildByName("pass").active = false;
                let outcard = this.players[chair].getChildByName("outCardLayout");
                outcard.removeAllChildren(true);
            }
            var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
            outcardLayout.removeAllChildren(true);
            gpManager.rule.setMsgBlocked(false);
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_CleanCard) {
            cc.log("RCMD_CleanCard");
            cc.log(retData);
            let CleanUserId = retData.userid;
            let chair = this.getChairByUserid(CleanUserId);
            let outcard = this.players[chair].getChildByName("outCardLayout");
            outcard.removeAllChildren(true);
            if (CleanUserId == UserCenter.getUserID()) {
                var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
                outcardLayout.removeAllChildren(true);
            }

            gpManager.rule.setMsgBlocked(false);
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_Runfirst) {
            cc.log("RCMD_Runfirst", retData);
            this.rank = 0;
            let rankArray = retData.ar;
            for (var i = 0; i < rankArray.length; i++) {
                var rank = rankArray[i];
                var rankNum = rank.first;
                if (rankNum > 0) {
                    var rankNum = rank.first;
                    var userid = rank.userid;
                    var chair = this.getChairByUserid(userid);
                    this.rank += 1;
                    var player = this.players[chair];
                    player.getChildByName('NUM').active = false;
                    var rankImg = player.getChildByName('rankImg' + rankNum);
                    rankImg.active = true;
                }
            }
            gpManager.rule.setMsgBlocked(false);
        }
        //该谁出牌
        else if (cmd == gpCommand.RESP_CMD.RCMD_First) {
            cc.log('RESP_CMD.RCMD_First')
            let firstID = retData.userid;
            let time = retData.playtime;
            let chair = this.getChairByUserid(firstID);
            let seatid = this.getSeatIdByChair(chair);
            let player = this.players[chair];
            // cc.loader.loadRes('game/guanpai/gpScene/texture/headbg',cc.SpriteFrame,function (err,spriteFrame) {
            //     player.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            // });
            let outcardLayout = player.getChildByName("outCardLayout");
            let pass = player.getChildByName("pass");
            pass.active = false;
            outcardLayout.removeAllChildren(true);

            // // 播放闹钟移动出现动画
            this.playClockAni(chair, time)

            if (seatid == this.outcardseatid) {
                this.outCardType = 0;
                this.PokScore = 0;
                this.Info.children[0].getComponent(cc.Label).string = this.PokScore;

                for (var i = 1; i <= 4; i++) {
                    if (i != seatid) {
                        let passchair = this.getChairBySeatId(i);
                        this.players[passchair].getChildByName("pass").active = false;
                        let outcard = this.players[chair].getChildByName("outCardLayout");
                        outcard.removeAllChildren(true);
                    }
                }

            }
            // this.Info.active = true;

            if (firstID == UserCenter.getUserID()) {
                let handCard = this.handCardprefab.getChildByName("control");
                let handCardController = handCard.getComponent("gphandCard");
                var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
                handCardController.changeCardOut();
                if (outcardLayout != null) {
                    outcardLayout.removeAllChildren(true);
                }
                handCardController.showtime(time, self);
                this.handCardprefab.getChildByName("gameBtn").active = true;
                if (this.outCardType == 0) {
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active = false;
                }
                else {
                    this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active = true;
                }
                handCardController.getCardData(this.tableId, seatid, this.outCardType, this.length, this.num, this.X, true);


            }

            gpManager.rule.setMsgBlocked(false);
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_OutCardDLink) {
            cc.log("RCMD_OutCardDLink");
            let userid = retData.userid;
            let cardarray = retData.cardarray;
            let cardtype = retData.cardtype;
            let seatid = retData.seatid;
            this.outcardseatid = seatid;
            let chair = this.getChairBySeatId(seatid);
            let player = this.players[chair];
            let length = cardarray.length;


            if (cardtype == 6 || cardtype == 9 || cardtype == 8 || cardtype == 10) { // 三代二
                // var num = gpManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
                this.num = gpManager.getCardMinnum(cardtype, cardarray)
            } else if (cardtype == 11 || cardtype == 12) { // 炸弹
                var num = gpManager.getCardTypeNum(cardarray[1]);
                this.num = num[1]
            } else {
                var num = gpManager.getCardTypeNum(cardarray[cardarray.length - 1]);
                this.num = num[1]
            }

            // 牌型为7 且包含2的顺子 最小  需要单独判断
            if (cardtype == 7) {
                for (var i = 0; i < cardarray.length; i++) {
                    if (gpManager.getCardTypeNum(cardarray[i])[1] == 15) {
                        this.num = 2;
                        break;
                    }
                }
            }

            var baseNode = player.getChildByName("outCardLayout");
            baseNode.active = true;
            this.showOutCard(baseNode, cardarray, true, chair);


            let handCard = this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("gphandCard");

            this.outCardType = cardtype;
            this.length = length;

            handCardController.getCardData(this.tableId, this.outcardseatid, cardtype, length, this.num, this.X, false);

            gpManager.rule.setMsgBlocked(false);

        }
        //出牌
        else if (cmd == gpCommand.RESP_CMD.RCMD_OutCard) {

            cc.log("RCMD_OutCard");
            let userid = retData.userid;
            let cardarray = retData.cardarray;
            let cardtype = retData.cardtype;
            let seatid = retData.seatid;
            let length = cardarray.length;
            let selfUsrid = UserCenter.getUserID();

            if (cardtype == 6 || cardtype == 9 || cardtype == 8 || cardtype == 10) { // 三代二
                // var num = gpManager.getCardTypeNum(cardarray[cardarray.length/5*3-1]);
                this.num = gpManager.getCardMinnum(cardtype, cardarray)
            } else if (cardtype == 11 || cardtype == 12) { // 炸弹
                var num = gpManager.getCardTypeNum(cardarray[1]);
                this.num = num[1]
            } else {
                var num = gpManager.getCardTypeNum(cardarray[cardarray.length - 1]);
                this.num = num[1]
            }

            // 牌型为7 且包含2的顺子 最小  需要单独判断
            if (cardtype == 7) {
                for (var i = 0; i < cardarray.length; i++) {
                    if (gpManager.getCardTypeNum(cardarray[i])[1] == 15) {
                        this.num = 2;
                        break;
                    }
                }
            }

            let chair = this.getChairByUserid(userid);


            let player = this.players[chair];
            // cc.loader.loadRes('game/guanpai/gpScene/headbg1',cc.SpriteFrame,function (err,spriteFrame) {
            //     player.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            // });
            var baseNode = player.getChildByName("outCardLayout");
            var effectNode = player.getChildByName("effectNode");
            baseNode.active = true;
            this.outcardseatid = seatid;
            this.outCardType = cardtype;
            this.length = length;
            let NUMSprite = player.getChildByName("NUM");
            NUMSprite.active = true;
            var numValue = NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string;
            numValue = parseInt(numValue);
            numValue -= length;

            if (numValue == 0) {
                this.rank += 1;
                NUMSprite.active = false;
                if (chair == 1) {
                    this.setOtherCardNumb(player.getChildByName('otherHandLayout'), numValue);
                }
                // var rankImg = player.getChildByName("rankImg"+this.rank);
                // if (rankImg) {rankImg.active=true;}
            } else {
                NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = numValue;
                if (chair == 1) {
                    this.setOtherCardNumb(player.getChildByName('otherHandLayout'), numValue);
                }
            }

            NUMSprite.active = false;

            if (userid != UserCenter.getUserID()) {
                this.showOutCard(baseNode, cardarray, true, chair);
                this.showOutCardAni(effectNode, this.outCardType); // 别人出牌特效
            } else {
                for (let index = 0; index < cardarray.length; index++) {
                    let cards = cardarray[index];
                    let card = gpManager.getCardTypeNum(cards);
                    var num11 = card[1];
                    if (num11 == 5) {
                        this.PokScore += 5;
                    } else if (num11 == 10) {
                        this.PokScore += 10;
                    } else if (num11 == 13) {
                        this.PokScore += 10;
                    }
                }
            }
            this.Info.children[0].getComponent(cc.Label).string = this.PokScore;


            if (this.partenerHandLayout.childrenCount != 0) {
                for (var i = 0; i < cardarray.length; i++) {
                    var card = cardarray[i];
                    for (var j = 0; j < this.partenerHandLayout.childrenCount; j++) {
                        var cardObject = this.partenerHandLayout.children[j];
                        if (card == cardObject.getComponent("gppokerCtr").info) {
                            cardObject.removeFromParent();
                            break;
                        }
                    }
                }
            }

            cc.log('this.partenerHandLayout === :', this.partenerHandLayout.active, this.partenerHandLayout.childrenCount)

            // if(cardtype>=10&&this.X>=3){
            //     this.num = gpManager.rule.JudgeNum(baseNode.children);
            // }
            // else{
            //     this.num=num[1];
            // }

            let handCard = this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("gphandCard");
            handCardController.getCardData(this.tableId, this.outcardseatid, this.outCardType, this.length, this.num, this.X, false);
            var type = handCardController.changeCardType(cardtype);
            // cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!",cardtype,type);
            let user = GamePlayer.getPlayer(userid);
            this.playSound(user.sex, type, this.num);
            this.playBoomEffect(cardtype);
            gpManager.rule.setMsgBlocked(false);
        }
        //过牌
        else if (cmd == gpCommand.RESP_CMD.RCMD_GiveUpOutCard) {
            cc.log("RCMD_GiveUpOutCard", retData);
            let userid = retData.userid;
            let chair = this.getChairByUserid(userid);
            let player = this.players[chair];
            // cc.loader.loadRes('game/guanpai/gpScene/headbg1',cc.SpriteFrame,function (err,spriteFrame) {
            //     player.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            // });
            var passSprite = player.getChildByName("pass");
            passSprite.active = true;
            let handCard = this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("gphandCard");
            let user = GamePlayer.getPlayer(userid);
            this.soundCtrl.playPass(user.sex);
            handCardController.getCardData(this.tableId, this.outcardseatid, this.outCardType, this.length, this.num, this.X, false);
            gpManager.rule.setMsgBlocked(false);
        }
        //结算界面
        else if (cmd == gpCommand.RESP_CMD.RCMD_Result) {

            this.playClockAni(5)// 清除闹钟动画
            this.isGameStart = false;
            this.cancelAutoPlay();
            cc.log("RCMD_Result", retData);

            let data = retData.ar;
            let chaodi = retData.chaodi;

            var wins = [0, 0];
            for (var i = 0; i < data.length; i++) {
                let userid = data[i].userid;
                let chair = this.getChairByUserid(userid);
                wins[chair] = data[i].curwon;
                if (data[i].cardar.length > 0 && data[i].userid != UserCenter.getUserID()) {
                    let player = this.players[chair];
                    this.setOtherCardNumb(player.getChildByName('otherHandLayout'), 0);
                    player.getChildByName('HandLayout').active = true;
                    player.getChildByName('HandLayout').removeAllChildren();
                    this.showOutCard(player.getChildByName('HandLayout'), data[i].cardar, true, chair);
                }
            }

            this._updatePlayers(data);

            this.resultprefab = cc.instantiate(gpManager.resultPrefab);
            this.resultprefab.parent = this.node.parent;

            var result = this.resultprefab.getChildByName("resultNode");
            let resultprefab = this.resultprefab.getChildByName("controller");
            let Controller = resultprefab.getComponent("gpresultContro");
            let node = this.resultprefab.getChildByName("ResultLabel");

            for (var i = 0; i < 2; i++) {
                var labWin = node.children[i];
                var winVlaue = wins[i]

                let labelname = "Label_" + (winVlaue >= 0 ? "win" : 'lose')
                var label = labWin.getChildByName(labelname);
                label.active = true;
                label.getComponent(cc.Label).string = ':' + Math.abs(winVlaue); //分数

                label.opacity = 0
                if (i == 0) {
                    label.setPosition(cc.p(0, 100))
                    var move = cc.sequence(cc.spawn(cc.fadeIn(1), cc.moveTo(0.5, cc.p(0, 0))));
                } else {
                    label.setPosition(cc.p(0, -100))
                    var move = cc.sequence(cc.spawn(cc.fadeIn(1), cc.moveTo(0.5, cc.p(0, 0))));
                }
                label.runAction(move)

                if (data[i].userid == UserCenter.getUserID()) {
                    if (data[i].curwon >= 0) {
                        this.soundCtrl.playWin();
                        result.getChildByName("resultWin").active = true;
                        result.getChildByName("resultWin").setScale(0.2)
                        let scale = cc.sequence(cc.scaleTo(0.5, 1.3), cc.scaleTo(0.5, 1), cc.delayTime(1.2), cc.callFunc(function () {
                            result.getChildByName("resultWin").active = false;
                        }));
                        result.getChildByName("resultWin").runAction(scale)
                        result.getChildByName("resultWin").getChildByName('label').getComponent(cc.Label).string = ':' + Math.abs(data[i].curwon);
                    }
                    else {
                        this.soundCtrl.playLose();
                        result.getChildByName("resultFail").active = true;
                        result.getChildByName("resultFail").getChildByName('label').getComponent(cc.Label).string = ':' + Math.abs(data[i].curwon);
                        result.getChildByName("resultFail").setScale(0.2)
                        let scale = cc.sequence(cc.scaleTo(0.5, 1.3), cc.scaleTo(0.5, 1), cc.delayTime(1.2), cc.callFunc(function () {
                            result.getChildByName("resultFail").active = false;
                        }));
                        result.getChildByName("resultFail").runAction(scale)
                    }
                }
            }

            gpManager.rule.setMsgBlocked(false);
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_SendPrise) {
            cc.log('RESP_CMD.RCMD_SendPrise', retData);///
            let data = retData.playar;
            this.PokScore = retData.curscore;
            this.Info.children[0].getComponent(cc.Label).string = this.PokScore;
            for (var i = 0; i < data.length; i++) {
                var datainfo = data[i];
                var userid = datainfo.userid;
                var gong = datainfo.score;
                var chair = this.getChairByUserid(userid);
                var player = this.players[chair];
                var gongbox = player.getChildByName('prisebox');
                gongbox.children[0].getComponent(cc.Label).string = formatNum(gong);

            }

            gpManager.rule.setMsgBlocked(false);
        }
    },
    refreshPartenerHandCard: function () {
        let length = this.partenerHandLayout.childrenCount;
        let startX;
        var Layout = this.partenerHandLayout.getComponent(cc.Layout);
        if (length >= 2 && length <= 27) {
            Layout.spacingX = (-92 + (27 - length));
        }
        else if (length > 0 && length <= 2) {
            Layout.spacingX = -67;
        }
        if (length % 2 == 1) {
            //单数
            startX = Math.floor(length / 2) * (-46);
        } else {
            //双数
            startX = -46 / 2 - (Math.floor(length / 2) - 1) * 46;
        }

        gpManager.rule.sortHandPokersBToS(this.partenerHandLayout.children);

        for (let i = 0; i < length; i++) {
            let poker = this.partenerHandLayout.children[i];
            poker.x = startX + 46 * i;
            poker.setLocalZOrder(10000 + i);
            poker.getComponent("gppokerCtr").index = i;
        }
    },
    // 修改其他玩家手牌 以背面显示
    setOtherCardNumb: function (parent, num) {
        parent.active = true
        for (var i = 0; i < parent.getChildrenCount(); i++) {
            parent.getChildByName('card' + (i + 1)).active = false
        }

        for (var i = 0; i < num; i++) {
            parent.getChildByName('card' + (i + 1)).active = true
        }
    },

    playSound: function (sex, type, num) {
        if (num == 15) {
            num = 1;
        }
        else if (num == 16) {
            num = 14
        }
        else if (num == 17) {
            num = 15;
        }
        else {
            num -= 1;
        }
        this.soundCtrl.playPai(sex, num, type);
    },

    playBoomEffect: function (type) {
        if (type == 11 || type == 12) {
            this.soundCtrl.playBoom1();
        } else if (type == 8) {
            // this.soundCtrl.playFeiji();
        }

    },

    refreshTable: function () {
        for (var i = 0; i < 2; i++) {
            let player = this.players[i];
            for (var j = 1; j < 2; j++) {
                player.getChildByName("rankImg" + j).active = false;
            }
            player.getChildByName("pass").active = false;
            let outCardLayout = player.getChildByName("outCardLayout");
            outCardLayout.removeAllChildren(true);
            player.getChildByName("NUM").active = false;
            this.handCardprefab.getChildByName("handLayout").removeAllChildren(true);
        }
        // this.Info.active = false;
        this.PokScore = 0;
        this.partenerHandLayout.removeAllChildren(true);
        this.handCardprefab.getChildByName("outCardLayout").removeAllChildren(true);
    },

    showOutCardAni: function (effectnode, type) {
        var effectName = '';
        var node = gpManager.controller.allEffectLayout;

        if (type == 1) {
            // effectName='danzhang/danzhang_preb';
        } else if (type == 2) {
            // effectName='duizi/duizi_preb';
        } else if (type == 3) {
            // effectName='sanzhang/sanzhang_preb';
        } else if (type == 4) {
            effectName = 'liandui/liandui_preb';
        } else if (type == 5) {
            effectName = 'liansan/liansan_preb';
        } else if (type == 6 || type == 9) {
            effectName = 'sandaier/sandaier_preb';
        } else if (type == 7) {
            effectName = 'shunzi/shunzi_preb';
            // node = effectnode;
        } else if (type == 8 || type == 10) {
            effectName = 'feiji/feiji_preb';
        } else if (type > 10) {
            effectName = 'zhadan/zhadan_preb';
        }


        if (effectName != '') {
            cc.loader.loadRes("game/guanpai/effect/" + effectName, cc.Prefab, function (err, prefab) {
                if (err) {
                    cc.log("载入出牌动画出错", err);
                    return;
                }
                var module = cc.instantiate(prefab);
                module.parent = node;
                module.getComponent(cc.Animation).on('finished', function () {
                    module.removeFromParent(true);
                    // cc.log("播放完出牌动画后 清除")
                }, module);
            });
        }
    },

    showOutCard: function (baseNode, data, isS, chair) {
        let z = 100;
        var temp = [];
        // if(chair==1){
        // if(data.length<10){
        //     baseNode.setPositionX(-120+40*(9-data.length));
        // }
        // else{
        //     baseNode.setPositionX(-120);
        // }
        // baseNode.setPositionX(-data.length*40/2);
        // baseNode.setPositionY(10);
        // }

        baseNode.removeAllChildren(true)

        for (let index = 0; index < data.length; index++) {
            let cards = data[index];
            let card = gpManager.getCardTypeNum(cards);
            var pokerPrefab;
            if (isS) {
                pokerPrefab = cc.instantiate(gpManager.pokerPrefabS);
                this.X = gpManager.rule.JudgeX(baseNode.children);
            }
            else {
                pokerPrefab = cc.instantiate(gpManager.pokerPrefab);
            }
            pokerPrefab.setLocalZOrder(z + index);
            pokerPrefab.parent = baseNode;

            let type = card[0];
            let num = card[1];
            let info = card[2];
            temp.push(pokerPrefab);
            var pokerController;
            if (num == 5) {
                this.PokScore += 5;
            } else if (num == 10) {
                this.PokScore += 10;
            } else if (num == 13) {
                this.PokScore += 10;
            }

            if (isS) {
                pokerController = pokerPrefab.getComponent("gppokerCtrS");
                pokerController.init(gpManager.pokersAtlasS, {num: num, type: type}, info);
            }
            else {
                pokerController = pokerPrefab.getComponent("gppokerCtr");
                pokerController.init(gpManager.pokersAtlas, {num: num, type: type}, info, 1);
            }

        }
        //SkManage.rule.sortHandPokersBToS(temp);
    },
    getCardNum: function (data) {
        let cardArr = [];
        for (var index = 0; index < data.length; index++) {
            var cards = data[index];
            var card = gpManager.getCardTypeNum(cards);
            cardArr.push(card[1]);
        }
        gpManager.runle.JudgeX(cardArr);
    },
    /**
     *
     */
    refreshJushu: function (currGame, totalGame) {

        // cc.log("=====局数==========",currGame,totalGame);
        this.cardJushu.getChildByName("num").getComponent(cc.Label).string = '{0}/{1}'.format(currGame, totalGame);
        // var gong = 0;
        // for(var i = 0;i<this.players.length;i++)
        // {
        //     var player = this.players[i];
        //     var prisebox = player.getChildByName('prisebox');
        //     prisebox.children[0].getComponent(cc.Label).string = formatNum(gong);
        // }
    },

    onClickDissolve: function () {
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

    onClickInviteBtn: function () {

        // var game = LoadGame.getCurrentGame();
        // var title = '我在' + game.name + ',房号 : {0} , {1}局 , {2}人 赶快来加入';
        // title = title.format(gpManager.rule.roomcode,gpManager.rule.totalGame,gpManager.rule.playerNum,gpManager.rule.cardSendNum);
        //
        // var descript = "";
        // cc.log(title,descript);

        // var game = LoadGame.getCurrentGame();

        let zongren = 2;
        let ren = GamePlayer.getNum();
        let queren = zongren - ren;
        const zhuanhuan = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

        var game = LoadGame.getCurrentGame();
        var desc = game.name + "\n"   // 名称
        desc += "房号: " + gpManager.rule.roomcode + "\n"  // 房号
        desc += "玩法: 全关翻倍\n"  // 玩法
        desc += "人数: " + zongren + "人  " + zhuanhuan[ren] + "缺" + zhuanhuan[queren] + "\n"  // 人数
        desc += "支付: " + ((this.expend & 0x01) == 0x01 ? "AA支付" : "房主支付") + "\n"  // 支付

        wxapi.sendWxFriend(desc)

    },
    showHandCard: function (data, isPlayAni) {
        if (this.handCardprefab == null) {
            this.handCardprefab = cc.instantiate(gpManager.HandCardPrefab);
            this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
        }
        let handCard = this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("gphandCard");
        this.handCardprefab.getChildByName("gameBtn").active = false;
        handCardController.onShow(data, isPlayAni);
    },
    // 设置玩家游戏状态为开始
    setGameStartStatus: function (index) {
        let player = this.players[index];
        let readySprite = player.getChildByName("ready");
        let NUMSprite = player.getChildByName("NUM");
        NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 16;
        readySprite.active = false;
        NUMSprite.active = false
        this.isGameStart = true;
        if (player.getChildByName('HandLayout')) {
            player.getChildByName('HandLayout').active = false
        }
    },


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
            self.result = cc.instantiate(prefab);
            self.result.parent = self.node.parent;
            self.result.setLocalZOrder(99000);
            self.resultCallback(data);
        });

        //cc.log(self.roomuserid,data.users);
        // cc.loader.loadRes('style/gameOverRank/prefab/ranking/ranking',cc.Prefab,function (err,prefab) {
        //     if(err){
        //         cc.log(err);
        //         return;
        //     }

        //     var node = cc.instantiate(prefab);
        //     node.parent = self.node.parent;
        //     node.parent.setLocalZOrder(100);
        //     var controller = node.getComponent('CardRankingController');
        //     controller.show(self.roomuserid,data.users,gpManager.rule,self.roomcode);
        // });
    },


    resultCallback: function (data, type) {
        var controller = this.result.getComponent('gameOverRankScript');
        controller.show(data.users, data.count);
        // var skResult = this.result.getChildByName("skResult").getComponent("skResult");
        // skResult.onShow(this.roomuserid,data,type)
    },


    RCMD_SitIn: function (event) {
        // cc.log("RCMD_SitIn");
        let self = this;
        let data = event.detail;
        cc.log("RCMD_SitIn");
        cc.log(data);

        for (var i = 0; i < data.users.length; i++) {
            let user = data.users[i];
            if (user.userid == UserCenter.getUserID()) {
                this.seatId = user.seatid;
                if (self.roomType == 1) {
                    self.message.active = true
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

                break;
            }

        }
        for (var i = 0; i < data.users.length; i++) {
            let user = data.users[i];
            let player = GamePlayer.addPlayer(user);
            if (!player) continue;
            if (!isUrl(player.userImage)) {
                player.userImage = 'commonRes/other/{0}'.format(player.sex == 1 ? 'man' : 'woman')
            }
            this.playersImage[user.userid] = player.userImage;
            this.playersNick[user.userid] = player.nick;
            let chair = this.getChairBySeatId(user.seatid);

            this.setChairInfo(player, chair, true);
            this.cancelAutoPlay();
        }
        this.node.emit('msgQueneStart')
        if (GamePlayer.getNum() == 2 && this.Invite.active) {
            this.Invite.active = false;
        }
    },

    RCMD_Start: function () {
        cc.log('RCMD_Start');
        if (this.mathOverFlag == null) {
            //判断人齐了吗
            this.Invite.active = false;
            // this.Invite.getChildByName("inviteBtn").interactable = false ;
            this.btnReady.active = true;

        }
        if (this.roomType < 2) {
            this.clock.active = true;
            this.clock.getChildByName("time").getComponent(cc.Label).string = 15;
            this.schedule(this.daoJiShi, 1)
        }
        /*this.currGame == 0*/
        gpManager.rule.setMsgBlocked(false);
    },

    RCMD_Ready: function (event) {
        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        if (chair == 0) {
            this.showNormalBtn(false);
        }
        this.setReady(chair, true);

        gpManager.rule.setMsgBlocked(false);
    },

    RCMD_Result: function (event) {
        let data = event.detail;
        ///////-----cc.log(data);
    },


    _updatePlayers: function (data) {
        var users = data;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            var player = GamePlayer.getPlayer(user.userid);
            var chair = this.getChairByUserid(user.userid);
            if (this.roomType == 2) {
                // player.score += user.curwon;
                // var scorebox = this.players[chair].getChildByName('scorebox');
                // scorebox.children[0].getComponent(cc.Label).string = player.score;

                // 更新赢了多少次
                var winCount = this.players[chair].getChildByName('countText').getComponent(cc.Label);
                winCount.string = (gpManager.isBeans == 0) ? user.totalwon : user.money;

                if (UserCenter.getUserID() == player.userid && gpManager.isBeans == 1) {
                    UserCenter.setYouxibiNum(user.money);
                    GlobEvent.emit('update_UserCenter');
                }

            } else {
                player.money = user.money;
                if (UserCenter.getUserID() == player.userid) {
                    UserCenter.setYouxibiNum(player.money);
                    GlobEvent.emit('update_UserCenter');
                }
                var scorebox = this.players[chair].getChildByName('countText');
                scorebox.getComponent(cc.Label).string = player.money;
            }
        }
    },

    showNormalBtn: function (isVisible) {
        this.btnReady.active = isVisible;
        // this.btnReady.getChildByName("readyBtn").interactable = isVisible ;
    },
    showRoomBtn: function (isVisible) {
        this.InviteButton.active = isVisible;
    },

    exchangeChair: function (user1, user2, seatid0, seatid1) {

        var self = this;
        cc.log('cccccccccccccccccc--exchangeChair');
        for (var i = 1; i < 4; i++) {
            this.players[i].active = false;
        }

        var player = this.players[0];
        var Node = player.getParent();
        if (user1 == UserCenter.getUserID() || user2 == UserCenter.getUserID()) {

            var chair;
            if (user1 == UserCenter.getUserID()) {
                chair = this.getChairByUserid(user2);
            } else {
                chair = this.getChairByUserid(user1);
            }
            if (chair == 1) {
                var position1 = this.players[1].getPosition();
                var position2 = this.players[2].getPosition();
                var position3 = this.players[3].getPosition();
                var node1 = cc.instantiate(this.players[1]);
                cc.log('-----------------node1', node1);
                cc.log('-----------------this.players', this.players);
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


                var Action1 = cc.sequence(cc.moveTo(0.6, position3).easing(cc.easeCubicActionInOut()), cc.delayTime(0.3), cc.moveBy(0.4, cc.p(-150, 0)), cc.callFunc(function () {
                    node2.removeFromParent();
                }));
                var Action2 = cc.sequence(cc.moveTo(0.6, position2).easing(cc.easeCubicActionInOut()), cc.delayTime(0.7), cc.callFunc(function () {
                    node3.removeFromParent();
                }));
                var Action3 = cc.sequence(cc.delayTime(0.9), cc.moveBy(0.4, cc.p(150, 0)), cc.callFunc(function () {
                    node1.removeFromParent();
                    self.showPlayer(user1, user2, seatid0, seatid1, true);
                }));

                this.players[3].setPosition(cc.p(position3.x - 150, position3.y));
                this.players[1].setPosition(cc.p(position1.x + 150, position1.y));


                node2.runAction(Action1);
                node3.runAction(Action2);
                node1.runAction(Action3);

            }
            else if (chair == 3) {
                var position1 = this.players[1].getPosition();
                var position2 = this.players[2].getPosition();
                var position3 = this.players[3].getPosition();
                var node1 = cc.instantiate(this.players[1]);
                cc.log('-----------------node1', node1);
                cc.log('-----------------this.players', this.players);
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


                var Action1 = cc.sequence(cc.spawn(cc.moveTo(0.6, position1).easing(cc.easeCubicActionInOut()), cc.rotateBy(0.6, 360)), cc.delayTime(0.3), cc.moveBy(0.4, cc.p(150, 0)), cc.callFunc(function () {
                    node2.removeFromParent();
                }));
                var Action2 = cc.sequence(cc.spawn(cc.moveTo(0.6, position2).easing(cc.easeCubicActionInOut()), cc.rotateBy(0.6, 360)), cc.delayTime(0.7), cc.callFunc(function () {
                    node1.removeFromParent();
                }));
                var Action3 = cc.sequence(cc.delayTime(0.9), cc.moveBy(0.2, cc.p(-150, 0)).easing(cc.easeCubicActionInOut()), cc.callFunc(function () {
                    node3.removeFromParent();
                    self.showPlayer(user1, user2, seatid0, seatid1, true);
                }));

                this.players[1].setPosition(cc.p(position1.x + 150, position1.y));
                this.players[3].setPosition(cc.p(position3.x - 150, position3.y));

                node1.runAction(Action2);
                node2.runAction(Action1);
                node3.runAction(Action3);
            }

        }
        else {
            var chair1 = this.getChairByUserid(user1);
            var chair2 = this.getChairByUserid(user2);
            for (var i = 1; i < 4; i++) {
                if (i != chair1 && i != chair2) {
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
            cc.log('-----------------this.players', this.players);
            node1.parent = Node;
            node1.active = true;
            node1.setPosition(position1);

            var node2 = cc.instantiate(this.players[chair2]);
            node2.parent = Node;
            node2.active = true;
            node2.setPosition(position2);
            var Action1;
            var Action2;
            if (chair1 == 1 || chair2 == 1) {
                Action1 = cc.sequence(cc.spawn(cc.moveTo(1.3, position2).easing(cc.easeCubicActionInOut()), cc.rotateBy(1.3, 360)), cc.callFunc(function () {
                    node1.removeFromParent();
                    node3.removeFromParent();
                }));
                Action2 = cc.sequence(cc.spawn(cc.moveTo(1.3, position1).easing(cc.easeCubicActionInOut()), cc.rotateBy(1.3, 360)), cc.callFunc(function () {
                    node2.removeFromParent();
                    self.showPlayer(user1, user2, seatid0, seatid1, false);
                }));
            }
            else {
                Action1 = cc.sequence(cc.moveTo(1.3, position2).easing(cc.easeCubicActionInOut()), cc.callFunc(function () {
                    node1.removeFromParent();
                    node3.removeFromParent();
                }));
                Action2 = cc.sequence(cc.moveTo(1.3, position1).easing(cc.easeCubicActionInOut()), cc.callFunc(function () {
                    node2.removeFromParent();
                    self.showPlayer(user1, user2, seatid0, seatid1, false);
                }));
            }

            node1.runAction(Action1);
            node2.runAction(Action2);
        }
    },

    showPlayer: function (user1, user2, seatid0, seatid1, ismove) {
        var self = this;

        if (user1 == UserCenter.getUserID() || user2 == UserCenter.getUserID()) {
            if (user1 == UserCenter.getUserID()) {
                this.seatId = seatid0;
            }
            if (user2 == UserCenter.getUserID()) {
                this.seatId = seatid1;
            }

        }
        var player1 = GamePlayer.getPlayer(user1);
        player1.seatid = seatid0;
        var player2 = GamePlayer.getPlayer(user2);
        player2.seatid = seatid1;

        for (var usrid in GamePlayer.players) {
            var player = GamePlayer.getPlayer(usrid);
            let chair = this.getChairByUserid(usrid);
            this.setChairInfo(player, chair, false);
            if ((chair == 1 && ismove) || (chair == 3 && ismove)) {
                if (chair == 1) {
                    this.players[1].runAction(cc.moveBy(0.3, cc.p(-150, 0)).easing(cc.easeCubicActionInOut()));
                }
                else {
                    this.players[3].runAction(cc.moveBy(0.3, cc.p(150, 0)).easing(cc.easeCubicActionInOut()));
                }
            }
        }
        this.players[0].runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
            gpManager.rule.setMsgBlocked(false);
            self.showCardNUM();
        })));
    },

    showCardNUM: function () {
        for (var i = 1; i < 2; i++) {
            var NumSprite = this.players[i].getChildByName('NUM');
            NumSprite.active = true;
        }
        for (let index = 0; index < 2; index++) {
            this.setGameStartStatus(index);
        }
    },

    setChairInfo: function (user, chair, isPlayFog) {
        // if (chair > 1) {
        //     return;
        // }
        let player = this.players[chair];
        // let beans = user.score;//this.roomType == 2 ? user.score : user.money;
        let beans = (this.roomType == 2 && gpManager.isBeans == 0) ? user.score : user.money;
        let status = user.status;
        let userImage = user.userImage;
        this.sex = user.sex;
        player.active = true;
        player.getChildByName('nameText').getComponent(cc.Label).string = user.nick;
        player.getChildByName('countText').getComponent(cc.Label).string = beans;
        // var scorebox =player.getChildByName('scorebox');
        // scorebox.children[0].getComponent(cc.Label).string = formatNum(beans);///

        getSpriteFrameByUrl(userImage, function (err, spriteFrame) {
            if (err) return;
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

        // if(isPlayFog){
        //     cc.loader.loadRes("shuangkou/sk/effect/ChairFog/FogNode", cc.Prefab, function (err, prefab) {
        //         if (err) {
        //             return;
        //         }
        //         var module = cc.instantiate(prefab);
        //         module.parent = player;
        //     });
        // }

        cc.log("online  ", status);

        this.setReady(chair, status == GamePlayer.PlayerState.Ready);
        this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
    },

    setReady: function (dir, bReady) {
        this.players[dir].getChildByName("ready").active = bReady;


    },

    setOfflineStatus: function (dir, Offline) {
        this.players[dir].children[0].children[0].active = Offline;
    },


    RCMD_Dao: function (data) {
        if (data.flag == 0) {
            if (data.suserid == UserCenter.getUserID()) {
                UserCenter.updateYouxibiNum(-data.consume);
            }
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
        propAnim.active = true;
        propAnimController.playAnim(sourcePlayer.getPosition(), targetPlayer.getPosition(), data.daobh);
    },
    hideDao: function (event) {
        let chair = parseInt(event.detail);
        if (this.daoArray && this.daoArray[chair]) {
            this.daoArray[chair].active = false;
        }
    },

    RCMD_TaskSeat: function (event) {
        cc.log('RCMD_TaskSeat');
        cc.log(event.detail);
        let data = event.detail;
        this.seatId = data.seatid;
        this.tableId = data.tableid;
    },

    RCMD_GameStart: function (event) {
        this.isGameStart = true;

        let data = event.detail;


        for (let i = 0; i < MAX_PLAYERS; i++) {
            this.setReady(i, false);
        }
    },

    setRank: function (id) {
        this.id = id;
        let chair = this.getChairByUserid(id);
        if (chair < 0) return;
        this.players[chair].children[4].active = true;
    },

    RCMD_exit: function (event) {

        let data = event.detail;
        let userid = data.userid;
        let chair = this.getChairByUserid(userid);
        cc.log('RCMD_exit : ', userid, chair);

        if (this.roomType == 2) {
            if (this.btnReady.active) {
                this.btnReady.active = false;

                this.Invite.active =  wxapi.isInstallWeChat();
            }
        }

        this.players[chair].getChildByName("ready").active = false;

        this.players[chair].active = false;
        GamePlayer.removePlayer(data.userid);
        gpManager.rule.setMsgBlocked(false);
    },


    clearPlaystatus: function (chair) {
        this.players[chair].children[3].active = false;
        this.players[chair].children[4].active = false;
    },

    hidMenu: function () {
        // if(this.roommenu.active){
        //     this.onClickMenu();
        // }
    },

    onClickMenu: function () {
        //this.exchangeChair(10014235,10014108,2,3);
        this.refreshMenuActive();
    },

    onClickExit: function () {
        this.node.emit('onExit');
    },


    getSeatIdByChair: function (chair) {
        chair = chair || 0;
        if (gpManager.rule.playerNum == 4) {
            return (this.seatId + chair + 3) % MAX_PLAYERS + 1;
        }
        else {
            if (chair == 0) {
                return this.seatId;
            }
            else {
                if (this.seatId == 1) {
                    return 2;
                }
                else {
                    return 1;
                }
            }
        }
        // (this.seatId+chair+3)%MAX_PLAYERS+1;

    },
    getChairByUserid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        return this.getChairBySeatId(seatid);
    },
    getChairBySeatId: function (seatId) {
        //return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
        if (gpManager.rule.playerNum == 4) {
            return (seatId - this.seatId + MAX_PLAYERS) % MAX_PLAYERS;
        }
        else {
            if (seatId == this.seatId) {
                return 0;
            } else {
                return 1
            }
        }

    },
    displayVoice: function (event) {
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        ///////-----cc.log('displayVoice',userid,chair);
        if (!this.voiceTips) {
            this.voiceTips = cc.instantiate(this.voiceTipsPrefab);
        }

        this.voiceTips.parent = this.players[chair];
        this.voiceTips.x = (chair == 0 || chair == 3) ? 20 : -20;
        this.voiceTips.active = true;
    },

    hideVoice: function () {
        if (!!this.voiceTips) {
            this.voiceTips.active = false;
        }
    },


    showChatMsg: function (event) {
        cc.log(event)
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        let chatId = event.detail.chatId;
        let pos;
        if (chatId < 100) {

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
                    pos = cc.v2(0, 0);
                }
                chatMsgBubble.setPosition(pos);
                this.chatMsgBubbleArray[chair] = chatMsgBubble;
            }
            chatMsgBubble.active = true;
            let con = chatMsgBubble.getComponent("chatMsgBubble");
            con.onShow(chair, this.players[chair].sex, chatId);

        } else {
            ///////-----cc.log("" + chatId);
            if (!this.lookAnimArray) {
                this.lookAnimArray = [];
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

    refreshMenuActive: function () {
        // this.roommenu.active = !this.roommenu.active;
        // this.chatNode.active = !this.chatNode.active;
        // this.colseNode.active = this.roommenu.active;
    },

    onSettingClick: function () {
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

        self.refreshMenuActive();

        // let self = this;
        // cc.loader.loadRes('game/shisanshui/sssScene1/prefab/setting/ssssetting',cc.Prefab,function(error,prefab){

        //     if (error) {
        //         cc.error(error.message || error);
        //         return;
        //     }
        //     ///////-----cc.log('加载成功');
        //     var module = cc.instantiate(prefab);

        //     module.x = cc.winSize.width / 2;
        //     module.y = cc.winSize.height / 2;
        //     module.parent = cc.director.getScene();
        //     self.refreshMenuActive();
        // });
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
        let handCard = this.handCardprefab.getChildByName("control");
        let handCardController = handCard.getComponent("gphandCard");
        handCardController.autoPlay();
    },

    onClickReady: function () {
        this.showNormalBtn(false);
        this.unschedule(this.daoJiShi);
        this.clock.active = false;
        this.node.emit('CMD_Ready');
    },

    refreshAutoPlay: function () {
        this.refreshMenuActive();
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY', true);
    },
    AUTO_PLAY: function (data) {
        if (!data) {
            this.cancelAutoPlay()
        }
    },
    cancelAutoPlay: function () {
        this.autoState = false;
        cc.log(!!this.handCardprefab)
        if (!!this.handCardprefab) {
            let handCard = this.handCardprefab.getChildByName("control");
            let handCardController = handCard.getComponent("gphandCard");
            handCardController.cancelAutoPlay();
        }

        if (!!this.autoPlay) {
            this.autoPlay.active = false;
            // GlobEvent.emit('AUTO_PLAY', false);
        }
    },

    openAutoPlay: function () {
        this.autoState = true;
        if (this.autoPlay && this.autoPlay.active) {

            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY', true);
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
    refreshInstructions: function () {
        this.refreshMenuActive();
        this.rule.active = true;
    },
    refreshMenuActive: function () {
        // if (this.roomType < 20){
        //     this.roommenu.active = !this.roommenu.active;
        //     this.chatNode.active = !this.roommenu.active;
        //     if(this.menuIcon1 && this.menuIcon2){
        //         this.menuIcon1.active = !this.roommenu.active;
        //         this.menuIcon2.active = this.roommenu.active;
        //     }
        // }else {
        //     this.roommenu.active = !this.roommenu.active;
        //     if(this.menuIcon1 && this.menuIcon2){
        //         this.menuIcon1.active = !this.roommenu.active;
        //         this.menuIcon2.active = this.roommenu.active;
        //     }
        // }

    },

    onClickMessage: function () {

    },

    onClickVoice: function () {
        ///////-----cc.log('onClickVoice')
    },

    onDestroy: function () {
        pomelo.removeAllListeners("RCMD_Dao");
    },

});
