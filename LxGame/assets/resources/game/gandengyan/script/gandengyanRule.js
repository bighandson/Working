
var config = require('Config');
var assert = require('assert');
const GamePlayer = require('GamePlayer');
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
const CMD_ACTION = Command.CMD_ACTION;
const EATFLAG = Command.EATFLAG;
var PLAYER_NUM = 5;
const MJType = require('MJType');
const MJCardResource = require('gandengyanCardResource');
const yhwhCommand = require("gandengyanCommand")
const GDYCMD =  require("GDYCMD")
var GameLogic = require("GameLogic")
var PING = require('Ping');
var GDYCardRes = require("GDYCardRes")
var LoadGame = require('LoadGame');

// 吃碰杠胡预制体
const OPCMDAnimPath = {
  0x02   :  'game/mahjong/mah/prefab/optAni/eatAni',   // 吃
  0x04   :  'game/mahjong/mah/prefab/optAni/hitAni',
  0x08   :  'game/mahjong/mah/prefab/optAni/barAni',
  0x20   :  'game/mahjong/mah/prefab/optAni/huAni',
  0x300  :  'game/mahjong/mah/prefab/optAni/liujuAni',
  0x8003 :  'game/mahjong/mah/prefab/optAni/buhuaAni',
  0x8004 :  'game/mahjong/mah/prefab/optAni/xianhuaAni',
}

const AniGDyPath =
{
  3  : "game/gandengyan/effect/Shunzi/ShunziNode",
  4  : "game/gandengyan/effect/LianDui/LianduiNode",
  13 : "game/gandengyan/effect/Bomb/Bomb",
  14 : "game/gandengyan/effect/Bomb/Bomb",
  15 : "game/gandengyan/effect/Bomb/Bomb",
  16 : "game/gandengyan/effect/Bomb/Bomb",
  30 : "game/gandengyan/effect/SiWang/SiWang"
}
// bigOutCardPos
const BigOutCardPos = [
  {x : 677,y : 300},
  {x : 1100, y : 375},
  {x : 667, y : 500},
  {x : 240, y : 375},
]

// 吃碰杠方位位置
const OPCMDPos = [
  {x : 667, y : 250},
  {x : 1000, y : 375},
  {x : 667, y : 600},
  {x : 270, y : 300}
]

//用户当前的操作状态
const OpStatus=
{
  OpStatus_NULL : 0,  //空状态 
  OpStatus_FLOWER :1,//补花状态
  OpStatus_FLOD : 2,//逃花状态
  OpStatus_EAT : 3 , //吃牌状态
  OpStatus_GANG : 4, //扛牌状态
  OpStatus_OUT : 5 , //出牌状态
  OpStatus_HU : 6 ,  //胡牌状态
  OpStatus_HUAN:7,//换牌状态
}

const AniPos=
[
  {x:667,y:317},
  {x:920,y:294},
  {x:919,y:527},
  {x:361,y:525},
  {x:360,y:337},
]

