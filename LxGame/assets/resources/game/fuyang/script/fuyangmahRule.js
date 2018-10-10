
var config = require('Config');
var MJRule = require('MJRule');
const MJType = require('MJType');
var PAI = MJType.PAI;
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
const CMD_ACTION = Command.CMD_ACTION;
const EATFLAG = Command.EATFLAG;
const GamePlayer = require('GamePlayer');
cc.Class({
    extends: MJRule,

    properties: {

    },

    init : function () {
        let self = this;

        cc.loader.loadRes('game/fuyang/prefab/caiti/caitiButton',cc.Prefab,function (err,prefab) {
            if (err){
                cc.log(err);
                return;
            }
            cc.log('加载猜题')
            let caiti = cc.instantiate(prefab);
            caiti.parent = self.node.parent;
            caiti.x = 630;
            caiti.y = -280;
            self.ct = 1;
            caiti.on(cc.Node.EventType.TOUCH_END,self.caitiButton,self);
            self.nodeCT = caiti;
            cc.log('caiti ',self.nodeCT);
        });

    },
    caitiButton:function (event) {
        var node =event.currentTarget;
        if(this.ct==1){
            cc.loader.loadRes('game/fuyang/prefab/caiti/texture/caiti-1',cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            let data = {
                "cmd":"0001",
                "alloweat":"0"
            };
            this.sendExpend(data);
            this.ct=0;
        }else if (this.ct==0){
            cc.loader.loadRes('game/fuyang/prefab/caiti/texture/caiti',cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            let data = {
                "cmd":"0001",
                "alloweat":"1"
            };
            this.sendExpend(data);
            this.ct=1;
        }
    },
    // use this for initialization
    onLoad: function () {
        
     
        
        var bSingleClick = !!cc.sys.localStorage.getItem('MJSingleClick');
        if(!bSingleClick){
            cc.sys.localStorage.setItem('MJSingleClick','2');
        }
        this._super();
	       this.paiNum = 64;
        this.lianzhuang = 0;
    },

    // Result : function(huInfo,result){
    //     let self = this;
    //     cc.loader.loadRes('youxi/fuyangmah/prefab/mahresult/mahresult',cc.Prefab,function (err,prefab) {
    //         if(err){
    //             cc.log(err);
    //             return;
    //         }
    //         self.resultLayer = cc.instantiate(prefab);
    //         self.resultLayer.x = 0;//cc.winSize.width / 2;
    //         self.resultLayer.y = 0;//cc.winSize.height / 2;
    //         self.resultLayer.setLocalZOrder(2500);
    //         self.resultLayer.parent = self.node.parent;
    //         self.resultLayer.getComponent('fuyangResultController').showResult(self,self.gameid,self.masterid,huInfo,result,self.lastPlayId,self.roomType);
    //     });
    // },

    onCmdOpCode : function (opcode) {
        let bShow = (opcode & (RCMD_ACTION.optHu | RCMD_ACTION.optHit | RCMD_ACTION.optEat | RCMD_ACTION.optBar|
        RCMD_ACTION.optHitEx | RCMD_ACTION.optEatEx | RCMD_ACTION.optBarEx));
        if(bShow){
            this.showToolBar(opcode);
        }else {
            this.hideToolBar();
        }
        this.nextAction();
    },
    RCMD_Action:function(data){
        this.hideMultEats();
        this.hideToolBar();

        if(RCMD_ACTION.optTou == data.opCode){   // 德清麻将先收到出牌
            this.doCmdRunTou(data.userid,data.data);
            return;
        }

        if(!this._isplaying){
            this.nextAction();
            return;
        }
        let chair = 0;
        if(!!data.userid){
            chair = this.getChairByUid(data.userid);
        }

        if(chair < 0){
            this.nextAction();
            return;
        }
        let user = GamePlayer.getPlayer(data.userid);
        switch (data.opCode){
            case RCMD_ACTION.optTou:       // 摇撒子
                this.doCmdRunTou(data.userid,data.data);
                break;
            case RCMD_ACTION.optOut:       // 玩家出牌
            {
                this.lastPlayId = data.userid;
                this.onCmdOutPai(chair,data.data);
                this.playOutSound(chair,user.sex,data.data.pai);
            }
                break;
            case RCMD_ACTION.optEat:
            case RCMD_ACTION.optHit:
            case RCMD_ACTION.optBar:
                this.activePosition(data.userid,this.outTimes);
                this.onCmdEatAction(chair,data.opCode,data.data);
                this.playEatCmdSound(chair,user.sex,data.opCode);
                this.lastPlayId = data.userid;
                break;
            case RCMD_ACTION.optHu:
                this.onCmdHuAction(data.userid,data.data);
                let bNotZimo = (data.data.huflag == 0 || data.data.huflag == 16); // 点炮，抢杠
                this.playHuSound(chair,user.sex,bNotZimo,data.data.huflag,data.data.hutype1);
                break;
            case RCMD_ACTION.optTing:        // 听牌
                break;
            case RCMD_ACTION.optGet:
                this.activePosition(data.userid,this.outTimes);
                this.onCmdGetPai(chair,data.data);
                this.remainderPai--;
                this.updateRemainTip();
                break;
            case RCMD_ACTION.optSupply:      // 获取牌
                this.activePosition(data.userid,this.outTimes);
                this.onCmdGetSupply(chair,data.data);
                if(!!data.data.fpai){
                    this.playSupplyCmdAnim(chair,0x08);
                    this.playEatCmdSound(chair,user.sex,0x08);
                }else {
                    this.nextAction();
                }
                this.remainderPai--;
                this.updateRemainTip();
                break;
            case RCMD_ACTION.optRecordHu:         // 复盘胡
                this.onCmdRecordHu(data.userid,data.data);
                break;
            default:
                cc.log('没有运行了?',data);
                break;
        }

    },
    /**
     * 补牌
     * @param chair
     * @param data
     */
    onCmdGetSupply : function (chair,data) {
        let pai = data.pai;
        var fpai = data.fpai || 0;
        if(fpai){  // 补花
            this._renders[chair].onCmdSupplyEX(pai,fpai);
        }else{ // 补牌
            this._renders[chair].onCmdGetPai(data.pai);
        }
        //this.nextAction();
    },
    getChairBySeatId3:function(seatId){
        var chair = this.getChairBySeatId(seatId);
        if(seatId == 1){
            if(chair == 2){
                chair = 1;
            }
        }else if(seatId == 2){
            if(chair == 2){
                chair = 1;
            }
        }else if(seatId == 3){
            if(chair == 2){
                chair = 3;
            }
        }
        return chair;
    },

    getChairBySeatId2:function(seatId){
        var chair = this.getChairBySeatId(seatId);
        if(seatId == 1){
            if(chair == 3){
                chair = 2;
            }
        }else if(seatId == 2){
            if(chair == 1){
                chair = 2;
            }
        }
        return chair;
    },

    getChairByUid:function(userid){
        let seatid = GamePlayer.getSeatByUserid(userid);
        var chair = this.getChairBySeatId(seatid);
        switch( this.ruleFlag &0x07)
        {
            case 0x01:  chair = this.getChairBySeatId2(seatid);break;
            case 0x02:  chair = this.getChairBySeatId3(seatid);break;
            case 0x04:  chair = this.getChairBySeatId(seatid);break;
        }
        return chair;
    },
    activePosition : function (userid,time) {
        let chair = this.getChairByUid(userid);
        if(!!this._position){
            this._position.active(chair,time);
        }

    },
    gameStart:function(masterid,baseMoney){
        this.resetGame();
        this.lianzhuang = baseMoney;
        this._isplaying = true;
        let seatid = GamePlayer.getSeatByUserid(masterid);
        let chair = this.getChairByUid(masterid);
        cc.log(this.youxirenshu)
        // if (this.roomType < 2) {
        //     if (!this.youxirenshu) {
        //         chair = this.getChairBySeatId(seatid);
        //     } else {
        //         cc.log(this.youxirenshu)
        //         switch (this.youxirenshu) {
        //             case 2: chair = this.getChairBySeatId2(seatid); break;
        //             case 4: chair = this.getChairBySeatId(seatid); break;
        //         }
        //     }
        //
        // } else {
        //     switch (this.ruleFlag & 0x07) {
        //         case 0x01: chair = this.getChairBySeatId2(seatid); break;
        //         case 0x02: chair = this.getChairBySeatId3(seatid); break;
        //         case 0x04: chair = this.getChairBySeatId(seatid); break;
        //     }
        // }
        if (this.roomType < 2) {
            if (!this.youxirenshu) {
                chair = this.getChairBySeatId(seatid);
            } else {
                cc.log(this.youxirenshu)
                switch (this.youxirenshu) {
                    case 2:
                        chair = this.getChairBySeatId2(seatid);
                        break;
                    case 4:
                        chair = this.getChairBySeatId(seatid);
                        break;
                }
            }

        } else {
            switch (this.ruleFlag & 0x07) {
                case 0x01:
                    chair = this.getChairBySeatId2(seatid);
                    this.youxirenshu = 2;
                    break;
                case 0x02:
                    chair = this.getChairBySeatId3(seatid);
                    this.youxirenshu = 3;
                    break;
                case 0x04:
                    chair = this.getChairBySeatId(seatid);
                    this.youxirenshu = 4;
                    break;
            }
        }
        this.showPosition(chair, this.youxirenshu)
        if ((this.ruleFlag &0x07)==0x01){
            this.remainderPai-= 72;
        }else {
            this.remainderPai--;
        }

    },
    showPosition : function (chair,renshu) {
        if(!this._position){
            let self = this;
            cc.loader.loadRes('style/mahjong/mah/prefab/position/position',cc.Prefab,function (err,prefab) {
                if(err){
                    cc.log(err);
                    return;
                }

                let position = cc.instantiate(prefab);
                position.parent = self.node;
                position.x = position.parent.getContentSize().width/2;
                position.y = position.parent.getContentSize().height/2+50;
                self._position = position.getComponent('Position');
                self._position.initUI(chair,renshu);
            });
        }else{
            this._position.node.active = true;
            this._position.initUI(chair,renshu);
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
    onOpAction : function (event) {
        event.stopPropagation();
        this.hideToolBar();

        let code = parseInt(event.getUserData());
        switch (code){
            case RCMD_ACTION.optNull:
                this.doDefault();
                break;
            case RCMD_ACTION.optHitEx:
            case RCMD_ACTION.optHit:
                this.sendAction(RCMD_ACTION.optHit,CMD_ACTION.AT_HAND);
                break;
            case RCMD_ACTION.optEatEx:
            case RCMD_ACTION.optEat:
                this.dealLocalEat();
                break;
            case RCMD_ACTION.optHu:
                this.sendAction(RCMD_ACTION.optHu,CMD_ACTION.AT_HAND);
                break;
            case RCMD_ACTION.optBarEx:
            case RCMD_ACTION.optBar:
                this.dealLocalBar();
                break;
        }
    },
    dealLocalBar : function () {
        // let render = this._renders[0];
        let mjcards = this._renders[0]._hands.getMJCards();
        if(mjcards.length % 3 != 2){  // 碰杠
            let countBD = this._renders[0]._hands.CountPai(this.iBD);
            let count = this._renders[0]._hands.CountPai(this.lastOutPai);
            if((count + countBD)< 3) return;
             // 没有杠

            this.sendAction(RCMD_ACTION.optBar,CMD_ACTION.AT_HAND,this.lastOutPai);
        }else{   // 补杠 暗杠
            let supplyBars = this.findSupplyBarCards();
            let anBars = this.findAnBarCards();
            let bars = supplyBars.concat(anBars);

            if(bars.length == 0) return;
            if(bars.length == 1){
                let bar = bars[0];
                this.sendAction(RCMD_ACTION.optBar,CMD_ACTION.AT_HAND,bar.pais[0]);
            }else{
                cc.log(bars);
                this.showMultEats(bars);
            }
        }
    },
    // 获取左吃
    getLeftPais : function (value) {
        let l1 = this.blockToValue(value);
        let l2 = l1 + 1;
        let l3 = l2 + 1;

        if(MJType.isSameFlower(l1,l2,l3) && l1 >= MJType.PAI.PAI_W1
            && l3 <=  MJType.PAI.PAI_S9){
            l2 = this.toBlockValue(l2);
            l3 = this.toBlockValue(l3);

            if (this.ct==1){
                let  index1 = this._renders[0].findCardValueIndex(l2);
                let index2 = this._renders[0].findCardValueIndex(l3);
                if (index1 < 0&&index2 >= 0){
                    if(this.isBD(l3)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : this.iBD,
                            pai2 : l3,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [value,this.iBD,l3]
                        }
                    }else {
                        return null;
                    }
                }
                if (index1 >= 0&&index2 < 0){
                    if(this.isBD(l2)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : l2,
                            pai2 : this.iBD,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [value,l2,this.iBD]
                        }
                    }else {
                        return null;
                    }
                }
                if(index2 < 0&&index1<0){
                    return null;
                }

                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index1,
                    dB : index2,
                    flag : EATFLAG.EAT_LEFT,
                    pais : [value,l2,l3]
                }

            }else {
                if(this.isBD(l2) || this.isBD(l3)){
                    return null;
                }

                let  index1 = this._renders[0].findCardValueIndex(l2);
                if(index1 < 0) return null;

                let index2 = this._renders[0].findCardValueIndex(l3);
                if(index2 < 0) return null;

                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index1,
                    dB : index2,
                    flag : EATFLAG.EAT_LEFT,
                    pais : [value,l2,l3]
                }
            }


        }else {
            return null;
        }
    },
    // 获取右吃
    getRightPais : function (value) {
        let l1 = this.blockToValue(value);

        let l2 = l1 - 1;
        let l3 = l2 - 1;

        if(MJType.isSameFlower(l1,l2,l3) && l3 >= MJType.PAI.PAI_W1
            && l1 <= MJType.PAI.PAI_S9
        ){
            l2 = this.toBlockValue(l2);
            l3 = this.toBlockValue(l3);

            if(this.ct==1){
                let index1 = this._renders[0].findCardValueIndex(l2);
                let index2 = this._renders[0].findCardValueIndex(l3);
                if (index1 < 0&&index2 >= 0){
                    if(this.isBD(l3)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : this.iBD,
                            pai2 : l3,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [l3,this.iBD,value]
                        }
                    }else {
                        return null;
                    }
                }
                if (index1 >= 0&&index2 < 0){
                    if(this.isBD(l2)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : l2,
                            pai2 : this.iBD,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [this.iBD,l2,value]
                        }
                    }else {
                        return null;
                    }
                }
                if(index2 < 0&&index1<0){
                    return null;
                }
                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index2,
                    dB : index1,
                    flag : EATFLAG.EAT_RIGHT,
                    pais : [l3,l2,value]
                }
            }else {
                if(this.isBD(l2) || this.isBD(l3)){
                    return null;
                }

                let index1 = this._renders[0].findCardValueIndex(l2);
                let index2 = this._renders[0].findCardValueIndex(l3);
                if(index1 < 0 || index2 < 0) return null;

                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index2,
                    dB : index1,
                    flag : EATFLAG.EAT_RIGHT,
                    pais : [l3,l2,value]
                }
            }


        }else{
            return null;
        }
    },

    // 中吃
    getMidPais : function (value) {
        let l1 = this.blockToValue(value);

        let l2 = l1 - 1;
        let l3 = l1 + 1;

        if(MJType.isSameFlower(l1,l2,l3)
            && l2 >= MJType.PAI.PAI_W1
            && l3 <= MJType.PAI.PAI_S9
        ){
            l2 = this.toBlockValue(l2);
            l3 = this.toBlockValue(l3);

            if (this.ct==1){
                let index1 = this._renders[0].findCardValueIndex(l2);
                let index2 = this._renders[0].findCardValueIndex(l3);
                if (index1 < 0&&index2 >= 0){
                    if(this.isBD(l3)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : this.iBD,
                            pai2 : l3,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [this.iBD,value,l3]
                        }
                    }else {
                        return null;
                    }
                }
                if (index1 >= 0&&index2 < 0){
                    if(this.isBD(l2)){
                        return null;
                    }
                    if (this._renders[0].findCardValueIndex(this.iBD)>=0){
                        return {
                            pai0 : value,
                            pai1 : l2,
                            pai2 : this.iBD,
                            dA : index1,
                            dB : index2,
                            flag : EATFLAG.EAT_LEFT,
                            pais : [l2,value,this.iBD]
                        }
                    }else {
                        return null;
                    }
                }
                if(index2 < 0&&index1<0){
                    return null;
                }

                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index1,
                    dB : index2,
                    flag : EATFLAG.EAT_MID,
                    pais : [l2,value,l3]
                }
            }else {
                if(this.isBD(l2) || this.isBD(l3)){
                    return null;
                }

                let index1 = this._renders[0].findCardValueIndex(l2);
                if(index1 < 0) return null;
                let index2 = this._renders[0].findCardValueIndex(l3);
                if(index2 < 0) return null;

                return {
                    pai0 : value,
                    pai1 : l2,
                    pai2 : l3,
                    dA : index1,
                    dB : index2,
                    flag : EATFLAG.EAT_MID,
                    pais : [l2,value,l3]
                }
            }


        }else {
            return null;
        }
    },
    findAnBarCards : function () {
        let bars = [];
        let hands = this._renders[0]._hands;
        let countBD = hands.CountPai(this.iBD);
        let mjcards = hands.getMJCards();
        // for( let i = 0; i < mjcards.length; ++i)
        // {
        //     cc.log('sort before value',i, mjcards[i].getValue())
        // }
        // mjcards.sort(function (a,b) {
        //     return a._value-b._value;
        // });
        cc.log('mjcard111',mjcards);
        let _lastfindValue = 0;
        for(let i = 0; i < mjcards.length; i++){
            let value = mjcards[i].getValue();
            cc.log('value',i,value)
            if(value!=this.iBD && _lastfindValue != value && (hands.CountPai(value,0) +countBD)>= 4 ){
                _lastfindValue = value;
                bars.push({
                    flag : EATFLAG.EAT_BAR_DRAK,
                    pais : [value],
                    pos : i
                });
            }
        }
        return bars;
        // else {
        //     let countBD = hands.CountPai(this.iBD);
        //     let bars = [];
        //     let hands = this._renders[0]._hands;
        //     let mjcards = hands.getMJCards();
        //     let Mchair = this.getChairByUid(this.masterid);
        //     let chair = this.getChairByUid(UserCenter.getUserID());
        //     let E = (chair-Mchair==0);
        //     let S = (chair-Mchair==1||chair-Mchair==-3);
        //     let W = (chair-Mchair==2||chair-Mchair==-2);
        //     let N = (chair-Mchair== -1||chair-Mchair==3);
        //     let menfen = 0;
        //     for(let i = 0; i < mjcards.length; i++){
        //         let value = mjcards[i].getValue();
        //         let count = hands.CountPai(value,i);
        //         if(count == 4 && this.canAnBar(value)){
        //             bars.push({
        //                 flag : EATFLAG.EAT_BAR_DRAK,
        //                 pais : [value],
        //                 pos : i
        //             });
        //         }
        //     }
        //
        //     return bars;
        // }

        // let u1=[];
        // for(let i=0;i<bars.length;i++){
        //     if (u1.indexOf(bars[i])<0){
        //         u1.push(bars[i]);
        //     }
        // }
        // bars=u1;

    },
    findSupplyBarCards : function () {
        let bars = [];
        let blockPais = this._renders[0].blockPais;
        //let hands = this._renders[0]._hands;
        let len = this._renders[0]._hands.getMJCards().length;
        let render = this._renders[0];
        for(var i = 0; i < blockPais.length; i++){
            var block = blockPais[i];
            if(block.blockFlag >= EATFLAG.EAT_HIT){
                let pos = render.findCardValueIndex(block.values[0]);
                if(this.canSupplyBar(block.values[0],pos == len-1)){
                    if(pos >= 0){
                        bars.push({
                            flag : EATFLAG.EAT_BAR,        // 补杠
                            pais  : [block.values[0]],
                            pos   : pos
                        });
                    }
                    else if ( (pos= render.findCardValueIndex(this.iBD))>=0){

                        bars.push({
                            flag : EATFLAG.EAT_BAR,        // 补杠
                            pais  : [block.values[0]],
                            pos   : pos
                        });
                    }
                }
            }
        }

        return bars;
    },
    onCmdEatAction : function (chair,opCode,data) {
        let dir = this.getChairByUid(this.lastPlayId);
        switch (opCode){
            case RCMD_ACTION.optHit:
                cc.log(opCode,data);
                this._renders[chair].dealHitCardsEX(this.lastOutPai,opCode,data.dA,data.dB,dir);
                break;
            case RCMD_ACTION.optEat:
                cc.log(opCode,data);
                let flag = EATFLAG.EAT_LEFT;
                let pai1 = data.paiA;
                let pai2 = data.paiB;
                if (pai2==this.iBD){
                    if (Math.abs(pai1-this.lastOutPai)==2){
                        if (pai1<this.lastOutPai){
                            flag+=2;
                        }else {
                            let tpai=pai1;
                            pai1=pai2;
                            pai2=tpai;
                            flag=flag;
                        }
                    }else{
                        if (pai1<this.lastOutPai){
                            if (MJType.paiType(pai1-1)==MJType.paiType(this.lastOutPai)){
                                let tpai=pai1;
                                pai1=pai2;
                                pai2=tpai;
                                flag+=2;
                            }else {
                                flag+=1;
                            }
                        }else {
                            if (MJType.paiType(pai1)==MJType.paiType(this.lastOutPai-1)){
                                let tpai=pai1;
                                pai1=pai2;
                                pai2=tpai;
                                flag+=1;
                            }else {
                                flag=flag;
                            }
                        }
                    }
                }else {


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
                }
                this._renders[chair].dealEatCards(this.lastOutPai,flag,pai1,pai2,data.dA,data.dB,dir);
                break;
            case RCMD_ACTION.optBar:
                this._renders[chair].dealBarCardsEX(this.lastOutPai,opCode,data,dir);
                break;
        }
        if(opCode != RCMD_ACTION.optBar || data.style == 0){
            this.removeLastCardEHB();
        }
        this.playEatCmdAnim(chair,opCode);
        //this.nextAction();
    },
    RCMD_Result:function(data){
        this._isplaying = false;
        this.isAutoPlay = false;
        if(!this.huResult){
            this.nextAction();
            return;
        }
        let users = data.users;
        for (let i = 0; i < users.length; i++) {
            let user = GamePlayer.getPlayer(users[i].userid)
            users[i].sex = users[i].sex || user.sex;
            users[i].nick = users[i].nick || user.nick;
            users[i].userImage = users[i].userImage || user.userImage;
        }
        this.node.emit('RCMD_Result',data);
        if(!!this._position){
            this._position.stopActive();
        }

        var isHu = (this.huResult.userid == UserCenter.getUserID());
        if(isHu){
            this.soundCtrl.playWin();
        }else{
            this.soundCtrl.playLost();
        }

        this.hideOutTips();
        this.resultInfo = data;

        this.Result(this.huResult,users,data);
        // this.setBD(0);
    },
    RCMD_Expend : function (data) {
        cc.log('RCMD_Expend',data);
        var expend = data.data;
        if(expend.CMD == '0001'){
            this.userex = [];
            this.eatsex = [];
            cc.log('data: ',data);
            for (let i=0;i<expend.p.length;i++){
                    this.userex[i] = expend.p[i];
                    this.eatsex[i] = this.userex[i].eat;
            }
        }else if (expend.CMD == '0002') {
            this.allowE = expend.alloweat;
        }else if(expend.CMD == '10000'){
            this.minpoint = expend.minpoint;
            this.maxpoint = expend.maxpoint;
            cc.log(this.minpoint)
        }else if (expend.CMD == '10002') {
            //房间人数
            this.youxirenshu = expend.PlayerCount;
        }
        this.nextAction();
        cc.log('xxxxxx',this.userex)
    },
    RCMD_ActData:function(data){
        cc.log('data: ',data);
        this.setMaster(data.masterid);
        this.gameStart(data.masterid);
        this.lianzhuang = data.baseMoney;
        let activeid = data.activeid;
        this.lastOutPai = data.lastPai;
        this.lastPlayId = data.lastPlayerid;
        cc.log('this.userex:  ',this.userex)
        this.setBD(data.iBD);
        let users = data.users;
        for(let i = 0; i < users.length; i++){
            let user = users[i];
            let seatid = GamePlayer.getSeatByUserid(user.userid);
            let chair = this.getChairByUid(user.userid);
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
            cc.log('chair',chair)
            let render = this._renders[chair];
            if (this.userex[i].uid==user.userid) {
                if (user.eatCount > 0) {
                    // 恢复吃碰杠的牌
                    cc.log('i:  ',i);
                    for (let j = 0; j < user.eats.length; j++) {
                        var eat = user.eats[j];
                        let count = eat.flag > 4 ? 4 : 3;
                        this.remainderPai -= count;
                        let dir = this.getChairBySeatId(eat.eatDir);
                        var pai = [];
                        var eatex=this.eatsex[i];
                        var p1 = eatex[j].p1;
                        var p2 = eatex[j].p2;
                        var p3 = eatex[j].p3;
                        var p4 = eatex[j].p4;
                        var p5 = eatex[j].p5;
                        var p6 = eatex[j].p6;
                        var p7 = eatex[j].p7;
                        if (p7 != 0){
                            this.remainderPai -= 3;
                        }else if (p6 != 0){
                            this.remainderPai -= 2;
                        }else if (p5 != 0){
                            this.remainderPai -= 1;
                        }
                        render.dealActDataEX(p1,p2,p3,p4,p5,p6,p7, eat.flag, dir);
                    }
                }
            }

            // 恢复手中的牌
            let pais = user.pais || [];
            this.remainderPai -= user.hc;

            render.createHandCards(user.hc,pais);

            // 恢复出过的牌
            this.remainderPai -= user.outCount;
            for(let i = 0; i <user.outCount; i++){
                render._createOneOutCard(user.outs[i]);
            }

            // 恢复花牌
            this.remainderPai -= user.flowerCount;
            render.addFlowersEX(user.flowers);
            render.freshHandCardsPos();
        }
        var ctex;
        var node = this.nodeCT;
        let self = this;
        if (!this.nodeCT){
            cc.loader.loadRes('game/fuyang/prefab/caiti/caitiButton',cc.Prefab,function (err,prefab) {
                if (err){
                    cc.log(err);
                    return;
                }
                cc.log('加载猜题act')
                let caiti = cc.instantiate(prefab);
                caiti.parent = self.node.parent.children[5];
                caiti.x = 630;
                caiti.y = -280;
                self.ct = 1;
                caiti.on(cc.Node.EventType.TOUCH_END,self.caitiButton,self);
                self.nodeCT = caiti;
                if(self.allowE==1){
                    cc.loader.loadRes('game/fuyang/prefab/caiti/texture/caiti',cc.SpriteFrame,function (err,spriteFrame) {
                        if(err){
                            cc.log(err);
                            return;
                        }
                        self.nodeCT.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    self.ct = 1;
                }else if (self.allowE==0){
                    cc.loader.loadRes('game/fuyang/prefab/caiti/texture/caiti-1',cc.SpriteFrame,function (err,spriteFrame) {
                        if(err){
                            cc.log(err);
                            return;
                        }
                        self.nodeCT.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    self.ct = 0;
                }
            });
        }
        cc.log('node: ',node);

        this.node.emit('RCMD_ActData',data);
        let chair = this.getChairByUid(data.masterid);
        switch( this.ruleFlag &0x07)
        {
            case 0x01:  this.showPosition(chair,2);break;
            case 0x02:  this.showPosition(chair,3);break;
            case 0x04:  this.showPosition(chair,4);break;
        }
        this.activePosition(activeid,this.outTimes);
        this.updateRemainTip();
        this.nextAction();
    },
});
