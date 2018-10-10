var Zhanji = require("Zhanji")
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
        roomId      : cc.Label,
        time        : cc.Label,
        score : cc.Label
    },

    // use this for initialization
    onLoad: function () {

    },

    initInfo : function (info) {
        cc.log(info)
        this.info = info;
        this.roomId.string = info.fjhm;
        this.time.string   = info.jyrq
        this.score.string = '我的分数：'+info.ye
    },

    onShowInfo : function (info) {
        let self = this;
        Zhanji.getzhanjidetial(this.info.lsh,'',function (err,data) {
            if(err){
                cc.log(err)
                return
            }
            loadPrefab("hall/friendroom/zhanji/zjxq", function (module) {

                module.getComponent('zjxqScript').initInfo(data.results,self.info)

                GlobEvent.on('hideZJInfo',function (bool) {
                    module.removeFromParent()
                });

                // 预制体销毁的时候  移除监听事件
                module.cleanup = function () {
                    GlobEvent.removeAllListeners('hideZJInfo')
                }

                module.x = cc.winSize.width / 2 + 130;
                module.y = cc.winSize.height / 2 - 36;
                module.parent = cc.director.getScene();
            })

        })
    }
});
