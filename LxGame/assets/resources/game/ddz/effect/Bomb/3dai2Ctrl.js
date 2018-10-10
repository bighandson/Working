cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    onLoad: function () {
    	this.animation = this.node.getComponent(cc.Animation);
    	 this.animation.on('finished',  this.onFinished,    this);
        // this.node.getComponent(cc.Animation).play('3dai2Ani');
        // this.node.runAction(cc.sequence(cc.delayTime(16*0.05),cc.removeSelf()));
    },
    onFinished:function()
    {
        GlobEvent.emit('chuntianFinished');
        this.node.removeFromParent(true);
    },
});
