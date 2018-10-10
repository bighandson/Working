cc.Class({
    extends: cc.Component,

    properties: {
        cardUp:cc.Node,
        cardDown:cc.Node,
        lightcard:cc.Node,

    },
    onLoad: function () {

        var self = this;
        self.removeChildren();
        // var MoveAct = cc.sequence(cc.moveBy(0.3, cc.p(200,0)),cc.moveBy(0.2,cc.p(0,0)),cc.callFunc(function(){
        // var MoveAct = cc.sequence(cc.moveBy(0.3, cc.p(150,0)),cc.callFunc(function(){
            // self.removeChildren();
        // }));
        // self.cardUp.runAction(MoveAct);
    },

    showLightCard:function(data,n)
    {
        // for(var i =0;i<n;i++){
        //     var pokerPrefab = cc.instantiate(gpManager.pokerPrefabS);
        //     pokerPrefab.parent = this.lightcard;
        //     //pokerPrefab.setPositionY(14);////
        //     var type = data[0];
        //     var num  = data[1];
        //     var info = data[2];
        //     var pokerController = pokerPrefab.getComponent("gppokerCtrS");
        //     pokerController.init(gpManager.pokersAtlasS,{num:num,type:type},info);
        //     if(i==1){
        //         pokerController.Scalto();
        //         pokerPrefab.active = false;
        //         var MoveAct = cc.sequence(cc.moveBy(0.3, cc.p(120,0)),cc.moveBy(0.2,cc.p(0,-42)));
        //         this.lightcard.runAction(MoveAct);
        //     }


        // }



    },

    removeChildren:function(){

        var lenth = this.cardDown.childrenCount;
        var dt = 0;
        for(var i = 0;i<lenth;i++)
        {
            this.cardDown.children[i].runAction(cc.sequence(cc.delayTime(dt),cc.removeSelf()));
            dt+=0.033;
        }
        //this.lightcard.runAction(cc.sequence(cc.delayTime(dt),cc.removeSelf()));
        // lenth = this.cardUp.childrenCount;
        // for(var i = 0;i<lenth;i++)
        // {
        //     this.cardUp.children[i].runAction(cc.sequence(cc.delayTime(dt),cc.removeSelf()));
        //     dt+=0.02;
        // }

    },

});
