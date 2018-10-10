var Dizhi = require('Dizhi')
cc.Class({
	extends: cc.Component,

	properties: {
		list:cc.Node,
		ed:cc.SpriteFrame,
		ned:cc.SpriteFrame
	},

	// use this for initialization
	onLoad: function () {
		let self = this;
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
		});
		GlobEvent.on('Dizhixiu',function () {
			self.init();
		})
		this.init()
	},

	init: function () {
		let self = this;
		showLoadingAni()
		Dizhi.getDzList('', function (err, data) {
			if (err) {
				cc.log(err, data)
				hideLoadingAni()
				return
			}
			cc.log(data.results)
			hideLoadingAni()
			for(let i = 0; i<self.list.children.length-1;i++){
				if(data.results[i]){
					self.list.children[i].active = true
					self.list.children[i].getChildByName('name').getComponent(cc.Label).string =data.results[i].xm+'      '+ data.results[i].sjhm
					let code = 	data.results[i].addrcode;
					let msg = area[code.substr(0,2)].name+area[code.substr(0,2)].content[code.substr(2,2)].name+area[code.substr(0,2)].content[code.substr(2,2)].content[code.substr(4,2)].name
					self.list.children[i].getChildByName('dizhi').getComponent(cc.Label).string = msg+data.results[i].addr;
					self.list.children[i].xh = data.results[i].xh;
					self.list.children[i].code = data.results[i].addrcode;
					self.list.children[i].addr = data.results[i].addr;
					if(data.results[i].lastuseaddr == 1){
						self.list.children[i].getComponent(cc.Sprite).spriteFrame = self.ed;
					}else {
						self.list.children[i].getComponent(cc.Sprite).spriteFrame = self.ned;
					}
				}else{
					self.list.children[i].active = false
				}
			}

		})
	},
	choose:function(){
		let self = this;
		for(let i = 0; i<self.list.children.length-1;i++){
			self.list.children[i].getChildByName('touch').on(cc.Node.EventType.TOUCH_START, function (event) {
				self.setMorenDizhi(self.list.children[i].xh,function () {
					GlobEvent.emit('Dizhixiu');
					self.onclose();
				})

			});
		}
	},

	addDIzhi:function () {
		loadPrefab("hall/shopDui/xiugai", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},
	changeDIzhi:function (event,num) {
		showLoadingAni()
		let self = this;
		loadPrefab("hall/shopDui/xiugai", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
			let data = {
				xh :self.list.children[num].xh,
				code :self.list.children[num].code,
				addr : self.list.children[num].addr,
				msg :self.list.children[num].getChildByName('name').getComponent(cc.Label).string
			}
			module.getComponent('xiugaiScript').init(data)
		});
	},
	setMorenDizhi:function(xh,cb){
		cc.log(xh)
		Dizhi.setMoren(xh,'',function (err,data) {
			if(err){
				cc.log(err)
				showAlertBox(data)
				return
			}
			cc.log('修改默认',data)
			cb()
		})
	},
	onclose: function () {
		this.node.removeFromParent(true);
	},
});
