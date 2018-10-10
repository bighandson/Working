const CfgGame = require('CfgGame');
var Loadgame = require('LoadGame');
var GamePlayer = require('GamePlayer');
var Porp = require("Prop");
const DdzCommand = require('DdzCommand');
var config = require('Config');
var WanFa = require('Wanfa');
var SoundCtrl = require('DdzSound');
var Friend = require('Friend')
var hintSpritesEnum = {
	jiaoSprite: 0,
	bujiaoSprite: 1,
	qiangSprite: 2,
	buqiangSprite: 3,
	mingpaiSprite: 4,
	jiabeiSprite: 5,
	bujiabeiSprite: 6,
};
var stepEnum = {
	mingpaiStep: 1,
	jiaoStep: 2,
	qiangStep: 3,
	jiabeiStep: 4,
	chupaiStep: 5,
	jieshanStep: 6,
};
const MAX_PLAYERS = 3;
cc.Class({
	extends: cc.Component,

	properties: {
		players: {
			default: [],
			type: cc.Node
		},
		difenLabel: cc.Label,
		beishuLabel: cc.Label,
		normalButtons: cc.Node,
		startBox: cc.Node,
		mingpaiStartBtn: cc.Node,
		jiaodizhuBox: cc.Node,
		qiangdizhuBox: cc.Node,
		mingpaiBox: cc.Node,
		jiabeiBox: cc.Node,
		roommenu: cc.Node,
		roomInfo: cc.Node,
		roomIdLabel: cc.Label,
		wanfaLabel: cc.Label,
		roomButton: cc.Node,
		voiceTipsPrefab: cc.Prefab,
		lookAnimPrefab: cc.Prefab,
		playerInfoDialogPrefab: cc.Prefab,
		propAnimPrefab: cc.Prefab,
		chatMsgBubblePrefab: cc.Prefab,
		chatNode: cc.Node,
		cardJushu: cc.Node,
		exitButton: cc.Node,
		colseNode: cc.Node,
		chupaiHintKuangSprite: cc.SpriteFrame,
		headBgSprite: cc.SpriteFrame,
		// partenerHandLayout:cc.Node,
		hintSprites: {
			default: [],
			type: cc.SpriteFrame
		},
		dipaiLayout: cc.Node,
		dipaiKuangNode: cc.Node,
		effectNode: cc.Node,

		matchRankTop: cc.Label,
		// matchRankBottom: cc.Label,
		matchRankS: cc.Node,
		matchDiFen: cc.Label,
		matchNC: cc.Label,
		matchState: cc.Node,
		bisaiMulu : cc.Node
	},

	// use this for initialization
	onLoad: function () {
		// this.node.on('RCMD_initParam',this.RCMD_initParam.bind(this));
		// this.node.on('RCMD_Expend',this.RCMD_Expend.bind(this));
		let self = this;
		showLoadingAni();
		DdzManager.controller = this;
		DdzManager.designResolution = this.node.parent.getComponent(cc.Canvas).designResolution;

		this.node.on("msg_lightStart", this.lightStart.bind(this));
		this.node.on("msg_onceAgain", this.ready.bind(this));
		this.node.on("resultClose", this.resultClose.bind(this));

		pomelo.on('RCMD_MatchExpand', this.RCMD_MatchExpand.bind(this));
		pomelo.on('RCMD_StartGameForMatch', this.RCMD_StartGameForMatch.bind(this));

		GlobEvent.on('chuntianFinished', this.chunTianAniFinished.bind(this));
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

		for (let i = 0; i < MAX_PLAYERS; i++) {
			this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
		}
		this.isMingpaiStart = 0;
		this.timeLimit = false;
		this.dizhuID = 0;
		this.isfapaiOver = false;
		DdzManager.autoplaySign = false;
	},

	RCMD_MatchExpand: function (msg) {
		let data = JSON.parse(msg.data)
		cc.log('RCMD_MatchExpand------->', data)

		if (data.cmd == 1003) {         // 排队中
			this.showMatchWaiting(data.rs, data.timestamp, data)
		} else if (data.cmd == 1001 || data.cmd == 1005) {   // 1001 预赛匹配中 // 1005复赛匹配中
			if (!!this.matchWaiting) {
				this.matchWaiting.removeFromParent(true)
				this.matchWaiting = null
			}

			if (!!this.resultPreb) {
				return
			}

			this.showPaiduiWaiting(data)
		} else if (data.cmd == 1006) {  // 个人信息
			let player = this.players[0];

			let userImage = data.tx;

			if (!isUrl(userImage)) {
				userImage = 'game/ddz/texture/head1';
			}

			player.children[1].getComponent(cc.Label).string = data.nc;
			player.children[2].getComponent(cc.Label).string = data.score;

			loadHead(userImage, function (err, spriteFrame) {
				if (err) {
					cc.log(err)
					return
				}
				player.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
			});
		} else if (data.cmd == 1004) {  // 比赛结束
			this.showResultForMatch(data);
			this.matchDiFen.node.active = false;
			this.cancelAutoPlay();
		} else if (data.cmd == 1007) {  // 更新排名
			this.matchRankS.active = true;
			this.matchRankTop.string = data.rank+"/"+ data.players;
			this.matchRankData = data
		} else if (data.cmd == 1002) {  // 淘汰
			if (this.paiduiPreb) {
				this.paiduiPreb.active = false;
			}
			let self = this;

			let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 1});

			loadPrefab("style/mahjong/match/taotai", function (module) {
				module.x = cc.winSize.width / 2;
				module.y = cc.winSize.height / 2;
				module.parent = cc.director.getScene();

				module.getChildByName('box').getChildByName('btn').on(cc.Node.EventType.TOUCH_END, function (event) {
					if (!self.ruleController) {
						self.ruleController = self.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
					}
					self.ruleController.removePomeloListeners();
					self.ruleController.backLobby();
				});

				module.getChildByName('mask').on(cc.Node.EventType.TOUCH_START, function (event) {
				});

				module.getChildByName('box').getChildByName('rank').getComponent(cc.Label).string = data.rank
			});
		} else if (data.cmd == 1008) { // 比赛界面
			if (this.paiduiPreb) {
				this.paiduiPreb.active = false
			}
			let self = this

			let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 1});

			if (data.lqfs == 1) {
				UserCenter.setList(data.list)
			}

			loadPrefab("style/mahjong/match/jiesu", function (module) {
				module.x = cc.winSize.width / 2;
				module.y = cc.winSize.height / 2;
				module.parent = cc.director.getScene();
				module.getChildByName('box').getChildByName('win').active = data.lqfs != 2;
				module.getChildByName('box').getChildByName('guang').active = data.lqfs != 2;
				module.getChildByName('box').getChildByName('loss').active = data.lqfs == 2;
				module.getChildByName('box').getChildByName('btn').on(cc.Node.EventType.TOUCH_END, function (event) {
					if (!self.ruleController) {
						self.ruleController = self.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
					}
					self.ruleController.removePomeloListeners();
					self.ruleController.backLobby();
				});
				module.getChildByName('box').getChildByName('share').on(cc.Node.EventType.TOUCH_END, function (event) {
					if (!!self._isShareing) return;
					self._isShareing = true;
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
					var prePos = module.getChildByName('box').getPosition();
					module.getChildByName('box').setPosition(cc.p(0, 0));
					captureScreen(module.getChildByName('box'), cc.size(cc.director.getVisibleSize().width, 750), function (err, path) {
						self._isShareing = false;
						module.getChildByName('box').setPosition(prePos);
						if (err) {
							cc.log(err);
							/****xxxx***aaaa****bbbb*****cccc****dddd****/
							return;
						}
						wxapi.sendImageToWxReq(path, 1);
					});
				});
				module.getChildByName('mask').on(cc.Node.EventType.TOUCH_START, function (event) {
				});
				module.getChildByName('box').getChildByName('content').getChildByName('saishi').getComponent(cc.Label).string = '您在' + self.matchNC.string + '比赛中获得:'
				module.getChildByName('box').getChildByName('content').getChildByName('rank').getComponent(cc.Label).string = '第' + data.rank + '名'

				module.getChildByName('box').getChildByName('jl').getComponent(cc.Label).string = data.jlms
			});
		} else if (data.cmd == 1009) {  // 系统踢人
			let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 1});
			let self = this
			showAlertBox(data.msg, function () {
				if (!self.ruleController) {;
					self.ruleController = self.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
				}
				self.ruleController.removePomeloListeners();
				self.ruleController.backLobby();
			})
		} else if (data.cmd == 1010) {  // 晋级
			if (this.paiduiPreb) {
				this.paiduiPreb.active = false;
			}
			this.showJinJi(data)
		} else if (data.cmd == 1011) { // 比赛界面
			cc.log(111111)
			let self = this;
			if (!this.ruleController) {
				this.ruleController = this.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
			}

			this.ruleController.matchExit = true;
			this.ruleController.matchInit = false;
			showAlert(data.msg)
			this.clearMatchTable()
			let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 0});

			this.scheduleOnce(function () {
				PomeloClient.request(Loadgame.getCurrentGame().server + '.MobileInQueue', function (data) {
					cc.log(data)
					self.ruleController.matchExit = false;
				});
			}, 1)
		}

	},
	showJinJi: function (data) {
		let self = this

		loadPrefab("style/mahjong/match/jinji", function (module) {
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			let times = 5

			module.getChildByName('box').getChildByName('rank').getComponent(cc.Label).string = data.rank   // 本局
			module.getChildByName('box').getChildByName('time').getComponent(cc.Label).string = times   // 倒计时

			let updateTime = function () {
				times--
				if (times <= 0) {
					cc.log('MobileInQueueMobileInQueueMobileInQueueMobileInQueue')
					PomeloClient.request(Loadgame.getCurrentGame().server + '.MobileInQueue', function (data) {
					});
					module.removeFromParent(true)
					self.clearMatchTable()
					return
				}
				module.getChildByName('box').getChildByName('time').getComponent(cc.Label).string = times
			}

			module.getComponent('nullScript').schedule(updateTime, 1)
		});
	},

	onclickRank: function () {
		if (!this.matchRankData) {
			showAlertBox('暂时没有排行信息!')
			return;
		}

		let self = this

		loadPrefab("style/mahjong/match/matchRank", function (module) {

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.on(cc.Node.EventType.TOUCH_END, function (event) {
				module.removeFromParent(true)
			});

			let mine = module.getChildByName('box').getChildByName('mine')

			// 比赛名称
			mine.getChildByName('rank').getComponent(cc.Label).string = self.matchRankData.myself.rank
			// 报名人数
			mine.getChildByName('name').getComponent(cc.Label).string = formatName(self.matchRankData.myself.nc,10)

			mine.getChildByName('score').getComponent(cc.Label).string = self.matchRankData.myself.score

			let loadCell = function (index) {

				if (index > self.matchRankData.ranklist.length - 1) {
					return
				}

				let info = self.matchRankData.ranklist[index]

				loadPrefab("style/mahjong/match/rankcell", function (moduleCell) {

					moduleCell.parent = module.getChildByName('box').getChildByName('view').children[0].children[0]

					// 比赛名称
					moduleCell.getChildByName('rank').getComponent(cc.Label).string = info.rank
					// 报名人数
					moduleCell.getChildByName('name').getComponent(cc.Label).string = formatName(info.nc,10)

					moduleCell.getChildByName('score').getComponent(cc.Label).string = info.score

					if (info.rank < 4) {
						moduleCell.getChildByName('rank').active = false
						getSpriteFrameByUrl('style/mahjong/match/texture/place_' + info.rank, function (err, spriteFrame) {
							if (err) {
								cc.log(err);
								return;
							}
							hideLoadingAni()
							moduleCell.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = spriteFrame;
						});
					} else {
						moduleCell.getChildByName('icon').active = false
					}

					loadCell(index + 1)
				})
			}

			loadCell(0)
		});
	},

	// 清空桌子
	clearMatchTable: function () {
		this.initCurrGame();
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].active = false
		}
		this.players[0].active = true
		this.bisaiMulu.active = false;
		this.dipaiKuangNode.active = false
		this.dipaiLayout.active = false;
		this.beishuLabel.string = 1;
		this.difenLabel.node.parent.active = false;
		this.beishuLabel.node.parent.active = false;
		this.chatNode.active = false
		if (!this.ruleController) {
			let game = Loadgame.getCurrentGame();
			this.ruleController = this.node.getComponent(game.rule_Match?game.rule_Match:game.rule);    // MGRule
		}
		// this.ruleController.resetGame()
	},

	// 比赛结果
	showResultForMatch: function (data) {
		let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
		PomeloClient.request(route, {flag: 0});

		let self = this

		loadPrefab("style/mahjong/match/matchResult", function (module) {
			self.resultPreb = module

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box1').active = data.won == 1
			module.getChildByName('box2').active = data.won != 1 && data.flow == 1;

			module.getChildByName('box3').active = data.flow == 0;

			for (var i = 0; i < 4; i++) {
				let cell = module.getChildByName('cellnode').getChildByName('cell' + i).active = false
			}

			for (var i = 0; i < data.cj.length; i++) {
				let info = data.cj[i]
				let cell = module.getChildByName('cellnode').getChildByName('cell' + i)
				cell.active = true
				cell.getChildByName('nc').getComponent(cc.Label).string = info.nc
				cell.getChildByName('jf').getComponent(cc.Label).string = info.fse
				cell.getChildByName('fs').getComponent(cc.Label).string = info.times
				cell.getChildByName('zf').getComponent(cc.Label).string = info.score
			}

			let times = 5

			// module.getChildByName('jifen1').getComponent(cc.Label).string = (data.fse < 0 ? '' : '+') + data.fse   // 本局
			// module.getChildByName('jifen2').getComponent(cc.Label).string = data.score   // 总积分
			module.getChildByName('time1').getComponent(cc.Label).string = times   // 倒计时
			cc.log(22222222)
			let updateTime = function () {
				times--
				if (times <= 0) {
					cc.log(111111111)
					PomeloClient.request(Loadgame.getCurrentGame().server + '.MobileInQueue', function (data) {
						cc.log(data)
					});
					if (self.resultPreb) {
						self.resultPreb.removeFromParent(true)
						self.resultPreb = null
					}
					self.clearMatchTable()
					return
				}
				module.getChildByName('time1').getComponent(cc.Label).string = times
			}

			module.getComponent('nullScript').schedule(updateTime, 1)
		});
	},

	// 开始打牌
	RCMD_StartGameForMatch: function () {
		let self = this
		if (!self.ruleController) {
			self.ruleController = self.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
		}
		cc.log('msglist',self.ruleController.msgList)
		self.ruleController.msgList = [];
		let game = Loadgame.getCurrentGame();
		if (game) {
			setTimeout(function () {
				PomeloClient.request(game.server + '.startGame', function (data) {
					cc.log('RCMD_StartGameForMatch ------>  开始打牌', data)
					if (self.paiduiPreb) {
						self.paiduiPreb.active = false
					}
				});
			}, 1000)
		}
		this.dipaiKuangNode.active = true
		this.dipaiLayout.active = true;
		this.difenLabel.node.parent.active = true;
		this.beishuLabel.node.parent.active = true;
		this.chatNode.active = true
	},

	// 开始排队 等待匹配对手
	showPaiduiWaiting: function (data) {
		let self = this

		let msgList = data.msg.split("#")

		let msg = ''

		for (var i = 0; i < msgList.length; i++) {
			if (i != 0) {
				msg += '\n'
			}
			msg += msgList[i]
		}


		if (self.paiduiPreb) {
			self.paiduiPreb.active = true
			self.paiduiPreb.paiduiTime = 0
			self.paiduiPreb.getChildByName('time').getComponent(cc.Label).string = 1
			// let ss = data.cmd == 1001 ? '初赛' : '决赛'
			self.paiduiPreb.getChildByName('desc').getComponent(cc.Label).string = msg
			return
		}

		loadPrefab("style/mahjong/match/matchPaidui", function (module) {
			self.paiduiPreb = module
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
			// let ss = data.cmd == 1001 ? '预赛' : '决赛'
			module.getChildByName('desc').getComponent(cc.Label).string = msg

			self.paiduiPreb.paiduiTime = 1

			module.getChildByName('time').getComponent(cc.Label).string = self.paiduiPreb.paiduiTime

			module.getComponent('nullScript').schedule(function () {
				if (self.paiduiPreb.active) {
					self.paiduiPreb.paiduiTime++;
					module.getChildByName('time').getComponent(cc.Label).string = self.paiduiPreb.paiduiTime
				}
			}, 1)
		});
	},

	// 显示比赛排队等待
	showMatchWaiting: function (num, timestamp, data) {
		if (this.matchWaitingReady) {
			if (this.matchWaiting) {
				this.matchWaiting.getChildByName('pernum').getComponent(cc.Label).string = num
			}
			return
		}

		let self = this;
		self.matchWaitingReady = true
		loadPrefab("style/mahjong/match/matchWaiting", function (module) {
			self.matchWaiting = module
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.on(cc.Node.EventType.TOUCH_START, function (event) {
			});

			self.matchWaiting.getChildByName('pernum').getComponent(cc.Label).string = num

			let time = timestamp - new Date().getTime();
			cc.log(time)

			self.matchWaiting.getChildByName('time').getComponent(cc.Label).string = formatDate(time / 1000)

			self.matchWaiting.getChildByName('mc1').getComponent(cc.Label).string = data.mc1
			self.matchWaiting.getChildByName('mc2').getComponent(cc.Label).string = data.mc2
			self.matchWaiting.getChildByName('mc3').getComponent(cc.Label).string = data.mc3

			self.matchWaiting.getChildByName('likai').on(cc.Node.EventType.TOUCH_END, function (event) {
				showLoadingAni()
				showAlertBox('比赛马上开始了，别走远咯！', function () {
					let route = Loadgame.getCurrentGame().server + '.CMD_Exit';
					PomeloClient.request(route, {flag: 1});

					if (!self.ruleController) {
						self.ruleController = self.node.getComponent(Loadgame.getCurrentGame().rule_Match?Loadgame.getCurrentGame().rule_Match:Loadgame.getCurrentGame().rule);    // MGRule
					}

					self.ruleController.removePomeloListeners();
					self.ruleController.backLobby();
				}, function () {
				})
			});


			let updateTime = function () {
				let time = timestamp - new Date().getTime() >= 0 ? timestamp - new Date().getTime() : 0;

				if (self.matchWaiting) {
					self.matchWaiting.getChildByName('time').getComponent(cc.Label).string = formatDate(time / 1000)
				}

			}

			module.getComponent('nullScript').schedule(updateTime, 1)
		});
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

	lightStart: function (event) {
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_LightStart,
			data: {
				userid: UserCenter.getUserID(),
			}


		};
		this.sendCmd(".CMD_Command", msg);
	},
	ready: function (event) {
		this.sendCmd('.CMD_Ready');
	},

	resultClose: function () {
		this.startBox.active = true;
	},
	chunTianAniFinished: function () {
		cc.log('------------------chunTianAniFinished');

		let self = this;
		this.cancelAutoPlay()
		let Controller;
		if (self.winStatus) {
			cc.log(self.resultprefab);
			self.resultprefab.parent = self.node.parent;
			Controller = self.resultprefab.getComponent("ddzResultCtrl");
		} else {
			cc.log(self.loseResultprefab);
			self.loseResultprefab.parent = self.node.parent;
			Controller = self.loseResultprefab.getComponent("ddzResultCtrl");
		}

		// var result = this.resultprefab.getChildByName("resultNode");
		// let resultprefab = this.resultprefab.getChildByName("controller");
		Controller.showResult(this.resultData, this.roomType);

	},
	onClickJiaodizhuOrBujiao: function (event, jiaobujiao) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var msg = {

			cmd: DdzCommand.REQ_CMD.CMD_CallLandOwner,
			data: {
				userid: UserCenter.getUserID(),
				isCall: jiaobujiao,
				// tableid: this.tableId,
				// seatid: this.seatId,
			}


		};
		this.sendCmd(".CMD_Command", msg);
		node.parent.active = false;

	},
	onClickQiangdizhuOrBuqiang: function (event, customEventData) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_GrabLandOwner,
			data: {
				userid: UserCenter.getUserID(),
				isGrab: customEventData,
			}


		};
		this.sendCmd(".CMD_Command", msg);
		node.parent.active = false;

	},
	onClickStartGame: function (event, customEventData) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		this.sendCmd('.CMD_Ready');
		// node.active = false;
		node.parent.active = false;

	},

	onClickMingpaiKaishi: function (event, customEventData) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		// var msg = {
		//     cmd : DdzCommand.REQ_CMD.CMD_LightCard,
		//     data:{
		//         userid:UserCenter.getUserID(),
		//         isSee : 1,
		//         times : 5
		//     }
		// };
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_LightStart,
			data: {
				userid: UserCenter.getUserID(),
			}


		};
		this.sendCmd(".CMD_Command", msg);
		node.parent.active = false;
	},
	onClickMingpai: function (event, mingpaiData) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_LightCard,
			data: {
				userid: UserCenter.getUserID(),
				isSee: 0,
				times: 0
			}


		};
		this.sendCmd(".CMD_Command", msg);
		node.parent.active = false;
	},
	onClickJiabeiOrBujiaobei: function (event, jiabei) {
		this.showClock(UserCenter.getUserID(), false);
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var beishu = 0;
		if (jiabei) {
			beishu = 2;
		}
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_AddTimes,
			data: {
				userid: UserCenter.getUserID(),
				isAdd: jiabei,
				times: beishu
			}
		};
		this.sendCmd(".CMD_Command", msg);
		node.parent.active = false;
	},

	sendCmd: function (route, param) {

		cc.log("客户端下发命令------------", route, JSON.stringify(param));
		if (!!param) {
			PomeloClient.request(this.game.server + route, param, function (data) {
				cc.log(JSON.stringify(data));
			});
		} else {
			PomeloClient.request(this.game.server + route, function (data) {
				cc.log(JSON.stringify(data));
			});
		}

	},
	CMD_Ready: function () {
		var route = this.game.server + '.CMD_Ready';
		PomeloClient.request(route);
	},
	loadRes: function () {
		this.loadCount = 0;
		let self = this;
		cc.loader.loadRes("game/ddz/prefab/DdzpokerTexture/pokers", cc.SpriteAtlas, function (err, atlas) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.pokersAtlas = atlas;
			self.loadCount++;
			self.checkLoadRes();
		});

		cc.loader.loadRes('game/ddz/prefab/DdzpokerSpriteS', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.pokerPrefabS = prefab;
			self.loadCount++;
			self.checkLoadRes();
		});
		cc.loader.loadRes("game/ddz/prefab/DdzpokerTexture/pokers_s", cc.SpriteAtlas, function (err, atlas) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.pokersAtlasS = atlas;
			self.loadCount++;
			self.checkLoadRes();
		});

		cc.loader.loadRes('game/ddz/prefab/DdzpokerSprite', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.pokerPrefab = prefab;
			self.loadCount++;
			self.checkLoadRes();
		});
		cc.loader.loadRes('game/ddz/prefab/DdzpokerSpriteSS', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.pokerPrefabSS = prefab;
			self.loadCount++;
			self.checkLoadRes();
		});

		cc.loader.loadRes('game/ddz/prefab/DdzhandcardPrefab', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.HandCardPrefab = prefab;
			self.loadCount++;
			self.checkLoadRes();
		});
		cc.loader.loadRes('game/ddz/prefab/ddzResult', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.resultPrefab = prefab;
			self.resultprefab = cc.instantiate(prefab);
			self.loadCount++;
			self.checkLoadRes();
		});
		cc.loader.loadRes('game/ddz/prefab/ddzResultLose', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.loseResultPrefab = prefab;
			self.loseResultprefab = cc.instantiate(prefab);
			self.loadCount++;
			self.checkLoadRes();
		});

		cc.loader.loadRes('game/ddz/prefab/DdzcutcardPre', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			DdzManager.cutcardPrefab = prefab;
			self.loadCount++;
			self.checkLoadRes();
		});
	},

	checkLoadRes: function () {

		if (this.loadCount == 9) {
			///////-----cc.log("res completed");
			DdzManager.isResLoadComplete = true;

			this.initGame();
		}
	},


	initGame: function () {
		cc.log('initgame')
		this.node.on('DISPLAY_VOICE', this.displayVoice, this);
		this.node.on('HIDE_VOICE', this.hideVoice, this);

		this.node.on('SHOW_CHAT_MSG', this.showChatMsg, this);
		this.node.on('HIDE_CHAT_MSG', this.hideChatMsg, this);

		this.node.on('SHOW_DAO', this.showDao, this);
		this.node.on('HIDE_DAO', this.hideDao, this);

		this.node.on("OPEN_AUTO_PLAY", this.openAutoPlay, this);

		pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
		pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));
		GlobEvent.on('LANGUAGE_CHANGE', this.languageChange.bind(this));

		for (let i = 0; i < 3; i++) {
			this.players[i].on(cc.Node.EventType.TOUCH_START, this.onPlayer, this);
		}
		let game = Loadgame.getCurrentGame();

		if (game) {
			PomeloClient.request(game.server + '.MobileInQueue', function (data) {
				cc.log(data)
			});
		}
		hideLoadingAni();

	},
	initCurrGame: function () {
		for (var i = 0; i < 3; i++) {
			var player = this.players[i];
			var mingpaiLayout = player.getChildByName("mingpaiLayout");
			if(mingpaiLayout){
				mingpaiLayout.removeAllChildren();
			}

			let userImage = 'game/ddz/texture/head1';
			getSpriteFrameByUrl(userImage, function (err, spriteFrame) {
				if (err){
					cc.log(err)
					return;
				}
				player.getChildByName("head").getComponent(cc.Sprite).spriteFrame = spriteFrame;
			});

			player.getChildByName("outCardLayout").removeAllChildren();
			player.getChildByName('dizhu').active = false;
			player.getChildByName('nongmin').active = false;
			player.getChildByName('pass').active = false;
			player.getChildByName('jiabeiIcon').active = false;

		}
		this.showClock(UserCenter.getUserID(), false);
		if (this.handCardprefab == null) {
			this.handCardprefab = cc.instantiate(DdzManager.HandCardPrefab);
			this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
			this.handCardprefab.getChildByName("control").getComponent("DdzhandCard").roomType = this.roomType;
		}
		let handCard = this.handCardprefab.getChildByName("control");
		let handCardController = handCard.getComponent("DdzhandCard");
		DdzManager.tuoci = 0;
		handCardController.gameBtnLayout.active = false;
		this.handCardprefab.getChildByName('changepai').active = false;
		handCardController.handCardLayout.removeAllChildren(true);
		handCardController.outCardLayout.removeAllChildren(true);
		var a = [];
		this.dizhuID =0
		this.showDipai(this.dipaiLayout, []);

	},
	RCMD_Expend: function (data) {
		cc.log('game expend');
		let self = this;
		if (data.data.CMD == '001') {
			self.expend = data.data.extData;
			var game = Loadgame.getCurrentGame();
			cc.log('ruleFlag:', this.ruleFlag, 'expend:', this.expend);
			var wanfaDes = !!game.getWanfa ? game.getWanfa(this.ruleFlag, this.expend) : WanFa.getWanfa(game, this.ruleFlag);
			cc.log(wanfaDes);
			this.wanfaLabel.string = wanfaDes;

		} else if (data.data.CMD == '002') {
			let expend = data.data;
			let arr = expend.ar;
			UserCenter.setList(arr);
			GlobEvent.emit('update_UserCenter')
		} else if (data.data.CMD == '10000') {
			cc.log('10000')
			this.minpoint = data.data.minpoint;
			this.maxpoint = data.data.maxpoint;
			cc.log(this.minpoint)
		}
		else if (data.data.CMD == '10001') {
			let expend = data.data;
			self.difenLabel.string = expend.basemoney;
		} else if (data.data.CMD == '10003') {
			//更新游戏豆
			let chair = this.getChairByUserid(data.data.UID);
			let money = data.data.Money;
			this.players[chair].getChildByName("totalScore").getComponent(cc.Label).string = formatNum(money);
			UserCenter.setYouxibiNum(money);
		} else if (data.data.CMD == '10004') {
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
		} else if (data.data.CMD == '1001') {

			this.bisaiMulu.active = true;
			this.matchDiFen.node.active = true
			this.matchDiFen.string = data.data.baseMoney
			this.matchNC.string = data.data.matchName.replace(/#/g, '"')

			// this.matchState.string = expend.matchModel == 1 ? '预赛阶段' : '决赛阶段'


			this.matchState.getChildByName('yusai').active = data.data.matchModel == 1
			this.matchState.getChildByName('juesai').active = data.data.matchModel != 1
		}

	},

	languageChange: function (event) {
		this.bLanguageSound = event;
		if (!this.soundCtrl) {
			return;
		}
		this.soundCtrl.setPlayLanguageSound(this.bLanguageSound);
		///////-----cc.log(this.bLanguageSound)
		//cc.sys.localStorage.setItem('');
	},

	addListeners: function () {
		for (var i = 0; i < DdzManager.msgRCMDQueue.length; i++) {
			var msg = DdzManager.msgRCMDQueue[i];
			/////////-----cc.log(msg);
			this.node.on(msg, this[msg].bind(this));
		}

		for (var i = 0; i < DdzManager.msgRCMDList.length; i++) {
			var msg = DdzManager.msgRCMDList[i];
			this.node.on(msg, this[msg].bind(this));
		}
	},

	removeListeners: function () {
		for (var i = 0; i < DdzManager.msgRCMDQueue.length; i++) {
			var msg = DdzManager.msgRCMDQueue[i];
			///////-----cc.log(msg);
			this.node.off(msg, this[msg].bind(this));
		}

		for (var i = 0; i < DdzManager.msgRCMDList.length; i++) {
			var msg = DdzManager.msgRCMDList[i];
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

		cc.log("RCMD_PlayerStatus", JSON.stringify(event.detail));
		let data = event.detail;
		let userid = data.userid;
		let status = data.status;
		let chair = this.getChairByUserid(userid);
		this.setOfflineStatus(chair,status >= GamePlayer.PlayerState.Offline);

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

		//this.roomInfo.active = true;
		//
		//this.roomType = 0;

		cc.log(this.matchWaiting)
		if (!!this.matchWaiting) {  // 删除等待比赛界面
			this.matchWaiting.removeFromParent(true)
			this.matchWaiting = null
		}

		if (this.roomType < 2) {
			/*this.roomInfo.children[0].active = false;
             this.roomInfo.children[1].active = true;
             this.roomInfo.children[2].getComponent(cc.Label).string = data.basescore;*/

		} else if (this.roomType == 2) {
			this.roomInfo.children[0].active = true;
			this.roomInfo.children[1].active = false;
			this.roomInfo.children[2].getComponent(cc.Label).string = data.roomcode;
			// this.Info.active=true;
			// this.Info.children[0].getComponent(cc.Label).string = data.roomcode;
			// this.Info.children[1].getComponent(cc.Label).string = data.roomcode;
			// var roomcontroller = this.addComponent("CardRoomController1");
			// roomcontroller.init(data);
		}

		if (this.roomType != 2) {

			this.roommenu.getChildByName("content").getChildByName("disRoomButton").active = false;
			this.roommenu.getChildByName("content").getChildByName("ExitButton").active = true;
			this.chatNode.getChildByName("speech").active = false;
		} else {
			this.roommenu.getChildByName("content").getChildByName("ExitButton").active = false;
		}


		this.chatNode.active = this.roomType < 20;

	},

	InitData: function () {
		this.outCardType = 0;
		this.outcardseatid = 0;
		this.num = 2;
		this.length = 0;
		this.X = 1;
		this.PokScore = 0;
		this.opUserId = 0;
		this.isfapaiOver = false;
	},
	// showFenZCard
	xianshiFen: function () {
		let data = this.fendata;
		cc.log('分牌', data)
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

	showClock: function (userid, isshow, time) {
		if (this.timeLimit == false) {
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
				this.qiangdizhuBox.active = false;
				this.jiabeiBox.active = false;
			}
		}

	},

	showtime: function (time) {
		this.timeCount = time;
		this.clockLabel.string = this.timeCount;
		this.schedule(this.callback, 1);
		//this.schedule(this.Btncallback,0.01);
	},
	callback: function () {
		this.timeCount--;

		cc.log("----------------step", this.step);
		this.clockLabel.string = this.timeCount;

		if (this.timeCount == 0) {

			this.clockLabel.node.parent.active = false;
			//时间到了
			this.unschedule(this.callback);
			if (this.opChair == 0) {
				if (this.step == stepEnum.jiaoStep) {
					this.jiaodizhuBox.active = false;
					var msg = {

						cmd: DdzCommand.REQ_CMD.CMD_CallLandOwner,
						data: {
							userid: UserCenter.getUserID(),
							isCall: 0,
						}

					};
					this.sendCmd(".CMD_Command", msg);
				} else if (this.step == stepEnum.qiangStep) {
					this.qiangdizhuBox.active = false;
					var msg = {

						cmd: DdzCommand.REQ_CMD.CMD_GrabLandOwner,
						data: {
							userid: UserCenter.getUserID(),
							isGrab: 0,
						}

					};
					this.sendCmd(".CMD_Command", msg);

				} else if (this.step == stepEnum.jiabeiStep) {
					this.jiabeiBox.active = false;
					var msg = {

						cmd: DdzCommand.REQ_CMD.CMD_AddTimes,
						data: {
							userid: UserCenter.getUserID(),
							isAdd: 0,
							times: 0
						}

					};
					this.sendCmd(".CMD_Command", msg);

				}
			}
			if (this.step = 0) {

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
	RCMD_Command: function (event) {
		let data = event.detail;
		let cmd = data.cmd;
		let retData = data.data;
		let self = this;
		//test
		// if (cmd == DdzCommand.RESP_CMD.RCMD_GrabLandOwner) {
		//     cmd = DdzCommand.RESP_CMD.RCMD_Result;
		//     retData = {basemoney:1,playercount:3,isSpring:0,ar:[{userid:10016074,username:"B00255891",isDizhu:-1,times:3,isWin:0,curwon:-3},{userid:10016074,username:"B00255891",isDizhu:-1,times:3,isWin:0,curwon:-3},{userid:10016074,username:"B00255891",isDizhu:-1,times:3,isWin:0,curwon:-3}]}
		// }
		cc.log("服务端下发(game)------RCMD_Command", parseInt(data.cmd, 16), JSON.stringify(event.detail));

		if (cmd == DdzCommand.RESP_CMD.RCMD_INITDATA) {
			cc.log("RCMD_INITDATA");
			// cc.log(retData);
			this.roomType = retData.roomType;
			this.gameid = retData.gameid;
			this.difenLabel.string = retData.basescore;

			if (!!this.matchWaiting) {  // 删除等待比赛界面
				this.matchWaiting.removeFromParent(true)
				this.matchWaiting = null
			}
			if (self.paiduiPreb) {
				self.paiduiPreb.active = false;
			}
			this.opChair = 0;
			this.game = config.getGameById(this.gameid);
			SettingMgr.stopBg();
			SettingMgr.playBg(this.game.backMusic);
			this.soundCtrl = this.node.addComponent(this.game.sound || 'DdzSound');  // 默认普通话
			this.node.addComponent(SoundCtrl);
			// SoundCtrl.playJiao(1,1);

			// require('Wanfa')
			if (this.roomType != 2) {
				this.timeLimit = true
				this.roomInfo.active = false;
			} else if (this.roomType == 2) { //
				//
				this.roomInfo.active = true;
				this.roomInfo.children[1].active = false;
				this.roomIdLabel.getComponent(cc.Label).string = '房间号:' + retData.roomcode;
				this.roomIdLabel.node.active = true;
				/*this.Info.children[0].getComponent(cc.Label).string = DdzManager.rule.playerNum;
                this.Info.children[0].active = true;
                this.Info.children[1].active = true;
                this.Info.children[1].getComponent(cc.Label).string = DdzManager.rule.cardSendNum;*/
				this.ruleFlag = retData.ruleFlag;
				// this.isXianzhi = (this.ruleFlag>>2);
				this.expend = retData.expend;
				var game = Loadgame.getCurrentGame();
				cc.log('ruleFlag:', this.ruleFlag, 'expend:', this.expend);
				if ((this.ruleFlag & 0x08) == 8) {
					this.timeLimit = true
				}
				var wanfaDes = !!game.getWanfa ? game.getWanfa(this.ruleFlag, this.expend) : WanFa.getWanfa(game, this.ruleFlag);
				cc.log(wanfaDes);
				this.wanfaLabel.string = wanfaDes;

				this.cardJushu.active = true;
				if (retData.currGame == 0) {
					this.roomButton.active = wxapi.isInstallWeChat();
				}
				this.curGame = retData.currGame;
				this.refreshJushu(retData.currGame, retData.totalGame);
				this.cardRoomInitFlag = false;
				if (!this.cardRoomInitFlag) {
					var roomcontroller = this.addComponent("DdzCardRoomController");
					roomcontroller.init(data);
					this.cardRoomInitFlag = true;
				}

			}
			if (this.roomType != 2) {

				this.roommenu.getChildByName("content").getChildByName("disRoomButton").active = false;
				this.roommenu.getChildByName("content").getChildByName("ExitButton").active = this.roomType ==1;
				this.chatNode.getChildByName("speech").active = false;
			} else {
				this.roommenu.getChildByName("content").getChildByName("ExitButton").active = false;
			}
			this.InitData();

			this.chatNode.active = this.roomType < 20;

			DdzManager.rule.setMsgBlocked(false);
		} else if (cmd == DdzCommand.RESP_CMD.RCMD_LightStart) {
			cc.log("RCMD_LightStart");
			let userid = retData.userid;
			if (userid == UserCenter.getUserID()) {
				this.isMingpaiStart = 1;
				this.initCurrGame();
			}
			let chair = this.getChairByUserid(userid);
			// let player=this.players[chair];

			this.setReady(chair, true);
			if (retData.caller > 0) {
				this.step = stepEnum.jiaoStep;
				this.showClock(retData.caller, true, 10);
				// let callerChair = this.getChairByUserid(retData.caller);
				// var callerPlayer = this.players[callerChair];
				if (retData.caller == UserCenter.userID) {
					this.jiaodizhuBox.active = true;
				}

			}
			DdzManager.rule.setMsgBlocked(false);
			// var effectNode=player.getChildByName("effectNode");
			// this.showHintAni(effectNode,hintSpritesEnum.mingpaiSprite);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_CallLandOwner) {
			cc.log("RCMD_CallLandOwner");
			this.isfapaiOver = true
			let userid = retData.userid;
			let chair = this.getChairByUserid(userid);
			let player = this.players[chair];
			var opPlayerInfo = GamePlayer.getPlayer(userid);

			var effectNode = player.getChildByName("effectNode");
			this.showClock(userid, false);

			if (retData.isCall) {
				this.step = stepEnum.qiangStep;
				this.setHintNode(chair, true, hintSpritesEnum.jiaoSprite);
				this.soundCtrl.playAboutLandOwner(2, opPlayerInfo.sex);
			} else {
				this.setHintNode(chair, true, hintSpritesEnum.bujiaoSprite);
				this.soundCtrl.playAboutLandOwner(1, opPlayerInfo.sex);
			}
			if (retData.dizhu) {
				this.dipaiKuangNode.active = true;
				this.dizhuID = retData.dizhu;
				let dizhuChair = this.getChairByUserid(retData.dizhu);
				for (var index = 0; index < 3; index++) {
					this.setHintNode(index, false);
					let NUMSprite = this.players[index].getChildByName("NUM");
					if (index == dizhuChair) {
						this.players[index].getChildByName('dizhu').active = true;
						NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 20;
					} else {
						this.players[index].getChildByName('nongmin').active = true;
						NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 17;
					}
				}
				this.bisaiMulu.active = true;
				this.showDipai(this.dipaiLayout, retData.dzcards);
				if (dizhuChair == 0) {
					this.addDipai(retData.dzcards);
				}


				// if (this.isXianzhi) {
				//     var msg = {
				//         cmd : DdzCommand.REQ_CMD.CMD_AddTimes,
				//         data:{
				//             userid:UserCenter.getUserID(),
				//             isAdd : 0,
				//             times : 0
				//         }
				//     };
				//     this.sendCmd(".CMD_Command", msg);
				// } else {
				this.jiabeiBox.active = true;
				this.step = stepEnum.jiabeiStep;
				this.showClock(UserCenter.getUserID(), true, 10);
				// }

				// this.clockLabel = this.players[0].getChildByName("clock").getChildByName('clockLabel').getComponent(cc.Label);
				// this.showtime(5);
			} else {
				if (retData.nextid) {
					let nextChair = this.getChairByUserid(retData.nextid);
					if (retData.isCall) {
						this.step = stepEnum.qiangStep;
					} else {
						this.step = stepEnum.jiaoStep;
					}
					this.showClock(retData.nextid, true, 10);
					if (nextChair == 0) {
						if (retData.isCall) {
							this.qiangdizhuBox.active = true;
						} else {
							this.jiaodizhuBox.active = true;
						}


					} else {
					}
				}
			}
			DdzManager.rule.setMsgBlocked(false);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_GrabLandOwner) {
			cc.log("RCMD_GrabLandOwner");

			let userid = retData.userid;
			this.showClock(userid, false);
			let chair = this.getChairByUserid(userid);
			let player = this.players[chair];
			if (retData.dizhu != 0){
				this.dizhuID = retData.dizhu;
			}
			var opPlayerInfo = GamePlayer.getPlayer(userid);

			var effectNode = player.getChildByName("effectNode");
			if (retData.isGrab) {
				if (retData.grabIndex == 1) {
					this.soundCtrl.playAboutLandOwner(4, opPlayerInfo.sex);
				} else if (retData.grabIndex == 2) {
					this.soundCtrl.playAboutLandOwner(5, opPlayerInfo.sex);
				} else {
					this.soundCtrl.playAboutLandOwner(6, opPlayerInfo.sex);
				}

				this.setHintNode(chair, true, hintSpritesEnum.qiangSprite);
				// this.showHintAni(effectNode,hintSpritesEnum.qiangSprite);
			} else {
				this.soundCtrl.playAboutLandOwner(3, opPlayerInfo.sex);
				this.setHintNode(chair, true, hintSpritesEnum.buqiangSprite);
				// this.showHintAni(effectNode,hintSpritesEnum.buqiangSprite);
			}
			if (retData.dizhu) {
				this.dipaiKuangNode.active = true;
				let dizhuChair = this.getChairByUserid(retData.dizhu);
				for (var index = 0; index < 3; index++) {
					let NUMSprite = this.players[index].getChildByName("NUM");
					if (index == dizhuChair) {
						this.players[index].getChildByName('dizhu').active = true;
						NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 20;
					} else {
						this.players[index].getChildByName('nongmin').active = true;
						NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = 17;
					}
					this.setHintNode(index, false);
					if (index == dizhuChair) {
						this.players[index].getChildByName('nongmin').active = false;
						this.players[index].getChildByName('dizhu').active = true;
					} else {
						this.players[index].getChildByName('dizhu').active = false;
						this.players[index].getChildByName('nongmin').active = true;
					}

				}
				this.showDipai(this.dipaiLayout, retData.dzcards);
				if (dizhuChair == 0) {
					this.addDipai(retData.dzcards);
				}
				// if (this.isXianzhi) {
				//     var msg = {
				//         cmd : DdzCommand.REQ_CMD.CMD_AddTimes,
				//         data:{
				//             userid:UserCenter.getUserID(),
				//             isAdd : 0,
				//             times : 0
				//         }
				//     };
				//     this.sendCmd(".CMD_Command", msg);
				// } else {
				this.jiabeiBox.active = true;
				this.step = stepEnum.jiabeiStep;
				this.showClock(UserCenter.getUserID(), true, 10);
				// }

			} else {
				if (retData.nextid) {

					let nextChair = this.getChairByUserid(retData.nextid);
					this.showClock(retData.nextid, true, 10);
					if (nextChair == 0) {
						this.qiangdizhuBox.active = true;
					} else {
					}
				}
			}
			DdzManager.rule.setMsgBlocked(false);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_LightCard) {
			cc.log("RCMD_LightCard");
			let userid = retData.userid;
			var opPlayerInfo = GamePlayer.getPlayer(userid);
			let chair = this.getChairByUserid(userid);
			let player = this.players[chair];
			var effectNode = player.getChildByName("effectNode");
			if (retData.isSee) {
				this.soundCtrl.playAboutLandOwner(9, opPlayerInfo.sex);
			}
			if (retData.caller > 0) {
				this.step = stepEnum.jiaoStep;
				this.showClock(retData.caller, true, 10);
				let callerChair = this.getChairByUserid(retData.caller);
				var callerPlayer = this.players[callerChair];
				if (callerChair == 0) {

					this.jiaodizhuBox.active = true;
				}

			}
			DdzManager.rule.setMsgBlocked(false);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_AddTimes) {

			cc.log("RCMD_AddTimes");

			let userid = retData.userid;
			if (userid == UserCenter.getUserID()) {
				this.jiabeiBox.active = false;
			}

			let chair = this.getChairByUserid(userid);
			let player = this.players[chair];
			var opPlayerInfo = GamePlayer.getPlayer(userid);
			this.setIsJiabei(chair, retData.isAdd);
			// if (this.isXianzhi) {
			//     return;
			// }
			if (retData.isAdd) {
				this.soundCtrl.playAboutLandOwner(8, opPlayerInfo.sex);
			} else {
				this.soundCtrl.playAboutLandOwner(7, opPlayerInfo.sex);
			}
			DdzManager.rule.setMsgBlocked(false);

		}
		else if (cmd == DdzCommand.RESP_CMD.RCMD_GameStart) {
			cc.log("RCMD_GameStart");

			cc.log(retData);
			// let dizhuchair = this.getChairByUserid(this.dizhu);
			// var dizhuPlayer = this.players[dizhuchair];
			// this.fendata = [[],[],[]];
			// this.xianshiFen();
			// for(var i = 0;i<this.players.length;i++)
			// {
			//     var nonmingNode = this.players[i].getChildByName('nongmin');
			//     var dizhuNode = this.players[i].getChildByName('dizhu');
			//     if (i == dizhuchair) {
			//         nonmingNode.active = false;
			//         dizhuchair.active = true;
			//     } else {
			//         dizhuchair.active = false;
			//         nonmingNode.active = true;
			//     }
			//     // var prisebox = this.players[i].getChildByName('scoreView');
			//     // prisebox.children[1].getComponent(cc.Label).string = 0;
			//     // prisebox.children[0].getComponent(cc.Label).string = 0;
			//
			// }
			for (let index = 0; index < 3; index++) {
				this.setGameStartStatus(index);
			}
			// this.cardData = retData.lightcard;
			// var cardData = DdzManager.getCardTypeNum(retData.lightcard);
			//
			// this.cutcardPrefab = cc.instantiate(DdzManager.cutcardPrefab);
			// this.cutcardPrefab.parent = this.node.parent.getChildByName('cutCard');
			// var cutcard = this.cutcardPrefab.getChildByName('control');
			// var Ctrl = cutcard.getComponent('DdzcutcardCtrl');
			// Ctrl.showLightCard(cardData,2);


			this.soundCtrl.playStart();
			this.rank = 0;
			this.refreshJushu(retData.currGame, retData.totalGame);

			this.InitData();

			DdzManager.rule.setMsgBlocked(false);


		} else if (cmd == DdzCommand.RESP_CMD.RCMD_SendTimesInfo) {
			cc.log('RCMD_SendTimesInfo');
			this.beishuLabel.string = retData.gametimes;
			DdzManager.rule.setMsgBlocked(false);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_SendPlayerInfo) {
			cc.log('RCMD_SendPlayerInfo');
			this.step = retData.step;

			if (retData.users.length == 3) {

				if (retData.step == 1) {//明牌阶段
					for (var i = 0; i < retData.users.length; i++) {
						let user = retData.users[i];
						let chair = this.getChairByUserid(user.userid);
						if (chair == 0) {
							if (user.isLight == -1) {
								// this.mingpaiBox.active = false;
								var msg = {
									cmd: DdzCommand.REQ_CMD.CMD_LightCard,
									data: {
										userid: UserCenter.getUserID(),
										see: '0',
										times: 0
									}
								};
								this.sendCmd(".CMD_Command", msg);
							}
						}
					}

				} else if (retData.step == 2) {//叫地主阶段
					if (retData.nextid == UserCenter.getUserID()) {
						if (retData.oddtime > 0) {
							this.showClock(retData.nextid, true, retData.oddtime);
						}
						this.jiaodizhuBox.active = true;
					}

				} else if (retData.step == 3) {//抢地主阶段
					if (retData.nextid == UserCenter.getUserID()) {
						if (retData.oddtime > 0) {
							this.showClock(retData.nextid, true, retData.oddtime);
						}
						this.qiangdizhuBox.active = true;
					}

				} else if (retData.step == 4) {//加倍阶段
					for (var i = 0; i < retData.users.length; i++) {
						let user = retData.users[i];
						let chair = this.getChairByUserid(user.userid);
						if (chair == 0) {
							if (user.isAdd == -1) {
								if (retData.oddtime > 0) {
									this.showClock(retData.nextid, true, retData.oddtime);
								}
								this.jiabeiBox.active = true;
							}
						}
					}

				} else if (retData.step == 5) {//出牌阶段

				} else if (retData.step == 6) {//解散阶段

				}

				if (retData.step > 3 && retData.step < 6) {
					this.bisaiMulu.active = true;
					this.showDipai(this.dipaiLayout, retData.cardarray);
					for (var i = 0; i < retData.users.length; i++) {
						let user = retData.users[i];
						let chair = this.getChairByUserid(user.userid);
						if (user.isLandOwner > 0) {
							this.dizhuID = user.userid;
						}
						this.setIsDizhu(chair, user.isLandOwner > 0);
						this.setIsJiabei(chair, user.isAdd > 0);
					}
				}

			} else {

			}
			DdzManager.rule.setMsgBlocked(false);
		}
		else if (cmd == DdzCommand.RESP_CMD.RCMD_SendLightCardID) {
			cc.log('RCMD_SendLightCardID');
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
			cc.log('XXXXXXXXXXXxlightcard', lightcard);
			position1 = lightcard.convertToNodeSpaceAR(wPos1);
			position2 = lightcard.convertToNodeSpaceAR(wPos2);

			var BigLight = lightcard.children[0];
			var SmallLight = lightcard.children[1];
			if (DdzManager.rule.playerNum == 4) {
				SmallLight.active = true;
			}


			var Action1 = cc.spawn(cc.moveTo(0.5, position1), cc.rotateBy(0.5, 360));
			var Action2 = cc.spawn(cc.moveTo(0.5, cc.p(position2.x, position2.y)), cc.rotateBy(0.5, 360));


			BigLight.runAction(cc.sequence(Action1, cc.delayTime(1.5), cc.callFunc(function () {
				BigLight.removeFromParent();
				DdzManager.rule.setMsgBlocked(false);
			})));
			SmallLight.runAction(cc.sequence(cc.delayTime(0.1), Action2, cc.delayTime(1.4), cc.callFunc(function () {
				SmallLight.removeFromParent();
			})));
			DdzManager.rule.setMsgBlocked(false);

		} else if (cmd == DdzCommand.RESP_CMD.RCMD_SendCard) {
			cc.log('RCMD_SendCard');
			// cc.log(retData);

			let userId = retData.userid;

			let card = retData.ar;
			let cardnum = card.length;
			var cansee = retData.isSee;
			var chair = this.getChairByUserid(userId);
			let player = this.players[chair];
			this.setGameStartStatus(chair);

			if (this.handCardprefab == null) {
				this.handCardprefab = cc.instantiate(DdzManager.HandCardPrefab);
				this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
				this.handCardprefab.getChildByName("control").getComponent("DdzhandCard").roomType = this.roomType;
				this.handCardprefab.getChildByName("control").getComponent("DdzhandCard").timeLimit = this.timeLimit;
				cc.log(this.roomType)
				this.handCardprefab.getChildByName('changepai').x = this.roomType ==2? 442: 522;
				this.handCardprefab.getChildByName('changepai').active = true;
				// cc.log('---------房间时间限制----------',this.timeLimit)
			} else {
				this.handCardprefab.getChildByName("control").getComponent("DdzhandCard").timeLimit = this.timeLimit;
				this.handCardprefab.getChildByName('changepai').x = this.roomType ==2? 442: 522;
				this.handCardprefab.getChildByName('changepai').active = true;

				// cc.log('---------房间时间限制----------',this.timeLimit)
			}


			var isPlayAni = retData.aniflag;
			if (chair != 0) {
				let NUMSprite = player.getChildByName("NUM");
				NUMSprite.active = true;
				NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = cardnum;
			}

			if (retData.isGameOver) {
				if ((chair != 0) && cansee != 1) {
					var mingpaiLayout = player.getChildByName("mingpaiLayout");
					mingpaiLayout.removeAllChildren();
					this.showOutCard(mingpaiLayout, card, 3, chair);
				}
			} else {
				if ((chair != 0) && cansee == 1) {
					var mingpaiLayout = player.getChildByName("mingpaiLayout");
					mingpaiLayout.removeAllChildren();

					// this.showMingpaiLayout(mingpaiLayout,card);
					this.showOutCard(mingpaiLayout, card, 3, chair);
				}
				if (userId == UserCenter.getUserID() && this.isfapaiOver == false) {
					// card = [48,49,50,51,64,65,66,67,80,81,82,83,96,97,98,99,112,113,114,115,240,241,242,243,17];
					// card = [176,177,178,179,192,193,194,195,208,209,210,211,224,225,226,227,240,241,242,243,240,48,49,17];
					// card = [146,147,177,178,179,160,161,193,194,195,208,209,210,211,224,225,226,227,242,243,240,48,16,17];
					for (let index = 0; index < card.length; index++) {
						card[index] = DdzManager.getCardTypeNum(card[index]);
					}

					this.showHandCard(card, isPlayAni,this.dizhuID == UserCenter.getUserID(),cansee == 1);
					if (isPlayAni == 1) {
						for (var index = 0; index < 3; index++) {
							this.setHintNode(index, false);
						}
						// this.mingpaiBox.active = true;
						var timeCallback = function (dt) {
							this.soundCtrl.playFapai();
						};
						// NUMSprite.active=false;
						this.scheduleOnce(timeCallback, 0.7);
					}
				}
				else {
					// if(cardnum>0&&isPlayAni!=1)
					// {
					//     NUMSprite.active=true;
					// }
					DdzManager.rule.setMsgBlocked(false);
				}
			}
			DdzManager.rule.setMsgBlocked(false);

		}
		//
		// else if (cmd == DdzCommand.RESP_CMD.RCMD_Eastwind)
		// {
		//     cc.log('RCMD_Eastwind');
		//     this.outCardType=0;
		//     this.outcardseatid=0;
		//     this.num=2;
		//     this.PokScore = 0;
		//     this.Info.children[0].getComponent(cc.Label).string = this.PokScore;
		//     this.length=0;
		//     this.X = 1;
		//     for(var i=1;i<=4;i++)
		//     {
		//         let chair=this.getChairBySeatId(i);
		//         this.players[chair].getChildByName("pass").active=false;
		//         let outcard=this.players[chair].getChildByName("outCardLayout");
		//         outcard.removeAllChildren(true);
		//     }
		//     var outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
		//     outcardLayout.removeAllChildren(true);
		//     DdzManager.rule.setMsgBlocked(false);
		// }
		else if (cmd == DdzCommand.RESP_CMD.RCMD_CleanCard) {
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

///
			DdzManager.rule.setMsgBlocked(false);
		}
		// else if (cmd == DdzCommand.RESP_CMD.RCMD_Runfirst)
		// {
		//     cc.log("RCMD_Runfirst",retData);
		//     this.rank = 0;
		//     let rankArray = retData.ar;
		//     for(var i = 0;i<rankArray.length;i++)
		//     {
		//         var rank = rankArray[i];
		//         var rankNum = rank.first;
		//         if(rankNum>0)
		//         {
		//             var rankNum = rank.first;
		//             var userid = rank.userid;
		//             var chair = this.getChairByUserid(userid);
		//             this.rank+=1;
		//             var player = this.players[chair];
		//             player.getChildByName('NUM').active=false;
		//             var rankImg = player.getChildByName('rankImg'+rankNum);
		//             rankImg.active=true;
		//         }
		//     }
		//     DdzManager.rule.setMsgBlocked(false);
		// }
		//该谁出牌
		else if (cmd == DdzCommand.RESP_CMD.RCMD_First) {
			cc.log('RESP_CMD.RCMD_First')
			this.isGameStart = true;
			let firstID = retData.userid;
			this.firstSendCardID = retData.userid;
			this.step = stepEnum.chupaiStep;
			let time = retData.playtime;
			if (firstID != UserCenter.getUserID()) {
				this.showClock(firstID, true, time);
			}


			let chair = this.getChairByUserid(firstID);
			let seatid = GamePlayer.getPlayer(firstID).seatid;
			// let seatid = this.getSeatIdByChair(chair);
			let player = this.players[chair];
			player.getComponent(cc.Sprite).spriteFrame = this.chupaiHintKuangSprite;
			// cc.loader.loadRes('game/shuangkou/skScene/texture/headbg',cc.SpriteFrame,function (err,spriteFrame) {
			//     player.getComponent(cc.Sprite).spriteFrame = spriteFrame;
			// });
			let outcardLayout = player.getChildByName("outCardLayout");
			let pass = player.getChildByName("pass");
			pass.active = false;
			outcardLayout.removeAllChildren(true);

			if (seatid == this.outcardseatid) {
				cc.log("------seatid = this.outcatdid", seatid);
				this.outCardType = 0;
				this.PokScore = 0;
				// this.Info.children[0].getComponent(cc.Label).string = this.PokScore;

				for (var i = 1; i <= 3; i++) {
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
				let handCardController = handCard.getComponent("DdzhandCard");
				let outcardLayout = this.handCardprefab.getChildByName('outCardLayout');
				handCardController.changeCardOut();
				if (outcardLayout != null) {
					outcardLayout.removeAllChildren(true);
				}
				this.handCardprefab.getChildByName("gameBtn").active = true;
				if (this.outCardType == 0) {
					this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active = false;
					this.handCardprefab.getChildByName("gameBtn").getChildByName("Tips").active = false;
				}
				else {
					this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active = true;
					this.handCardprefab.getChildByName("gameBtn").getChildByName("Tips").active = true;
				}
				cc.log(" seatid-------cardtype-----seatid---------", this.outcardseatid, this.outCardType, seatid);
				handCardController.getCardData(this.tableId, seatid, this.outCardType, this.length, this.num, this.X, true);
				if (this.timeLimit || DdzManager.autoplaySign) {
					if (this.timeLimit) {
						handCardController.clockSprite.active = true;
					}
					cc.log("断线重连出牌剩余时间------", time)
					if (time > 0) {
						handCardController.showtimeOutPai(time);
					}
				}


			}

			DdzManager.rule.setMsgBlocked(false);
		}
		else if (cmd == DdzCommand.RESP_CMD.RCMD_FirstExtend) {
			cc.log("RESP_CMD.RCMD_FirstExtend-----------------", retData)
			if (this.dizhuID == retData.userid && retData.played == 0 && this.dizhuID == UserCenter.getUserID() && retData.lighted == 0) {
				this.handCardprefab.getChildByName("gameBtn").active = true;
				this.handCardprefab.getChildByName("gameBtn").getChildByName("noCard").active = false;
				this.handCardprefab.getChildByName("gameBtn").getChildByName("Tips").active = false;
				this.handCardprefab.getChildByName("gameBtn").getChildByName("mingpai").active = true;
			} else {
				this.handCardprefab.getChildByName("gameBtn").getChildByName("mingpai").active = false;
			}
			DdzManager.rule.setMsgBlocked(false);
		}
		else if (cmd == DdzCommand.RESP_CMD.RCMD_OutCardDLink) {
			cc.log("RCMD_OutCardDLink");
			///////-----cc.log(retData);
			// if (retData.users.length) {

			for (var index = 0; index < retData.users.length; index++) {

				let user = retData.users[index];
				let cardarray = user.cardarray;
				cc.log(cardarray);
				let cardtype = user.cardtype;
				let UserID = user.userid
				let seatid = user.seatid;

				cc.log(cardarray);
				let chair = this.getChairBySeatId(seatid);
				if (retData.lastIndex == user.outcardindex && retData.lastUserId != UserCenter.getUserID()) {
					if (cardtype == 10) {
						var num = DdzManager.getCardTypeNum(cardarray[cardarray.length / 5 * 3 - 1]);
					} else if (cardtype == 9) {
						var num = DdzManager.getCardTypeNum(cardarray[cardarray.length - cardarray.length / 4 - 1]);
					} else if (cardtype == 5 || cardtype == 4) {
						var num = DdzManager.getCardTypeNum(cardarray[2]);
					} else if (cardtype == 11 || cardtype == 12 || cardtype == 13) {
						var num = DdzManager.getCardTypeNum(cardarray[3]);
					}
					else {
						var num = DdzManager.getCardTypeNum(cardarray[cardarray.length - 1]);
					}
					let handCard = this.handCardprefab.getChildByName("control");

					let handCardController = handCard.getComponent("DdzhandCard");
					handCardController.timeLimit = this.timeLimit;
					cc.log('-------断线重连时间限制-------', handCardController.timeLimit)
					this.outcardseatid = seatid;
					this.outCardType = user.cardtype;
					this.length = cardarray.length;
					// if(cardtype>=10&&this.X>=3){
					//     this.num = DdzManager.rule.JudgeNum(baseNode.children);
					// }
					// else{
					this.num = num[1];
					// }

					handCardController.getCardData(this.tableId, this.outcardseatid, cardtype, this.length, this.num, this.X, false);

					DdzManager.rule.setMsgBlocked(false);

				}
				let player = this.players[chair];
				var baseNode = player.getChildByName("outCardLayout");
				baseNode.active = true;
				this.showOutCard(baseNode, cardarray, 2, chair,UserID);
			}			DdzManager.rule.setMsgBlocked(false);

		}
		//出牌
		else if (cmd == DdzCommand.RESP_CMD.RCMD_OutCard) {

			cc.log("RCMD_OutCard");
			// cc.log(retData)
			// this.addfenpai(retData.cardarray);
			let userid = retData.userid;
			if (userid != UserCenter.getUserID()) {
				this.showClock(userid, false);
			}else{
				let handCard = this.handCardprefab.getChildByName("control");
				let handCardController = handCard.getComponent("DdzhandCard");
				handCardController.refreshLayout(retData.cardarray);
				handCardController.gameBtnLayout.active = false;
				handCardController.unschedule(handCardController.callback);
			}
			this.handCardprefab.getChildByName("gameBtn").getChildByName("mingpai").active = false;
			let cardarray = retData.cardarray;
			let cardtype = retData.cardtype;
			let seatid = retData.seatid;
			let length = cardarray.length;
			let selfUsrid = UserCenter.getUserID();
			//let num=DdzManager.getCardTypeNum(cardarray[cardarray.length-1]);
			if (cardtype == 10) {
				var num = DdzManager.getCardTypeNum(cardarray[cardarray.length / 5 * 3 - 1]);
			} else if (cardtype == 9) {
				var num = DdzManager.getCardTypeNum(cardarray[cardarray.length - cardarray.length / 4 - 1]);
			} else if (cardtype == 5 || cardtype == 4) {
				var num = DdzManager.getCardTypeNum(cardarray[2]);
			} else if (cardtype == 11 || cardtype == 12 || cardtype == 13) {
				var num = DdzManager.getCardTypeNum(cardarray[3]);
			}
			else {
				var num = DdzManager.getCardTypeNum(cardarray[cardarray.length - 1]);
			}

			var chair = this.getChairByUserid(userid);


			let player = this.players[chair];

			player.getComponent(cc.Sprite).spriteFrame = this.headBgSprite;
			var baseNode = player.getChildByName("outCardLayout");
			var effectNode = player.getChildByName("effectNode");
			baseNode.active = true;
			this.outcardseatid = seatid;
			this.outCardType = cardtype;
			cc.log(" seatid-------cardtype--------------", this.outcardseatid, this.outCardType);
			this.length = length;
			let NUMSprite = player.getChildByName("NUM");
			var numValue = NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string;
			numValue = parseInt(numValue);
			numValue -= length;
			if ((numValue == 1 || numValue == 2) && chair != 0) {
				this.soundCtrl.playBaojing();
				let baojingNode = player.getChildByName("baojingNode");
				this.showOutCardAni(baojingNode, 16);
			}
			NUMSprite.getChildByName("cardNum").getComponent(cc.Label).string = numValue;

			// if (chair != 0) {
			if (retData.isSee && chair != 0) {
				var mingpaiLayout = player.getChildByName("mingpaiLayout");
				if (mingpaiLayout.childrenCount != 0) {
					for (var i = 0; i < cardarray.length; i++) {
						var card = cardarray[i];
						for (var j = 0; j < mingpaiLayout.childrenCount; j++) {
							var cardObject = mingpaiLayout.children[j];
							var pokerCtr = cardObject.getComponent("DdzpokerCtrSS");
							if (card == pokerCtr.info) {
								cardObject.removeFromParent();
								break;
							}
						}
					}
				}

			}
			this.showOutCard(baseNode, cardarray, 2, chair,retData.userid);
			// this.showOutCardAni(effectNode, 17);
			this.showOutCardAni(effectNode, this.outCardType);
			// }
			// this.Info.children[0].getComponent(cc.Label).string = this.PokScore;

			this.num = num[1];
			// if(cardtype>=10&&this.X>=3){
			//     this.num = DdzManager.rule.JudgeNum(baseNode.children);
			// }
			// else{
			//     this.num=num[1];
			// }

			let handCard = this.handCardprefab.getChildByName("control");
			let handCardController = handCard.getComponent("DdzhandCard");
			handCardController.getCardData(this.tableId, this.outcardseatid, this.outCardType, this.length, this.num, this.X, false);
			var type = handCardController.changeCardType(cardtype);
			cc.log("!!!!!!!!!!!!!!!!!!!!!!!!!", cardtype, type);
			let user = GamePlayer.getPlayer(userid);
			this.playSound(user.sex, type, this.num);
			// this.playBoomEffect(cardtype);
			DdzManager.rule.setMsgBlocked(false);
		}
		//过牌
		else if (cmd == DdzCommand.RESP_CMD.RCMD_GiveUpOutCard) {

			cc.log("RCMD_GiveUpOutCard");
			let userid = retData.userid;
			// if (userid != UserCenter.getUserID()) {
			this.showClock(userid, false);
			// }
			let chair = this.getChairByUserid(userid);
			let player = this.players[chair];

			player.getComponent(cc.Sprite).spriteFrame = this.headBgSprite;
			var passSprite = player.getChildByName("pass");
			passSprite.active = true;
			let handCard = this.handCardprefab.getChildByName("control");
			let handCardController = handCard.getComponent("DdzhandCard");
			if(chair == 0){
				handCardController.onGetNoCard();
			}
			this.soundCtrl.playPass();
			handCardController.getCardData(this.tableId, this.outcardseatid, this.outCardType, this.length, this.num, this.X, false);
			DdzManager.rule.setMsgBlocked(false);
		}
		//结算界面
		else if (cmd == DdzCommand.RESP_CMD.RCMD_Result) {
			let self = this;
			cc.log("RCMD_Result");
			cc.log(retData);
			this.cancelAutoPlay()
			if (this.roomType < 2) {
				DdzManager.rule.isPlaying = false;
			}

			this._updatePlayers(data);
			DdzManager.rule.setMsgBlocked(true);

		}else if (cmd == DdzCommand.RESP_CMD.RCMD_LightCardAfter) {
			cc.log(retData)
			cc.log("----------RESP_CMD.RCMD_LightCardAfter---------")
			let userid = retData.userid;
			var opPlayerInfo = GamePlayer.getPlayer(userid);
			this.soundCtrl.playAboutLandOwner(9, opPlayerInfo.sex);
		}
		else{
			DdzManager.rule.setMsgBlocked(false);
		}



	},
	// refreshPartenerHandCard:function()
	// {
	//     let length = this.partenerHandLayout.childrenCount;
	//     let startX;
	//     var Layout = this.partenerHandLayout.getComponent(cc.Layout);
	//     if(length>=2&&length<=27)
	//     {
	//         Layout.spacingX = (-92+(27-length));
	//     }
	//     else if(length>0&&length<=2)
	//     {
	//         Layout.spacingX = -67;
	//     }
	//     if(length%2 == 1)
	//     {
	//         //单数
	//         startX = Math.floor(length/2)*(-46);
	//     }else
	//     {
	//         //双数
	//         startX = -46/2-(Math.floor(length/2) - 1)*46;
	//     }
	//
	//     DdzManager.rule.sortHandPokersBToS(this.partenerHandLayout.children);
	//     for(let i = 0;i < length ;i++)
	//     {
	//         let poker =this.partenerHandLayout.children[i];
	//         poker.x = startX+46*i;
	//         poker.setLocalZOrder(10000+i);
	//         poker.getComponent("DdzpokerCtr").index = i;
	//     }
	//
	// },

	refreshPartenerHandCard: function (basenode) {
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

		DdzManager.rule.sortHandPokersBToS(basenode.children);
		// for(let i = 0;i < length ;i++)
		// {
		//     let poker =basenode.children[i];
		//     poker.x = startX+46*i;
		//     poker.setLocalZOrder(10000+i);
		//     poker.getComponent("DdzpokerCtr").index = i;
		// }

	},


	playSound: function (sex, type, num) {

		cc.log('num', num);
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

		if (type == 9 || type == 10) {
			this.soundCtrl.playBoom1();
		} else if (type == 11 || type == 12) {
			this.soundCtrl.playBoom2();
		} else if (type == 13) {
			this.soundCtrl.playBoom3();
		} else if (type == 14) {
			this.soundCtrl.playBoom5();
		} else {
			this.soundCtrl.playOutpai();
		}
	},

	refreshTable: function () {
		for (var i = 0; i < 4; i++) {
			let player = this.players[i];
			for (var j = 1; j < 4; j++) {
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
		// this.Info.children[0].getComponent(cc.Label).string = this.PokScore;
		this.partenerHandLayout.removeAllChildren(true);
		this.handCardprefab.getChildByName("outCardLayout").removeAllChildren(true);
	},

	showHintAni: function (effectnode, type) {
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
	showOutCardAni: function (effectnode, type) {
		cc.log('炸弹', effectnode, type)
		var effectName = '';

		if (type == 6) {
			effectName = 'Shunzi2/ShunziNode';
		}
		else if (type == 7) {
			effectName = 'LianDui/LianduiNode';
		}
		else if (type == 9 || type == 10) {
			effectName = 'FeiJi/FeijiNode';
		}
		// else if(type == 8){
		//     effectName='Bomb/3dai2';
		// }
		else if (type == 14) {
			effectName = 'Bomb/Bomb';
		} else if (type == 15) {
			effectName = 'SiWang/SiWang';
		} else if (type == 16) {
			effectName = 'Bomb/baojingAni';
		} else if (type == 17) {
			effectName = 'Bomb/chuntian';
		}
		// else if(type>=11&&type<14)
		// {
		//     cc.loader.loadRes("doudizhu/effect/Bomb2/Bomb2Node", cc.Prefab, function (err, prefab) {
		//         if (err) {
		//             return;
		//         }
		//         var module = cc.instantiate(prefab);
		//
		//         module.parent = effectnode;
		//         var Ctrl = module.getComponent('Bomb2Ctrl');
		//         Ctrl.onShow(type-5);
		//     });
		//
		// }

		if (effectName != '') {
			let path = "game/ddz/effect/" + effectName
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

	addDipai: function (dzcards) {
		for (let index = 0; index < dzcards.length; index++) {
			dzcards[index] = DdzManager.getCardTypeNum(dzcards[index]);
		}
		let handCard = this.handCardprefab.getChildByName("control");
		let handCardController = handCard.getComponent("DdzhandCard");
		handCardController.addDiPai(dzcards);
	},
	showMingpaiLayout: function (baseNode, data) {
		let z = 100;
		baseNode.removeAllChildren(true);
		for (let i = 0; i < data.length; i++) {

			let cards = data[i];
			let card = DdzManager.getCardTypeNum(cards);
			var pokerPrefab = cc.instantiate(DdzManager.pokerPrefabSS);

			pokerPrefab.setLocalZOrder(z + i);
			pokerPrefab.parent = baseNode;

			let type = card[0];
			let num = card[1];
			let info = card[2];

			var pokerController = pokerPrefab.getComponent("DdzpokerCtrSS");
			pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, i);
		}
	},
	showDipai: function (baseNode, data) {
		let z = 100;
		baseNode.removeAllChildren(true);
		for (let i = 0; i < data.length; i++) {

			let cards = data[i];
			let card = DdzManager.getCardTypeNum(cards);
			var pokerPrefab = cc.instantiate(DdzManager.pokerPrefab);

			pokerPrefab.setLocalZOrder(z + i);
			pokerPrefab.parent = baseNode;

			let type = card[0];
			let num = card[1];
			let info = card[2];

			var pokerController = pokerPrefab.getComponent("DdzpokerCtr");
			pokerController.dLogo.active = false
			pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, i);
		}
	},
	showOutCard: function (baseNode, data, isS, chair,outID) {
		let z = 100;
		var temp = [];
		if (chair == 1) {
			// baseNode.setPositionX(-190-28*data.length);
			if (data.length < 10) {
				// baseNode.setPositionX(-145+28*(9-data.length));
				baseNode.setPositionX(-190 - 28 * data.length);
			}
			else {
				baseNode.setPositionX(-190 - 28 * 10);
			}

		}

		for (let index = 0; index < data.length; index++) {
			let cards = data[index];
			let card = DdzManager.getCardTypeNum(cards);
			var pokerPrefab;
			if (isS == 3) {
				pokerPrefab = cc.instantiate(DdzManager.pokerPrefabSS);
				//
			}
			else if (isS == 2) {
				pokerPrefab = cc.instantiate(DdzManager.pokerPrefab);
				this.X = DdzManager.rule.JudgeX(baseNode.children);
			}
			else {
				pokerPrefab = cc.instantiate(DdzManager.pokerPrefab);
			}
			pokerPrefab.setLocalZOrder(z + index);
			pokerPrefab.parent = baseNode;

			let type = card[0];
			let num = card[1];
			let info = card[2];
			temp.push(pokerPrefab);
			var pokerController;
			// if(num==5){
			//     this.PokScore+=5;
			// }else if(num==10){git config --global user.name "wanjun"git config --global user.email "1198891668.com"
			//     this.PokScore+=10;
			// }else if(num==13){
			//     this.PokScore+=10;
			// }

			if (isS == 3) {
				pokerController = pokerPrefab.getComponent("DdzpokerCtrSS");
				pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, 1);
			}
			else if (isS == 2) {
				pokerController = pokerPrefab.getComponent("DdzpokerCtr");
				if(outID != this.dizhuID){
					pokerController.dLogo.active = false
				}
				else{
					pokerController.dLogo.active = true
				}
				pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info);
			}
			else {
				pokerController = pokerPrefab.getComponent("DdzpokerCtr");
				pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, 1);
			}

		}
		DdzManager.rule.sortHandPokersBToS(temp);
		//SkManage.rule.sortHandPokersBToS(temp);
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

		DdzManager.rule.sortHandPokersBToS(this.partenerHandLayout.children);
		for (let i = 0; i < length; i++) {
			let poker = this.partenerHandLayout.children[i];
			poker.x = startX + 46 * i;
			poker.setLocalZOrder(10000 + i);
			poker.getComponent("DdzpokerCtr").index = i;
		}

	},
	getCardNum: function (data) {
		let cardArr = [];
		for (var index = 0; index < data.length; index++) {
			var cards = data[index];
			var card = DdzManager.getCardTypeNum(cards);
			cardArr.push(card[1]);
		}
		DdzManager.runle.JudgeX(cardArr);
	},
	/**
	 *
	 */
	refreshJushu: function (currGame, totalGame) {
		this.cardJushu.getChildByName("num").getComponent(cc.Label).string = '局数：{0}/{1}'.format(currGame, totalGame);
		for (var i = 0; i < this.players.length; i++) {
			var player = this.players[i];
			var prisebox = player.getChildByName('scoreView');
			prisebox.children[0].getComponent(cc.Label).string = 0;
			prisebox.children[1].getComponent(cc.Label).string = 0;
			// var prisebox = player.getChildByName('prisebox');
			// prisebox.children[0].getComponent(cc.Label).string = formatNum(gong);
		}
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
		let zongren = 3;
		let ren = GamePlayer.getNum();
		let queren = zongren - ren;
		const zhuanhuan = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

		var game = Loadgame.getCurrentGame();
		var desc = game.name + "\n"   // 名称
		desc += "房号: " + DdzManager.rule.roomcode + "\n"  // 房号
		desc += "玩法： " + ((this.ruleFlag >> 2) == 1 ? "12倍封顶" : "不封顶  ");
		let limitTime = this.ruleFlag & 0x08;
		if (limitTime == 8) {
			desc += "限制时间" + "\n";
		} else {
			desc += "不限制时间" + "\n";
		}
		let jiaopaiType = this.ruleFlag & 0x03;
		if (jiaopaiType == 1) {
			desc += "地主叫牌： " + "轮流地主" + "\n";
		} else if (jiaopaiType == 2) {
			desc += "地主叫牌： " + "随机地主" + "\n";
		} else {
			desc += "地主叫牌： " + "赢家地主" + "\n";
		}

		desc += "人数: " + zongren + "人  " + zhuanhuan[ren] + "缺" + zhuanhuan[queren] + "\n"  // 人数
		desc += "支付: " + ((this.expend & 0x01) == 0x01 ? "AA支付" : "房主支付") + "\n"  // 支付
		cc.log(desc)
		wxapi.sendWxFriend(desc)

	},
	showHandCard: function (data, isPlayAni,isDizhu,isMingpai) {
		if (this.handCardprefab == null) {
			this.handCardprefab = cc.instantiate(DdzManager.HandCardPrefab);

			this.handCardprefab.parent = this.node.parent.getChildByName("handcardNode");
			this.handCardprefab.getChildByName("control").getComponent("DdzhandCard").roomType = this.roomType;

		}
		let handCard = this.handCardprefab.getChildByName("control");
		let handCardController = handCard.getComponent("DdzhandCard");
		handCardController.gameServer = this.game.server;
		this.handCardprefab.getChildByName("gameBtn").active = false;
		handCardController.onShow(data, isPlayAni, this.isMingpaiStart, false,isDizhu,isMingpai);
	},

	setGameStartStatus: function (index) {
		let player = this.players[index];
		let readySprite = player.getChildByName("ready");

		readySprite.active = false;
	},


	RCMD_MatchOver: function (event) {

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


	RCMD_SitIn: function (event) {
		let data = event.detail;
		cc.log("RCMD_SitIn", JSON.stringify(data));
		for (let i = 0; i < data.users.length; i++) {
			let user = data.users[i];
			if (user.userid == UserCenter.getUserID()) {
				this.seatId = user.seatid;
				break;
			}

		}
		for (let i = 0; i < data.users.length; i++) {
			let user = data.users[i];
			let player = GamePlayer.addPlayer(user);
			if (!player) continue;

			if (!isUrl(player.userImage)) {
				// player.userImage = 'doudizhu/texture/youxiScene/head1_{0}'.format(player.sex==1?'man':'woman')
				player.userImage = 'game/ddz/texture/head1';
			}
			let chair = this.getChairBySeatId(user.seatid);
			cc.log('坐下',chair,player)
			this.setChairInfo(player, chair, true);
			// this.cancelAutoPlay();
		}
		cc.log("-----GamePlayer.getPlayerNum()-----", GamePlayer.getNum())
		if (GamePlayer.getNum() == 3) {
			this.roomButton.active = false;
			this.roomButton.getChildByName("inviteBtn").interactable = false;
		}
	},

	RCMD_Start: function () {
		cc.log('RCMD_Start');
		if (this.mathOverFlag == null) {
			//判断人齐了吗
			this.roomButton.active = false;
			this.roomButton.getChildByName("inviteBtn").interactable = false;
			this.normalButtons.active = true;
			this.startBox.active = true;
			// if (this.isXianzhi) {
			//     this.mingpaiStartBtn.active = false;
			//     // this.isMingpai = true;
			// }
		}
		/*this.currGame == 0*/
		DdzManager.rule.setMsgBlocked(false);
	},

	RCMD_Ready: function (event) {
		let data = event.detail;
		cc.log("RCMD_Ready", JSON.stringify(data));
		let userid = data.userid;
		let chair = this.getChairByUserid(userid);
		this.initCurrGame();
		// if(this.currentGame >=1 && chair == 0)
		// {
		//     // this.showNormalBtn(false);
		//     this.initCurrGame();
		// }
		if (userid == UserCenter.getUserID()) {
			this.isMingpaiStart = 0;
			this.startBox.active = false;
		}

		this.setReady(chair, true);
		DdzManager.rule.setMsgBlocked(false);
	},

	RCMD_Result: function (event) {
		let data = event.detail;
		///////-----cc.log(data);
	},


	_updatePlayers: function (data) {
		var users = data.data.ar;
		for (var i = 0; i < users.length; i++) {
			var user = users[i];
			var player = GamePlayer.getPlayer(user.userid);
			var chair = this.getChairByUserid(user.userid);
			if (this.roomType >= 2) {
				player.score += user.curwon;
				var totalScoreNode = this.players[chair].getChildByName('totalScore');
				totalScoreNode.getComponent(cc.Label).string = formatNum(player.score);
			} else {
				player.money += user.curwon;
				if (UserCenter.getUserID() == player.userid) {
					UserCenter.setYouxibiNum(player.money);
					// UserCenter.getUserInfo().youxibi = player.money;
				}
				var totalScoreNode = this.players[chair].getChildByName('totalScore');
				totalScoreNode.getComponent(cc.Label).string = formatNum(player.money);
				GlobEvent.emit('update_UserCenter');
			}
		}
	},

	showNormalBtn: function (isVisible) {
		this.normalButtons.active = isVisible;
		this.normalButtons.getChildByName("readyBtn").interactable = isVisible;
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

	// showPlayer: function (user1, user2, seatid0, seatid1, ismove) {
	// 	var self = this;
	//
	// 	if (user1 == UserCenter.getUserID() || user2 == UserCenter.getUserID()) {
	// 		if (user1 == UserCenter.getUserID()) {
	// 			this.seatId = seatid0;
	// 		}
	// 		if (user2 == UserCenter.getUserID()) {
	// 			this.seatId = seatid1;
	// 		}
	//
	// 	}
	// 	var player1 = GamePlayer.getPlayer(user1);
	// 	player1.seatid = seatid0;
	// 	var player2 = GamePlayer.getPlayer(user2);
	// 	player2.seatid = seatid1;
	//
	// 	for (var usrid in GamePlayer.players) {
	// 		var player = GamePlayer.getPlayer(usrid);
	// 		let chair = this.getChairByUserid(usrid);
	// 		this.setChairInfo(player, chair, false);
	// 		if ((chair == 1 && ismove) || (chair == 3 && ismove)) {
	// 			if (chair == 1) {
	// 				this.players[1].runAction(cc.moveBy(0.3, cc.p(-150, 0)).easing(cc.easeCubicActionInOut()));
	// 			}
	// 			else {
	// 				this.players[3].runAction(cc.moveBy(0.3, cc.p(150, 0)).easing(cc.easeCubicActionInOut()));
	// 			}
	// 		}
	// 	}
	// 	this.players[0].runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
	// 		DdzManager.rule.setMsgBlocked(false);
	// 		self.showCardNUM();
	// 	})));
	// },

	showCardNUM: function () {

		for (let index = 0; index < 3; index++) {
			this.setGameStartStatus(index);
		}
	},

	setChairInfo: function (user, chair, isPlayFog) {

		let player = this.players[chair];
		let beans = this.roomType >= 2 ? user.score : user.money;
		let status = user.status;
		let userImage = user.userImage;
		cc.log('头像1',player.userid,userImage)
		this.sex = user.sex;
		player.active = true;
		player.children[1].getComponent(cc.Label).string = user.nick;
		player.children[2].getComponent(cc.Label).string = formatNum(beans);
		// scorebox.children[0].getComponent(cc.Label).string = formatNum(beans);///

		getSpriteFrameByUrl(userImage, function (err, spriteFrame) {
			if (err){
				cc.log(err)
				return;
			}
			cc.log('头像2',player.userid ,userImage)
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

		if (isPlayFog) {
			cc.loader.loadRes("game/ddz/effect/ChairFog/FogNode", cc.Prefab, function (err, prefab) {
				if (err) {
					return;
				}
				var module = cc.instantiate(prefab);
				module.parent = player;
			});
		}


		this.setReady(chair, status == GamePlayer.PlayerState.Ready);
		this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
	},

	setOpChair: function (dir, type) {
		// this.unschedule(this.callback);
		// if (type) {
		//     this.players[dir].getChildByName("dizhu").active = true;
		// } else {
		//     this.players[dir].getChildByName("nongmin").active = true;
		// }

	},
	setIsDizhu: function (dir, type) {
		if (type) {
			this.players[dir].getChildByName("dizhu").active = true;
		} else {
			this.players[dir].getChildByName("nongmin").active = true;
		}

	},
	setHintNode: function (dir, show, type) {
		var hintNode = this.players[dir].getChildByName("hintNode");
		if (show) {
			hintNode.getComponent(cc.Sprite).spriteFrame = this.hintSprites[type];

		}
		hintNode.active = show;


	},
	setIsJiabei: function (dir, type) {
		this.players[dir].getChildByName("jiabeiIcon").active = type;
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
				sourcePlayer.getChildByName("totalScore").getComponent(cc.Label).string = formatNum(UserCenter.userInfo.youxibiNum);
			} else {
				Porp.getProplist(function (data1, data2) {
					let ret = data2.results;
					if (ret) {
						for (let i = 0; i < ret.length; i++) {
							let obj = ret[i];
							if (obj.bh == data.daobh) {
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
		cc.log('RCMD_GameStart');
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
			if (this.normalButtons.active) {
				this.normalButtons.active = false;
				this.roomButton.active = wxapi.isInstallWeChat();
			}
		}

		this.players[chair].getChildByName("ready").active = false;


		this.players[chair].active = false;
		GamePlayer.removePlayer(data.userid);
		DdzManager.rule.setMsgBlocked(false);
	},


	clearPlaystatus: function (chair) {
		this.players[chair].children[3].active = false;
		this.players[chair].children[4].active = false;
	},

	hidMenu: function () {
		if (this.roommenu.active) {
			this.onClickMenu();
		}
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
		if (DdzManager.rule.playerNum == 4) {
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
		var seatid = GamePlayer.getSeatByUserid(userid);
		var chair = this.getChairBySeatId(seatid)
		return chair;
	},
	getChairBySeatId: function (seatId) {
		//return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
		if (DdzManager.rule.playerNum == 3) {
			return (seatId - this.seatId + MAX_PLAYERS) % MAX_PLAYERS;
		}
		else {
			if (seatId == this.seatId) {
				return 0;
			} else {
				return 2;
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
				if (chair == 0 || chair == 2) {
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


	onSettingClick: function () {
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


	onClickAuto: function (event,zidong) {
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

				self.refreshAutoPlay(zidong);
			});
		} else {
			this.refreshAutoPlay(zidong);
		}
	},


	refreshAutoPlay: function (zidong) {
		this.refreshMenuActive(zidong);
		DdzManager.autoplaySign = true;
		this.autoPlay.active = true;
		// GlobEvent.emit('AUTO_PLAY',true);
		// let handCard = this.handCardprefab.getChildByName("control");
		// let handCardController = handCard.getComponent("DdzhandCard");
		// if (UserCenter.getUserID() == this.firstSendCardID) {
		// 	handCardController.showtimeOutPai(24);
		// }

	},

	cancelAutoPlay: function () {
		if (!!this.autoPlay) {
			DdzManager.tuoci = 0;
			this.autoPlay.active = false;
			DdzManager.autoplaySign = false;
			this.timeLimit = false;            // GlobEvent.emit('AUTO_PLAY',false);
		}
	},

	openAutoPlay: function () {
		if (this.autoPlay && this.autoPlay.active) {

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

	refreshInstructions: function () {
		this.refreshMenuActive();
		this.rule.active = true;
	},
	refreshMenuActive: function (zidong) {
		if(zidong){
			return
		}
		if (this.roomType < 20) {
			this.roommenu.active = !this.roommenu.active;
			this.chatNode.active = !this.roommenu.active;
			if (this.menuIcon1 && this.menuIcon2) {
				this.menuIcon1.active = !this.roommenu.active;
				this.menuIcon2.active = this.roommenu.active;
			}
		} else {
			this.roommenu.active = !this.roommenu.active;
			if (this.menuIcon1 && this.menuIcon2) {
				this.menuIcon1.active = !this.roommenu.active;
				this.menuIcon2.active = this.roommenu.active;
			}
		}

	},

	onClickMessage: function () {

	},

	onClickVoice: function () {
		///////-----cc.log('onClickVoice')
	},
	onDestroy: function () {
		pomelo.removeAllListeners("RCMD_Dao");
		pomelo.removeAllListeners("RCMD_Expend");
		GlobEvent.removeAllListeners("chuntianFinished");
		pomelo.removeAllListeners("RCMD_MatchExpand");
		pomelo.removeAllListeners("RCMD_StartGameForMatch");

	},
});
