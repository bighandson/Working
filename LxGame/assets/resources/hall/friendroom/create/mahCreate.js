var config = require('Config');
var LoadGame = require('LoadGame');
cc.Class({
    extends: cc.Component,

    properties: {
        cardNum: cc.Label,
        jushuGroup: cc.Node,
        renshuGroup: cc.Node,
        zhifuGroup: cc.Node,
        wanfa: cc.Node,
        kexuan: cc.Node,
        cardNum2 : cc.Label
    },

    //zhifu  0 AA 1 房主
    //juInedx  0 1 2
    // renshu  2-6


    // use this for initialization
    onLoad: function () {
        this.cardNum.string = UserCenter.getUserInfo().fangkaNum;
        this.gameid = 0;
        this.game = config.getGameById(this.gameid);
        this.changeinfo();
    },

    changeinfo: function () {
        let self = this
        let roomdata = JSON.parse(cc.sys.localStorage.getItem(config.jgm + this.gameid));

        if (!!roomdata) {
            cc.log('roomdata', roomdata);
            // 局数
            if (roomdata.juIndex != null) {
                this.juIndex = roomdata.juIndex;
                this.jushuGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = (index + 1) == roomdata.juIndex
                });
            }
            //支付
            if (roomdata.zhifu != null) {
                this.zhifu = roomdata.zhifu;
                this.zhifuGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = (index == self.zhifu)
                });
            }
            if (roomdata.renshu != null) {
                this.renshu = roomdata.renshu;
                this.renshuGroup.children.forEach(function (item, index) {
                    item.getComponent(cc.Toggle).isChecked = (index == 4 -self.renshu)
                });
            }
            if (roomdata.rule != null) {
                if(self.wanfa){
                    self.wanfa.children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.wanfa[index].data;
                        if((roomdata.rule & data) == data){
                            toggle.check()
                        }
                    });
                }
                if(self.kexuan){
                    self.kexuan.children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.kexuan[index].data;
                        if((roomdata.rule & data) == data){
                            toggle.check()
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
                    self.renshu = -index + 4;
                }
            });
        }
        this.changeKa()
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
        cc.log(this.juIndex,this.zhifu,this.renshu)
        this.cardNum2.string = 2*Math.pow(2, this.juIndex) * (this.zhifu == 0 ? 1 : this.renshu);
    },

    getRule: function () {
        let self = this;
        let rule = 0;
        if (this.renshu == 2) {
            rule = 0x01
        } else if (this.renshu == 3) {
            rule = 0x02
        } else if (this.renshu == 4) {
            rule = 0x04
        }
        //玩法信息获取
        if(self.wanfa){
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
        if(self.kexuan){
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
        cc.log('rule', rule);
        return rule;
    },
    onCreateRoom: function () {
        let self = this;
        var rule = this.getRule();
        var gamebh = this.game.createRoom.jushu[this.juIndex].gamebh;
        let roomdata = {
            juIndex: this.juIndex,
            zhifu: this.zhifu,
            renshu : this.renshu,
            rule : rule
        };
        cc.sys.localStorage.setItem(config.jgm + this.gameid, JSON.stringify(roomdata));
        cc.sys.localStorage.setItem(config.jgm+'lastGame', JSON.stringify(self.gameid));

        //0x01 AA支付  0x00 房主支付
        var expend = (this.renshu << 1) | (this.zhifu == 0 ? 0x01 : 0x00);
        showLoadingAni();
        cc.log(this.gameid, gamebh, rule,expend)
        LoadGame.createCardRoom(this.gameid, 0, gamebh, rule, expend, function (data) {
            cc.log("onCreateRoom2", data)
            hideLoadingAni();
            if (data.code == 200) {
                cc.log('创建房间', data)
            } else {
                showAlertBox('创建房间失败，请稍后再试')
            }
        });
    },
    onClose: function () {
        this.node.removeFromParent(true);
    },

});
