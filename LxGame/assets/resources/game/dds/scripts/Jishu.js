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
        beans:{
            default:null,
            type:cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {
        // GlobEvent.on('update_UserCenter',this.updateUsercenter.bind(this));
        // this.updateUsercenter();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    updateUserCenter:function () {
        if(!!this.beans){
            this.beans.string=formatNum(UserCenter.getUserInfo().youxibiNum);
        }
    }
});