cc.Class({
  extends:cc.Component,
  properties:{

  },
  onLoad:function(){
    cc.log('玉环挖花 ss Rule onLoad');
    
    this.loadcomplete = false
    this._animStatus = false;
    this.msgList = [];

    this.addPomeloListeners();
    this.addGameListeners();

    this._isplaying = false;
    this.iBD = 0;                // 财神值
    // 单机出牌 默认单击出牌
    this.bSingleClick = parseInt(cc.sys.localStorage.getItem('MJSingleClick')) || 1;

    //this.bLanguageSound = cc.sys.localStorage.getItem('') || 0;
    this.opcodeAnim = {};                 // 吃碰杠胡缓存
    this.opcodeAnimGDY={};
    this.AniPos = AniPos
    this.init();
    
    let self = this;
    GDYCardRes.loadGDYCardsRes(function (err) {
      if (err == null) {

        let game = LoadGame.getCurrentGame();

        if (game) {
          let route = game.server + '.startGame';
          PomeloClient.request(route, function (data) {
            cc.log(data)
          });
        }

        self.loadcomplete = true;
        self.nextAction();
      }
    })
    
    //this.testGDY();
  },
  
  testGDY:function()
  {
    let self =this;
    this.scheduleOnce(function(){ self.SendCard()} , 3.0)
    this.scheduleOnce(function(){ self.TimeTest()} , 6.0)
    this.scheduleOnce(function(){ self.TestOutCard()} , 9.0)
  },
  SendCard:function()
  {
    this.m_StartSeat = [0,1,2,3,4]
    this.m_CardNum = 5
    //this.m_HandCards = [203,204,205,206,207,208,209,210,211,212,213,214,216,51,52]
    this.m_HandCards = [203,204,205,206,207,208]
    this.DistributeCards();
  },
  TimeTest:function()
  {
    this.m_GameJs.beginClock(0,30)
    this.m_GameJs.beginClock(1,30)
    this.m_GameJs.beginClock(2,30)
    this.m_GameJs.beginClock(3,30)
    this.m_GameJs.beginClock(4,30)
  },

  TestOutCard:function()
  {
    this.m_CardMangerJs[0].addOutCardGDY([203,204,205,206,207,208]);//显示出的牌
  },
    //监听游戏结束 执行结算框加载
    Result : function(huInfo,result){
      let self = this;
      cc.loader.loadRes('game/mahjong/mahScene2/prefab/mahresult/mahresult'.format(config.resourcesPath),cc.Prefab,function (err,prefab) {
        if(err){
          cc.log(err);
          return;
        }
        self.resultLayer = cc.instantiate(prefab);
        self.resultLayer.x = 0;//cc.winSize.width / 2;
        self.resultLayer.y = 0;//cc.winSize.height / 2;
        self.resultLayer.setLocalZOrder(2500);
        self.resultLayer.parent = self.node.parent;
        self.resultLayer.getComponent('Mah1ResultController').showResult(self,self.gameid,self.masterid,huInfo,result,self.lastPlayId,self.roomType);
      });
    },

    getCustomResult : function () {
      //this.resultLayer;
    },

  addGameListeners : function () {
    // 监听退出消息
    this.node.on('onExit',this.onExit,this);
    this.node.on('CMD_Ready',this.sendStart,this);
    this.node.on('DO_CANCEL',this.doDefault,this);
    this.node.on('MULTI_EAT',this.doEatMulti,this);
    this.node.on('TIME_OUT',this.overTime,this);
    this.node.on('NEXT_ACTION',this.nextAction,this);
    this.node.on('msg_onceAgain',this.onceAgain,this);

    this.node.on('onClockTimeOut',this.onClockTimeOut,this);
    this.node.on('onClickChi',this.onClickChi,this);
    this.node.on('onClickFlower',this.onClickFlower,this);
    this.node.on('onClickGang',this.onClickGang,this);
    this.node.on('onClickGuo',this.onClickGuo,this);
    this.node.on('onClickHu',this.onClickHu,this);
    this.node.on('onClickTaoHua',this.onClickTaoHua,this);
    this.node.on('onClickHuan',this.onClickHuan,this)
    this.node.on('onClickXianHua',this.onClickXianHua,this);
    this.node.on('Auto_Play_Ex',this.Auto_Play_Ex,this);

    this.node.on("onClickOut",this.onClickOut,this)
    this.node.on("onClickTip",this.onClickTip,this)
    this.node.on("onClickPass",this.onClickPass,this)
    this.node.on("onclicktest",this.onclicktest,this)

    GlobEvent.on("AUTO_PLAY",this.autoPlay.bind(this));
    GlobEvent.on('SINGLE_CHANGE',this.singleChange.bind(this) );
    GlobEvent.on('LANGUAGE_CHANGE',this.languageChange.bind(this));

    
      // this.node.on('TEST_ING',this.test,this);
  },
  Auto_Play_Ex:function(data)
  {
    let self = this;
    this.sendtrusteeship();
  },
    autoPlay:function(data)
    {
      //   this.isAutoPlay = data;
      // // if(this.isAutoPlay){
      // //   this.overTime();
      // // }
      // if( this.isAutoPlay )
      // {//托管自动出
      //   //this.onClockTimeOut();
      // }
      this.Auto_Play_Ex(data);
    },
    /**
     * 点击修改
     * @param event
     */
    singleChange : function (event) {
        this.bSingleClick = event;
        cc.log(this.bSingleClick);
    },
    languageChange:function (event) {
        this.bLanguageSound = event;
        this.soundCtrl.setPlayLanguageSound(this.bLanguageSound);
        cc.log(this.bLanguageSound);
    },



  // 初始化
  init : function () 
  {
    let self = this;
    // if(!this.BDFrame)
      //     // {
      //     //   cc.loader.loadRes('game/mahjong/mah/prefab/FrameBD/frameBD',cc.Prefab,function (err,prefab)
      //     //   {
      //     //     if(err){
      //     //       cc.log(err);
      //     //       return;
      //     //     }
      //     //     let node = cc.instantiate(prefab);
      //     //     self.BDFrame = node.getComponent('BDControler');
      //     //     node.parent = self.node;
      //     //     node.active = false;
      //     //   });
      //     // }
    //this.m_GameLogic = new GameLogic
    this.m_CardMangerJs = []
    this.m_TianIndex = [0,0,0,0]
    this.m_flowerNum = [0,0,0,0]
    for(let i=0; i < PLAYER_NUM ; i++)
    {
        let CardMangerNode = this.node.parent.getChildByName('gandengyanCardManger'+i)
        let CardMangerJs = CardMangerNode.getComponent('gandengyanCardManger'+i)
        CardMangerJs.setChairID(i);
        this.m_CardMangerJs.push(CardMangerJs)
    }
    this.m_GameJs = this.node.getComponent("gandengyanGame")
    this.m_CurJuShu = 0;
    this.m_TotalJuShu = 20;
    this.m_GameJs.setOpLyaer(false)
    self.reInitGame()
  },

  onExit : function () {
    if(this.roomType > 10 || !PomeloClient.isConnected)
    {  // 复盘
      this.backLobby();
      return;
    }

    cc.log(this._isplaying)
    if (this._isplaying) {
        showAlert("您正在游戏中，请完成牌局再退出");
        return
    }

    if(this.roomType == 2 && !this._isplaying)
    {
      let self = this;
      var tips = UserCenter.getUserID() == this.roomuserid ? "退出后将解散房间，是否解散房间？" : "退出将退出牌局，是否退出？";
      showConfirmBox(tips,function (result) {
          if(result == 1){
              self.node.emit('CMD_forceGameOver');
              self.removePomeloListeners();
              self.exitGame(function () {
                  self.backLobby();
              });
          }
      });
        return;
    }

    cc.log('-----------------------退出时,人物状态-----------------------');
    cc.log(GamePlayer.getUserStatus(UserCenter.getUserID()));

    if(!this._isplaying){
        let self = this;
        // this.removePomeloListeners();
        this.exitGame();
    }else {
      let self = this;
      if(GamePlayer.getUserStatus(UserCenter.getUserID()) == 0){
        // this.removePomeloListeners();
        this.exitGame();
      }else{
        showConfirmBox('您正在游戏中，退出将由笨笨的机器人代打',function (result) {
          if(result){
            // self.removePomeloListeners();
            self.exitGame();
          }
        })
      }
    }
  },

  /**
   * 退出游戏服务器
   * @param cb
   */
  exitGame : function () {
    if(!this.game){
      this.backLobby();
      return;
    }
    let route = this.game.server + '.CMD_Exit';
    PomeloClient.request(route);
  },

  /**
   *  返回大厅
   */
  backLobby : function () {
    if(this.roomType < 2 ){
      let backscene =  config.roomScene;
      cc.director.loadScene(backscene, function (err) {
          if (err) {
              cc.log(err);
              hideLoadingAni();
              return;
          }
          let gameScript = cc.find('Canvas').getComponent('gameScript')
          gameScript.reInRoom()
      });
  }else{
      let backscene =  config.lobbyScene;
      cc.director.loadScene(backscene);
  }

  },

  onceAgain : function (event) {
    this.nextAction(event);
    this.sendStart();
  },
  
  /**
   *  初始化参数
   */
  resetGame : function () {
    this._isplaying = false;            // 是否在游戏中
    this.masterId = 0;   //庄家id
    this.lastPlayId = 0;
    this.lastOutPai = 0;
    this.activePlayer = 0;
    this._opcode = RCMD_ACTION.optNull;
    this.remainderPai = this.game.totalCards || 136;      // 剩余牌张数
    for(let i = 0; i < this._renders.length; i++){
      var render = this._renders[i];
      render.clearForGame();
    }
  },
  //重置游戏数据
  reInitGame:function() 
  {
    this._isplaying = false;            // 是否在游戏中
    this.m_OPStatus = OpStatus.OpStatus_NULL;
    this.m_CurTurnChair = -1;
    this.m_RemainNum = 136
    this.m_Countdown = 60
    this.m_GameJs.setYaoZhang(false);
    this.m_GameJs.setTaoHua(false);
    this.m_GameJs.endAllClock();
    this.m_flowerNum = [0,0,0,0];
    for(let i=0; i <PLAYER_NUM; i++)
    {
      this.m_CardMangerJs[i].removeAllCardsGDY();
      // this.m_GameJs.setJia(i,false,0)
      // this.m_GameJs.setHuaNum(i,true,this.m_flowerNum[i]);
    }
    this.m_GameJs.setRemainNum(false,1)
    this.m_GameJs.setshowCard(false,-1);
    this.m_GameJs.cancelAutoPlayEx();

    this.danjunum = 1
    this.m_GameJs.setdanjuNum(this.danjunum)
  },

  // 游戏开始
  sendStart : function () {
    var route = this.game.server + '.CMD_Ready';
    PomeloClient.request(route);

    this.reInitGame();
  },

  sendAction:function (opCode,lps) {
    let msg = {};
    msg.opcode = opCode;
    msg.lps = lps;

    if(arguments.length >= 3){
      msg.pai1 = arguments[2];
    }
    if(arguments.length >= 4){
      msg.pai2 = arguments[3];
    }
    this._opcode = RCMD_ACTION.optNull;
    PomeloClient.request(this.game.server + '.CMD_Action',msg,function (data) {
      //cc.log(data);
    });
  },

   sendExpend : function (data) {
       PomeloClient.request(this.game.server + '.CMD_Expend',{
           data : data
       },function (data) {
           cc.log(data);
       });
   },
  /**
   *  初始化绘图顺序
   */
  initRender:function(){
    this._renders = [];
    let scale = [1,0.8,1,0.8,0.8];

    if(this.game.handCards<16){
      scale = [1.2,0.9,1,0.9,0.9];
    }
    for(let i = 0; i < 5; i++){
      let node = new cc.Node();
      this._renders[i] = node.addComponent('gandengyanRender');
      node.parent = this.node;
      node.setLocalZOrder(10-i);
      this._renders[i].init(i,this.game.handCards,scale[i],this);
    }
  },


  getSeatIdByChair:function(chair){
    chair = chair||0;
    return (this.seatId-1+chair)%PLAYER_NUM+1;

  },

  getChairBySeatId:function(seatId){
      return this.m_GameJs.getChairBySeatId(seatId)
      return seatId-1
      if( this.ruleFlag % 10 == 2 )
      {
        return this.seatId == seatId ? 0 : 2;
      }
      else
      {
        return (seatId-this.seatId+PLAYER_NUM)%PLAYER_NUM;
      }
  },

  /**
   *  逻辑判断
   */

  /**
   *  是否财神
   * @param value
   */
  isBD : function (value) {
    return this.iBD == value;
  },

  getBD : function () {
    return this.iBD;
  },

  // 处理是否可以出的牌
  handleOutCards : function () {
    let mjcards = this._renders[0]._hands.getMJCards();
    for(let i = 0; i < mjcards.length; i++){
      let value = mjcards[i].getValue();
      if(this.cannotOutCard(value,i == mjcards.length-1)){
        cc.log('setMasterCard : ');
        mjcards[i].setCardMask();
      }
    }
  },

  clearHandleCards : function () {
    let mjcards = this._renders[0]._hands.getMJCards();
    for(let i = 0; i < mjcards.length; i++){
      mjcards[i].clearCardMask();
    }
  },

  /**
   * 牌是否可以出  默认花牌不可以出
   * @param value
   * @param isGet  牌位置
   */
  cannotOutCard : function (value,isGet) {
    return MJType.isFlower(value);
  },

  /**
   * 牌是否可以补杠
   * @param value
   * @param isGet
   * @returns {boolean}
   */
  canSupplyBar : function (value,isGet) {
    return true;
  },
  
  canAnBar : function (value) {
    return true;
  },
  
  // 查找补杠  有些麻将不能杠手里的牌
  findSupplyBarCards : function () {
    let bars = [];
    let blockPais = this._renders[0].blockPais;
    //let hands = this._renders[0]._hands;
    let len = this._renders[0]._hands.getMJCards().length;
    let render = this._renders[0];
    for(var i = 0; i < blockPais.length; i++){
      var block = blockPais[i];
      if(block.blockFlag == EATFLAG.EAT_HIT){
        let pos = render.findCardValueIndex(block.values[0]);
        if(this.canSupplyBar(block.values[0],pos == len-1)){
          if(pos >= 0){
            bars.push({
              flag : EATFLAG.EAT_BAR,        // 补杠
              pais  : [block.values[0]],
              pos   : pos
            });
          }
        }
      }
    }

    return bars;
  },

  // 查找暗杠
  findAnBarCards : function () {
    let bars = [];
    let hands = this._renders[0]._hands;
    let mjcards = hands.getMJCards();
    for(let i = 0; i < mjcards.length-2; i++){
      let value = mjcards[i].getValue();
      let count = hands.CountPai(value,i);
      if(count == 4 && this.canAnBar(value)){
        bars.push({
          flag : EATFLAG.EAT_BAR_DRAK,
          pais : [value],
          pos : i
        });
      }
    }

    return bars;
  },

  // 获取左吃
  getLeftPais : function (value) {
    let l1 = this.blockToValue(value);
    let l2 = l1 + 1;
    let l3 = l2 + 1;

    if(MJType.isSameFlower(l1,l2,l3) && l1 >= MJType.PAI.PAI_W1
        && l3 <=  MJType.PAI.PAI_S9){
      l2 = this.toBlockValue(l2);
      l3 = this.toBlockValue(l3);

      if(this.isBD(l2) || this.isBD(l3)){
        return null;
      }

      let  index1 = this._renders[0].findCardValueIndex(l2);
      if(index1 < 0) return null;

      let index2 = this._renders[0].findCardValueIndex(l3);
      if(index2 < 0) return null;

      return {
        pai0 : value,
        pai1 : l2,
        pai2 : l3,
        dA : index1,
        dB : index2,
        flag : EATFLAG.EAT_LEFT,
        pais : [value,l2,l3]
      }

    }else {
      return null;
    }
  },
  
  // 获取右吃
  getRightPais : function (value) {
    let l1 = this.blockToValue(value);

    let l2 = l1 - 1;
    let l3 = l2 - 1;

    if(MJType.isSameFlower(l1,l2,l3) && l3 >= MJType.PAI.PAI_W1
        && l1 <= MJType.PAI.PAI_S9
    ){
      l2 = this.toBlockValue(l2);
      l3 = this.toBlockValue(l3);

      if(this.isBD(l2) || this.isBD(l3)){
        return null;
      }

      let index1 = this._renders[0].findCardValueIndex(l2);
      let index2 = this._renders[0].findCardValueIndex(l3);
      if(index1 < 0 || index2 < 0) return null;

      return {
        pai0 : value,
        pai1 : l2,
        pai2 : l3,
        dA : index2,
        dB : index1,
        flag : EATFLAG.EAT_RIGHT,
        pais : [l3,l2,value]
      }
    }else{
      return null;
    }
  },

  // 中吃
  getMidPais : function (value) {
    let l1 = this.blockToValue(value);

    let l2 = l1 - 1;
    let l3 = l1 + 1;

    if(MJType.isSameFlower(l1,l2,l3)
        && l2 >= MJType.PAI.PAI_W1
        && l3 <= MJType.PAI.PAI_S9
    ){
      l2 = this.toBlockValue(l2);
      l3 = this.toBlockValue(l3);

      if(this.isBD(l2) || this.isBD(l3)){
        return null;
      }

      let index1 = this._renders[0].findCardValueIndex(l2);
      if(index1 < 0) return null;
      let index2 = this._renders[0].findCardValueIndex(l3);
      if(index2 < 0) return null;

      return {
        pai0 : value,
        pai1 : l2,
        pai2 : l3,
        dA : index1,
        dB : index2,
        flag : EATFLAG.EAT_MID,
        pais : [l2,value,l3]
      }

    }else {
      return null;
    }
  },

  //不能出的牌值
  getCannotOutCards:function(){
      return [];
  },

  /**
   * 将牌值转换为 吃碰杠的值 财神值转白板
   * @param value
   */
  toBlockValue : function (value) {
    if(this.isBD(value) && !!this.game.bBDToValue){
      return MJType.PAI.PAI_FB;
    }
    return value;
  },

  /**
   * 吃的牌 白板转财神值
   * @param blockValue
   */
  blockToValue : function (blockValue) {
    if(MJType.PAI.PAI_FB == blockValue && this.game.bBDToValue){
      return this.getBD();
    }

    return blockValue;
  },
  /**
   * 牌值比较
   * @param a
   * @param b
   */
  compareValue : function (a,b) {
    if(this.isBD(a)){
      return -1;
    }
    if(this.isBD(b)){
      return 1;
    }

    return this.getMJWeight(a) - this.getMJWeight(b);
  },

  /**
   * 获取麻将值权重
   * @param value
   */
  getMJWeight : function (value) {
    if(this.isBD(value)){
      return 0;
    }

    if(value == MJType.PAI.PAI_FB && !!this.game.bBDToValue){
      if(MJType.invalidPai(value)){
        return this.getBD();
      }else {
        return value;
      }
    }

    return value;
  },

  /**
   * 将权重值转为牌值
   * @param pai
   */
  toValue : function (pai) {
    if(!!this.game.bBDToValue && this.isBD(pai)){
      return MJType.PAI.PAI_FB;
    }

    return pai;
  },

  //手牌排序函数
  sortPaisByBD : function(pais,start,end){
    start = start || 0;
    end = end || pais.length - 1;

    for(let i = start; i < end; i++){
      for(let j = i+1; j <= end; j++){
        if(this.getMJWeight(pais[i]) > this.getMJWeight(pais[j])){
          let temp = pais[i];
          pais[i] = pais[j];
          pais[j] = temp;
        }
      }
    }
  },

  getChairByUid:function(userid){
    let seatid = GamePlayer.getSeatByUserid(userid);
    return this.getChairBySeatId(seatid);
  },


  setMaster:function(masterId){
    this.masterid = masterId;
  },

  /**
   *
   * @param data
   *  flag : 登陆游戏服务器标志 0 成功， 其他，失败
   */
  RCMD_signup:function(data){
    cc.log(data.route,data);
    if(!!data.flag){  // 登陆服务器失败
      hideLoadingAni();
      showAlertBox('进入游戏失败',function () {
        cc.director.loadScene(config.lobbyScene);  // 返回游戏大厅
      });
    }
  },

  /**
   * 登陆到游戏服务器
   * flag:4
   * reason:"房间人满为患！"
   */
  RCMD_MobileSignUp:function(data){
    cc.log('客户端收到消息 用户登陆到游戏服务器 RCMD_MobileSignUp',data);
      let flag = data.flag;
      let reason = data.reason;
      let self = this;
      if(flag != 0){
        hideLoadingAni();
        this.removePomeloListeners();
        showAlertBox(reason,function () {
          self.backLobby();
        });
      }
  },

  /**
   * 显示准备按钮
   * @param data
   */
  RCMD_Start:function(data){
    this.node.emit('RCMD_Start',data);
    if( this._currGame > 0 )
    {
      
      if( this.GameResult != null )
      {
        this.m_GameJs.btnReady.active = false;
      }
      
    }
    this.nextAction();
  },

  /**
   * 玩家准备
   * @param data
   * userid : 玩家id
   */
  RCMD_Ready:function(data){
      if(!this._renders){
          this.nextAction();
          return;
      }
    console.log('RCMD_Ready',data.userid);
    let chair = this.getChairByUid(data.userid);
    //this._renders[chair].clearForGame();
    this.node.emit('RCMD_Ready',data);
    this.nextAction();
  },

  /**
   * 玩家离开
   * @param data
   * userid : 玩家id
   */
  RCMD_exit:function(data){
    if(!this._renders){
      this.nextAction();
      return;
    }
    let chair = this.getChairByUid(data.userid);
    this._renders[chair].clearForGame();
    this.node.emit('RCMD_exit',data);
    if (data.userid == UserCenter.getUserID()) {
        this.removePomeloListeners();
        this.backLobby();
    }
    this.nextAction();
  },

  /**
   * 玩家状态改变
   * @param data
   * userid : 玩家id
   * status : 玩家状态
   */
  RCMD_PlayerStatus:function(data){
    this.node.emit('RCMD_PlayerStatus',data);
    this.nextAction();
  },


  /**
   * 玩家入座
   * @param data
   * users : [user] {
   *    userid     : 玩家ID，
   *    nick       ： 玩家昵称
   *    classId    : classId,
   *    level      : level
   *    money      : 玩家游戏币
   *    score      : 玩家积分
   *    exp        : 逃跑次数
   *    won        : 赢次数
   *    lost       : 数次数
   *    sex        : 性别
   *    tableid    : 桌号
   *    seatid     : 座位号
   *    state      : 是否
   *    userImage  : 头像
   *    status     : 玩家状态
   * }
   */
  RCMD_SitIn:function(data){
    cc.log(data);
    this.node.emit('RCMD_SitIn',data);
    this.nextAction();
  },

  /**
   *  author       : hxm
   *  createtime   : 2017-2-15 15:50:42
   *  description  : add
   *  @param       : data.bt
   *  {
     *  0：_T("您的人品不好，所以被踢下线") ,
        1：_T("帐号在另一个地方登录，您被迫下线") ,
        2：_T("您被管理员踢下线") ,
        3：_T("您的游戏币不足，不能继续游戏。") ,
        4：_T("你的断线或逃跑已经超过规定的次数,不能继续游戏")}
   */
  RCMD_Kick:function(data){
    let msgArr = {
      0 :'您的人品不好，所以被踢下线',
      1 : '帐号在另一个地方登录，您被迫下线',
      2 : '您被管理员踢下线',
      3 : '您的游戏币不足，不能继续游戏。',
      4 : '你的断线或逃跑已经超过规定的次数,不能继续游戏',
      255 : data.srtMsg
    };
    let self = this;
    hideLoadingAni();
    this.removePomeloListeners();
    showAlertBox(msgArr[data.bt],function () {
      self.backLobby();
    });
  },

  /**
   * 服务器连接断开
   * @param data
   */
  RCMD_close:function(data){
    this.removePomeloListeners();
    let self = this;
    hideLoadingAni();
    showAlertBox('您与游戏服务器连接断开',function () {
      self.backLobby();
    });
  },

  /**
   * 操作超时 服务器断开连接
   * @param data
   */
  RCMD_ServerHeartOut:function(data){
    cc.log('RCMD_ServerHeartOut');
    this.msgList = [];
    this.removePomeloListeners();
    let self = this;
    this.scheduleOnce(function () {
      GlobEvent.emit('RCMD_ServerHeartOut');
      self.backLobby();
    });
  },

  /**
   * 连接服务器超时
   * @param data
   */
  RCMD_Timeout:function(data){
    let self = this;
    hideLoadingAni();
    showAlertBox('连接服务器超时',function () {
      self.backLobby();
    });
  },
  /**
   * author     :  dengqh
   * createtime :  2017-02-16 20:30
   * description : 房间初始化
   * data {outTimes ： 出牌时间
     *       EHBTimes ： 吃碰杠时间
     *       roomType ： 房间类型 ： roomType  房间类型 0，1：普通房间 2： 房卡房间 3 ：比赛房间
     *       roomuserid ：房卡房主
     *       gameid     ：游戏id
     *       basescore  ：底分
     *       roomcode   : 房卡房密码
     *       totalGame  : 房卡房间总局数
     *       currGame   : 房卡房间当前局数
     * }
   *
   * @param data
   */
  RCMD_initParam:function(data){
    cc.log('客户端收到消息 房间初始化 RCMD_initParam',data);
    this._animStatus = false;
    this.msgList = [];

    this.gameid = data.gameid;
    this.EHBTimes = data.EHBTimes || 15;
    this.outTimes = data.outTimes || 10;
    this.roomType = data.roomType;
    this.ruleFlag = data.ruleFlag;             // 游戏规则
    this._currGame = data.currGame || 0;
    this._totalGame = data.totalGame || 0;
    this.roomuserid = data.roomuserid;
    this._currentFeng =  0;
     // 游戏配置信息
    this.game = config.getGameById(this.gameid);
    this.node.emit('RCMD_initParam',data);
    this.initRender();
    this.resetGame();
    this.soundCtrl = this.node.addComponent(this.game.sound || 'MJSound');  // 默认普通话
    // 复盘记录不需要触摸出牌
    this.setTouchEvent();
    this.initCardRoom();                               // 房卡房初始化
    this.m_GameJs.ruleFlag = this.ruleFlag;
    this.updateJushu3()
    
    this.soundCtrl.playbgGDY()
  },

  /**
   tableid: 2, seatid: 3
   */
  RCMD_TaskSeat:function(data){
    console.log('客户端收到消息 用户座位 RCMD_TaskSeat',data);
    this.seatId = data.seatid;
    this.showPosition(this.seatId-1);
    cc.log("+++++++++++++++++++++++");
    this.node.emit('RCMD_TaskSeat',data);
  },

  /**
   * 游戏开始
   * @param data
   * userid        ： 庄家id
   * baseMoney     : 底分
   * currentJushu  ： 当前局数
   * currentFeng   : 当前番数   // 东南西北风圈
   */
  RCMD_GameStart:function(data){
    this.gameStart(data.userid,data.baseMoney);
    this.setMaster(data.userid);
    //this.soundCtrl.playGameStart();
    
    this.node.emit('RCMD_GameStart',data);
    this.updateRemainTip();
    this.playStartGameAnim();
    this.updateJushu(data);
    this.soundCtrl.playGameStart();
  },

  /**
   * 发牌
   * @param data
   * head     :  牌头
   * tail     :  牌尾
   * users    : {
   *   userid : 玩家ID,
   *   paiCount  : 手中张数
   *   isVisible : 牌是否可见
   *   [pais]    : 牌
   * }
   */
  RCMD_Distribute:function(data){
    console.log('挖花收到发牌消息 RCMD_Distribute',data);
    for(var i = 0; i < data.users.length; i++){
      let user = data.users[i];
      let chair = this.getChairByUid(user.userid);
      if(user.isVisible){
        this.onCmdDistribute(chair,user.paiCount,user.pais);
      }else {
        this.onCmdDistribute(chair,user.paiCount);
      }
      this.remainderPai -= user.paiCount;
    }

    this.updateRemainTip();
  },

  /**
   * 恢复对局数据
   * @param data
   * nCircle     ： 当前局数
   * nOutCards   : 当前出国的牌数
   * iBD         : 财神值
   * iBDPos      : 财神位置
   * masterid    : 庄家id
   * activeid    : 当前操作玩家
   * head        : 牌头
   * tail        : 牌尾
   * lastPai     : 最后一张出的牌
   * lastPlayerid : 最后一个出牌玩家
   * users  : [user] {
   *     userid : 玩家id
   *     hc     : 手中牌张数
   *     isVisible : 是否可见
   *     pais      : [手中牌],
   *     flowerCount : 花牌数量
   *     flowers     : 【花牌】
   *     eatCount    : 吃碰杠数量
   *     eats       : [eat] {
   *       flag    : 吃碰杠标志
   *       pai     : 吃碰杠最小的牌
   *       eatDir  : 吃碰杠方位
   *     }
   *
   *    outCount :  出牌张数
   *    outs     :  [出牌]
   *    outFlag  : 出牌标志
   *    callTing : 听牌
   * }
   * baseMoney  : 底分
   * tingPais   ： [听的牌]
   */
  RCMD_ActData:function(data){
    this.setMaster(data.masterid);
    this.gameStart(data.masterid);
    let activeid = data.activeid;
    this.lastOutPai = data.lastPai;
    this.lastPlayId = data.lastPlayerid;

    this.setBD(data.iBD);
    let users = data.users;
    for(let i = 0; i < users.length; i++){
      let user = users[i];
      let chair = this.getChairByUid(user.userid);
      let render = this._renders[chair];
      if(user.eatCount > 0){
         // 恢复吃碰杠的牌
        for(let j = 0; j < user.eats.length; j++){
          var eat = user.eats[j];
          let count = eat.flag > 4 ? 4 : 3;
          this.remainderPai -= count;
          let dir = this.getChairBySeatId(eat.eatDir);
          render.dealActData(eat.pai,eat.flag,dir);
        }
      }

      // 恢复手中的牌
     let pais = user.pais || [];
      this.remainderPai -= user.hc;
    
      render.createHandCards(user.hc,pais);

      // 恢复出过的牌
      this.remainderPai -= user.outCount;
      for(let i = 0; i <user.outCount; i++){
        render._createOneOutCard(user.outs[i]);
      }

      // 恢复花牌
      this.remainderPai -= user.flowerCount;
      render.addFlowers(user.flowers);
      render.freshHandCardsPos();
    }
    this.node.emit('RCMD_ActData',data);
    this.activePosition(activeid,this.outTimes);
    this.updateRemainTip();
    this.nextAction();
  },

  /**
   * 设置第一个出牌玩家
   * @param data
   * userid : 第一个出牌玩家
   */
  RCMD_StartOut : function (data) {
    if(!this._isplaying){
      this.nextAction();
      return;
    }

    //for(var i = 0; i < 4;)
    this._renders[0].freshHandCardsPos();
    this.activePosition(data.userid,this.outTimes);
    this.lastPlayId = data.userid;
    this.nextAction();
  },

  /**
   * 设置财神
   * @param data
   * iBD : 财神值
   */
  RCMD_SetBD : function (data) {
    cc.log('RCMD_iBD : ',data.iBD);
    this.setBD(data.iBD);
    this.nextAction();
  },

  setBD : function (iBD) {
    this.iBD = iBD;
    this.showBD(this.iBD);
  },


  updateRemainTip : function () {
    if(!this.BDFrame){
      return;
    }else{
      this.BDFrame.node.active = true;
      this.BDFrame.updateRemainTip(this.remainderPai);
    }

  },

  /**
   * 更新房卡房局数显示
   * @param data
   */
  updateJushu : function(data){
    if(this.roomType != 2){
      return;
    }
    this._currGame = data.currentJushu;
    this._currentFeng = data.currentJushu;
    if(!!this.jushu){
      this.jushu.string = this.getRoomJushu();
    }
  },

  updateJushu2 :function()
  {
    if(this.roomType != 2){
      return;
    }
    if(!!this.jushu){
      this.jushu.string = this.getRoomJushu();
    }
  },
  updateJushu3:function()
  {
      if(this.roomType != 2){
        return;
      }
    this.m_GameJs.setJuShu( this.getRoomJushu() )
  },
  /**
   * 设置财神值
   * @param iBD
   */
  showBD : function (iBD) {
    if(!this.BDFrame){
      return;
    }else{
      this.BDFrame.node.active = true;
      this.BDFrame.setBD(iBD,this.isBD(iBD));
    }
  },
  
  hideBD : function () {
    if(!!this.BDFrame){
      this.BDFrame.active = false;
    }
  },
  
  /**
   * 设置操作码
   * @param data
   * opcode :  操作码
   */
  RCMD_opCode:function(data){
    console.log('RCMD_opCode',data);
    
    this._opcode = data.opcode;

    if(data.opcode & RCMD_ACTION.optOut){  // 可以出牌判断
        this.handleOutCards();
    }
    this.activePosition(UserCenter.getUserID(),this.EHBTimes);
    if(this.isAutoPlay)
    {
        //托管，当做超时处理
        this.overTime();
        this.nextAction();
    }else {
        this.onCmdOpCode(data.opcode);
    }
  },


  /**
   * 玩家操作
   * @param data
   * userid  ： 玩家ID
   * opCode : 操作码
   * data : {
   *  操作数据
   * }
   */
  RCMD_Action:function(data){
    this.hideMultEats();
    this.hideToolBar();

    if(RCMD_ACTION.optTou == data.opCode){   // 德清麻将先收到出牌
      this.doCmdRunTou(data.userid,data.data);
      return;
    }

    if(!this._isplaying){
      this.nextAction();
      return;
    }
    let chair = 0;
    if(!!data.userid){
      chair = this.getChairByUid(data.userid);
    }

    if(chair < 0){
      this.nextAction();
      return;
    }
    let user = GamePlayer.getPlayer(data.userid);
    switch (data.opCode){
      case RCMD_ACTION.optTou:       // 摇撒子
        this.doCmdRunTou(data.userid,data.data);
        break;
      case RCMD_ACTION.optOut:       // 玩家出牌
      {
        this.lastPlayId = data.userid;
        this.onCmdOutPai(chair,data.data);
        this.playOutSound(chair,user.sex,data.data.pai);
      }
        break;
      case RCMD_ACTION.optEat:
      case RCMD_ACTION.optHit:
      case RCMD_ACTION.optBar:
        this.activePosition(data.userid,this.outTimes);
        this.onCmdEatAction(chair,data.opCode,data.data);
        this.playEatCmdSound(chair,user.sex,data.opCode);
        this.lastPlayId = data.userid;
        break;
      case RCMD_ACTION.optHu:
        this.onCmdHuAction(data.userid,data.data);
          let bNotZimo = (data.data.huflag == 0 || data.data.huflag == 16); // 点炮，抢杠
          this.playHuSound(chair,user.sex,bNotZimo,data.data.huflag,data.data.hutype1);
        break;
      case RCMD_ACTION.optTing:        // 听牌
        break;
      case RCMD_ACTION.optGet:
        this.activePosition(data.userid,this.outTimes);
        this.onCmdGetPai(chair,data.data);
        this.remainderPai--;
          this.updateRemainTip();
        break;
      case RCMD_ACTION.optSupply:      // 获取牌
        this.activePosition(data.userid,this.outTimes);
        this.onCmdGetSupply(chair,data.data);
        if(!!data.data.fpai){
          this.playSupplyCmdAnim(chair,0x8003);
          this.playEatCmdSound(chair,user.sex,data.opCode);
        }else {
          this.nextAction();
        }
        this.remainderPai--;
        this.updateRemainTip();
        break;
      case RCMD_ACTION.optRecordHu:         // 复盘胡
          this.onCmdRecordHu(data.userid,data.data);
        break;
      default:
        cc.log('没有运行了?',data);
        break;
    }

  },

  /**
   * 结算
   * @param data
   * result :   胡牌总番数
   * ibate  :   倍率
   * users  : [user] {
   *   userid  : 玩家id
   *   curwon  : 当前输赢
   *   money   : 玩家游戏币
   *   fanShu  : 番数
   *   score   : 积分
   * }
   */
  RCMD_Result:function(data){
    this._isplaying = false;
    this.isAutoPlay = false;
    if(!this.huResult){
      this.nextAction();
      return;
    }

    this.node.emit('RCMD_Result',data);
    if(!!this._position){
      this._position.stopActive();
    }

    var isHu = (this.huResult.userid == UserCenter.getUserID());
    if(isHu){
      this.soundCtrl.playWin();
    }else{
      this.soundCtrl.playLost();
    }

    this.hideOutTips();
    this.resultInfo = data;

    this.Result(this.huResult,data);
    this.setBD(0);
  },

  /**
   * 流局
   * @param data
   */
  RCMD_MissCarry:function(data){
    for(let i = 0; i < data.users.length; i++){
      let user = data.users[i];
      let chair = this.getChairByUid(user.userid);
      this.sortPaisByBD(user.pais);
      this._renders[chair].onCmdHu(user.pais);
    }
    this.huResult = null;
    this.playEatCmdAnim(0,RCMD_ACTION.optAnsHu);
    this.playMissCarry();
    //this.nextAction();
  },

  playMissCarry : function () {
    this.soundCtrl.playMissCarry();
  },
  /**
   * 房卡房间游戏结束
   * @param data
   */
  RCMD_MatchOver:function(data){

    cc.log('玉环挖花收到 总局结算消息',data);
    if( this.GameResult != null )
    {
      this.GameResult.removeFromParent()
      this.GameResult = null
    }
    this.m_GameJs.cancelAutoPlayEx();
    if(data.count == 0){
        let self = this;
        showAlertBox('房主解散了房间',function () {
          self.backLobby();
        });
    }else{
      this.node.emit('RCMD_MatchOver',data);
    }
  },/**
   * 扩展协议
   */
  RCMD_ExpendGDY : function (data) 
  {
    cc.log('RCMD_Expend',data);
    var expend = data.data;
    if(expend.CMD == '0001'){
      showAlert(expend.tips);
    }
    else if( expend.CMD == '001')
    {
      this.m_nExpand = expend.extData
      cc.log("cmd- 001 = ",this.ruleFlag,this.m_nExpand)
      this.m_GameJs.refreshRoomInfo(this.ruleFlag,this.m_nExpand)
      this.nextAction()
    }
    else if (expend.CMD == '002') {
        var arr = expend.ar;
        UserCenter.setList(arr);
        cc.log('1',UserCenter.getUserInfo().fangkaNum)
        this.nextAction()
    }
    else if (expend.CMD == '10000') {
      this.minpoint = expend.minpoint;
      this.maxpoint = expend.maxpoint;
      cc.log(this.minpoint)
    }
    else
    {   
      var cmd=data.data.cmd;
      var vo = data.data.vo;
      cc.log(cmd);
      switch(cmd)
      {
            case GDYCMD.CMD.RCMD_GAME_START:        this.onCmd_gameStartGDY(vo);  break;//游戏开始
            case GDYCMD.CMD.RCMD_GAME_OVER :        this.onCmd_gameOverGDY(vo);   break;//游戏结束
            case GDYCMD.CMD.RCMD_OUT:               this.onCmd_doOutGDY(vo);      break;//出牌
            case GDYCMD.CMD.RCMD_RE_CARD:           this.onCmd_re_cardGDY(vo);    break;//重新理牌
            case GDYCMD.CMD.RCMD_PASS:              this.onCmd_passGDY(vo);       break;//过
            case GDYCMD.CMD.RCMD_FA_PAI:            this.onCmd_faPaiGDY(vo);      break;//发牌  
            case GDYCMD.CMD.RCMD_TURN:              this.onCmd_turnGDY(vo);       break; //谁的回合
            case GDYCMD.CMD.RCMD_RELOAD_TABLE:      this.oncmd_reload_tableGDY(vo);break;//重连
            case GDYCMD.CMD.RCMD_Trusteeship:       this.oncmd_trusteeshipGDY(vo); break;//托管
            case GDYCMD.CMD.RCMD_NOTICE:            this.oncmd_noticeGDY(vo);     break;//系统提示
            case GDYCMD.CMD.RCMD_TIP_OUT:           this.oncmd_TipOut();        break;//出牌提示
            case GDYCMD.CMD.RCMD_TCC_REQUESTSTART:  this.oncmd_restart(vo);        break;//提前开始
        default: cc.log("扩展协议找不到");this.nextAction(); assert(false);
      }
    }
  },

  oncmd_restart:function(data){
    cc.log('收到提前开始消息');
    cc.log(data);
    this.node.emit('RCMD_RequestStart',data);
    this.nextAction();
  },

  oncmd_TipOut:function(data)
  {
    cc.log("收到提示出牌消息")
    let self = this
    if( 0 == this.m_CurTurnChair )
    {
      var VisBuBtn = true;
      var VisTipBtn = true;
      var VisOutBtn = false;
      var VisOp = true
      if( this.m_LastOutCard != null )
      {
        var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
        this.SearchCardArr = GameLogic.SearchCard(HandCardData, this.m_LastOutCard.Shows, this.m_LastOutCard.Type)
        this.SearchCardArrIndex = -1
        if( this.SearchCardArr.length == 0 )
        {
           VisOp = false
           self.m_GameJs.setnobig(true)
           self.m_GameJs.endAllClockGDY()

           var nobigcb =function()
           {
              self.m_GameJs.setnobig(false ); self.onClickPass()
              self.m_nobigcbhander = null
           }
           if( self.isAutoPlay == null || self.isAutoPlay == false )
           {
              self.m_nobigcbhander = this.scheduleOnce(nobigcb, 1)
           }
        }
        else
        {
            
        }

        let SelcetCard = this.m_CardMangerJs[0].getSelcetCardDataGDY();
        if( SelcetCard.length > 0 && this.m_LastOutCard != null)
        {
          var showCard = []
          var Rlt = GameLogic.CompareCard(SelcetCard,this.m_LastOutCard.Shows,showCard)
          VisOutBtn = Rlt
        }
       
      }
      else
      {
          VisBuBtn = false
          var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
          this.SearchCardArr = GameLogic.SearchCardNull( HandCardData )
          this.SearchCardArrIndex = -1

          VisOutBtn = true
        let SelcetCard = this.m_CardMangerJs[0].getSelcetCardDataGDY();
        if( SelcetCard.length == 0 )
        {
          VisOutBtn = false
        }
        else
        {
            var Rlt = GameLogic.getCardType(SelcetCard)
           if( Rlt.Rlt == GDYCMD.CardType.CardType_Null )
           {
              VisOutBtn = false
           }

           var TotalCards = this.m_CardMangerJs[0].getHandCardDataGDY()
           if( SelcetCard.length == 1 && SelcetCard[0] < 100 )
           {
              if( TotalCards.length == 1 )
              {
                VisOutBtn = true
              }
              else
              {
                VisOutBtn = false
              }
           }
        }
      }

      this.m_GameJs.setOpLyaer(VisOp,VisBuBtn,VisTipBtn,VisOutBtn);
      this.nextAction();
    }
  },
  onCmd_gameStartGDY :  function(data)
  {
      let self = this;
      this.m_selfOut = null
      this.m_LastOutCard = null
      cc.log("收到 游戏开始消息",data);
      GamePlayer.setUserStatus(UserCenter.getUserID(),2);
      this._isplaying = true;
      //this.m_SaiZi = data["SaiZi"];
      this.m_LordSiteId = data["LordSeatId"];
      //this.m_YaoZhang = data["YaoZhang"];
      this.m_CardNum = data["CardNum"];
      this.m_HandCards = data["HandCards"];
      this.m_StartSeat = data["Seats"];
      this._currGame = data["CurrentQuan"];
      this.m_Countdown = data["Countdown"];
      this.m_RemainNum = data["TableLeftCardNum"];
      this.m_Score = data["Score"]
      this.m_GameJs.isGameStart  = true;
      this.updateJushu3();
      this.m_GameJs.setOpLyaer(false)
      this.danjunum = 1
      this.m_GameJs.setdanjuNum(this.danjunum)
      // this.m_GameJs.inviteBtn.active = false;
      this.m_GameJs.btntiqian.active = false;
      // var onRollDiceOver = function()
      // {
      //   for(let i=0; i < self.m_StartSeat.length; i++ )
      //   {
      //     let ChairId = self.getChairBySeatId(self.m_StartSeat[i].Seat)
      //     self.m_TianIndex[ChairId] = self.m_StartSeat[i].JiaWei;
      //   }
      //   for(let i = 0; i < self.m_TianIndex.length; i++ )
      //   {
      //     self.m_GameJs.setJia(i,true,self.m_TianIndex[i]);
      //   }

      //   cc.log("寨子完成，显示牌以及摇张")
      //   self.node.getComponent("gandengyanGame").setYaoZhang(true,self.m_YaoZhang[0],self.m_YaoZhang[1],self.m_YaoZhang[2])
      //   self.DistributeCards();
      //   self.m_GameJs.setRemainNum(true,self.m_RemainNum)

        
      // }
      // this.beginRollDice(this.m_SaiZi,onRollDiceOver)


      for(let i=0; i < this.m_StartSeat.length; i++)
      {
        var chair = this.getChairBySeatId(this.m_StartSeat[i].Seat);
        if( this.m_StartSeat[i].Seat == this.m_LordSiteId )
        {
           this.m_GameJs.setZhuangVisbile(chair,true)
        }
        else
        {
          this.m_GameJs.setZhuangVisbile(chair,false)
        }
        this.m_GameJs.setReady(chair,false);
      }
      this.m_GameJs.setRemainNum(true,this.m_RemainNum)
      self.DistributeCards();
      if(this.roomType == 2){
        var roomcontroller = this.m_GameJs.getComponent("CardRoomControllergdy")//this.addComponent("CardRoomController");
        roomcontroller.gameStart();
      }
  },
  onCmd_gameOverGDY : function(data)
  {
    cc.log("收到游戏结束消息 data=",data)
    this._isplaying = false
    GamePlayer.setUserStatus(UserCenter.getUserID(),0);
    this.m_GameJs.setOpLyaer(false);
    var Users = data.Users
    let self = this
    let GameResult = cc.instantiate(self.m_GameJs.GameResultGDY)
    let GameResultJs = GameResult.getComponent("GDYGameRlt");
    GameResult.parent = self.node.parent
    GameResult.setLocalZOrder(2000);
    GameResultJs.sendmessage(self);
    self.GameResult = GameResult
    this.m_GameJs.endAllClockGDY()
    this.m_GameJs.setnobig(false );
    var winchair = this.getChairBySeatId(data.WinSeatId )
    for( var i=0; i < Users.length; i++ )
    {
      var chair = this.getChairBySeatId(Users[i].SeatId)
      GameResultJs.setName(i,Users[i].Name)
      GameResultJs.setRemainNum(i,Users[i].Num)
      GameResultJs.setDifeng(i,this.m_Score)
      GameResultJs.setbeishu(i,Users[i].Multiple )
      GameResultJs.setdefeng(i,Users[i].SumScore )
      this.m_GameJs.setplayerScore(chair,Users[i].TotalScore);
      if( winchair == chair )
      {
        //GameResultJs.setwinflag(i,true)
      }
      if( chair == 0 )
      {
          GameResultJs.setflagbg( Users[i].SumScore >= 0 )
          GameResultJs.setwinflag(i,true)
      }
      this.m_GameJs.setPass(chair,false)
    }

    this.isAutoPlay = false
    this.m_GameJs.cancelAutoPlayEx();
    cc.log(this._currGame , this._totalGame)
    if(this.roomType != 2){
      this.nextAction();
    }else{
      if( this._currGame < this._totalGame )
      {//总局未完时才执行
        this.nextAction();
      }
      else
      {
        GameResultJs.setZhanjiVis(true)
      }
    }
  },
  onCmd_doOutGDY :function(data)
  {
    cc.log("用户出牌 data = ",data);
    let Chair = this.getChairBySeatId(data.SeatId );
    this.m_LastOutCard = data
    if( data.Shows == null )
    {
      this.m_LastOutCard.Shows = this.m_LastOutCard.Reals
    }
    cc.log("SeatId ={0}, Chair={1}".format(data.SeatId ,Chair))
    // for(let i = 0; i < PLAYER_NUM; i++)
    // {
    //   this.m_CardMangerJs[i].moveCurOutToOut();
    //   this.m_CardMangerJs[i].ShowXianCard(false,-1)
    // }

    //排序一下
    var Rlt = GameLogic.getCardType(data.Reals)
    data.Shows = Rlt.show

    if( Chair != 0 || this.m_selfOut != true)
    {
      this.m_selfOut = false
      this.m_CardMangerJs[Chair].removeOutCardGDY()
      this.m_CardMangerJs[Chair].removeHandCardGDY(data.Reals );//移除手牌
      this.m_CardMangerJs[Chair].addOutCardGDY(data.Reals );//显示出的牌
      this.m_GameJs.setPass(Chair ,false)
      this.m_GameJs.setnobig(false );
      this.m_GameJs.setOpLyaer(false);
      this.m_GameJs.endAllClockGDY()
       if( 0 == Chair )
       {
         var HandCardData = this.m_CardMangerJs[Chair].getHandCardDataGDY()
         this.m_CardMangerJs[Chair].removeAllHandCardGDY()
         GameLogic.SortCardByLogivValue(HandCardData)
         this.m_CardMangerJs[Chair].addHandCardsGDY(HandCardData);
       }
      //播放出牌动画
      if( data.Type >= GDYCMD.CardType.CardType_shunzi)
      {
        this.playAniGDY(Chair,data.Type);
      }
      //this.playAniGDY(Chair,30);
      //this.m_GameJs.setTaoHua(false)

      let player = this.m_GameJs.players[Chair];
     // this.soundCtrl.playoutcard(player.sex,data.Cid);

      switch( data.Type )
      {
        case GDYCMD.CardType.CardType_bomb3:   this.danjunum = this.danjunum * 2; break;
        case GDYCMD.CardType.CardType_bomb4:   this.danjunum = this.danjunum * 3; break;
        case GDYCMD.CardType.CardType_bomb5:   this.danjunum = this.danjunum * 4; break;
        case GDYCMD.CardType.CardType_bomb6:   this.danjunum = this.danjunum * 5; break;
        case GDYCMD.CardType.CardType_wangzha:   this.danjunum = this.danjunum * 10; break;
      }

      if ((this.m_GameJs.ruleFlag & 0x80) == 0x80) {
        if (this.danjunum > 6) {
          this.danjunum = 6;
        }
      } else if ((this.m_GameJs.ruleFlag & 0x100) == 0x100) {
        if (this.danjunum > 12) {
          this.danjunum = 12;
        }
      }
      this.m_GameJs.setdanjuNum(this.danjunum)
      this.soundCtrl.playoutcardGDY(player.sex,data.Type, GDYCardRes.getCardValue(data.Shows[0]) )
    }
    
    this.m_selfOut = false
    this.nextAction();
  },
  onCmd_re_cardGDY : function(data)
  {
    cc.log("收到理牌消息",data)
    this.m_RemainNum = data["Num"];
    this.m_GameJs.setRemainNum(true,this.m_RemainNum)
    this.nextAction();
  },
  onCmd_passGDY :function(data)
  {
    cc.log("收到用户过牌 data=",data)
    var Chair = this.getChairBySeatId(data.SeatId)
    this.m_GameJs.setPass(Chair ,true)
    this.m_GameJs.endAllClockGDY()
    this.m_GameJs.setnobig(false );
    this.nextAction();
  },
  onCmd_faPaiGDY:function(data)
  {
    cc.log("收到发牌消息 data = ",data)

    var Chair = this.getChairBySeatId(data.SeatId)

    if( Chair == 0 )
    {
      cc.log("_____________________________________自己新加的一张新牌: ",data.Cid)
       var HandCardData = this.m_CardMangerJs[Chair].getHandCardDataGDY()
       this.m_CardMangerJs[Chair].removeAllHandCardGDY()
       HandCardData.push(data.Cid)
       GameLogic.SortCardByLogivValue(HandCardData)
       this.m_CardMangerJs[Chair].addHandCardsGDY(HandCardData);
    }
    else
    {
      this.m_CardMangerJs[Chair].addHandCardsGDY([data.Cid])
    }

    for(var i=0 ; i < PLAYER_NUM; i++ )
    {
      this.m_CardMangerJs[i].removeOutCardGDY()
      this.m_GameJs.setPass(i ,false)
    }
    this.m_RemainNum -= 1;
    this.m_GameJs.setRemainNum(true,this.m_RemainNum)
    this.nextAction();
  },
  onCmd_turnGDY : function(data)
  {
    cc.log("收到 谁的回合",data)
    let self = this
    this.m_CurTurnChair = this.getChairBySeatId(data.SeatId)
    this.m_GameJs.endAllClockGDY()
    if(this.m_GameJs.isTime){
      this.m_GameJs.beginClockGDY(this.m_CurTurnChair,this.m_Countdown)
    }else{
      this.m_GameJs.hideClockGDY(this.m_CurTurnChair);
    }
    this.m_GameJs.setOpLyaer(false);
    this.m_CardMangerJs[this.m_CurTurnChair].removeOutCardGDY()
    this.m_GameJs.setPass(this.m_CurTurnChair ,false)
    
    if( this.m_LastOutCard && data.SeatId  == this.m_LastOutCard.SeatId  )
    {
      for(var i=0 ; i < PLAYER_NUM; i++ )
      {
        this.m_CardMangerJs[i].removeOutCardGDY()  
      }
      this.m_LastOutCard = null
    }



    cc.log("自己手牌 ：",this.m_CardMangerJs[0].getHandCardDataGDY())

    if( 0 == this.m_CurTurnChair )
    {
      if( this.m_LastOutCard != null )
      {
        var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
        this.SearchCardArr = GameLogic.SearchCard(HandCardData, this.m_LastOutCard.Shows, this.m_LastOutCard.Type)
        this.SearchCardArrIndex = -1
        if( this.SearchCardArr.length == 0 )
        {
          this.m_GameJs.endAllClockGDY()
        }
      }
    }
    // if( 0 == this.m_CurTurnChair )
    // {
    //   var VisBuBtn = false;
    //   var VisTipBtn = true;
    //   var VisOutBtn = false;
    //   var VisOp = true
    //   if( this.m_LastOutCard != null )
    //   {
    //     var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
    //     this.SearchCardArr = GameLogic.SearchCard(HandCardData, this.m_LastOutCard.Shows, this.m_LastOutCard.Type)
    //     this.SearchCardArrIndex = -1
    //     if( this.SearchCardArr.length == 0 )
    //     {
    //        VisOp = false
    //        self.m_GameJs.setnobig(true)
    //        this.scheduleOnce(function(){ self.m_GameJs.setnobig(false ); this.onClickPass() ; } , 0.3)

    //     }
    //     else
    //     {
            
    //     }
    //   }
    //   else
    //   {
    //       var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
    //       this.SearchCardArr = GameLogic.SearchCardNull( HandCardData )
    //       this.SearchCardArrIndex = -1
    //   }

    //   // VisBuBtn = true
    //   //       VisOutBtn = true
    //   //       VisTipBtn = true
    //   //       VisOp = true

    //   this.m_GameJs.setOpLyaer(VisOp,VisBuBtn,VisTipBtn,VisOutBtn);
    // }

    this.nextAction();

  },
  oncmd_reload_tableGDY : function(data)
  {
    cc.log("收到重连消息 data=",data)
    this.m_GameJs.isGameStart  = true;
    // this.m_GameJs.inviteBtn.active = false
    this._isplaying = true;
    this.LordSeatId = data.LordSeatId 
    this.m_Countdown = data.Countdown

    this.m_CurTurnChair = this.getChairBySeatId(data.CurrentSeatId )
    this.m_GameJs.endAllClockGDY()
    if(this.m_GameJs.isTime){
      this.m_GameJs.beginClockGDY(this.m_CurTurnChair,this.m_Countdown)
    }else{
      this.m_GameJs.hideClockGDY(this.m_CurTurnChair);
    }
    this.m_GameJs.setOpLyaer(false);
    if( this.m_CurTurnChair == 0 )
    {
      this.m_GameJs.setOpLyaer(true);
    }
    var chair = this.getChairBySeatId(this.LordSeatId)
    this.m_GameJs.setZhuangVisbile(chair,true)

    this.m_RemainNum = data.LeftCardNum
    this.m_GameJs.setRemainNum(true,this.m_RemainNum)

    this._currGame = data.CurrentQuan  || 0;
    this._totalGame = data.TotalQuan || 0;
    this.updateJushu3()

    this.danjunum = data.Multiple
    if ((this.m_GameJs.ruleFlag & 0x80) == 0x80) {
      if (this.danjunum > 6) {
        this.danjunum = 6;
      }
    } else if ((this.m_GameJs.ruleFlag & 0x100) == 0x100) {
      if (this.danjunum > 12) {
        this.danjunum = 12;
      }
    }
    this.m_GameJs.setdanjuNum(this.danjunum)

    this.m_Score = data.Score 
    for( var i=0; i < data.Seats.length; i++ )
    {
      var ReloadSeat = data.Seats[i]
      var chair = this.getChairBySeatId(ReloadSeat.SeatId)
      this.m_GameJs.setplayerScore(chair,ReloadSeat.TotalScore);
      if( ReloadSeat.op != null )
      {
        if( ReloadSeat.op.Type == 1 )//过
        {
          this.m_GameJs.setPass(chair,true)
        }
        else//出的牌
        {
          this.m_CardMangerJs[chair].addOutCardGDY(ReloadSeat.op.Card.Reals)
        }

        //var LastOutSeatIdClientId = this.getChairBySeatId(this.LastOutSeatId)
        if( data.LastOutSeatId == ReloadSeat.SeatId )
        {
          this.m_LastOutCard = ReloadSeat.op.Card
        }
      }

      if( this.m_CurTurnChair == chair)
      {
        this.m_GameJs.setPass(chair ,false)
        this.m_CardMangerJs[chair].removeOutCardGDY()
      }
      
      if( 0 == chair )
      {
        console.log("排序前的牌",ReloadSeat.HandCards)
        GameLogic.SortCardByLogivValue( ReloadSeat.HandCards )
        console.log("排序后的牌",ReloadSeat.HandCards)
        this.m_CardMangerJs[0].addHandCardsGDY( ReloadSeat.HandCards);
        this.isAutoPlay = ReloadSeat.Trusteeship
        true == ReloadSeat.Trusteeship ? this.m_GameJs.openAutoPlayEx() : this.m_GameJs.cancelAutoPlayEx();
      }
      else
      {
        for(var j=0; j < ReloadSeat.CardNum; j++)
        {
          this.m_CardMangerJs[chair].addHandCardsGDY([0]);
        }
      }
    }

    this.m_GameJs.setOpLyaer( false );
    if( this.m_CurTurnChair == 0  )
    {//搜索牌
        var VisBuBtn = false;
        var VisTipBtn = true;
        var VisOutBtn = false;
        var VisOp = true

        if( this.m_LastOutCard == null )
        {
          VisBuBtn =false;
          VisOutBtn =false;
          var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
          this.SearchCardArr = GameLogic.SearchCardNull( HandCardData )
          this.SearchCardArrIndex = -1
        }
        else
        {
          var HandCardData = this.m_CardMangerJs[0].getHandCardDataGDY()
          this.SearchCardArr = GameLogic.SearchCard(HandCardData, this.m_LastOutCard.Shows, this.m_LastOutCard.Type)
          this.SearchCardArrIndex = -1
          VisBuBtn = true
          if( this.SearchCardArr.length >= 1 )
          {
            //VisOutBtn = true
          }
          else
          {
            //this.m_GameJs.setnobig(false );
            VisOp = false
            if( this.isAutoPlay == false )
            {//未托管情况下自动过
              this.onClickPass()
            }
            
          }
        }
        this.m_GameJs.setOpLyaer(VisOp,VisBuBtn,VisTipBtn,VisOutBtn);

    }
    for(let i = 0; i < PLAYER_NUM;i++)
    {
      this.m_GameJs.setReady(i,false);
    }
    this.nextAction();
  },
  oncmd_trusteeshipGDY : function(data)
  {
      let self = this;
      cc.log("托管消息",data)
      if( self._isplaying == false )
      {
        cc.log("游戏已经结束了，不再托管")
        return;
      }
      let SeatId = self.getChairBySeatId(data.Seat)
      if( SeatId == 0 )
      {
        this.isAutoPlay = data.Trusteeship;
        if( this.isAutoPlay == true )
        {
          this.m_GameJs.openAutoPlayEx();
        }
        else
        {
          this.m_GameJs.cancelAutoPlayEx();
        }
      }
      this.nextAction();
  },
  oncmd_noticeGDY : function(data)
  {
    cc.log("收到通知 data",data)
    this.nextAction();
  },
  /**
   * 扩展协议
   */
  RCMD_Expend : function (data) 
  {
    return this.RCMD_ExpendGDY(data);
    cc.log('RCMD_Expend',data);
    var expend = data.data;
    if(expend.CMD == '0001'){
      showAlert(expend.tips);
    }
    else
    {
      var cmd=expend[0];
      cc.log(cmd);
      switch(cmd)
      {
        case yhwhCommand.yhwhCmd.RCMD_GAME_START:   this.onCmd_gameStart(expend[1]);  break;//游戏开始
        case yhwhCommand.yhwhCmd.RCMD_GAME_OVER :   this.onCmd_gameOver(expend[1]);   break;//游戏结束
        case yhwhCommand.yhwhCmd.RCMD_OUT:          this.onCmd_doOut(expend[1]);      break;//出牌
        case yhwhCommand.yhwhCmd.RCMD_EAT:          this.onCmd_doEat(expend[1]);      break;//吃牌
        case yhwhCommand.yhwhCmd.RCMD_GANG:         this.onCmd_doGang(expend[1]);     break;////杠牌
        case yhwhCommand.yhwhCmd.RCMD_PASS:         this.onCmd_pass(expend[1]);       break;//过
        case yhwhCommand.yhwhCmd.RCMD_SUPPLE_FLOWER:this.onCmd_doSuppleFlower(expend[1]); break;//补花
        case yhwhCommand.yhwhCmd.RCMD_FA_PAI:       this.onCmd_faPai(expend[1]);      break;//发牌  
        case yhwhCommand.yhwhCmd.RCMD_CHANGE:       this.onCmd_change(expend[1]);     break;//换牌
        case yhwhCommand.yhwhCmd.RCMD_TIP_FLOD:     this.onCmd_tip_flod(expend[1]);   break;//逃花提示
        case yhwhCommand.yhwhCmd.RCMD_TURN:         this.onCmd_turn(expend[1]);       break; //谁的回合
        case yhwhCommand.yhwhCmd.RCMD_TIP_FLOWER:   this.onCmd_tip_flower(expend[1]); break;//补花提示
        case yhwhCommand.yhwhCmd.RCMD_TIP_EAT :     this.onCmd_tip_eat(expend[1]);    break;//吃提示
        case yhwhCommand.yhwhCmd.RCMD_TIP_GANG:     this.onCmd_tip_gang(expend[1]);   break;//杠提示
        case yhwhCommand.yhwhCmd.RCMD_TIP_OUT :     this.onCmd_tip_out(expend[1]);    break;//出牌提示
        case yhwhCommand.yhwhCmd.RCMD_TIP_HU  :     this.onCmd_tip_hu(expend[1]);     break;//胡牌提示
        case yhwhCommand.yhwhCmd.RCMD_TIP_CHANGE:   this.oncmd_tip_change(expend[1]); break;//换牌提示
        case yhwhCommand.yhwhCmd.RCMD_RELOAD_TABLE: this.oncmd_reload_table(expend[1]);break;//重连
        case yhwhCommand.yhwhCmd.RCMD_TIP_SHOW:     this.oncmd_tip_show(expend[1]);   break; //献花提示
        case yhwhCommand.yhwhCmd.RCMD_SHOW:         this.oncmd_show(expend[1]);       break;////献花
        case yhwhCommand.yhwhCmd.RCMD_Trusteeship:  this.oncmd_trusteeship(expend[1]); break;//托管
        case yhwhCommand.yhwhCmd.RCMD_SHOW_CARD:    this.oncmd_showcard(expend[1]);     break;//展示公牌
        case yhwhCommand.yhwhCmd.RCMD_NOTICE:       this.oncmd_notice(expend[1]);     break;//系统提示
        default: cc.log("扩展协议找不到"); assert(false);
      }
    }
  },
  oncmd_showcard:function(data)
  {
      cc.log("收到展示公牌消息",data)
      this.m_GameJs.setshowCard(true,data.Cid);
      this.nextAction();
  },
  oncmd_notice:function(data)
  {
      cc.log("收到系统 提示消息",data)
      this.m_GameJs.setTest(true,data.msg);
      this.nextAction();
  },
  oncmd_tip_show:function(data)
  {
    cc.log("玉环挖花收到  献花提示",data)
    this.m_GameJs.setXianHua(true,data.Cid)
    this.nextAction();
  },
  oncmd_show:function(data)
  {
    cc.log("玉环挖花收到  献花",data)
    let SeatId = this.getChairBySeatId(data.SiteId)
    this.playEatCmdAnim(SeatId,yhwhCommand.OPT_CODE.optXianHua);
    let player = this.m_GameJs.players[SeatId];
    this.soundCtrl.playxianhua(player.sex);
    this.m_CardMangerJs[SeatId].moveCurOutToOut();
    this.m_CardMangerJs[SeatId].ShowXianCard(true,data.Cid)
    this.nextAction();
  },
  oncmd_trusteeship:function(data)
  {
    let self = this;
    cc.log("玉环挖花收到 托管消息",data)
    if( self._isplaying == false )
    {
      cc.log("游戏已经结束了，不再托管")
      return;
    }
    let SeatId = self.getChairBySeatId(data.Seat)
    if( SeatId == 0 )
    {
      this.isAutoPlay = data.Trusteeship;
      if( this.isAutoPlay == true )
      {
        this.m_GameJs.openAutoPlayEx();
      }
      else
      {
        this.m_GameJs.cancelAutoPlayEx();
      }
    }
    this.nextAction();
  },
  //重连
  oncmd_reload_table:function(data)
  {
    let self = this;
    cc.log("玉环挖花收到 游戏重连消息",data);
    this.m_YaoZhang = data.YaoZhang;
    this.m_RemainNum = data.LeftCardNum
    this.m_CurTurnChair = this.getChairBySeatId(data.CurrentSeatId)
    this._currGame = data.CurrentQuan;
    this._totalGame = data.TotalQuan;
    this.m_Countdown = data.Countdown;
    this.updateJushu2();
    this.m_GameJs.isGameStart  = true;
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(this.m_CurTurnChair,data.LeftTimeOut)
    self.node.getComponent("gandengyanGame").setYaoZhang(true,self.m_YaoZhang[0],self.m_YaoZhang[1],self.m_YaoZhang[2])
    self.m_GameJs.setRemainNum(true,self.m_RemainNum)

    for(let i=0; i < data.Seats.length; i++)
    {
      let Chair = self.getChairBySeatId(data.Seats[i].SeatId);
      self.m_TianIndex[Chair,data.Seats[i].JiaWei]
      this.m_GameJs.setJia(Chair,true,data.Seats[i].JiaWei)
      this.m_TianIndex[Chair] = data.Seats[i].JiaWei;
      if( 0 == Chair )
      {
        this.m_CardMangerJs[Chair].addHandCards(data.Seats[i].HandCards,true);
        this.reSortCardsPos();
      }
      else
      {
        for( let x = 0; x < data.Seats[i].CardNum; x++ )
        {
          this.m_CardMangerJs[Chair].addHandCard(-1,false);
        }
      }
      for(let x=0; x < data.Seats[i].OperatorCards.length; x++)
      {
        let Cards = data.Seats[i].OperatorCards[x];
        if( Cards.length == 2 )
        {
          this.m_CardMangerJs[Chair].addChiCard(Cards[0],Cards[1])
        }
        else
        {
          this.m_CardMangerJs[Chair].addGangCard(Cards[0],Cards[1])
        }
      }
      for(let x=0; x < data.Seats[i].OutCards.length; x++ )
      {
        this.m_CardMangerJs[Chair].addOutCard(data.Seats[i].OutCards[x]);
      }
      this.m_GameJs.setHuaNum(Chair,true,data.Seats[i].Flowers);
      if( 0 == Chair )
      {
        true == data.Seats[i].Trusteeship ? self.m_GameJs.openAutoPlayEx() : self.m_GameJs.cancelAutoPlayEx();
      }
    }
    this.nextAction();
  },
  //游戏开始
  onCmd_gameStart:function(data)
  {
      let self = this;
      cc.log("玉环挖花收到 游戏开始消息",data);
      this._isplaying = true;
      this.m_SaiZi = data["SaiZi"];
      this.m_LordSiteId = data["LordSiteId"];
      this.m_YaoZhang = data["YaoZhang"];
      this.m_CardNum = data["CardNum"];
      this.m_HandCards = data["HandCards"];
      this.m_StartSeat = data["Seats"];
      this._currGame = data["CurrentQuan"];
      this.m_Countdown = data["Countdown"];
      this.m_RemainNum = data["TableLeftCardNum"];
      this.m_GameJs.isGameStart  = true;
      this.updateJushu2();
      for(let i = 0; i < PLAYER_NUM;i++)
      {
        this.m_GameJs.setReady(i,false);
      }
      var onRollDiceOver = function()
      {
        for(let i=0; i < self.m_StartSeat.length; i++ )
        {
          let ChairId = self.getChairBySeatId(self.m_StartSeat[i].Seat)
          self.m_TianIndex[ChairId] = self.m_StartSeat[i].JiaWei;
        }
        for(let i = 0; i < self.m_TianIndex.length; i++ )
        {
          self.m_GameJs.setJia(i,true,self.m_TianIndex[i]);
        }

        cc.log("寨子完成，显示牌以及摇张")
        self.node.getComponent("gandengyanGame").setYaoZhang(true,self.m_YaoZhang[0],self.m_YaoZhang[1],self.m_YaoZhang[2])
        self.DistributeCards();
        self.m_GameJs.setRemainNum(true,self.m_RemainNum)

        
      }
      this.beginRollDice(this.m_SaiZi,onRollDiceOver)
      
      var roomcontroller = this.m_GameJs.getComponent("CardRoomControllergdy")//this.addComponent("CardRoomController");
      roomcontroller.gameStart();
  },
  //游戏结束
  onCmd_gameOver:function(data)
  {
    cc.log("玉环挖花收到 结算消息",data)
    cc.log("执行结算消息1 ")
    let self = this;
    self._isplaying = false;
    let GameResult = cc.instantiate(self.m_GameJs.GameResult)
    let GameResultJs = GameResult.getComponent("gandengyanGameResult");
    GameResult.parent = self.node.parent
    cc.log("执行结算消息2 ")
    let DetailVO = data.Users
    let Index = self.m_TianIndex;
    cc.log("执行结算消息3 ")
    cc.log("Index",Index);

    //将吃牌与普通牌分离
    var SortCardByChiHand = function(DetailVO,HuPai)
    {
      var Rlt = []
      var Rlt_Peng = []
      var Rlt_Hand_Double = []
      var Rlt_Hand_Single= []
      var Rlt_Hu =[]
      for(let x = 0; x < DetailVO.Scores.length; x++ )
      {
        var Cards=[]
        var score = null
        Cards = Cards.concat(DetailVO.Scores[x].Cards)
        score = DetailVO.Scores[x].score;
        if( ( Cards[0] && Cards[0] == HuPai) || ( Cards[1] && Cards[1] == HuPai ))
        {//是胡的那张牌
          Rlt_Hu.push({Cards,score})
        }
        else if( DetailVO.Scores[x].isHand == true )
        {
          if(Cards.length >= 2 )
          {
            Rlt_Hand_Double.push({Cards,score})
          }
          else
          {
            Rlt_Hand_Single.push({Cards,score})
          }
        }
        else
        {
          Rlt_Peng.push({Cards,score})
        }
      }
      return {Rlt_Peng,Rlt_Hand_Double,Rlt_Hand_Single,Rlt_Hu}
    }

    for(let i=0; i < DetailVO.length; i++)
    {
      let _ChairId = self.getChairBySeatId( DetailVO[i].SiteId )
      let JieWei = Index[_ChairId];//根据座位号取家位号
      let ChairId = JieWei-1; //根据家位顺序来取客户端结果显示的位置
      
      GameResultJs.setVisible(ChairId);
      GameResultJs.setJia(ChairId,JieWei)
      GameResultJs.setTaoHua(ChairId,false);
      GameResultJs.setHu(ChairId,false);
      GameResultJs.setName(ChairId, DetailVO[i].Name )
      GameResultJs.sethuaNum(ChairId, DetailVO[i].FlowerNum)
      GameResultJs.setdaoShu(ChairId,DetailVO[i].SumScore) //计算后的道数
      GameResultJs.settotalDaoShu(ChairId,DetailVO[i].LastScore)//总道数
      GameResultJs.setliang(ChairId,DetailVO[i].LastGold)
      GameResultJs.setyapo(ChairId,DetailVO[i].YaPo);
      GameResultJs.SetYePaotype(ChairId,DetailVO[i].YaPoType);
      GameResultJs.setBaoDao(ChairId,DetailVO[i].BaoScore);
      this.m_GameJs.setplayerScore(_ChairId,DetailVO[i].TotalScore);
      // for(let x = 0; x < DetailVO[i].Scores.length; x++ )
      // {
      //   GameResultJs.setCards(ChairId,DetailVO[i].Scores[x].Cards,DetailVO[i].Scores[x].score)
      // }
      var Rlt = null
      if( data.HuSiteId == DetailVO[i].SiteId )
      {//对于胡牌者要检索出对应的胡牌
        Rlt = SortCardByChiHand(DetailVO[i],data.HuZhang)
      }
      else
      {
        Rlt = SortCardByChiHand(DetailVO[i],-1)
      }
      
      for(let i=0; i < Rlt.Rlt_Peng.length; i++)
      {
        var Item = Rlt.Rlt_Peng[i]
        GameResultJs.setCards(ChairId,Item.Cards,Item.score,0,-1)
      }
      for(let i=0; i < Rlt.Rlt_Hand_Double.length; i++)
      {
        var Item = Rlt.Rlt_Hand_Double[i]
        GameResultJs.setCards(ChairId,Item.Cards,Item.score,20,-1)
      }
      for(let i=0; i < Rlt.Rlt_Hu.length; i++)
      {
        var Item = Rlt.Rlt_Hu[i]
        GameResultJs.setCards(ChairId,Item.Cards,Item.score,20,data.HuZhang)
      }
      for(let i=0; i < Rlt.Rlt_Hand_Single.length; i++)
      {
        var Item = Rlt.Rlt_Hand_Single[i]
        GameResultJs.setCards(ChairId,Item.Cards,Item.score,20,-1)
      }
    }
    if( -1 != data.HuSiteId )
    {
      //let HuChairId = self.getChairBySeatId(data.HuSiteId);
      let _ChairId = self.getChairBySeatId( data.HuSiteId )
      let JieWei = Index[_ChairId];//根据座位号取家位号
      let ChairId = JieWei-1; //根据家位顺序来取客户端结果显示的位置
      
      GameResultJs.setHu(ChairId,true);
      let player = this.m_GameJs.players[_ChairId];
      this.soundCtrl.playhu(player.sex);
    }
    if( -1 != data.FlodSiteId )
    {
      let _ChairId = self.getChairBySeatId( data.FlodSiteId )
      let JieWei = Index[_ChairId];//根据座位号取家位号
      let ChairId = JieWei-1; //根据家位顺序来取客户端结果显示的位置
      //let FlodChairId = self.getChairBySeatId(data.FlodSiteId);
      GameResultJs.setTaoHua(ChairId,true);
    }
    
    GameResultJs.setLeaveRoomBtnVisible( this._currGame >= this._totalGame )//总局数是否结束显示离开房间
    this.m_GameJs.cancelAutoPlayEx();
    this.m_GameJs.setTaoHua(false)
    cc.log("当前局数 {0}/{0}".format(this._currGame,this._totalGame));
    if( this._currGame < this._totalGame )
    {//总局未完时才执行
      this.nextAction();
    }
    
    cc.log("执行结算消息8")
  },
  //出牌提示
  onCmd_tip_out:function(data)
  {
    cc.log("玉环挖花收到 出牌提示",data);
    let TotalCards = data.EnableCards.concat(data.SendCards)
    this.m_CardMangerJs[0].setAllCardsTouchEnble(false)
    cc.log("设置提示牌完成");
    this.m_CardMangerJs[0].setCardsTouchEnble(TotalCards,true);
    this.m_CardMangerJs[0].setAllCardSend(false);
    this.m_CardMangerJs[0].setCardSend(data.SendCards,true);
    this.m_CardMangerJs[0].moveCurOutToOut();
    this.reSortCardsPos();
    this.m_GameJs.setTaoHuaBtnVisible(true);
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.m_OPStatus = OpStatus.OpStatus_OUT
    this.nextAction()

    
    // cc.log("玉环挖花收到 出牌提示",data);
    // let TotalCards = data.EnableCards.concat(data.SendCards)
    // let HandCardData = this.m_CardMangerJs[0].getHandCardDataButGet()
    // HandCardData = this.removeFromArr(TotalCards,HandCardData)
    // let HandCardData_Get = this.m_CardMangerJs[0].getHandCardData_Get();
    // this.m_CardMangerJs[0].removeAllCards_Hand()
    // if( HandCardData_Get != null )
    // {
    //   //HandCardData = this.removeFromArr([HandCardData_Get],HandCardData)
    //   this.m_CardMangerJs[0].addHandCard(HandCardData_Get,true,true)
    // }
    // let SortHandCardData = this.sortCard(HandCardData)
    // this.m_CardMangerJs[0].addHandCards(data.SendCards,true);
    // this.m_CardMangerJs[0].addHandCards(data.EnableCards,true);
    // this.m_CardMangerJs[0].addHandCards(SortHandCardData,false)
    // this.m_CardMangerJs[0].setAllCardSend(false);
    // this.m_CardMangerJs[0].setAllCardsTouchEnble(false)
    // this.m_CardMangerJs[0].setCardsTouchEnble(TotalCards,true);
    // this.m_CardMangerJs[0].setCardSend(data.SendCards,true);
    // this.m_CardMangerJs[0].moveCurOutToOut();

    // this.m_GameJs.setTaoHuaBtnVisible(true);
    // this.m_GameJs.endAllClock()
    // this.m_GameJs.beginClock(0,this.m_Countdown)
    // this.m_OPStatus = OpStatus.OpStatus_OUT
    // this.nextAction()
  },
  //出牌
  onCmd_doOut:function(data)
  {
    cc.log("玉环挖花收到 出牌消息",data)
    let Chair = this.getChairBySeatId(data.SiteId);

    cc.log("SiteId={0}, Chair={1}".format(data.SiteId,Chair))
    for(let i = 0; i < PLAYER_NUM; i++)
    {
      this.m_CardMangerJs[i].moveCurOutToOut();
      this.m_CardMangerJs[i].ShowXianCard(false,-1)
    }

    this.m_CardMangerJs[Chair].removeHandCard(data.Cid);//移除手牌
    this.m_CardMangerJs[Chair].addCurOutCard(data.Cid);//显示出的牌
    if( 0 == Chair )
    {
      this.m_CardMangerJs[Chair].moveGetCardToHand();
      this.m_CardMangerJs[Chair].setAllCardsTouchEnble(true)
      this.reSortCardsPos();
    }
    //播放出牌动画
    //this.playEatCmdAnim(Chair,yhwhCommand.OPT_CODE.optOut);
    this.m_GameJs.setTaoHua(false)

    let player = this.m_GameJs.players[Chair];
    this.soundCtrl.playoutcard(player.sex,data.Cid);
    
    this.nextAction();
  },
  //吃提示
  onCmd_tip_eat:function(data)
  {
    cc.log("玉环挖花收到 吃的提示",data)
    this.node.getComponent("gandengyanGame").setChiCard(true,data.Cards[0],data.Cards[1]);
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.m_OPStatus = OpStatus.OpStatus_EAT
    this.m_tip_EatCardArr = data.Cards
    this.nextAction()
  },
  //吃牌
  onCmd_doEat:function(data)
  {
    cc.log("玉环挖花收到 牌消息",data);
    let Chair = this.getChairBySeatId(data.SiteId);
    let Chair_Eat = this.getChairBySeatId(data.EatSiteId);

    cc.log("SiteId={0}, Chair={1}".format(data.SiteId,Chair))
    cc.log("Chair_Eat={0}, Chair_Eat={1}".format(data.EatSiteId,Chair_Eat))

    this.m_CardMangerJs[Chair].removeHandCard(data.CardId);//删除吃牌手牌
    this.m_CardMangerJs[Chair_Eat].removeOutCard(data.EatCardId);//删除被吃的牌
    this.m_CardMangerJs[Chair].addChiCard(data.CardId,data.EatCardId);//增加吃牌显示
    if( 0 == Chair )
    {//将新牌移至手牌堆中
      this.m_CardMangerJs[Chair].moveGetCardToHand();
      this.reSortCardsPos();
    }

    let player = this.m_GameJs.players[Chair];
    this.soundCtrl.playchi(player.sex);

    //播放吃牌动画
    this.playEatCmdAnim(Chair,yhwhCommand.OPT_CODE.optEat);
    this.m_GameJs.setTaoHua(false)
    this.nextAction();
  },
  //杠提示
  onCmd_tip_gang:function(data)
  {
    cc.log("玉环挖花收到 扛的提示",data)
    this.node.getComponent("gandengyanGame").setGangCard(true,data.Cards[0],data.Cards[1],data.Cards[2],data.CanPass);//设置杠牌提示

    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.m_OPStatus = OpStatus.OpStatus_GANG
    this.m_tip_GangCardArr = data.Cards
    this.nextAction()
  },
  //杠牌
  onCmd_doGang:function(data)
  {
    cc.log("玉环挖花收到 杠牌消息",data);
    let Chair     = this.getChairBySeatId(data.SiteId);
    let Chair_Gang = this.getChairBySeatId(data.GangSiteId) 

    cc.log("SiteId={0}, Chair={1}".format(data.SiteId,Chair))
    cc.log("GangSiteId={0}, Chair_Gang={1}".format(data.GangSiteId,Chair_Gang))

    cc.log("转换后的Chair={0}",Chair);
    // this.m_CardMangerJs[Chair].removeHandCard(data.Cards[0]);//扛牌操作，删除 手牌
    // this.m_CardMangerJs[Chair].removeHandCard(data.Cards[1]);//扛牌操作，删除 手牌

    // this.m_CardMangerJs[Chair_Gang].removeOutCard(data.GangCardId);//移除被扛者的牌
    // this.m_CardMangerJs[Chair].addGangCard(data.Cards[0],data.Cards[1]);//显示扛牌
    if( Chair === Chair_Gang )
    {//自扛
      
      cc.log("走自扛流程 {0} {1}".format(data.Cards[0],data.Cards[1]));
      let Cards = data.Cards.slice()
      for(let i = 0; i < Cards.length; i++ )
      {
        if( Cards[i] == data.GangCardId )
        {
          Cards.splice(i,1)
          break;
        }
      }
      cc.log("余下的牌",Cards)
      cc.log("吃碰的牌",this.m_CardMangerJs[Chair].getChiPengCardData())
      let bExist = this.IsExistInArr(Cards,this.m_CardMangerJs[Chair].getChiPengCardData())
      if( false == bExist )
      {//扛手牌区
          cc.log("从自己手牌中加扛")
          this.m_CardMangerJs[Chair].removeHandCard(data.Cards[0]);//扛牌操作，删除 手牌
          this.m_CardMangerJs[Chair].removeHandCard(data.Cards[1]);//扛牌操作，删除 手牌
          this.m_CardMangerJs[Chair].removeHandCard(data.Cards[2]);//扛牌操作，删除 手牌
          this.m_CardMangerJs[Chair].addGangCard(data.Cards[0],data.Cards[1]);//显示扛牌
      }
      else
      {//扛吃牌区
          cc.log("从自己吃牌中加扛")
          let CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[0]);
          if( CardNode == null )
          {
            CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[1]);
          }
          if( CardNode == null )
          {
            cc.log(this.m_CardMangerJs[Chair].getChePengCardData())
          }
          this.m_CardMangerJs[Chair].addGangCardEx(data.GangCardId,CardNode);
          this.m_CardMangerJs[Chair].removeHandCard(data.GangCardId);//移除自己的牌
      }
    }
    else
    {//他扛
      let Cards = data.Cards.slice()
      for(let i = 0; i < Cards.length; i++ )
      {
        if( Cards[i] == data.GangCardId )
        {
          Cards.splice(i,1)
          break;
        }
      }
      cc.log("走他扛流程 {0} {1}".format( Cards[0], Cards[1]));
      if( Chair == 0 )
      {//扛牌者为自己
          cc.log("扛牌者为自己")
          let bExist = this.IsExistInArr(Cards,this.m_CardMangerJs[Chair].getHandCardData())
          if( true == bExist )
          {//从手牌中取扛
              cc.log("从自己手牌中取扛")
              this.m_CardMangerJs[Chair].removeHandCard(Cards[0]);//扛牌操作，删除 手牌
              this.m_CardMangerJs[Chair].removeHandCard(Cards[1]);//扛牌操作，删除 手牌
              this.m_CardMangerJs[Chair_Gang].removeOutCard(data.GangCardId);//移除被扛者的牌
              this.m_CardMangerJs[Chair].addGangCard(data.Cards[0],data.Cards[1]);//显示扛牌
          }
          else
          {
              cc.log("从自己吃牌中加扛")
              let CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[0]);
              if( CardNode == null )
              {
                CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[1]);
              }
              if( CardNode == null )
              {
                cc.log(this.m_CardMangerJs[Chair].getChePengCardData())
              }
              this.m_CardMangerJs[Chair].addGangCardEx(data.GangCardId,CardNode);
              this.m_CardMangerJs[Chair_Gang].removeOutCard(data.GangCardId);//移除被扛者的牌
          }
          this.reSortCardsPos();
        }
      else
      {//扛牌者不为自己
          cc.log("扛牌者不为自己")
          let bExist = this.IsExistInArr(Cards,this.m_CardMangerJs[Chair].getChiPengCardData())
          if( true == bExist )
          {
              cc.log("从扛牌者吃牌中取扛")
              let CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[0]);
              if( CardNode == null )
              {
                CardNode = this.m_CardMangerJs[Chair].getCardFromChePengCard(Cards[1]);
              }
              this.m_CardMangerJs[Chair].addGangCardEx(data.GangCardId,CardNode);
              this.m_CardMangerJs[Chair_Gang].removeOutCard(data.GangCardId);//移除被扛者的牌
          }
          else
          {
              cc.log("从扛牌者手牌中取扛")
              this.m_CardMangerJs[Chair].removeHandCard(Cards[0]);//扛牌操作，删除 手牌
              this.m_CardMangerJs[Chair].removeHandCard(Cards[1]);//扛牌操作，删除 手牌
              this.m_CardMangerJs[Chair_Gang].removeOutCard(data.GangCardId);//移除被扛者的牌
              this.m_CardMangerJs[Chair].addGangCard(data.Cards[0],data.Cards[1]);//显示扛牌
          }
      }
    }

    if( 0 == Chair )
    {//将新牌移至手牌堆中
      this.m_CardMangerJs[Chair].moveGetCardToHand();
    }

    let player = this.m_GameJs.players[Chair];
    this.soundCtrl.playgang(player.sex);

    this.m_GameJs.setTaoHua(false)
    //播放扛牌动画
    this.playEatCmdAnim(Chair,yhwhCommand.OPT_CODE.optBar);
    this.nextAction();
  },
  //过
  onCmd_pass:function(data)
  {
    cc.log("玉环挖花收到 过消息",data)
    // let Chair = this.getChairBySeatId(data.SiteId);
    // cc.log("转换后的Chair={0}",Chair);
    // if( Chair == 0 )
    // {//不管是逃花还是吃扛选择过，一定要隐藏这些按扭
    //   this.node.getComponent("gandengyanGame").setTaoHua(false);
    // }
    this.node.getComponent("gandengyanGame").setTaoHua(false);
    this.nextAction();
  },
  //补花提示
  onCmd_tip_flower:function(data)
  {
    cc.log("玉环挖花收到 补花提示",data)
    this.m_tip_flowerCard = data.Cid;
    this.node.getComponent("gandengyanGame").setFlower(true,data.Cid);//界面显示补花按扭
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.m_OPStatus = OpStatus.OpStatus_FLOWER
    this.nextAction()
  },
  //补花
  onCmd_doSuppleFlower:function(data)
  {
    cc.log("玉环挖花收到  补花",data)

    let Chair = this.getChairBySeatId(data.SiteId)
    let player = this.m_GameJs.players[Chair];
    cc.log("SiteId={0}, Chair={1}".format(data.SiteId,Chair))
    cc.log("转换后的Chair={0}",Chair);
    if( Chair == 0 && this.m_tip_flowerCard == null)
    {
      assert(this.m_tip_flowerCard != null,"自己补花，但却找不到补花牌");
    }
    this.m_CardMangerJs[Chair].removeHandCard(data.Cid);//移除花
    this.m_CardMangerJs[Chair].ShowFlower(true,data.Cid)
    this.m_tip_flowerCard = null;
    this.m_flowerNum[Chair] = this.m_flowerNum[Chair] + 1;
    this.m_GameJs.setHuaNum(Chair,true,this.m_flowerNum[Chair]);
    this.m_GameJs.setTaoHua(false)

    if( Chair ==0 )
    {
      this.reSortCardsPos();
    }
    //播放补花动画
    this.playEatCmdAnim(Chair,yhwhCommand.OPT_CODE.optSupply);
    this.soundCtrl.playbuhua(player.sex);
    this.nextAction();
  },
  onCmd_tip_hu:function(data)
  {
    cc.log("玉环挖花收到 胡提示",data)
    this.m_OPStatus = OpStatus.OpStatus_HU
    this.node.getComponent("gandengyanGame").setHu(true,data.CanPass,data.PairCards[0],data.PairCards[1],data.SingleCard);
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.nextAction();
  },
  onCmd_change:function(data)
  {
    cc.log("玉环挖花收到 换牌",data)
    let Chair = this.getChairBySeatId(data.ChiSiteId)
    let Chair_Change = this.getChairBySeatId(data.ChangeSiteId)
    cc.log("SiteId={0}, Chair={1}".format(data.ChiSiteId,Chair))
    cc.log("ChangeSiteId={0}, Chair_Change={1}".format(data.ChangeSiteId,Chair_Change))

    if( Chair == Chair_Change )
    {//自己换自己
      //从自己吃扛堆中查出换牌再将图片换为新牌
      cc.log("自己换自己的牌")
      let CardJs = this.m_CardMangerJs[Chair].getCardFromChePengCard(data.ChiCardId).getComponent("gandengyanCard")
      CardJs.ChangeCardFrameByCardData_Chi(Chair,data.ChangeCardId);

      //从自己手牌中查出换牌再将图片换为新牌
      let CardJs1 = this.m_CardMangerJs[Chair].getCardByCardData(data.ChangeCardId).getComponent("gandengyanCard");
      CardJs1.setCardData(data.ChiCardId)
      CardJs1.ChangeCardFrameByCardData_Hand(Chair,data.ChiCardId)
    }
    else
    {//换别人
      
      cc.log("换别人的牌")
      //let CardJs = this.m_CardMangerJs[Chair_Change].getCardJsFromOutCard(data.ChangeCardId)
      //CardJs.ChangeCardFrameByCardData_Out(Chair_Change,data.ChiCardId);
      //从别人出牌堆中移除牌
      this.m_CardMangerJs[Chair_Change].removeOutCard(data.ChangeCardId)

      //从自己吃扛牌中查出换牌再将图片换为新牌
      let CardJs1 = this.m_CardMangerJs[Chair].getCardFromChePengCard(data.ChiCardId).getComponent("gandengyanCard");
      CardJs1.setCardData(data.ChangeCardId)
      CardJs1.ChangeCardFrameByCardData_Chi(Chair,data.ChangeCardId)
      this.m_CardMangerJs[Chair].addHandCard(data.ChiCardId,false,true)
    }

    this.m_GameJs.setTaoHua(false)
    this.nextAction();
  },
  oncmd_tip_change:function(data)
  {
    cc.log("玉环挖花收到 换牌提示",data)
    this.m_OPStatus = OpStatus.OpStatus_HUAN
    this.node.getComponent("gandengyanGame").setHuan(true,data.CanPass,data.OldCards[0],data.OldCards[1],data.NewCards[0],data.NewCards[1])
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.nextAction()
  },
  //发一张新牌
  onCmd_faPai:function(data)
  {
    cc.log("玉环挖花收到 发牌消息",data);
    let Chair = this.getChairBySeatId(data.SiteId)
    cc.log("转换后的Chair={0}",Chair);
    
    if( 0 == Chair )
    {
      let HandCardData = this.m_CardMangerJs[Chair].getHandCardData()
      let SortHandCardData = this.sortCard(HandCardData)
      this.m_CardMangerJs[Chair].removeAllCards_Hand()
      this.m_CardMangerJs[Chair].addHandCards(SortHandCardData,true)
      this.m_CardMangerJs[Chair].addHandCard(data.Cid,true,true);
    }
    else
    {
      this.m_CardMangerJs[Chair].moveGetCardToHand();
      this.m_CardMangerJs[Chair].addHandCard(data.Cid,true,true);
    }
    
    this.m_RemainNum -= 1;
    this.m_GameJs.setRemainNum(true,this.m_RemainNum)

    this.nextAction();
  },
  //逃花提示
  onCmd_tip_flod:function(data)
  {
    cc.log("玉环挖花收到 逃花提示")
    //显示 逃花 过按扭
    this.m_OPStatus = OpStatus.OpStatus_FLOD
    this.node.getComponent("gandengyanGame").setTaoHua(true)
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(0,this.m_Countdown)
    this.nextAction()
  },
  //谁的回合
  onCmd_turn:function(data)
  {
    cc.log("玉环挖花收到 谁的回合",data)
    this.m_CurTurnChair = this.getChairBySeatId(data.SiteId)
    this.m_GameJs.endAllClock()
    this.m_GameJs.beginClock(this.m_CurTurnChair,this.m_Countdown)
    if( 0 != this.m_CurTurnChair )
    {
      this.m_GameJs.setTaoHuaBtnVisible(false);
    }
    this.nextAction();
  },
  
  //摇塞子
  beginRollDice:function(SaiZi,callback)
  {
    let self = this;
      var DiceCallBack1 = function()
      {
        cc.log("第二轮寨子出来")
        self.rollDice(SaiZi[2],-1,null);
        self.rollDice(SaiZi[3],1,callback);
      }

      this.rollDice(SaiZi[0],-1,null);
      this.rollDice(SaiZi[1],1,DiceCallBack1);
  },
  //起手分发牌
  DistributeCards:function()
  {
      //let SortHands = this.sortCard(this.m_HandCards)
      GameLogic.SortCardByLogivValue(this.m_HandCards)
      let SortHands = this.m_HandCards
      this.m_CardMangerJs[0].addHandCardsGDY(SortHands);
      for(let i=0; i < this.m_StartSeat.length; i++)
      {
        let ChairId = this.getChairBySeatId(this.m_StartSeat[i].Seat);
        if( 0 != ChairId )
        {
          for( let x = 0; x < this.m_CardNum; x++ )
          {
            this.m_CardMangerJs[ChairId].addHandCardsGDY([0]);
          }
          if( this.m_StartSeat[i].Seat == this.m_LordSiteId )
          {
            this.m_CardMangerJs[ChairId].addHandCardsGDY([0]);
          }
        }
      }
      cc.log("发牌完成")
      this.nextAction();
  },


  //起手发牌
  onCmdDistribute : function (chair,count,values) {
    let self = this;

    values = values || [];
    while (values.length < count)
    {
      values.push(255);
    }

    var hasNextAction  = false;
    ///this.schedule(this.scheduleDistribute,0.4);
    this.schedule(function ()
    {
      let len = values.length == 5 ? 5 : 4;
      let cards = values.splice(0,len);
      self.dealStepCards(chair,cards);
      if(values.length == 0 && chair == 0 && !hasNextAction)
      {
          hasNextAction = true;
          this.scheduleOnce(function () 
          {
              for(let i=0; i < self._renders.length; i++)
              {
                  let render = self._renders[i];
                  render.freshHandCardsPos();
              }
              self.nextAction();
          },0.5);
      }
      else if(chair == 0)
      {
          this.soundCtrl.playFapai();
      }
    },0.4,4);
  },
  //发步处理发牌
  dealStepCards : function (chair,values) 
  {
    // let render = this._renders[chair];
    // let self = this;
    // values.forEach(function (value) {
    //   render.onCmdDistribute(value);
    // });
    // 发牌完成
    if( chair < 0 || chair > PLAYER_NUM )
    {
      assert(true,"发牌座位号出错");
      return;
    }
    //this.m_CardMangerJs[chair].addHandCards(values);
  },

  gameStart:function(masterid,baseMoney){
    this.resetGame();
    this._isplaying = true;
    let chair = this.getChairByUid(masterid);
    this.showPosition(chair);

    this.reInitGame();
  },

  onCmdOpCode : function (opcode) {
    let bShow = (opcode & (RCMD_ACTION.optHu | RCMD_ACTION.optHit | RCMD_ACTION.optEat | RCMD_ACTION.optBar));
    if(bShow){
      this.showToolBar(opcode);
    }else {
      this.hideToolBar();
    }
    this.nextAction();
  },

  // 摇散子
  doCmdRunTou : function (userid,data) {
    var ida  = data.ida;
    var idb  = data.idb;
    this.rollDice(ida,-1);
    this.rollDice(idb,1);
  },

  /**
   * 玩家出牌
   * @param chair
   * @param data
   *  pai : 出的牌
   *  ipos ： 出牌位置
   */
  onCmdOutPai : function (chair,data) {
    this.lastOutPai = data.pai;
    let ipos = data.ipos;
    this._renders[chair].onCmdOutPai(this.lastOutPai,ipos);

    // 复牌自己出牌
    if(this.roomType > 10 && chair == 0){
      var index = this._renders[0].findCardValueIndex(this.lastOutPai);
      var cards = this._renders[0]._hands.getMJCards();
      var card = cards[index];
      this._renders[0].dealLocalOutCard(card,this.lastOutPai,index);
    }
    this.showBigOutCard(chair,data.pai);
  },

  /**
   * 播放出牌声音
   * @param sex
   * @param pai
   */
  playOutSound : function (chair,sex,pai) {
    this.soundCtrl.playPai(sex,pai,chair,this.isPiaoCai(chair,pai));
  },

  isPiaoCai : function (chair,pai) {
    return this.isBD(pai);
  },

  /**
   * 吃碰杠操作
   * @param chair
   * @param opCode
   * @param data
   */
  onCmdEatAction : function (chair,opCode,data) {
    let dir = this.getChairByUid(this.lastPlayId);
    switch (opCode){
      case RCMD_ACTION.optHit:
        this._renders[chair].dealHitCards(this.lastOutPai,opCode,data.dA,data.dB,dir);
        break;
      case RCMD_ACTION.optEat:
        let flag = EATFLAG.EAT_LEFT;
        let pai1 = data.paiA;
        let pai2 = data.paiB;

        if(this.blockToValue(pai1) < this.blockToValue(this.lastOutPai)){
          flag += 1;
        }

        if(this.blockToValue(pai2) < this.blockToValue(this.lastOutPai)){
          flag += 1;
        }
        if(this.blockToValue(pai1) > this.blockToValue(pai2)){
          pai1 = data.paiB;
          pai2 = data.paiA;
        }
        this._renders[chair].dealEatCards(this.lastOutPai,flag,pai1,pai2,data.dA,data.dB,dir);
        break;
      case RCMD_ACTION.optBar:
        this._renders[chair].dealBarCards(this.lastOutPai,opCode,data,dir);
        break;
    }
    if(opCode != RCMD_ACTION.optBar || data.style == 0){
      this.removeLastCardEHB();
    }
    this.playEatCmdAnim(chair,opCode);
    //this.nextAction();
  },

  playEatCmdSound : function (chair,sex,opcode) {
    this.soundCtrl.playEatCmd(sex,opcode,chair);
  },
  
  /**
   * 胡
   * @param userid
   * @param data
   */
  onCmdHuAction : function (userid,data) {
    let users = data.users;
    for(let i = 0; i < users.length; i++){
      let user = users[i];
      let chair = this.getChairByUid(user.userid);
      let end = user.pais.length-1;
      if(user.pais.length % 3 == 2 ){
        end -= 1;
      }
      this.sortPaisByBD(user.pais,0,end);
      this._renders[chair].onCmdHu(user.pais);
        user.flowers = this._renders[chair]._flowers.tovalue();
        user.blockPais = this._renders[chair].blockPais;
    }
    this.huResult = {
      userid : userid,
      data   : data
    }
    this.playEatCmdAnim(this.getChairByUid(userid),RCMD_ACTION.optHu);
    //this.nextAction();
  },
  
  onCmdRecordHu : function (userid,data) {
    var pai = data.pai;
    if(MJType.invalidPai(pai)){  // 胡牌
      var chair = this.getChairByUid(userid);
      var user = GamePlayer.getPlayer(userid);
      var hands = this._renders[chair]._hands.getMJCards();
      var bNotZimo = false;
      if(hands.length % 3 == 1){  // 点炮胡
        bNotZimo = true;
        this._renders[chair].onCmdGetPai(pai);
      }
      this.playEatCmdAnim(chair,RCMD_ACTION.optHu);
      this.playHuSound(chair,user.sex,bNotZimo);

      // 处理胡数据
      var huData = {};
      huData.dwhu = data.dwhu;
      huData.userid = userid;
      huData.hutype1 = data.hutype1;
      huData.hutype2 = data.hutype2;
      huData.users = [];

      //PLAYER_NUM
     // var len = this._renders.length;
      var players = GamePlayer.players;
      for(var usrid in players){   // 构造胡数据
        var chr = this.getChairByUid(usrid);
        var user = {};
        user.userid = usrid;
        user.pais = this._renders[chr]._hands.tovalue();
        user.flowers = this._renders[chr]._flowers.tovalue();
        user.blockPais = this._renders[chr].blockPais;
        huData.users.push(user);
      }

      this.huResult = {
        userid : userid,
        data   : huData
      };

    }else { // 流局
      this.playEatCmdAnim(0,RCMD_ACTION.optAnsHu);
      this.playMissCarry();
    }

  },

  /**
   * 播放胡声音
   */
  playHuSound : function (chair,sex,bNotZimo,huflag,hutype) {
    this.soundCtrl.playHu(sex,bNotZimo,chair,huflag,hutype);
  },
  /**
   * 摸牌
   * @param chair
   * @param data
   *  摸牌操作
   */
  onCmdGetPai : function (chair,data) {
    this._renders[chair].onCmdGetPai(data.pai)
    this.nextAction();
  },

  /**
   * 补牌
   * @param chair
   * @param data
   */
  onCmdGetSupply : function (chair,data) {
    let pai = data.pai;
    let fpai = data.fpai || 0;
    if(fpai){  // 补花
      this._renders[chair].onCmdSupply(pai,fpai);
    }else{ // 补牌
      this._renders[chair].onCmdGetPai(data.pai);
    }
    //this.nextAction();
  },

  removeLastCardEHB : function () {
    let chair = this.getChairByUid(this.lastPlayId);
    this._renders[chair].removeLastOutCard();
    this.hideOutTips();
  },
  /**
   * 显示方位
   * @param chair
   * @param time
   */
  activePosition : function (userid,time) {
    cc.log("显示方位")
    let chair = this.getChairByUid(userid);
    if(!!this._position){
      this._position.active(chair,time);
    }

  },
  
  rollDice : function (point,dir,callback) {
    let self = this;
    var url = 'game/mahjong/mah/texture/dice';
    cc.loader.loadRes(url,cc.SpriteAtlas,function (err,atlas) {
      if(err){
        cc.log(err);
        self.nextAction();
        return;
      }

      var dice = new cc.Node().addComponent(cc.Sprite);
      dice.node.parent = self.node

      var x = cc.winSize.width / 2 + dir * 60;
      var y = cc.winSize.height / 2 + 80;
      dice.node.setPosition(x,y);
      var frames = atlas.getSpriteFrames();

      let cb = function (node,idx) {
        if(!!frames[idx]){
          dice.spriteFrame = frames[idx];
        }else {
          dice.node.removeFromParent(true);
          if(callback)
          {
            callback();
          }
          // if(1 == dir){
          //   self.nextAction();
          // }
        }
      }

      var delayTime = 0.1;
      self.soundCtrl.playDice();

      dice.node.runAction(
          cc.sequence(
              cc.delayTime(0.01),
              cc.callFunc(cb,dice,1),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,2),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,3),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,4),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,5),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,6),
              cc.delayTime(delayTime),
              cc.callFunc(cb,dice,(point - 1)*4),
              cc.delayTime(0.5),
              cc.callFunc(cb,dice,24)
          )
      );

    });
  },

  /**
   *  显示方位
   */
  showPosition : function (chair) {
    // if(!this._position){
    //   let self = this;
    //   cc.loader.loadRes('game/mahjong/mah/prefab/position/position',cc.Prefab,function (err,prefab) {
    //     if(err){
    //       cc.log(err);
    //       return;
    //     }

    //     let position = cc.instantiate(prefab);
    //     position.x = cc.winSize.width / 2;
    //     position.y = cc.winSize.height / 2 + 50;
    //     if(cc.sys.platform == cc.sys.IPAD){   // ipad
    //       position.x += 150;
    //     }
    //     position.parent = self.node;
    //     self._position = position.getComponent('Position');
    //     self._position.initUI(chair);

    //     //目前暂时不显示方位
    //     self._position.node.active = false;

    //   });
    // }else{
    //   this._position.node.active = true;
    //   this._position.initUI(chair);

    //   //目前暂时不显示方位
    //   this._position.node.active = false;
    // }
  },

  hidePosition : function () {
    if(!!this._position){
      this._position.node.active = false;
    }
  },

  setTouchEvent : function () 
  {
      this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
      this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
      this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
  },
  onTouchStart:function(event)
  {
      let touches = event.getTouches();
      let touchLoc = touches[0].getLocation();
      this.touchbeginpos = {x:touchLoc.x,y:touchLoc.y}
      cc.log("onTouchStart",touchLoc.x,touchLoc.y);
      if( touchLoc.y > 200 )
      {
        return;
      }
      this.m_CardMangerJs[0].onTouchStartGDY(this.touchbeginpos,this.touchbeginpos)
  },
  onTouchMove:function(event)
  {
      let touches = event.getTouches();
      let touchLoc = touches[0].getLocation();
      this.touchendpos =  {x:touchLoc.x,y:touchLoc.y}
      cc.log("onTouchMove",touchLoc.x,touchLoc.y);
      if( touchLoc.y > 200 )
      {
        return;
      }
      this.m_CardMangerJs[0].onTouchMoveGDY(this.touchbeginpos,this.touchendpos)
  },
  onTouchEnd:function(event)
  {
      let touches = event.getTouches();
      let touchLoc = touches[0].getLocation();
      this.touchendpos =  {x:touchLoc.x,y:touchLoc.y}
      if( touchLoc.y > 200 )
      {
        this.onNottochcard()
        return;
      }
      this.m_CardMangerJs[0].onTouchEndGDY(this.touchbeginpos,this.touchendpos)

      if( this.m_CurTurnChair != 0 )
      {
        return
      }

      let SelcetCard = this.m_CardMangerJs[0].getSelcetCardDataGDY();
      if( SelcetCard.length == 0 )
      {
        cc.log("未选择牌");
        this.m_GameJs.setChuPaiBtn(false)
        return;
      }

      var VisBuBtn = false;
      var VisTipBtn = true;
      var VisOutBtn = false;
      var VisOp = true

      if( this.m_LastOutCard != null )
      {
        var showCard = []
         var Rlt = GameLogic.CompareCard(SelcetCard,this.m_LastOutCard.Shows,showCard)
         if( Rlt == true )
         {
           VisOutBtn = true
         }
         VisBuBtn = true

        if( this.SearchCardArr.length == 0 )
        {
          VisOp = false
          cc.log("没有大过的牌所以此时不显示任何按扭")
        }
      }
      else
      {
         VisOutBtn = true 
         var Rlt = GameLogic.getCardType(SelcetCard)
         if( Rlt.Rlt == GDYCMD.CardType.CardType_Null )
         {
            VisOutBtn = false
         }

         var TotalCards = this.m_CardMangerJs[0].getHandCardDataGDY()
         if( SelcetCard.length == 1 && SelcetCard[0] < 100 )
         {
            if( TotalCards.length == 1 )
            {
              VisOutBtn = true
            }
            else
            {
              VisOutBtn = false
            }
         }
      }

      


      this.m_GameJs.setOpLyaer(VisOp,VisBuBtn,VisTipBtn,VisOutBtn)
      // let SelcetCard = this.m_CardMangerJs[0].getSelcetCardDataGDY();
      // if( SelcetCard == null )
      // {
      //   cc.log("未选择牌");
      //   return;
      // }
      // cc.log("SelcetCard=",SelcetCard);
      // this.onSelfOutCard(SelcetCard)
  },
  onNottochcard:function()
  {
    this.m_CardMangerJs[0].setAllCardsSelete()
    // this.m_GameJs.roommenu.active = false
  },
  onSelfOutCard:function(SelcetCard,showCard)
  { 
    if( SelcetCard == null )
    {
      cc.log("选择的牌为空");
      return;
    }
    if( this.m_CurTurnChair != 0 )
    {
      cc.log("没轮到自己出牌呢")
      return
    }
    // if( this.m_OPStatus != OpStatus.OpStatus_OUT)
    // {
    //   cc.log("当前不是出牌状态")
    //   return;
    // }
    let CardData = SelcetCard;
    cc.log("自己出牌了 {0}".format(CardData));

    var Rlt = GameLogic.getCardType(CardData)
    if( showCard != null && showCard.length > 0 )
    {
      Rlt.show = showCard
    }
    this.sendOutCardGDY(Rlt.show,CardData,Rlt.Rlt);
    this.m_CurTurnChair = -1;
  },


  // 熟牌遮罩
  setCardTipTag : function (value) {
    for(var i = 0; i < 4; i++){
      var outs = this._renders[i]._outs.getMJCards();
      outs.forEach(function (card) {
        if(card.getValue() == value){
          card.setTipTag(i,true);
        }else{
          card.hitTipTag();
        }
      });

      var blocks = this._renders[i]._blocks.getMJCards();
      blocks.forEach(function (card) {
        if(card.getValue() == value){
          card.setTipTag(i,true);
        }else{
          card.hitTipTag();
        }
      });
    }
  },

  // 清理遮罩
  clearCardTipTag : function () {
    for(var i = 0; i < 4; i++){
      var outs = this._renders[i]._outs.getMJCards();
      outs.forEach(function (card) {
        card.hitTipTag();
      });

      var blocks = this._renders[i]._blocks.getMJCards();
      blocks.forEach(function (card) {
        card.hitTipTag();
      });
    }
  },

  // 自己出牌
  dealOutCard : function (card,value,index) 
  {
      cc.log('dealOutCard : ',value,index);
      let mjcards = this._renders[0]._hands.getMJCards();
      if(mjcards.length % 3 != 2){
        return;
      }
      if(this.cannotOutCard(value,index == mjcards.length-1)){
        return;
      }

      if(this._opcode & RCMD_ACTION.optOut){
        this.clearHandleCards();
        this.clearCardTipTag();
        this.sendAction(RCMD_ACTION.optOut,CMD_ACTION.AT_HAND,value);
        this._opcode = RCMD_ACTION.optNull;
        this._renders[0].dealLocalOutCard(card,value,index);
        this.hideToolBar();
      }
  },

  // 房卡房间初始化
  initCardRoom : function () {
    // if(this.roomType != 2){
    //   return;
    // }
    // var self = this;
    // cc.loader.loadRes('game/mahjong/mah/prefab/jushu/jushu',cc.Prefab,function (err,prefab) {
    //   if(err){
    //     cc.log(err);
    //     return;
    //   }
    //   var node = cc.instantiate(prefab);
    //   self.jushu = node.children[0].getComponent(cc.Label);
    //   node.parent = self.node;
    //   node.y = 640;
    //   node.x = cc.winSize.width - 50;
    //   self.jushu.string = self.getRoomJushu();
    //   node.active = false;
    // });
  },

  getRoomJushu : function () {
    return '局数:{0}/{1}'.format(this._currGame,this._totalGame);
  },

  showBigOutCard : function (chair,value) {
    // if(!this._bigOutCard){
    //   var self = this;
    //   cc.loader.loadRes('game/mahjong/mah/prefab/outAni/outAniPai',cc.Prefab,function (err,prefab) {
    //     if(err){
    //       cc.log(err);
    //       return;
    //     }

    //     self._bigOutCard = cc.instantiate(prefab);
    //     self._bigOutCard.parent = self.node;
    //     self._bigOutCard.setLocalZOrder(10000);
    //     self._bigOutCard.children[1].addComponent('gandengyanCard');
    //     self._showOutCard(chair,value);
    //     //self.nextAction();
    //     self.nextAction();
    //   });
    // }else {
    //   this._showOutCard(chair,value);
    //   //this.nextAction();
    //   this.nextAction();
    // }
  },
  
  _showOutCard : function (chair,value) {
      var pos = BigOutCardPos[chair];
      var mjcard = this._bigOutCard.children[1].getComponent('gandengyanCard');
      var frame = MJCardResource.getInHandImageByChair(0,value);
      mjcard.setCard(value,frame);
      this._bigOutCard.setPosition(pos.x,pos.y);
      this._bigOutCard.getComponent(cc.Animation).play();
  },

  /**
   * 显示操作码
   */
  showToolBar : function (opcode) {
    // if(!this._toolBar){
    //   let self = this;
    //   this.node.on('TOOL_ACTION',this.onOpAction,this);
    //   cc.loader.loadRes('game/mahjong/mah/prefab/ToolBar/MahToolBar',cc.Prefab,function (err,prefab) {
    //     if(err){
    //       cc.log(err);
    //       return;
    //     }
    //     self._toolBar = cc.instantiate(prefab);
    //     self._toolBar.x = 1334/2+350;
    //     self._toolBar.y = 250;
    //     self._toolBar.parent = self.node;
    //     self._toolBar.setLocalZOrder(1500);
    //     self._toolBar.getComponent('MahToolBar').showTool(opcode);
    //   });
    // }else {
    //   this._toolBar.getComponent('MahToolBar').showTool(opcode);
    // }
  },

  /**
   *  隐藏操作码
   */
  hideToolBar : function () {
    if(!this._toolBar) return;
    this._toolBar.getComponent('MahToolBar').hideTool();
  },

  /**
   *  显示多吃
   * @param oppArr
   */
  showMultEats : function (oppArr) {
    let self = this;
    if(!this._multiEats){
      cc.loader.loadRes('game/mahjong/mah/prefab/multiEat/multiEat',cc.Prefab,function (err,prefab) {
        if(err){
          cc.log(err);
          return;
        }

        self._multiEats = cc.instantiate(prefab);
        self._multiEats.y = 300;
        self._multiEats.x = cc.winSize.width / 2;
        self._multiEats.parent = self.node;
        self._multiEats.setLocalZOrder(1501);
        let controller = self._multiEats.getComponent('MultiEat');
        controller.showEat(oppArr);
      });
    }else{
      let controller = self._multiEats.getComponent('MultiEat');
      controller.showEat(oppArr);
    }
  },

  hideMultEats : function () {
    if(!this._multiEats){
      return;
    }

    let controller = this._multiEats.getComponent('MultiEat');
    controller.hide();
  },
  msgstorage:function(data)
  {
    if( this.loadcomplete == true )
    {
      this.msgQueue(data)
    }
    else
    {
      this.msgList.push(data);
    }
  },
  msgQueue:function(data){
    cc.log("加入消息到消息队列中<<<<<<<<<<<<<<<<<<<<<<<---",data)
    if(!this.msgList){
      return;
    }
    if( data.route == "RCMD_MatchOver" )
      {
        var users = data.users
        for(let i = 0;i<users.length;i++)
        {
            var player =GamePlayer.getPlayer(users[i].userid);
            if( player != null )
            {
              users[i].userImage = player.userImage
            users[i].nick = player.nick
            }
            
        }
        cc.log("修改之后的 data=",data)
      }

    if(!this._animStatus){
      this._animStatus = true;
      this[data.route](data);
    }else{
      this.msgList.push(data);
      
    }
  },

  /**
   * 处理操作码
   * @param event
   */
  onOpAction : function (event) {
    event.stopPropagation();
    this.hideToolBar();

    let code = parseInt(event.getUserData());
    switch (code){
      case RCMD_ACTION.optNull:
        this.doDefault();
        break;
      case RCMD_ACTION.optHit:
        this.sendAction(RCMD_ACTION.optHit,CMD_ACTION.AT_HAND);
        break;
      case RCMD_ACTION.optEat:
        this.dealLocalEat();
        break;
      case RCMD_ACTION.optHu:
        this.sendAction(RCMD_ACTION.optHu,CMD_ACTION.AT_HAND);
        break;
      case RCMD_ACTION.optBar:
        this.dealLocalBar();
        break;
    }
  },


  dealLocalEat : function () {
    let leftPais = this.getLeftPais(this.lastOutPai);
    let midPais = this.getMidPais(this.lastOutPai);
    let rightPais = this.getRightPais(this.lastOutPai);

    let count = !!leftPais + !!midPais + !!rightPais;
    if(count == 0) return;

    if(count == 1){
      let pais = leftPais ? leftPais : (midPais ? midPais : rightPais);
      // if(!!leftPais){
      //
      // }else if(!!midPais){
      //   pais.pai1 = pais.pai0;
      // }else {
      //   pais.pai2 = pais.pai1;
      //   pais.pai1 = pais.pai0;
      // }

      cc.log('pai1  pai2',pais.pai1,pais.pai2);
      this.sendAction(RCMD_ACTION.optEat,CMD_ACTION.AT_HAND,pais.pai1,pais.pai2);
      return;
    }

    let opArr = [];

    if(rightPais){
      opArr.push(rightPais);
    }

    if(midPais){
      opArr.push(midPais);
    }

    if(leftPais){
      opArr.push(leftPais);
    }
    this.showMultEats(opArr);
  },

  dealLocalBar : function () {
   // let render = this._renders[0];
    let mjcards = this._renders[0]._hands.getMJCards();
    if(mjcards.length % 3 != 2){  // 碰杠
      let count = this._renders[0]._hands.CountPai(this.lastOutPai);
      if(count < 3) return;   // 没有杠
      this.sendAction(RCMD_ACTION.optBar,CMD_ACTION.AT_HAND,this.lastOutPai);
    }else{   // 补杠 暗杠
      let supplyBars = this.findSupplyBarCards();
      let anBars = this.findAnBarCards();
      let bars = supplyBars.concat(anBars);

      if(bars.length == 0) return;
      if(bars.length == 1){
        let bar = bars[0];
        this.sendAction(RCMD_ACTION.optBar,CMD_ACTION.AT_HAND,bar.pais[0]);
      }else{
        cc.log(bars);
        this.showMultEats(bars);
      }
    }
  },

  /**
   * 显示最后一张牌提示
   * @param chair
   * @param card
   */
  showOutTips : function (chair,card) {
    this.soundCtrl.playDealout();
    if(!this._outTips){
      let self = this;
      cc.loader.loadRes('game/mahjong/mah/texture/jiantou',cc.SpriteFrame,function (err,spriteFrame) {
        if(err){
          cc.log(err);
          return;
        }

        self._outTips = new cc.Node();
        let sprite = self._outTips.addComponent(cc.Sprite);
        sprite.spriteFrame = spriteFrame;
        if(chair==0||chair==2){
            self._outTips.y = 70;
        }else{
            self._outTips.y = 50;
        }
        let ss = cc.sequence(cc.moveBy(0.6,0,-20),cc.moveBy(0.6,0,20));
        self._outTips.runAction(cc.repeatForever(ss));
        self._outTips.parent = card.node;
      });
    }else {
      this._outTips.parent = card.node;
      this._outTips.active = true;
    }
  },

  hideOutTips : function () {
    if(!!this._outTips){
     // this._outTips.active = false;
      this._outTips.removeFromParent(true);
      this._outTips = null;
    }
  },

  // 取消操作
  doDefault : function (event) {
    if(!!event){
      event.stopPropagation();
    }
    this.hideToolBar();
    this.hideMultEats();
     if(this._opcode & RCMD_ACTION.optGet){   // 摸牌
      this.sendAction(RCMD_ACTION.optGet,CMD_ACTION.AT_AUTO);
    } else if(RCMD_ACTION.optOut & this._opcode){
      this._opcode = this._opcode & RCMD_ACTION.optOut;
    }else if(!!this._opcode){
      this.sendAction(RCMD_ACTION.optCancel,CMD_ACTION.AT_AUTO);
    }
  },

  /**
   *  操作超时了
   */
  overTime : function (event) {
    if(this.roomType == 2 && !this.isAutoPlay){     // 房卡房不出牌
      return;
    }

    this.hideToolBar();
    this.hideMultEats();
    this.scheduleOnce(function () {
      //this.doDefault(event);
      this.doAutoOut();
      // if(this._opcode & RCMD_ACTION.optOut){
      //                  // 自动出牌
      // }
    }.bind(this),1.0);
  },

  // 托管出牌
  doAutoOut : function () {
    cc.log('doAutoOut: ');

    if(this._opcode & RCMD_ACTION.optHu){
      this.sendAction(RCMD_ACTION.optHu,CMD_ACTION.AT_AUTO);
    }else {
      this.doDefault();
    }


    if(!(this._opcode & RCMD_ACTION.optOut)){
      return;
    }
    // 自动出牌
    var mjcards = this._renders[0]._hands.getMJCards();
    for(var i = 0; i < mjcards.length; i++){
      var value = mjcards[i].getValue();
      if(this.isBD(value)){
        continue;
      }
      if(mjcards[i].isUp() && !this.cannotOutCard(value,i == mjcards.length-1)){
        this.dealOutCard(mjcards[i],mjcards[i].getValue(),i);
        return;
      }
    }

    let start = mjcards.length-1;
    for(;start >= 0; start--){
      var card = mjcards[start];
      var value = card.getValue();
      if(!this.isBD(value) && !this.cannotOutCard(card.getValue(),start == mjcards.length-1)){
        this.dealOutCard(card,card.getValue(),start);
        return;
      }
    }
  },
  /**
   *   处理多个吃 多个杠
   */
  doEatMulti : function (event) {
    event.stopPropagation();
    this.hideMultEats();

    let op = event.getUserData();
    if(op.flag < 4){  // 吃
      this.sendAction(RCMD_ACTION.optEat,CMD_ACTION.AT_HAND,op.pai1,op.pai2);
    }else{  // 杠
      this.sendAction(RCMD_ACTION.optBar,CMD_ACTION.AT_HAND,op.pais[0]);
    }
  },


  
  nextAction:function(event){
    if(!!event){
      event.stopPropagation();
    }
    let msg = this.msgList.shift();
    if(!msg){
      this._animStatus = false;
      return;
    }

    let route = msg.route;
    cc.log("执行了nextAction ",msg);
    // 切换后台
    this.scheduleOnce(function () {
      this[route](msg);
    });
  },

  //服务器命令监听函数
  addPomeloListeners:function(){
    // 消息队列
    let msgList = [
      'RCMD_Start',
      'RCMD_Ready',
      'RCMD_exit',
      'RCMD_Kick',
      'RCMD_close',
      'RCMD_Distribute',
      'RCMD_SetBD',
      'RCMD_Action',
      'RCMD_opCode',
      'RCMD_StartOut',
      'RCMD_ActData',
      'RCMD_GameStart',
      'RCMD_MissCarry',
      'RCMD_Result',
      'RCMD_MatchOver',
      'RCMD_Expend' ,                  // 扩展协议
      'RCMD_PlayerStatus',
      'RCMD_SitIn',
     // 'RCMD_forceGameOver',            // 房卡解散
     // 'RCMD_replyForceGameOver',      // 同意解散

    ];

    for(var i = 0; i < msgList.length; i++){
      pomelo.on(msgList[i],this.msgQueue.bind(this));
    }

    //不需要加入队列的消息
    let msgs = [
      'RCMD_signup',
      'RCMD_MobileSignUp',
      'RCMD_initParam',
      'RCMD_ServerHeartOut',
      'RCMD_TaskSeat',
      'RCMD_Timeout',
    ];

    for(var i = 0; i < msgs.length;i++){
      var msg = msgs[i];
      pomelo.on(msg,this[msg].bind(this));
    }
  },

  removePomeloListeners : function () {
    let msgList = [
      'RCMD_Start',
      'RCMD_Ready',
      'RCMD_exit',
      'RCMD_Kick',
      'RCMD_close',
      'RCMD_Distribute',
      'RCMD_SetBD',
      'RCMD_Action',
      'RCMD_opCode',
      'RCMD_StartOut',
      'RCMD_ActData',
      'RCMD_GameStart',
      'RCMD_MissCarry',
      'RCMD_Result',
      'RCMD_MatchOver',
      'RCMD_Expend',                   // 扩展协议
      'RCMD_PlayerStatus',
      'RCMD_SitIn',
    ];

    for(let i = 0; i < msgList.length; i++){
      pomelo.removeAllListeners(msgList[i]);
    }

    //不需要加入队列的消息
    let msgs = [
      'RCMD_signup',
      'RCMD_MobileSignUp',
      'RCMD_initParam',
      'RCMD_ServerHeartOut',
      'RCMD_Timeout',
      'RCMD_TaskSeat',
     // 'RCMD_Kick',
    ];

    for(let i = 0; i < msgs.length; i++){
      pomelo.removeAllListeners(msgs[i]);
    }
  },
  playAniGDY:function(chair,opcode)
  {
    let self = this;
    cc.loader.loadRes(AniGDyPath[opcode],cc.Prefab,function (err,prefab) 
         {
            if(err)
            {
              cc.log(err);
              return;
            }
            self.opcodeAnimGDY[opcode] = cc.instantiate(prefab);
            self.opcodeAnimGDY[opcode].parent = self.node.parent;
            self.opcodeAnimGDY[opcode].setLocalZOrder(1800);
            self._playEnityAnimGDY(chair,opcode);
            self.opcodeAnimGDY[opcode].x = -667
            self.opcodeAnimGDY[opcode].y = -375
            self.opcodeAnimGDY[opcode].x += self.AniPos[chair].x
            self.opcodeAnimGDY[opcode].y += self.AniPos[chair].y
            self.opcodeAnimGDY[opcode].getComponent(cc.Animation).on('finished',function(){},self);
         });


       // if(!this.opcodeAnimGDY[opcode])
       // {
       //  let self = this;
       //  cc.loader.loadRes(AniGDyPath[opcode],cc.Prefab,function (err,prefab) 
       //   {
       //      if(err)
       //      {
       //        cc.log(err);
       //        return;
       //      }
       //      self.opcodeAnimGDY[opcode] = cc.instantiate(prefab);
       //      self.opcodeAnimGDY[opcode].parent = self.node.parent;
       //      self.opcodeAnimGDY[opcode].setLocalZOrder(1800);
       //      self._playEnityAnimGDY(chair,opcode);
       //      self.opcodeAnimGDY[opcode].getComponent(cc.Animation).on('finished',self.nextAction,self);
       //   });
       //  }else {
       //    this._playEnityAnimGDY(chair,opcode);
       //  }
  },
  _playEnityAnimGDY:function(chair,opcode)
  {

    //this.opcodeAnim[opcode].setPosition(this.AniPos[chair].x,this.AniPos[chair].y);
    //this.opcodeAnim[opcode].setPosition(1334/2,750/2);
    //this.opcodeAnimGDY[opcode].getComponent(cc.Animation).play();
  },
  /**
   * 播放游戏开始动画
   */
  playStartGameAnim : function () {
    if(!this._gamestartAnim){
      let self = this;
      cc.loader.loadRes('game/mahjong/mah/prefab/startgame/startgame',cc.Prefab,function (err,prefab) {
        if(err){
          cc.log(err);
          return;
        }
        self._gamestartAnim = cc.instantiate(prefab);
        self._gamestartAnim.getComponent(cc.Animation).on('finished',self.nextAction,self);
        self._gamestartAnim.parent = self.node;
        self._gamestartAnim.setLocalZOrder(1801);
        self._gamestartAnim.x = cc.winSize.width / 2;
        self._gamestartAnim.y = cc.winSize.height / 2 + 50;
        self._gamestartAnim.getComponent(cc.Animation).play();
      });
    }else{
      this._gamestartAnim.getComponent(cc.Animation).play();
    }
  },

  /**
   * 播放吃碰杠补花动画
   * @param chair
   * @param opcode
   * @param bfinished 是否监听完成消息
   */
  playEatCmdAnim : function (chair,opcode) {
    if(!this.opcodeAnim[opcode]){
      let self = this;
      cc.loader.loadRes(OPCMDAnimPath[opcode],cc.Prefab,function (err,prefab) {
        if(err){
          cc.log(err);
          return;
        }
        self.opcodeAnim[opcode] = cc.instantiate(prefab);
        self.opcodeAnim[opcode].parent = self.node.parent;
        self.opcodeAnim[opcode].setLocalZOrder(1800);
        self._playEnityAnim(chair,opcode);
        self.opcodeAnim[opcode].getComponent(cc.Animation).on('finished',self.nextAction,self);
      });
    }else {
      this._playEnityAnim(chair,opcode);
    }
  },

  // 补花
  playSupplyCmdAnim : function (chair,opcode) {
    cc.log('playSupplyCmdAnim');
    this.playEatCmdAnim(chair,opcode);
  },
  
  _playEnityAnim : function (chiar,opcode) {
    let pos;
    if(RCMD_ACTION.optAnsHu == opcode){
      pos = cc.v2(667,375);
    }else {
      pos = OPCMDPos[chiar];
    }
    cc.log('RCMD_ACTION : ',pos,opcode);
    this.opcodeAnim[opcode].setPosition(pos.x - 660,pos.y - 375);
    this.opcodeAnim[opcode].getComponent(cc.Animation).play();
  },

  onDestroy : function () {
      GlobEvent.removeAllListeners('AUTO_PLAY');
      GlobEvent.removeAllListeners('SINGLE_CHANGE');
      GlobEvent.removeAllListeners('LANGUAGE_CHANGE');
    this.removePomeloListeners();
  },
  
  getDescription : function () {
    return this.game.description || '全民梦游麻将';
  },

