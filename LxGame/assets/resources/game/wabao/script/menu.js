var Rank = require("Rank");
var config = require("Config");
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
        rankContent1:cc.Node,
        rankContent2:cc.Node,
        rankView:cc.ScrollView,
    },

    // use this for initializatio
    onLoad: function () {
        this.loadMenuing();
        
    },
    //加载菜单栏（当前寻宝和往期开奖期数）
    loadMenuing:function(){
        this.showMenu('1');
    },
    
    //当前寻宝和往期开奖期数切换
    showMenu:function(type){
        this.rankContent1.removeAllChildren(true);
        this.rankContent2.removeAllChildren(true);
        
        let self = this;

        if(2 == type){
            Rank.getWanqi(null,function(err,data){
                if(err){
                    cc.log('err',err);
                }else{
                    // PastData.setData(data.results);
                    
                    let len = data.results.length;
                    var path = "game/wabao/prefab/kaijiang".format(config.resourcesPath);
                    cc.loader.loadRes( path , function(err,prefab){
                        if(err){
                            cc.log("err",err);
                            return;
                        }
                        for(var i =0; i<len; i++){
                            let node = cc.instantiate(prefab);
                            let js = node.getComponent('style2menuitem');
                            js.initWanqiUI(i + 1,data.results[i]);
                            node.parent = self.rankContent2;
                           
                        }
                    });
                }
            });
        }else{
            Rank.getLSH('',function(err,data){
                if(err){
                    cc.log('err',err);
                    return;
                }else{
                    // WabaoData.setSerialData(data.results);//保存流水号信息
                    let len = data.results.length; 
                    let message = data.message;
                    var path ="game/wabao/prefab/wealth".format(config.resourcesPath);
                    cc.loader.loadRes(path,function(err,prefab){
                        if(err){
                            cc.log('err',err);
                            return;
                        }
                        for(var i = 0;i<len;i++){
                            let node = cc.instantiate(prefab);
                            let js = node.getComponent('style2menuitem');
                            js.initXunbaoUI(data.results[i]);
                            node.parent = self.rankContent1;
                        }
                    });
                }
            });
        }
    },
    onChange:function(event,num){
        SettingMgr.playSound(config.clickEffect);
        if(1 == num){
            this.showMenu('1');
        }else{
            this.showMenu('2');
        }
    },
 
});
