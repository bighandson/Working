var config = require('Config');
var ZFQD = require('Constants').ZFQD;
var Recharge = require('Recharge');
var User = require('User');
cc.Class({
    extends: cc.Component,

    properties: {
        goodsimg:cc.Sprite,
        buy:cc.Label,
        goods : cc.Label,
        sc : cc.Node,
        noSc : cc.Node,
    },

 
    onLoad: function () {
        this.sc.active = false;
        this.noSc.active = false;
    },

    setData:function(data,type,num) {
        let self = this;
        this.sc.active = !!data.scbz;
        this.noSc.active = !data.scbz &&  !!data.fjsl;
        if(data.fjsl >=  10000){
            this.noSc.getChildByName('zs').getComponent(cc.Label).string = data.fjsl/10000 + ':;'
        }else{
            this.noSc.getChildByName('zs').getComponent(cc.Label).string = data.fjsl
        }

        if (data.spsl >=  10000) {
            this.goods.string = data.spsl/10000 + '万';
        } else {
            this.goods.string = data.spsl;
        }

        this.buy.string =':'+ data.je/100;
        
        let pic = 'hall/shop/texture/'+type+num;

        cc.loader.loadRes(pic, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            self.goodsimg.spriteFrame = spriteFrame;
        });

        this.data = data;
    },
    onBuyClick:function (){
        cc.log(this.data);
        showLoadingAni();
        let self = this;
        if(this.data.zfqd == ZFQD.wxpay){    // 微信支付
            Recharge.sendWeChatPay(this.data.spbh,this.data.zfqd,this.data.scbz);
        }else if(this.data.zfqd == ZFQD.ipa){  // 苹果支付
            //add by sword 2017-12-11
            //todo:
            let expendjson = {
                buildid:Device.getBundleVersion(),
                os: Device.getOS()
            }
            let expend = this.data.scbz + '$$jsonstr=' + JSON.stringify(expendjson) ;
            cc.log("onBuyClick:",expend);
            //Recharge.sendIPAPay(this.data.iap,this.data.spbh,this.data.scbz);
            Recharge.sendIPAPay(this.data.iap,this.data.spbh,expend);
        }else if(this.data.zfqd == ZFQD.qiye){
            let expendjson = {
                scbz : this.data.scbz,
                dhspbh : ''
            }
            Recharge.sendH5Pay(this.data.spbh,JSON.stringify(expendjson),function (err,data) {
                if(err){
                    cc.log(err);
                    return
                }
                cc.log(data);
                Recharge.setShop(true);
                Device.goWebURL(data);

            })
        }
    },


});
