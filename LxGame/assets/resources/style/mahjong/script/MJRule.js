var LoadGame = require('LoadGame');
var config = require('Config');
const GamePlayer = require('GamePlayer');
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
const CMD_ACTION = Command.CMD_ACTION;
const EATFLAG = Command.EATFLAG;
var PLAYER_NUM = 4;
const MJType = require('MJType');
const MJCardResource = require('MJCardResource');

// 吃碰杠胡预制体
const OPCMDAnimPath = {
	0x02: 'style/mahjong/mah/prefab/optAni/eatAni',   // 吃
	0x04: 'style/mahjong/mah/prefab/optAni/hitAni',
	0x08: 'style/mahjong/mah/prefab/optAni/barAni',
	0x20: 'style/mahjong/mah/prefab/optAni/huAni',
	0x300: 'style/mahjong/mah/prefab/optAni/liujuAni',
	0x8003: 'style/mahjong/mah/prefab/optAni/buhuaAni'
}

// bigOutCardPos
const BigOutCardPos = [
	{x: 677, y: 300},
	{x: 1100, y: 375},
	{x: 667, y: 500},
	{x: 240, y: 375},
]

// 吃碰杠方位位置
const OPCMDPos = [
	{x: 667, y: 250},
	{x: 1000, y: 375},
	{x: 667, y: 600},
	{x: 270, y: 300}
]

