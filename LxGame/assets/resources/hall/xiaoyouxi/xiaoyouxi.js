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
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            self.node.removeFromParent(true);
            return true;
        });
    },

    clickWakuang : function () {
        showLoadingAni();

        cc.director.loadScene('wabao',function (err) {
            hideLoadingAni();
        });  
    },

    clickDadishu : function () {
        showLoadingAni();
        
        cc.director.loadScene('sad4',function (err) {

        });
    },
});
