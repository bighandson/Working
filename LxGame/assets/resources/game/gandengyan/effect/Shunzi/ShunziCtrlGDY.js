cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

        this.node.getComponent(cc.Animation).play('Shunzi');
        this.node.runAction(cc.sequence(cc.delayTime(1.50),cc.removeSelf()));
    },


});
