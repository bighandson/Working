cc.Class({
    extends: cc.Component,

    properties: {
        hintNode:cc.Node
    },
    onLoad: function () {
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,    this);

    },

    onFinished:function()
    {
        // this.node.removeFromParent(true);
        this.node.active = false;
    },

    /**
     *
     * @param sprite 提示资源
     */
    onShow:function(sprite)
    {
        let self = this;
        self.node.active = false;
        self.hintNode.getComponent(cc.Sprite).spriteFrame  = sprite;
        self.node.active = true;
        self.animation.play('jiaodizhuAni');
    }
});
