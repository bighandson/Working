var createRoom = require('createRoom')
cc.Class({
    extends: createRoom,

    properties: {

    },

    // use this for initialization

    addKong:function () {
        cc.log('add',this.renshu)
        if(this.renshu == 4){
            this.wanfa.children[1].getComponent('cc.Toggle').isChecked = false;
            this.wanfa.children[0].getComponent('cc.Toggle').isChecked = true;
            this.wanfa.children[0].getComponent('cc.Toggle').interactable = false
            this.wanfa.children[1].getComponent('cc.Toggle').interactable = false

        }else{
            this.wanfa.children[1].getComponent('cc.Toggle').isChecked = true;
            this.wanfa.children[0].getComponent('cc.Toggle').isChecked = false;
            this.wanfa.children[0].getComponent('cc.Toggle').interactable = false
            this.wanfa.children[1].getComponent('cc.Toggle').interactable = false
        }
    }
});
