cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad: function () {

        this.node.getComponent(cc.Animation).play('fog');
        this.node.runAction(cc.sequence(cc.delayTime(12*0.05),cc.removeSelf()));
    },

});