/////////////////////////////////////////界面消息处理
  onClickTip:function()
  {
    if( this.SearchCardArr && this.SearchCardArr.length >= 1 )
    {
      this.SearchCardArrIndex++;
      if( this.SearchCardArrIndex >= this.SearchCardArr.length )
      {
        this.SearchCardArrIndex = 0
      }

      var TipCardData = this.SearchCardArr[this.SearchCardArrIndex]
      this.m_CardMangerJs[0].setAllCardsSelete(false)
      this.m_CardMangerJs[0].setCardsSeleteGDY(TipCardData,true)
      this.m_GameJs.setChuPaiBtn(true)
    }

  },
  onClickPass:function()
  {
    this.m_GameJs.setOpLyaer(false);
    if( this.m_CurTurnChair == 0 )
    {
      this.sendPassGDY()
    }
    
  },
  onclicktest:function(str)
  {
    this.sendtest(str.detail)
  },

  onClickOut:function()
  {
      let SelcetCard = this.m_CardMangerJs[0].getSelcetCardDataGDY();
      if( SelcetCard.length == 0 )
      {
        cc.log("未选择牌");
        return;
      }
      var showCard =[]
      if( this.m_LastOutCard != null )
      {
         var Rlt = GameLogic.CompareCard(SelcetCard,this.m_LastOutCard.Shows,showCard)
         if( Rlt == false )
         {
           return
         }
      }
      this.m_selfOut = true;
      this.m_GameJs.setOpLyaer(false);
      cc.log("发送出牌 SelcetCard=",SelcetCard);
      this.onSelfOutCard(SelcetCard,showCard)

      var Chair = 0
      var data = GameLogic.getCardType(SelcetCard)
      this.m_CardMangerJs[Chair].removeOutCardGDY()
      this.m_CardMangerJs[Chair].removeHandCardGDY(SelcetCard );//移除手牌
      this.m_CardMangerJs[Chair].addOutCardGDY( SelcetCard );//显示出的牌
      this.m_GameJs.setPass(Chair ,false)
      this.m_GameJs.setnobig(false );
      this.m_GameJs.endAllClockGDY()
      //播放出牌动画
      if( data.Rlt >= GDYCMD.CardType.CardType_shunzi)
      {
        this.playAniGDY(Chair,data.Rlt);
      }


      var HandCardData = this.m_CardMangerJs[Chair].getHandCardDataGDY()
      this.m_CardMangerJs[Chair].removeAllHandCardGDY()
      GameLogic.SortCardByLogivValue(HandCardData)
      this.m_CardMangerJs[Chair].addHandCardsGDY(HandCardData)

      let player = this.m_GameJs.players[Chair];
     // this.soundCtrl.playoutcard(player.sex,data.Cid);

      switch( data.Rlt )
      {
        case GDYCMD.CardType.CardType_bomb3:   this.danjunum = this.danjunum * 2; break;
        case GDYCMD.CardType.CardType_bomb4:   this.danjunum = this.danjunum * 3; break;
        case GDYCMD.CardType.CardType_bomb5:   this.danjunum = this.danjunum * 4; break;
        case GDYCMD.CardType.CardType_bomb6:   this.danjunum = this.danjunum * 5; break;
        case GDYCMD.CardType.CardType_wangzha:   this.danjunum = this.danjunum * 10; break;
      }
      if ((this.m_GameJs.ruleFlag & 0x80) == 0x80) {
        if (this.danjunum > 6) {
          this.danjunum = 6;
        }
      } else if ((this.m_GameJs.ruleFlag & 0x100) == 0x100) {
        if (this.danjunum > 12) {
          this.danjunum = 12;
        }
      }
      
      this.m_GameJs.setdanjuNum(this.danjunum)
      this.soundCtrl.playoutcardGDY(player.sex,data.Rlt, GDYCardRes.getCardValue(data.show[0]) )
  },
  //吃牌响应
  onClickChi:function()
  {
    cc.log("发送了吃牌");
    let self = this;
    self.m_GameJs.setChiCard(false);
    // let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    // let ChiBtn = OpBtnBG.getChildByName("ChiBtn");
    // let CardData1 = ChiBtn.getChildByName("ChiCard1").getComponent("gandengyanCard").getCardData()
    // let CardData2 = ChiBtn.getChildByName("ChiCard2").getComponent("gandengyanCard").getCardData()
    let CardData1 = self.m_tip_EatCardArr[0];
    let CardData2 = self.m_tip_EatCardArr[1];
    cc.log("发送吃牌 {0},{1}".format(CardData1,CardData2));
    self.sendEatCard([CardData1,CardData2])

  },
  //扛牌响应
  onClickGang:function()
  {
    cc.log("发送了扛牌");
    let self = this;
    self.m_GameJs.setGangCard(false);
    // let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    // let GangBtn = OpBtnBG.getChildByName("GangBtn");
    // let CardData1 = GangBtn.getChildByName("ChiCard1").getComponent("gandengyanCard").getCardData()
    // let CardData2 = GangBtn.getChildByName("ChiCard2").getComponent("gandengyanCard").getCardData()
    let CardData1 = this.m_tip_GangCardArr[0]
    let CardData2 = this.m_tip_GangCardArr[1]
    let CardData3 = this.m_tip_GangCardArr[2]
    cc.log("发送扛牌 {0},{1}".format(CardData1,CardData2,CardData3));
    self.sendGangCard([CardData1,CardData2,CardData3])
  },
  //逃花响应
  onClickTaoHua:function()
  {
    cc.log("发送了逃花");
    let self = this;
    self.m_GameJs.setTaoHua(false);
    self.m_GameJs.setTaoHuaBtnVisible(false);
    self.sendTaoHua();
  },
  //过牌响应
  onClickGuo:function()
  {
    cc.log("发送了过牌");
    let self = this;
    self.m_GameJs.setTaoHua(false);
    self.sendPass();
  },
  //补花响应
  onClickFlower:function()
  {
    cc.log("发送了补花");
    let self = this;
    self.m_GameJs.setFlower(false);
    // let OpBtnBG = this.node.parent.getChildByName("OpBtnBG")
    // let FlowerBtn = OpBtnBG.getChildByName("FlowerBtn");
    // let CardData1 = FlowerBtn.getChildByName("ChiCard1").getComponent("gandengyanCard").getCardData()
    cc.log("发送补花 {0}".format(self.m_tip_flowerCard));
    self.senddoFlod(self.m_tip_flowerCard)
  },
  onClickXianHua:function()
  {
    cc.log("发送了献花");
    let self = this;
    self.m_GameJs.setXianHua(false);
    self.sendxianhua()
  },
  //胡牌响应
  onClickHu:function()
  {
    cc.log("发送了胡牌");
    let self = this;
    self.m_GameJs.setHu(false);
    self.sendHu();
  },
  //换牌响应
  onClickHuan:function()
  {
    cc.log("发送了换牌")
    let self = this;
    self.m_GameJs.setHuan(false);
    self.sendHuan();
  },

