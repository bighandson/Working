var Yaoqing = require('Yaoqing');
var recharge = require('Recharge');
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        yqm : cc.Label,
        promoter:cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
        this.promoter.getComponent('PromoterPorpBox').setPromoter(4);
    },
    onYanZheng : function () {
        let self = this;
        this.password = this.yqm.string;
        cc.log('验证 : ',this.password);
        Yaoqing.yanzhengYaoqing(self.password,'',function (err,data) {
            if(err){
                showAlertBox(data.message)
                return
            }else{
                cc.log(data)
                showAlertBox(data.message,function () {
                    Yaoqing.sendYaoqing(self.password,'',function (err,data) {
                        if(err){
                            showAlertBox(data.message)
                            return
                        }
                        if(!!data.results.length){
                            UserCenter.setList(data.results[0].list);
                            GlobEvent.emit('update_UserCenter')
                        }
                        recharge.clearList();
                        GlobEvent.emit('Yaoqingtip');
                        showAlertBox(data.message)
                    })
                })
            }
        })
    },
    onYaoqingtip:function (data,password) {
        var path = 'style/{0}/prefab2/bangding/tips'.format(config.resourcesPath);
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            //hideLoadingAni();
            if (err) {
                cc.log('load prefab failed:', path);
                return;
            }
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            module.getComponent('style2yaoqingtip').onShow(data,password);
        });

    },

    // 返回大厅
    onclose: function () {
        this.node.removeFromParent(true);
    },
});
