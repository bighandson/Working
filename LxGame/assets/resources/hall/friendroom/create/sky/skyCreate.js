var createRoom = require('createRoom')
var config = require('Config');
var LoadGame = require('LoadGame');
const difenCha =[1,2,3,5,10]
cc.Class({
    extends: createRoom,

    properties: {

        feiwang :cc.Node,
        timeLimit : cc.Node,
    },

    onLoad: function () {

        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
        if(UserCenter.getUserInfo().free){
            this.free =  UserCenter.getUserInfo().free
        }
        this.renshu = 4;
        this.zhifu = true;
        this.Limittime = 0;
        this.feizhawanfa = 0;
        this.feiwangwanfa = 0;
        this.gameid = parseInt(this.gameid)
        this.cardNum.string = UserCenter.getUserInfo().fangkaNum;
        this.game = config.getGameById(this.gameid);
        this.changeinfo();

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
            this.feizhawanfa = roomdata.wanfa;
            if (roomdata.wanfa == 4){
                self.wanfa.getComponent(cc.Toggle).isChecked = true;
            }else{
                self.wanfa.getComponent(cc.Toggle).isChecked = false;
            }
            this.feiwangwanfa = roomdata.feiwang;
            if (roomdata.feiwang == 8){
                self.feiwang.getComponent(cc.Toggle).isChecked = true;
            }else{
                self.feiwang.getComponent(cc.Toggle).isChecked = false;
            }
            this.timeLimitnum = roomdata.timeLimitnum;
            if (roomdata.timeLimitnum == 2){
                self.timeLimit.getComponent(cc.Toggle).isChecked = true;
            }else{
                self.timeLimit.getComponent(cc.Toggle).isChecked = false;
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

        }
        this.changeKa()
    },

    timeLimitFunc:function (event,num) {
        let self = this;
        if (self.timeLimit.getComponent(cc.Toggle).isChecked)
        {
            self.timeLimitnum = num;
        }else{
            self.timeLimitnum = 0;
        }

    },
    feiwangWanfaFunc:function (event,num) {
        let self = this;
        if (self.feiwang.getComponent(cc.Toggle).isChecked)
        {
            self.feiwangwanfa = num;
        }else{
            self.timeLimitnum = 0;
        }

    },

    wanfaFunc:function (event,num) {
        let self = this;
        if (self.wanfa.getComponent(cc.Toggle).isChecked)
        {
            self.feizhawanfa = num;
        }else{
            self.feizhawanfa = 0;
        }

    },

    chaneBeishu:function (event,num) {
        this.beishu  = num;
    },
    changeJiaopai:function (event,num) {
        this.jiaopai = num;
    },

    getRule:function () {
        var rule = this.feizhawanfa | this.feiwangwanfa |this.timeLimitnum ;
        cc.log(rule)
        return rule
    },

    onCreateRoom: function () {
        let self = this;
        var rule = this.getRule();
        var gamebh = this.game.createRoom.jushu[this.juIndex].gamebh;
        let roomdata = {
            juIndex: this.juIndex,
            zhifu: this.zhifu,
            wanfa :this.feizhawanfa,
            feiwang : this.feiwangwanfa,
            timeLimitnum :this.timeLimitnum,
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

});
