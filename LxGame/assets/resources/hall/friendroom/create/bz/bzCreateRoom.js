var createRoom = require('createRoom')
cc.Class({
    extends: createRoom,

    properties: {

    },

    addKong:function () {
        cc.log('add',this.renshu)
        if(this.renshu == 5){
            if(this.kexuan.children[0].getComponent('cc.Toggle').isChecked){
                this.kexuan.children[2].getComponent('cc.Toggle').interactable = false;
                this.kexuan.children[1].getComponent('cc.Toggle').interactable = true
            }else{
                this.kexuan.children[2].getComponent('cc.Toggle').isChecked = false;
                this.kexuan.children[2].getComponent('cc.Toggle').interactable = false;
                this.kexuan.children[1].getComponent('cc.Toggle').isChecked = true;
                this.kexuan.children[1].getComponent('cc.Toggle').interactable = true
            }
        }else if(this.renshu == 6){
            if(this.kexuan.children[0].getComponent('cc.Toggle').isChecked){
                this.kexuan.children[2].getComponent('cc.Toggle').interactable = false
                this.kexuan.children[1].getComponent('cc.Toggle').interactable = false
            }else{
                this.kexuan.children[2].getComponent('cc.Toggle').isChecked = false;
                this.kexuan.children[2].getComponent('cc.Toggle').interactable = false
                this.kexuan.children[1].getComponent('cc.Toggle').isChecked = false;
                this.kexuan.children[1].getComponent('cc.Toggle').interactable = false
                this.kexuan.children[0].getComponent('cc.Toggle').isChecked = true;
            }
        }else{
            this.kexuan.children[0].getComponent('cc.Toggle').interactable = true;
            this.kexuan.children[1].getComponent('cc.Toggle').interactable = true

        }
    }

});