/////////////////////////////////////////////定时器超时响应函数
  //操作超时
  onClockTimeOut:function()
  {//操作超时了
    let self = this;
    cc.log("用户自己超时了")
    return;
    switch( self.m_OPStatus )
    {
      case OpStatus.OpStatus_FLOWER: self.onClockTimeOut_Flower(); break;
      case OpStatus.OpStatus_FLOD:   self.onClockTimeOut_Flod();  break;
      case OpStatus.OpStatus_EAT:    self.onClockTimeOut_Eat();   break;
      case OpStatus.OpStatus_GANG:   self.onClockTimeOut_Gang();  break;
      case OpStatus.OpStatus_OUT:    self.onClockTimeOut_Out();   break;
      case OpStatus.OpStatus_HU:     self.onClockTimeOut_Hu();    break;
      case OpStatus.OpStatus_HUAN:   self.onClockTimeOut_Huan();  break;
      default: cc.log("超时但是定时器找不到，出错了"); assert(false,"超时但是定时器找不到，出错了"); break;
    }
  },
  //补花超时
  onClockTimeOut_Flower:function()
  {
    cc.log("补花超时");
    this.onClickFlower();
  },
  //逃花超时
  onClockTimeOut_Flod:function()
  {
    cc.log("逃花超时")
    this.onClickTaoHua()
  },
  //吃牌超时
  onClockTimeOut_Eat:function()
  {
    cc.log("吃牌超时")
    this.onClickChi()
  },
  //扛牌超时
  onClockTimeOut_Gang:function()
  {
    cc.log("扛牌超时");
    this.onClickGang();
  },
  //出牌超时
  onClockTimeOut_Out:function()
  {
    cc.log("出牌超时")
    let SelectCardData = this.m_GameJs.getOneCanOutCardData();
    this.onSelfOutCard(SelectCardData);
  },
  //胡牌超时
  onClockTimeOut_Hu:function()
  {
    cc.log("胡牌超时")
    this.onClickHu();
  },
  //换牌超时
  onClockTimeOut_Huan:function()
  {
    cc.log("换牌超时")
    this.onClickHuan();

  },
  ///////////////////gdy游戏网络函数
  sendOutCardGDY:function(Shows,Reals ,Type )
  {
    let data = 
    {
      cmd:GDYCMD.CMD.CMD_OUT,
      type:Type,
      showCards:Shows,
      realCards:Reals
    }
      this.sendExpend(data);
  },
  sendPassGDY:function(SeatId)
  {
    let data = 
    {
      cmd:GDYCMD.CMD.CMD_PASS
    }
      this.sendExpend(data);
  },
  sendtest:function(str)
  {
    let data = 
    {
      cmd:GDYCMD.CMD.CMD_DEBUG,
      debugJson:str
    }
      this.sendExpend(data);
  },
