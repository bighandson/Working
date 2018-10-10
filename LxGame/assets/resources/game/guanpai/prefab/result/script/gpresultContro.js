cc.Class({
    extends: cc.Component,

    properties: {
        resultNode:cc.Node,
        reultNode:cc.Node,
        exitButton:cc.Node,
        continueBtn:cc.Node,
        resultLabel:cc.Node,
        clock : cc.Node,
        time : cc.Label
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        if(gpManager.rule.roomType < 2) {
            this.exitButton.active = true;
            if(gpManager.rule.roomType==1){
                this.clock.active = true;
                this.schedule(self.daoJiShi,1)
            }else{
                this.clock.active = false;
            }
        }

    },
    daoJiShi : function () {
        let self = this;
        this.time.string --;
        if(this.time.string == 0){
            this.onclickExit();
            this.unschedule(self.daoJiShi);
        }else if(this.time.string == 5){
            showAlert('赶紧准备')
        }
    },

    onclickContinue:function(){
        let self = this;
        this.unschedule(self.daoJiShi);

        if(gpManager.rule.roomType < 2){
            if(!!gpManager.controller.minpoint){
                let jinbi = UserCenter.getYouxibiNum();
                let baoxian = UserCenter.getYinhanbiNum();
                if(jinbi < gpManager.controller.minpoint){
                    showLoadingAni()
                    if( jinbi+ baoxian < gpManager.controller.minpoint){
                        hideLoadingAni()
                        showAlertBox('账户金币不足',function () {
                            self.onclickExit();
                        })
                    }else{
                        cc.log(gpManager.controller.minpoint,jinbi)
                        let message;
                        let qugao;
                        let qudi = gpManager.controller.minpoint - jinbi;
                        if(gpManager.controller.maxpoint){
                            qugao = gpManager.controller.maxpoint - jinbi;
                            message = '请取出'+qudi+'-'+qugao+'金币'
                        }else{
                            message = '请取出至少'+qudi+'金币'
                        }

                        showAlertBox(message,function () {
                            loadPrefab("hall/bank/bank",function (module) {
                                module.x = cc.winSize.width / 2;
                                module.y = cc.winSize.height / 2;
                                module.parent = cc.director.getScene();
                                hideLoadingAni()
                                cc.log(_bnngooLoading.active)

                                module.getComponent('bankScript').setBank(qudi,qugao,1,function (err,data) {

                                    if(err){
                                        cc.log(err)
                                        self.onclickExit();
                                        return;
                                    }
                                    let message ={
                                        "CMD":"10003"
                                    }
                                    cc.log('100031',data)
                                    gpManager.rule.sendExpend(message,function (data) {
                                        cc.log('10003',data)
                                        hideLoadingAni()
                                        if(data.code == 200){
                                            self.node.parent.active = false;
                                            gpManager.controller.refreshTable();
                                            gpManager.controller.onClickReady();
                                        }else{
                                            showAlertBox('取钱出错，请退出游戏后重试',function () {
                                                self.closeGmae()
                                            })
                                        }

                                    })
                                })
                                module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05,1.1),cc.scaleTo(0.05,1)))
                            });
                        },function () {
                            self.onclickExit()
                        })
                    }
                }else{
                    this.node.parent.active = false;
                    gpManager.controller.refreshTable();
                    gpManager.controller.onClickReady();
                }

            }else{
                showAlertBox('获取金币最小值失败，请退出游戏后再试',function () {
                    self.onclickExit()
                })
            }
        }else{
            this.node.parent.active = false;
            gpManager.controller.refreshTable();
            gpManager.controller.onClickReady();
        }

    },
    onclickExit:function(){
        cc.log('ClickexitButton');
        gpManager.rule.onExit();
    },

});
