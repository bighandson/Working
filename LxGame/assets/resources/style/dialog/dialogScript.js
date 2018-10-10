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

        tipTxt : cc.Label,
        no : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },

    show : function (msg,okCb,cancelCb) {
        this.tipTxt.string = msg ? msg : 'null';
        this.okCb = okCb
        this.cancelCb = cancelCb
        this.no.active = !!cancelCb
    },

    onOk : function () {
        if (this.okCb) {this.okCb()}
        this.node.removeFromParent(true);   
    },

    onCancel : function () {
        if (this.cancelCb) {this.cancelCb()}
        this.node.removeFromParent(true);
    },

    onColse : function () {
        this.node.removeFromParent(true);
    },

});
