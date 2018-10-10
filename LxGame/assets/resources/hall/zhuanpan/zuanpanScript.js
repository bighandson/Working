var ZhuanPan = require('ZhuanPan');
var config = require('Config');
var Share = require('Share');
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
        animation: {
            default: null,
            type: cc.Animation
        },
        touch: {
            default: null,
            type: cc.Node
        },

        shilianzhuan: {
            default: null,
            type: cc.Node
        },
        guangquan: {
            default: null,
            type: cc.Node
        },
        audio: {
            default: [],
            url: cc.AudioClip
        },
        choujiang: cc.Button,
        fenxiang: cc.Button,
        sanwan: cc.Node,
        mf: cc.Node

    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        });
        this.animation.getComponent(cc.Animation).getAnimationState('zhuanpan').on('finished', this.onFinished1, this);
        var fadeTo1 = cc.fadeTo(1, 0);
        var fadeTo2 = cc.fadeTo(1, 255);
        this.guangquan.runAction(cc.repeatForever(cc.sequence(fadeTo1, fadeTo2)));
        GlobEvent.on('WXShare',this.shareCallback.bind(this));
        this.jlsl= [10000,20000,30000,50000,100000,300000,500000,1000000];
        this.touch = true;
        this.shuaZP()

        //this.v = SettingMgr.getEffectVolume();
    },
    shuaZP:function () {
        let self = this;
        ZhuanPan.getZhuanPan('',function (err,data) {
            if(err){
                console.log(data)
                return
            }
            if(data.results[0].is_share){
                self.fenxiang.interactable = true;
            }else{
                self.fenxiang.interactable = false;
            }
            if(!!data.results[0].is_share_use){
                self.choujiang.interactable = true
                self.mf.active = true
                self.sanwan.active = false
            }else if(!!data.results[0].cost_use >0){
                self.choujiang.interactable = true
                self.sanwan.active = true
                self.mf.active = false
            }else{
                self.choujiang.interactable = false
                self.sanwan.active = false;
                self.mf.active = false
            }


        })
    },
    onShare: function () {
        Share.shareToWX(1);
    },
    shareCallback : function (code) {

        if(code != 0) return;
        let self = this;
        Share.checkShare(function () {
            self.shuaZP()
        });

    },

    mousedown: function () {
        var self = this;
        if(!this.touch){
            return;
        }
        let zhuan = function () {
            self.scheduleOnce(function () {
                self.audio4 = SettingMgr.playSoundByMp3(self.audio[3]);
            }, 0.01);
            self.scheduleOnce(function () {
                self.audio1 = SettingMgr.playSoundByMp3(self.audio[0]);
            }, 0.45);
            self.scheduleOnce(function () {
                self.audio1 = SettingMgr.playSoundByMp3(self.audio[0]);
            }, 0.95);
            self.scheduleOnce(function () {
                self.audio3 = SettingMgr.playSoundByMp3(self.audio[2]);
            }, 1.5);

            self.y = 0;

            ZhuanPan.getJiang('', function (err, data) {
                if (err) {
                    cc.log(err);
                    return;
                }
                if (!!data.results.length) {
                    cc.log(data);
                    let num = self.jlsl.indexOf(data.results[0].integral)
                    switch (num) {
                        case 0:
                            self.y = 10;
                            break;
                        case 1:
                            self.y = 6;
                            break;
                        case 2:
                            self.y = 4
                            break;
                        case 3:
                            self.y = 8;
                            break;
                        case 4:
                            self.y = 11;
                            break;
                        case 5:
                            self.y = 9;
                            break;
                        case 6:
                            self.y = 7;
                            break;
                        case 7:
                            self.y = 5;
                            break;
                        default:
                            break;
                    }
                    cc.log(self.y);
                    self.touch = false;
                    self.anim = self.animation.getComponent(cc.Animation);
                    self.animState1 = self.anim.getAnimationState('zhuanpan');
                    self.animState1.repeatCount = 4 + self.y * 0.125;
                    self.animState1.speed = 3.05;
                    self.shuaZP()
                    self.anim.play('zhuanpan');
                    self.scheduleOnce(function () {
                        self.touch = true;
                        showAlertBox('恭喜获得'+data.results[0].integral+'金币',function () {
                            UserCenter.setList(data.results[0].rtnstr);
                            GlobEvent.emit('update_UserCenter')
                        })
                    }, 4.2);
                }
            });
        }

        if(!this.mf.active){
            showAlertBox('是否花费3万金币进行转盘抽奖',function () {
                if(UserCenter.getYouxibiNum()>= 30000){
                    UserCenter.updateYouxibiNum(-30000);
                    GlobEvent.emit('update_UserCenter')
                    zhuan();
                }else{
                    showAlertBox('身上金币不足')
                }

            },function () {
                console.log(1)
            })
        }else{
            zhuan();
        }



    },
    // mousedown10:function () {
    //     var self=this;
    //     self.y=0;
    //     self.information=new Object();
    //     self.shilianzhuan.active = false;
    //     self.touch.active = false;
    //     if(config.jgm == '013'){
    //         ZhuanPan.getZhuanPanFANGka(10,'',function (err,data) {
    //             if (err) {
    //                 cc.log(err);
    //                 return;
    //             }
    //             if (!!data.results.length) {
    //                 let i=0;
    //                 self.schedule(function () {
    //                     self.scheduleOnce(function () {
    //                         self.audio4=SettingMgr.playSoundByMp3(self.audio[3]);
    //                     },0.01);
    //                     self.scheduleOnce(function () {
    //                         self.audio1=SettingMgr.playSoundByMp3(self.audio[0]);
    //                     },0.45);
    //                     self.scheduleOnce(function () {
    //                         self.audio1=SettingMgr.playSoundByMp3(self.audio[0]);
    //                     },0.95);
    //                     self.scheduleOnce(function () {
    //                         self.audio3=SettingMgr.playSoundByMp3(self.audio[2]);
    //                     },1.5);
    //                     self.djbh1 = data.results[0].luckylist[i].djbh;
    //                     switch (self.djbh1) {
    //                         case '03':
    //                             self.y = 8;
    //                             self.information.showpic='style/{0}/texture/ZPimg/card_1'.format(config.resourcesPath);
    //                             self.information.jlsl='1张房卡';
    //                             break;
    //                         case '07':
    //                             self.y = 4;
    //                             self.information.showpic='style/{0}/texture/ZPimg/10huafei'.format(config.resourcesPath);
    //                             self.information.jlsl='10元话费';
    //                             break;
    //                         case '08':
    //                             self.y = 6;
    //                             self.information.showpic='style/{0}/texture/ZPimg/card_5'.format(config.resourcesPath);
    //                             self.information.jlsl='30张房卡';
    //                             break;
    //                         case '06':
    //                             self.y = 10;
    //                             self.information.showpic='style/{0}/texture/ZPimg/card_4'.format(config.resourcesPath);
    //                             self.information.jlsl='8张房卡';
    //                             break;
    //                         case '04':
    //                             self.y = 9;
    //                             self.information.showpic='style/{0}/texture/ZPimg/card_2'.format(config.resourcesPath);
    //                             self.information.jlsl='3张房卡';
    //                             break;
    //                         case '05':
    //                             self.y = 5;
    //                             self.information.showpic='style/{0}/texture/ZPimg/card_3'.format(config.resourcesPath);
    //                             self.information.jlsl='5张房卡';
    //                             break;
    //                         case '02':
    //                             self.y = 3;
    //                             self.information.showpic='style/{0}/texture/ZPimg/thank'.format(config.resourcesPath);
    //                             self.information.jlsl='谢谢参与！';
    //                             break;
    //                         case '01':
    //                             self.y = 7;
    //                             self.information.showpic='style/{0}/texture/ZPimg/thank'.format(config.resourcesPath);
    //                             self.information.jlsl='谢谢参与！';
    //                             break;
    //                         default:
    //                             break;
    //                     }
    //                     self.touch.active = false;
    //                     self.shilianzhuan.active = false;
    //                     self.anim=self.animation.getComponent(cc.Animation);
    //                     self.animState1=self.anim.getAnimationState('zhuanpan');
    //                     self.animState1.repeatCount=4+self.y*0.125;
    //                     self.animState1.speed=3.05;
    //                     self.anim.play('zhuanpan');
    //                     i++;
    //                     if (i==10){
    //                         self.scheduleOnce(function () {
    //                             self.touch.active = true;
    //                             self.shilianzhuan.active = true;
    //                         },5);
    //                     }
    //                 },6,9,0.1);
    //
    //             }
    //
    //         });
    //     }else {
    //         ZhuanPan.getZhuanPan(10,'',function (err,data) {
    //             if (err) {
    //                 cc.log(err);
    //                 return;
    //             }
    //             if (!!data.results.length) {
    //                 let i=0;
    //                 self.schedule(function () {
    //                     self.scheduleOnce(function () {
    //                         self.audio4=SettingMgr.playSoundByMp3(self.audio[3]);
    //                     },0.01);
    //                     self.scheduleOnce(function () {
    //                         self.audio1=SettingMgr.playSoundByMp3(self.audio[0]);
    //                     },0.45);
    //                     self.scheduleOnce(function () {
    //                         self.audio1=SettingMgr.playSoundByMp3(self.audio[0]);
    //                     },0.95);
    //                     self.scheduleOnce(function () {
    //                         self.audio3=SettingMgr.playSoundByMp3(self.audio[2]);
    //                     },1.5);
    //                     self.djbh1 = data.results[0].luckylist[i].djbh;
    //                     switch (self.djbh1) {
    //                         case '01':
    //                             self.y = 8;
    //                             self.information.showpic='style/{0}/texture/ZPimg/2000dou'.format(config.resourcesPath);
    //                             self.information.jlsl='20000颗豆';
    //                             break;
    //                         case '02':
    //                             self.y = 4;
    //                             self.information.showpic='style/{0}/texture/ZPimg/88888dou'.format(config.resourcesPath);
    //                             self.information.jlsl='88888颗豆';
    //                             break;
    //                         case '03':
    //                             self.y = 6;
    //                             self.information.showpic='style/{0}/texture/ZPimg/1jinbi'.format(config.resourcesPath);
    //                             self.information.jlsl='1枚金币';
    //                             break;
    //                         case '04':
    //                             self.y = 10;
    //                             self.information.showpic='style/{0}/texture/ZPimg/3jinbi'.format(config.resourcesPath);
    //                             self.information.jlsl='5枚金币';
    //                             break;
    //                         case '05':
    //                             self.y = 9;
    //                             self.information.showpic='style/{0}/texture/ZPimg/1fangka'.format(config.resourcesPath);
    //                             self.information.jlsl='1张房卡';
    //                             break;
    //                         case '06':
    //                             self.y = 5;
    //                             self.information.showpic='style/{0}/texture/ZPimg/3fangka'.format(config.resourcesPath);
    //                             self.information.jlsl='3张房卡';
    //                             break;
    //                         case '07':
    //                             self.y = 3;
    //                             self.information.showpic='style/{0}/texture/ZPimg/10huafei'.format(config.resourcesPath);
    //                             self.information.jlsl='10元话费';
    //                             break;
    //                         case '08':
    //                             self.y = 7;
    //                             self.information.showpic='style/{0}/texture/ZPimg/thank'.format(config.resourcesPath);
    //                             self.information.jlsl='谢谢参与！';
    //                             break;
    //                         default:
    //                             break;
    //                     }
    //                     self.touch.active = false;
    //                     self.shilianzhuan.active = false;
    //                     self.anim=self.animation.getComponent(cc.Animation);
    //                     self.animState1=self.anim.getAnimationState('zhuanpan');
    //                     self.animState1.repeatCount=4+self.y*0.125;
    //                     self.animState1.speed=3.05;
    //                     self.anim.play('zhuanpan');
    //                     i++;
    //                     if (i==10){
    //                         self.scheduleOnce(function () {
    //                             self.touch.active = true;
    //                             self.shilianzhuan.active = true;
    //                         },5);
    //                     }
    //                 },6,9,0.1);
    //
    //             }
    //
    //         });
    //     }
    //
    //
    // },

    onFinished1: function () {
        var self = this;
        setTimeout(function () {
            // self.loadReceive();
        }, 50);
    },

    loadReceive: function () {
        let self = this;
        loadPrefab('{0}/prefab/ReceiveBoxes'.format(config.resourcesPath), function (box) {
            box.x = cc.winSize.width / 2;
            box.y = cc.winSize.height / 2;
            box.parent = cc.director.getScene();
            self._box = box.getComponent('style2ReceiveBoxes');
            self._box.setZPanreceive(self.information);
        });
    },
    onClose: function () {
        var self = this;
        SettingMgr.stopSound(self.audio3);
        SettingMgr.stopSound(self.audio1);
        SettingMgr.stopSound(self.audio4);
        this.node.removeFromParent();
    },

});
