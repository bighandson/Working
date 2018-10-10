
var MJRule = require('MJRule');
const GamePlayer = require('GamePlayer');
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
const CMD_ACTION = Command.CMD_ACTION;
const EATFLAG = Command.EATFLAG;
cc.Class({
    extends: MJRule,
    properties: {
        //outCardBDChair : -1              // 打出财神的玩家方位
    },

    onLoad: function () {
        this._super();
        let laoNode = new cc.Node();
        laoNode.parent = this.node.parent;
        laoNode.x = -620;
        laoNode.y = -80;
        this.laozhuang = laoNode.addComponent(cc.Label);
        this.laozhuang.fontSize = 20;
        this.laozhuang.lineHeight = 20;
        this.laozhuang.string = ''
    },

    RCMD_Expend: function (data) {
        cc.log('RCMD_Expend', data);
        let self = this;
        var expend = data.data;
        if (expend.CMD == '0001') {
            showAlert(expend.tips);
        }else if (expend.CMD == '002') {
            var arr = expend.ar;
            UserCenter.setList(arr);
            this.nextAction();
        }else if(expend.CMD == '10000'){
            this.minpoint = expend.minpoint;
            this.maxpoint = expend.maxpoint;
            cc.log(this.minpoint)
        }else if (expend.CMD == '10002') {
            //房间人数
            this.youxirenshu = expend.PlayerCount;
        }else if(expend.CMD == '103'){
            cc.log('013')
            this.laozhuang.string = '老庄x'+expend.continuemaster
        }
        this.nextAction();
    },
    // Result: function (huInfo, data,result) {
    //    this._super(huInfo, data,result);
    //
    // },

    gameStart: function (masterid, baseMoney) {
        this.resetGame();
        if(!!baseMoney){
            let a = Math.floor(baseMoney/16);
            let b = baseMoney%16;
            this.BDFrame.setTou(a,b);
        }
        this._isplaying = true;
        let seatid = GamePlayer.getSeatByUserid(masterid);
        let chair = this.getChairByUid(masterid);
        if (this.roomType < 2) {
            if (!this.youxirenshu) {
                chair = this.getChairBySeatId(seatid);
            } else {
                switch (this.youxirenshu) {
                    case 2: chair = this.getChairBySeatId2(seatid); break;
                    case 4: chair = this.getChairBySeatId(seatid); break;
                }
            }

        } else {
            switch (this.ruleFlag & 0x07) {
                case 0x01: chair = this.getChairBySeatId2(seatid); break;
                case 0x02: chair = this.getChairBySeatId3(seatid); break;
                case 0x04: chair = this.getChairBySeatId(seatid); break;
            }
        }
        if ((this.ruleFlag & 0x07) == 0x01) {
            this.remainderPai--;
        } else {
            this.remainderPai--;
        }

    },

    hideBD : function () {
        if(!!this.BDFrame){
          this.BDFrame.hideTou();  
          this.BDFrame.active = false;
        }
      },

    getChairBySeatId3: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 2) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 3) {
            if (chair == 2) {
                chair = 3;
            }
        }
        return chair;
    },

    getChairBySeatId2: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 3) {
                chair = 2;
            }
        } else if (seatId == 2) {
            if (chair == 1) {
                chair = 2;
            }
        }
        return chair;
    },

    getChairByUid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        var chair = this.getChairBySeatId(seatid);
        if (this.roomType < 2) {
            if (!this.youxirenshu) {
                chair = this.getChairBySeatId(seatid);
            } else {
                switch (this.youxirenshu) {
                    case 2: chair = this.getChairBySeatId2(seatid); break;
                    case 4: chair = this.getChairBySeatId(seatid); break;
                }
            }

        } else {
            switch (this.ruleFlag & 0x07) {
                case 0x01: chair = this.getChairBySeatId2(seatid); break;
                case 0x02: chair = this.getChairBySeatId3(seatid); break;
                case 0x04: chair = this.getChairBySeatId(seatid); break;
            }
        }

        return chair;
    },


    

    showPosition: function (chair, renshu) {
        if (!this._position) {
            let self = this;
            cc.loader.loadRes('style/mahjong/mah/prefab/position/position', cc.Prefab, function (err, prefab) {
                if (err) {
                    cc.log(err);
                    return;
                }

                let position = cc.instantiate(prefab);
                position.parent = self.node;
                position.x = position.parent.getContentSize().width / 2;
                position.y = position.parent.getContentSize().height / 2 + 50;
                self._position = position.getComponent('Position');
                self._position.initUI(chair, renshu);
            });
        } else {
            this._position.node.active = true;
            this._position.initUI(chair, renshu);
        }

    },

    /**
 * 吃碰杠操作
 * @param chair
 * @param opCode
 * @param data
 */
    onCmdEatAction: function (chair, opCode, data) {
        let dir = this.getChairByUid(this.lastPlayId);
        switch (opCode) {
            case RCMD_ACTION.optHit:
                this._renders[chair].dealHitCards(this.lastOutPai, opCode, data.dA, data.dB, dir);
                break;
            case RCMD_ACTION.optEat:
                let flag = EATFLAG.EAT_LEFT;
                let pai1 = data.paiA;
                let pai2 = data.paiB;

                if (this.blockToValue(pai1) < this.blockToValue(this.lastOutPai)) {
                    flag += 1;
                }

                if (this.blockToValue(pai2) < this.blockToValue(this.lastOutPai)) {
                    flag += 1;
                }
                if (this.blockToValue(pai1) > this.blockToValue(pai2)) {
                    pai1 = data.paiB;
                    pai2 = data.paiA;
                }
                this._renders[chair].dealEatCards(this.lastOutPai, flag, pai1, pai2, data.dA, data.dB, dir);
                break;
            case RCMD_ACTION.optBar:
                this._renders[chair].dealBarCards(this.lastOutPai, opCode, data, dir);
                this.remainderPai--;
                break;
        }
        if (opCode != RCMD_ACTION.optBar || data.style == 0) {           
            this.removeLastCardEHB();
        }
        this.playEatCmdAnim(chair, opCode);
        //this.nextAction();
    },

   


    // 游戏开始
    sendStart: function () {
        cc.log('money', UserCenter.getYouxibiNum(), this.minuserpoint);
        this.laozhuang.string = ''
        let panduan = false;
        if(!this.minuserid){
            this.minuserpoint = this.minpoint;
        }else{

        }
        if (this.roomType < 2) {
            if (UserCenter.getYouxibiNum() < this.minuserpoint) {
                let msgArr = {
                    0: '您的人品不好，所以被踢下线',
                    1: '帐号在另一个地方登录，您被迫下线',
                    2: '您被管理员踢下线',
                    3: '您的游戏币不足，不能继续游戏。',
                    4: '你的断线或逃跑已经超过规定的次数,不能继续游戏',
                    255: ''
                };
                let self = this;
                hideLoadingAni();
                this.removePomeloListeners();
                showAlertBox(msgArr[3], function () {
                    self.backLobby();
                });
            } else {
                var route = this.game.server + '.CMD_Ready';
                PomeloClient.request(route);
            }
        } else {
            var route = this.game.server + '.CMD_Ready';
            PomeloClient.request(route);
        }

    },

    RCMD_ActData: function (data) {
        this.setMaster(data.masterid);
        this.gameStart(data.masterid,data.baseMoney);
        let activeid = data.activeid;
        this.lastOutPai = data.lastPai;
        this.lastPlayId = data.lastPlayerid;

        this.setBD(data.iBD);
        let users = data.users;
        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            let chair = this.getChairByUid(user.userid);
            let render = this._renders[chair];
            if (user.eatCount > 0) {
                // 恢复吃碰杠的牌
                for (let j = 0; j < user.eats.length; j++) {
                    var eat = user.eats[j];
                    let count = eat.flag > 4 ? 5 : 3;
                    this.remainderPai -= count;
                    let dir = this.getChairBySeatId(eat.eatDir);
                    render.dealActData(eat.pai, eat.flag, dir);
                }
            }

            // 恢复手中的牌
            let pais = user.pais || [];
            this.remainderPai -= user.hc;

            render.createHandCards(user.hc, pais);

            // 恢复出过的牌
            this.remainderPai -= user.outCount;
            for (let i = 0; i < user.outCount; i++) {
                render._createOneOutCard(user.outs[i]);
            }

            // 恢复花牌
            this.remainderPai -= user.flowerCount;
            render.addFlowers(user.flowers);
            render.freshHandCardsPos();
        }
        this.node.emit('RCMD_ActData', data);
        this.activePosition(activeid, this.outTimes);
        this.updateRemainTip();
        this.nextAction();
        let seatid = GamePlayer.getSeatByUserid(data.masterid);
        let chair = this.getChairByUid(data.masterid);
        if (this.roomType < 2) {
            if (!this.youxirenshu) {
                chair = this.getChairBySeatId(seatid);
            } else {
                switch (this.youxirenshu) {
                    case 2: chair = this.getChairBySeatId2(seatid); break;
                    case 4: chair = this.getChairBySeatId(seatid); break;
                }
            }

        } else {
            switch (this.ruleFlag & 0x07) {
                case 0x01: this.showPosition(chair, 2); break;
                case 0x02: this.showPosition(chair, 3); break;
                case 0x04: this.showPosition(chair, 4); break;
            }
        }

    },
});