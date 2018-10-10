cc.Class({
    extends: cc.Component,

    properties: {
        
    },
    onLoad: function () {
        this.node.getComponent(cc.Animation).play('Bomb');
        this.node.runAction(cc.sequence(cc.delayTime(1.50),cc.removeSelf()));
    },
});
