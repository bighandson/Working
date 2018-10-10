var MJCommand = require('MJCommand')
var Jiuji = require('Jiuji')
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        wanjia          : cc.Node,
        winLose         : cc.Node,
        tuichu : cc.Node,
        box : cc.Node,
        huType: cc.Label,
        huBeat : cc.Label,
        difen:cc.Label,
        jushu : cc.Node,
        clock : cc.Node,
        time : cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
    },
    daoJiShi : function () {
        let self = this;
        this.time.string --;
        if(this.time.string == 0){
            this.closeGmae();
            this.unschedule(self.daoJiShi);
        }
    },

    show : function (data,rule,huInfo) {
        this.time.string = 30;
        this.rule = rule;
        let self = this;
        cc.log(rule.roomType)
        this.game = this.rule.game;
        if(rule.roomType == 2 ){
            this.clock.active = false;
            this.tuichu.active = false
            this.difen.node.active = false;
            data.sort(function (a, b) {
                return b.score - a.score;
            });

        }else{
            this.clock.active = true;
            this.schedule(self.daoJiShi,1)
            this.difen.node.active = true;
            this.difen.string ='底分：'+   this.rule.baseMoney;
            data.sort(function (a, b) {
                return b.curwon - a.curwon;
            });
            this.tuichu.active = true;
        }

         this.wanjia.children.forEach(function (item,index) {
             if(index > data.length-1){
                 item.active = false
             }else{
                 if(index == 0){

                     let huString = '';
                     let hutype1 = huInfo.data.hutype1;
                     for(let hukey in self.game.hutype1){
                         if(hutype1 & hukey){
                             huString += self.game.hutype1[hukey] + ' ';
                         }
                     }
                     if(!!self.game.hutype2){
                         let hutype2 = self.huInfo.data.hutype2;
                         for(let hukey2 in self.game.hutype2){
                             if(hukey2 & hutype2){
                                 huString += self.game.hutype2[hukey2] + ' ';
                             }
                         }
                     }

                     self.huType.string = self._getHuFlag(huInfo.data.huflag) + huString;
                     self.huBeat.string = data[index].fanShu;
                 }
                 item.getChildByName('name').getComponent(cc.Label).string = data[index].nick;
                 item.getChildByName('id').getComponent(cc.Label).string = data[index].userid;
                 if(data[index].userid == UserCenter.getUserID()){
                     if(data[index].curwon >= 0 ){
                         self.winLose.getChildByName('win').active = true;
                         self.winLose.getChildByName('lose').active = false;
                     }else{
                         self.winLose.getChildByName('win').active = false;
                         self.winLose.getChildByName('lose').active = true;
                     }
                 }
                 let zf = data[index].curwon <0  ? '-' : '+'
                 item.getChildByName('jinbi').getComponent(cc.Label).string = zf +  Math.abs(data[index].curwon);
                 let tx = data[index].userImage;
                 let sexs = data[index].sex ==1 ? 'man':'woman';
                 if (!isUrl(tx)){
                     tx = 'commonRes/other/'+sexs;
                 }
                 getSpriteFrameByUrl(tx, function (err,spriteFrame) {
                     if (err){
                         cc.log(err);
                         return;
                     }
                     item.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                     item.getChildByName('head').setContentSize(150,150);
                 });

             }

         })
    },


    // 关闭
    onclose: function () {
        this.node.removeFromParent(true);
    },

    /**
     * 分享到微信
     * @param event
     * @param to 0 : 微信好友 1 ： 微信朋友圈
     */
    onShareToWXScene : function (event,to) {
        var self = this;
        if(!!self._isShareing) return;
        self._isShareing = true;/****xxxx***aaaa****bbbb*****cccc****dddd****/
        var shareTo = parseInt(to);
        var prePos = this.box.getPosition();
        this.box.setPosition(cc.p(0,0));
        captureScreen(this.box,cc.size(cc.director.getVisibleSize().width, 750),function (err,path) {
            self._isShareing = false;
            self.box.setPosition(prePos);
            if(err){
                cc.log(err);/****xxxx***aaaa****bbbb*****cccc****dddd****/
                return;
            }
            wxapi.sendImageToWxReq(path,shareTo);
        });
    },


    //继续游戏
    goOnGame : function () {
        let self = this;
        this.unschedule(self.daoJiShi);
        cc.log(this.rule)
        if(this.rule.roomType < 2){
            if(!!this.rule.minpoint){
                let jinbi = UserCenter.getYouxibiNum();
                let baoxian = UserCenter.getYinhanbiNum();
                if(jinbi < this.rule.minpoint){
                    if( jinbi+ baoxian < this.rule.minpoint){
                        // if(jinbi < 5000){
	                       //  Jiuji.getCishu('',function (err,data) {
		                     //    hideLoadingAni()
		                     //    if(err){
			                   //      cc.log(data)
			                   //      showAlertBox('账户金币不足',function () {
				                 //        self.closeGmae();
			                   //      })
			                   //      return
		                     //    }
		                     //    if(data.results[0].receive_count){
			                   //      showAlertBox('账户金币不足,有救济金可以领取，请返回大厅领取',function () {
				                 //        self.closeGmae();
			                   //      })
		                     //    }else{
			                   //      showAlertBox('账户金币不足',function () {
				                 //        self.closeGmae();
			                   //      })
                        //     }
	                       //  })
                        // }else{
	                        showAlertBox('账户金币不足',function () {
		                        self.closeGmae();
	                        })
                        // }
                    }else{
                        cc.log(this.minpoint,jinbi)
                        let qugao  ;
                        if(this.rule.maxpoint){
                            qugao = this.rule.maxpoint - jinbi;
                        }else{
                            qugao = 10000000 - jinbi;
                        }
                        let qudi = this.rule.minpoint - jinbi;
                        let message = '请取出'+qudi+'-'+qugao+'金币';

                        showAlertBox(message,function () {
                            loadPrefab("hall/bank/bank",function (module) {
                                module.x = cc.winSize.width / 2;
                                module.y = cc.winSize.height / 2;
                                module.parent = cc.director.getScene();
                                module.getComponent('bankScript').setBank(qudi,qugao,true,function (err,data) {
                                    if(err){
                                        cc.log(err)
                                        hideLoadingAni()
                                        self.closeGmae();
                                        return;
                                    }
                                    let message ={
                                        "CMD":"10003"
                                    }
                                    cc.log('100031',data)
                                    self.rule.sendExpend(message,function (data) {
                                        cc.log('10003',data)
                                        hideLoadingAni()
                                        if(data.code == 200){
                                            self.rule.setBD(0);
                                            self.rule.node.emit('msg_onceAgain');
                                            self.node.removeFromParent(true);
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
                            self.closeGmae()
                        })
                    }
                }else{
                    self.rule.setBD(0);
                    self.rule.node.emit('msg_onceAgain');
                    self.node.removeFromParent(true);
                }

            }else{
                showAlertBox('获取金币最小值失败，请退出游戏后再试',function () {
                    self.closeGmae()
                })
            }
        }else{
            self.rule.setBD(0);
            self.rule.node.emit('msg_onceAgain');
            self.node.removeFromParent(true);
        }
    },

    //退出房间
    closeGmae : function () {
        this.rule.node.emit('onExit');
        this.node.removeFromParent(true);
    },
    _getHuFlag : function (huFlag) {
        cc.log('huFlag', huFlag);
        switch (huFlag){
            case 0:
                return '';
            case MJCommand.HUFLAG.MJR_HU_ZM:
                return '自摸';
            case MJCommand.HUFLAG.MJR_HU_GSKH:/****xxxx***aaaa****bbbb*****cccc****dddd****/
                return '杠上开花';
            case MJCommand.HUFLAG.MJR_HU_TH:
                return '天胡';
            case MJCommand.HUFLAG.MJR_HU_DH:
                return '地胡';
            case MJCommand.HUFLAG.MJR_HU_QG:/****xxxx***aaaa****bbbb*****cccc****dddd****/
                return '抢杠';
            case MJCommand.HUFLAG.MJR_HU_GSKH2:
                return '后杠';/****xxxx***aaaa****bbbb*****cccc****dddd****/
            case MJCommand.HUFLAG.MJR_HU_HDLY:
                return '海底捞月';/****xxxx***aaaa****bbbb*****cccc****dddd****/
            default:
                return '胡';
        }
    }

});
