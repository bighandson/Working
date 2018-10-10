var exchange = require('Exchange');
var config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        goodsimg    :    cc.Sprite,
        buy         :    cc.Label,
        nums        :    cc.Label,
    },

    // use this for initialization
    onLoad: function () {

        this.node.on(cc.Node.EventType.TOUCH_START,function () {});

    },

    setData:function(data,type,num,cb){
        this.nums.string = data.dhsl;

        this.callback = cb

        this.buy.string = (data.dhje/10000) + ':;';

        let self = this;

        this.data = data;

        let pic = 'hall/shop/texture/'+type+num;

        this.data.sppic = pic;

        cc.loader.loadRes(pic,cc.SpriteFrame,function (err,spriteFrame) {
            if (err){
                cc.log(err);
                return;
            }
            self.goodsimg.spriteFrame = spriteFrame;
        })
    },
    onbuyClick:function () {
        let information = this.data;
        let self = this;
        cc.log(information)
        showAlertBox('是否确认花费' + information.dhms + '?',function () {
            exchange.exchangegoods(information.lsh,'',function (err,data) {
                if (err) {
                    cc.log(err);
                    return;
                }
                if(data.results[0].rtnState==1){
                    showAlertBox('恭喜,兑换成功!');
                    GlobEvent.emit('update_UserCenter')
                }else if(data.results[0].rtnState == 0){
                    showAlertBox('金币不足,是否充值',function () {
                        self.callback('0')
                    },function () {
                        console.log('1')
                    });
                }
            });
        },function () {
            console.log(1)
        });
    },
});
