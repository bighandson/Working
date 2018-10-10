
const MJCardResource = require('MJCardResource');
const MJTye = require('MJType');
const config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        number : cc.Label,
        iBD   : cc.Node,
        Tou : cc.Node,
        hf : cc.Node,
        hfnum : cc.Label,
    },

    setBD : function (iBD,isBD) {
        if(!MJTye.invalidPai(iBD)){
            this.iBD.active = false;
            return;
        }
        if(!this.BDCard){
            this.BDCard = new cc.Node().addComponent('MJCard');
            // this.BDCard.node.scale = 0.5;
            // this.BDCard.node.scale = 0.5;
            this.BDCard.node.parent = this.iBD;
        }
        this.iBD.active = true;
        this._setCard(iBD);
        // this.BDCard.clearBDTag();
        // if(isBD){
        //     this.BDCard.setBDTag();
        // }else{
        //     this.BDCard.clearBDTag();
        // }
    },
    setTou :function (iToua,iToub) {
        let self = this;
        if(!!iToua&&!!iToub){
            self.Tou.active = true;
            cc.loader.loadRes("style/mahjong/mah/texture/die", cc.SpriteAtlas, function (err, atlas) {
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
        // let frame = MJCardResource.getInHandImageByChair(0,value);
        let frame = MJCardResource.getExtraImageByChair(0,value);
        this.BDCard.setCard(value,frame);
        // this.BDCard.setBDTag(0,false);
        // this.BDCard.setBDKuangTag(0,true);
    }
});
