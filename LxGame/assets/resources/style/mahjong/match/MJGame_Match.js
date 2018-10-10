var GamePlayer = require('GamePlayer');
var CfgGame = require("CfgGame");
var Porp = require("Prop");
var config = require('Config');
var PING = require('Ping');
var LoadGame = require('LoadGame');
var Friend = require('Friend')

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
		matchRankTop: cc.Label,
		// matchRankBottom: cc.Label,
		matchRankS: cc.Node,
		matchDiFen: cc.Label,
		matchNC: cc.Label,
		matchState: cc.Node,
	},

	onLoad: function () {
		GamePlayer.removeAllPlayers();

		this.node.on('RCMD_exit', this.RCMD_exit, this);
		// this.node.on('RCMD_Ready', this.RCMD_Ready, this);
		// this.node.on('RCMD_Result', this.RCMD_Result, this);
		// this.node.on('RCMD_MatchOver', this.RCMD_MatchOver, this);
		// this.node.on('DISPLAY_VOICE', this.displayVoice, this);
		// this.node.on('HIDE_VOICE', this.hideVoice, this);
		// this.node.on('SHOW_DAO', this.showDao, this);
		// this.node.on('HIDE_DAO', this.hideDao, this);
		// pomelo.on('RCMD_Dao', this.RCMD_Dao.bind(this));

		this.node.on('RCMD_initParam', this.RCMD_initParam.bind(this));
		this.node.on('RCMD_SitIn', this.RCMD_SitIn, this);
		this.node.on('RCMD_PlayerStatus', this.RCMD_PlayerStatus, this);
		this.node.on('RCMD_GameStart', this.RCMD_GameStart, this);
		this.node.on('RCMD_Start', this.RCMD_Start, this);
		this.node.on('RCMD_ActData', this.RCMD_ActData, this);
		this.node.on('AutoDo', this.onClickAuto, this)
		this.node.on('RCMD_MissCarry', this.RCMD_MissCarry, this)
		this.node.on('SHOW_CHAT_MSG', this.showChatMsg, this);
		this.node.on('HIDE_CHAT_MSG', this.hideChatMsg, this);
		this.node.on("OPEN_AUTO_PLAY", this.openAutoPlay, this);

		pomelo.on('RCMD_Expend', this.RCMD_Expend.bind(this));
		pomelo.on('RCMD_MatchExpand', this.RCMD_MatchExpand.bind(this));
		pomelo.on('RCMD_StartGameForMatch', this.RCMD_StartGameForMatch.bind(this));


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
			PomeloClient.request(game.server + '.MobileInQueue', function (data) {
			});
		}
		hideLoadingAni();
	},

	// 比赛相关指令
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
				let sexs = data.sex == 1 ? 'man' : 'woman';
				userImage = 'commonRes/other/' + sexs;
			}

			player.children[1].getComponent(cc.Label).string = data.nc;
			player.children[2].getComponent(cc.Label).string = data.score;

			getSpriteFrameByUrl(userImage, function (err, spriteFrame) {
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

			let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 1});

			loadPrefab("style/mahjong/match/taotai", function (module) {
				module.x = cc.winSize.width / 2;
				module.y = cc.winSize.height / 2;
				module.parent = cc.director.getScene();

				module.getChildByName('box').getChildByName('btn').on(cc.Node.EventType.TOUCH_END, function (event) {
					if (!self.ruleController) {
						self.ruleController = self.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
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

			let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
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
						self.ruleController = self.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
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
			let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 1});
			let self = this
			showAlertBox(data.msg, function () {
				if (!self.ruleController) {
					self.ruleController = self.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
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

			if (!this.ruleController) {
				this.ruleController = this.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
			}
			this.ruleController.matchExit = true;
			showAlert(data.msg)
			this.clearMatchTable()
			let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
			PomeloClient.request(route, {flag: 0});

			this.scheduleOnce(function () {
				PomeloClient.request(LoadGame.getCurrentGame().server + '.MobileInQueue', function (data) {
					cc.log(data)
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
					PomeloClient.request(LoadGame.getCurrentGame().server + '.MobileInQueue', function (data) {
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
		for (var i = 0; i < this.players.length; i++) {
			this.players[i].active = false
		}

		this.players[0].active = true

		this.BDFrame.active = false
		if (!this.ruleController) {
			let game = LoadGame.getCurrentGame();
			this.ruleController = this.node.getComponent(game.rule);    // MGRule
		}
		this.ruleController.resetGame()
	},

	// 比赛结果
	showResultForMatch: function (data) {
		let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
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
					PomeloClient.request(LoadGame.getCurrentGame().server + '.MobileInQueue', function (data) {
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
		let game = LoadGame.getCurrentGame();
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
					let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
					PomeloClient.request(route, {flag: 1});

					if (!self.ruleController) {
						self.ruleController = self.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
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
		this.ruleFlag = data.ruleFlag;                          // 游戏规则
		this.roomuserid = data.roomuserid;                      // 房主 普通房间为0
		this.gameMenu.getComponent('gameMenuScript').setRoomShow(data.roomType)
		let path = 'hall/friendInfo/friendInfo'
		cc.log(this.matchWaiting)
		if (!!this.matchWaiting) {  // 删除等待比赛界面
			this.matchWaiting.removeFromParent(true)
			this.matchWaiting = null
		}
		if (self.paiduiPreb) {
			self.paiduiPreb.active = false;
		}
		cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			self.playerMessage = prefab;
		});


		// if (this.roomType < 2) { // 普通房间
		//     this.roomInfo.active = false;
		//     this.roomInfo.children[0].active = false;
		//     this.roomInfo.children[1].active = true;
		//     this.roomInfo.children[2].active = true;
		//     this.message.active = true
		// } else if (this.roomType == 2) { // 房卡房间
		//     this.roomInfo.active = true;
		//     this.roomInfo.children[0].active = true;
		//     this.roomInfo.children[1].active = false;
		//     this.roomInfo.children[2].active = false;
		//     this.message.active = false
		//     this.roomInfo.children[0].children[0].getComponent(cc.Label).string = data.roomcode;//房间号
		//     console.log('加载房卡组件')
		//     var roomcontroller = this.addComponent("CardRoomController");
		//     roomcontroller.init(data, self);
		// }

		this.chatNode.active = this.roomType < 20;   // 复盘不显示
		this._showTitleSprite();

		for (let i = 0; i < 4; i++) {
			this.players[i].children[0].children[1].active = false;
		}
		this.ruleController = this.node.getComponent(this.game.rule);    // MGRule
		this.ruleController._initDataFinish = true;

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
			if (expend.UID == UserCenter.getUserID()) {
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
		} else if (expend.CMD == '1001') {
			this.matchDiFen.node.active = true
			this.matchDiFen.string = expend.baseMoney
			this.matchNC.string = expend.matchName.replace(/#/g, '"')
			// this.matchState.string = expend.matchModel == 1 ? '预赛阶段' : '决赛阶段'

			this.matchState.getChildByName('yusai').active = expend.matchModel == 1
			this.matchState.getChildByName('juesai').active = expend.matchModel != 1
		}
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
			cc.log('this.missCarry', this.missCarry)
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
		cc.log('RCMD_PlayerStatus')
		let data = event.detail;
		let userid = data.userid;
		let status = data.status;
		let chair = this.getChairByUserid(userid);
		this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
	},


	RCMD_GameStart: function (event) {
		this.isGameStart = true;
		let data = event.detail;
		for (let i = 0; i < MAX_PLAYERS; i++) {
			this.setReady(i, false);
		}
		if (this.roomType < 2) {
			this.roomInfo.active = true;
		}

		this.setMaster(data.userid);
	},

	// 数据恢复
	RCMD_ActData: function (event) {
		let data = event.detail;
		this.isGameStart = true;
		if (this.roomType < 2) {
			this.roomInfo.active = true;
		}
		this.setMaster(data.masterid);
		for (let i = 0; i < MAX_PLAYERS; i++) {
			this.setReady(i, false);
		}

		this.matchDiFen.node.active = true
		this.matchDiFen.string = data.baseMoney
	},


	onSettingClick: function () {
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

		if (UserCenter.getUserID() == userid) {
			return;
		}

		let chair = this.getChairByUserid(userid);
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
		let beans = user.score
		let status = user.status;
		let userImage = user.userImage;
		cc.log('头像',userImage)
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
		cc.log(status, GamePlayer.PlayerState.Offline)
		this.setOfflineStatus(chair, status >= GamePlayer.PlayerState.Offline);
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
			} else if (this.roomType < 2) {
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
		if (this.missCarry) {
			if (this.roomType < 2) {
				if (!!this.minpoint) {
					let jinbi = UserCenter.getYouxibiNum();
					let baoxian = UserCenter.getYinhanbiNum();
					if (jinbi < this.minpoint) {
						if (jinbi + baoxian < this.minpoint) {
							showAlertBox('账户金币不足', function () {
								self.closeGmae();
							})
						} else {
							cc.log(this.minpoint, jinbi)
							let qugao;
							if (this.maxpoint) {
								qugao = this.maxpoint - jinbi;
							} else {
								qugao = 10000000 - jinbi;
							}
							let qudi = this.minpoint - jinbi;
							let message = '请取出' + qudi + '-' + qugao + '金币';

							showAlertBox(message, function () {
								loadPrefab("hall/bank/bank", function (module) {
									module.x = cc.winSize.width / 2;
									module.y = cc.winSize.height / 2;
									module.parent = cc.director.getScene();
									module.getComponent('bankScript').setBank(qudi, qugao, true, function (err, data) {
										if (err) {
											cc.log(err)
											hideLoadingAni()
											self.closeGmae();
											return;
										}
										let message = {
											"CMD": "10003"
										}
										cc.log('100031', data)
										self.sendExpend(message, function (data) {
											cc.log('10003', data)
											hideLoadingAni()
											if (data.code == 200) {
												self.node.emit('CMD_Ready');
											} else {
												showAlertBox('取钱出错，请退出游戏后重试', function () {
													self.closeGmae()
												})
											}

										})
									})
									module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
								});
							}, function () {
								self.closeGmae()
							})
						}
					} else {
						self.node.emit('CMD_Ready');
					}

				} else {
					showAlertBox('获取金币最小值失败，请退出游戏后再试', function () {
						self.closeGmae()
					})
				}
			} else {
				self.node.emit('CMD_Ready');

			}
		} else {
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
		let route = LoadGame.getCurrentGame().server + '.CMD_Exit';
		PomeloClient.request(route, {flag: 1});

		if (!this.ruleController) {
			this.ruleController = this.node.getComponent(LoadGame.getCurrentGame().rule);    // MGRule
		}

		this.ruleController.removePomeloListeners();
		this.ruleController.backLobby();
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
		pomelo.removeAllListeners("RCMD_MatchExpand");
		pomelo.removeAllListeners("RCMD_StartGameForMatch");

		PING.StopPing();
	},
});
