var LoadGame = require('LoadGame');
const MJCardResource = require('MJCardResource');
const MJTye = require('MJType');

cc.Class({
    extends: cc.Component,

    properties: {
        number : cc.Label,
        iBD   : cc.Node,
        Tou : cc.Node,
        hf : cc.Node,
        hfnum : cc.Label,
        caishen : cc.Sprite
    },
    onLoad : function () {
        let self = this;
        cc.loader.loadRes("game/mahjong/MJCards/card_hands", cc.SpriteAtlas, function (err, atlas) {
            if(err) {
                cc.log(err);
                return;
            }
            self.caishen.spriteFrame =  atlas.getSpriteFrame('top_hand');
        });
    },

    setBD : function (iBD,isBD) {

        if(!MJTye.invalidPai(iBD)){
            this.iBD.active = false;
            return;
        }
        if(!this.BDCard){
            this.BDCard = new cc.Node().addComponent('MJCard');
            this.BDCard.node.scale = 0.5;
            this.BDCard.node.scale = 0.5;
            this.BDCard.node.parent = this.iBD;
        }
        this.iBD.active = true;
        this._setCard(iBD);
        // this.BDCard.clearBDTag();
        var move1 = cc.moveBy(1,cc.p(520,-352));
        var move2 = cc.moveBy(1,cc.p(-520,352));
        var move3 = cc.moveBy(3,cc.p(0,0));
        var scale1 = cc.scaleTo(1,2,2);
        var scale2 = cc.scaleTo(1,0.5,0.5);
        this.BDCard.node.runAction(cc.sequence(cc.spawn(move1,scale1),move3,cc.spawn(move2,scale2)));
        // if(isBD){
        //     this.BDCard.setBDTag();
        // }else{
        //     this.BDCard.clearBDTag();
        // }
    },
    setTou :function (iToua,iToub) {
        let self = this;
        this.game = LoadGame.getCurrentGame();
        cc.log('setTou : ',iToua,iToub);
        if(!!iToua&&!!iToub){
            self.Tou.active = true;
            cc.loader.loadRes("game/mahjong/{0}/mah/texture/die".format(this.game.mahScene), cc.SpriteAtlas, function (err, atlas) {
                if(err) {
                    cc.log(err);
                    return;
                }
                self.Tou.children[0].getComponent(cc.Sprite).spriteFrame =  atlas.getSpriteFrame(iToua.toString());
                self.Tou.children[1].getComponent(cc.Sprite).spriteFrame =  atlas.getSpriteFrame(iToub.toString());
            });

        }else{
            this.Tou.active = false;
        }


    },
    hideTou: function () {
        this.Tou.active = false;
    },
    hideBD : function () {
        this.iBD.active = false;
    },

    sethfnum :function (num,tx) {
        let self = this;
        if(num>0){
            this.hf.active = true;
            this.hfnum.string = '×'+num;
            if (!!tx) {
                getSpriteFrameByUrl(tx, function (err, spriteFrame) {
                    if (err) {
                        return;
                    }
                    self.hf.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });
            }
        }
        else {
            this.hf.active = false;
        }
    },
    hidefunum : function () {
        this.hf.active = false;
    },

    updateRemainTip : function (number) {
        this.number.string = number;
    },

    _setCard : function (value) {
        let frame = MJCardResource.getInHandImageByChair(0,value);
        this.BDCard.setCard(value,frame);
    }
});
