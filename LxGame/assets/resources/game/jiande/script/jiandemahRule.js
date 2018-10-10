var MJRule = require('MJRule');
var MJType = require('MJType');
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE
var GamePlayer = require('GamePlayer');
const EATFLAG = Command.EATFLAG;

cc.Class({
	extends: MJRule,

	properties: {},

	// use this for initialization
	onLoad: function () {
		this._super();
		this._deqingEat = 0;
	},
	RCMD_Expend: function (data) {
		if (data.data.CMD == '1000') {
			this._deqingEat = data.data.PAI;
			this.setDeqingEat2(data.data.PAI);
			this.nextAction();
		} else {
			this._super(data);
		}
	},


	onCmdEatAction: function (chair, opCode, data) {
		cc.log('吃限制')
		this._super(chair, opCode, data);

		if (opCode != RCMD_ACTION.optEat || chair != 0) {         // chair == 0 是自己
			return;
		}
		// if (this.ruleFlag & 0x80) {

		this._lastOutPai = this.lastOutPai;    // 吃的牌
		// var blockPais = this._renders[0].blockPais;
		// if (blockPais.length > 2) return;
		this._pai1 = data.paiA;  // 自己手中的牌
		this._pai2 = data.paiB;
		if (Math.abs(this._pai2 - this._pai1) > 1) {
			this._deqingEat = this.isBD(this._lastOutPai) ? -1 : this._lastOutPai;
		} else {
			if (this._lastOutPai > this._pai1 && this._lastOutPai > this._pai2) {
				if ((!MJType.isSameFlower(this._pai1, this._pai1 - 1)) || (!MJType.isSameFlower(this._pai2, this._pai2 - 1))) {
					this._deqingEat = this.isBD(this._lastOutPai) ? -1 : this._lastOutPai;
				} else {
					this._deqingEat = this._lastOutPai;
					if (this._deqingEat % 9 == 3) {
						this._deqingEat2 = 0;
					} else {
						this._deqingEat2 = this.isBD(this._lastOutPai - 3) ? -1 : this._lastOutPai - 3;
					}

				}
			} else if (this._lastOutPai < this._pai1 && this._lastOutPai < this._pai2) {
				if ((!MJType.isSameFlower(this._pai1, this._pai1 + 1)) || (!MJType.isSameFlower(this._pai2, this._pai2 + 1))) {
					this._deqingEat = this.isBD(this._lastOutPai) ? -1 : this._lastOutPai;
				} else {
					this._deqingEat = this.isBD(this._lastOutPai) ? -1 : this._lastOutPai;
					if (this._deqingEat % 9 == 7) {
						this._deqingEat2 = 0;
					} else {
						this._deqingEat2 = this.isBD(this._lastOutPai + 3) ? -1 : this._lastOutPai + 3;
					}

				}

			}
		}
		// }else{
		//
		//     this._deqingEat
	},

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
				cc.log('出牌')
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
				if (data.userid == UserCenter.getUserID()) {
					this._deqingEat = (this._deqingEat == data.data.pai) ? 0 : this._deqingEat;
					this._deqingEat2 = (this._deqingEat2 == data.data.pai) ? 0 : this._deqingEat2;
					this.clearHandleCards();
				}
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

	},
	cannotOutCard: function (value, isGet) {
		cc.log('cannotOutCard', isGet);
		if (!this.ifXianzhi) {
			var canOut = this._super(value, isGet);
			if (this._deqingEat) {
				cc.log("this._deqingEat   " + this._deqingEat)
				canOut = (this._deqingEat == value);
			}
			// if (this._deqingEat2 && !canOut) {
			//     cc.log("this._deqingEat2   " + this._deqingEat2)
			//     canOut = (this._deqingEat2 == value);
			// }
			return canOut;
		} else {
			return !isGet;
		}
	},
	onCmdOutPai: function (chair, data) {
		this._super(chair, data);
		this._deqingEat = 0;
		this._deqingEat2 = 0;
	},
	setDeqingEat2: function () {
		let blockPais = this._renders[0].blockPais;
		var block = blockPais[blockPais.length - 1];
		if (block.blockFlag == EATFLAG.EAT_LEFT) {
			this._deqingEat2 = this._deqingEat + 3;
		} else if (block.blockFlag == EATFLAG.EAT_RIGHT) {
			this._deqingEat2 = this._deqingEat - 3;
		} else {
			this._deqingEat2 = 0;
		}

	},
	gameStart: function (masterid, baseMoney) {
		this.resetGame();
		this._deqingEat = 0;
		this._deqingEat2 = 0;
		this._isplaying = true;
		let seatid = GamePlayer.getSeatByUserid(masterid);
		let chair = this.getChairByUid(masterid);
		cc.log(this.youxirenshu)
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

		if ((this.ruleFlag & 0x07) == 0x01) {
			this.remainderPai--;
		} else {
			this.remainderPai--;
		}

	},


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

	getChairByUid: function (userid) {
		let seatid = GamePlayer.getSeatByUserid(userid);
		var chair = this.getChairBySeatId(seatid);
		if (this.roomType < 2) {
			if (!this.youxirenshu) {
				chair = this.getChairBySeatId(seatid);
			} else {
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
					break;
				case 0x02:
					chair = this.getChairBySeatId3(seatid);
					break;
				case 0x04:
					chair = this.getChairBySeatId(seatid);
					break;
			}
		}

		return chair;
	},
});
