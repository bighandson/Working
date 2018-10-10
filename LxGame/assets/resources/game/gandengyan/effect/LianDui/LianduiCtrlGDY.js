cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

        this.node.getComponent(cc.Animation).play('liandui');
        this.node.runAction(cc.sequence(cc.delayTime(1.80),cc.removeSelf()));
    },


});
