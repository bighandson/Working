const GamePlayer = require('GamePlayer');
const config = require('Config');
const MJCardResource = require('MJCardResource');
const MJCard = require('MJCard');
const MJCommand = require('MJCommand');
var User = require("User");
var Jiuji = require('Jiuji')

const Position = [
	'东●', /****xxxx***aaaa****bbbb*****cccc****dddd****/
	'南●', /****xxxx***aaaa****bbbb*****cccc****dddd****/
	'西●', /****xxxx***aaaa****bbbb*****cccc****dddd****/
	'北●'/****xxxx***aaaa****bbbb*****cccc****dddd****/
];

cc.Class({
	extends: cc.Component,
	/****xxxx***aaaa****bbbb*****cccc****dddd****/
	properties: {
		users: cc.Node,
		tuichu: cc.Node,
		clock: cc.Node,
		time: cc.Label,
		// difen : cc.Label
	},
	/****xxxx***aaaa****bbbb*****cccc****dddd****/
	onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, function () {

		}, this);

		// this.mycolor = cc.color(255, 255, 204);
		// this.othercolor = cc.color(255, 255, 204);
		// this.loseColor = cc.color(125,119,112);

	},
	/****xxxx***aaaa****bbbb*****cccc****dddd****/
	/**
	 * 显示结算消息
	 * @param gameid
	 * @param masterid
	 * @param huInfo
	 * @param resultInfo
	 */
	showResult: function (rule, huInfo, resultInfo) {
		let self = this;
		this.rule = rule;

		this.game = config.getGameById(this.rule.gameid);

		this.huUserid = huInfo.userid;

		let len = huInfo.data.users.length;
		this.huInfo = huInfo;

		this.resultInfo = resultInfo;
		cc.log(rule, huInfo, resultInfo)
		if (rule.roomType == 2) {
			this.clock.active = false;
			this.tuichu.active = false
			// this.difen.node.active = false;

		} else {
			this.clock.active = true;
			this.schedule(this.daoJiShi, 1)
			// this.difen.node.active = true;
			// this.difen.string ='底分：'+   this.rule.basemoney;
			cc.log(huInfo.data.users)
		}

		resultInfo.users.sort(function (a, b) {

			return b.curwon - a.curwon;
		});
		cc.log(resultInfo.users)

		var i = 0;
		for (; i < len; i++) {
			let user = resultInfo.users[i];
			if (user.userid == UserCenter.getUserID() && user.fanShu >= 1) {
				User.gethongbao(4, self.rule.gameid, '', function (err, data) {
					if (err) {
						cc.log(err, data)
						return
					}
					if (data.results && data.results.length && data.results[0].money > 0) {
						cc.loader.loadRes('style/hongbao/hongbao', cc.Prefab, function (err, prefab) {
							if (err) {
								cc.log(err);
								return;
							}
							var node = cc.instantiate(prefab);
							node.parent = self.node.parent;
							var controller = node.getComponent('hongbaoScript');
							controller.init(rule, user, huInfo, data.results[0].money);
						});

					}


				})

			}
			this.setResultLayer(i, user, rule.lastPlayId);

		}

		for (; i < 4; i++) {
			this.users.children[i].active = false;
		}


	},

	daoJiShi: function () {
		let self = this;
		this.time.string--;
		if (this.time.string == 0) {
			this.closeGmae();
			this.unschedule(self.daoJiShi);
		} else if (this.time.string == 5) {
			showAlert('赶紧准备')
		}
	},
	/**
	 * 分享到微信
	 * @param event
	 * @param to    0 : 微信好友 1 ： 微信朋友圈
	 */
	onShareToWXScene: function (event, to) {
		var self = this;
		if (!!self._isShareing) return;
		self._isShareing = true;
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		var shareTo = parseInt(to);
		var prePos = this.box.getPosition();
		this.box.setPosition(cc.p(0, 0));
		captureScreen(this.box, cc.size(cc.director.getVisibleSize().width, 750), function (err, path) {
			self._isShareing = false;
			self.box.setPosition(prePos);
			if (err) {
				cc.log(err);
				/****xxxx***aaaa****bbbb*****cccc****dddd****/
				return;
			}
			wxapi.sendImageToWxReq(path, shareTo);
		});
	},
	//继续游戏
	goOnGame: function () {
		let self = this;
		this.unschedule(self.daoJiShi);
		cc.log(this.rule)
		if (this.rule.roomType < 2) {
			if (!!this.rule.minpoint) {
				let jinbi = UserCenter.getYouxibiNum();
				let baoxian = UserCenter.getYinhanbiNum();
				if (jinbi < this.rule.minpoint) {
					if (jinbi + baoxian < this.rule.minpoint) {
						// if(jinbi < 5000){
						// 	Jiuji.getCishu('',function (err,data) {
						// 		hideLoadingAni()
						// 		if(err){
						// 			cc.log(data)
						// 			showAlertBox('账户金币不足',function () {
						// 				self.closeGmae();
						// 			})
						// 			return
						// 		}
						// 		if(data.results[0].receive_count){
						// 			showAlertBox('账户金币不足,有救济金可以领取，请返回大厅领取',function () {
						// 				self.closeGmae();
						// 			})
						// 		}else{
						// 			showAlertBox('账户金币不足',function () {
						// 				self.closeGmae();
						// 			})
						// 		}
						// 	})
						// }else{
							showAlertBox('账户金币不足',function () {
								self.closeGmae();
							})
						// }
					} else {
						cc.log(this.minpoint, jinbi)
						let qugao;
						if (this.rule.maxpoint) {
							qugao = this.rule.maxpoint - jinbi;
						} else {
							qugao = 10000000 - jinbi;
						}
						let qudi = this.rule.minpoint - jinbi;
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
									self.rule.sendExpend(message, function (data) {
										cc.log('10003', data)
										hideLoadingAni()
										if (data.code == 200) {
											self.rule.setBD(0);
											self.rule.node.emit('msg_onceAgain');
											self.node.removeFromParent(true);
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
					self.rule.setBD(0);
					self.rule.node.emit('msg_onceAgain');
					self.node.removeFromParent(true);
				}

			} else {
				showAlertBox('获取金币最小值失败，请退出游戏后再试', function () {
					self.closeGmae()
				})
			}
		} else {
			self.rule.setBD(0);
			self.rule.node.emit('msg_onceAgain');
			self.node.removeFromParent(true);
		}


	},

	//退出房间
	closeGmae: function () {
		this.rule.node.emit('onExit');
		this.node.removeFromParent(true);
	},


	getUserResult: function (userid) {
		for (let i = 0; i < this.resultInfo.users.length; i++) {
			let user = this.resultInfo.users[i];
			if (user.userid == userid) {
				return user;
			}
			/****xxxx***aaaa****bbbb*****cccc****dddd****/
		}

		return null;
	},

	/**
	 *
	 * @param i
	 * @param huUser  用户胡的数据
	 */
	setResultLayer: function (i, huUser, lastPlayId) {
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		let node = this.users.children[i];
		let self = this;
		node.active = true;
		let userResult = this.getUserResult(huUser.userid);
		let usernick = GamePlayer.getPlayer(huUser.userid).nick;
		let nick = formatName(usernick, 8);
		let isHu = (huUser.userid == this.huUserid);
		// let color = (huUser.userid == UserCenter.getUserID()) ? this.mycolor : this.othercolor;
		// node.children[0].active = isHu;
		node.children[6].active = isHu;
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		var str = nick;
		if (this.result2) {
			str = nick + "   ID:" + huUser.userid;
		}
		// 昵称
		node.children[2].getComponent(cc.Label).string = str;
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
			// node.children[2].color = color;

		let isBeDianpao = (this.huInfo.data.huflag == 0 || this.huInfo.data.huflag == MJCommand.HUFLAG.MJR_HU_QG) &&
			(lastPlayId == huUser.userid);
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		// 胡类型
		cc.log('huInfo : ', this.huInfo);
		if (isHu) {
			node.children[3].active = true;
			// node.children[5].color = color;
			/****xxxx***aaaa****bbbb*****cccc****dddd****/
			let huString = '';
			let hutype1 = this.huInfo.data.hutype1;
			for (let hukey in this.game.hutype1) {
				if (hutype1 & hukey) {
					huString += this.game.hutype1[hukey] + ' ';
				}
			}
			if (!!this.game.hutype2) {
				let hutype2 = this.huInfo.data.hutype2;
				for (let hukey2 in this.game.hutype2) {
					if (hukey2 & hutype2) {
						huString += this.game.hutype2[hukey2] + ' ';
					}
				}
				/****xxxx***aaaa****bbbb*****cccc****dddd****/
			}
			// if(!huString) {
			//     huString = this.game.hutype1[0x00];
			// }
			huString = this._getHuFlag(this.huInfo.data.huflag) + '     ' + huString;
			let huflower;
			for (let i = 0; i < self.huInfo.data.users.length; i++) {
				if (self.huInfo.data.users[i].userid == huUser.userid) {
					huflower = self.huInfo.data.users[i].flowers.length
				}

			}
			huflower = ['', '一', '二', '三', '四'][huflower]
			if (!!huflower) {
				huString += '花' + huflower + '台'
			}

			node.children[3].getComponent(cc.Label).string = huString;
		} else if (isBeDianpao) {
			if (this.huInfo.data.huflag == MJCommand.HUFLAG.MJR_HU_QG) {
				node.children[3].getComponent(cc.Label).string = '点炮';
			} else {
				node.children[3].getComponent(cc.Label).string = '点炮';
			}
			node.children[3].active = true;
			/****xxxx***aaaa****bbbb*****cccc****dddd****/
		}
		else {
			node.children[3].active = false;
		}
		/****xxxx***aaaa****bbbb*****cccc****dddd****/

		// 番数
		if (isHu) {
			//node.children[6].active = true;
			// node.children[4].color = color;
			// if(userResult.fanShu >= 0){ // f
			//     node.children[4].getComponent(cc.Label).string = '{0}{1}'.format(userResult.fanShu,this.game.fanShuName);
			// }
		} else {

		}
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		if (userResult.fanShu >= 0) {
			node.children[4].active = true;
			node.children[4].getComponent(cc.Label).string = '{0}{1}'.format(userResult.fanShu, this.game.fanShuName);
		} else {
			node.children[4].active = false;
		}
		// 输赢/****xxxx***aaaa****bbbb*****cccc****dddd****/
		let score = userResult.curwon > 0 ? '+' + userResult.curwon : userResult.curwon;
		if (score < 0) {
			// node.children[5].color = this.loseColor;
		}

		node.children[5].getComponent(cc.Label).string = score;


		//绘制麻将
		let mj = node.children[1];
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		let hus;
		for (let i = 0; i < self.huInfo.data.users.length; i++) {
			if (self.huInfo.data.users[i].userid == huUser.userid) {
				hus = self.huInfo.data.users[i]
			}

		}

		this.drawUserCards(mj, hus);
	},

	/**
	 * 绘制牌
	 */
	drawUserCards: function (mj, usr) {
		mj.removeAllChildren(true);
		let startPosX = 0;
		let scale = this.game.handCards > 14 ? 0.7 : 1;
		// for (let i = 0; i < usr.flowers.length; i++) {
		//     let card = this._createMJCard(usr.flowers[i]);
		//     card.x = startPosX;
		//     card.scale = scale;
		//     startPosX += 50 * scale;
		//     card.parent = mj;
		// }
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		startPosX += 20;
		cc.log(startPosX)
		for (let i = 0; i < usr.blockPais.length; i++) {
			let block = usr.blockPais[i];
			if (block.blockFlag < 4) { // 吃
				for (let i = 0; i < block.values.length; i++) {
					let pai = block.values[i];
					let card = this._createMJCard(pai);
					card.scale = scale;
					card.x = startPosX;
					startPosX += 50 * scale;
					card.parent = mj;
					cc.log(startPosX)
				}
			} else if (block.blockFlag == 4) { // 碰
				for (let i = 0; i < 3; i++) {
					let card = this._createMJCard(block.values[0]);
					card.x = startPosX;
					card.scale = scale;
					startPosX += 50 * scale;
					cc.log(startPosX)
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
					card.parent = mj;
				}
			} else {  // 杠
				let bAnBar = block.blockFlag == 6;
				if(block.values.length ==1){
					if(block.blockFlag == 5){
						block.values =	block.values.concat([block.values[0],block.values[0],block.values[0]])
					}else if(block.blockFlag == 6){
						block.values =	[255,255,255].concat(block.values)
					}

				}
				for (let i = 0; i < block.values.length; i++) {
					let pai = block.values[i];
					let card
					if(pai == 255){
						card = this._createAnBar();
					}else{
						card = this._createMJCard(pai);
					}
					if (i < 3) {
						card.x = startPosX;
						startPosX += 50 * scale;
					} else if (i == 3) {
						card.x = startPosX - 100 * scale;
						card.y = 10;
					} else if (i == 4) {
						card.x = startPosX - 150 * scale;
						card.y = 10;
					} else if (i == 5) {
						card.x = startPosX - 50 * scale;
						card.y = 10;
					} else if (i == 6) {
						card.x = startPosX - 100 * scale;
						card.y = 20;
					}
					card.scale = scale;
					card.parent = mj;
				}
				/****xxxx***aaaa****bbbb*****cccc****dddd****/
			}
			//startPosX += 5;
		}
		// if(!usr.blockPais.length){
		startPosX += 10;
		// }


		for (let i = 0; i < usr.pais.length; i++) {
			let card = this._createMJCard(usr.pais[i]);
			if (i == usr.pais.length - 1 && usr.pais.length % 3 == 2) startPosX += 10;
			card.x = startPosX;
			card.scale = scale;
			startPosX += 50 * scale;
			card.parent = mj;


		}
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
	},

	getCardsNumber: function (usr) {
		let total = 0;
		total += usr.flowers.length;
		total += usr.blockPais.length * 3;
		total += usr.pais.length;

		return total;
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
	},

	_createMJCard: function (value) {
		let card = new cc.Node().addComponent('MJCard');
		let frame = MJCardResource.getExtraImageByChair(0, value);
		card.setCard(value, frame);
		if (this.rule.isBD(value)) {
			card.setBDTag(0, false, 0, 22);
		}
		return card.node;
	},
	_createAnBar: function () {
		let card = new cc.Node().addComponent('MJCard');
		let frame = MJCardResource.getAnFrame(0, true);
		card.setCard(0, frame);
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		return card.node;
	},


	// MJR_HU_ZM   : 1,    // 自摸
	// MJR_HU_GSKH : 2,    // 杠上开花
	// MJR_HU_TH   : 4,    // 天和
	// MJR_HU_DH	: 8,    // 地和
	// MJR_HU_QG	: 16,   // 抢杠
	// MJR_HU_GSKH2	: 32,//后杠
	_getHuFlag: function (huFlag) {
		cc.log('huFlag', huFlag);
		switch (huFlag) {
			case 0:
				return '';
			case MJCommand.HUFLAG.MJR_HU_ZM:
				return '自摸';
			case MJCommand.HUFLAG.MJR_HU_GSKH:/****xxxx***aaaa****bbbb*****cccc****dddd****/
				return '杠上开花';
			case MJCommand.HUFLAG.MJR_HU_TH:
				return '天胡';
			case MJCommand.HUFLAG.MJR_HU_DH:
				return '地胡';
			case MJCommand.HUFLAG.MJR_HU_QG:/****xxxx***aaaa****bbbb*****cccc****dddd****/
				return '抢杠';
			case MJCommand.HUFLAG.MJR_HU_GSKH2:
				return '后杠';/****xxxx***aaaa****bbbb*****cccc****dddd****/
			case MJCommand.HUFLAG.MJR_HU_HDLY:
				return '海底捞月';/****xxxx***aaaa****bbbb*****cccc****dddd****/
			default:
				return '胡';
		}
	}
});
