var LoadGame = require('LoadGame');
var LoadGame = require('LoadGame');
var DdzCommand = require('DdzCommand');
cc.Class({
	extends: cc.Component,

	properties: {
		MAX_POKER_NUM: 27,
		MAX_RES_NUM: 2,
		SPACING_X: -88,
		POKER_SHOW_WIDTH: 46,
		POKER_SIZE: cc.size(134, 180),
		START_POKER: "START_POKER",
		SELECTED_PRE: "SELECTED_PRE",
		gameBtnLayout: cc.Node,
		handCardLayout: cc.Node,
		outCardLayout: cc.Node,
		clockSprite: cc.Node,
		nocardTip: cc.Node,
		errortip: cc.Node,
		changePai: cc.Node,
		AnimationNode: cc.Node,
		mingpaiLabel: cc.Label
	},


	onLoad: function () {
		//牌数据
		this.gameServer = '';
		this.mingpai = 4;//beishu
		this.isMingpai = 0;// 中间点了明牌
		this.isMingpaiStart = 0;//是否明牌开始
		this.loadCount = 0;
		this.selectedArray = [];
		this.selectedObj = {};
		let self = this;
		cc.loader.loadRes("game/ddz/prefab/DdzpokerTexture/pokers", cc.SpriteAtlas, function (err, atlas) {
			if (err) {
				cc.log(err);
				return;
			}
			self.pokersAtlas = atlas;
			self.loadCount++;

		});

		var url = 'game/ddz/prefab/DdzpokerSprite';
		cc.loader.loadRes(url, cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			self.pokerPrefab = prefab;
			self.loadCount++;

			/*self.checkLoadRes();*/
		});
		this.init();
	},

	init: function () {
		this.roomType = 0;
		this.timeLimit = false
		this.clockLabel = this.clockSprite.getChildByName("time").getComponent(cc.Label);
		this.startPos = cc.p(0, 0);
		this.movePos = cc.p(0, 0);
		this.isMoving = false;
		this.handCardLayout.on(cc.Node.EventType.TOUCH_START, this.handCardLayoutStart, this);
		this.handCardLayout.on(cc.Node.EventType.TOUCH_MOVE, this.handCardLayoutMove, this);
		this.handCardLayout.on(cc.Node.EventType.TOUCH_END, this.handCardLayoutEnd, this);
		this.handCardLayout.on(cc.Node.EventType.TOUCH_CANCEL, this.handCardLayoutCancel, this);
		this.isBtoS = true;

	},

	callback: function () {
		this.timeCount--;

		this.clockLabel.string = this.timeCount;

		if (DdzManager.autoplaySign) {
			//时间到了
			this.unschedule(this.callback);
			// this.overTime();

			if (this.gameBtnLayout.getChildByName("noCard").active == false) {
				this.onClickTips();
				this.onClickOutCard(DdzManager.tuoci);
			} else {
				this.onClickNoCard(DdzManager.tuoci);
			}
		}
		if (this.timeCount == 0) {
			//时间到了
			this.unschedule(this.callback);
			this.overTime();
			if (this.timeLimit) {
				if (this.gameBtnLayout.getChildByName("noCard").active == false) {
					this.onClickTips();
					this.onClickOutCard(DdzManager.tuoci);
				} else {
					this.onClickNoCard(DdzManager.tuoci);
				}
				DdzManager.tuoci++;
				cc.log('111111111',DdzManager.tuoci)
				if(DdzManager.tuoci >= 2){
					DdzManager.controller.onClickAuto(null,1)
				}

			}
		}
	},
	overTime: function () {
		showAlert("出牌超时");
		// this.hide();
	},
	showtimeOutPai: function (time) {
		this.clockLabel.string = time;
		this.timeCount = time;
		this.schedule(this.callback, 1);

	},

	NOCardCallback: function () {

		this.nocardtime -= 0.5;
		if (this.nocardtime == 0) {
			this.unschedule(this.NOCardCallback);
			this.onClickNoCard();
		}
	},

	addDiPai: function (data) {
		for (let index in data) {
			let card = data[index];
			let pokerPrefab = cc.instantiate(DdzManager.pokerPrefab);
			pokerPrefab.parent = this.handCardLayout;

			//type 2,4为红的
			let type = card[0];
			let num = card[1];
			//let type = card1[0];
			//let num  = card1[1];
			let info = card[2];
			let pokerController = pokerPrefab.getComponent("DdzpokerCtr");
			pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, index);
		}
		this.mingpaiLabel.node.parent.active = false;
		this.refreshPokersHandLayout();
		DdzManager.rule.msgBlocked = false;
        this.setDizhuLog()
        if(this.isMingpai){
            this.setmingpaiLog()
        }
        
	},
	//isXianzhi 不顯示名牌按鈕
	onShow: function (data, isPlayAni, isStartMingpai, isXianzhi,isDizhu,isMing) {

		this.isMingpaiStart = isStartMingpai;
		this.isMingpai = isStartMingpai;

		this.handCardLayout.removeAllChildren(true);
		//var data1 = [[1,3],[1,3],[2,3],[2,3],[1,4],[1,4],[2,4],[2,4],[1,5],[1,5],[2,5],[2,5],[1,6],[1,6],[2,6],[2,6],[1,13],[1,13],
		//[2,13],[2,13],[3,13],[3,13],[4,13],[2,8],[2,9],[3,10],[3,10]];
		for (let index in data) {
			let card = data[index];
			let pokerPrefab = cc.instantiate(DdzManager.pokerPrefab);
			pokerPrefab.parent = this.handCardLayout;
			if (isPlayAni == 1/*||isPlayAni==0*/) {
				pokerPrefab.opacity = 0;
				pokerPrefab.runAction(cc.scaleTo(0.01, 0.7, 1));
			}
			//type 2,4为红的
			let type = card[0];
			let num = card[1];
			//let type = card1[0];
			//let num  = card1[1];
			let info = card[2];
			let pokerController = pokerPrefab.getComponent("DdzpokerCtr");
            pokerController.mLogo.active = isMing
            pokerController.dLogo.active = isDizhu
			pokerController.init(DdzManager.pokersAtlas, {num: num, type: type}, info, index);
		}

		// isPlayAni = 1;//test
		if (isPlayAni == 1) {
			this.mingpaiLabel.string = ":{0}".format(4);
			this.mingpaiLabel.node.parent.active = !(isStartMingpai || isXianzhi);
			var Layout = this.handCardLayout.getComponent(cc.Layout);
			Layout.spacingX = -82;
			this.pokLength = 0;
			this.changePai.getComponent(cc.Button).interactable = false;
			this.schedule(this.Pokcallback, 0.3);
		} else {
			this.mingpaiLabel.node.parent.active = false;
			this.refreshPokersHandLayout();
			DdzManager.rule.msgBlocked = false;
		}

	},

	Pokcallback: function () {
		var self = this;
		var pokers = this.handCardLayout.children[this.pokLength];
		this.pokLength++;
		if (!this.isMingpai) {
			if (this.pokLength % 5 == 0) {
				let tmpBeishu = 4 - this.pokLength / 5;
				this.mingpai = tmpBeishu;
				this.mingpaiLabel.string = ":{0}".format(this.mingpai);
			}
		}
		if (this.pokLength == this.handCardLayout.childrenCount) {
			this.unschedule(this.Pokcallback);
			pokers.runAction(cc.sequence(cc.delayTime(0.4), cc.callFunc(function () {
                if(self.isMingpai){
                   self.setmingpaiLog() 
                }
				self.refreshPokersHandLayout();
				self.changePai.getComponent(cc.Button).interactable = true;
			})));
		}
		if (this.pokLength == 15) {
			if (!this.isMingpai) {
				var msg = {
					cmd: DdzCommand.REQ_CMD.CMD_LightCard,
					data: {
						userid: UserCenter.getUserID(),
						isSee: 0,
						times: 0
					}
				};
				this.sendCmd(".CMD_Command", msg);
			}
			this.mingpaiLabel.node.parent.active = false;
			DdzManager.rule.msgBlocked = false;
		}
		if (!!pokers) {
			pokers.runAction(cc.spawn(cc.fadeIn(0.3), cc.scaleTo(0.07, 1, 1)));
		}
	},

	//更改透明度
	drawLine: function () {
		var graphics = this.getComponent(cc.Graphics);
		graphics.circle(0, 0, 200);
		//添加颜色及透明度
		let fillColor = cc.Color.RED;//声明一个颜色变量
		fillColor.a = 200;//添加透明度
		graphics.stroke();
		graphics.fill();

	},

	sendCmd: function (route, param) {
		cc.log("客户端下发命令------------", route, JSON.stringify(param));
		if (!!param) {
			PomeloClient.request(this.gameServer + route, param, function (data) {
				cc.log(JSON.stringify(data));
			});
		} else {
			PomeloClient.request(this.gameServer + route, function (data) {
				cc.log(JSON.stringify(data));
			});
		}
	},
	handCardLayoutStart: function (event) {
		this.isMoving = true;
		var touches = event.getTouches();
		var touchLoc = touches[0].getLocation();
		this.startPos = this.handCardLayout.convertToNodeSpaceAR(touchLoc);
		for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
			let poker = this.handCardLayout.children[i];
			if (this.isPokerClickBox(i == this.handCardLayout.childrenCount - 1, this.startPos, this.startPos, poker)) {

				//选中的第一个
				this.selectedObj[this.START_POKER] = poker;
				poker.getChildByName("maskSprite").active = true;
				break
			}
		}
	},
	handCardLayoutMove: function (event) {
		if (!this.isMoving) {
			return;
		}

		let startPoker = this.selectedObj[this.START_POKER];
		//没有选中的牌
		if (startPoker == null) {
			return;
		}

		var touches = event.getTouches();
		var touchLoc = touches[0].getLocation();
		this.movePos = this.handCardLayout.convertToNodeSpaceAR(touchLoc);

		for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
			let poker = this.handCardLayout.children[i];
			let pokerController = poker.getComponent("DdzpokerCtr");
			if (startPoker != poker) {
				if (this.isPokerClickBox(i == this.handCardLayout.childrenCount - 1, this.startPos, this.movePos, poker)) {
					//在选中区域
					this.selectedObj[this.SELECTED_PRE + pokerController.index] = poker;
					poker.getChildByName("maskSprite").active = true;
				} else {
					//不在选中区域
					this.selectedObj[this.SELECTED_PRE + pokerController.index] = null;
					poker.getChildByName("maskSprite").active = false;
				}
			}
		}
	},

	handCardLayoutEnd: function (event) {
		this.isMoving = false;
		this.refreshPokerState();
		this.selectedObj = {};
		this.selectedArray = []; //选中的牌

		for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
			let poker = this.handCardLayout.children[i];
			let pokerController = poker.getComponent("DdzpokerCtr");
			if (pokerController.isSelected) {
				//更新选中
				this.selectedArray.push(poker);
			}
			poker.getChildByName("maskSprite").active = false;
		}
		this.isCanoutCard();
	},

	handCardLayoutCancel: function (event) {
		this.isMoving = false;
		this.selectedObj = {};
		this.selectedArray = [];
		for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
			this.handCardLayout.children[i].getChildByName("maskSprite").active = false;
		}
	},
	isPokerClickBox: function (isEndPoker, startPos, endPos, poker) {
		let startPosX;
		let endPosX;
		if (startPos.x < endPos.x) {
			startPosX = startPos.x;
			endPosX = endPos.x;
		} else {
			startPosX = endPos.x;
			endPosX = startPos.x;
		}
		let xStart = poker.x - this.POKER_SIZE.width / 2;
		let xEnd = poker.x + this.POKER_SIZE.width / 2 + this.SPACING_X;
		if (isEndPoker) {
			xEnd = poker.x + this.POKER_SIZE.width / 2;
		}


		if (startPosX >= xStart && startPosX >= xStart + Math.abs(xStart - xEnd)) {
			return false;
		} else if (startPosX <= xStart && startPosX + Math.abs(startPosX - endPosX) <= xStart) {
			return false;
		}
		return true;
	},
	refreshPokerState: function () {
		if (this.selectedObj[this.START_POKER] == null) {
			return;
		}

		//刷新第一个选中的
		this.refreshPoker(this.selectedObj[this.START_POKER]);
		for (let i = 0; i < this.MAX_POKER_NUM; i++) {
			let poker = this.selectedObj[this.SELECTED_PRE + i];
			if (poker != null) {
				this.refreshPoker(poker);
			}
		}
	},
	refreshPoker: function (poker) {
		let pokerController = poker.getComponent("DdzpokerCtr");
		pokerController.setIsSelected(!pokerController.isSelected);
	},


	refreshPokersHandLayout: function () {
		let length = this.handCardLayout.childrenCount;
		let startX;
		var Layout = this.handCardLayout.getComponent(cc.Layout);
		if (length >= 2 && length <= 27) {
			Layout.spacingX = (-92 + (27 - length));
		}
		else if (length > 0 && length <= 2) {
			Layout.spacingX = -67;
		}
		if (length % 2 == 1) {
			//单数
			startX = Math.floor(length / 2) * (-this.POKER_SHOW_WIDTH);
		} else {
			//双数
			startX = -this.POKER_SHOW_WIDTH / 2 - (Math.floor(length / 2) - 1) * this.POKER_SHOW_WIDTH;
		}

		if (this.isBtoS) {
			DdzManager.rule.sortHandPokersBToS(this.handCardLayout.children);
		}
		else {
			DdzManager.rule.sortHandPokersMToL(this.handCardLayout.children);
		}
		for (let i = 0; i < length; i++) {
			let poker = this.handCardLayout.children[i];
			poker.x = startX + this.POKER_SHOW_WIDTH * i;
			poker.setLocalZOrder(10000 + i);
			poker.getComponent("DdzpokerCtr").index = i;
		}
	},

    setDizhuLog:function(){
        let length = this.handCardLayout.childrenCount;
        for(let i = 0;i < length ;i++)
        {
            let poker =this.handCardLayout.children[i];
             poker.getComponent("DdzpokerCtr").dLogo.active = true
        }
    },

    setmingpaiLog:function(){
        let length = this.handCardLayout.childrenCount;
        for(let i = 0;i < length ;i++)
        {
            let poker =this.handCardLayout.children[i];
             poker.getComponent("DdzpokerCtr").mLogo.active = true
        }
    },

	sortHandPokers: function () {
		this.isBtoS = !this.isBtoS;

		this.refreshPokersHandLayout();
	},

	showOutCardAni: function (type) {
		var self = this;
		// cc.log('自己炸弹',type)
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
		}
		// else if(type>=11&&type<14)
		// {
		//     cc.loader.loadRes("doudizhu/sk/effect/Bomb2/Bomb2Node", cc.Prefab, function (err, prefab) {
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
					return;
				}
				var module = cc.instantiate(prefab);
				module.parent = self.AnimationNode;
			});
		}
	},

	refreshLayout: function (cardarray) {
		let cardArray = []
		let outArray = [];
		let self = this;
		for (let i = 0; i < cardarray.length; i++) {
			cardArray.push(DdzManager.getCardTypeNum(cardarray[i]));
		}
		this.handCardLayout.children.forEach(function (item, index) {
			for(let j = 0; j<cardArray.length;j++){
				if(item.getComponent('DdzpokerCtr').type == cardArray[j][0] && item.getComponent('DdzpokerCtr').num == cardArray[j][1]){
					outArray.push(index)
				}
			}

		})
		cc.log(outArray)
		let outIndex = 0;
		outArray.forEach(function (item) {
			self.handCardLayout.children[item-outIndex].removeFromParent()
			outIndex++;
		})
		//清空选中
		this.selectedArray = [];
		this.typeArray = null;

		this.refreshPokersHandLayout();

	},


	getCardData: function (tableid, seatId, type, length, num, X, isshow, isMingpai) {
		if (type < 0) return;

		this.type = type;
		cc.log("this.type", this.type);
		this.length = length;
		// this.length=12;
		cc.log("this.length", this.length);
		this.num = num;
		cc.log("this.num", this.num);
		this.tableId = tableid;///
		//cc.log("this.tableID",this.tableId);
		this.seatId = seatId;
		cc.log("this.seatId", this.seatId);
		this.X = X;
		this.isMingpaiStart = isMingpai;
		this.mingpaiLabel.node.parent.active = false;
		//cc.log("this.X",this.X);
		if (isshow) {
			this.onshowTip();
		}
		this.isCanoutCard();
	},
	onClickNoCard: function (tuoci) {
		DdzManager.tuoci = tuoci||0

		let msg = {cmd: DdzCommand.REQ_CMD.CMD_GiveUpOutCard};
		cc.log("NoCard_msg", msg);
		PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command", msg
			, function (data) {
				cc.log(data);
			});

		// for(let i = 0;i < this.selectedArray.length;i++)
		// {
		//     let poker = this.selectedArray[i];
		//     let pokerController = poker.getComponent("DdzpokerCtr");
		//     pokerController.setIsSelected(false);
		// }
		// //清空选中
		// this.selectedArray = [];
		// this.typeArray = null;
		// this.gameBtnLayout.active=false;
		// this.unschedule(this.callback);
		//this.unschedule(this.Btncallback);

	},
	onGetNoCard: function () { //收到服务端的过
		for (let i = 0; i < this.selectedArray.length; i++) {
			let poker = this.selectedArray[i];
			let pokerController = poker.getComponent("DdzpokerCtr");
			pokerController.setIsSelected(false);
		}
		//清空选中
		this.selectedArray = [];
		this.typeArray = null;
		this.gameBtnLayout.active = false;
		this.unschedule(this.callback);
	},

	isCanoutCard: function () {

		let tipsType = this.changeCardType(this.type);
		let cardType = this.judgeCanOutCard(tipsType, this.selectedArray, this.length, this.num);
		let Type = this.changeOutCardType(cardType);
		if (Type > 0) {
			this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button).interactable = true;
			//this.changeCardOut();
		}
		else {
			this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button).interactable = false;
		}
	},
	changeCardOut: function () {
		var button = this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button);
		button.interactable = !button.interactable;
	},

	onClickOutCard: function (tuoci) {
		DdzManager.tuoci = tuoci||0
		if (this.selectedArray.length != 0) {
			//let tipsType = this.changeCardType(this.type);
			let cardType = this.judgeCanOutCard(this.type, this.selectedArray, this.length, this.num);
			this.gameBtnLayout.getChildByName("mingpai").active = false;
			//let Type = this.changeOutCardType(cardType);
			cc.log("出牌类型:", cardType);
			if (cardType > 0) {
				cc.log('11111111111111', DdzManager.rule.getCardInfo(this.selectedArray));
				let array = DdzManager.rule.racklePokers(this.selectedArray, cardType);
				var msg = {
					cmd: DdzCommand.REQ_CMD.CMD_OutCard,
					data: {
						userid: UserCenter.getUserID(),
						tableid: this.tableId,
						seatid: this.seatId,
						cardtype: cardType,
						cardnum: this.selectedArray.length,
						cardarray: array
					}


				};
				cc.log("DdzCommand.REQ_CMD.CMD_OutCard");
				this.sendCmd(".CMD_Command", msg);
				/*this.outCardLayout.removeAllChildren(true);*/
				// this.refreshLayout(cardType);
				// this.gameBtnLayout.active=false;
				//
				// this.unschedule(this.callback);
				//this.unschedule(this.Btncallback);
			}
			else {
				for (let i = 0; i < this.selectedArray.length; i++) {
					let poker = this.selectedArray[i];
					let pokerController = poker.getComponent("DdzpokerCtr");
					pokerController.setIsSelected(false);
				}
				//清空选中
				this.selectedArray = [];
				this.errortip.active = true;
				this.errortip.runAction(cc.sequence(cc.show(), cc.delayTime(1), cc.hide()));
			}

		}

	},
	onshowTip: function () {
		let tipsType = this.changeCardType(this.type);
		let Array = this.getTipsArray(tipsType, this.length, this.num);

		if (this.length > this.handCardLayout.childrenCount && Array.length == 0) {
			this.gameBtnLayout.active = false;
			this.nocardtime = 1;
			this.schedule(this.NOCardCallback, 0.5);
			this.nocardTip.active = true;
			this.nocardTip.runAction(cc.sequence(cc.show(), cc.delayTime(0.7), cc.hide()));
		}
		else if (Array.length == 0) {
			//this.onClickNoCard();
			this.nocardTip.active = true;
			this.nocardTip.runAction(cc.sequence(cc.show(), cc.delayTime(0.7), cc.hide()));
		}
	},

	//恢复默认
	onClickDefault: function () {
		let gameControl = cc.find('controller', this.node.getParent().getParent().getParent()).getComponent('DdzGame') ? cc.find('controller', this.node.getParent().getParent().getParent()).getComponent('DdzGame') : cc.find('controller', this.node.getParent().getParent().getParent()).getComponent('ddzGame_Match')
		gameControl.hidMenu()
		for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
			this.handCardLayout.children[i].getComponent("DdzpokerCtr").setIsSelected(false);
		}
		for (let i = 0; i < this.selectedArray.length; i++) {
			let poker = this.selectedArray[i];
			let pokerController = poker.getComponent("DdzpokerCtr");
			pokerController.setIsSelected(false);
		}
		//清空选中
		this.selectedArray = [];
		if (this.typeArray) this.typeArray = null;
		this.isCanoutCard();
	},

	onClickTips: function () {


		if (this.typeArray == null || this.typeArray.length == 0) {
			//SkManage.rule.createDictionary(this.handCardLayout.children);
			let tipsType = this.changeCardType(this.type);
			this.typeArray = this.getTipsArray(tipsType, this.length, this.num);

			if (this.typeArray.length == 0) {
				this.nocardTip.active = true;
				this.nocardTip.runAction(cc.sequence(cc.show(), cc.delayTime(0.7), cc.hide()));
				this.onClickNoCard();
			}
			//this.typeArray = this.judgeCardType(0,1,9);
			this.typeSelectedIndex = 0;
		}
		if (this.typeArray != null && this.typeArray.length > 0) {
			//更新下标
			if (this.typeArray.length == this.typeSelectedIndex) {
				this.typeSelectedIndex = 0
			}

			this.selectedArray = this.typeArray[this.typeSelectedIndex];
			this.isCanoutCard();

			//恢复默认
			for (let i = 0; i < this.handCardLayout.childrenCount; i++) {
				this.handCardLayout.children[i].getComponent("DdzpokerCtr").setIsSelected(false);
			}

			for (let i = 0; i < this.selectedArray.length; i++) {
				this.selectedArray[i].getComponent("DdzpokerCtr").setIsSelected(true);
			}
			this.typeSelectedIndex++;
		}

	},

	onClickMingpai: function (event, mingpaiData) {
		this.isMingpai = this.mingpaiLabel.string;
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_LightCard,
			data: {
				userid: UserCenter.getUserID(),
				isSee: 1,
				times: this.mingpai
			}
		};
		this.sendCmd(".CMD_Command", msg);
		node.active = false;
	},
	onClickDizhuMingpai: function (event, mingpaiData) {
		var node = event.target;
		var button = node.getComponent(cc.Button);
		var msg = {
			cmd: DdzCommand.REQ_CMD.CMD_LightCardAfter,
			data: {
				userid: UserCenter.getUserID(),
			}
		};
		this.sendCmd(".CMD_Command", msg);
		node.active = false;
        this.setmingpaiLog()
	},
	changeOutCardType: function (type) {
		let temptype = type;

		return temptype;
	},

	changeCardType: function (type) {
		let temptype = type;
		return temptype;
	},


	JudgeLastCard: function (Array) {
		let PokArray = [];
		var length = this.handCardLayout.childrenCount;

		for (var i = 0; i < Array.length; i++) {
			let temp = Array[i];
			if (temp.length == length) {
				PokArray.push(temp);
				break;
			}

		}
		if (PokArray.length == 0) {
			return Array;
		}
		else {
			return PokArray;
		}

	},

	getTipsCardType: function (type, num, MinNum, isKtips, Rtype) {
		// cc.log(type)
		switch (type) {
			case 0:
				return DdzManager.rule.getFirstPok(this.handCardLayout.children);
			case 1:
				return DdzManager.rule.getDanzhang(this.handCardLayout.children, num, MinNum, isKtips);
			case 2:
				return DdzManager.rule.getDuizi(this.handCardLayout.children, num, MinNum, true);
			case 3:
				return DdzManager.rule.getSanTiao(this.handCardLayout.children, num, MinNum, true);
			case 4:
				return DdzManager.rule.getSanDaiYi(this.handCardLayout.children, num, MinNum);
			case 5:
				return DdzManager.rule.getSanDaiYidui(this.handCardLayout.children, num, MinNum);
			case 6:
				return DdzManager.rule.getShunZi(this.handCardLayout.children, num, MinNum, true);
			case 7:
				return DdzManager.rule.getLiandui(this.handCardLayout.children, num, MinNum);
			case 8:
				return DdzManager.rule.getLianSan(this.handCardLayout.children, num, MinNum, true);
			case 9:
				return DdzManager.rule.getFeijiDaiEr(this.handCardLayout.children, num, MinNum);//3334445566
			case 10:
				return DdzManager.rule.getFeiJiDaiErDui(this.handCardLayout.children, num, MinNum);//333444555
			case 11:
				return DdzManager.rule.getSiDaiEr(this.handCardLayout.children, num, MinNum);
			case 12:
				return DdzManager.rule.getSiDaiDui(this.handCardLayout.children, num, MinNum, true);
			case 13:
				return DdzManager.rule.getSiDaiErDui(this.handCardLayout.children, num, MinNum, true);
			case 14:
				return DdzManager.rule.getZhaDan(this.handCardLayout.children, 4, MinNum, true);
			case 15:
				return DdzManager.rule.getWangZha(this.handCardLayout.children);

		}
	},

	getTipsArray: function (type, length, minNum) {
		let TipsArray = [];

		if (type == 0) {
			let Array = this.getTipsCardType(1, 1, 2, true, type);
			if (Array.length > 0) {
				for (var i = 0; i < Array.length; i++) {
					let temp = Array[i];
					TipsArray.push(temp);
				}
			}
			for (var t = 1; t <= 15; t++) {
				let tempArr = this.getTipsCardType(t, this.handCardLayout.childrenCount, 2, true, type);

				if (t == 6 || t == 7 || t == 8 || t == 9 || t == 10) {
					if (t == 6) {
						for (var l = 5; l <= 12; l++) {
							tempArr = this.getTipsCardType(t, l, 2, true, type);
							if (tempArr.length > 0) {
								for (var i = 0; i < tempArr.length; i++) {
									let temp = tempArr[i];
									TipsArray.push(temp);
								}
							}
						}
					}
					if (t == 7) {
						// cc.log("liandui ====================")
						for (var w = 6; w <= 20; w = w + 2) {
							tempArr = this.getTipsCardType(t, w, 2, true, type);
							if (tempArr.length > 0) {
								for (var i = 0; i < tempArr.length; i++) {
									let temp = tempArr[i];
									TipsArray.push(temp);
								}
							}
						}
					}
					if (t == 8) {
						// cc.log("liansan ====================")
						for (var z = 6; z <= 18; z = z + 3) {
							tempArr = this.getTipsCardType(t, z, 2, true, type);
							if (tempArr.length > 0) {
								for (var i = 0; i < tempArr.length; i++) {
									let temp = tempArr[i];
									TipsArray.push(temp);
								}
							}
						}
					}

					tempArr = this.getTipsCardType(t, 0, 2, true, type);
				}

				if (tempArr.length > 0) {
					for (var i = 0; i < tempArr.length; i++) {
						let temp = tempArr[i];
						TipsArray.push(temp);
					}
				}
			}

			TipsArray = this.JudgeLastCard(TipsArray);

			return TipsArray
		}

		else if (type < 14) {
			let Array1 = this.getTipsCardType(type, length, minNum, true, type);
			if (!!Array1) {
				if (Array1.length > 0) {
					for (var i = 0; i < Array1.length; i++) {
						let temp = Array1[i];
						TipsArray.push(temp);
					}
				}
			}

			// 4张炸弹检查
			let Array2 = this.getTipsCardType(14, 4, 2, true, type);
			if (Array2.length > 0) {
				for (var i = 0; i < Array2.length; i++) {
					let temp = Array2[i];
					TipsArray.push(temp);
				}
			}
			let Array3 = this.getTipsCardType(15, 2, 2, true, type);
			if (Array3.length > 0) {
				for (var i = 0; i < Array3.length; i++) {
					let temp = Array3[i];
					TipsArray.push(temp);
				}
			}

		}
		else if (type == 14) {
			let Array1 = this.getTipsCardType(14, 4, minNum, true, type);
			if (Array1.length > 0) {
				for (var i = 0; i < Array1.length; i++) {
					let temp = Array1[i];
					TipsArray.push(temp);
				}
			}
			let Array3 = this.getTipsCardType(15, 2, 2, true, type);
			if (Array3.length > 0) {
				for (var i = 0; i < Array3.length; i++) {
					let temp = Array3[i];
					TipsArray.push(temp);
				}
			}
			return TipsArray

		}


		return TipsArray;
	},
	judgeISOUTCARD: function (type, selectArray, length, MinNum, Rtype) {
		switch (parseInt(type)) {
			case 1:
				return DdzManager.rule.judgeDanZhang(selectArray, 1, MinNum);
				break;
			case 2:
				return DdzManager.rule.judgeDuizi(selectArray, 2, MinNum);
				break;
			case 3:
				return DdzManager.rule.judgeSanTiao(selectArray, 3, MinNum);
				break;
			case 4:
				return DdzManager.rule.judgeSanDaiYi(selectArray, 4, MinNum);
				break;
			case 5:
				return DdzManager.rule.judgeSanDaiYiDui(selectArray, 5, MinNum);
				break;
			case 6:
				return DdzManager.rule.judgeShunzi(selectArray, selectArray, length, MinNum);
				break;
			case 7:
				return DdzManager.rule.judgeLianDui(selectArray, length, MinNum);
				break;
			case 8:
				return DdzManager.rule.judgeLianSan(selectArray, length, MinNum);
				break;
			case 9:
				return DdzManager.rule.judgeFeijiDaiEr(selectArray, length, MinNum);
				break;
			case 10:
				return DdzManager.rule.judgeFeijiDaiErDui(selectArray, length, MinNum);
				break;
			case 11:
				return DdzManager.rule.judgeSiDaiEr(selectArray, 6, MinNum);
				break;
			case 12:
				return DdzManager.rule.judgeSiDaiYiDui(selectArray, 6, MinNum);
				break;
			case 13:
				return DdzManager.rule.judgeSiDaiErDui(selectArray, 8, MinNum);
				break;
			case 14:
				return DdzManager.rule.judgeZhaDan(selectArray, 4, MinNum);
				break;
			case 15:
				return DdzManager.rule.judgeWangZha(selectArray);
				break;
		}
	},

	judgeCanOutCard: function (type, selectArray, length, num) {
		var tempType = false;
		if (type == 0) {
			for (var i = 15; i >= 1; i--) {
				tempType = this.judgeISOUTCARD(i, selectArray, selectArray.length, 2, type);
				if (tempType) {
					// cc.log("=================可以出的牌型:",i);
					// if (i == 9) {
					//     tempType = this.judgeISOUTCARD(13, selectArray, selectArray.length, 2, type);
					//     if (tempType) {
					//         cc.log("=================可以出的牌型:",13);
					//         return 13;
					//     } else {
					//         return i;
					//     }
					// } else
					if (i == 9) {
						tempType = this.judgeISOUTCARD(8, selectArray, selectArray.length, 2, type);
						if (tempType) {
							// cc.log("=================可以出的牌型:",8);
							return 8;
						} else {
							return i;
						}
					} else {
						return i;
					}

				}
			}
		} else if (type < 14) {
			tempType = this.judgeISOUTCARD(type, selectArray, length, num);
			if (tempType) {
				return type;
			}
			tempType = this.judgeISOUTCARD(14, selectArray, 4, 2)
			if (tempType) {
				return 14;
			}
			tempType = this.judgeISOUTCARD(15, selectArray, 2, 2)
			if (tempType) {
				return 15;
			}

			return tempType;

		} else if (type = 14) {
			tempType = this.judgeISOUTCARD(14, selectArray, 4, num);
			if (tempType) {
				return 14;
			}
			tempType = this.judgeISOUTCARD(15, selectArray, 2, 2)
			if (tempType) {
				return 15;
			}
			return tempType;

		} else {
			return 0;
		}
		// else if (this.judgeISOUTCARD(type, selectArray, length, num, type)) {
		//     return type;
		// }
		// if (type < 14) {
		//     for (var i = 15; i >= 14; i--) {
		//         if (this.judgeISOUTCARD(i, selectArray, selectArray.length, 2, type)) {
		//             return i;
		//         }
		//     }
		//     return 0;
		// }else if (type = 14) {
		//     if (this.judgeISOUTCARD(15, selectArray, selectArray.length, 2, type)) {
		//         return 15;
		//     }
		//     return 0;
		// }
		// return 0;
	},
	setRoomType: function (roomType) {
		this.roomType = roomType;
	},


});
