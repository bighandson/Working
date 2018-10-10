var Jiuji = require('Jiuji')
cc.Class({
    extends: cc.Component,

    properties: {
        lingqu:cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        });
        this.shuaLing()

    },
    shuaLing : function () {
        let self = this;
        this.lingqu.interactable = false;
        showLoadingAni()
        Jiuji.getCishu('',function (err,data) {
            hideLoadingAni()
            if(err){
                cc.log(data)
                return
            }
            if(data.results[0].receive_count){
                let money = UserCenter.getUserInfo().yinhanbiNum + UserCenter.getUserInfo().youxibiNum
                if(money <5000){
                    self.lingqu.interactable = true;
                }
            }
        })
    },
    onClickLing : function () {
        let self = this;
        showLoadingAni()
        Jiuji.getJiuji('',function (err,data) {
            if(err){
                hideLoadingAni()
                cc.log(data)
                return
            }
            self.onClose()
            showAlertBox('领取'+data.results[0].integral+'金币',function () {
                UserCenter.setList(data.results[0].rtnstr);
                GlobEvent.emit('update_UserCenter')
            })
        })
    },
    onClose : function () {
        this.node.removeFromParent(true);
    },
});
