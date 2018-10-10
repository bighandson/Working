const CfgChat = require("CfgChat");
cc.Class({
    extends: cc.Component,

    properties: {
        anim:cc.Animation
    },

    // use this for initialization
    onLoad: function () {
        this.controller = cc.find('Canvas/controller');
        this.animation = this.anim.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,    this);
    },
    playAnim:function(chair,index)
    {
        if(!this.chair)
        {
            this.chair =    chair;
        }
        let animState = this.animation.play("look"+index+"Anim");
        animState.wrapMode = cc.WrapMode.Loop;
        animState.repeatCount = CfgChat.lookAnimData[index-1];
    },

    onFinished:function()
    {
        this.controller.emit("HIDE_CHAT_MSG",this.chair);
    },

    onDestroy:function()
    {
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
