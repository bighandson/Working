var config = require('Config');
var LoadGame = require('LoadGame');
var ShopDui = require('ShopDui');
cc.Class({
	extends: cc.Component,

	properties: {
		quan: cc.Label,
		btnView: cc.Node,
		cellView: cc.Node,
		tips: cc.Node,
	},

	// use this for initialization
	onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
		});
		GlobEvent.on('quan_change',this.quanChange.bind(this));
		this.init()
	},
	init: function () {
		let self = this;
		ShopDui.getDuiList('', function (err, data) {
			if (err) {
				cc.log(err)
				return
			}
			self.goodslist =  data.results[0].goodslist;
			self.quan.string = data.results[0].accountinfo.ye;
			cc.loader.loadRes('hall/shopDui/btnItem', function (err, prefab) {
				if (err) {
					cc.log(err);
					return;
					/****xxxx***aaaa****bbbb*****cccc****dddd****/
				}
				let lei = '';
				let num = 0;
				for (let i = 0; i < data.results[0].goodslist.length; i++) {
					if (data.results[0].goodslist[i].splb != lei) {
						lei = data.results[0].goodslist[i].splb;
						let node = cc.instantiate(prefab);
						node.parent = self.btnView;
						node.index = num;
						node.getChildByName('Background').getChildByName('title').getComponent(cc.Label).string = data.results[0].goodslist[i].splbmc
						node.getChildByName('checked').getChildByName('title1').getComponent(cc.Label).string = data.results[0].goodslist[i].splbmc
						node.on(cc.Node.EventType.TOUCH_START, function (event) { self.choose(node.index) });
						num++
					}
				}
				self.choose(0)
			})
		})
	},
	choose: function (index) {
		cc.log(index)
		let self = this;
		self.cellView.removeAllChildren(true)
		for (let i = 0; i < self.btnView.children.length; i++) {
			self.btnView.children[i].getChildByName('checked').active = false;
			if (index == i) {
				self.btnView.children[i].getChildByName('checked').active = true;
				let leib = self.btnView.children[i].getChildByName('checked').getChildByName('title1').getComponent(cc.Label).string;
				cc.loader.loadRes('hall/shopDui/duihuan', function (err, prefab) {
					if (err) {
						cc.log(err);
						return;
						/****xxxx***aaaa****bbbb*****cccc****dddd****/
					}
				  let res = 	self.goodslist.filter(item => item.splbmc == leib )
					cc.log(res)
					let zuanshi = 0;
					let jinbi = 0;
					res.forEach(function(item,index){
						let node = cc.instantiate(prefab);
						node.parent = self.cellView;
						node.spbh = item.spbh;
						node.getChildByName('name').getComponent(cc.Label).string = item.spmc
						node.getChildByName('content').getChildByName('num').getComponent(cc.Label).string = item.dhje;
						node.on(cc.Node.EventType.TOUCH_END, function (event) { self.duihuan(item) });

						if(item.lqfs == 1){
							if(item.zhlx == 4){
								zuanshi++
								getSpriteFrameByUrl('hall/shop/texture/zuanshi'+zuanshi, function (err, spriteFrame) {
									if (err) return;
									node.getChildByName('shop').getComponent(cc.Sprite).spriteFrame = spriteFrame;
								});
							}else{
								jinbi++
								getSpriteFrameByUrl('hall/shop/texture/jinbi'+jinbi, function (err, spriteFrame) {
									if (err) return;
									node.getChildByName('shop').getComponent(cc.Sprite).spriteFrame = spriteFrame;
								});
							}
						}else{
							loadImg(item.sppic, function (err, spriteFrame) {
								if (err) {
									cc.log(err)
									return
								}
								node.getChildByName('shop').getComponent(cc.Sprite).spriteFrame = spriteFrame;
							});
						}

					})
				})
			}
		}
	},
	duihuan:function(spxq){
	    let self = this;
	    loadPrefab("hall/shopDui/spxiangqing", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
			module.getComponent('spxiangqing').initData(spxq,self.quan.string);
		});
// 		let self = this;
// 		if(dhje>this.quan.string){
// 			showAlertBox('礼券不足')
// 			return
// 		}
// 		ShopDui.Duihuan(spbh,'',function (err,data) {
// 			if(err){
// 				cc.log(err)
// 				showAlertBox(data)
// 				return
// 			}
// 			cc.log(data.results[0])
// 			showAlertBox('兑换成功')
// 			if(data.results[0].accountlist){
// 				UserCenter.setList(data.results[0].accountlist)
// 			}
// 			GlobEvent.emit('update_UserCenter')
// 			self.quan.string = data.results[0].lqinfo.ye;
// 		})
	},
	dizhiClick:function(){
		showLoadingAni()
		loadPrefab("hall/shopDui/dizhiguanli", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},
	jiluClick:function(){
		showLoadingAni()
		loadPrefab("hall/shopDui/jilu", function (module) {
			hideLoadingAni()
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		});
	},
	quanChange: function (data) {
	    this.quan.string = data;
	},

	//关闭界面
	onclose: function () {
		this.node.removeFromParent(true);
	},
    
    onDestroy: function () {
        GlobEvent.removeAllListeners('quan_change');
    }
    
	,
});
