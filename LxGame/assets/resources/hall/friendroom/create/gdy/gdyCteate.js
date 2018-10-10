var createRoom = require('createRoom')
var config = require('Config');
var LoadGame = require('LoadGame');
cc.Class({
    extends: createRoom,

    properties: {
        fengding:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this._super();
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
                if (self.fengding) {
                    self.fengding.children.forEach(function (item, index) {
                        let toggle = item.getComponent(cc.Toggle);
                        toggle.isChecked = false;
                        let data = self.game.createRoom.fengding[index].data;
                        if ((roomdata.rule & data) == data) {
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
                    self.renshu = self.game.createRoom.renshu[index].num;
                }
            });

        }
        this.changeKa()
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

        if (self.fengding) {
            self.fengding.children.forEach(function (item, index) {
                let toggle = item.getComponent(cc.Toggle);
                if (toggle.isChecked) {
                    let data = self.game.createRoom.fengding[index].data;
                    if (data > 0) {
                        cc.log('fengding : ', data);
                        rule |= data
                    }
                }
            });
        }

        cc.log('rule', rule);
        return rule;
    },



});
