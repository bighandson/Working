var ShopDui = require('ShopDui')
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
		view: cc.Node,
	},

	// use this for initialization
	onLoad: function () {
		let self = this;
		this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
		});
		showLoadingAni()
		ShopDui.getDuiEdList('', function (err, data) {
			if (err) {
				showAlertBox(data)
				return
			}
			hideLoadingAni()
			self.initdata(data.results)

		})
	},

	onClose: function () {
		this.node.removeFromParent(true);
	},

	initdata: function (data) {
		cc.log('initdata====', data)
		let self = this


		let loadCell = function (index) {

			if (index > data.length - 1) {
				return
			}
			let info = data[index]

			loadPrefab("hall/shopDui/jlcell", function (module) {
				module.parent = self.view

				module.getChildByName('name').getComponent(cc.Label).string = info.spmc
				module.getChildByName('time').getComponent(cc.Label).string = toData(info.djrq)
				// module.getChildByName('rank').getComponent(cc.Label).string = info.mc
				module.getChildByName('jl').getComponent(cc.Label).string = info.dhje
				module.getChildByName('wlinqu').active = info.zt == 0
				module.getChildByName('ylinqu').active = info.zt == 2
				module.getChildByName('guoqi').active = info.zt == 3
				if(info.lqfs == '3'){
					module.getChildByName('chakan').active = info.zt == 0;
					if(module.getChildByName('chakan').active){
						module.getChildByName('chakan').on(cc.Node.EventType.TOUCH_END, function (event) {
							//  BY Amao  二维码相关
							showLoadingAni()
							loadPrefab("style/qrcode/qrcode", function (module1) {
								hideLoadingAni()

								module1.x = cc.winSize.width / 2;
								module1.y = cc.winSize.height / 2;
								module1.parent = cc.director.getScene();

								module1.getComponent('qrcodeS').initQrcode({'url': info.qrcodeurl, 'name': info.spmc},1)

								module1.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
							});
						});
					}
				}else if(info.lqfs == '4'){
					module.getChildByName('xq').active = (info.zt == 0||info.zt == 1);
					if(module.getChildByName('xq').active){
						module.getChildByName('xq').on(cc.Node.EventType.TOUCH_END, function (event) {
							showLoadingAni()
							loadPrefab("hall/shopDui/spxiangqing", function (module1) {
								hideLoadingAni()
								module1.x = cc.winSize.width / 2;
								module1.y = cc.winSize.height / 2;
								module1.parent = cc.director.getScene();
								module1.getComponent('spxiangqing').initduied(info.lsh)

							});
						});
					}

				}

				// module.getChildByName('xq').active = info.zt == 4




				loadCell(index + 1)
			})
		}

		loadCell(0)
	},

});
