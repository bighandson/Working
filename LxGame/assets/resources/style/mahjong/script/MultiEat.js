/**
 * Created by Ximena on 2017/5/11.
 */

const MJCardResource = require('MJCardResource');

cc.Class({
	extends: cc.Component,
	properties: {
		choiceLayer1: cc.Node,
		choiceLayer2: cc.Node
	},
	onLoad: function () {
	
	},
	
	onCancel: function () {
		let ev = new cc.Event.EventCustom('DO_CANCEL', true);
		this.node.dispatchEvent(ev);
	},
	
	showEat: function (eatArrs) {
		cc.log('showEat : ', eatArrs);
		this.node.active = true;
		let len = eatArrs.length;
		this.opArr = eatArrs;
		let layers1 = this.choiceLayer1.children;
		let layers2 = this.choiceLayer2.children;
		for (let i = 0; i < 6; i++) {
			layers1[i].active = false;
			layers2[i].active = false;
		}
		this.choiceLayer1.active = true;
		
		for (let i = 0; i < len; i++) {
			if (i <= 5) {
				layers1[i].active = true;
				layers1[i].removeAllChildren(true);
				this._createEat(layers1[i], this.opArr[i]);
			} else {
				this.choiceLayer2.active = true;
				layers2[i-6].active = true;
				layers2[i-6].removeAllChildren(true);
				this._createEat(layers2[i-6], this.opArr[i]);
			}
			
		}
	},
	
	_createEat: function (layer, eat) {
			for (let i = 0; i < eat.pais.length; i++) {
				let pai = eat.pais[i];
				let frame = MJCardResource.getInHandImageByChair(0, pai);
				if (frame) {
					let node = new cc.Node();
					let sprite = node.addComponent(cc.Sprite);
					sprite.spriteFrame = frame;
					node.parent = layer;
				}
			}
		}
	
	,
	
	/**
	 * 多个吃的回调
	 * @param event
	 * @param index
	 */
	onEatsClick: function (event, index) {
		let i = parseInt(index);
		let op = this.opArr[i];
		
		let ev = new cc.Event.EventCustom('MULTI_EAT', true);
		ev.setUserData(op);
		this.node.dispatchEvent(ev);
		this.hide();
	}
	,
	
	hide: function () {
		this.node.active = false;
	}
})
;
