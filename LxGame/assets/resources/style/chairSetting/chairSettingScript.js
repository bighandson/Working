var LoadGame = require('LoadGame')
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
		jeToggle: cc.Toggle,
		mimaToggle: cc.Toggle,
		minJe: cc.Label,
		maxJe: cc.Label,
		miMa: cc.Label,
		promoter: cc.Node
	},

	// use this for initialization
	onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, function () {
		});
	},
	// jiCi : function (gameScript) {
	//
	//     this.gameScript =  gameScript
	//     cc.log(this.gameScript.jici)
	// },
	init: function (gameid) {
		this.gameid = gameid;

		let message = JSON.parse(cc.sys.localStorage.getItem('setMoney' + gameid)) || {};

		if (!!message.minMoney && message.minMoney < 10000 || !!message.maxMoney && message.maxMoney < 10000) {
			message.minMoney = 0;
			message.maxMoney = 0;
			cc.sys.localStorage.setItem('setMoney' + this.gameid, JSON.stringify(message));
		}
		cc.log(message)
		this.jeToggle.isChecked = message.jeToggle || true;
		this.mimaToggle.isChecked = message.miMaToggle || true;
		cc.log(message.minMoney, message.maxMoney)
		this.minJe.string = message.minMoney / 10000 || 0;
		this.maxJe.string = message.maxMoney / 10000 || 0;
		this.miMa.string = message.mima || ''
		this.promoter.getComponent('PromoterPorpBox').setPromoter(4)
	},
	// 确认
	onClickOK: function () {
		// this.gameScript.jici = true
		if (this.jeToggle.isChecked) {
			this.min = this.minJe.string * 10000 || 0;
			this.max = this.maxJe.string * 10000 || 0;
		} else {
			this.min = 0;
			this.max = 0;
		}

		if (this.mimaToggle.isChecked) {
			this.mima = this.miMa.string || '';
		} else {
			this.mima = '';
		}
		let message = {
			jeToggle: this.jeToggle.isChecked,
			miMaToggle: this.mimaToggle.isChecked,
			minMoney: this.min || 0,
			maxMoney: this.max || 0,
			mima: this.mima || '',
		}
		cc.sys.localStorage.setItem('setMoney' + this.gameid, JSON.stringify(message));
		this.node.removeFromParent(true);
	},
	// 分取消
	onClickCancel: function () {
		this.node.removeFromParent(true);
	},
});
