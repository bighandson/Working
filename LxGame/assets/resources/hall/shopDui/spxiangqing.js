var ShopDui = require('ShopDui');
var Dizhi = require('Dizhi')
cc.Class({
	extends: cc.Component,

	properties: {
		spjs: cc.Node,
		shxx: cc.Node,
		btn: cc.Button,
		num: cc.Label,
		dizhi: cc.Label,
		dizhiBtn:cc.Button,
		kuaidi:cc.Label,
		chongzhi:cc.Node,
		phoneNum:cc.Label
	},


	onLoad: function () {
		let self = this;
		this.node.active = false;
		GlobEvent.on('update_RZ', this.updateUsercenter.bind(this));
		GlobEvent.on('Dizhixiu', function () {
			self.showdizhi();
		})
	},
	BDphone:function(){
		loadPrefab("hall/renzhen/bdphone", function (module) {
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
			module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
		});
	},

	updateUsercenter: function () {
		if(UserCenter.getUserInfo().sjhm){
			this.phoneNum.string = UserCenter.getUserInfo().sjhm;
			this.phoneNum.node.parent.getComponent(cc.Button).interactable = false;
		}

	},
	initduied: function (lsh) {
		cc.log(lsh)
		let self = this;
		showLoadingAni()
		ShopDui.getDuiEdXq(lsh, '', function (err, data) {
			if (err) {
				showAlertBox(data);
				return
			}
			hideLoadingAni()
			cc.log(data.results)
			self.spjs.getChildByName('jieshao').children[0].getComponent(cc.Label).string = data.results[0].goodsinfo.spmc;
			self.spjs.getChildByName('jieshao').children[1].getComponent(cc.Label).string = data.results[0].goodsinfo.spms;
			self.spjs.getChildByName('quan').children[0].active = false;
			self.spjs.getChildByName('quan').children[1].getComponent(cc.Label).string = data.results[0].dhzt == '0'?'已下单':'已发货';

			loadImg(data.results[0].goodsinfo.sppic, function (err, spriteFrame) {
				if (err) {
					cc.log(err)
					return
				}
				self.spjs.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
			});

			self.node.active = true;
			self.btn.node.active = false;
			self.dizhiBtn.interactable = false;

			self.shxx.active = true;
			// self.chongzhi.active = splist.lqfs == 2;

			self.num.string = data.results[0].wlxx.xm + '      ' + data.results[0].wlxx.sjhm
			let code = data.results[0].wlxx.addrcode;
			let msg = area[code.substr(0, 2)].name + area[code.substr(0, 2)].content[code.substr(2, 2)].name + area[code.substr(0, 2)].content[code.substr(2, 2)].content[code.substr(4, 2)].name
			self.dizhi.string = msg + data.results[0].wlxx.wldz;
			self.kuaidi.node.active = 	(data.results[0].dhzt != '0')
			self.kuaidi.string = data.results[0].wlgsmc + '  单号：'+data.results[0].wlxx.wldh;
		})
	},

	initData: function (splist, quannum) {
		cc.log('商品详情', splist);
		let self = this;
		this.splist = splist;
		this.spjs.getChildByName('jieshao').children[0].getComponent(cc.Label).string = splist.spmc;
		this.spjs.getChildByName('jieshao').children[1].getComponent(cc.Label).string = splist.spms;
		this.spjs.getChildByName('quan').children[1].getComponent(cc.Label).string = splist.dhje;
		 if(splist.lqfs == 2){
			if(!!UserCenter.getUserInfo().sjhm){
				this.phoneNum.string = UserCenter.getUserInfo().sjhm;
				this.phoneNum.node.parent.getComponent(cc.Button).interactable = false;
			}

		}
		if (splist.lqfs == 1) {
			if (splist.zhlx == 4) {
				getSpriteFrameByUrl('hall/shop/texture/zuanshi' + 1, function (err, spriteFrame) {
					if (err) return;
					// 	zuanshi++
					self.spjs.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
				});
			} else {
				getSpriteFrameByUrl('hall/shop/texture/jinbi' + 1, function (err, spriteFrame) {
					if (err) return;
					// 	jinbi++
					self.spjs.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
				});
			}
		}  else {
			loadImg(splist.sppic, function (err, spriteFrame) {
				if (err) {
					cc.log(err)
					return
				}
				// cc.log(spriteFrame)
				self.spjs.children[0].getComponent(cc.Sprite).spriteFrame = spriteFrame;
				// cc.log(self.spjs.children[0])
			});
		}

		this.shxx.active = splist.lqfs == 4;
		this.chongzhi.active = splist.lqfs == 2;
		this.node.active = true;
		if (splist.dhje > quannum) {
			this.btn.interactable = false;
		}
		this.showdizhi();
	},
	showdizhi: function () {
		let self = this;
		Dizhi.getDzList('', function (err, data) {
			if (err) {
				cc.log(err, data)
				hideLoadingAni()
				return
			}
			cc.log(data.results)
			hideLoadingAni()
			for (let i = 0; i < data.results.length; i++) {
				if (data.results[i].lastuseaddr == 1) {
					self.xh = data.results[i].xh;
					self.num.string = data.results[i].xm + '      ' + data.results[i].sjhm
					let code = data.results[i].addrcode;
					let msg = area[code.substr(0, 2)].name + area[code.substr(0, 2)].content[code.substr(2, 2)].name + area[code.substr(0, 2)].content[code.substr(2, 2)].content[code.substr(4, 2)].name
					self.dizhi.string = msg + data.results[i].addr;
				}
			}

		})
	},

	changeDizhi: function () {
		showLoadingAni()
		let self = this;
		loadPrefab("hall/shopDui/dizhiguanli", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
			module.getComponent('dizhiguanliScript').choose()
		});
	},

	onduihuan: function () {
		cc.log(12321321)
		let self = this;
		let expend = '';
		if (this.shxx.active) {
			if (!this.xh) {

				showAlertBox('兑换实物,请先补充地址详情')
				return;
			} else {
				expend = JSON.stringify({xh: this.xh})
			}

		}

		if(this.chongzhi.active){
			if(!UserCenter.getUserInfo().sjhm){
				showAlertBox('兑换话费,请先绑定手机')
				return;
			}

		}

		ShopDui.Duihuan(this.splist.spbh, expend, function (err, data) {
			if (err) {
				cc.log(err)
				showAlertBox(data)
				return
			}
			cc.log(data.results[0])
			showAlertBox('兑换成功', function () {
				self.node.removeFromParent(true)
			})
			if (data.results[0].accountlist) {
				UserCenter.setList(data.results[0].accountlist)
			}
			GlobEvent.emit('update_UserCenter')
			GlobEvent.emit('quan_change', data.results[0].lqinfo.ye)
			cc.log('ye', data.results[0].lqinfo.ye)
// 			self.quan.string = data.results[0].lqinfo.ye;
		})
	},

	onclose: function () {
		this.node.removeFromParent(true);
	},

});