cc.Class({
	extends: cc.Component,
	properties: {},

	onLoad: function () {
		let self = this;
		this.paiNum = 136
		this.game = LoadGame.getCurrentGame();
		this._animStatus = false;
		this.msgList = [];
		this.addPomeloListeners();
		this.addGameListeners();
		this.autoCi = 0;
		this._isplaying = false;
		this.iBD = 0;
		this._renders = [];// 财神值
		// 单机出牌 默认双击出牌
		if (!!this.game) {
			if (!!this.game.SingleClick && !!this.game.SingleClick.length) {
				this.bSingleClick = this.game.SingleClick[1];
				this.bSingleClick = parseInt(cc.sys.localStorage.getItem('SingleClick') || this.bSingleClick);
			} else {
				this.bSingleClick = parseInt(cc.sys.localStorage.getItem('SingleClick') || 0);
			}
		}

		self._position = this.node.getComponent('MJGame')?this.node.getComponent('MJGame').position.getComponent('Position'):this.node.getComponent('MJGame_Match').position.getComponent('Position');
		self._position.sendRule(self)

		this.opcodeAnim = {};                 // 吃碰杠胡缓存

		self.BDFrame = this.node.getComponent('MJGame')?this.node.getComponent('MJGame').BDFrame.getComponent('BDControler'):this.node.getComponent('MJGame_Match').BDFrame.getComponent('BDControler');

		cc.loader.loadRes('style/mahjong/mah/texture/jiantou', cc.SpriteFrame, function (err, spriteFrame) {
			if (err) {
				cc.log(err);
				return;
			}
			self._outTips = new cc.Node();
			let sprite = self._outTips.addComponent(cc.Sprite);
			sprite.spriteFrame = spriteFrame;
			self._outTips.active = false;

		});

		this._initDataFinish = false;

		this.init()
	},

	init: function () {
		console.log('我是预留')
	}

	,

	//监听游戏结束 执行结算框加载
	Result: function (huInfo, users, data) {
		let self = this;
		let path;
		if (!!this.game.prefab.mahresult) {
			path = 'game/{0}/prefab/mahresult/mahresult'.format(self.game.sourcePath);
		} else {
			path = 'style/mahresult/mahresult'
		}
		cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			var node = cc.instantiate(prefab);
			node.parent = self.node.parent;
			var controller = node.getComponent('MahResultController');
			controller.showResult(self, huInfo, data);
		});
	}
	,

	getCustomResult: function () {
		//this.resultLayer;
	}
	,

	addGameListeners: function () {
		// 监听退出消息
		this.node.on('onExit', this.onExit, this);
		this.node.on('CMD_Ready', this.sendStart, this);
		this.node.on('DO_CANCEL', this.doDefault, this);
		this.node.on('MULTI_EAT', this.doEatMulti, this);
		// this.node.on('TIME_OUT', this.overTime, this);
		this.node.on('NEXT_ACTION', this.nextAction, this);
		this.node.on('msg_onceAgain', this.onceAgain, this);
		GlobEvent.on("AUTO_PLAY", this.autoPlay.bind(this));
		GlobEvent.on('SINGLE_CHANGE', this.singleChange.bind(this));
		GlobEvent.on('LANGUAGE_CHANGE', this.languageChange.bind(this));

		// this.node.on('TEST_ING',this.test,this);
	}
	,
	autoPlay: function (data) {
		this.isAutoPlay = data;
		if (this.isAutoPlay) {
			this.overTime();
		} else {
			this.autoCi = 0;
		}
	}
	,
	/**
	 * 点击修改
	 * @param event
	 */
	singleChange: function (event) {
		this.bSingleClick = event;
		cc.log(this.bSingleClick);
	}
	,
	languageChange: function (event) {
		this.bLanguageSound = event;
		this.soundCtrl.setPlayLanguageSound(this.bLanguageSound);
		cc.log(this.bLanguageSound);
	}
	,


	onExit: function () {
		let self = this;

		// 复盘
		if (this.roomType > 10 || !PomeloClient.isConnected) {
			this.backLobby();
			return;
		}
		cc.log(this._isplaying)
		if (this._isplaying) {
			showAlert("您正在游戏中，请完成牌局再退出");
			return
		}

		if (this.roomType == 2) {
			var tips = UserCenter.getUserID() == this.roomuserid ? "退出后房间将保留，是否退出房间？" : "是否直接退出？";
			showAlertBox(tips, function () {
				if (UserCenter.getUserID() != self.roomuserid) {
					cc.log('解散了房间', UserCenter.getUserID(), self.roomuserid)
					self.node.emit('CMD_forceGameOver');
				}
				self.removePomeloListeners();
				self.backLobby();
			});
			return;
		} else if (this.roomType < 2) {
			self.cmd_exit();
			this.nextAction();
		}
	}
	,

	cmd_exit: function () {
		let route = this.game.server + '.CMD_Exit';
		PomeloClient.request(route);
	}
	,

	/**
	 * 退出游戏服务器
	 * @param cb
	 */
	exitGame: function (cb) {
		if (!this.game) {
			this.backLobby();
			return;
		}
		let route = this.game.server + '.CMD_Exit';
		PomeloClient.request(route, cb);
	}
	,

	/**
	 *  返回大厅
	 */
	backLobby: function () {
		cc.log('返回大厅')
		//let backscene = this.roomType <2 ? config.roomScene : config.lobbyScene;
		if (this.roomType < 2) {
			// this.scheduleOnce(function () {
			let backscene = config.roomScene;
			cc.director.loadScene(backscene, function (err) {
				if (err) {
					cc.log(err);
					hideLoadingAni();
					return;
				}
				let gameScript = cc.find('Canvas').getComponent('gameScript')
				gameScript.reInRoom()
			});
			// },0.2)

		} else {
			let backscene = config.lobbyScene;
			cc.director.loadScene(backscene);
		}

	}
	,

	onceAgain: function (event) {
		this.nextAction(event);
		this.sendStart();
	}
	,

	/**
	 *  初始化参数
	 */
	resetGame: function () {
		this._isplaying = false;            // 是否在游戏中
		this.masterId = 0;   //庄家id
		this.lastPlayId = 0;
		this.lastOutPai = 0;
		this.activePlayer = 0;
		this._opcode = RCMD_ACTION.optNull;
		this.remainderPai = this.game.totalCards || 136;      // 剩余牌张数
		for (let i = 0; i < this._renders.length; i++) {
			var render = this._renders[i];
			render.clearForGame();
		}
	}
	,

	// 游戏开始
	sendStart: function () {
		var route = this.game.server + '.CMD_Ready';
		PomeloClient.request(route);
	}
	,

	sendAction: function (opCode, lps) {
		let msg = {};
		msg.opcode = opCode;
		msg.lps = lps;

		if (arguments.length >= 3) {
			msg.pai1 = arguments[2];
		}
		if (arguments.length >= 4) {
			msg.pai2 = arguments[3];
		}
		this._opcode = RCMD_ACTION.optNull;
		PomeloClient.request(this.game.server + '.CMD_Action', msg, function (data) {
			//cc.log(data);
		});
	}
	,

	sendExpend: function (data, cb) {
		PomeloClient.request(this.game.server + '.CMD_Expend', {
			data: data
		}, function (data) {
			if (!!cb) {
				cb(data)
			}
			cc.log(data);
		});
	}
	,
	/**
	 *  初始化绘图顺序
	 */
	initRender: function () {
		cc.log(this._renders.length)
		if (!this._renders.length) {
			for (let i = 0; i < 4; i++) {
				let node = new cc.Node();
				this._renders[i] = node.addComponent('MJRender');
				node.parent = this.node;
				node.setLocalZOrder(10 - i);
				// this._renders[i].init(i, this.game.handCards, scale[i], this);
			}
		}
		let scale = [0.85, 0.8, 1, 0.8];

		if (this.game.handCards < 16) {
			scale = [1, 0.9, 1, 0.9];
		}
		for (let i = 0; i < 4; i++) {
			this._renders[i].init(i, this.game.handCards, scale[i], this);
		}

	}
	,


	getSeatIdByChair: function (chair) {
		chair = chair || 0;
		return (this.seatId - 1 + chair) % PLAYER_NUM + 1;

	}
	,

	getChairBySeatId: function (seatId) {
		return (seatId - this.seatId + PLAYER_NUM) % PLAYER_NUM;
	}
	,

	/**
	 *  逻辑判断
	 */

	/**
	 *  是否财神
	 * @param value
	 */
	isBD: function (value) {
		return this.iBD == value;
	}
	,

	getBD: function () {
		return this.iBD;
	}
	,

	// 处理是否可以出的牌
	handleOutCards: function () {
		cc.log('handleOutCards')
		let mjcards = this._renders[0]._hands.getMJCards();
		for (let i = 0; i < mjcards.length; i++) {
			let value = mjcards[i].getValue();
			if (this.cannotOutCard(value, i == mjcards.length - 1)) {
				cc.log('setMasterCard : ');
				mjcards[i].setCardMask();
			}
		}
	}
	,

	clearHandleCards: function () {
		let mjcards = this._renders[0]._hands.getMJCards();
		for (let i = 0; i < mjcards.length; i++) {
			mjcards[i].clearCardMask();
		}
	}
	,

	/**
	 * 牌是否可以出  默认花牌不可以出
	 * @param value
	 * @param isGet  牌位置
	 */
	cannotOutCard: function (value, isGet) {
		return MJType.isFlower(value);
	}
	,

	/**
	 * 牌是否可以补杠
	 * @param value
	 * @param isGet
	 * @returns {boolean}
	 */
	canSupplyBar: function (value, isGet) {
		return true;
	}
	,

	canAnBar: function (value) {
		return true;
	}
	,

	// 查找补杠  有些麻将不能杠手里的牌
	findSupplyBarCards: function () {
		let bars = [];
		let blockPais = this._renders[0].blockPais;
		//let hands = this._renders[0]._hands;
		let len = this._renders[0]._hands.getMJCards().length;
		let render = this._renders[0];
		for (var i = 0; i < blockPais.length; i++) {
			var block = blockPais[i];
			if (block.blockFlag == EATFLAG.EAT_HIT) {
				let pos = render.findCardValueIndex(block.values[0]);
				if (this.canSupplyBar(block.values[0], pos == len - 1)) {
					if (pos >= 0) {
						bars.push({
							flag: EATFLAG.EAT_BAR,        // 补杠
							pais: [block.values[0]],
							pos: pos
						});
					}
				}
			}
		}

		return bars;
	}
	,

	// 查找暗杠
	findAnBarCards: function () {
		let bars = [];
		let hands = this._renders[0]._hands;
		let mjcards = hands.getMJCards();
		for (let i = 0; i < mjcards.length - 2; i++) {
			let value = mjcards[i].getValue();
			let count = hands.CountPai(value, i);
			if (count == 4 && this.canAnBar(value)) {
				bars.push({
					flag: EATFLAG.EAT_BAR_DRAK,
					pais: [value],
					pos: i
				});
			}
		}

		return bars;
	}
	,

	// 获取左吃
	getLeftPais: function (value) {
		let l1 = this.blockToValue(value);
		let l2 = l1 + 1;
		let l3 = l2 + 1;

		if (MJType.isSameFlower(l1, l2, l3) && l1 >= MJType.PAI.PAI_W1
			&& l3 <= MJType.PAI.PAI_S9) {
			l2 = this.toBlockValue(l2);
			l3 = this.toBlockValue(l3);

			if (this.isBD(l2) || this.isBD(l3)) {
				return null;
			}

			let index1 = this._renders[0].findCardValueIndex(l2);
			if (index1 < 0) return null;

			let index2 = this._renders[0].findCardValueIndex(l3);
			if (index2 < 0) return null;

			return {
				pai0: value,
				pai1: l2,
				pai2: l3,
				dA: index1,
				dB: index2,
				flag: EATFLAG.EAT_LEFT,
				pais: [value, l2, l3]
			}

		} else {
			return null;
		}
	}
	,

	// 获取右吃
	getRightPais: function (value) {
		let l1 = this.blockToValue(value);

		let l2 = l1 - 1;
		let l3 = l2 - 1;

		if (MJType.isSameFlower(l1, l2, l3) && l3 >= MJType.PAI.PAI_W1
			&& l1 <= MJType.PAI.PAI_S9
		) {
			l2 = this.toBlockValue(l2);
			l3 = this.toBlockValue(l3);

			if (this.isBD(l2) || this.isBD(l3)) {
				return null;
			}

			let index1 = this._renders[0].findCardValueIndex(l2);
			let index2 = this._renders[0].findCardValueIndex(l3);
			if (index1 < 0 || index2 < 0) return null;

			return {
				pai0: value,
				pai1: l2,
				pai2: l3,
				dA: index2,
				dB: index1,
				flag: EATFLAG.EAT_RIGHT,
				pais: [l3, l2, value]
			}
		} else {
			return null;
		}
	}
	,

	// 中吃
	getMidPais: function (value) {
		let l1 = this.blockToValue(value);

		let l2 = l1 - 1;
		let l3 = l1 + 1;

		if (MJType.isSameFlower(l1, l2, l3)
			&& l2 >= MJType.PAI.PAI_W1
			&& l3 <= MJType.PAI.PAI_S9
		) {
			l2 = this.toBlockValue(l2);
			l3 = this.toBlockValue(l3);

			if (this.isBD(l2) || this.isBD(l3)) {
				return null;
			}

			let index1 = this._renders[0].findCardValueIndex(l2);
			if (index1 < 0) return null;
			let index2 = this._renders[0].findCardValueIndex(l3);
			if (index2 < 0) return null;

			return {
				pai0: value,
				pai1: l2,
				pai2: l3,
				dA: index1,
				dB: index2,
				flag: EATFLAG.EAT_MID,
				pais: [l2, value, l3]
			}

		} else {
			return null;
		}
	}
	,

	//不能出的牌值
	getCannotOutCards: function () {
		return [];
	}
	,

	/**
	 * 将牌值转换为 吃碰杠的值 财神值转白板
	 * @param value
	 */
	toBlockValue: function (value) {
		if (this.isBD(value) && !!this.game.bBDToValue) {
			return MJType.PAI.PAI_FB;
		}
		return value;
	}
	,

	/**
	 * 吃的牌 白板转财神值
	 * @param blockValue
	 */
	blockToValue: function (blockValue) {
		if (MJType.PAI.PAI_FB == blockValue && this.game.bBDToValue) {
			return this.getBD();
		}

		return blockValue;
	}
	,
	/**
	 * 牌值比较
	 * @param a
	 * @param b
	 */
	compareValue: function (a, b) {
		if (this.isBD(a)) {
			return -1;
		}
		if (this.isBD(b)) {
			return 1;
		}

		return this.getMJWeight(a) - this.getMJWeight(b);
	}
	,

	/**
	 * 获取麻将值权重
	 * @param value
	 */
	getMJWeight: function (value) {
		if (this.isBD(value)) {
			return 0;
		}

		if (value == MJType.PAI.PAI_FB && !!this.game.bBDToValue) {
			if (MJType.invalidPai(value)) {
				return this.getBD();
			} else {
				return value;
			}
		}

		return value;
	}
	,

	/**
	 * 将权重值转为牌值
	 * @param pai
	 */
	toValue: function (pai) {
		if (!!this.game.bBDToValue && this.isBD(pai)) {
			return MJType.PAI.PAI_FB;
		}

		return pai;
	}
	,

	//手牌排序函数
	sortPaisByBD: function (pais, start, end) {
		start = start || 0;
		end = end || pais.length - 1;

		for (let i = start; i < end; i++) {
			for (let j = i + 1; j <= end; j++) {
				if (this.getMJWeight(pais[i]) > this.getMJWeight(pais[j])) {
					let temp = pais[i];
					pais[i] = pais[j];
					pais[j] = temp;
				}
			}
		}
	}
	,

	getChairByUid: function (userid) {
		let seatid = GamePlayer.getSeatByUserid(userid);
		return this.getChairBySeatId(seatid);
	}
	,


	setMaster: function (masterId) {
		this.masterid = masterId;
	}
	,

	/**
	 *
	 * @param data
	 *  flag : 登陆游戏服务器标志 0 成功， 其他，失败
	 */
	RCMD_signup: function (data) {
		cc.log(data.route, data);
		if (!!data.flag) {  // 登陆服务器失败
			hideLoadingAni();
			showAlertBox('进入游戏失败', function () {
				cc.director.loadScene(config.lobbyScene);  // 返回游戏大厅
			});
		}
	}
	,

	/**
	 * 登陆到游戏服务器
	 * flag:4
	 * reason:"房间人满为患！"
	 */
	RCMD_MobileSignUp: function (data) {
		cc.log('RCMD_MobileSignUp', data);
		let flag = data.flag;
		let reason = data.reason;
		let self = this;
		if (flag == 5) {
			hideLoadingAni();
			this.removePomeloListeners();
			showAlertBox(reason, function () {
				self.backLobby();

				// ******************************************************************************//
				//  by Amao  2017.10.24  修改加入自由匹配场 游戏豆不够 点击确定后跳转游戏商城 充值 兑换
				var path = 'style/{0}/prefab/Shop'.format(config.resourcesPath);
				cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
					if (err) {
						cc.log('load prefab failed:', path);
						return;
					}
					var module = cc.instantiate(prefab);
					module.x = cc.winSize.width / 2;
					module.y = cc.winSize.height / 2;
					module.parent = cc.director.getScene();
					if (config.resourcesPath == 'deqing') {
						module.getComponent('style2ShopController2')._selectToggle('2');
					} else {
						module.getComponent('style2ShopController')._selectToggle('2');
					}
				});
				// ******************************************************************************//
			});
		} else if (flag != 0) {
			hideLoadingAni();
			this.removePomeloListeners();
			showAlertBox(reason, function () {
				self.backLobby();
			});
		}
	}
	,

	/**
	 * 显示准备按钮
	 * @param data
	 */
	RCMD_Start: function (data) {
		this.node.emit('RCMD_Start', data);
		// this.activePosition(UserCenter.getUserID(),15)
		this.nextAction();
	}
	,

	/**
	 * 玩家准备
	 * @param data
	 * userid : 玩家id
	 */
	RCMD_Ready: function (data) {
		if (!this._renders) {
			this.nextAction();
			return;
		}
		console.log('RCMD_Ready', data.userid);
		let chair = this.getChairByUid(data.userid);
		this._renders[chair].clearForGame();
		this.node.emit('RCMD_Ready', data);
		this.nextAction();
	}
	,

	/**
	 * 玩家离开
	 * @param data
	 * userid : 玩家id
	 */
	RCMD_exit: function (data) {
		cc.log('执行mjrule RCMD_exit')
		if (!this._renders || !this._initDataFinish) {
			this.nextAction();
			return;
		}
		cc.log(data.userid == UserCenter.getUserID(), data.userid)
		if (data.userid == UserCenter.getUserID()) {
			this.removePomeloListeners();
			this.backLobby();
		} else {
			let chair = this.getChairByUid(data.userid);
			this._renders[chair].clearForGame();
			this.node.emit('RCMD_exit', data);

			this.nextAction();
		}

	}
	,

	/**
	 * 玩家状态改变
	 * @param data
	 * userid : 玩家id
	 * status : 玩家状态
	 */
	RCMD_PlayerStatus: function (data) {
		this.node.emit('RCMD_PlayerStatus', data);
		this.nextAction();
	}
	,


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
	RCMD_SitIn: function (data) {
		cc.log(data);
		if (!!this._initDataFinish) {
			this.node.emit('RCMD_SitIn', data);
		}
		this.nextAction();
	}
	,

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
	RCMD_Kick: function (data) {
		let msgArr = {
			0: '您的人品不好，所以被踢下线',
			1: '帐号在另一个地方登录，您被迫下线',
			2: '您被管理员踢下线',
			3: '您的游戏币不足，不能继续游戏。',
			4: '你的断线或逃跑已经超过规定的次数,不能继续游戏',
			255: data.srtMsg
		};
		let self = this;
		hideLoadingAni();
		this.removePomeloListeners();
		showAlertBox(msgArr[data.bt], function () {
			self.backLobby();
		});
	}
	,

	/**
	 * 服务器连接断开
	 * @param data
	 */
	RCMD_close: function (data) {
		cc.log('RCMD_close')
		this.removePomeloListeners();
		let self = this;
		hideLoadingAni();
		showAlertBox('您与游戏服务器连接断开', function () {
			self.backLobby();
		});
	}
	,

	/**
	 * 操作超时 服务器断开连接
	 * @param data
	 */
	RCMD_ServerHeartOut: function (data) {
		this.msgList = [];
		this.removePomeloListeners();
		this.scheduleOnce(function () {
			GlobEvent.emit('RCMD_ServerHeartOut');
		});
	}
	,

	/**
	 * 连接服务器超时
	 * @param data
	 */
	RCMD_Timeout: function (data) {
		let self = this;
		hideLoadingAni();
		showAlertBox('连接服务器超时', function () {
			self.backLobby();
		});
	}
	,
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
	RCMD_initParam: function (data) {
		let self = this;
		cc.log('RCMD_initParam', data);
		// this._animStatus = false;
		this.matchExit = false;
		this.msgList = [];

		cc.log('RCMD_initParam', data);
		this.seatId = data.myseatid;
		this.gameid = data.gameid;
		this.EHBTimes = data.EHBTimes || 15;
		this.outTimes = data.outTimes || 10;
		this.roomType = data.roomType;
		this.ruleFlag = data.ruleFlag;             // 游戏规则
		this._currGame = data.currGame || 0;
		this._totalGame = data.totalGame || 0;
		this.roomuserid = data.roomuserid;
		this._currentFeng = 0;
		// 游戏配置信息
		this.game = config.getGameById(this.gameid);
		cc.log('人数', this.youxirenshu)
		this.initRender();
		this.resetGame();
		this.soundCtrl = this.node.addComponent(this.game.sound || 'MJSound');  // 默认普通话
		// 复盘记录不需要触摸出牌
		this.setTouchEvent();
		this.initCardRoom();

		this.node.emit('RCMD_initParam', data);
		cc.log('=========1')
		this.nextAction();
	}
	,

	/**
	 tableid: 2, seatid: 3
	 */
	// RCMD_TaskSeat: function () {
	//
	//     // this.seatId = data.seatid;
	//
	//     // cc.log("+++++++++++++++++++++++");
	//     // this.node.emit('RCMD_TaskSeat', data);
	// },

	/**
	 * 游戏开始
	 * @param data
	 * userid        ： 庄家id
	 * baseMoney     : 底分
	 * currentJushu  ： 当前局数
	 * currentFeng   : 当前番数   // 东南西北风圈
	 */
	RCMD_GameStart: function (data) {
		this.gameStart(data.userid, data.baseMoney);
		this.setMaster(data.userid);

		//this.soundCtrl.playGameStart();
		this.node.emit('RCMD_GameStart', data);
		this.updateRemainTip();
		this.playStartGameAnim();
		this.updateJushu(data);
		this.soundCtrl.playGameStart();
	}
	,

	/**
	 * 发牌
	 * @param data
	 * head     :  牌头
	 * tail     :  牌尾
	 * users    : {
   *   userid : 玩家ID,
   *
   *   paiCount  : 手中张数
   *   isVisible : 牌是否可见
   *   [pais]    : 牌
   * }
	 */
	RCMD_Distribute: function (data) {
		console.log('RCMD_Distribute', data);
		for (var i = 0; i < data.users.length; i++) {
			let user = data.users[i];
			let chair = this.getChairByUid(user.userid);
			if (user.isVisible) {
				this.onCmdDistribute(chair, user.paiCount, user.pais);
			} else {
				this.onCmdDistribute(chair, user.paiCount);
			}
			this.remainderPai -= user.paiCount;
		}

		this.updateRemainTip();
	}
	,

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
	RCMD_ActData: function (data) {
		cc.log('RCMD_ActData', data)
		this.initRender();
		this.setMaster(data.masterid);
		this.gameStart(data.masterid);
		let activeid = data.activeid;
		this.lastOutPai = data.lastPai;
		this.lastPlayId = data.lastPlayerid;

		this.setBD(data.iBD);
		let users = data.users;
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			let chair = this.getChairByUid(user.userid);
			let render = this._renders[chair];
			if (user.eatCount > 0) {
				// 恢复吃碰杠的牌
				for (let j = 0; j < user.eats.length; j++) {
					var eat = user.eats[j];
					let count = eat.flag > 4 ? 4 : 3;
					this.remainderPai -= count;
					let dir;
					if (!!this.youxirenshu) {
						if (this.youxirenshu == 2) {
							dir = this.getChairBySeatId2(eat.eatDir);
						} else {
							dir = this.getChairBySeatId(eat.eatDir);
						}
					} else {
						switch (this.ruleFlag & 0x07) {
							case 0x01:
								dir = this.getChairBySeatId2(eat.eatDir);
								break;
							case 0x02:
								dir = this.getChairBySeatId3(eat.eatDir);
								break;
							case 0x04:
								dir = this.getChairBySeatId(eat.eatDir);
								break;
						}
					}
					render.dealActData(eat.pai, eat.flag, dir);
				}
			}

			// 恢复手中的牌
			let pais = user.pais || [];
			this.remainderPai -= user.hc;

			render.createHandCards(user.hc, pais);

			// 恢复出过的牌
			this.remainderPai -= user.outCount;
			for (let i = 0; i < user.outCount; i++) {
				render._createOneOutCard(user.outs[i]);
			}

			// 恢复花牌
			this.remainderPai -= user.flowerCount;
			render.addFlowers(user.flowers);
			render.freshHandCardsPos();
		}
		this.node.emit('RCMD_ActData', data);
		this.activePosition(activeid, this.outTimes);
		this.updateRemainTip();
		this.nextAction();
	}
	,

	/**
	 * 设置第一个出牌玩家
	 * @param data
	 * userid : 第一个出牌玩家
	 */
	RCMD_StartOut: function (data) {
		if (!this._isplaying) {
			this.nextAction();
			return;
		}

		//for(var i = 0; i < 4;)
		this._renders[0].freshHandCardsPos();
		this.activePosition(data.userid, this.outTimes);
		this.lastPlayId = data.userid;
		this.nextAction();
	}
	,

	/**
	 * 设置财神
	 * @param data
	 * iBD : 财神值
	 */
	RCMD_SetBD: function (data) {
		cc.log('RCMD_iBD : ', data.iBD);
		this.setBD(data.iBD);
		this.nextAction();
	}
	,

	setBD: function (iBD) {
		this.iBD = iBD;
		this.showBD(this.iBD);
	}
	,


	updateRemainTip: function () {
		if (!this.BDFrame) {
			return;
		} else {
			this.BDFrame.node.active = true;
			this.BDFrame.updateRemainTip(this.remainderPai);
		}

	}
	,

	/**
	 * 更新房卡房局数显示
	 * @param data
	 */
	updateJushu: function (data) {
		if (this.roomType != 2) {
			return;
		}
		this._currGame = data.currentJushu;
		this._currentFeng = data.currentJushu;
		if (!!this.jushu) {
			this.jushu.string = this.getRoomJushu();
		}
	}
	,

	/**
	 * 设置财神值
	 * @param iBD
	 */
	showBD: function (iBD) {
		let self = this;

		this.BDFrame.node.active = true;
		this.BDFrame.setBD(iBD, this.isBD(iBD));

	}
	,

	hideBD: function () {
		if (!!this.BDFrame) {
			this.BDFrame.active = false;
		}
	}
	,

	/**
	 * 设置操作码
	 * @param data
	 * opcode :  操作码
	 */
	RCMD_opCode: function (data) {
		console.log('RCMD_opCode', data);

		this._opcode = data.opcode;

		if (data.opcode & RCMD_ACTION.optOut) {  // 可以出牌判断
			this.handleOutCards();
		}
		this.activePosition(UserCenter.getUserID(), this.EHBTimes);
		if (this.isAutoPlay) {
			//托管，当做超时处理
			this.overTime();
			this.nextAction();
		} else {
			this.onCmdOpCode(data.opcode);
		}
	}
	,


	/**
	 * 玩家操作
	 * @param data
	 * userid  ： 玩家ID
	 * opCode : 操作码
	 * data : {
   *  操作数据
   * }
	 */
	RCMD_Action: function (data) {
		this.hideMultEats();
		this.hideToolBar();

		if (RCMD_ACTION.optTou == data.opCode) {   // 德清麻将先收到出牌
			this.doCmdRunTou(data.userid, data.data);
			return;
		}

		if (!this._isplaying) {
			this.nextAction();
			return;
		}
		let chair = 0;
		if (!!data.userid) {
			chair = this.getChairByUid(data.userid);
		}

		if (chair < 0) {
			this.nextAction();
			return;
		}
		let user = GamePlayer.getPlayer(data.userid);
		switch (data.opCode) {
			case RCMD_ACTION.optTou:       // 摇撒子
				this.doCmdRunTou(data.userid, data.data);
				break;
			case RCMD_ACTION.optOut:       // 玩家出牌
			{
				this.lastPlayId = data.userid;
				this.onCmdOutPai(chair, data.data);
				this.playOutSound(chair, user.sex, data.data.pai);

				this.stayPosition()
			}
				break;
			case RCMD_ACTION.optEat:
			case RCMD_ACTION.optHit:
			case RCMD_ACTION.optBar:
				this.activePosition(data.userid, this.outTimes);
				this.onCmdEatAction(chair, data.opCode, data.data);
				this.playEatCmdSound(chair, user.sex, data.opCode);
				this.lastPlayId = data.userid;
				break;
			case RCMD_ACTION.optHu:
				this.onCmdHuAction(data.userid, data.data);
				let bNotZimo = (data.data.huflag == 0 || data.data.huflag == 16); // 点炮，抢杠
				this.playHuSound(chair, user.sex, bNotZimo, data.data.huflag, data.data.hutype1);
				break;
			case RCMD_ACTION.optTing:        // 听牌
				break;
			case RCMD_ACTION.optGet:
				this.activePosition(data.userid, this.outTimes);
				this.onCmdGetPai(chair, data.data);
				this.remainderPai--;
				this.updateRemainTip();
				break;
			case RCMD_ACTION.optSupply:      // 获取牌
				this.activePosition(data.userid, this.outTimes);
				this.onCmdGetSupply(chair, data.data);
				if (!!data.data.fpai) {
					this.playSupplyCmdAnim(chair, 0x8003);
					this.playEatCmdSound(chair, user.sex, data.opCode);
				} else {
					this.nextAction();
				}
				this.remainderPai--;
				this.updateRemainTip();
				break;
			case RCMD_ACTION.optRecordHu:         // 复盘胡
				this.onCmdRecordHu(data.userid, data.data);
				break;
			default:
				cc.log('没有运行了?', data);
				break;
		}

	}
	,

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
	RCMD_Result: function (data) {

		this._isplaying = false;
		this.isAutoPlay = false;
		this.autoCi = 0;

		if (this.roomType == 3) {
			return;
		}

		let users = data.users;
		for (let i = 0; i < users.length; i++) {
			let user = GamePlayer.getPlayer(users[i].userid)
			users[i].sex = users[i].sex || user.sex;
			users[i].nick = users[i].nick || user.nick;
			users[i].userImage = users[i].userImage || user.userImage;
		}
		if (!this.huResult) {
			this.nextAction();
			return;
		}

		this.node.emit('RCMD_Result', data);
		if (!!this._position) {
			this._position.stopActive();
		}

		var isHu = (this.huResult.userid == UserCenter.getUserID());
		if (isHu) {
			this.soundCtrl.playWin();
		} else {
			this.soundCtrl.playLost();
		}

		this.hideOutTips();
		this.resultInfo = data;

		this.Result(this.huResult, users, data);
	}
	,

	/**
	 * 流局
	 * @param data
	 */
	RCMD_MissCarry: function (data) {
		for (let i = 0; i < data.users.length; i++) {
			let user = data.users[i];
			let chair = this.getChairByUid(user.userid);
			this.sortPaisByBD(user.pais);
			this._renders[chair].onCmdHu(user.pais);
		}
		this.huResult = null;
		this.node.emit('RCMD_MissCarry')
		this.playEatCmdAnim(0, RCMD_ACTION.optAnsHu);
		this.playMissCarry();
		this.setBD(0)
		//this.nextAction();
	}
	,

	playMissCarry: function () {
		this.soundCtrl.playMissCarry();
	}
	,
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
	}
	,

	/**
	 * 扩展协议
	 */
	RCMD_Expend: function (data) {
		cc.log('RCMD_Expend', data);
		let self = this;
		var expend = data.data;
		if (expend.CMD == '0001') {
			showAlert(expend.tips);
		} else if (expend.CMD == '002') {
			var arr = expend.ar;
			UserCenter.setList(arr);
			// this.nextAction();
		} else if (expend.CMD == '10000') {
			this.minpoint = expend.minpoint;
			this.maxpoint = expend.maxpoint;
			cc.log(this.minpoint)
		} else if (expend.CMD == '10002') {
			//房间人数
			cc.log('10002', expend.PlayerCount)
			this.youxirenshu = expend.PlayerCount;
		} else if (expend.CMD == '10001') {
			//房间桌费
			if (this.roomType < 2) {
				this.basemoney = expend.basemoney;  //断线 底分
			}
		}
		this.nextAction();
	}
	,

	onCmdDistribute: function (chair, count, values) {
		let self = this;

		values = values || [];
		while (values.length < count) {
			values.push(255);
		}

		var hasNextAction = false;
		///this.schedule(this.scheduleDistribute,0.4);
		this.schedule(function () {
			let len = values.length == 5 ? 5 : 4;
			let cards = values.splice(0, len);
			self.dealStepCards(chair, cards);
			if (values.length == 0 && chair == 0 && !hasNextAction) {
				hasNextAction = true;
				this.scheduleOnce(function () {

					for (let i = 0; i < self._renders.length; i++) {
						let render = self._renders[i];
						render.freshHandCardsPos();
					}

					self.nextAction();
				}, 0.5);

			} else if (chair == 0) {
				this.soundCtrl.playFapai();
			}
		}, 0.4, 4);
	}
	,

	dealStepCards: function (chair, values) {
		let render = this._renders[chair];
		let self = this;
		values.forEach(function (value) {
			render.onCmdDistribute(value);
		});
		// 发牌完成
	}
	,

	gameStart: function (masterid, baseMoney) {
		this.resetGame();
		this._isplaying = true;
		let seatid = GamePlayer.getSeatByUserid(masterid);
		let chair = this.getChairByUid(masterid);
		if (this.roomType < 2) {
			if (!this.youxirenshu) {
				chair = this.getChairBySeatId(seatid);
			} else {
				cc.log(this.youxirenshu)
				switch (this.youxirenshu) {
					case 2:
						chair = this.getChairBySeatId2(seatid);
						break;
					case 4:
						chair = this.getChairBySeatId(seatid);
						break;
				}
			}

		} else {
			switch (this.ruleFlag & 0x07) {
				case 0x01:
					chair = this.getChairBySeatId2(seatid);
					this.youxirenshu = 2;
					break;
				case 0x02:
					chair = this.getChairBySeatId3(seatid);
					this.youxirenshu = 3;
					break;
				case 0x04:
					chair = this.getChairBySeatId(seatid);
					this.youxirenshu = 4;
					break;
			}
		}
		this.showPosition(chair, this.youxirenshu)

	}
	,

	onCmdOpCode: function (opcode) {
		let bShow = (opcode & (RCMD_ACTION.optHu | RCMD_ACTION.optHit | RCMD_ACTION.optEat | RCMD_ACTION.optBar));
		if (bShow) {
			this.showToolBar(opcode);
		} else {
			this.hideToolBar();
		}
		this.nextAction();
	}
	,

	// 摇散子
	doCmdRunTou: function (userid, data) {
		var ida = data.ida;
		var idb = data.idb;
		this.rollDice(ida, -1);
		this.rollDice(idb, 1);
	}
	,

	/**
	 * 玩家出牌
	 * @param chair
	 * @param data
	 *  pai : 出的牌
	 *  ipos ： 出牌位置
	 */
	onCmdOutPai: function (chair, data) {
		this.lastOutPai = data.pai;
		let ipos = data.ipos;
		this._renders[chair].onCmdOutPai(this.lastOutPai, ipos);

		// 复牌自己出牌
		if (this.roomType > 10 && chair == 0) {
			var index = this._renders[0].findCardValueIndex(this.lastOutPai);
			var cards = this._renders[0]._hands.getMJCards();
			var card = cards[index];
			this._renders[0].dealLocalOutCard(card, this.lastOutPai, index);
		}
		this.showBigOutCard(chair, data.pai);
	}
	,

	/**
	 * 播放出牌声音
	 * @param sex
	 * @param pai
	 */
	playOutSound: function (chair, sex, pai) {
		this.soundCtrl.playPai(sex, pai, chair, this.isPiaoCai(chair, pai));
	}
	,

	isPiaoCai: function (chair, pai) {
		return this.isBD(pai);
	}
	,

	/**
	 * 吃碰杠操作
	 * @param chair
	 * @param opCode
	 * @param data
	 */
	onCmdEatAction: function (chair, opCode, data) {
		let dir = this.getChairByUid(this.lastPlayId);
		switch (opCode) {
			case RCMD_ACTION.optHit:
				this._renders[chair].dealHitCards(this.lastOutPai, opCode, data.dA, data.dB, dir);
				break;
			case RCMD_ACTION.optEat:
				let flag = EATFLAG.EAT_LEFT;
				let pai1 = data.paiA;
				let pai2 = data.paiB;

				if (this.blockToValue(pai1) < this.blockToValue(this.lastOutPai)) {
					flag += 1;
				}

				if (this.blockToValue(pai2) < this.blockToValue(this.lastOutPai)) {
					flag += 1;
				}
				if (this.blockToValue(pai1) > this.blockToValue(pai2)) {
					pai1 = data.paiB;
					pai2 = data.paiA;
				}
				this._renders[chair].dealEatCards(this.lastOutPai, flag, pai1, pai2, data.dA, data.dB, dir);
				break;
			case RCMD_ACTION.optBar:
				this._renders[chair].dealBarCards(this.lastOutPai, opCode, data, dir);
				break;
		}
		if (opCode != RCMD_ACTION.optBar || data.style == 0) {
			this.removeLastCardEHB();
		}
		this.playEatCmdAnim(chair, opCode);
		//this.nextAction();
	}
	,

	playEatCmdSound: function (chair, sex, opcode) {
		this.soundCtrl.playEatCmd(sex, opcode, chair);
	}
	,

	/**
	 * 胡
	 * @param userid
	 * @param data
	 */
	onCmdHuAction: function (userid, data) {
		let users = data.users;
		for (let i = 0; i < users.length; i++) {
			let user = users[i];
			let chair = this.getChairByUid(user.userid);
			let end = user.pais.length - 1;
			if (user.pais.length % 3 == 2) {
				end -= 1;
			}
			this.sortPaisByBD(user.pais, 0, end);
			this._renders[chair].onCmdHu(user.pais);
			user.flowers = this._renders[chair]._flowers.tovalue();
			user.blockPais = this._renders[chair].blockPais;
		}
		this.huResult = {
			userid: userid,
			data: data
		}
		this.playEatCmdAnim(this.getChairByUid(userid), RCMD_ACTION.optHu);
		//this.nextAction();
	}
	,

	onCmdRecordHu: function (userid, data) {
		var pai = data.pai;
		if (MJType.invalidPai(pai)) {  // 胡牌
			var chair = this.getChairByUid(userid);
			var user = GamePlayer.getPlayer(userid);
			var hands = this._renders[chair]._hands.getMJCards();
			var bNotZimo = false;
			if (hands.length % 3 == 1) {  // 点炮胡
				bNotZimo = true;
				this._renders[chair].onCmdGetPai(pai);
			}
			this.playEatCmdAnim(chair, RCMD_ACTION.optHu);
			this.playHuSound(chair, user.sex, bNotZimo);

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
			for (var usrid in players) {   // 构造胡数据
				var chr = this.getChairByUid(usrid);
				var user = {};
				user.userid = usrid;
				user.pais = this._renders[chr]._hands.tovalue();
				user.flowers = this._renders[chr]._flowers.tovalue();
				user.blockPais = this._renders[chr].blockPais;
				huData.users.push(user);
			}

			this.huResult = {
				userid: userid,
				data: huData
			};

		} else { // 流局
			this.playEatCmdAnim(0, RCMD_ACTION.optAnsHu);
			this.playMissCarry();
		}

	}
	,

	/**
	 * 播放胡声音
	 */
	playHuSound: function (chair, sex, bNotZimo, huflag, hutype) {
		this.soundCtrl.playHu(sex, bNotZimo, chair, huflag, hutype);
	}
	,
	/**
	 * 摸牌
	 * @param chair
	 * @param data
	 *  摸牌操作
	 */
	onCmdGetPai: function (chair, data) {
		this._renders[chair].onCmdGetPai(data.pai)
		this.nextAction();
	}
	,

	/**
	 * 补牌
	 * @param chair
	 * @param data
	 */
	onCmdGetSupply: function (chair, data) {
		let pai = data.pai;
		let fpai = data.fpai || 0;
		if (fpai) {  // 补花
			this._renders[chair].onCmdSupply(pai, fpai);
		} else { // 补牌
			this._renders[chair].onCmdGetPai(data.pai);
		}
		//this.nextAction();
	}
	,

	removeLastCardEHB: function () {
		let chair = this.getChairByUid(this.lastPlayId);
		this._renders[chair].removeLastOutCard();
		this.hideOutTips();
	}
	,
	/**
	 * 显示方位
	 * @param chair
	 * @param time
	 */
	activePosition: function (userid, time) {
		let chair = this.getChairByUid(userid);
		cc.log('position1', this._position)
		if (!!this._position) {
			this._position.active(chair, time);
		}

	}
	,
	stayPosition: function () {
		if (!!this._position) {
			this._position.stay();
		}
	}
	,

	rollDice: function (point, dir) {
		let self = this;
		var url = 'style/mahjong/mah/texture/dice';
		cc.loader.loadRes(url, cc.SpriteAtlas, function (err, atlas) {
			if (err) {
				cc.log(err);
				self.nextAction();
				return;
			}

			var dice = new cc.Node().addComponent(cc.Sprite);
			dice.node.parent = self.node

			var x = cc.winSize.width / 2 + dir * 60;
			var y = cc.winSize.height / 2 + 80;
			dice.node.setPosition(x, y);
			var frames = atlas.getSpriteFrames();

			let cb = function (node, idx) {
				if (!!frames[idx]) {
					dice.spriteFrame = frames[idx];
				} else {
					dice.node.removeFromParent(true);
					if (1 == dir) {
						self.nextAction();
					}
				}
			}

			var delayTime = 0.1;
			self.soundCtrl.playDice();

			dice.node.runAction(
				cc.sequence(
					cc.delayTime(0.01),
					cc.callFunc(cb, dice, 1),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, 2),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, 3),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, 4),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, 5),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, 6),
					cc.delayTime(delayTime),
					cc.callFunc(cb, dice, (point - 1) * 4),
					cc.delayTime(0.2),
					cc.callFunc(cb, dice, 24)
				)
			);

		});
	}
	,

	/**
	 *  显示方位
	 */
	showPosition: function (chair, renshu) {
		cc.log('this._position', this._position)
		if (!!this._position) {
			this._position.initUI(chair, renshu);
		}
	}
	,

	hidePosition: function () {
		if (!!this._position) {
			this._position.node.active = false;
		}
	}
	,

	setTouchEvent: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},

	onTouchStart: function (event) {
		if (this.roomType > 10 || !this._isplaying) { // 复牌
			return;
		}
		// if(!this._isplaying) return;
		this._touchBegin = true;
		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();
		let hands = this._renders[0]._hands;
		let len = hands.getMJCards().length;
		let upCard = hands.getUpCard();
		let upIndex = upCard ? hands.getHandCardIndex(upCard) : -1;

		let touchCard = hands.getTouchCardByPos(touchLoc, upIndex);
		let index = touchCard ? hands.getHandCardIndex(touchCard) : -1;

		// 双击同一张牌，出牌
		if (index >= 0 && index == upIndex) {
			cc.log('dealServerOutCard');
			this._touchBegin = false;
			this.dealOutCard(touchCard, touchCard.getValue(), index);
			//this.clearCardTipTag();
			return;
		}
		if(this.bSingleClick == 1 && touchCard && (RCMD_ACTION.optOut & this._opcode)){
			this._touchBegin = false;
			this.dealOutCard(touchCard,touchCard.getValue(),index);
		}else{
			if (touchCard && touchCard != upCard) {
				if (!this.cannotOutCard(touchCard.getValue(), index == len - 1)) {
					hands.setSelectCardUp(index, touchCard);
					this.setCardTipTag(touchCard.getValue());
					this.soundCtrl.playDealout();
				}
			} else if (!touchCard) {
				hands.resetHandCards();
				this.clearCardTipTag();
				this._touchBegin = false;
			}
		}

		this._selectPos = touchLoc;
	}
	,

	onTouchMove: function (event) {
		if (!this._touchBegin) return;

		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();
		let hands = this._renders[0]._hands;
		let len = hands.getMJCards().length;

		let upCard = hands.getUpCard();
		let upIndex = upCard ? hands.getHandCardIndex(upCard) : -1;

		let moveCard = hands.getTouchCardByPos(touchLoc, upIndex);
		let index = moveCard ? hands.getHandCardIndex(moveCard) : -1;

		if (upIndex >= 0) {    // 有站起来的牌
			if (index >= 0 && index != upIndex) {
				if (!this.cannotOutCard(moveCard.getValue(), index == len - 1)) {
					hands.setSelectCardUp(index, moveCard);
					this.soundCtrl.playMovePai();
					this._selectPos = touchLoc;
					this.setCardTipTag(moveCard.getValue());
				}
			} else if (index == upIndex) {
				if (upCard.containsOriginPos(touchLoc)) {
					this._selectPos = touchLoc;
					return;
				} else if (RCMD_ACTION.optOut & this._opcode) {
					cc.log('touchMove ', RCMD_ACTION.optOut & this._opcode);
					upCard.selectCardUpDiff(touchLoc.x - this._selectPos.x, touchLoc.y - this._selectPos.y);
					this._selectPos = touchLoc;
				}
			}
		} else if (index >= 0 && !this.cannotOutCard(moveCard.getValue(), index == len - 1)) {
			this.soundCtrl.playMovePai();
			hands.setSelectCardUp(index, moveCard);
			this.setCardTipTag(moveCard.getValue());
		}

	}
	,

	onTouchEnd: function (event) {
		if (!this._touchBegin) return;

		let touches = event.getTouches();
		let touchLoc = touches[0].getLocation();
		let hands = this._renders[0]._hands;
		cc.log('onTouchEnd', touchLoc);
		this._touchBegin = false;

		let upCard = hands.getUpCard();
		let upIndex = upCard ? hands.getHandCardIndex(upCard) : -1;

		if (upCard) {
			if (this.bSingleClick == 1 || (upCard.getCardPos().y - upCard.getCardOriginPos().y > 60)) {
				// cc.log('出牌了');
				this.dealOutCard(upCard, upCard.getValue(), upIndex);
				// this.clearCardTipTag();
			}
		} else {
			this.clearCardTipTag();
		}
	}
	,

	// 熟牌遮罩
	setCardTipTag: function (value) {
		for (var i = 0; i < 4; i++) {
			var outs = this._renders[i]._outs.getMJCards();
			outs.forEach(function (card) {
				if (card.getValue() == value) {
					card.setTipTag(i, true, false);
				} else {
					card.hitTipTag();
				}
			});

			var blocks = this._renders[i]._blocks.getMJCards();
			blocks.forEach(function (card) {
				if (card.getValue() == value) {
					card.setTipTag(i, true, true);
				} else {
					card.hitTipTag();
				}
			});
		}
	}
	,

	// 清理遮罩
	clearCardTipTag: function () {
		for (var i = 0; i < 4; i++) {
			var outs = this._renders[i]._outs.getMJCards();
			outs.forEach(function (card) {
				card.hitTipTag();
			});

			var blocks = this._renders[i]._blocks.getMJCards();
			blocks.forEach(function (card) {
				card.hitTipTag();
			});
		}
	}
	,

	// 自己出牌
	dealOutCard: function (card, value, index) {
		cc.log('dealOutCard : ', value, index);
		let mjcards = this._renders[0]._hands.getMJCards();
		if (mjcards.length % 3 != 2) {
			return;
		}
		if (this.cannotOutCard(value, index == mjcards.length - 1)) {
			return;
		}

		if (this._opcode & RCMD_ACTION.optOut) {
			this.clearHandleCards();
			this.clearCardTipTag();
			this.sendAction(RCMD_ACTION.optOut, CMD_ACTION.AT_HAND, value);
			this._opcode = RCMD_ACTION.optNull;
			// this._renders[0].dealLocalOutCard(card, value, index);
			this.hideToolBar();
		}
	}
	,

	// 房卡房间初始化
	initCardRoom: function () {
		if (this.roomType != 2) {
			return;
		}
		var self = this;
		cc.loader.loadRes('style/mahjong/mah/prefab/jushu/jushu', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			var node = cc.instantiate(prefab);
			self.jushu = node.children[0].getComponent(cc.Label);
			node.parent = self.node;
			node.y = 685;
			node.x = cc.winSize.width - 1290;
			self.jushu.string = self.getRoomJushu();
		});
	}
	,

	getRoomJushu: function () {
		cc.log('MJRule room jushu');
		return this._currGame + '/' + this._totalGame + '局'
	}
	,

	showBigOutCard: function (chair, value) {
		if (!this._bigOutCard) {
			var self = this;
			cc.loader.loadRes('style/mahjong/mah/prefab/outAni/outAniPai', cc.Prefab, function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
				}

				self._bigOutCard = cc.instantiate(prefab);
				self._bigOutCard.parent = self.node;
				self._bigOutCard.setLocalZOrder(10000);
				self._bigOutCard.children[1].addComponent('MJCard');
				self._showOutCard(chair, value);
				//self.nextAction();
				self.nextAction();
			});
		} else {
			this._showOutCard(chair, value);
			//this.nextAction();
			this.nextAction();
		}
	}
	,

	_showOutCard: function (chair, value) {
		var pos = BigOutCardPos[chair];
		var mjcard = this._bigOutCard.children[1].getComponent('MJCard');
		var frame = MJCardResource.getInHandImageByChair(0, value);
		mjcard.setCard(value, frame);
		this._bigOutCard.setPosition(pos.x, pos.y);
		this._bigOutCard.getComponent(cc.Animation).play();
	}
	,

	/**
	 * 显示操作码
	 */
	showToolBar: function (opcode) {
		if (!this._toolBar) {
			let self = this;
			this.node.on('TOOL_ACTION', this.onOpAction, this);
			cc.loader.loadRes('style/mahjong/mah/prefab/ToolBar/MahToolBar', cc.Prefab, function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
				}
				self._toolBar = cc.instantiate(prefab);
				self._toolBar.x = 1334 / 2 + 50;
				self._toolBar.y = 250;
				self._toolBar.parent = self.node;
				self._toolBar.setLocalZOrder(1500);
				self._toolBar.getComponent('MahToolBar').showTool(opcode);
			});
		} else {
			this._toolBar.getComponent('MahToolBar').showTool(opcode);
		}
	}
	,

	/**
	 *  隐藏操作码
	 */
	hideToolBar: function () {
		if (!this._toolBar) return;
		this._toolBar.getComponent('MahToolBar').hideTool();
	}
	,

	/**
	 *  显示多吃
	 * @param oppArr
	 */
	showMultEats: function (oppArr) {
		let self = this;
		if (!this._multiEats) {
			cc.loader.loadRes('style/mahjong/mah/prefab/multiEat/multiEat', cc.Prefab, function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
				}

				self._multiEats = cc.instantiate(prefab);
				self._multiEats.y = 100;
				self._multiEats.x = cc.winSize.width / 2;
				self._multiEats.parent = self.node;
				self._multiEats.setLocalZOrder(1501);
				let controller = self._multiEats.getComponent('MultiEat');
				controller.showEat(oppArr);
			});
		} else {
			let controller = self._multiEats.getComponent('MultiEat');
			controller.showEat(oppArr);
		}
	}
	,

	hideMultEats: function () {
		if (!this._multiEats) {
			return;
		}

		let controller = this._multiEats.getComponent('MultiEat');
		controller.hide();
	}
	,

	msgQueue: function (data) {
		console.log(data);

		if (this.matchExit) {
			return
		}
		if (!this.msgList) {
			return;
		}
		if (!this._animStatus) {
			this._animStatus = true;
			this[data.route](data);
		} else {
			this.msgList.push(data);
		}
	}
	,
	/**
	 * 处理操作码
	 * @param event
	 */
	onOpAction: function (event) {
		event.stopPropagation();
		this.hideToolBar();

		let code = parseInt(event.getUserData());
		switch (code) {
			case RCMD_ACTION.optNull:
				this.doDefault();
				break;
			case RCMD_ACTION.optHit:
				this.sendAction(RCMD_ACTION.optHit, CMD_ACTION.AT_HAND);
				break;
			case RCMD_ACTION.optEat:
				this.dealLocalEat();
				break;
			case RCMD_ACTION.optHu:
				this.sendAction(RCMD_ACTION.optHu, CMD_ACTION.AT_HAND);
				break;
			case RCMD_ACTION.optBar:
				this.dealLocalBar();
				break;
		}
	}
	,


	dealLocalEat: function () {
		let leftPais = this.getLeftPais(this.lastOutPai);
		let midPais = this.getMidPais(this.lastOutPai);
		let rightPais = this.getRightPais(this.lastOutPai);

		let count = !!leftPais + !!midPais + !!rightPais;
		if (count == 0) return;

		if (count == 1) {
			let pais = leftPais ? leftPais : (midPais ? midPais : rightPais);
			// if(!!leftPais){
			//
			// }else if(!!midPais){
			//   pais.pai1 = pais.pai0;
			// }else {
			//   pais.pai2 = pais.pai1;
			//   pais.pai1 = pais.pai0;
			// }

			cc.log('pai1  pai2', pais.pai1, pais.pai2);
			this.sendAction(RCMD_ACTION.optEat, CMD_ACTION.AT_HAND, pais.pai1, pais.pai2);
			return;
		}

		let opArr = [];

		if (rightPais) {
			opArr.push(rightPais);
		}

		if (midPais) {
			opArr.push(midPais);
		}

		if (leftPais) {
			opArr.push(leftPais);
		}
		this.showMultEats(opArr);
	}
	,

	dealLocalBar: function () {
		// let render = this._renders[0];
		let mjcards = this._renders[0]._hands.getMJCards();
		if (mjcards.length % 3 != 2) {  // 碰杠
			let count = this._renders[0]._hands.CountPai(this.lastOutPai);
			if (count < 3) return;   // 没有杠
			this.sendAction(RCMD_ACTION.optBar, CMD_ACTION.AT_HAND, this.lastOutPai);
		} else {   // 补杠 暗杠
			let supplyBars = this.findSupplyBarCards();
			let anBars = this.findAnBarCards();
			let bars = supplyBars.concat(anBars);

			if (bars.length == 0) return;
			if (bars.length == 1) {
				let bar = bars[0];
				this.sendAction(RCMD_ACTION.optBar, CMD_ACTION.AT_HAND, bar.pais[0]);
			} else {
				cc.log(bars);
				this.showMultEats(bars);
			}
		}
	}
	,

	/**
	 * 显示最后一张牌提示
	 * @param chair
	 * @param card
	 */
	showOutTips: function (chair, card) {
		this.soundCtrl.playDealout();
		let self = this;
		if (chair == 0 || chair == 2) {
			self._outTips.y = 70;
		}
		else {
			self._outTips.y = 50;
		}
		// this._outTips.resumeAllActions();
		this._outTips.parent = card.node;
		this._outTips.active = true;
		self._outTips.stopAllActions()
		let ss = cc.sequence(cc.moveBy(0.6, 0, -20), cc.moveBy(0.6, 0, 20));
		self._outTips.runAction(ss.repeatForever())


	},

	hideOutTips: function () {
		if (!!this._outTips) {
			// this._outTips.pauseAllActions();
			this._outTips.active = false;
			// this._outTips.removeFromParent(true);
			// this._outTips = null;
		}
	},