//////////////////////////////////////////////////////////发送游戏网络消息
  //发送出牌消息
  sendOutCard:function(CardData)
  {
    let data = 
    [
      GDYCMD.CMD.CMD_OUT,
      CardData
    ]
      this.sendExpend(data);
  },
  //发送吃牌消息
  sendEatCard:function(CardDataArr)
  {
    let data = 
    [
      yhwhCommand.yhwhCmd.CMD_EAT,
      CardDataArr
    ]
      this.sendExpend(data);
  },
  //发送扛牌消息
  sendGangCard:function(CardDataArr)
  {
    let data = 
    [
      yhwhCommand.yhwhCmd.CMD_GANG,
      CardDataArr
    ]
      this.sendExpend(data);
  },
  //发送逃花消息
  sendTaoHua:function()
  {
     let data = 
    [
      yhwhCommand.yhwhCmd.CMD_FOLD
    ]
      this.sendExpend(data);
  },
  //发送补花消息
  senddoFlod:function(CardData)
  {
    let data = 
    [
      yhwhCommand.yhwhCmd.CMD_SUPPLE_FLOWER,
      CardData
    ]
      this.sendExpend(data);
  },
  //发送过消息
  sendPass:function()
  {
    let data = 
    [
      GDYCMD.CMD.CMD_PASS
    ]
    this.sendExpend(data);
  },
  //发送胡消息
  sendHu:function()
  {
    let data =
    [
      yhwhCommand.yhwhCmd.CMD_HU
    ]
    this.sendExpend(data);
  },
  //发送换牌消息
  sendHuan:function()
  {
    let data = 
    [
      yhwhCommand.yhwhCmd.CMD_CHANGE
    ]
    this.sendExpend(data);
  },
  //发送托管消息
  sendtrusteeship:function()
  {
    let data =
    {
      cmd:GDYCMD.CMD.RCMD_Trusteeship
    }
    this.sendExpend(data);
  },
  //发送献花消息
  sendxianhua:function()
  {
     let data =
    [
      yhwhCommand.yhwhCmd.CMD_SHOW
    ]
    this.sendExpend(data);
  },

