cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    onLoad: function () {
        this.node.getComponent(cc.Animation).play('SiWang');
        this.node.runAction(cc.sequence(cc.delayTime(1.8),cc.removeSelf()));
    },
});
