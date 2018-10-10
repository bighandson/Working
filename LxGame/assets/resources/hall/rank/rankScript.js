var Rank = require('Rank');
var Friend = require('Friend')
cc.Class({
	extends: cc.Component,
	properties: {
		miniContent: cc.Node,
		Content: cc.Node,
		place: {
			default: [],
			type: cc.SpriteFrame
		},
	},

	// use this for initialization
	onLoad: function () {
		let self = this;
		self.node.getChildByName('rank').opacity =0;
		self.node.getChildByName('rank').active = false;
		this.onClickCaiSai(null, 1)
		Rank.getWealth('', function (err, data) {
			if (err) {
				cc.log(err)
				return
			}
			cc.log(data.results)
			for (let i = 0; i < self.miniContent.children.length; i++) {
				if (data.results[i]) {
					self.miniContent.children[i].active = true;
					let userImage = data.results[i].tx;
					if (!isUrl(userImage)) {
						let sexs = data.results[i].xb == 1 ? 'man' : 'woman';
						userImage = 'commonRes/other/' + sexs;
					}
					loadHead(userImage, function (err, spriteFrame) {
						if (err) {
							cc.log(err)
							return
						}
						self.miniContent.children[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
					});

				} else {
					self.miniContent.children[i].active = false;
				}
			}
		})

	},
	onClickOut: function () {
		cc.log('onClickOut')
		let self = this;
		this.node.runAction(cc.moveTo(0.5, cc.v2({x: 421})))
		this.node.getChildByName('rankmini').runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(function () {
			self.node.getChildByName('rankmini').active = false;
			cc.log(self.node.getChildByName('rankmini'))
		})))
		self.node.getChildByName('rank').active = true;
		this.node.getChildByName('rank').runAction(cc.fadeIn(0.5))
		// this.onClickCaiSai(null, 1)
	},
	onClickIn: function () {
		cc.log('onClickIn')
		let self = this;
		this.node.runAction(cc.moveTo(0.5, cc.v2({x: 804})))
		this.node.getChildByName('rank').runAction(cc.sequence(cc.fadeOut(0.5), cc.callFunc(function () {
			self.node.getChildByName('rank').active = false;
			cc.log(self.node.getChildByName('rankmini'))
		})))
		self.node.getChildByName('rankmini').active = true;
		this.node.getChildByName('rankmini').runAction(cc.fadeIn(0.5))
	},

	haoyou:function(userid){
		if(userid == UserCenter.getUserInfo().userid){
			return
		}
		let self = this;

		Friend.SceachFriends(userid,'',function (err,data) {
			if (!err) {
				showLoadingAni()
				let info = data.results[0]

				loadPrefab("hall/friendInfo/friendInfo",function (module) {

					module.getComponent('friendInfoScript').setData(info,function (infos) {
						cc.log('addFirendIntoView ==== ',infos)
						self.addFirendIntoView(infos)
					})

					module.x = cc.winSize.width / 2;
					module.y = cc.winSize.height / 2;
					module.parent = cc.director.getScene();

					module.getChildByName('box').scale = 0
					module.getChildByName('box').getChildByName('title').active = false;
					module.getChildByName('box').getChildByName('wanjia').active = true;
					module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))

					hideLoadingAni()
				});

			} else {
				showAlertBox(data)
			}
		})
	},
	onClickCaiSai: function (enevt, num) {
		this.Content.removeAllChildren(true)
		let self = this;
		if (num == 1) {
			Rank.getWealth('', function (err, data) {
				if (err) {
					cc.log(err)
					return
				}
				cc.log(data.results)
				cc.loader.loadRes('hall/rank/rankitem', function (err, prefab) {
					if (err) {
						cc.log(err);
						return;/****xxxx***aaaa****bbbb*****cccc****dddd****/
					}
					for (let i = 0; i < data.results.length; i++) {
						let node = cc.instantiate(prefab);
						node.parent = self.Content;
						// cc.log(data.results[i])
						node.id = data.results[i].djpaihangxx.userid
						let userImage = data.results[i].tx;
						node.on(cc.Node.EventType.TOUCH_END, function (event) { self.haoyou(node.id) });
						if (!isUrl(userImage)) {
							let sexs = data.results[i].xb == 1 ? 'man' : 'woman';
							userImage = 'commonRes/other/' + sexs;
						}
						loadHead(userImage, function (err, spriteFrame) {
							if (err) {
								cc.log(err)
								return
							}
							node.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
						});
						node.getChildByName('quan').active = false;
						node.getChildByName('name').getComponent(cc.Label).string = formatName(data.results[i].nc,10)
						node.getChildByName('num').getComponent(cc.Label).string = data.results[i].djpaihangxx.sl
						if(i<3){
							node.getChildByName('place').getComponent(cc.Sprite).spriteFrame = self.place[i];
							node.getChildByName('mingci').active = false;
						}else{
							node.getChildByName('place').active = false;
							node.getChildByName('mingci').getComponent(cc.Label).string = i+1;
						}
					}
				});

			})
		} else {
			Rank.getSaishi('', function (err, data) {
				if (err) {
					cc.log(err)
					return
				}
				cc.log(data.results)
				cc.loader.loadRes('hall/rank/rankitem', function (err, prefab) {
					if (err) {
						cc.log(err);
						return;
						/****xxxx***aaaa****bbbb*****cccc****dddd****/
					}
					for (let i = 0; i < data.results.length; i++) {
						let node = cc.instantiate(prefab);
						node.parent = self.Content;
						node.id = data.results[i].zblqfhz.zh
						let userImage = data.results[i].tx;
						node.on(cc.Node.EventType.TOUCH_END, function (event) { self.haoyou(node.id) });
						if (!isUrl(userImage)) {
							let sexs = data.results[i].xb == 1 ? 'man' : 'woman';
							userImage = 'commonRes/other/' + sexs;
						}
						loadHead(userImage, function (err, spriteFrame) {
							if (err) {
								cc.log(err)
								return
							}
							node.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
						});
						node.getChildByName('jinbi').active = false;
						node.getChildByName('name').getComponent(cc.Label).string = formatName(data.results[i].nc,10)
						node.getChildByName('num').getComponent(cc.Label).string = data.results[i].zblqfhz.ye
						if (i < 3) {
							node.getChildByName('place').getComponent(cc.Sprite).spriteFrame = self.place[i];
							node.getChildByName('mingci').active = false;
						} else {
							node.getChildByName('place').active = false;
							node.getChildByName('mingci').getComponent(cc.Label).string = i + 1;
						}
					}
				});
			})
		}
	},


});
