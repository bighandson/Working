var config = require('Config');
var LoadGame = require('LoadGame');
const SSSCommand = require("SSSCommand");
cc.Class({
  extends: cc.Component,

  properties: {},

  // use this for initialization
  onLoad: function () {
    cc.log("SSSRule load");
    // SssManager.rule = this.node.getComponent(LoadGame.getCurrentGame().rule);
    SssManager.rule = this;

    this.initData();
    this.addPomeloListeners();
    this.node.on('CMD_Ready', this.CMD_Ready, this);
    this.node.on('CMD_Exit', this.CMD_Exit, this);
    //点击退出按钮
    this.node.on('onExit', this.onExit, this);

  },

  onDestroy: function () {
    this.removePomeloListeners();
  },

  /**
   * 帧事件处理消息队列
   */
  update: function () {
    if (!SssManager.isResLoadComplete) {
      return;
    }
    if (this.msgBlocked) {
      return;
    }
    if (this.msgList.length == 0) {
      return;
    }

    let msg = this.msgList.shift();
    let route = msg.route;
    this[route](msg);
  },

  /**
   * 初始化数据
   */
  initData: function () {
    //存放消息数据的队列
    this.msgList = [];
    //消息队列是否阻塞
    this.msgBlocked = false;
    //游戏是否开始
    this.isPlaying = false;

  },
  //CMD start
  CMD_Ready: function () {
    var route = this.game.server + '.CMD_Ready';
    PomeloClient.request(route);
  },

  CMD_Exit: function () {
    var route = this.game.server + '.CMD_Exit';
    PomeloClient.request(route);
  },

  sendExpend: function (data,cb) {
    PomeloClient.request(this.game.server + '.CMD_Expend', {
        data: data
    }, function (data) {
        if(!!cb){
            cb(data)
        }
        cc.log(data);
    });
  },

  //CMD end

  RCMD_Start: function (data) {
    cc.log("RCMD_Start");
    cc.log(data);
    this.msgBlocked = true;
    this.node.emit('RCMD_Start', data);
    if (this.roomType < 2) {
      this.isPlaying = false;
    }
  },

  RCMD_Ready: function (data) {
    cc.log("RCMD_Ready");
    cc.log(data);
    this.msgBlocked = true;
    // this._renders[chair].clearForGame();
    this.node.emit('RCMD_Ready', data);
    // this.nextAction();
  },

  /**
   * 玩家离开
   * @param data
   * @constructor
   */
  RCMD_exit: function (data) {
    cc.log("RCMD_exit", data);
    // data.userid
    //清理用户界面
      if (data.userid == UserCenter.getUserID()) {

          this.removePomeloListeners();
          hideAlertBox();
          this.backLobby();

      }
    this.msgBlocked = true;
    this.node.emit('RCMD_exit', data);
  },

  /**
   *  {
     *  0：_T("您的人品不好，所以被踢下线") ,
        1：_T("帐号在另一个地方登录，您被迫下线") ,
        2：_T("您被管理员踢下线") ,
        3：_T("您的游戏币不足，不能继续游戏。") ,
        4：_T("你的断线或逃跑已经超过规定的次数,不能继续游戏")}
   */
  RCMD_Kick: function (data) {
    this.msgBlocked = true;
    let msgArr = {
      0: '您的人品不好，所以被踢下线',
      1: '帐号在另一个地方登录，您被迫下线',
      2: '您被管理员踢下线',
      3: '您的游戏币不足，不能继续游戏。',
      4: '你的断线或逃跑已经超过规定的次数,不能继续游戏',
      5: '你已下线 ',
      255: data.srtMsg
    };
    let self = this;
    hideLoadingAni();
    this.removePomeloListeners();
    if (data.bt != 255 || data.bt == 255 && data.srtMsg.length > 0) {
      showAlertBox(msgArr[data.bt], function () {
        self.backLobby();
      });
    }
  },

  RCMD_close: function (data) {
    this.removePomeloListeners();
    let self = this;
    hideLoadingAni();
    showAlertBox('您与游戏服务器连接断开',function () {
    self.backLobby();
    });
  },

  RCMD_GameStart: function (data) {
    cc.log("RCMD_GameStart");
    cc.log(data);
    this.isPlaying = true;
  },

  RCMD_Timeout: function (data) {
    cc.log("RCMD_Timeout");
    cc.log(data);
  },

  RCMD_Expend: function (data) {
    cc.log("RCMD_Expend");
    cc.log(data);
    var expend = data.data;
    if (expend.CMD == '002') {
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
    if (data.data.CMD == '003') {
      cc.log('cmd003')
      this.renew = data.data.renew;
    }
    if (data.data.CMD == '004') {
      cc.log('cmd004')
      this.renew = data.data.renew;
      this.kicknum = data.data.exit;
    }
  },

  RCMD_signup: function (data) {
    cc.log("RCMD_signup");
    cc.log(data);
    let self = this;
    if (!!data.flag) {  // 登陆服务器失败
      hideLoadingAni();
      showAlertBox('进入游戏失败', function () {
        self.backLobby();
      });
    }
  },

  /**
   * 进入房间
   * @param data
   * @constructor
   */
  RCMD_MobileSignUp: function (data) {
    cc.log("RCMD_MobileSignUp");
    cc.log(data);
    let flag = data.flag;
    let reason = data.reason;

    let self = this;
    if (flag != 0) {
      hideLoadingAni();
      this.removePomeloListeners();
      showAlertBox(reason, function () {
        self.backLobby();
      });
    }
  },

  RCMD_PlayerStatus: function (data) {
    cc.log("RCMD_PlayerStatus");
    this.node.emit('RCMD_PlayerStatus', data);
  },

  RCMD_initParam: function (data) {
    cc.log("RCMD_initParam");
    cc.log('RCMD_initParam================',data);

    this.gameid = data.gameid;
    this.EHBTimes = data.EHBTimes || 15;
    this.outTimes = data.outTimes || 10;
    this.roomType = data.roomType;
    this.ruleFlag = data.ruleFlag;             // 游戏规则
    this._currGame = data.currGame || 0;
    this._totalGame = data.totalGame || 0;
    this._currentFeng = 0;
    // 游戏配置信息
    this.game = config.getGameById(this.gameid);
    // this.node.emit('RCMD_initParam',data);
    // this.initRender();
    // this.resetGame();
    this.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话
    // 复盘记录不需要触摸出牌
    // this.setTouchEvent();
    // this.initCardRoom();

    this.node.emit("RCMD_initParam", data);
  },

  RCMD_ServerHeartOut: function (data) {
    cc.log("RCMD_ServerHeartOut");
    cc.log(data);
  },

  RCMD_TaskSeat: function (data) {
    cc.log("RCMD_TaskSeat");
    cc.log(data);

    this.seatId = data.seatid;
    this.tableId = data.tableid;
    SssManager.mySeatId = this.seatId;
    this.node.emit('RCMD_TaskSeat', data);
  },

  RCMD_SitIn: function (data) {
    cc.log("RCMD_SitIn");
    cc.log(data);
    this.node.emit('RCMD_SitIn', data);
  },

  RCMD_Result: function (data) {
    cc.log("RCMD_Result");
    cc.log(data);
    this.isPlaying = false;
    this.node.emit('RCMD_Result', data);
  },

  RCMD_Command: function (data) {
    cc.log("RCMD_Command");
    cc.log(data);
    let cmd = data.cmd;
    let retData = data.data;
    if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
      cc.log("RCMD_Command RCMD_INITDATA");
      this.totalGame = retData.totalGame;
      this.basescore = retData.basescore;
      this.createRoomID = retData.createRoomID;
      this.currGame = retData.currGame;
      this.gameid = retData.gameid;
      this.roomcode = retData.roomcode;
      this.roomType = retData.roomType;
      this.ruleFlag = retData.ruleFlag;
      this.thinkTime = retData.thinkTime;
      this.game = config.getGameById(this.gameid);
      this.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话
    } else if (cmd == SSSCommand.RESP_CMD.RCMD_GameStart) {
      this.msgBlocked = true;
      //开始游戏
      this.isPlaying = true;
      this.currGame = retData.currgame;
      this.totalGame = retData.totalgame;
    } else if (cmd == SSSCommand.RESP_CMD.RCMD_SendCard) {
      //发牌
    } else if (cmd == SSSCommand.RESP_CMD.RCMD_CardHand) {
      //摊牌之后收到牌
      //告知牌已经组合好了
    } else if (cmd == SSSCommand.RESP_CMD.RCMD_TSC_GAMEEND) {
      //锁住，播放动画
      this.msgBlocked = true;
      //收到结果
      this.bFullGun = retData.bFullGun;//全垒打
      this.bFullSpecial = retData.bFullSpecial;//特殊牌型
      this.bGun = retData.bGun;//打枪
      this.bHasSpecial = retData.bHasSpecial;//是否特殊牌型
      this.turePlayersCount = retData.turePlayersCount;//真实打牌的人个数
      this.userarray = retData.userarray;//玩家数据
      this.bGameOver = retData.bGameOver;
      // if( this.roomType < 2){
      //   this.isPlaying = false;
      // }
    }
    else if (cmd == SSSCommand.RESP_CMD.RCMD_RestoreGame) {
      //恢复牌局
    }
    else {
      cc.log("无效 cmd = " + cmd);
    }

    this.node.emit('RCMD_Command', data);
  },

  /**
   * 房卡房间游戏结束
   * @param data
   */
  RCMD_MatchOver: function (data) {
    cc.log('RCMD_MatchOver', data);
    if (data.count == 0) {
      let self = this;
      showAlertBox('房主解散了房间', function () {
        self.backLobby();
      });
    } else {
      this.node.emit('RCMD_MatchOver', data);
    }
  },

  /**
   *  返回大厅
   */
  backLobby: function () {
    // let backscene = !!config.roomScene ? config.roomScene : config.lobbyScene;
    // cc.director.loadScene(backscene);

    if(this.roomType <2){
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

  onExit: function () {

    cc.log('退出游戏===========',this.isPlaying,this.roomType)

    if (this.roomType > 10 || !PomeloClient.isConnected) {  // 复盘
      this.backLobby();
      return;
    }

    if (this.isPlaying) {
       showAlert("正在游戏中无法退出");
       return
    }

    let self = this;

    if (self.roomType == 2 ) {
        var tips = UserCenter.getUserID() == self.createRoomID ? "退出后房间将保留，是否退出房间？" : "是否直接退出？";
        showAlertBox(tips, function () {
            if (UserCenter.getUserID() != self.createRoomID) {
                self.node.emit('CMD_forceGameOver');
            }
            self.removePomeloListeners();
            self.backLobby();
        });
        return;
    }else  if(self.roomType < 2 ){
        self.CMD_Exit();
        // self.nextAction();
    }
  },


  /**
   * 退出游戏服务器
   * @param cb
   */
  exitGame: function (cb) {
    let route = this.game.server + '.CMD_Exit';
    PomeloClient.request(route, cb);
  },

  addPomeloListeners: function () {
    // 消息队列
    for (var i = 0; i < SssManager.msgRCMDQueue.length; i++) {
      pomelo.on(SssManager.msgRCMDQueue[i], this.msgQueue.bind(this));
    }

    //不需要加入队列的消息
    for (var i = 0; i < SssManager.msgRCMDList.length; i++) {
      var msg = SssManager.msgRCMDList[i];
      pomelo.on(msg, this[msg].bind(this));
    }
  },


  removePomeloListeners: function () {
    for (let i = 0; i < SssManager.msgRCMDQueue.length; i++) {
      pomelo.removeAllListeners(SssManager.msgRCMDQueue[i]);
    }

    //不需要加入队列的消息
    for (let i = 0; i < SssManager.msgRCMDList.length; i++) {
      pomelo.removeAllListeners(SssManager.msgRCMDList[i]);
    }
  },

  /**
   * 把消息放入队列
   * @param data
   */
  msgQueue: function (data) {
    cc.log(data);
    let cmd = data.cmd;
    let route = data.route;
    if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
      cc.log(data);
      cc.log("cmd = 0x" + data.cmd.toString(16));
      this[route](data);
    } else if (route == "RCMD_MatchOver" && this.currGame < this.totalGame) {
      //协商解散的指令立即解散
      this[route](data);
    } else {
      this.msgList.push(data);
    }
  },

  getPokerWeightByPoker: function (poker) {
    return poker.getComponent("sss1Poker").weight;
  },

  getPokerTypeByPoker: function (poker) {
    return poker.getComponent("sss1Poker").type;
  },

  getPokerNumByPoker: function (poker) {
    return poker.getComponent("sss1Poker").num;
  },


  /**
   * 排序
   *  如果要按从小到大排序，function sortNum(a, b) { return a-b};
   如果要按从大到小排序，function sortNum(a, b) { return b-a};
   如果打乱数组，function sortNum() { return 0.5 - Math.random()};
   */
  sortPokers: function (pokers) {
    let self = this;
    pokers.sort(function (a, b) {
      return self.getPokerWeightByPoker(b) - self.getPokerWeightByPoker(a);
    });
  },

  sortSelectedNumPokers: function (pokers) {
    let self = this;
    pokers.sort(function (a, b) {
      return self.getPokerNumByPoker(b) - self.getPokerNumByPoker(a);
    });
  },
  /**
   * 获取权重(A最大,黑红梅方)
   * @param type
   * @param num
   *
   */
  getPokerWeight: function (type, num) {
    let weight;
    if (num == 1) {
      weight = 1000000;
    } else {
      weight = num * 1000;
    }

    weight += 4 - type;
    return weight;
  },


  /**
   * 对子
   * @param pokers
   * @returns {Array}
   */
  getDuizi: function (pokers) {
    let arr = [];
    if (pokers.length < 2) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 2);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];

      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])) {
        arr.push(temp);
      }
    }
    return arr;
  },

  /**
   * 两对
   * @param pokers
   * @returns {Array}
   */
  getLiangdui: function (pokers) {
    let arr = [];
    if (pokers.length < 4) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 4);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);
      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
        this.getPokerNumByPoker(temp[2]) == this.getPokerNumByPoker(temp[3])) {
        arr.push(temp);
      }
    }

    return arr;
  },

  /**
   * 三条
   * @param pokers
   * @returns {Array}
   */
  getSantiao: function (pokers) {
    let arr = [];
    if (pokers.length < 3) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 3);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);


      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
        this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])) {
        arr.push(temp);
      }
    }
    return arr;
  },

  /**
   * 顺子
   * @param pokers
   * @returns {Array}
   */
  getShunzi: function (pokers) {
    let arr = [];
    if (pokers.length < 5) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);

      if (this.getPokerNumByPoker(temp[4]) == 1) {
        if ((this.getPokerNumByPoker(temp[0]) == 13 &&
            this.getPokerNumByPoker(temp[1]) == 12 &&
            this.getPokerNumByPoker(temp[2]) == 11 &&
            this.getPokerNumByPoker(temp[3]) == 10) ||

          (this.getPokerNumByPoker(temp[0]) == 5 &&
            this.getPokerNumByPoker(temp[1]) == 4 &&
            this.getPokerNumByPoker(temp[2]) == 3 &&
            this.getPokerNumByPoker(temp[3]) == 2)) {
          arr.push(temp);
        }
      } else {
        if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) + 1 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) + 2 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) + 3 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) + 4
        ) {
          arr.push(temp);
        }

      }
    }
    cc.log(arr);
    return arr;
  },

  /**
   * 同花
   * @param pokers
   * @returns {Array}
   */
  getTonghua: function (pokers) {
    let arr = [];
    if (pokers.length < 5) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];

      this.getPokerTypeByPoker(temp[0])
      if (this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[3]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[4])
      ) {
        arr.push(temp);
      }
    }
    return arr;
  },

  /**
   * 葫芦
   * @param pokers
   * @returns {Array}
   */
  getHulu: function (pokers) {
    let arr = [];
    if (pokers.length < 5) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 3);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);

      if ((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]))
      ) {
        arr.push(temp);
      }
    }

    let retArr = [];

    //选最小的牌
    for (let i = 0; i < arr.length; i++) {
      let temp = arr[i];
      let duiziArr = this.getRemainDuizi(pokers, temp);
      for (let j = 0; j < duiziArr.length; j++) {
        let duizi = duiziArr[j];
        let findHulu = [];
        findHulu.push(temp[0]);
        findHulu.push(temp[1]);
        findHulu.push(temp[2]);
        findHulu.push(duizi[0]);
        findHulu.push(duizi[1]);
        this.sortSelectedNumPokers(findHulu);
        retArr.push(findHulu);
      }
    }
    cc.log(retArr);
    return retArr;
  },


  /**
   * 铁支
   * @param pokers
   * @returns {Array}
   */
  getTiezhi: function (pokers) {
    let arr = [];
    if (pokers.length < 5) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 4);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];

      if ((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]))
      ) {
        arr.push(temp);
      }
    }
    cc.log(arr);
    return arr;
  },

  /**
   * 同花顺
   * @param pokers
   * @returns {Array}
   */
  getTonghuashun: function (pokers) {
    let arr = [];
    if (pokers.length < 5) {
      return arr;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];

      if (this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[3]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[4])
      ) {
        this.sortSelectedNumPokers(temp);
        if (this.getPokerNumByPoker(temp[4]) == 1) {
          if ((this.getPokerNumByPoker(temp[0]) == 13 &&
              this.getPokerNumByPoker(temp[1]) == 12 &&
              this.getPokerNumByPoker(temp[2]) == 11 &&
              this.getPokerNumByPoker(temp[3]) == 10) ||

            (this.getPokerNumByPoker(temp[0]) == 5 &&
              this.getPokerNumByPoker(temp[1]) == 4 &&
              this.getPokerNumByPoker(temp[2]) == 3 &&
              this.getPokerNumByPoker(temp[3]) == 2)) {
            arr.push(temp);
          }
        } else {
          if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) + 1 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) + 2 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) + 3 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) + 4
          ) {
            arr.push(temp);
          }
        }
      }
    }
    cc.log(arr);
    return arr;
  },


  isHasDuizi: function (pokers) {
    let arr = [];
    if (pokers.length < 2) {
      return false;
    }
    let ret = SssManager.combination(pokers, 2);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])) {
        return true;
      }
    }
    return false;
  },

  /**
   * 两对
   * @param pokers
   * @returns {Array}
   */
  isHasLiangdui: function (pokers) {
    if (pokers.length < 4) {
      return false;
    }
    let ret = SssManager.combination(pokers, 4);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);
      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) && this.getPokerNumByPoker(temp[2]) == this.getPokerNumByPoker(temp[3])) {
        return true;
      }
    }
    return false;
  },

  /**
   * 三条
   * @param pokers
   * @returns {Array}
   */
  isHasSantiao: function (pokers) {
    if (pokers.length < 3) {
      return false;
    }
    let ret = SssManager.combination(pokers, 3);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);
      if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
        this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
        this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2])) {
        return true;
      }
    }
    return false;

  },

  /**
   * 顺子
   * @param pokers
   * @returns {Array}
   */
  isHasShunzi: function (pokers) {
    if (pokers.length < 5) {
      return false;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);
      if (this.getPokerNumByPoker(temp[4]) == 1) {
        if ((this.getPokerNumByPoker(temp[0]) == 13 &&
            this.getPokerNumByPoker(temp[1]) == 12 &&
            this.getPokerNumByPoker(temp[2]) == 11 &&
            this.getPokerNumByPoker(temp[3]) == 10) ||

          (this.getPokerNumByPoker(temp[0]) == 5 &&
            this.getPokerNumByPoker(temp[1]) == 4 &&
            this.getPokerNumByPoker(temp[2]) == 3 &&
            this.getPokerNumByPoker(temp[3]) == 2)) {
          return true;
        }
      } else {
        if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) + 1 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) + 2 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) + 3 &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) + 4
        ) {
          return true;
        }

      }
    }
    return false;
  },

  /**
   * 同花
   * @param pokers
   * @returns {Array}
   */
  isHasTonghua: function (pokers) {
    if (pokers.length < 5) {
      return false;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      if (this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[3]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[4])
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * 葫芦
   * @param pokers
   * @returns {Array}
   */
  isHasHulu: function (pokers) {
    if (pokers.length < 5) {
      return false;
    }
    let ret = SssManager.combination(pokers, 3);
    let arr = [];
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      this.sortSelectedNumPokers(temp);

      if ((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]))
      ) {
        arr.push(temp);
      }
    }

    //选最小的牌
    for (let i = 0; i < arr.length; i++) {
      let temp = arr[i];
      for (let j = pokers.length - 1; j >= 0; j--) {
        if (j > 0 && this.getPokerNumByPoker(temp[0]) != this.getPokerNumByPoker(pokers[j]) && this.getPokerNumByPoker(temp[0]) != this.getPokerNumByPoker(pokers[j - 1])
          && (this.getPokerNumByPoker(pokers[j]) == this.getPokerNumByPoker(pokers[j - 1]))
        ) {
          return true;
        }
      }
    }
    return false;
  },


  /**
   * 铁支
   * @param pokers
   * @returns {Array}
   */
  isHasTiezhi: function (pokers) {
    if (pokers.length < 5) {
      return false;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];

      if ((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
          this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3])) ||

        (this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2]) &&
          this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[3]) &&
          this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[4]))
      ) {
        return true;
      }
    }
    return false;
  },

  /**
   * 同花顺
   * @param pokers
   * @returns {Array}
   */
  isHasTonghuashun: function (pokers) {
    if (pokers.length < 5) {
      return false;
    }
    let ret = SssManager.combination(pokers, 5);
    for (let i = 0; i < ret.length; i++) {
      let temp = ret[i];
      if (this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[3]) &&
        this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[4])
      ) {
        this.sortSelectedNumPokers(temp);
        if (this.getPokerNumByPoker(temp[4]) == 1) {
          if ((this.getPokerNumByPoker(temp[0]) == 13 &&
              this.getPokerNumByPoker(temp[1]) == 12 &&
              this.getPokerNumByPoker(temp[2]) == 11 &&
              this.getPokerNumByPoker(temp[3]) == 10) ||

            (this.getPokerNumByPoker(temp[0]) == 5 &&
              this.getPokerNumByPoker(temp[1]) == 4 &&
              this.getPokerNumByPoker(temp[2]) == 3 &&
              this.getPokerNumByPoker(temp[3]) == 2)) {
            return true;
          }
        } else {
          if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) + 1 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) + 2 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) + 3 &&
            this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) + 4
          ) {
            return true;
          }
        }
      }
    }
    return false;
  },


  /**
   * 判断两个乌龙的大小
   * @param poker1
   * @param poker2
   */
  judgeWulong: function (pokers1, pokers2) {
    let length1 = pokers1.length;
    let length2 = pokers2.length;
    let length = length1 < length2 ? length1 : length2;

    for (let i = 0; i < length; i++) {
      let tempPoker1 = pokers1[i];
      let tempPoker2 = pokers2[i];
      if (this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2)) {

      } else {
        return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
      }
    }
    //都相同，比第一个
    let tempPoker1 = pokers1[0];
    let tempPoker2 = pokers2[0];
    return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
  },


  /**
   * 判断对子
   * @param pokers1
   * @param pokers2
   */
  judgeDuizi: function (pokers1, pokers2) {
    let tempPokerArr1 = [];
    let sanPokerArr1 = [];
    let tempPokerArr2 = [];
    let sanPokerArr2 = [];

    let prePoker;
    let flag = false;
    for (let i = 0; i < pokers1.length; i++) {
      prePoker = pokers1[i];
      for (let j = i + 1; j < pokers1.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers1[j])) {
          if (tempPokerArr1.length == 0) {
            //放入对子数组
            tempPokerArr1.push(prePoker);
            tempPokerArr1.push(pokers1[j]);
          }
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }

    //获取散牌
    for (let i = 0; i < pokers1.length; i++) {
      if (!(pokers1[i] == tempPokerArr1[0] || pokers1[i] == tempPokerArr1[1])) {
        sanPokerArr1.push(pokers1[i]);
      }
    }

    flag = false;
    for (let i = 0; i < pokers2.length; i++) {
      prePoker = pokers2[i];
      for (let j = i + 1; j < pokers2.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers2[j])) {
          if (tempPokerArr2.length == 0) {
            //放入对子数组
            tempPokerArr2.push(prePoker);
            tempPokerArr2.push(pokers2[j]);
          }
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }


    //获取散牌
    for (let i = 0; i < pokers2.length; i++) {
      if (!(pokers2[i] == tempPokerArr2[0] || pokers2[i] == tempPokerArr2[1])) {
        sanPokerArr2.push(pokers2[i]);
      }
    }

    if (this.getPokerNumByPoker(tempPokerArr1[0]) == this.getPokerNumByPoker(tempPokerArr2[0])) {
      let sanLength = sanPokerArr1.length < sanPokerArr2.length ? sanPokerArr1.length : sanPokerArr2.length;
      for (let i = 0; i < sanLength; i++) {
        if (this.getPokerWeightByPoker(sanPokerArr1[i]) == this.getPokerWeightByPoker(sanPokerArr2[i])) {
        } else {
          //比较散牌
          return this.getPokerWeightByPoker(sanPokerArr1[i]) > this.getPokerWeightByPoker(sanPokerArr2[i]);
        }
      }
      //都想相同，比较散排第一张
      return this.getPokerWeightByPoker(sanPokerArr1[0]) > this.getPokerWeightByPoker(sanPokerArr2[0]);
    } else {
      return this.getPokerWeightByPoker(tempPokerArr1[0]) > this.getPokerWeightByPoker(tempPokerArr2[0]);
    }

    //比花色
    for (let i = 0; i < 5; i++) {
      return this.getPokerWeightByPoker(pokers1[i]) > this.getPokerWeightByPoker(pokers1[i]);
    }
  },

  /**
   * 判断两对大小
   * @param pokers1
   * @param pokers2
   */
  judgeLiangdui: function (pokers1, pokers2) {
    // let tempPoker1;
    // let tempPoker2;
    // if(this.getPokerNumByPoker(pokers1[0]) == this.getPokerNumByPoker(pokers1[1]))
    // {
    //     tempPoker1 = pokers1[0];
    // }else
    // {
    //     tempPoker1 = pokers1[1];
    // }
    //
    // if(this.getPokerNumByPoker(pokers2[0]) == this.getPokerNumByPoker(pokers2[1]))
    // {
    //     tempPoker2 = pokers2[0];
    // }else
    // {
    //     tempPoker2 = pokers2[1];
    // }
    // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);

    let tempPoker1Arr = [];
    let sanPoker1;
    let tempPoker2Arr = [];
    let sanPoker2;

    let prePoker;
    for (let i = 0; i < pokers1.length; i++) {
      prePoker = pokers1[i];
      for (let j = i + 1; j < pokers1.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers1[j])) {
          tempPoker1Arr.push(prePoker);
          tempPoker1Arr.push(pokers1[j]);
          break;
        }
      }
    }

    //获取散牌
    for (let i = 0; i < pokers1.length; i++) {
      let flag = false;
      for (let j = 0; j < tempPoker1Arr.length; j++) {
        if (pokers1[i] == tempPoker1Arr[j]) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        sanPoker1 = pokers1[i];
        break;
      }
    }

    for (let i = 0; i < pokers2.length; i++) {
      prePoker = pokers2[i];
      for (let j = i + 1; j < pokers2.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers2[j])) {
          tempPoker2Arr.push(prePoker);
          tempPoker2Arr.push(pokers2[j]);
          break;
        }
      }
    }

    //获取散牌
    for (let i = 0; i < pokers2.length; i++) {
      let flag = false;
      for (let j = 0; j < tempPoker2Arr.length; j++) {
        if (pokers2[i] == tempPoker2Arr[j]) {
          flag = true;
          break;
        }
      }
      if (!flag) {
        sanPoker2 = pokers2[i];
        break;
      }
    }

    if (this.getPokerNumByPoker(tempPoker1Arr[0]) == this.getPokerNumByPoker(tempPoker2Arr[0])) {
      if (this.getPokerNumByPoker(tempPoker1Arr[2]) == this.getPokerNumByPoker(tempPoker2Arr[2])) {
        if (this.getPokerWeightByPoker(sanPoker1) == this.getPokerWeightByPoker(sanPoker2)) {
          //比花色
          for (let i = 0; i < 5; i++) {
            return this.getPokerWeightByPoker(pokers1[i]) > this.getPokerWeightByPoker(pokers1[i]);
          }
        } else {
          //比散牌
          return this.getPokerWeightByPoker(sanPoker1) > this.getPokerWeightByPoker(sanPoker2);
        }
      } else {
        return this.getPokerWeightByPoker(tempPoker1Arr[2]) > this.getPokerWeightByPoker(tempPoker2Arr[2]);
      }
    } else {
      return this.getPokerWeightByPoker(tempPoker1Arr[0]) > this.getPokerWeightByPoker(tempPoker2Arr[0]);
    }
  },


  /**
   * 判断三条和铁支
   * @param pokers1
   * @param pokers2
   * @returns {boolean}
   */
  judgeSantiaoTiezhi: function (pokers1, pokers2) {
    let tempPoker1;
    let tempPoker2;

    let prePoker;
    let flag = false;
    for (let i = 0; i < pokers1.length; i++) {
      prePoker = pokers1[i];
      for (let j = i + 1; j < pokers1.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers1[j])) {
          tempPoker1 = prePoker;
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }

    flag = false;
    for (let i = 0; i < pokers2.length; i++) {
      prePoker = pokers2[i];
      for (let j = i + 1; j < pokers2.length; j++) {
        if (this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers2[j])) {
          tempPoker2 = prePoker;
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }
    return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
  },

  /**
   *
   *  判断三条大小
   * @param pokers1
   * @param pokers2
   */
  judgeSantiao: function (pokers1, pokers2) {
    return this.judgeSantiaoTiezhi(pokers1, pokers2);
  },


  /**
   * 判断顺子大小
   * @param pokers1
   * @param pokers2
   * @returns {*}
   */
  judgeShunzi: function (pokers1, pokers2) {
    return this.judgeWulong(pokers1, pokers2);
    // let tempPoker1 = pokers1[0];
    // let tempPoker2 = pokers2[0];
    //
    // //A 5 4 3 2
    // if(this.getPokerNumByPoker(pokers1[0]) == 1 && this.getPokerNumByPoker(pokers1[1]) == 5)
    // {
    //     tempPoker1 =this.getPokerNumByPoker(pokers1[1]);
    // }
    //
    // //A 5 4 3 2
    // if(this.getPokerNumByPoker(pokers2[0]) == 1 && this.getPokerNumByPoker(pokers2[1]) == 5)
    // {
    //     tempPoker2 =this.getPokerNumByPoker(pokers2[1]);
    // }
    //
    // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
  },


  /**
   * 判断同花大小
   * @param pokers1
   * @param pokers2
   * @returns {*}
   */
  judgeTonghua: function (pokers1, pokers2) {
    // let tempPoker1 = pokers1[0];
    // let tempPoker2 = pokers2[0];
    // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    return this.judgeWulong(pokers1, pokers2);
  },


  /**
   * 判断葫芦大小
   * @param pokers1
   * @param pokers2
   * @returns {*}
   */
  judgeHulu: function (pokers1, pokers2) {
    let tempPoker1;
    let tempPoker2;
    if (this.getPokerNumByPoker(pokers1[0]) == this.getPokerNumByPoker(pokers1[1]) &&
      this.getPokerNumByPoker(pokers1[0]) == this.getPokerNumByPoker(pokers1[2])) {
      tempPoker1 = pokers1[0];
    } else {
      tempPoker1 = pokers1[2];
    }


    if (this.getPokerNumByPoker(pokers2[0]) == this.getPokerNumByPoker(pokers2[1]) &&
      this.getPokerNumByPoker(pokers2[0]) == this.getPokerNumByPoker(pokers2[2])) {
      tempPoker2 = pokers2[0];
    } else {
      tempPoker2 = pokers2[2];
    }
    return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
  },

  /**
   *  判断铁支大小
   * @param pokers1
   * @param pokers2
   */
  judgeTiezhi: function (pokers1, pokers2) {
    return this.judgeSantiaoTiezhi(pokers1, pokers2);
  },


  /**
   * 判断同花顺大小
   * @param pokers1
   * @param pokers2
   * @returns {*}
   */
  judgeTonghuashun: function (pokers1, pokers2) {
    // let tempPoker1 = pokers1[0];
    // let tempPoker2 = pokers2[0];
    // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);

    return this.judgeWulong(pokers1, pokers2);
  },

  /**
   *  判断两组相同牌型组合的大小
   * @param pokersWeight
   * @param pokers1
   * @param pokers2
   */
  judgeWeightByPokersWeight(pokersWeight, pokers1, pokers2) {
    let ret = false;
    if (pokersWeight == 0) {
      ret = this.judgeWulong(pokers1, pokers2)
    } else if (pokersWeight == 1) {
      ret = this.judgeDuizi(pokers1, pokers2)
    } else if (pokersWeight == 2) {
      ret = this.judgeLiangdui(pokers1, pokers2)
    } else if (pokersWeight == 3) {
      ret = this.judgeSantiao(pokers1, pokers2)
    } else if (pokersWeight == 4) {
      ret = this.judgeShunzi(pokers1, pokers2)
    } else if (pokersWeight == 5) {
      ret = this.judgeTonghua(pokers1, pokers2)
    } else if (pokersWeight == 6) {
      ret = this.judgeHulu(pokers1, pokers2)
    } else if (pokersWeight == 7) {
      ret = this.judgeTiezhi(pokers1, pokers2)
    } else if (pokersWeight == 8) {
      ret = this.judgeTonghuashun(pokers1, pokers2)
    }
    return ret;
  },

  /**
   * 获取散牌
   * @param except
   */
  getSanpai: function (pokers, except) {
    let ret = [];
    let obj = {};
    // if(except!=null)
    for (let i = 0; i < pokers.length; i++) {
      let poker = pokers[i];
      if (except != null) {
        let flag = false;
        for (let j = 0; j < except.length; j++) {
          if (poker == except[j]) {
            flag = true;
            break;
          }
        }

        if (flag) {
          continue;
        }
      }

      let num = this.getPokerNumByPoker(poker);
      if (obj["p_" + num] == null) {
        obj["p_" + num] = [];
      }
      obj["p_" + num].push(poker);
    }

    for (let num = 2; num < 14; num++) {
      if (obj["p_" + num] != null && obj["p_" + num].length == 1) {
        ret.push(obj["p_" + num][0]);
      }
    }

    //A 牌
    let num = 1;
    if (obj["p_" + num] != null && obj["p_" + num].length == 1) {
      ret.push(obj["p_" + num][0]);
    }

    return ret;
  },


  /**
   * 获取剩余牌的组合
   * @param except
   */
  getRemainDuizi: function (pokers, except) {
    let ret = [];
    let obj = {};
    // if(except!=null)
    for (let i = 0; i < pokers.length; i++) {
      let poker = pokers[i];
      if (except != null) {
        let flag = false;
        for (let j = 0; j < except.length; j++) {
          if (poker == except[j]) {
            flag = true;
            break;
          }
        }

        if (flag) {
          continue;
        }
      }

      let num = this.getPokerNumByPoker(poker);
      if (obj["p_" + num] == null) {
        obj["p_" + num] = [];
      }
      obj["p_" + num].push(poker);
    }

    for (let targetNum = 2; targetNum <= 4; targetNum++) {
      //对子start
      for (let num = 2; num < 14; num++) {
        if (obj["p_" + num] != null && obj["p_" + num].length == targetNum) {
          ret.push([obj["p_" + num][0], obj["p_" + num][1]]);
        }
      }

      let num = 1;
      if (obj["p_" + num] != null && obj["p_" + num].length == targetNum) {
        ret.push([obj["p_" + num][0], obj["p_" + num][1]]);
      }

      //如果有对子，就不用去拆分了
      if (targetNum == 2 && ret.length > 0) {
        break;
      } else if (targetNum == 3 && ret.length > 0) {
        break;
      }
      //对子end
    }
    return ret;
  },
});
