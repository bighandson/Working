var LoadGame = require('LoadGame')
cc.Class({
    extends: cc.Component,

    properties: {
        promoter : cc.Node,
        miMa : cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.promoter.getComponent('PromoterPorpBox').setPromoter(6)
    },
    setMessage:function(gameid, tableid, num){
        this.gameid = gameid;
        this.tableid = tableid;
        this.num = num;
    },
    onClickOk:function () {
        let self = this;
        if(!!this.miMa.string){
            LoadGame.enterFreeGame(self.gameid, self.tableid, self.num, 2, self.miMa.string,0,0);
            this.node.removeFromParent(true);
        }else{
            showAlertBox('密码不为空')
        }
    },
    onClickCancel : function () {
        this.node.removeFromParent(true);
    },
});
