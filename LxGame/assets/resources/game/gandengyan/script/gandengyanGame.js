const yuhuanCardResource = require('gandengyanCardResource');
var GamePlayer = require('GamePlayer');
const CfgGame = require("CfgGame");
var Porp = require("Prop");
var config = require('Config');
var gandengyancfg = require('gandengyanConfig')
var PING  = require("Ping")
var LoadGame = require('LoadGame');
var Friend = require('Friend')

const GDYCMD =  require("GDYCMD")

const MAX_PLAYERS = 5;
cc.Class({
  extends: cc.Component,

  properties: {
    players:{
      default:[],
      type:cc.Node
    },
    btnReady:cc.Node,
    btntiqian:cc.Node,
    // roommenu : cc.Node,
    roomInfo : cc.Node,
    voiceTipsPrefab : cc.Prefab,
      chatMsgBubblePrefab:cc.Prefab,
      lookAnimPrefab :cc.Prefab,
      playerInfoDialogPrefab:cc.Prefab,
      propAnimPrefab:cc.Prefab,
    //   inviteBtn:cc.Node,
    //   chatNode:cc.Node,
      time:cc.Label,
      titleSprite    : cc.Sprite,          // 游戏标题
      menuIcon1 : cc.Node,
      menuIcon2 : cc.Node,
      RemainNum:cc.Node,
      Title:cc.Node,
      ScoreInfo:cc.Node,
      GameResult:cc.Prefab,
      GameResultGDY:cc.Prefab,
      RemainNum:cc.Node,
      difeng:cc.Node,
      danjunum:cc.Node,
      zhifu:cc.Node,
      moshi:cc.Node,
      renshu:cc.Node,
      jushu:cc.Node,
      nobig:cc.Node,
      batteryTexture:cc.Node,
      battery:cc.Node,
      wifi1:cc.Node,
      wifi2:cc.Node,
      wifi3:cc.Node,
      gameMenu:cc.Node,
  },

  // use this for initialization
  onLoad: function () {
    GamePlayer.removeAllPlayers();

    let self = this;
    let path = 'hall/friendInfo/friendInfo'
    cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
        if (err) {
            cc.log(err);
            return;
        }
        self.playerMessage = prefab;
    });
    

    this.node.on('RCMD_initParam',this.RCMD_initParam.bind(this));
    this.node.on('RCMD_TaskSeat',this.RCMD_TaskSeat.bind(this));
    this.node.on('RCMD_SitIn',this.RCMD_SitIn,this);
    this.node.on('RCMD_PlayerStatus',this.RCMD_PlayerStatus,this);
    this.node.on('RCMD_exit',this.RCMD_exit,this);
    this.node.on('RCMD_Ready',this.RCMD_Ready,this);
    this.node.on('RCMD_GameStart',this.RCMD_GameStart,this);
    this.node.on('RCMD_Start',this.RCMD_Start,this);
    this.node.on('RCMD_ActData',this.RCMD_ActData,this);
    this.node.on('RCMD_Result',this.RCMD_Result,this);
    this.node.on('RCMD_MatchOver',this.RCMD_MatchOver,this);
    this.node.on('RCMD_RequestStart',this.RCMD_RequestStart,this);
    pomelo.on('RCMD_Expend',this.RCMD_Expend.bind(this));
    // 语音聊天
    this.node.on('DISPLAY_VOICE',this.displayVoice,this);
    this.node.on('HIDE_VOICE',this.hideVoice,this);
    //聊天
    this.node.on('SHOW_CHAT_MSG',this.showChatMsg,this);
    this.node.on('HIDE_CHAT_MSG',this.hideChatMsg,this);
    //道具
    this.node.on('SHOW_DAO',this.showDao,this);
    this.node.on('HIDE_DAO',this.hideDao,this);

    //监听是否需要开始托管模式（三次超时后就开启）
      this.node.on("OPEN_AUTO_PLAY",this.openAutoPlay,this);

      //道具使用监听
      pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));

      for(let i = 0; i < MAX_PLAYERS; i++){
        this.players[i].on(cc.Node.EventType.TOUCH_START,this.onPlayer,this);
      }
      this.timeed();
      this.schedule(function() {
          // 这里的 this 指向 component
          this.timeed();
      }, 60);


      

      //默认关闭，防止UI文件被冲掉
    //   this.chatNode.active = false;
      this.showdianyuan()
      this.showWifi();
      this.GameAllPlayers = 0;
      
  },
  showWifi:function()
  {
    let self = this;
    self.wifi1.active =true;
            self.wifi2.active =false;
            self.wifi3.active =false;
        PING.BindEvent(function (event) {
            self.wifi1.active =false;
            self.wifi2.active =false;
            self.wifi3.active =false;
            if (event.type == 1) {  // 良好
                self.wifi1.active = true
                // getSpriteFrameByUrl('resources/youxi/gandengyan/texture2/wifi-3', function (err, spriteFrame) {
                //     if (err) return;
                //     self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                // });
            } else if (event.type == 2) {  // 一般
                self.wifi2.active = true
                // getSpriteFrameByUrl('resources/youxi/gandengyan/texture2/wifi-2', function (err, spriteFrame) {
                //     if (err) return;
                //     self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                // });
            } else if (event.type == 3) {  // 差
                self.wifi3.active =true;
                // getSpriteFrameByUrl('resources/youxi/gandengyan/texture2/wifi-1', function (err, spriteFrame) {
                //     if (err) return;
                //     self.wifi.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                // });
            }
        });

        PING.StartPing(60);
  },
  showdianyuan:function()
  {
    let self= this
      var battery = wxapi.getCurrentBattery();
      battery = 70
        if (battery < 0) {
            self.batteryTexture.active = false;
        }else{
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

        this.time.string = x+':'+y ;
    },

// 游戏初始化， 显示界面
RCMD_initParam : function (event) {
    hideLoadingAni();

    let data = event.detail;
    this.initdata = data
    this.roomType = data.roomType;
    this.gameid = data.gameid;
    this.ruleFlag = data.ruleFlag;             // 游戏规则
    this.roomuserid = data.roomuserid;//data.roomuserid;         // 房主 普通房间为0
    this._currGame = data.currGame;/****xxxx***aaaa****bbbb*****cccc****dddd****/
    this._totalGame = data.totalGame;
    this._roomcode = data.roomcode;
    this._ruleFlag = data.ruleFlag
    this.seatId = data.myseatid;
    this.roomInfo.active = true;
    // var wanfa =  Math.floor( (this.ruleFlag %100)/10 );
    // let wahuaitem = yuhuanCardResource.getwahuaItem();
    // this.Title.getComponent(cc.Sprite).spriteFrame = wahuaitem.getSpriteFrame("title_"+wanfa)
    // this.Title.active = true;

    if(this.roomType < 2){ // 普通房间
        this.roomInfo.children[0].active = false;
        this.roomInfo.children[1].active = true;
        this.roomInfo.children[2].getComponent(cc.Label).string = data.basescore;



        //新增加代码 将原来界面隐藏
        this.roomInfo.children[0].active = false;
        this.roomInfo.children[1].active = false;
        this.roomInfo.children[2].active = false;
        this.ScoreInfo.getComponent(cc.Label).string = '基础分:{0}'.format(data.basescore);

        this.jushu.active = false;
        this.difeng.active = false;
        this.difeng.parent.getChildByName('gdydifen').active = false;
        this.gameMenu.getChildByName('menu').getChildByName('list').getChildByName('jiesan').active = false;

        this.isTime = true;
    }else if(this.roomType == 2){ // 房卡房间
        this.roomInfo.children[0].active = true;
        this.roomInfo.children[1].active = false;
        this.roomInfo.children[2].getComponent(cc.Label).string = data.roomcode;

        //新增加代码 将原来界面隐藏
        this.roomInfo.children[0].active = false;
        this.roomInfo.children[1].active = false;
        this.roomInfo.children[2].active = false;
        this.ScoreInfo.getComponent(cc.Label).string = '房号:{0}'.format(data.roomcode);

        if(this._currGame == 0){
            this.btntiqian.active = UserCenter.getUserID() == this.roomuserid;
        }
        this.gameMenu.getChildByName('menu').getChildByName('list').getChildByName('likai').active = false;
        console.log('加载房卡组件')
        var roomcontroller = this.addComponent("CardRoomControllergdy");
        roomcontroller.init(data,this);

        let game = config.getGameById(this.gameid);
        let timeData = game.createRoom.time[0].data;
        this.isTime = ((this._ruleFlag & timeData) == timeData);

    }

    if(this.roomType != 2)
    {
        //只有房卡模式有解散模式!
        //this.roommenu.getChildByName("content").getChildByName("dissolve").active = false;
        // this.roommenu.getChildByName("content").getChildByName("dissolve").removeFromParent()
        // this.chatNode.getChildByName("voice").active = false;
    }
    else
    {
        // this.roommenu.getChildByName("content").getChildByName("exitroom").removeFromParent()
    }

    // this.chatNode.active = this.roomType < 20;   // 复盘不显示
    this._showTitleSprite();


    // var zhi = gandengyancfg.getzhi(data.ruleFlag)
    // var defeng = gandengyancfg.getdifeng(data.ruleFlag)
    // if( zhi == 0x01 )
    // {
    //     this.zhifu.getComponent(cc.Label).string = "AA支付"
    // }
    // else
    // {
    //     this.zhifu.getComponent(cc.Label).string = "房主支付"
    // }
    // var moshi = gandengyancfg.getwan(data.ruleFlag)
    // if( moshi == 0x01 )
    // {
    //     this.moshi.getComponent(cc.Label).string = "经典模式"
    // }
    // else
    // {
    //     this.moshi.getComponent(cc.Label).string = "疯狂模式"
    // }

    // var renshu = gandengyancfg.getrenshu(data.ruleFlag)
    // this.renshu.getComponent(cc.Label).string = "{0}人".format(renshu)

    // this.difeng.getComponent(cc.Label).string = defeng.toString()
    this.RemainNum.getComponent(cc.Label).string =""

    this.m_totalrenshu = gandengyancfg.getrenshu(this.ruleFlag)

    // if (wxapi.isInstallWeChat())
    // {
    //     this.inviteBtn.active = (this.roomType == 2);
    // }
    //this.inviteBtn.active = (data.currGame == 0);
},

refreshRoomInfo:function(ruleFlag,expend)
{
    this.expend = expend;
    var zhi = gandengyancfg.getzhi( ruleFlag,expend)
    var defeng = gandengyancfg.getdifeng( ruleFlag,expend)
    if( zhi == 0x00 )
    {
        this.zhifu.getComponent(cc.Label).string = "房主支付"
    }
    else
    {
        this.zhifu.getComponent(cc.Label).string = "AA支付"
    }
    var moshi = gandengyancfg.getwan(ruleFlag,expend)
    if( moshi == 0x10 )
    {
        this.moshi.getComponent(cc.Label).string = "经典模式"
    }
    else
    {
        this.moshi.getComponent(cc.Label).string = "疯狂模式"
    }

    var renshu = gandengyancfg.getrenshu(ruleFlag,expend)
    this.GameAllPlayers = renshu
    this.renshu.getComponent(cc.Label).string = "{0}人".format(renshu)

    this.difeng.getComponent(cc.Label).string = defeng.toString()
    this.RemainNum.getComponent(cc.Label).string =""

    this.m_totalrenshu = gandengyancfg.getrenshu(ruleFlag,expend)
},
    setdanjuNum:function(Num)
    {
        this.danjunum.getComponent(cc.Label).string = Num.toString()
    },
    setJuShu:function(str)
    {
        this.jushu.getComponent(cc.Label).string = str;
    },

    RCMD_Dao:function(data){
        //显示道具
        if(data.flag  == 0)
        {
            cc.log("使用道具成功");
            if(data.suserid ==UserCenter.getUserID())
            {
                //如果是玩家自己使用，更新游戏币
                UserCenter.updateYouxibiNum(-data.consume);
            }
            // this.controller.emit("SHOW_DAO",data);
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
            //更新游戏豆
            if(data.suserid == UserCenter.getUserID())
            {
                sourcePlayer.getChildByName("beans").getComponent(cc.Label).string = formatNum(UserCenter.userInfo.youxibiNum);
            }else {
                Porp.getProplist(function(data1,data2) {
                    let ret = data2.results;
                    if (ret) {
                        for (let i = 0; i < ret.length; i++) {
                            let obj = ret[i];
                            if(obj.bh == data.daobh)
                            {
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


  displayVoice : function (event) {
    let userid = event.detail.userid;
    let chair = this.getChairByUserid(userid);
    cc.log('displayVoice',userid,chair);
    if(!this.voiceTips){
      this.voiceTips = cc.instantiate(this.voiceTipsPrefab);
    }

    this.voiceTips.parent = this.players[chair];
    this.voiceTips.x = (chair == 0 || chair == 3) ? 20 : -20;
    this.voiceTips.active = true;
  },

  hideVoice : function () {
    cc.log('hideVoice');
    if(!!this.voiceTips){
      this.voiceTips.active = false;
    }
  },

    showChatMsg:function(event) {
        let userid = event.detail.userid;
        let chair = this.getChairByUserid(userid);
        let chatId = event.detail.chatId;
        let pos;
        if (chatId < 100) {
            //常用语
            if(!this.chatMsgBubbleArray)
            {
                this.chatMsgBubbleArray  = [];
            }


            let chatMsgBubble = this.chatMsgBubbleArray[chair];
            if (!chatMsgBubble) {
                chatMsgBubble = cc.instantiate(this.chatMsgBubblePrefab);
                chatMsgBubble.parent = this.players[chair];
                if (chair == 0 || chair == 3 || chair == 4) {
                    pos = cc.v2(-8, 60);
                }
                 else if (chair == 1) {
                    pos = cc.v2(-82, 57);
                } else {
                    pos = cc.v2(-82, 57);
                }
                chatMsgBubble.setPosition(pos);
                this.chatMsgBubbleArray[chair] = chatMsgBubble;
            }
            chatMsgBubble.active = true;
            let con = chatMsgBubble.getComponent("chatMsgBubble");
            con.onShow(chair,this.players[chair].sex, chatId);

        } else
        {
            cc.log("表情信息" + chatId);
            if(!this.lookAnimArray)
            {
                this.lookAnimArray  = [];
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

    RCMD_Result : function (event) {
        let data = event.detail;
        cc.log(data);
        this.cancelAutoPlay();
        // //结束游戏,取消托管
        // if(this.autoPlay && this.autoPlay.active)
        // {
        //     this.autoPlay.active = false;
        //     GlobEvent.emit('AUTO_PLAY',false);
        // }

        this._updatePlayers(data);
    },

    /**
     * 房卡房间结算
     */
    RCMD_MatchOver : function (event) {
        var data = event.detail;
        var self = this;
        cc.loader.loadRes('style/gameOverRank/gameOverRank',cc.Prefab,function (err,prefab) {
            if(err){
                cc.log(err);
                return;
            }

            var node = cc.instantiate(prefab);
            //node.x = cc.winSize.width / 2;
            //node.y = cc.winSize.height / 2;
            node.parent = self.node.parent;
            var controller = null
            // if(self.gameid== 154){
            //     //controller = node.getComponent('DeqingCardRankingController');
            // }else{
            //     //controller = node.getComponent('CardRankingController');
            // }
            controller = node.getComponent('gameOverRankScript');
            // for(let i=0; i < 5; i++)
            // {
            //     controller.setVisible(i,false);
            // }
            // controller.setroomid(self._roomcode)
            controller.show(data.users,data.count);
        });
    },
  // 玩家入座
  RCMD_SitIn : function (event) {
    let data = event.detail;
      for(var i = 0; i < data.users.length; i++){
          let user = data.users[i];
          let player = GamePlayer.addPlayer(user);
          if(!player) continue;
          let chair = this.getChairBySeatId(user.seatid);
          this.setChairInfo(player,chair);
    }
  },
  RCMD_RequestStart : function (event){
    cc.log('提前开始消息处理');
    cc.log(event.detail);
    let data = event.detail;
    this._ruleFlag = data.ruleflag;
    this.expend = data.expend;
    this.refreshRoomInfo(this._ruleFlag,this.expend);
    this.clearPlayers();
    let users = Object.keys(GamePlayer.players)
    
    for(let i = 0; i < users.length; i++){
        let player = GamePlayer.getPlayer(users[i]);
        let chair = this.getChairByUserid(users[i]);
        console.log(chair)
        this.setChairInfo(player,chair);
    }
  },

  RCMD_Start : function () {
    cc.log('RCMD_Start','显示准备消息'); 
    this.cancelAutoPlay();
    this.btnReady.active = true;
    this.btntiqian.active = false;
  },

  // 玩家状态改变
  RCMD_PlayerStatus : function (event) {
    let data = event.detail;
    let userid = data.userid;
    let status = data.status;
    let chair = this.getChairByUserid(userid);
    this.setOfflineStatus(chair,status);
  },

  RCMD_TaskSeat : function (event) {
    let data = event.detail;
    this.seatId = data.seatid;
  },

  RCMD_GameStart : function (event) {
    this.isGameStart  = true;
    let data = event.detail;
    for(let i = 0; i < MAX_PLAYERS;i++){
      this.setReady(i,false);
    }
    this.setMaster(data.userid);
  },

  // 数据恢复
  RCMD_ActData : function (event) {
    let data = event.detail;
    cc.log(data);
      this.isGameStart  = true;
    this.setMaster(data.masterid);
    for(let i = 0; i < MAX_PLAYERS;i++){
      this.setReady(i,false);
    }
  },

  // 玩家准备
  RCMD_Ready : function (event) {
    let data = event.detail;
    let userid = data.userid;
    let chair = this.getChairByUserid(userid);
    cc.log('game RCMD_Ready',userid,chair);
    if(chair == 0){
      this.showNormalBtn(false);
    }
    this.setReady(chair,true);
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
    onclickTest:function()
    {
        var EditBox = cc.find("Canvas/testEditBox")
        var str = EditBox.getComponent(cc.EditBox).string
        this.node.emit("onclicktest",str)
    },
    onClickinvite:function()
    {
        var game = LoadGame.getCurrentGame();
        let zongren = this.GameAllPlayers;
        let ren = GamePlayer.getNum();
        let queren = zongren - ren;
        const zhuanhuan = ['零','一','二','三','四','五','六','七','八','九'];
        // var title = (game.shareName || game.name) + ' 房号:{0} ({1}局)';
        // title = title.format(this._roomcode, this._totalGame);
        // var descript = ''
        /****xxxx***aaaa****bbbb*****cccc****dddd****/
        let queStr = zhuanhuan[ren] +'缺' + zhuanhuan[queren];
        // descript += !!game.getWanfa ? game.getWanfa(this._ruleFlag, this.expend) : WanFa.getWanfa(game, this._ruleFlag);
        // descript += ',赶快来加入！' + config.appShareName || config.appName
        /****xxxx***aaaa****bbbb*****cccc****dddd****/
        // cc.log(title, descript);
        // if (!!config.magicLink) {
        //     // var url = (config.magicLink + '?gameid={0}&roomcode={1}').format(LoadGame.getCurrentGameId(), this._roomcode);
        //     // wxapi.sendWebPageToWxReq(title, descript, url, 0);

        //     let param = ('mpara={2}&gameid={0}&roomcode={1}').format(LoadGame.getCurrentGameId(),this._roomcode,config.magicLink);
        //     wxapi.sendWebPageToWxReq(title,descript,param,0);
        // } else {
        //     wxapi.initWXFriend(title, LoadGame.getCurrentGameId(), this._roomcode, descript);
        // }

        let wanfaStr = !!game.getWanfa ? game.getWanfa(this._ruleFlag, this.expend) : WanFa.getWanfa(game, this._ruleFlag);
        cc.log(wanfaStr);
        let descript = (game.shareName || game.name)+'\n';
        descript += '  房号 : {0} ({1}局)\n'.format(this._roomcode,this._totalGame);
        descript += '  玩法 : {0}\n'.format(wanfaStr.wanfa);
        descript += '  结算 : {0}\n'.format(wanfaStr.fengding);
        descript += '  人数 : {0}人 '.format(wanfaStr.renshu);
        descript += queStr+'\n';
        descript += '  支付 : {0}'.format(wanfaStr.zhifu);

        this.shareText ='【'+descript+'】';
        let self = this;
        cc.loader.loadRes('style/style2/prefab2/gameShare/gameShare',cc.Prefab,function(error,prefab){
            if (error) {
                cc.error(error.message || error);
                return;
            }
            cc.log('加载成功')
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            var controller = module.getComponent("gameShareScript");
            controller.setText(self.shareText);
        });

    },
    /**
     * 玩法介绍
     */
    onClickInstructions:function()
    {
        let self = this;
        if(!this.rule)
        {
            cc.loader.loadRes('youxi/gandengyan/prefab/rule/rule',cc.Prefab,function(error,prefab){

                if (error) {
                    cc.error(error.message || error);
                    return;
                }
                cc.log('加载成功')
                self.rule = cc.instantiate(prefab);

                self.rule.x = cc.winSize.width / 2;
                self.rule.y = cc.winSize.height / 2;
                self.rule.parent = cc.director.getScene();
                let controller = self.rule.getChildByName("controller").getComponent("rulegdy");
                controller.setRuleFlag(self.ruleFlag);
                self.refreshInstructions();
            });
        }else
        {
            self.refreshInstructions();
        }
    },

    refreshInstructions:function()
    {
        this.refreshMenuActive();
        this.rule.active = true;
    },

    onClickAuto:function()
    {
        if(!this.isGameStart)
        {
            showAlert(CfgGame.alertData.GAME_NOT_START);
            return;
        }
        else if(this.autoPlay && this.autoPlay.active)
        {
            //已经处于托管状态了
            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }

        // cc.log("onClickAuto");
        // if(!this.autoPlay)
        // {
        //     let self = this;
        //     cc.loader.loadRes('style/{0}/mahScene/autoPlay/autoPlay'.format(config.resourcesPath),cc.Prefab,function(error,prefab){

        //         if (error) {
        //             cc.error(error.message || error);
        //             return;
        //         }
        //         cc.log('加载成功')
        //         self.autoPlay = cc.instantiate(prefab);

        //         self.autoPlay.x = cc.winSize.width / 2;
        //         self.autoPlay.y = 0;
        //         self.autoPlay.parent = cc.director.getScene();
        //         self.refreshAutoPlay();
        //     });
        // }else
        // {
        //     this.refreshAutoPlay();
        // }
        //GlobEvent.emit('Auto_Play_Ex',true);
        this.node.emit('Auto_Play_Ex');
        this.refreshMenuActive();
    },

    refreshAutoPlay:function()
    {
        this.refreshMenuActive();
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY',true);
    },

    cancelAutoPlay : function () {
        if(!!this.autoPlay){
            this.autoPlay.active = false;
            GlobEvent.emit('AUTO_PLAY',false);
        }
    },

    openAutoPlay:function()
    {
        if(this.autoPlay && this.autoPlay.active)
        {
            //已经处于托管状态了
            showAlert(CfgGame.alertData.AUTO_PLAY);
            return;
        }
        this.autoPlay.active = true;
        GlobEvent.emit('AUTO_PLAY',true);
    },
    openAutoPlayEx:function()
    {
        let self = this;
        if(!this.autoPlay)
        {
            cc.loader.loadRes('style/gameMenu/autoPlay/autoPlay',cc.Prefab,function(error,prefab)
            {
                if (error)
                {
                    cc.error(error.message || error);
                    return;
                }
                let newNode = new cc.Node("autoPlay")
                newNode.width = 1334;
                newNode.height = 750;
                newNode.anchorX =0
                newNode.anchorY = 0
                newNode.parent = cc.director.getScene();
                newNode.on(cc.Node.EventType.TOUCH_START, function(event){cc.log("点击了托管层")}, this);
                cc.log('加载成功')
                self.autoPlay = cc.instantiate(prefab);

                self.autoPlay.x = cc.winSize.width / 2;
                self.autoPlay.y = 0;
                self.autoPlay.opacity =255;
                self.autoPlay.parent = newNode;
                //self.refreshMenuActive();
                self.autoPlay.active = true;
            });
        }
        else
        {
            this.autoPlay.parent.active = true;
            this.autoPlay.active = true;
            //this.refreshMenuActive();
        }
    },
    cancelAutoPlayEx : function ()
    {
        if(!!this.autoPlay)
        {
            this.autoPlay.parent.off(cc.Node.EventType.TOUCH_START, function(event){cc.log("")}, this);
            this.autoPlay.parent.active = false;
            this.autoPlay.active = false;
        }
    },

  // 玩家离开
  RCMD_exit : function (event) {
     let data = event.detail;
      let userid = data.userid;
      let chair = this.getChairByUserid(userid);
      cc.log('RCMD_exit : ',userid,chair);
      this.players[chair].active = false;
      this.clearPlayStatus(chair);
      GamePlayer.removePlayer(data.userid);
  },

    RCMD_Chat:function (event)
    {
        cc.log("RCMD_Chat");
        let data = event.detail;
        cc.log(data.userid);
    },

  getSeatIdByChair:function(chair){
    chair = chair||0;
    return (this.seatId+chair+3)%MAX_PLAYERS+1;

  },

  getChairBySeatId:function(seatId){
    var chair = (seatId-this.seatId+ this.m_totalrenshu )% this.m_totalrenshu;


    var getChairBySeatId2 = function(chair)
    {
        return chair == 0 ? 0 : 2
    }

    var getChairBySeatId3 = function(chair)
    {
        if( chair == 0 )
        {
             return 0
        }
        if( chair == 1 )
        {
            return 2
        }
        if( chair == 2 )
        {
            return 3
        }
    }

    var getChairBySeatId4 = function(chair)
    {
        if( chair == 3 )
        {
            return 4
        }
        return chair
    }

    switch( this.m_totalrenshu )
    {
        case 2 :    return getChairBySeatId2(chair)
        case 3 :    return getChairBySeatId3(chair)
        case 4 :    return getChairBySeatId4(chair)
        case 5 :    return chair
    }

    return -1
    // if( this.m_totalrenshu == 2 )
    // {
    //     return getChairBySeatId2
    // }


    // if( this.ruleFlag % 10 == 2 )
    //   {
    //     return this.seatId == seatId ? 0 : 2;
    //   }
    //   else
    //   {
    //     return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
    //   }
  },

  getChairByUserid : function (userid) {
    let seatid = GamePlayer.getSeatByUserid(userid);
    return this.getChairBySeatId(seatid);
  },

  initPosition:function(chair){
    this._position.initUI(chair);
  },

  setMaster:function(masterid){
    this.masterid = masterid;
    for(let i = 0; i < MAX_PLAYERS; i++){
      this.players[i].children[4].active = false;
    }
    let chair = this.getChairByUserid(masterid);
    if(chair < 0) return;
    this.players[chair].children[4].active = true;
  },
  setplayerScore:function(chair,score)
  {
    let player = this.players[chair];
    player.children[2].getComponent(cc.Label).string = formatNum(score);
    if(this.roomType < 2 && chair == 0){
        UserCenter.setYouxibiNum(score);
    }
  },

  setChairInfo:function(user,chair){
      cc.log("user = " , user);
    let player = this.players[chair];
    let beans = this.roomType == 2 ? user.totalwon : user.money;
    let status = user.status;
    let userImage = user.userImage;
    if (!isUrl(userImage)){
        let sexs = user.sex==1?'man':'women';
        userImage = 'style/{0}/common/head/'.format(config.resourcesPath)+sexs;
    }
    player.active = true;
    player.children[1].getComponent(cc.Label).string = user.nick;
    player.children[2].getComponent(cc.Label).string = formatNum(beans);
    // if(player.children[5]){
    //     player.children[5].getComponent(cc.Label).string = user.userid;
    // }

    getSpriteFrameByUrl(userImage,function (err,spriteFrame) {
      if(err) return;
      player.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    });
    //保存玩家信息
    player.chair = chair;
    player.userid = user.userid;
    player.sex = user.sex;
    player.beans = beans;
    this.setReady(chair,status == GamePlayer.PlayerState.Ready);
    this.setOfflineStatus(chair,status >= GamePlayer.PlayerState.Offline);
    //只有房卡场才有房主
    this.setRoomOwerVisilbe(chair, (this.initdata.roomuserid == player.userid&&this.roomType == 2));
  },

    /**
     *  更新结算信息
     * @param data
     * @private
     */
    _updatePlayers : function (data) {
        var users = data.users;
        for(var i = 0; i < users.length; i++){
            var user = users[i];
            var player = GamePlayer.getPlayer(user.userid);
            var chair = this.getChairByUserid(user.userid);
            if(this.roomType == 2){
                player.score = user.score;
                this.players[chair].children[2].getComponent(cc.Label).string = player.score;
            }else{
                player.money = user.money;
                if(UserCenter.getUserID() == player.userid){
                    UserCenter.setYouxibiNum(player.money);
                }
                this.players[chair].children[2].getComponent(cc.Label).string = formatNum(player.money);
            }
        }
    },


    onClickRequeseStart(){
        cc.log('onClickRequeseStart',GDYCMD.CMD.CMD_TCC_REQUESTSTART);
        PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Expend",
            {
                data : {
                    cmd : GDYCMD.CMD.CMD_TCC_REQUESTSTART,
                    userid:UserCenter.getUserID(),
                }
            },function (data) {
                cc.log(data);
            });
    },

  onClickMessage:function(){

  },

  onClickMenu : function () {
      this.refreshMenuActive();
  },
    refreshMenuActive:function()
    {
        // this.roommenu.active = !this.roommenu.active;
        // this.chatNode.active = !this.roommenu.active;
        if(this.menuIcon1 && this.menuIcon2){
            // this.menuIcon1.active = !this.roommenu.active;
            // this.menuIcon2.active = this.roommenu.active;
        }
    },
    onClickTipGDY:function()
    {
        let self = this;
        cc.log("点击了提示按扭");
        self.node.emit('onClickTip');
    },
    onClickPassGDY:function()
    {
        let self = this;
        cc.log("点击了过按扭");
        self.node.emit('onClickPass');
    },
    onClickOutGDY:function()
    {
        let self = this;
        cc.log("点击了出牌按扭");
        self.node.emit('onClickOut');
    },
  onClickVoice:function(){
    cc.log('onClickVoice click');
  },
  //吃牌响应
  onClickChi:function()
  {
    let self = this;
    cc.log("点击了吃牌按扭");
    self.node.emit('onClickChi');
  },
  //扛牌响应
  onClickGang:function()
  {
    let self = this;
    cc.log("点击了扛牌按扭");
    self.node.emit('onClickGang');
  },
  //逃花响应
  onClickTaoHua:function()
  {
    let self = this;
    cc.log("点击了逃花按扭");
    self.node.emit('onClickTaoHua');
  },
  //过牌响应
  onClickGuo:function()
  {
    let self = this;
    cc.log("点击了过牌按扭");
    self.node.emit('onClickGuo');
  },
  //补花响应
  onClickFlower:function()
  {
    let self = this;
    cc.log("点击了补花按扭")
    self.node.emit("onClickFlower");
  },
  //献花响应
  onClickXianHua:function()
  {
    let self = this;
    cc.log("点击了献花按扭")
    self.node.emit("onClickXianHua");
  },
  //胡牌响应
  onClickHu:function()
  {
    let self = this;
    cc.log("点击了胡牌按扭")
    self.node.emit("onClickHu");
  },
  //换牌响应
  onClickHuan:function()
  {
    let self = this;
    cc.log("点击了换牌按扭")
    self.node.emit("onClickHuan")
  },
  showNormalBtn:function(isVisible){
     this.btnReady.active = isVisible;
    //  this.btnChangeDesk.active = isVisible;
  },

  setReady:function(dir,bReady){
      this.players[dir].getChildByName("ready").active = bReady;
  },

  setOfflineStatus : function (dir,offline) {
    this.players[dir].children[0].children[0].active = offline;
  },
  setJia:function(_ChairID,bVisible,JiaIndex)
  {
    this.players[_ChairID].getChildByName("jia").active = bVisible;
    if( bVisible && JiaIndex != null )
    {
        let wahuaitem = yuhuanCardResource.getwahuaItem();
        let spriteFrame = null;
        switch(JiaIndex)
        {
            case 1: spriteFrame = wahuaitem.getSpriteFrame("tian");break;
            case 2: spriteFrame = wahuaitem.getSpriteFrame("di");break;
            case 3: spriteFrame = wahuaitem.getSpriteFrame("ying");break;
            case 4: spriteFrame = wahuaitem.getSpriteFrame("chang");break;
            default: break;
        }
        if( null != spriteFrame )
        {
            this.players[_ChairID].getChildByName("jia").getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }
    }
  },
  setPass:function(_ChairID,bPass)
  {
    this.players[_ChairID].getChildByName("pass").active = bPass;
  },
  setHuaNum:function(_ChairID,bVisible,HuaNum)
  {
    return
      let huanode = this.players[_ChairID].getChildByName("hua");
      huanode.active = bVisible;
      let huaNum = huanode.getChildByName("huaNum")
      huaNum.getComponent(cc.Label).string ="x{0}".format(HuaNum);
  },
  setYaoZhang:function(bVisible, CardData1,CardData2,CardData3)
  {
    let YangZhangBG = this.node.parent.getChildByName("YangZhangBG")
    YangZhangBG.active = bVisible
    if( YangZhangBG.active == true)
    {
        YangZhangBG.children[0].getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_CurOut(0,CardData1)
        YangZhangBG.children[1].getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_CurOut(0,CardData2)
        YangZhangBG.children[2].getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_CurOut(0,CardData3)
    }
  },
  setChiCard:function(bVisible,CardData1,CardData2)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){cc.log("点击了吃的背景")}, this);
        OpBtnBG.getChildByName("ChiBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("ChiBtn").getChildByName("ChiCard2").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData2)
        OpBtnBG.getChildByName("ChiBtn").getChildByName("ChiCard1").active = true;
        OpBtnBG.getChildByName("ChiBtn").getChildByName("ChiCard2").active = true;
        OpBtnBG.getChildByName("ChiBtn").active = true;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = true;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  setGangCard:function(bVisible,CardData1,CardData2,CardData3,CanPass)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard2").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData2)
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard3").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData3)
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard1").active = true;
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard2").active = true;
        OpBtnBG.getChildByName("GangBtn").getChildByName("ChiCard3").active = true;
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = true;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = CanPass;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  setTaoHua:function(bVisible)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = true;
        OpBtnBG.getChildByName("GuoBtn").active = true;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  setFlower:function(bVisible,CardData1)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("FlowerBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("FlowerBtn").getChildByName("ChiCard1").active = true;
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = false;
        OpBtnBG.getChildByName("FlowerBtn").active = true;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  //设置胡按扭信息
  setHu:function(bVisible,CanPass,CardData1,CardData2,CardData3)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("HuBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("HuBtn").getChildByName("ChiCard2").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData2)
        OpBtnBG.getChildByName("HuBtn").getChildByName("ChiCard3").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData3)
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = CanPass;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = true;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  //设置换牌按扭信息
  setHuan:function(bVisible,CanPass,CardData1,CardData2,CardData3,CardData4)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("HuanBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("HuanBtn").getChildByName("ChiCard2").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData2)
        OpBtnBG.getChildByName("HuanBtn").getChildByName("ChiCard3").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData3)
        OpBtnBG.getChildByName("HuanBtn").getChildByName("ChiCard4").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData4)
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = CanPass;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = true;
        OpBtnBG.getChildByName("XianHuaBtn").active = false;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  //设置献花
  setXianHua:function(bVisible,CardData1)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        OpBtnBG.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
        OpBtnBG.getChildByName("XianHuaBtn").getChildByName("ChiCard1").getComponent(cc.Sprite).spriteFrame = yuhuanCardResource.getCardNameByData_Out(0,CardData1)
        OpBtnBG.getChildByName("ChiBtn").active = false;
        OpBtnBG.getChildByName("GangBtn").active = false;
        OpBtnBG.getChildByName("TaoHuaBtn").active = false;
        OpBtnBG.getChildByName("GuoBtn").active = false;
        OpBtnBG.getChildByName("FlowerBtn").active = false;
        OpBtnBG.getChildByName("HuBtn").active = false;
        OpBtnBG.getChildByName("HuanBtn").active = false;
        OpBtnBG.getChildByName("XianHuaBtn").active = true;
    }
    else
    {
        OpBtnBG.off(cc.Node.EventType.TOUCH_START, function(event){}, this);
    }
  },
  setChuPaiBtn:function(bVisible)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpLayer")
    OpBtnBG.getChildByName("btn_outcard").getComponent(cc.Button).interactable = bVisible
  },
  setOpLyaer:function(bVisible,Btn1,Btn2,Btn3)
  {
    let OpBtnBG = this.node.parent.getChildByName("OpLayer")
    OpBtnBG.active = bVisible;
    if( OpBtnBG.active == true )
    {
        if( Btn1 != null )
        {
            OpBtnBG.getChildByName("btn_buyao").getComponent(cc.Button).interactable = Btn1
        }
        if( Btn2 != null )
        {
            OpBtnBG.getChildByName("btn_tip").getComponent(cc.Button).interactable = Btn2
        }
        if( Btn3 != null )
        {
            OpBtnBG.getChildByName("btn_outcard").getComponent(cc.Button).interactable = Btn3
        }
    }
  },
  setnobig:function(bVisible)
  {
    this.nobig.active = bVisible
  },
  //设置逃花按扭可见性
  setTaoHuaBtnVisible:function(bVisible)
  {
    this.players[0].getChildByName("taohua").active = bVisible;
  },
  //设置剩余牌数量
  setRemainNum:function(bVisible,Num)
  {
    let self = this;
    self.RemainNum.active = bVisible;
    self.RemainNum.getComponent(cc.Label).string = '剩余: {0}张'.format(Num)
  },
  setshowCard:function(bVisible,CardData)
  {
    var showCard = this.node.parent.getChildByName("bg").getChildByName("showcard")
    showCard.active = bVisible;
    if( bVisible == false )
    {
        return;
    }
    var CardNodeJs = showCard.getComponent("gandengyanCard");
    CardNodeJs.ChangeCardFrameByCardData_Out(0,CardData);
  },
  setZhuangVisbile:function(_ChairID,bVisible)
  {
    this.players[_ChairID].getChildByName("img").getChildByName("gdyzhuang").active = bVisible
  },
  setRoomOwerVisilbe:function(_ChairID,bVisible)
  {
    this.players[_ChairID].getChildByName("img").getChildByName("roomower").active = bVisible
  },
  setTest:function(bVisible,str)
  {
    var test = this.node.parent.getChildByName("bg").getChildByName("test")
    test.active = bVisible;
    if( bVisible == false )
    {
        return;
    }
    test.getComponent(cc.Label).string = str

    var callback = function(pSender)
    {
        pSender.active = false;
    }
    var delaytime = cc.delayTime(10);
    var finished = cc.callFunc(callback, test, 0);
    var seq = cc.sequence(delaytime, finished);
    test.runAction(seq)
  },
  _TimeCall:function()
  {
    let self = this;
    let Time = self.players[self.m_TimeChairID].getChildByName("Time")
    let ClockTime = Time.getChildByName("timernum")
    self.m_Time = self.m_Time - 1
    if( self.m_Time < 0 )
    {
        if( self.m_TimeChairID == 0 )
        {
            this.onClickAuto();
            //cc.log("定时器超时了")
           //let ev = new cc.Event.EventCustom('onClockTimeOut',true);
            //self.node.dispatchEvent(ev);
        }
        self.endClock(self.m_TimeChairID)
        return
    }
    ClockTime.getComponent("cc.Label").string = "{0}".format(self.m_Time)
  },
  //启动定时器
  beginClock:function(_ChairID,_Time)
  {
    let self = this;
    self.m_Time = _Time;
    self.m_TimeChairID = _ChairID;
    let Time = self.players[_ChairID].getChildByName("Time")
    let ClockTime = Time.getChildByName("timernum")
    Time.active = true;
    ClockTime.getComponent("cc.Label").string = "{0}".format(_Time)

    self.schedule(self._TimeCall,1)
  },
  //结束定时器
  endClock:function(_ChairID)
  {
    let self = this;
    let Time = self.players[_ChairID].getChildByName("Time")
    let ClockTime = Time.getChildByName("timernum")
    Time.active = false;
    self.unschedule(self._TimeCall)
  },
  //结束所有的定时器
  endAllClock:function()
  {
    let self = this
    for(let i=0; i < MAX_PLAYERS; i++)
    {
        self.endClock(i);
    }
  },
  beginClockGDY:function(_ChairID,_Time)
  {
    let self = this;
    self.m_Time = _Time;
    self.m_TimeChairID = _ChairID;
    let Time = self.players[_ChairID].getChildByName("Time")
    let ClockTime = Time.getChildByName("timernum")
    Time.active = true;
    ClockTime.active = true;
    ClockTime.getComponent("cc.Label").string = "{0}".format(_Time)

    self.schedule(self._TimeCall,1)
  },
  endClockGDY:function(_ChairID,Time)
  {
    let self = this;
    let img = self.players[_ChairID].getChildByName("Time")
    img.active = false;
    self.unschedule(self._TimeCall)
  },
  endAllClockGDY:function(_ChairID,Time)
  {
    let self = this
    for(let i=0; i < MAX_PLAYERS; i++)
    {
        self.endClockGDY(i);
    }
  },
  hideClockGDY:function(_ChairID){
    let Time = this.players[_ChairID].getChildByName("Time")
    Time.active = false;
  },
  onClickTip:function()
  {

  },
  onClikcOut:function()
  {

  },
  onClickReady:function(){
    this.showNormalBtn(false);
    this.node.emit('CMD_Ready');
  },
    sendGameOver:function () {
        this.node.emit('CMD_forceGameOver');
    },
    //房卡模式解散房间
    onClickDissolve:function(){
        cc.log('onClickDissolve');
        if(this.gameid== 154){
            if(UserCenter.getUserID() == this.roomuserid ){
                showAlertBox('确认解散房间！',this.sendGameOver.bind(this),15,this.sendGameOver.bind(this))
            }else{
                showAlert('只有房主才能解散房间！')
            }
        }else{
            this.node.emit('CMD_forceGameOver');
        }

        this.refreshMenuActive();
    },

  onClickExit : function () {
    cc.log('exit');
    this.node.emit('onExit');
  },

  // 玩家离开，清理状态
  clearPlayStatus : function (chair) {
    this.players[chair].children[3].active = false;
    this.players[chair].children[4].active = false;
  },

  clearPlayers:function()
    {
        for(let i = 0;i< 5 ;i++)
        {
            let player = this.players[i];
            if(player != null)
            {
                player.active = false;
                this.clearPlayStatus(i);
            }
        }
    },

  // 初始化房间信息
  showTableInfo : function (data) {

  },

    _showTitleSprite : function () {
        return;
        var game = config.getGameById(this.gameid);
        var self = this;
        cc.loader.loadRes(game.title,cc.SpriteFrame,function (err,spriteFrame) {
            if(err){
                cc.log(err);
                return;
            }

            self.titleSprite.spriteFrame = spriteFrame;
        });
    },

    RCMD_Expend:function(data){
        cc.log('gdygame expend', data.data);
        let self = this;
        var expend = data.data;

        
        if (expend.CMD == '10003') {
            //更新游戏豆UID
            let chair = self.getChairByUserid(expend.UID);
            let money = expend.Money;
            self.players[chair].getChildByName("beans").getComponent(cc.Label).string = formatNum(money);
            if (expend.UID == UserCenter.getUserID()) {
                UserCenter.setYouxibiNum(money);
            }
        } else if (expend.CMD == '10001') {
            //房间桌费
            self.jushu.getComponent(cc.Label).string = '桌费:'+expend.deskfee;
            self.jushu.active = true;
            self.ScoreInfo.getComponent(cc.Label).string = '基础分:{0}'.format(expend.basemoney);  //断线 底分

        } else if (expend.CMD == '10004') {
            let users = expend.users
            for (let i = 0; i < users.length; i++) {
                let chair = self.getChairByUserid(users[i].userid);
                let money = users[i].zhye;
                self.players[chair].getChildByName("beans").getComponent(cc.Label).string = formatNum(money);
                if (users[i] == UserCenter.getUserID()) {
                    UserCenter.setYouxibiNum(money);
                }
            }
        } else if (expend.CMD == '10000') {
            self.minpoint = expend.minpoint;
            self.maxpoint = expend.maxpoint;
            cc.log(this.minpoint)
        }
        // else if(expend.CMD == '10002'){
        //     self.m_totalrenshu = expend.PlayerCount
        // }
    },

    onDestroy:function()
    {
        pomelo.removeAllListeners("RCMD_Dao");
        pomelo.removeAllListeners("RCMD_Expend");
        PING.StopPing();
    },
});
