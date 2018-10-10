var config = require("Config")
var Yaoqing = require('Yaoqing');
var User = require('User');
var recharge = require('Recharge');

cc.Class({
    extends: cc.Component,

    properties: {
        headImg     : cc.Sprite,
        nc          : cc.Label,
        id          : cc.Label,
        ip          : cc.Label,
        qianming    : cc.Label,
        tongbao     : cc.Label,
        jinbi       : cc.Label,
        zuanshi     : cc.Label,
        realName    : cc.Button,
        realCell    : cc.Button,
        realNamed   : cc.SpriteFrame,
        realCelled  : cc.SpriteFrame,
        manToggle   : cc.Toggle,
        womanToggle : cc.Toggle,
        nameInput   : cc.EditBox,
        gxqmInput   : cc.EditBox,
        changeDone  : cc.Node,
        change      : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
        GlobEvent.on('update_RZ', this.updateRZ.bind(this));
        GlobEvent.on('update_Head', this.loadHead.bind(this));
        this.updateUsercenter();
        this.updateRZ();
        this.loadHead();

        this.nameInput.node.active = false;
        this.gxqmInput.node.active = false; 
        this.changeDone.active = false

        this.node.cleanup = function () {
            GlobEvent.removeListener('update_UserCenter', self.updateUsercenter.bind(self));
            GlobEvent.removeListener('update_RZ', self.updateRZ.bind(self));
            GlobEvent.removeListener('update_Head', self.loadHead.bind(self));
        }
    },

    loadHead: function () {
        
        let tx = UserCenter.userInfo.picture;
        let sex = UserCenter.userInfo.xb;
        let sexs = sex == 1 ? 'man' : 'woman';

        if (!isUrl(tx)) {
            tx = 'commonRes/other/' + sexs;
        }
        let self = this;

        loadHead(tx, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            self.headImg.spriteFrame = spriteFrame;
            // self.headImg.node.setContentSize(150,150);
        });

        this.manToggle.isChecked = sex == 1
        this.womanToggle.isChecked = sex != 1
    },
    // 返回大厅
    onClickBack: function () {
        let xb = this.manToggle.isChecked ? 1: 2;
        User.changeSex(xb,'');
        this.node.removeFromParent(true);
    },

    // 战绩
    onClickZhanji: function () {
        loadPrefab("hall/usercenter/zhanji1/zjNode", function (module) {
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
        })
    },

    //点击金币按钮  进入商城中心
    onClickJinbi : function () {
        loadPrefab("hall/shop/shop",function (module) {
            module.getComponent('shopScript')._selectToggle('0')

            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            
            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))
        });
    },

    //点击钻石按钮  进入商城中心
    onClickZuanshi : function () {
        loadPrefab("hall/shop/shop",function (module) {
            module.getComponent('shopScript')._selectToggle('1')

            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))   
        });
    },

    //邀请码
    onClickYaoQingma: function () {
        let self = this;
        Yaoqing.getYaoqing('', function (err, data) {
            if (err) {
                cc.log(err);
                return;
            }
            let les = data.results;
            cc.log(data.results)
            if (les[0].zt == 3) {
                loadPrefab("hall/yqm/yqm", function (module) {
                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();
                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
                });
            } else if(les[0].zt == 2){
                showAlertBox(data.message)

            } else {
                let password = data.results[0].yqm;
                showAlertBox(data.message,function () {
                    Yaoqing.sendYaoqing(password,'',function (err,data) {
                        if(err){
                            showAlertBox(data)
                            return
                        }
                        if(!!data.results.length){
                            UserCenter.setList(data.results[0].list);
                            GlobEvent.emit('update_UserCenter')
                        }
                        recharge.clearList();
                        showAlertBox(data.message)
                    })
                }),function () {
                    Yaoqing.sendGou(1)
                }
            }
        })
    },

    // 实名认证
    onClickRZ: function () {
        loadPrefab("hall/renzhen/renzhen", function (module) {
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },

    // 绑定
    onClickBD: function () {
        loadPrefab("hall/renzhen/bdphone", function (module) {
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },


    // 切换账号
    onClickBackLogin: function () {
        pomelo.removeAllListeners();
        if(!!PomeloClient.isConnected){
            pomelo.disconnect();
        }
        PomeloClient.isConnected = false;
        cc.director.loadScene(config.loginScene)
        //切换账号 清除私有信息
        GlobEvent.emit('ClearMessage');
    },

    // 修改昵称
    onChangeName : function () {
        this.nameInput.node.active = true;
        this.gxqmInput.node.active = true;
        this.changeDone.active = true;
        this.nc.node.active = false;
        this.qianming.node.active = false;
        this.change.active = false

        this.nameInput.string =  UserCenter.getUserInfo().nc
        this.gxqmInput.string =  UserCenter.getUserInfo().gxqm
    },

    onChangeDone : function () {
        this.nameInput.node.active = false;
        this.gxqmInput.node.active = false;
        this.changeDone.active = false;
        this.nc.node.active = true;
        this.qianming.node.active = true;
        this.change.active = true

        let name = this.nameInput.string == '' ? UserCenter.getUserInfo().nc : this.nameInput.string
        let qianm  = this.gxqmInput.string == '' ? UserCenter.getUserInfo().gxqm : this.gxqmInput.string
        let sex = this.manToggle.isChecked ? 1: 2;

        User.changeUser(name,sex,qianm);
    },


    updateUsercenter: function () {

        this.jinbi.string = UserCenter.getUserInfo().youxibiNum;

        this.zuanshi.string = UserCenter.getUserInfo().fangkaNum;

        this.tongbao.string = UserCenter.getUserInfo().jinbiNum;

        this.id.string = UserCenter.getUserInfo().userid;

        this.nc.string = UserCenter.getUserInfo().nc;

        this.ip.string = UserCenter.getUserInfo().loginip;

        this.qianming.string = UserCenter.getUserInfo().gxqm;


    },
    update_Head : function () {
        this.loadHead();
    },
    updateRZ : function () {
        if (UserCenter.getUserInfo().rzzt == '01') {
            this.realName.interactable = false;
            this.realName.getComponent(cc.Sprite).spriteFrame = this.realNamed;//更改帧
        } else {
            this.realName.interactable = true;
        }
        if (UserCenter.getUserInfo().bdbz) {
            this.realCell.interactable = false;
            this.realCell.getComponent(cc.Sprite).spriteFrame = this.realCelled;//更改帧
        } else {
            this.realCell.interactable = true;
        }
    }
});
