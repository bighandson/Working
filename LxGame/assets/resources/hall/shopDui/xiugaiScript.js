var Dizhi = require('Dizhi');
cc.Class({
	extends: cc.Component,

	properties: {
		nameInput: cc.EditBox,
		phoneNumInput: cc.EditBox,
		dizhiInput: cc.EditBox,
		display: cc.Node,
		content: cc.Node,
		dizhi:{default: [],
			type: cc.Label
		}

	},

	// use this for initialization
	onLoad: function () {
		let self = this;
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
		});
		this.display.children[0].on(cc.Node.EventType.TOUCH_START, function (event) {
			self.display.active = false;
			cc.log(22222)
		});
	},
	init:function(data){
		this.data = data;
		this.nameInput.string = data.msg.split(' ')[0]
		this.phoneNumInput.string  = data.msg.split(' ')[data.msg.split(' ').length-1]
		this.dizhi[0].string = area[data.code.substr(0,2)].name
		this.dizhi[1].string = area[data.code.substr(0,2)].content[data.code.substr(2,2)].name
		this.dizhi[2].string = area[data.code.substr(0,2)].content[data.code.substr(2,2)].content[data.code.substr(4,2)].name
		this.dizhiInput.string =data.addr;
	},
	onQueren: function () {
		let self = this;
		showLoadingAni()
		let realname = this.nameInput.string;
		if (isChineseChar(realname) == false) {
			showAlertBox("您输入的姓名不正确，请重新输入");
			this.nameInput.string = "";
			return
		}
		let cellnumber = this.phoneNumInput.string;
		if (checkPhone(cellnumber) == false) {
			showAlertBox("您输入的手机号有误，请重新输入");
			this.phoneNumInput.string = "";
			return
		}
		let jutiDizhi = this.dizhiInput.string;
		if(jutiDizhi == ''){
			showAlertBox("具体地址不能为空");
			return
		}

		let code1 = '';
		let code = ''
		for(let item in area){
			if(~area[item].name.indexOf(self.dizhi[0].string)  ){
				code1 = item;
				code += item
			}
		}
		let code2 = '';
		for(let item in area[code1].content){
			if(~area[code1].content[item].name.indexOf(self.dizhi[1].string)  ){
				code2 = item;
				code += item
			}
		}
		let code3 = '';
		for(let item in area[code1].content[code2].content){
			if(~area[code1].content[code2].content[item].name.indexOf(self.dizhi[2].string)  ){
				code3 = item;
				code += item
			}
		}
		cc.log(realname,cellnumber,code,jutiDizhi)
		if(this.data){
			Dizhi.changeDzList(self.data.xh,realname,cellnumber,code,jutiDizhi,'',function (err,data) {
				if(err){
					cc.log(err,data)
					showAlertBox(data)
					return
				}
				hideLoadingAni()
				// showAlertBox(data.message)
				self.onclose()
				GlobEvent.emit('Dizhixiu')
			})
		}else{
			Dizhi.addDzList(realname,cellnumber,code,jutiDizhi,'',function (err,data) {
				if(err){
					cc.log(err,data)
					showAlertBox(data)
					return
				}
				hideLoadingAni()
				// showAlertBox(data.message)
				self.onclose()
				GlobEvent.emit('Dizhixiu')
			})
		}

	},
	onClickarea: function (event, num) {
		let self = this;
		self.display.active = false;
		cc.log('onClickarea')
		if (num == 0) {
			this.dizhi[0].string = '';
			this.dizhi[1].string = '';
			this.dizhi[2].string = '';
			this.content.parent.parent.x = -145;
			this.content.parent.parent.getComponent(cc.ScrollView).scrollToTop(0)
			this.display.active = true;
			this.content.removeAllChildren()
			cc.loader.loadRes('hall/shopDui/item', function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
				}
				cc.log(Object.keys(area))
				let arr = Object.keys(area).sort(function (a,b) {
					return a-b
				})

				for (let i = 0; i < arr.length; i++) {
					let node = cc.instantiate(prefab);
					node.parent = self.content;
					node.getChildByName('name').getComponent(cc.Label).string = area[arr[i]].name.substr(0,area[arr[i]].name.length-1);
					node.on(cc.Node.EventType.TOUCH_END, function (event) {
						cc.log(1232132)
						self.dizhi[0].string = node.getChildByName('name').getComponent(cc.Label).string;
						self.display.active = false;
					});
				}

			})
		}else if(num == 1){
			if(!this.dizhi[0].string){
				return
			}
			let code;
			for(let item in area){
				if(~area[item].name.indexOf(self.dizhi[0].string)  ){
					code = item;
				}
			}
			cc.log(code)
			this.dizhi[1].string = '';
			this.dizhi[2].string = '';
			this.content.parent.parent.x = -4;
			this.content.parent.parent.getComponent(cc.ScrollView).scrollToTop(0)
			this.display.active = true;
			this.content.removeAllChildren()
			cc.loader.loadRes('hall/shopDui/item', function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
				}
				// cc.log(area[code].content)

				let arr = Object.keys(area[code].content).sort(function (a,b) {
					return a-b
				})
				// cc.log(arr)
				for (let i = 0; i < arr.length; i++) {
					let node = cc.instantiate(prefab);
					node.parent = self.content;
					cc.log()
					node.getChildByName('name').getComponent(cc.Label).string = area[code].content[arr[i]].name.substr(0,area[code].content[arr[i]].name.length-1);

					node.on(cc.Node.EventType.TOUCH_END, function (event) {
						self.dizhi[1].string = node.getChildByName('name').getComponent(cc.Label).string;
						self.display.active = false;
					});
				}

			})

		}else {
			if(!this.dizhi[0].string){
				return
			}
			if(!this.dizhi[1].string){
				return
			}

			let code1 = '';
			for(let item in area){
				if(~area[item].name.indexOf(self.dizhi[0].string)  ){
					code1 += item;
				}
			}
			let code2 = '';
			for(let item in area[code1].content){
				if(~area[code1].content[item].name.indexOf(self.dizhi[1].string)  ){
					code2 += item;
				}
			}
			cc.log(code1,code2)
			this.dizhi[2].string = '';
			this.content.parent.parent.x = 161;
			this.content.parent.parent.getComponent(cc.ScrollView).scrollToTop(0)
			this.display.active = true;
			this.content.removeAllChildren()
			cc.loader.loadRes('hall/shopDui/item', function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
				}
				let arr = Object.keys(area[code1].content[code2].content).sort(function (a,b) {
					return a-b
				})


				for (let i = 0; i < arr.length; i++) {
					let node = cc.instantiate(prefab);
					node.parent = self.content;

					node.getChildByName('name').getComponent(cc.Label).string = area[code1].content[code2].content[arr[i]].name.substr(0,area[code1].content[code2].content[arr[i]].name.length-1);
					node.on(cc.Node.EventType.TOUCH_END, function (event) {
						self.dizhi[2].string = node.getChildByName('name').getComponent(cc.Label).string;
						self.display.active = false;
					});
				}

			})
		}
	},

	onclose: function () {
		this.node.removeFromParent(true);
	},
});
