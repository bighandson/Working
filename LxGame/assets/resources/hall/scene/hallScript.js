var config = require("Config")
var Broadcast = require('Broadcast');
var LoadGame = require('LoadGame')
var Yaoqing = require('Yaoqing');
var ZhuanPan = require('ZhuanPan');
var Activity = require('Activitylist')
var Share = require('Share')
var ifFree = require('IfFree')

cc.Class({
	extends: cc.Component,

	properties: {
		// foo: {
		//    default: null,      // The default value will be used only when the component attaching
		//                           to a node for the first time
		//    url: cc.Texture2D,  // optional, default is typeof default
		//    serializable: true, // optional, default is true
		//    visible: true,      // optional, default is true
		//    displayName: 'Foo', // optional
		//    readonly: false,    // optional, default is false
		// },
		// ...
		moreNode: cc.Node,
		gameNode: cc.Node,
		headImg: cc.Sprite,
		nc: cc.Label,
		jinbi: cc.Label,
		zuanshi: cc.Label,
		sex: cc.Sprite,
		chatMsgNode: cc.Node,
		labaMsg: cc.Label,
		labaNode: cc.Node,
		friendMsgRedPiont: cc.Node,
		xiongmao: cc.Node,
		yaoqingBtn: cc.Node,
		zpdian: cc.Node,
		hdDian: cc.Node,
		youxi: cc.Node,
		left: cc.Node,
		right: cc.Node,
		matchStartLabel: cc.Label,     // 开赛倒计时
		isCanSignUp: cc.Node,          // 是否可以报名
		matchNode: cc.Node,
		freeAnima: cc.Animation,
		rank: cc.Node,
		bottom: cc.Node,
		chatNode: cc.Node
	},


	onLoad: function () {
		cc.log('onload')
		let self = this;
		GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
		GlobEvent.on('update_Head', this.loadHead.bind(this));
		GlobEvent.on('addChatMsg', this.onMsgRecive.bind(this))
		GlobEvent.on('changeFriendMsg', this.onChangeFriendMsg.bind(this))
		GlobEvent.on('WXShare', this.shareCallback.bind(this));
		SettingMgr.stopBg();
		SettingMgr.playBg(config.backMusic);
		this.moreNode.on(cc.Node.EventType.TOUCH_START, function () {
		});
		this.freeAnima.play()
		this.freeAnima.on('finished', function () {
			self.scheduleOnce(function () {
				self.freeAnima.play()
			}, Math.random() * 2 + 3)
		}, this)

		this.Index = -1;

		this.updateUsercenter();

		this.loadHead();
		// by Amao 2017.12.28 添加andorid back 键监听(android添加)
		if (cc.sys.os == cc.sys.OS_ANDROID) {
			cc.eventManager.addListener({
				event: cc.EventListener.KEYBOARD,
				onKeyReleased: function (keyCode, event) {
					if (keyCode == 6 && !self.returnShow) {
						self.returnShow = true;
						showAlertBox("确定退出游戏", function () {
							cc.game.end()
						}, function () {
							self.returnShow = false;
							cc.log(1)
						});
					}
				}
			}, self.node);
		}

		// this.chatMsg.node.active = false;

		this.msgList = [];

		this.systemMsg = [];

		this.labaNode.active = false

		// 获取喇叭消息
		Broadcast.getmessage(3, '', function (err, data) {
			if (err) {
				cc.log(data);
				return;
			}

			for (var i = 0; i < data.results.length; i++) {
				self.onReciveLaba(data.results[i])
			}

		})

		Yaoqing.getYaoqing('', function (err, data) {
			if (err) {
				cc.log(err);
				return;
			}
			let les = data.results;
			cc.log(data.results)
			if (les[0].zt != 2) {
				self.yaoqingBtn.active = true
			}
		})

		this.onChangeFriendMsg()

		this.shuaZP();

		LoadGame.reSetCurrentGameId();

		this.onShow();


		Activity.getactivityitem(1, "", function (err, data) {
			if (err) {
				cc.log(err);
				return;
			}
			let res = data.results;
			let len = res.length;
			cc.log(data);
			if (!!len) {
				let date = new Date();
				let day = date.getDate();
				let huoDay = cc.sys.localStorage.getItem('HD') || 0
				if (day != huoDay) {
					self.hdDian.active = true;
				} else {
					self.hdDian.active = false;
				}
			} else {
				self.hdDian.active = false;
			}
		});

		ifFree.getIfFree('', function (err, data) {
			if (err) {
				cc.log(err)
				return
			}
			cc.log(data.results)
			UserCenter.setFree(data.results)

		})

		this.getMatchInfo()
	},


	getMatchInfo: function () {
		let self = this
		// 大厅赛事信息
		showLoadingAni()
		PomeloClient.request('user.userHandler.post', {
			url: 'bs1002',
			data: {
				userid: UserCenter.getUserID(),
				jgm: config.jgm
			}
		}, function (data) {
			cc.log('大厅赛事信息请求结果:', data)
			if (data.code == 200 && data.result.status) {
				if (!!data.result.results.length) {
					self.initMatch(data.result.results[0])
				} else {
					showAlertBox('获取赛事列表为空')
				}
			} else {
				showAlertBox(data.msg)
			}
		});
	},

	initMatch: function (data) {

		let self = this

		if (!cc.sys.isNative) {
			data.strMatchAd = 'hall/scene/texture/ad'
		}

		let cell = self.matchNode.getChildByName('adCell')

		getSpriteFrameByUrl('hall/match/texture/icon' + data.icon, function (err, spriteFrame) {
			if (err) {
				cc.log(err);
				return;
			}
			hideLoadingAni()
			cell.getChildByName('spricon').getComponent(cc.Sprite).spriteFrame = spriteFrame;
		});


		getSpriteWritePath(data.strMatchAd, function (err, spriteFrame) {
			cc.log('data.strMatchAd', data.strMatchAd)
			if (err) {
				cc.log(err);
				return;
			}
			hideLoadingAni()
			self.matchNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
		});


		cell.getChildByName('matchname').getComponent(cc.Label).string = data.mc

		cell.getChildByName('gamename').getComponent(cc.Label).string = config.getGameById(data.gameid).matchName

		let time = data.remainSecond

		if (time > 0) {
			let tt = formatDate(time).split(":")
			cell.getChildByName('time').getChildByName('h').getComponent(cc.Label).string = tt[0]
			cell.getChildByName('time').getChildByName('m').getComponent(cc.Label).string = tt[1]
			cell.getChildByName('time').getChildByName('s').getComponent(cc.Label).string = tt[2]

			let updateTime = function () {
				time--
				if (time <= 0) {
					self.getMatchInfo()
					self.getComponent('nullScript').unschedule(updateTime)
					return
				}
				let tt = formatDate(time).split(":")
				cell.getChildByName('time').getChildByName('h').getComponent(cc.Label).string = tt[0]
				cell.getChildByName('time').getChildByName('m').getComponent(cc.Label).string = tt[1]
				cell.getChildByName('time').getChildByName('s').getComponent(cc.Label).string = tt[2]
			}

			self.getComponent('nullScript').schedule(updateTime, 1)
		} else {
			// cell.getChildByName('time').active = false
			cell.getChildByName('time').getChildByName('h').getComponent(cc.Label).string = '00'
			cell.getChildByName('time').getChildByName('m').getComponent(cc.Label).string = '00'
			cell.getChildByName('time').getChildByName('s').getComponent(cc.Label).string = '00'
		}

		cell.getChildByName('enter').getChildByName('jiesu').active = data.zt != 1
		cell.getChildByName('enter').getChildByName('kaishi').active = data.zt == 1
		cell.getChildByName('enter').getChildByName('yikaisai').active = data.zt == 1

		if (data.zt == 1) {
			cell.getChildByName('enter').getChildByName('kaishi').active = time > 0
			cell.getChildByName('enter').getChildByName('yikaisai').active = time == 0
		}

		cell.active = true
	},

	onShow: function () {
		let self = this;
		var ifshow = Activity.getsifshow();
		if (ifshow) {
			showLoadingAni()
			Activity.hiddenactivity();
			Share.getActivity('', function (err, data) {
				if (err) {
					hideLoadingAni()
					return
				} else {
					cc.log('getfenxiang', data);
					let shareUrl = data.results[0].shareurl;
					let advertUrl = data.results[0].adurl;
					let linkUrl = data.results[0].linkurl;
					if (!cc.sys.isNative) {
						hideLoadingAni()
						return;
					}
					if (!!advertUrl) {
						getSpriteWritePath(advertUrl, function (err, spriteframe) {
							if (err) {
								hideLoadingAni()
								cc.log(err);
								return
							} else {
								let path = 'style/guangGao/guangGao'
								cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
									if (err) {
										hideLoadingAni()
										cc.log(err)
										return;
									}
									hideLoadingAni()
									let module = cc.instantiate(prefab);
									module.x = cc.winSize.width / 2;
									module.y = cc.winSize.height / 2;
									module.parent = cc.director.getScene();
									module.setLocalZOrder(1000);
									module.children[1].getComponent(cc.Sprite).spriteFrame = spriteframe;
									// cc.log(1232,JSON.stringify(spriteframe) )
									// module.children[1].setContentSize(958, 608);
									if (linkUrl != '') {
										module.children[1].on(cc.Node.EventType.TOUCH_START, function () {
											Device.goWebURL(linkUrl);
										});
									} else {
										module.children[1].on(cc.Node.EventType.TOUCH_START, function () {
										});
									}
									module.children[1].on(cc.Node.EventType.TOUCH_END, function () {

									});
									module.children[0].on(cc.Node.EventType.TOUCH_END, function () {
										module.removeFromParent(true);
										let date = new Date();
										let day = date.getDate();
										let cunDay = cc.sys.localStorage.getItem('ZP') || 0
										if (day != cunDay) {
											cc.sys.localStorage.setItem('ZP', day)
											self.onClickZuanpan()
										}
									});

								});
							}
						});
					} else if (shareUrl == '' && advertUrl == '') {
						hideLoadingAni()
						let date = new Date();
						let day = date.getDate();
						let cunDay = cc.sys.localStorage.getItem('ZP') || 0
						if (day != cunDay) {
							cc.sys.localStorage.setItem('ZP', day)
							self.onClickZuanpan()
						}
					}
				}
			})

		} else {
			let date = new Date();
			let day = date.getDate();
			let cunDay = cc.sys.localStorage.getItem('ZP') || 0
			if (day != cunDay) {
				cc.sys.localStorage.setItem('ZP', day)
				self.onClickZuanpan()
			}
		}
	},

	shareCallback: function (code) {
		cc.log('code', code)
		if (code != 0) return;
		this.shuaZP()
	},
	shuaZP: function () {
		let self = this;
		ZhuanPan.getZhuanPan('', function (err, data) {
			if (err) {
				console.log(data)
				return
			}
			if (!!data.results[0].is_share || !!data.results[0].is_share_use) {
				if (self.zpdian) {
					self.zpdian.active = true
				}

			} else {
				if (self.zpdian) {
					self.zpdian.active = false
				}

			}
		})
	},
	// 接受到好友消息
	onChangeFriendMsg: function () {
		if (this.friendMsgRedPiont) {
			this.friendMsgRedPiont.active = Global.FriendMsgList.length > 0;
		}
	},

	onReciveLaba: function (data) {
		this.systemMsg.push(data)
		this.onLabaShow()
	},

	onMsgRecive: function (data) {
		let type = data.msgType;

		let typeMode = type == 0 ? 'user' : 'system'

		let self = this;

		loadPrefab("hall/chat/msgNodemini", function (module) {

			module.getChildByName(typeMode + 'name').active = true

			module.getChildByName(typeMode + 'msg').active = true

			module.getChildByName(typeMode + 'name').getComponent(cc.Label).string = '[' + data.nickName + ']: ';

			module.getChildByName(typeMode + 'msg').getComponent(cc.Label).string = data.msg;

			module.parent = self.chatMsgNode.children[0];
		})

		// cc.log('push', this.msgList)
		// if (!this.msgList) {
		//     return;
		// }
		// this.msgList.push(data)
		// this.onMsgShow()
	},

	onLabaShow: function () {

		if (this.labaNode.active || this.systemMsg.length == 0) {
			return;
		}

		this.labaNode.active = true
		if (this.Index < this.systemMsg.length - 1) {
			this.Index++
		} else {
			this.Index = 0;
		}

		let m = this.systemMsg[this.Index];

		//this.systemMsg.shift();  // 删除第一位

		this.labaMsg.string = m.notice_content

		this.labaMsg.node.x = 250

		let self = this;

		let time = Math.abs(-300 - self.labaMsg.node.width) / 50

		this.labaMsg.node.runAction(cc.sequence(
			cc.moveTo(time, -300 - self.labaMsg.node.width, self.labaMsg.node.y),
			cc.callFunc(function () {
				self.labaNode.active = false;
				self.onLabaShow()
			})
		))
	},

	onMsgShow: function () {
		// if ( this.msgList.length == 0) {
		//     return;
		// }
		//
		//
		// let m = this.msgList[0];
		//
		// cc.log('onMsgShow', m.nickName, m.msg)
		//
		// this.msgList.shift();  // 删除第一位
		//
		// this.chatMsg.string = '[' + m.nickName + ']: ' + m.msg
		//
		// this.chatMsg.node.active = true;
		//
		// this.chatMsg.node.x = 250
		//
		// let self = this;
		//
		// let time = Math.abs(-300 - self.labaMsg.node.width) / 50
		//
		// this.chatMsg.node.runAction(cc.sequence(
		//     cc.moveTo(time, -400 - self.chatMsg.node.width, self.chatMsg.node.y),
		//     cc.callFunc(function () {
		//         self.chatMsg.node.active = false;
		//         self.onMsgShow()
		//     })
		// ))
	},

	loadHead: function () {
		let tx = UserCenter.userInfo.picture;
		let sex = UserCenter.userInfo.xb;
		let sexs = sex == 1 ? 'man' : 'woman';
		if (!isUrl(tx)) {
			tx = 'commonRes/other/' + sexs;
		}
		let self = this;
		getSpriteFrameByUrl('commonRes/other/' + sexs + 'Sign', function (err, spriteFrame) {
			if (err) {
				cc.log(err);
				return;
			}
			self.sex.spriteFrame = spriteFrame;
		});

		loadHead(tx, function (err, spriteFrame) {
			if (err) {
				cc.log(err);
				return;
			}
			self.headImg.spriteFrame = spriteFrame;
			self.headImg.node.setContentSize(150, 150);
		});
	},

	// 进入赛事列表
	onClickMatch: function () {
		showLoadingAni()

		let self = this

		PomeloClient.request('user.userHandler.post', {
			url: 'bs1001',
			data: {
				userid: UserCenter.getUserID(),
				jgm: config.jgm
			}
		}, function (data) {
			hideLoadingAni()
			cc.log('赛事列表请求结果:', data)
			if (data.code == 200 && data.result.status) {
				// if(!!data.result.results.length){
				//     loadPrefab("hall/match/match", function (module) {
				//         hideLoadingAni()
				//         module.getComponent('matchScript').initMatch(data.result.results)
				//         module.x = cc.winSize.width / 2;
				//         module.y = cc.winSize.height / 2;
				//         module.parent = cc.director.getScene();
				//     });
				// }else {
				//     showAlertBox('获取赛事列表为空')
				// }
				loadPrefab("hall/match/match", function (module) {
					hideLoadingAni()
					module.getComponent('matchScript').initMatch(data.result.results)
					module.x = cc.winSize.width / 2;
					module.y = cc.winSize.height / 2;
					module.parent = cc.director.getScene();
				});
			} else {
				showAlertBox(data.msg)
			}
		});


		// loadPrefab("hall/match/match", function (module) {
		//     hideLoadingAni()
		//     // module.getComponent('noticeScript').initData({})

		//     module.x = cc.winSize.width / 2;
		//     module.y = cc.winSize.height / 2;
		//     module.parent = cc.director.getScene();
		// });
	},

	// 点击头像  进入个人中心
	onClickHead: function () {
		showLoadingAni()
		loadPrefab("hall/usercenter/userCenter", function (module) {
			hideLoadingAni()
			// module.getComponent('noticeScript').initData({})

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击任务 进入转盘
	onClickZuanpan: function () {
		showLoadingAni()
		loadPrefab("hall/zhuanpan/zhuanpan", function (module) {
			hideLoadingAni()
			// module.getComponent('noticeScript').initData({})

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击公告 进入公告中心
	onClickNotice: function () {
		showLoadingAni()
		var date = new Date();
		let day = date.getDate();
		cc.sys.localStorage.setItem('HD', day)
		this.hdDian.active = false;
		loadPrefab("hall/notice/notice", function (module) {
			hideLoadingAni()
			// module.getComponent('noticeScript').initData({})

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},
	onClickYou: function () {
		loadPrefab("hall/xiaoyouxi/xiaoyouxi", function (module) {

			// module.getComponent('noticeScript').initData({})
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

		});

	},

	//点击好友消息
	onClickFriendMsg: function () {
		showLoadingAni()
		if (Global.FriendMsgList.length == 0) {
			showAlertBox('没有收到任何好友信息');
			return;
		}

		loadPrefab("hall/friend/reciveMsg", function (module) {

			// module.getComponent('noticeScript').initData({})
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击更多  下拉更多菜单
	onClickMoreBtn: function () {
		// body...
		cc.log("onClickMoreBtn")
		this.moreNode.active = !this.moreNode.active
		this.moreNode.setLocalZOrder(999999)
	},

	//点击分享  进入分享中心
	onClickShare: function () {
		showLoadingAni()
		loadPrefab("hall/share/share", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},
	onClickJiu: function () {
		showLoadingAni()
		loadPrefab("hall/jiujijin/jiujijin", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			// module.getChildByName('jiujijin').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//邀请码
	onClickYaoQingma: function () {
		let self = this;
		Yaoqing.getYaoqing('', function (err, data) {
			if (err) {
				cc.log(err);
				return;
			}
			let les = data.results;
			cc.log(data.results)
			if (les[0].zt == 3) {
				loadPrefab("hall/yqm/yqm", function (module) {
					module.x = cc.winSize.width / 2;
					module.y = cc.winSize.height / 2;
					module.parent = cc.director.getScene();
					module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
				});
			} else if (les[0].zt == 2) {
				showAlertBox(data.message)

			} else {
				let password = data.results[0].yqm;
				showAlertBox(data.message, function () {
					Yaoqing.sendYaoqing(password, '', function (err, data) {
						if (err) {
							showAlertBox(data)
							return
						}
						if (!!data.results.length) {
							UserCenter.setList(data.results[0].list);
							GlobEvent.emit('update_UserCenter')
						}
						recharge.clearList();
						showAlertBox(data.message)
						self.onclose();
					})
				}), function () {
					Yaoqing.sendGou(1)
				}
			}
		})
	},

	//点击好友  进入好友中心
	onClickFriend: function () {
		showLoadingAni()
		loadPrefab("hall/friend/friend", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},

	//实体兑换
	onClickDui: function () {
		showLoadingAni()
		loadPrefab("hall/shopDui/shopDui", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},

	//点击商城  进入商城中心
	onClickShop: function () {
		showLoadingAni()
		loadPrefab("hall/shop/shop", function (module) {
			hideLoadingAni()
			module.getComponent('shopScript')._selectToggle('0')

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击金币按钮  进入商城中心
	onClickJinbi: function (event, num) {
		showLoadingAni()
		loadPrefab("hall/shop/shop", function (module) {
			hideLoadingAni()
			module.getComponent('shopScript')._selectToggle(num)

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击保险箱 进入保险箱
	onClickBank: function () {
		showLoadingAni()
		loadPrefab("hall/bank/bank", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
		});
	},

	// 点击游戏场 进入游戏场界面
	onClickFreeGame: function () {
		this.gameNode.active = false;
		this.xiongmao.active = false;
		this.youxi.active = false;
		this.right.active = true;
		this.rank.active = false;
		this.bottom.active = false;
		this.chatNode.active = false;
		let self = this;
		showLoadingAni()
		LoadGame.reinRoom(function (gameid, type) {

			if (!gameid) {

				loadPrefab("hall/freeroom/freeroom", function (module) {
					hideLoadingAni();
					self.left.zIndex = 9999999;
					self.right.zIndex = 9999999;
					self.left.on(cc.Node.EventType.TOUCH_START, function () {
						module.getComponent('freeRoomScript').scroll(0)
					})
					self.right.on(cc.Node.EventType.TOUCH_START, function () {
						module.getComponent('freeRoomScript').scroll(1)
					})
					module.getComponent('freeRoomScript').initData(function () {
						self.gameNode.active = true;
						self.xiongmao.active = true;
						self.youxi.active = false;
						self.right.active = false;
						self.left.active = false;
						self.rank.active = true;
						self.bottom.active = true;
						self.chatNode.active = true;

					}, function () {
						self.right.active = false;
						self.left.active = true;
					}, function () {
						self.right.active = true;
						self.left.active = false;
					})

					// module.x = cc.winSize.width / 2;
					// module.y = cc.winSize.height / 2;
					module.parent = self.node;
				});
			} else {
				LoadGame.enterActGame(gameid, type);
			}
		});
	},

	//点击聊天界面
	onClickShowChat: function () {
		let self = this;
		showLoadingAni()
		loadPrefab("hall/chat/chat", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},

	//点击房卡房 进入房卡场界面
	onClickCardGame: function () {
		showLoadingAni()
		LoadGame.reinRoom(function (gameid, type) {
			hideLoadingAni();
			if (!gameid) {
				loadPrefab("hall/friendroom/room", function (module) {
					hideLoadingAni()
					module.x = cc.winSize.width / 2;
					module.y = cc.winSize.height / 2;
					module.parent = cc.director.getScene();
					// module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.2,1.1),cc.scaleTo(0.1,1)))
				});
			} else {
				LoadGame.enterActGame(gameid, type);
			}
		});


	},

	//点击规则 进入规则界面
	onClickRule: function () {
		showLoadingAni()
		loadPrefab("hall/rule/rule", function (module) {
			hideLoadingAni()
			module.getComponent('ruleScript').initData({})

			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击客服 进入客服界面
	onClickGM: function () {
		showLoadingAni()
		loadPrefab("hall/gm/gm", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	//点击设置 进入设置界面
	onClickSet: function () {
		showLoadingAni()
		loadPrefab("hall/setting/setting", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();

			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},


	onClickExit: function () {
		showLoadingAni()
		if (cc.sys.os == cc.sys.OS_ANDROID) {
			showAlertBox("确定退出游戏", function () {
				cc.game.end();
			}, function () {
				cc.log(1)
			});
		} else {
			hideLoadingAni()
			cc.director.loadScene(config.loginScene)
		}

	},
	updateUsercenter: function () {
		if (this.jinbi) {
			this.jinbi.string = formatNum(UserCenter.getUserInfo().youxibiNum);
		}
		if (this.zuanshi) {
			this.zuanshi.string = formatNum(UserCenter.getUserInfo().fangkaNum);
		}
		if (this.nc) {
			this.nc.string = UserCenter.getUserInfo().nc;
		}
	},
	onDestroy: function () {
		cc.log('destroy')
		GlobEvent.removeAllListeners('update_Head');
		GlobEvent.removeListener('update_UserCenter', this.updateUsercenter.bind(this));
		GlobEvent.removeListener('addChatMsg', this.onMsgRecive.bind(this))
		GlobEvent.removeListener('changeFriendMsg', this.onChangeFriendMsg.bind(this))
		GlobEvent.removeListener('WXShare', this.shareCallback);
	},
	onExit: function () {
		cc.log('exit')
	}
});
