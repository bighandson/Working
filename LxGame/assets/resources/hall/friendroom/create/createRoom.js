var config = require('Config');
var LoadGame = require('LoadGame');
const difenCha =[1,2,3,5,10]
cc.Class({
    extends: cc.Component,

    properties: {
        cardNum: cc.Label,
        jushuGroup: cc.Node,
        renshuGroup: cc.Node,
        zhifuGroup: cc.Node,
        difenGroup : cc.Node,
        wanfa: cc.Node,
        kexuan: cc.Node,
        cardNum2: cc.Label,
        mapai: cc.Node,
        gameid : cc.String,
    },

    //zhifu  0 AA 1 房主
    //juInedx  0 1 2
    // renshu  2-6


    // use this for initialization
    onLoad: function () {

        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
        if(UserCenter.getUserInfo().free){
            this.free =  UserCenter.getUserInfo().free
        }
        this.gameid = parseInt(this.gameid)
        this.cardNum.string = UserCenter.getUserInfo().fangkaNum;
        this.game = config.getGameById(this.gameid);
        this.changeinfo();
        if (this.mapai) {
            this.mapai.getChildByName("MapaiToggle").on("toggle", this.onMapaiToggle.bind(this));
            let MapaiToggleGroup = this.mapai.getChildByName("MapaiToggleGroup");
            for (let i = 0; i < MapaiToggleGroup.childrenCount; i++) {
                MapaiToggleGroup.children[i].getComponent(cc.Toggle).interactable = true;
            }
        }

    },
    updateUsercenter: function () {
        if(this.cardNum){
            this.cardNum.string = formatNum(UserCenter.getUserInfo().fangkaNum);
        }
    },
    onDestroy : function () {
        GlobEvent.removeListener('update_UserCenter', this.updateUsercenter.bind(this));
    },
    onClickJinbi : function () {
        loadPrefab("hall/shop/shop",function (module) {
            module.getComponent('shopScript')._selectToggle('1')

            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))
        });
    },

    onMapaiToggle: function (event) {
        let target = event.getCurrentTarget();
        let flag = target.getComponent(cc.Toggle).isChecked;
        cc.log('flag', flag)
        let MapaiToggleGroup = this.mapai.getChildByName("MapaiToggleGroup");
        for (let i = 0; i < MapaiToggleGroup.childrenCount; i++) {
            MapaiToggleGroup.children[i].getComponent(cc.Toggle).interactable = flag;

        }
    },

    changeinfo: function () {
        let self = this
        let roomdata = JSON.parse(cc.sys.localStorage.getItem(config.jgm + this.gameid));
        cc.log('changeinfo')
        if (!!roomdata) {
            cc.log('roomdata', roomdata);
            // 局数
            if (roomdata.juIndex != null) {
                this.juIndex = roomdata.juIndex;
                this.jushuGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = index == roomdata.juIndex
                });
            }
            //支付
            if (roomdata.zhifu != null) {
                this.zhifu = roomdata.zhifu;
                this.zhifuGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = (index == self.zhifu)
                });
            }
            if (roomdata.difenIndex != null) {
                this.difenIndex = roomdata.difenIndex;
                this.difenGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = (index == self.difenIndex)
                });
            }

            if (roomdata.rule != null) {
                if (self.renshuGroup) {
                    self.renshuGroup.children.every(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.renshu[index].data;
                        if ((roomdata.rule & data) == data) {
                            self.renshu = self.game.createRoom.renshu[index].num
                            cc.log(self.renshu)
                            toggle.isChecked = true;
                            return false
                        }else{
                            return true
                        }
                    });
                }
                if (self.wanfa) {
                    self.wanfa.children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.wanfa[index].data;
                        if ((roomdata.rule & data) == data) {
                            toggle.check()
                        }
                    });
                }
                if (self.kexuan) {
                    self.kexuan.children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.kexuan[index].data;
                        if ((roomdata.rule & data) == data) {
                            toggle.check()
                        }
                    });
                }
                if (self.mapai) {
                    //马牌
                    let target = self.mapai.getChildByName("MapaiToggle");
                    target.getComponent(cc.Toggle).isChecked = false;
                    self.mapai.children[1].children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.mapai[index].data;
                        if ((roomdata.rule & data) == data) {
                            cc.log('开始马牌')
                            target.getComponent(cc.Toggle).check();
                            let flag = target.getComponent(cc.Toggle).isChecked;
                            cc.log(flag)
                            let MapaiToggleGroup = self.mapai.getChildByName("MapaiToggleGroup");
                            for (let i = 0; i < MapaiToggleGroup.childrenCount; i++) {
                                MapaiToggleGroup.children[i].getComponent(cc.Toggle).interactable = flag;
                            }
                            toggle.check()
                            target.getComponent(cc.Toggle).isChecked = true;
                        }
                    });
                }

            }
        } else {
            this.zhifuGroup.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    self.zhifu = index;
                }
            });
            this.jushuGroup.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    self.juIndex = index;
                }
            });
            this.renshuGroup.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    self.renshu = self.game.createRoom.renshu[index].num;
                }
            });
            if(this.difenGroup){
                this.difenGroup.children.forEach(function (item, index) {
                    let toggle = item.getComponent(cc.Toggle);
                    if (toggle.isChecked) {
                        self.difenIndex = index;
                    }
                });
            }
        }
        this.changeKa()
    },
    addKong :function () {

    },


    changeren: function (event, num) {
        this.renshu = num;
        this.changeKa();
    },
    changezhi: function (event, num) {
        this.zhifu = num;
        this.changeKa();
    },
    changeju: function (event, num) {
        this.juIndex = num;
        this.changeKa();
    },
    changeKa: function () {
        let isFree = false;

        cc.log(this.juIndex, this.zhifu, this.renshu)
        this.addKong()

        for(let i = 0;i<this.free.length;i++){
            if(this.gameid == this.free[i].gameid ){
	            function pad2(n) { return n < 10 ? '0' + n : n }

	            let date = new Date();
	            let time = date.getFullYear().toString() + pad2(date.getMonth() + 1) + pad2( date.getDate()) + pad2( date.getHours() ) + pad2( date.getMinutes() ) + pad2( date.getSeconds() )
	            if(this.free[i].is_free==1){
		            time = time.slice(8)
		            cc.log(time)
		            if(time>this.free[i].qsrq && time<this.free[i].jzrq){
			            isFree = true
		            }
	            }else if(this.free[i].is_free==2){
		            cc.log(time)
		            if(time>this.free[i].qsrq && time<this.free[i].jzrq){
			            isFree = true
		            }
	            }
            }
        }
        cc.log('isFree',isFree)
        this.cardNum2.string = isFree?0: this.game.createRoom.jushu[this.juIndex].num * (this.zhifu == 0 ? 1 : this.renshu);
        if(isFree){
	        this.cardNum2.node.parent.children[0].active = false;
	        this.cardNum2.node.parent.children[1].active = false;
	        this.cardNum2.node.parent.children[2].active = false;
	        this.cardNum2.node.parent.children[3].active = true;
        }else{
	        this.cardNum2.node.parent.children[0].active = true;
	        this.cardNum2.node.parent.children[1].active = true;
	        this.cardNum2.node.parent.children[2].active = true;
	        this.cardNum2.node.parent.children[3].active = false;
        }

    },

    getRule: function () {
        let self = this;
        let rule = 0;
        //人数获取
        if (self.renshuGroup) {
            self.renshuGroup.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    let data = self.game.createRoom.renshu[index].data;
                    if (data > 0) {
                        cc.log('renshu : ', data);
                        rule |= data
                    }
                }
            });
        }
        //玩法信息获取
        if (self.wanfa) {
            self.wanfa.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    let data = self.game.createRoom.wanfa[index].data;
                    if (data > 0) {
                        cc.log('wanfa : ', data);
                        rule |= data
                    }
                }
            });
        }
        if (self.kexuan) {
            self.kexuan.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    let data = self.game.createRoom.kexuan[index].data;
                    if (data > 0) {
                        cc.log('kexuan : ', data);
                        rule |= data
                    }
                }
            });
        }
        cc.log(rule);
        if (self.mapai) {
            let target = self.mapai.getChildByName("MapaiToggle");
            if (target.getComponent(cc.Toggle).isChecked) {
                let MapaiToggleGroup = self.mapai.getChildByName("MapaiToggleGroup");
                let index = -1;
                for (let i = 0; i < MapaiToggleGroup.childrenCount; i++) {
                    if (MapaiToggleGroup.children[i].getComponent(cc.Toggle).isChecked) {
                        index = i;
                        break;
                    }
                }
                cc.log('马牌', index);
                cc.log(self.game.createRoom.mapai[index].data);
                if (index >= 0) {
                    rule |= self.game.createRoom.mapai[index].data;
                }
            }
        }
        cc.log('rule', rule);
        return rule;
    },
    onCreateRoom: function () {
        let self = this;
        var rule = this.getRule();
        var gamebh = this.game.createRoom.jushu[this.juIndex].gamebh;
        if(this.difenGroup){
            self.difenGroup.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    self.difenIndex = index;
                }
            });
        }
        let roomdata = {
            juIndex: this.juIndex,
            zhifu: this.zhifu,
            rule: rule,
            difenIndex: this.difenIndex,
        };

        cc.sys.localStorage.setItem(config.jgm + this.gameid, JSON.stringify(roomdata));
        cc.sys.localStorage.setItem(config.jgm + 'lastGame', JSON.stringify(self.gameid))
        cc.log('人数',this.renshu)
        //0x01 AA支付  0x00 房主支付
        var expend = (difenCha[this.difenIndex]<<8)|(this.renshu << 1) | (this.zhifu == 0 ? 0x01 : 0x00);
        showLoadingAni();
        LoadGame.createCardRoom(this.gameid, 0, gamebh, rule, expend, function (data) {
            cc.log("onCreateRoom2   ", data)
            hideLoadingAni();
            if (data.code == 200) {
                cc.log('创建房间', data)
            } else {
                showAlertBox('创建房间失败，请稍后再试')
            }
        });
    },
    onClose: function () {
        this.onDestroy();
        this.node.removeFromParent(true);
    },

});
