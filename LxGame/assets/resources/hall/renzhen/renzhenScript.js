var User = require('User');
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
		nameInput: cc.EditBox,
		cardInput: cc.EditBox,
		phoneNumInput: cc.EditBox,
		yzmInput: cc.EditBox,
		time: cc.Node,
		getYZ: cc.Node
	},

	// use this for initialization
	onLoad: function () {
		this.node.on(cc.Node.EventType.TOUCH_START, function () {
		});
		if (this.time) {
			this.time.active = false;
		}


	},

	// 返回大厅
	onclose: function () {
		this.node.removeFromParent(true);
	},


	initData: function (callback) {
		this.bz_callBack = callback
		cc.log('------------------------2222222222-----------------------------', this.bz_callBack)
	},


	// 认证
	onSendRZ: function () {
		var self = this;
		if (!this.nameInput.string) {
			showAlert('姓名不能为空');
			return
		}

		if (!this.cardInput.string) {
			showAlert('身份证号码不能为空');
			return
		}

		User.submitRealName(this.nameInput.string, this.cardInput.string, '', function (err, result) {
			if (err) {
				cc.log(err);
				return;
			}
			if (!result.status) {
				showAlertBox(result.message);
				return;
			}
			cc.log(result)
			// 处理数据
			showAlertBox('实名认证成功');
			UserCenter.userInfo.rzzt = '01';

			self.node.removeFromParent();
			GlobEvent.emit('update_RZ')

		})
	},

	onidCardnameEnd: function () {
		let realname = this.nameInput.string;
		if (isChineseChar(realname) == false) {
			showAlertBox("您输入的姓名不正确，请重新输入");
			this.nameInput.string = "";
		}
	},


	onRealIDcardEnd: function () {
		let idnumber = this.cardInput.string;
		if (isIdCard(idnumber) == false) {
			showAlertBox("您输入的身份证号不存在，请重新输入");
			this.cardInput.string = "";
		}
	},
	//请求验证码
	onGetYzm: function () {
		var self = this;
		if (!!this.phoneNumInput.string) {
			this.getYZ.active = false;
			this.time.active = true;
			let daojishi = this.time.getChildByName('daojishi').getComponent(cc.Label)
			daojishi.string = 120;
			User.getyanzheng(self.phoneNumInput.string, 2, '', function (err, result) {
				if (err) {
					cc.log(err);
					return;
				}
				if (!result.status) {
					showAlertBox(result.message);
				}

			});
			this.schedule(this.daoJiShi, 1)
		}
	},


	daoJiShi: function () {
		let self = this;
		let time = this.time.getChildByName('daojishi').getComponent(cc.Label);
		time.string--;
		if (time.string == 0) {
			this.unschedule(self.daoJiShi);
			time.string = 120;
			this.time.active = false;
			this.getYZ.active = true;
		}

	},
	onCellNumberEnd: function () {
		let cellnumber = this.phoneNumInput.string;
		if (checkPhone(cellnumber) == false) {
			showAlertBox("您输入的手机号有误，请重新输入");
			this.phoneNumInput.string = "";
		}
	},
	//绑定
	onSendBD: function () {
		var self = this
		if (!this.phoneNumInput.string) {
			showAlert('手机号不能为空');
			return
		}
		if (!this.yzmInput.string) {
			showAlert('验证码不能为空');
			return
		}
		User.bindCellPhone(this.phoneNumInput.string, this.yzmInput.string, "", function (err, result) {
			if (err) {
				cc.log(err);
				return;
			}
			cc.log(result)
			if (!result.status) {
				showAlertBox(result.message);
				return;
			}
			showAlert('绑定手机号成功');
			UserCenter.userInfo.bdbz = 'true';
			cc.log(self.phoneNumInput.string)
			UserCenter.userInfo.sjhm = self.phoneNumInput.string;
			GlobEvent.emit('update_RZ');
			self.node.removeFromParent();
			if (self.bz_callBack) {
				self.bz_callBack()
			}
		})

	},
});