// 取消操作
	doDefault: function (event) {
		if (!!event) {
			event.stopPropagation();
		}
		this.hideToolBar();
		this.hideMultEats();
		if (this._opcode & RCMD_ACTION.optGet) {   // 摸牌
			this.sendAction(RCMD_ACTION.optGet, CMD_ACTION.AT_AUTO);
		} else if (RCMD_ACTION.optOut & this._opcode) {
			this._opcode = this._opcode & RCMD_ACTION.optOut;
		} else if (!!this._opcode) {
			this.sendAction(RCMD_ACTION.optCancel, CMD_ACTION.AT_AUTO);
		}
	}
	,

	/**
	 *  操作超时了
	 */
	overTime: function (event) {

		if (this.roomType == 2 && !this.isAutoPlay) {     // 房卡房不出牌
			return;
		}

		this.hideToolBar();
		this.hideMultEats();
		this.scheduleOnce(function () {
			//this.doDefault(event);

			this.doAutoOut();
			this.autoCi++
			cc.log(this.autoCi, this.isAutoPlay)
			if (this.autoCi == 2 && !this.isAutoPlay) {
				this.node.emit('AutoDo');
			}

			// this.onClickAuto()
			// if(this._opcode & RCMD_ACTION.optOut){
			//                  // 自动出牌
			// }
		}.bind(this), 1.0);
	}
	,

