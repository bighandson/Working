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
        maskNode        : cc.Node,
        jiesan          : cc.Node,
        likai           : cc.Node,
        wanfa           : cc.Node,
        shezhi          : cc.Node,
        tuoguan         : cc.Node,
        yuyin           : cc.Node,
        kuaijieliaot    : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        // this.tuoguan.active = false
        // this.wanfa.active = false
    },

    onSetMenuShow : function () {
        cc.log(this.maskNode.active)
        this.maskNode.active = !this.maskNode.active;
    },

    setRoomShow : function (roomtype) {
        if (roomtype < 2) {
            // this.yuyin.active = false;
            this.jiesan.active = false;
        }else if(roomtype >20){
            this.jiesan.active = false;
            this.tuoguan.active = false;
        }
        else{
            this.likai.active = false;
        }
    },
});
