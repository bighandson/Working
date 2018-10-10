var createRoom = require('createRoom')
cc.Class({
    extends: createRoom,

    properties: {

    },

    // use this for initialization

    addKong:function () {
        cc.log('add',this.renshu)
        if(this.renshu == 5){
            this.wanfa.children[0].getComponent('cc.Toggle').isChecked = false;
            this.wanfa.children[0].getComponent('cc.Toggle').interactable = false;
            this.wanfa.children[1].getComponent('cc.Toggle').isChecked = true;
            this.wanfa.children[1].getComponent('cc.Toggle').interactable = false

        }else{
            this.wanfa.children[1].getComponent('cc.Toggle').interactable = true
            this.wanfa.children[0].getComponent('cc.Toggle').interactable = true;
        }


        //     var wanfa = (!!SssManager.ruleInfo.m_bAllTeShuCardType ? "红波浪" : "多一色")
        //     var zhifu = ((SssManager.ruleInfo.m_expend & 0x01) == 0x01 ? "AA支付" : "房主支付")
        //     var renshu = SssManager.ruleInfo.m_nTruePlayers;
        //
        //     let str = wanfa + "  " + zhifu + "  " + renshu + "人"
        //     // + ' 底分:' + ((expend >> 8) & 0xf);
        //
        //     return str;
    }
});
