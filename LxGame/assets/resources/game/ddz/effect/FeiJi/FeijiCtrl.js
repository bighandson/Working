cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

        this.node.getComponent(cc.Animation).play('feiji');
        this.node.runAction(cc.sequence(cc.delayTime(18*0.05),cc.removeSelf()));
    },


});
