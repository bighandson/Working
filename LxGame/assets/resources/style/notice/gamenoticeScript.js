cc.Class({
    extends: cc.Component,

    properties: {
        notice:cc.Node,
        labaMsg : cc.Label
    },

    // use this for initialization
    onLoad: function () {
        GlobEvent.on('addChatMsg', this.addChatMsg.bind(this))
        this.notice.active = false;
        this.msgList= []
    },
    addChatMsg: function (data) {
        cc.log(data)
        let control
        if(cc.find('Canvas/controller')){
            control = cc.find('Canvas/controller').getComponent('MJGame')
        }

        if(control){
            if(control.roomType !=1 ){
                return
            }
        }else if(SssManager.rule && SssManager.rule.roomType ){
            if(SssManager.rule.roomType !=1){
                return
            }
        }else if(gpManager.rule && gpManager.rule.roomType){
            if(gpManager.rule.roomType !=1){
                return
            }
        }

        cc.log('push')
        if(!this.msgList){
            return;
        }
        this.msgList.push(data)
        this.onLabaShow()
    },
    onLabaShow: function () {
        if (!!this.notice.active  || this.msgList.length == 0) {
            return;
        }

        this.notice.active = true
        // if (this.Index < this.msgList.length - 1) {
        //     this.Index++
        // } else {
        //     this.Index = 0;
        // }


        let m = this.msgList.shift();  // 删除第一位
        cc.log(m)
        this.labaMsg.string = '['+m.nickName+'] :'+ m.msg

        this.labaMsg.node.x = 250

        let self = this;

        let time = Math.abs(-300 - self.labaMsg.node.width) / 50

        this.labaMsg.node.runAction(cc.sequence(
            cc.moveTo(time, -300 - self.labaMsg.node.width, self.labaMsg.node.y),
            cc.callFunc(function () {
                self.notice.active = false;
                self.onLabaShow()
            })
        ))
    },
    onDestroy: function () {
        GlobEvent.removeListener('addChatMsg', this.addChatMsg.bind(this));
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