//////////////////////////////////////////////GameLogic函数
  reSortCardsPos:function()
  {
    let CannotTouch = this.m_CardMangerJs[0].getHandCardData_CannotTouch();
    let CanTouch = this.m_CardMangerJs[0].getHandCardData_CanTouch();
    let Send = this.m_CardMangerJs[0].getHandCardData_Send();

    cc.log("排序后的牌数据 ：")
    cc.log("CannotTouch:",CannotTouch);
    cc.log("CanTouch:",CanTouch);
    cc.log("Send:",Send);

    this.m_CardMangerJs[0].removeAllCards_Hand_ButGet();
    let SortHandCardData = this.sortCard(CannotTouch);
    let SortCanTouchData = this.sortCard(CanTouch)
    this.m_CardMangerJs[0].addHandCards(Send,true);
    this.m_CardMangerJs[0].addHandCards(SortCanTouchData,true);
    this.m_CardMangerJs[0].addHandCards(SortHandCardData,false);
    this.m_CardMangerJs[0].setCardSend(Send,true);
  },
  sortCardEx2:function(CardDataArr)
  {
      cc.log("sortCardEx2 排序前数据:",CardDataArr);
      let self = this;
      //分析牌
      var ResoveCards = function(CardDataArr)
      {
        let TempCard = {}
        for(let i=0; i < CardDataArr.length; i++)
        {
          let Value = MJCardResource.getCardValue(CardDataArr[i])
          let ValueStr = "{0}".format(Value)
          if( TempCard[ValueStr] == null )
          {
            TempCard[ValueStr] = []
          }
          TempCard[ValueStr].push(CardDataArr[i])
        }
        let RltCard1 = []
        let RltCard2 = []
        for(var i in TempCard)
        {
          if( TempCard[i].length >= 2)
          {
            for(var x =0; x < TempCard[i].length; x++)
            {
              RltCard1.push(TempCard[i][x]);
            }
          }
          else
          {
            for(var x =0; x < TempCard[i].length; x++)
            {
              RltCard2.push(TempCard[i][x]);
            }
          }
        }
        return [RltCard1,RltCard2]
      }
      //从desDatas中移除srcDatas牌
      var RemoveCards = function(srcDatas,desDatas)
      {
        for(var x = 0; x < srcDatas.length; x++)
        {
            for(var i=0; i < desDatas.length; i++ )
            {
              if( srcDatas[x] === desDatas[i])
              {
                desDatas.splice(i,1)
                break
              }
            }
        }
      }
      //是否为摇张牌
      var IsYangZhangCard = function(CardData)
      {
        var YZValue0 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[0]);
        var YZValue1 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[1]);
        var YZValue2 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[2]);
        var CardValue = MJCardResource.getCardSoundNameByData(CardData)
        return CardValue === YZValue0 || CardValue ===YZValue1 || CardValue ===YZValue2 ? true : false;
      }
      //提取摇张牌
      var ExtractCard_YangZhang =function(CardDataArr)
      {
        //提取摇张
        var YangZhangCard = []
        for( var i = 0; i < CardDataArr.length; i++ )
        {
          if( true == IsYangZhangCard(CardDataArr[i] ) )
          {
            YangZhangCard.push(CardDataArr[i])
          }
        }
        RemoveCards(YangZhangCard,CardDataArr)
        return YangZhangCard
      }
      //提取家位牌
      var ExtractCard_JiaWei =function(CardDataArr)
      {

        var JiaWei = self.m_TianIndex[0];
        var JiaWeiCardIndex = ['66','11','44','33'];
        var SelfJiaWeiCard = JiaWeiCardIndex[JiaWei-1];
        var JieWeiCard = []
        for(let i=0; i < CardDataArr.length; i++)
        {
            var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
            if( CardValue === SelfJiaWeiCard)
            {
                JieWeiCard.push(CardDataArr[i]);
            }
        }
        RemoveCards(JieWeiCard,CardDataArr)
        return JieWeiCard
      }
      //提取第二排的牌
      var ExtractCard_Second = function(CardDataArr)
      {
        var SecondRow=['66','11','44','33','13','46','55','22','16','34','25','56','12'];
        let SecondRowCard = []
        for( let x=0; x < SecondRow.length; x++)
        {
            for(let i=0; i < CardDataArr.length; i++)
            {
              var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
                if( SecondRow[x] === CardValue)
                {
                    SecondRowCard.push(CardDataArr[i])
                }
            }
        }
        RemoveCards(SecondRowCard,CardDataArr)
        return SecondRowCard;
      }
      //提取第三排的牌
      var ExtractCard_Third = function(CardDataArr)
      {
        //提取第三排的牌
          var ThreeRow=['23','45','36','14','24','35','26','15'];
          var ThreeRowCard = []
          for( let x=0; x < ThreeRow.length; x++)
          {
              let DoubleCard = []
              for(let i=0; i < CardDataArr.length; i++)
              {
                var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
                  if( ThreeRow[x] === CardValue)
                  {
                      ThreeRowCard.push(CardDataArr[i])
                  }
              }
          }
          RemoveCards(ThreeRowCard,CardDataArr)
          return ThreeRowCard
      }
      //提取1框牌
      var ExtractCard_Kuang1 = function(CardDataArr)
      {
        var CardData1Kuang = []
        for(var i = 0; i < CardDataArr.length; i++)
        {
          var CardColor = MJCardResource.getCardColor(CardDataArr[i])
          if( CardColor == 1 )
          {
              CardData1Kuang.push(CardDataArr[i])
          }
        }
        RemoveCards(CardData1Kuang,CardDataArr)
        return CardData1Kuang
      }
      //提取2框牌
      var ExtractCard_Kuang2 = function(CardDataArr)
      {
        var CardData2Kuang = []
        for(var i = 0; i < CardDataArr.length; i++)
        {
          var CardColor = MJCardResource.getCardColor(CardDataArr[i])
          if( CardColor == 2 )
          {
              CardData2Kuang.push(CardDataArr[i])
          }
        }
        RemoveCards(CardData2Kuang,CardDataArr)
        return CardData2Kuang
      }
      //提取白皮牌
      var ExtractCard_BaiPi = function(CardDataArr)
      {
        var CardDataBaiPi = []
        for(var i = 0; i < CardDataArr.length; i++)
        {
          var CardColor = MJCardResource.getCardColor(CardDataArr[i])
          if( CardColor == 3 )
          {
              CardDataBaiPi.push(CardDataArr[i])
          }
        }
        RemoveCards(CardDataBaiPi,CardDataArr)
        return CardDataBaiPi
      }

      var ExtractCard_Flower = function(CardDataArr)
      {
        var FlowerCard = [0,1,2,3,4,5,6,7,8];
        var FlowerCardData = []
        for(let i=0; i < CardDataArr.length; i++)
        {
            for(let x=0; x < FlowerCard.length; x++)
            {
              if( FlowerCard[x] === CardDataArr[i])
              {
                FlowerCardData.push(CardDataArr[i]);
              }
            }
        }
        return FlowerCardData;
      }
      var FlowerCard = ExtractCard_Flower(CardDataArr);
      var SoveCard = ResoveCards(CardDataArr);//提取对子与单
      var DoubleCard = SoveCard[0]
      var SigleCard = SoveCard[1]
      var DoubleCard_YangZhang = ExtractCard_YangZhang(DoubleCard)//提取摇张对
      var DoubleCard_JiaWei = ExtractCard_JiaWei(DoubleCard)//提取家位对
      var DoubleCard_Second = ExtractCard_Second(DoubleCard)//提取第二排对
      var DoubleCard_Third = ExtractCard_Third(DoubleCard)//提取第三排对

      var SigleCard_Kuang1 = ExtractCard_Kuang1(SigleCard);//提取1框单
      var SigleCard_YangZhang1 =  ExtractCard_YangZhang(SigleCard_Kuang1)//从1框单中提取摇张单
      var SigleCard_JiaWei1 =  ExtractCard_JiaWei(SigleCard_Kuang1)//从1框单中提取家位单
      var SigleCard_Second1 = ExtractCard_Second(SigleCard_Kuang1);//从1框单中提取第二排
      var SigleCard_Third1 = ExtractCard_Third(SigleCard_Kuang1);//从1框单中提取第三排

      var SigleCard_Kuang2 = ExtractCard_Kuang2(SigleCard);//提取2框单
      var SigleCard_YangZhang2 =  ExtractCard_YangZhang(SigleCard_Kuang2)//从2框单提取摇张单
      var SigleCard_JiaWei2 =  ExtractCard_JiaWei(SigleCard_Kuang2)//从2框单提取家位单
      var SigleCard_Second2 = ExtractCard_Second(SigleCard_Kuang2);//从2框单中提取第二排
      var SigleCard_Third2 = ExtractCard_Third(SigleCard_Kuang2);//从2框单中提取第三排

      var BaiPiCard = ExtractCard_BaiPi(SigleCard)//从单张中提取白皮牌
      var BaiPiCard_YangZhang = ExtractCard_YangZhang(BaiPiCard)//从白皮单提取摇张单
      var BaiPiCard_JiaWei = ExtractCard_JiaWei(BaiPiCard)//从白皮单提取家位单
      var BaiPiCard_Second = ExtractCard_Second(BaiPiCard)//从白皮中提取第二排
      var BaiPiCard_Third = ExtractCard_Third(BaiPiCard);//从白皮中提取第三排

      //牌的排序顺序如下  摇张对 》 家位对 》第二排对 》第三排对 》1框摇张单 》1框家位单 》1框第二排单 》1框第三排单 》2框摇张单 》2框家位单 》2框第二排单 》2框第三排单 》白皮摇张单 》白皮家位单 》白皮第二排 》白皮第三排 》花牌》送子
      var RltCard = [] //以下为由大到小加入数组中
      RltCard = RltCard.concat(DoubleCard_YangZhang)
      RltCard = RltCard.concat(DoubleCard_JiaWei)
      RltCard = RltCard.concat(DoubleCard_Second)
      RltCard = RltCard.concat(DoubleCard_Third)
      RltCard = RltCard.concat(SigleCard_YangZhang1)
      RltCard = RltCard.concat(SigleCard_JiaWei1)
      RltCard = RltCard.concat(SigleCard_Second1)
      RltCard = RltCard.concat(SigleCard_Third1)
      RltCard = RltCard.concat(SigleCard_YangZhang2)
      RltCard = RltCard.concat(SigleCard_JiaWei2)
      RltCard = RltCard.concat(SigleCard_Second2)
      RltCard = RltCard.concat(SigleCard_Third2)
      RltCard = RltCard.concat(BaiPiCard_YangZhang)
      RltCard = RltCard.concat(BaiPiCard_JiaWei)
      RltCard = RltCard.concat(BaiPiCard_Second)
      RltCard = RltCard.concat(BaiPiCard_Third)
      RltCard = RltCard.concat(FlowerCard)
      if( CardDataArr.length != RltCard.length )
      {
        assert(false)
      }
      cc.log("sortCardEx2 排序后数据:",RltCard);
      return RltCard.reverse();
  },
  sortCardEx:function(CardDataArr)
  {
    cc.log("sortCardEx 排序前数据:",CardDataArr);
      let TempCard = []
      let self = this;
      var TempYangZhangCard=[]

      var YZValue0 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[0]);
      var YZValue1 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[1]);
      var YZValue2 = MJCardResource.getCardSoundNameByData(self.m_YaoZhang[2]);
      var SortYangZhang = function() 
      {
        for(let i=0; i < CardDataArr.length;i++)
        {
          var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i])
          if( YZValue0 === CardValue || YZValue1 === CardValue || YZValue2 === CardValue )
          {
            TempYangZhangCard.push(CardDataArr[i]);
            CardDataArr.splice(i--,1);
          }
        }
      }
      var TempJiaWeiCard= []
      var SortJiaWei = function()
      {
          var JiaWei = self.m_TianIndex[0];
          var JiaWeiCard = ['66','11','44','33'];
          var SelfJiaWeiCard = JiaWeiCard[JiaWei-1];
          for(let i=0; i < CardDataArr.length; i++)
          {
              var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
              if( CardValue === SelfJiaWeiCard)
              {
                  TempJiaWeiCard.push(CardDataArr[i]);
                  CardDataArr.splice(i--,1);
              }
          }
      }
      var SecondDoubleCard = [] //第二排双子牌
      var SecondOneCard = []//第二排单牌

      var ThreeDoubleCard = [];//第三排双牌
      var ThreeOneCard =[];//第三排单牌

      //根据第一二三以及双子与单对牌进行排序
      var SortCardRow = function()
      {
        //查询第二排的牌
          var SecondRow=['66','11','44','33','13','46','55','22','16','34','25','56','12'];
          
          for( let x=0; x < SecondRow.length; x++)
          {
              let DoubleCard = []
              for(let i=0; i < CardDataArr.length; i++)
              {
                var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
                  if( SecondRow[x] === CardValue)
                  {
                      DoubleCard.push(CardDataArr[i])
                  }
              }
              if( DoubleCard.length >= 2 )
              {
                  SecondDoubleCard = SecondDoubleCard.concat(DoubleCard)
              }
              else
              {
                  SecondOneCard = SecondOneCard.concat(DoubleCard);
              }
              for(let i=0; i < DoubleCard.length; i++ )
              {
                for(let x=0; x < CardDataArr.length; x++)
                {
                  if( DoubleCard[i] === CardDataArr[x])
                  {
                    CardDataArr.splice(x,1);
                    break;
                  }
                }
              }
          }

          //查询第三排双子的牌
          var ThreeRow=['23','45','36','14','24','35','26','15'];
          
          for( let x=0; x < ThreeRow.length; x++)
          {
              let DoubleCard = []
              for(let i=0; i < CardDataArr.length; i++)
              {
                var CardValue = MJCardResource.getCardSoundNameByData(CardDataArr[i]);
                  if( ThreeRow[x] === CardValue)
                  {
                      DoubleCard.push(CardDataArr[i])
                  }
              }
              if( DoubleCard.length >= 2 )//牌数量大于2
              {
                  ThreeDoubleCard = ThreeDoubleCard.concat(DoubleCard)
              }
              else
              {
                  ThreeOneCard = ThreeOneCard.concat(DoubleCard);
              }
              for(let i=0; i < DoubleCard.length; i++ )
              {
                for(let x=0; x < CardDataArr.length; x++)
                {
                  if( DoubleCard[i] === CardDataArr[x])
                  {
                    CardDataArr.splice(x,1);
                    break;
                  }
                }
              }
          }
      }

      //搜索花牌
      var FoldCard=[]
      var SortFlower = function()
      {
        var FlowerCard = [0,1,2,3,4,5,6,7,8];
        for(let i=0; i < CardDataArr.length; i++)
        {
            for(let x=0; x < FlowerCard.length; x++)
            {
              if( FlowerCard[x] === CardDataArr[i])
              {
                FoldCard.push(CardDataArr[i]);
                CardDataArr.splice(i--,1);
              }
            }
        }
      }
      //搜索单张 1框牌 2框 白皮
      var SigleKuang1 =[]
      var SigleKuang2 =[]
      var SigleBaiPi =[]
      var SortSigleKuang =function()
      {
        var Kuang1Card = SecondOneCard.concat(ThreeOneCard)
        for(var i =0; i < Kuang1Card.length; i++ )
        {
          var CardColro = MJCardResource.getCardColor(Kuang1Card[i])
          if( CardColro == 1 )  SigleKuang1.push(Kuang1Card[i])
          if( CardColro == 2 )  SigleKuang2.push(Kuang1Card[i])
          if( CardColro == 3 )  SigleBaiPi.push(Kuang1Card[i])
        }
      }

      SortYangZhang()
      SortJiaWei()
      SortCardRow()
      SortFlower()
      SortSigleKuang()

      //第二排>第三排 （双牌对双牌，单牌对单牌,单张中按12白排序）
      TempCard = TempCard.concat(FoldCard);//花牌
      TempCard = TempCard.concat(SigleBaiPi.reverse())
      TempCard = TempCard.concat(SigleKuang2.reverse())//
      TempCard = TempCard.concat(SigleKuang1.reverse())//
      TempCard = TempCard.concat(ThreeDoubleCard.reverse())//
      TempCard = TempCard.concat(SecondDoubleCard.reverse())//
      TempCard = TempCard.concat(TempJiaWeiCard)//家位牌更大
      TempCard = TempCard.concat(TempYangZhangCard)//
      cc.log("sortCardEx 排序后数据:",TempCard);
      if( CardDataArr.length >= 1 )
      {
        assert(false);
      }
      return TempCard;
  },
  sortCard:function(CardDataArr)
  {
    return this.sortCardEx2(CardDataArr)

    let TempCard = {}
    for(let i=0; i < CardDataArr.length; i++)
    {
      let Value = MJCardResource.getCardValue(CardDataArr[i])
      let ValueStr = "{0}".format(Value)
      if( TempCard[ValueStr] == null )
      {
        TempCard[ValueStr] = []
      }
      TempCard[ValueStr].push(CardDataArr[i])
    }
    let RltCard = []
    let RltCard1 = []
    let RltCard2 = []
    for(var i in TempCard)
    {
      if( TempCard[i].length >= 2)
      {
        for(var x =0; x < TempCard[i].length; x++)
        {
          RltCard1.push(TempCard[i][x]);
        }
      }
      else
      {
        for(var x =0; x < TempCard[i].length; x++)
        {
          RltCard2.push(TempCard[i][x]);
        }
      }
    }
    RltCard = RltCard.concat(RltCard2)
    RltCard = RltCard.concat(RltCard1)
    return RltCard
  },
  countTianIndex:function()
  {
    let Index = []
    let Chair = this.getChairBySeatId(this.m_LordSiteId)
    Index[Chair] = 1;
    let TempChair = Chair
    let TempIndex = 2
    do
    {
      TempChair = (TempChair + 1)%PLAYER_NUM;
      if( TempChair == Chair )
      {
        break;
      }
      Index[TempChair] = TempIndex 
      TempIndex += 1
    }while(true)
    return Index
  },
  IsExistInArr:function(CardDataArr1,CardDataArr2)
  {
    let Arr1 = CardDataArr1.slice()
    let Arr2 = CardDataArr2.slice()
    for(let i=0; i < CardDataArr1.length; i++ )
    {
        let bFind = false;
        for(let x = 0; x < CardDataArr2.length; x++ )
        {
          if( CardDataArr1[i] ==CardDataArr2[x] )
          {
            bFind = true;
            CardDataArr2.splice(x,1);
            break;
          }
        }
        if( bFind == false )
        {
          return false;
        }
    }
    return true;
  },
  removeFromArr:function(Arr1,Arr2)
  {
    for(let x = 0; x < Arr1.length; x++ )
    {
      for(let i = 0; i < Arr2.length; i++)
      {
        if( Arr1[x] == Arr2[i])
        {
          Arr2.splice(i,1);
          break;
        }
      }
    }
    return Arr2;
  }
});