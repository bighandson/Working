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
        view : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});
    },

    onClose : function () {
        this.node.removeFromParent(true);
    },

    initdata : function (data) {
        cc.log('initdata====',data)
        let self = this

        let loadCell = function (index) {

            if (index > data.length - 1) {
                return
            }
            let info = data[index]

            loadPrefab("hall/match/jlcell", function (module) {
                module.parent = self.view

                module.getChildByName('name').getComponent(cc.Label).string = info.bsms
                module.getChildByName('time').getComponent(cc.Label).string = toData(info.ksrq)
                module.getChildByName('rank').getComponent(cc.Label).string = info.mc
                module.getChildByName('jl').getComponent(cc.RichText).string = info.jlms
                module.getChildByName('desc').active = info.zt == 0
                module.getChildByName('chakan').active = info.zt == 1
	            module.getChildByName('guoqi').active = info.zt == 2


	            module.getChildByName('chakan').on(cc.Node.EventType.TOUCH_END, function (event) {
                    //  BY Amao  二维码相关
                    showLoadingAni()
                    loadPrefab("style/qrcode/qrcode", function (module1) {
                        hideLoadingAni()

                        module1.x = cc.winSize.width / 2;
                        module1.y = cc.winSize.height / 2;
                        module1.parent = cc.director.getScene();

                        module1.getComponent('qrcodeS').initQrcode({'url' : info.qrcodeurl,'name' : info.bsms})

                        module1.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
                    });
                });

                loadCell(index + 1)
            })
        }

        loadCell(0)
    },
    
});
