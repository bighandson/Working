var config = require("Config");
var Rank = require("Rank");
// var controller = require('style2TopController');
// var menu = require("menu");
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
         // ...
         
    },

    // use this for initialization
    onLoad: function () { 
       
    },
    //点击下注
    onClickKg:function(event,type){
        showLoadingAni()
        SettingMgr.playSound(config.clickEffect);

        //TODO:获取往期开奖信息，判断该用户是否在上期获奖,并给出具体获奖期数及奖励
        // Rank.getWanqi('',function(err,data){
        //     if(err){
        //         cc.log("err",err);
        //         return;
        //     }else{
        //         let period = data.results[0].name;//期数
        //         let id = data.results[0].userid;//玩家id
        //         let award = data.results[0].jlje;//奖励


        //     }
        // });

        if(1 == type ){
            var number = 1;//雇佣矿工人数
            var beans = number*10000;//消耗游戏豆
        }else if(2 == type){
            var number = 5;
            var beans = number*10000;   
        }else if(3 == type){
            var number = 10;
            var beans = number*10000;
        }
        cc.log(UserCenter.getYouxibiNum());
        if(beans > UserCenter.getYouxibiNum()){
            cc.log("游戏豆不足，请充值");
            // showAlertBox("游戏豆不足，请充值");
            this.judgeBeans();
        }else{
            let mining1 = cc.find("Canvas/background/wabao1");
            let anim1 = mining1.getComponent(cc.Animation); 

            let mining2 = cc.find("Canvas/background/wabao2");
            let anim2 = mining2.getComponent(cc.Animation); 

            let mining3 = cc.find("Canvas/background/wabao3");
            let anim3 = mining3.getComponent(cc.Animation); 

            anim1.play("wabao");
            anim2.play("wabao");
            anim3.play("wabao");

            Rank.getXiazhu('',number,function(err ,data){
                hideLoadingAni()
                if(err){
                    cc.log("err",err);
                    return;
                }else{
                    cc.log("下注成功后的返回的数据",data);
                    //点击按钮后，默认显示当前寻宝
                    let menu = cc.find("Canvas/background/kuanggong/menu");
                    let toggle1 = cc.find("Canvas/background/kuanggong/menu/toggleGroup/Toggle1");
                    let toggle2 = cc.find("Canvas/background/kuanggong/menu/toggleGroup/Toggle2");
                    let current = menu.getComponent("menu");
                    let message = data.message;

                    toggle1.getComponent(cc.Toggle).isChecked = true;
                    toggle2.getComponent(cc.Toggle).isChecked = false;
                    current.showMenu("1");


                    //更新最新游戏豆余额
                    let yxd = data.results[0].zhye;
                    UserCenter.setYouxibiNum(yxd);
                    cc.log("下注成功后账户余额",yxd);
                    let dou = cc.find("Canvas/background/dou/beans");
                    dou.getComponent(cc.Label).string = formatNum(yxd);

                    
                    let jl = data.results[0].dbjl;
                    let nownum = data.results[0].gmsl;
                    let allnum = data.results[0].kgsl;
                    // let message = '恭喜您成功雇佣'+nownum+'个矿工，获取宝藏的几率大大增加，目前您的总矿工数为'+allnum+'人,获取宝藏的几率为'+jl+'';
                    
                    //获取开奖信息
                    let  hj = data.results[0].infolist;//是否获奖 获奖：不为空
                    if(hj != ''){
                        cc.log("获奖玩家信息:",hj)
                        let period = data.results[0].infolist[0].name;
                        let name = data.results[0].infolist[0].yhnc;
                        let award = data.results[0].infolist[0].zjzhye;
                        let id = data.results[0].infolist[0].zjyh;
                        let jl = data.results[0].infolist[0].zjzhye;
                        let zhlx = parseInt(data.results[0].infolist[0].zjzhlx);

                        if(id == UserCenter.getUserID()){   
                            showAlertBox("恭喜您,您在第"+period+"成功挖到"+formatNum(jl)+(zhlx==3?'金币':'钻石')
                            +"!系统已自动将奖励发放到您的账号。请到游戏大厅查看");
                            if(zhlx == 3){
                                UserCenter.setYouxibiNum(yxd+award);
                                dou.getComponent(cc.Label).string = formatNum(yxd+award);
                            }else if(zhlx == 4){
                                UserCenter.userInfo.fangkaNum += award;
                            }
                           
                        }else{
                            showAlertBox("很遗憾，您在第"+period+"期未获得奖励,请再接再厉。");
                        }   
                        cc.log("获奖奖励",award);
                       
                        // GlobEvent.emit("hjmessage",id,period,award);
                        // GlobEvent.emit('update_UserCenter');
                    }
                    showAlertBox(message);//购买成功提醒

                    //  //获取当前寻宝最新的数据
                    //  Rank.getLSH('',function(err,data){
                    //     if(err){
                    //         cc.log('err',err);
                    //         return;
                    //     }else if(data.status == false){
        
                    //         //TODO:服务端返回的开奖状态
                    //         var path ="style/niuniu/prefab2/wabao/prefab/nowealth".format(config.resourcesPath);
                    //         cc.loader.loadRes(path,function(err,prefab){
                    //             if(err){
                    //                 cc.log('err',err);
                    //                 return;
                    //             }
                    //             let node = cc.instantiate(prefab);
                    //             let js = node.getComponent('style2Rankitem');
                    //             js.init_noXunbaoUI(data);
                    //             node.parent = self.rankContent1;
                    //         });
                    //         return;
                    //     }else{
                    //         let len = data.results.length; 
                    //         // cc.log("len的长度",len);
                    //         var path ="style/niuniu/prefab2/wabao/prefab/wealth".format(config.resourcesPath);
                    //         cc.loader.loadRes(path,function(err,prefab){
                    //             if(err){
                    //                 cc.log('err',err);
                    //                 return;
                    //             }
                    //             for(var i = 0;i<len;i++){
                    //                 let node = cc.instantiate(prefab);
                    //                 let js = node.getComponent('style2Rankitem');
                    //                 js.initXunbaoUI(data.results[i]);
                    //                 let content = cc.find("Canvas/background/kuanggong/menu/ScrollView/content");
                    //                 content.removeAllChildren(true);
                    //                 node.parent = content;
                    //             }
                    //         });
                    //     }
                    // });
                }
            });
        }
        
    },
    //判断当前游戏豆都可以选择雇佣多少矿工
    judgeBeans:function(){
        let bean = UserCenter.getYouxibiNum();
        if(bean >= 100000){
            cc.log("三个均可按");
        }else if(bean < 100000 &&　bean >= 50000){
            cc.log("前两个可按");
            let button3 = this.node.getChildByName("kg3");
            button3.getComponent(cc.Button).interactable = false;
            button3.getComponent(cc.Button).interactable = true;
            showAlertBox("当前金币不足,请充值");
        }else if(bean < 50000 &&　bean >= 10000){
            cc.log("第一个可按");
            let button2 = this.node.getChildByName("kg2");
            // let button3 = this.node.getChildByName("kg3");

            button2.getComponent(cc.Button).interactable = false;
            button2.getComponent(cc.Button).interactable = true;
            // button3.getComponent(cc.Button).interactable = false;
            showAlertBox("当前金币不足，请充值");
        }else if(bean < 10000 && bean >=0){
            cc.log("弹游戏豆不足框时,同时三个按钮均不可选");
            let button1 = this.node.getChildByName("kg1");
            // let button2 = this.node.getChildByName("kg2");
            // let button3 = this.node.getChildByName("kg3");

            button1.getComponent(cc.Button).interactable = false;
            button1.getComponent(cc.Button).interactable = true;
            // button2.getComponent(cc.Button).interactable = false;
            // button3.getComponent(cc.Button).interactable = false;
            showAlertBox("当前金币不足，请充值");
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    //     this.judgeBeans();
    // },
});
