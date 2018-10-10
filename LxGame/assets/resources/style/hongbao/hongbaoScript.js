const MJCommand = require('MJCommand');
cc.Class({
	extends: cc.Component,
	
	properties: {
		miaoshu : cc.Label,
		share:cc.Node,
		money : cc.Label
		
	},
	
	// use this for initialization
	onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, function () {
		});
		this.share.active = false;
	},
	init: function (rule, user, huInfo,money) {
		this.rule = rule;
		let self = this;
		cc.log(rule.roomType)
		this.game = this.rule.game;
		
		let huString = '';
		let hutype1 = huInfo.data.hutype1;
		for (let hukey in self.game.hutype1) {
			if (hutype1 & hukey) {
				huString += self.game.hutype1[hukey] + ' ';
			}
		}
		// if (!!self.game.hutype2) {
		// 	let hutype2 = self.huInfo.data.hutype2;
		// 	for (let hukey2 in self.game.hutype2) {
		// 		if (hukey2 & hutype2) {
		// 			huString += self.game.hutype2[hukey2] + ' ';
		// 		}
		// 	}
		// }
		
		self.miaoshu.string = '恭喜你胡了"'+  self._getHuFlag(huInfo.data.huflag) + huString +'" 获得红包';
		
		this.share.getChildByName('name').getComponent(cc.Label).string = user.nick;
		this.share.getChildByName('id').getComponent(cc.Label).string = "ID:"+ user.userid;
		cc.log(huString)
		this.share.getChildByName('hu').getComponent(cc.RichText).string ="<color=#000000>刚在乐享棋牌——"+this.game.name+"胡了一副</color><color=#ff5c24>"+self._getHuFlag(huInfo.data.huflag)+huString+"</color>";
		this.share.getChildByName('money').getComponent(cc.Label).string = money/100;
		this.money.string = money/100;
		let tx = user.userImage;
		let sexs = user.sex == 1 ? 'man' : 'woman';
		if (!isUrl(tx)) {
			tx = 'commonRes/other/' + sexs;
		}
		getSpriteFrameByUrl(tx, function (err, spriteFrame) {
			if (err) {
				cc.log(err);
				return;
			}
			self.share.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
			self.share.getChildByName('head').setContentSize(275, 275);
		});
		
	},


// 关闭
	onclose: function () {
		this.node.removeFromParent(true);
	}
	,
	
	/**
	 * 分享到微信
	 * @param event
	 * @param to 0 : 微信好友 1 ： 微信朋友圈
	 */
	onShareToWXScene: function (event, to) {
		var self = this;
		if(!cc.sys.isNative){
			return
		}
		this.share.active = true;
		if (!!self._isShareing) return;
		self._isShareing = true;
		/****xxxx***aaaa****bbbb*****cccc****dddd****/
		var shareTo = parseInt(to);
		var prePos = this.share.getPosition();
		this.share.setPosition(cc.p(0, 350));
		captureScreen(this.share, cc.size(cc.director.getVisibleSize().width, 1400), function (err, path) {
			self._isShareing = false;
			self.share.setPosition(prePos);
			self.share.active = false;
			if (err) {
				cc.log(err);
				
				return;
			}
			wxapi.sendImageToWxReq(path, shareTo);
		});
	}
	,
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
	
	
})
;