// 托管出牌
	doAutoOut: function () {
		cc.log('doAutoOut: ');

		if (this._opcode & RCMD_ACTION.optHu) {
			this.sendAction(RCMD_ACTION.optHu, CMD_ACTION.AT_AUTO);
		} else {
			this.doDefault();
		}


		if (!(this._opcode & RCMD_ACTION.optOut)) {
			return;
		}
		// 自动出牌
		var mjcards = this._renders[0]._hands.getMJCards();
		for (var i = 0; i < mjcards.length; i++) {
			var value = mjcards[i].getValue();
			if (this.isBD(value)) {
				continue;
			}
			if (mjcards[i].isUp() && !this.cannotOutCard(value, i == mjcards.length - 1)) {
				this.dealOutCard(mjcards[i], mjcards[i].getValue(), i);
				return;
			}
		}

		let start = mjcards.length - 1;
		for (; start >= 0; start--) {
			var card = mjcards[start];
			var value = card.getValue();
			if (!this.isBD(value) && !this.cannotOutCard(card.getValue(), start == mjcards.length - 1)) {
				this.dealOutCard(card, card.getValue(), start);
				return;
			}
		}
	}
	,
	/**
	 *   处理多个吃 多个杠
	 */
	doEatMulti: function (event) {
		event.stopPropagation();
		this.hideMultEats();

		let op = event.getUserData();
		if (op.flag < 4) {  // 吃
			this.sendAction(RCMD_ACTION.optEat, CMD_ACTION.AT_HAND, op.pai1, op.pai2);
		} else {  // 杠
			this.sendAction(RCMD_ACTION.optBar, CMD_ACTION.AT_HAND, op.pais[0]);
		}
	}
	,


	nextAction: function (event) {
		if (!!event) {
			event.stopPropagation();
		}
		let msg = this.msgList.shift();
		if (!msg) {
			this._animStatus = false;
			return;
		}

		let route = msg.route;
		cc.log(msg);
		// 切换后台
		this.scheduleOnce(function () {
			this[route](msg);
		});
	}
	,

