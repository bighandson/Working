cc.Class({
    extends: cc.Component,

    properties: {
        players:{
            default:[],
            type:cc.Node
        },
        b1:cc.Node,
        b2:cc.Node,
        zhanji:cc.Node,
        jixiu:cc.Node,
        parent:cc.Node,
        yingchang:cc.Node,
        xianshi:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
         this.node.on(cc.Node.EventType.TOUCH_START, function(event){}, this);
          for(var i=0; i <this.players.length;i++ )
        {
            this.players[i].active = false;
        }
    },
    sendmessage:function(rule){
        this.rule = rule;
    },
    setflagbg:function(bVis)
    {
        this.b1.active = false;
        this.b2.active = false;
        if( bVis )
        {
            this.b1.active =true;
        }
        else
        {
            this.b2.active = true;
        }
    },
    setZhanjiVis:function(bVis)
    {
        this.zhanji.active = bVis
        this.jixiu.active = false
    },
    setwinflag:function(Index,bVisble)
    {
        this.players[Index].getChildByName("liangItem").active = bVisble
        this.players[Index].getChildByName("name").color = new cc.Color(251, 223, 123);
        this.players[Index].getChildByName("remainnum").color = new cc.Color(251, 223, 123);
        this.players[Index].getChildByName("dfeng").color = new cc.Color(251, 223, 123);
        this.players[Index].getChildByName("beishu").color = new cc.Color(251, 223, 123);
        this.players[Index].getChildByName("defen").color = new cc.Color(251, 223, 123);
    },
    setName:function(Index,Name)
    {
        this.players[Index].active = true;
        this.players[Index].getChildByName("name").getComponent(cc.Label).string = formatName(Name,8);
    },
    setRemainNum:function(Index,Num)
    {
        this.players[Index].getChildByName("remainnum").getComponent(cc.Label).string = "{0}".format(Num);
    },
    setDifeng:function(Index,Num)
    {
        this.players[Index].getChildByName("dfeng").getComponent(cc.Label).string = "{0}".format(Num);
    },
    setbeishu:function(Index,Num)
    {
        this.players[Index].getChildByName("beishu").getComponent(cc.Label).string = "x{0}".format(Num);
    },
    setdefeng:function(Index,Num)
    {
        if( Num < 0 )
        {
            this.players[Index].getChildByName("defen").getComponent(cc.Label).string = "-{0}".format(Num * -1 )
        }
        else
        {
            this.players[Index].getChildByName("defen").getComponent(cc.Label).string = "{0}".format(Num)
        }
        
    },

    onclickJiXun:function()
    {   
        cc.log("点击了开始游戏按扭")
        let self = this;
        let rule = this.node.parent.getChildByName("controller").getComponent("gandengyanRule");
        this.minpoint = this.rule.minpoint;
        this.maxpoint = this.rule.maxpoint;
        let jinbi = UserCenter.getYouxibiNum();
        let baoxian = UserCenter.getYinhanbiNum();
        cc.log('jinbi',jinbi,'baoxian',baoxian,'minpoint',this.minpoint,'maxpoint',this.maxpoint);
        if( jinbi < this.minpoint){
            if( jinbi+ baoxian < this.minpoint){
                hideLoadingAni()
                showAlertBox('账户金币不足',function () {
                    rule.onExit();
                })
            }else{
                cc.log(this.minpoint,jinbi)
                let message;
                let qugao;
                let qudi = this.minpoint - jinbi;
                if(this.maxpoint){
                    qugao = this.maxpoint - jinbi;
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
                                rule.onExit();
                                return;
                            }
                            let message ={
                                "CMD":"10003"
                            }
                            cc.log('10003',data)
                            rule.sendExpend(message,function (data) {
                                cc.log('10003',data)
                                hideLoadingAni()
                                if(data.code == 200){
                                    cc.log('gdy qu qian success');
                                    self.node.parent.getChildByName("controller").getComponent("gandengyanGame").showNormalBtn(true);
                                    self.node.removeFromParent()                                    
                                }else{
                                    showAlertBox('取钱出错，请退出游戏后重试',function () {
                                        self.closeGmae()
                                    })
                                }

                            })
                        })
                        // module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05,1.1),cc.scaleTo(0.05,1)))
                    });
                },function () {
                    rule.onExit();
                })
            }
        }else{
            let roomType = this.node.parent.getChildByName("controller").getComponent("gandengyanRule").roomType;
            if(roomType == 2){
                this.node.parent.getChildByName("controller").emit('CMD_Ready');
            }else{
                this.node.parent.getChildByName("controller").getComponent("gandengyanGame").showNormalBtn(true);
            }
            this.node.removeFromParent()
        }
        
    },
    onclickleave:function()
    {
        cc.log("点击了离开房间按扭")
        //this.node.parent.getChildByName("controller").emit('onExit');
        this.node.parent.getChildByName("controller").getComponent("gandengyanRule").backLobby()
        
    },
    onclickzhanji:function()
    {
        cc.log("点击了战绩按扭")
        this.node.active = false;
        this.node.parent.getChildByName("controller").getComponent("gandengyanRule").nextAction();
    },
    onclickyingchang:function()
    {
        this.yingchang.active =false;
        this.xianshi.active = true;
        this.parent.active = false
    },
    onclickxianshi:function()
    {
        this.yingchang.active =true;
        this.xianshi.active = false;
        this.parent.active = true;
    }
});