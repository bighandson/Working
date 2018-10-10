var Bank = require('Bank');
cc.Class({
    extends: cc.Component,

    properties: {
        baoxianxiang: cc.Label,
        youxidou: cc.Label,
        input: cc.Label,
        cunru : cc.Node,
        clock : cc.Node,
        time : cc.Label,
        promoter:cc.Node,
        quanCun : cc.Node
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        });
        this.clock.active = false;
        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
        this.updateUsercenter();
        this.promoter.getComponent('PromoterPorpBox').setPromoter(12)
    },
    setRoom:function (post) {
        this.post = post;
    },
    // 游戏内 调用保险箱
    setBank : function (qudi,qugao,ifDao,cb) {
        let self = this;
        this.cunru.active = false;

        this.qudi = qudi;
        this.quanCun.active = false;
        this.input.string = qudi;
        this.qugao = qugao||10000000;
        this.cb = cb;
        if(ifDao){
            this.clock.active = true;
            this.time.string = 10;
            this.schedule(self.daoJiShi,1)
        }

    },
    daoJiShi : function () {
        let self = this;
        this.time.string --;
        if(this.time.string == 0){
            this.onClickBack();
            this.unschedule(self.daoJiShi);
        }
    },
    onClicklNum: function (event, num) {
        this.input.string =  parseInt(this.input.string)||0;
        this.input.string += parseInt(num)*10000;
        // this.je = parseInt(num)*10000;
    },
    onClickClear:function () {
        this.input.string = ''
    },
    onClickCQ: function (event, num) { //1 存 2 取
        let self = this;
        showLoadingAni();
        let inputJE = parseInt(this.input.string);
        cc.log(inputJE)

        if(!inputJE){
            hideLoadingAni()
            showAlert('请输入金额')
            return;}

        if(!!this.qudi  && !!this.cb){
            cc.log(this.qudi,this.qugao)
            if(inputJE >= this.qudi && inputJE <= this.qugao){
                Bank.changeBank(parseInt(num) - 1,inputJE, '',function (err,data) {
                    self.input.string = '';
                    if(err){
                        showAlertBox(data);
                        self.cb(err,data)
                        return
                    }
                    self.cb(null,data)
                    self.node.removeFromParent(true);
                    hideLoadingAni()
                })

            }else{
                hideLoadingAni()
                showAlertBox('取钱数量错误');
            }
        }else{
            Bank.changeBank(parseInt(num) - 1,inputJE, '',function (err,data) {
                self.input.string = '';
                if(err){
                    hideLoadingAni()
                    showAlertBox(data);
                    return
                }else {
                    if(self.post){
                        self.post();
                    }
                    hideLoadingAni()
                }

            })
        }
    },
    onClickAll: function (event, num) { //1 all存入  2 全部取出
        if (num == 1) {
            this.input.string = UserCenter.getUserInfo().youxibiNum;
        } else {
            if(this.qugao){
                this.input.string = UserCenter.getUserInfo().yinhanbiNum > this.qugao?this.qugao:UserCenter.getUserInfo().yinhanbiNum;
            }else{
                this.input.string = UserCenter.getUserInfo().yinhanbiNum;
            }

        }
        this.onClickCQ(null,num)



    },
    updateUsercenter: function () {
        if(this.baoxianxiang){
            this.baoxianxiang.string = UserCenter.getUserInfo().yinhanbiNum;
        }
        if(this.youxidou){
            this.youxidou.string = UserCenter.getUserInfo().youxibiNum;
        }

    },

    // 返回大厅
    onClickBack: function () {
        if(!!this.cb){
            this.cb(1)
        }
        this.node.removeFromParent(true);
    },
});