//服务器命令监听函数
	addPomeloListeners: function () {
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
			'RCMD_Expend',                  // 扩展协议
			'RCMD_PlayerStatus',
			'RCMD_SitIn',
			// 'RCMD_initParam',
			// 'RCMD_forceGameOver',            // 房卡解散
			// 'RCMD_replyForceGameOver',      // 同意解散

		];

		for (var i = 0; i < msgList.length; i++) {
			pomelo.on(msgList[i], this.msgQueue.bind(this));
		}

		//不需要加入队列的消息
		let msgs = [
			'RCMD_signup',
			'RCMD_MobileSignUp',
			'RCMD_initParam',
			'RCMD_ServerHeartOut',
			// 'RCMD_TaskSeat',
			'RCMD_Timeout',
		];

		for (var i = 0; i < msgs.length; i++) {
			var msg = msgs[i];
			pomelo.on(msg, this[msg].bind(this));
		}
	}
	,

	removePomeloListeners: function () {
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
			// 'RCMD_initParam',
		];

		for (let i = 0; i < msgList.length; i++) {
			pomelo.removeAllListeners(msgList[i]);
		}

		//不需要加入队列的消息
		let msgs = [
			'RCMD_signup',
			'RCMD_MobileSignUp',
			'RCMD_initParam',
			'RCMD_ServerHeartOut',
			'RCMD_Timeout',
			// 'RCMD_TaskSeat',
			// 'RCMD_Kick',
		];

		for (let i = 0; i < msgs.length; i++) {
			pomelo.removeAllListeners(msgs[i]);
		}
	}
	,

	/**
	 * 播放游戏开始动画
	 */
	playStartGameAnim: function () {
		if (!this._gamestartAnim) {
			let self = this;
			cc.loader.loadRes('style/mahjong/mah/prefab/startgame/startgame', cc.Prefab, function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
				}
				self._gamestartAnim = cc.instantiate(prefab);
				self._gamestartAnim.getComponent(cc.Animation).on('finished', self.nextAction, self);
				self._gamestartAnim.parent = self.node;
				self._gamestartAnim.setLocalZOrder(1801);
				self._gamestartAnim.x = cc.winSize.width / 2;
				self._gamestartAnim.y = cc.winSize.height / 2 + 50;
				self._gamestartAnim.getComponent(cc.Animation).play();
			});
		} else {
			this._gamestartAnim.getComponent(cc.Animation).play();
		}
	}
	,

	/**
	 * 播放吃碰杠补花动画
	 * @param chair
	 * @param opcode
	 * @param bfinished 是否监听完成消息
	 */
	playEatCmdAnim: function (chair, opcode) {


		if (!this.opcodeAnim[opcode]) {
			let self = this;
			cc.loader.loadRes(OPCMDAnimPath[opcode], cc.Prefab, function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
				}
				self.opcodeAnim[opcode] = cc.instantiate(prefab);
				self.opcodeAnim[opcode].parent = self.node;
				self.opcodeAnim[opcode].setLocalZOrder(1800);
				self._playEnityAnim(chair, opcode);
				self.opcodeAnim[opcode].getComponent(cc.Animation).on('finished', self.nextAction, self);
			});
		} else {
			this._playEnityAnim(chair, opcode);
		}
	}
	,

// 补花
	playSupplyCmdAnim: function (chair, opcode) {
		cc.log('playSupplyCmdAnim');
		this.playEatCmdAnim(chair, opcode);
	}
	,

	_playEnityAnim: function (chiar, opcode) {
		let pos;
		if (RCMD_ACTION.optAnsHu == opcode) {
			pos = cc.v2(667, 375);
		} else {
			pos = OPCMDPos[chiar];
		}
		cc.log('RCMD_ACTION : ', pos, opcode);
		this.opcodeAnim[opcode].setPosition(pos.x, pos.y);
		this.opcodeAnim[opcode].getComponent(cc.Animation).play();
	}
	,

	onDestroy: function () {
		GlobEvent.removeAllListeners('AUTO_PLAY');
		GlobEvent.removeAllListeners('SINGLE_CHANGE');
		GlobEvent.removeAllListeners('LANGUAGE_CHANGE');
		this.removePomeloListeners();
	}
	,

	getDescription: function () {
		return this.game.description || '全民梦游麻将';
	}

})
;
