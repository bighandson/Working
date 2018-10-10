const yuhuanCardResource = require('gandengyanCardResource');
var assert = require('assert');

cc.Class({
    extends: cc.Component,

    properties: {
        players:{
          default:[],
          type:cc.Node
        },
        cardPrefab:cc.Prefab,
        shareBtn:cc.Node,
        startGameBtn:cc.Node,
        LeaveRoomBtn:cc.Node,
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
    },
    // use this for initialization
    onLoad: function () 
    {
        this.node.on(cc.Node.EventType.TOUCH_START, function(event){}, this);

        for(var i=0; i <this.players.length;i++ )
        {
            this.players[i].active = false;
        }
    },
    setVisible:function(_ChairID)
    {
        this.players[_ChairID].active = true;
    },
    //设置家信息
    setJia:function(_ChairID,JiaIndex)
    {
        let self = this;

        let wahuaitem = yuhuanCardResource.getwahuaItem();
        let spriteFrame = null;
        {
            switch(JiaIndex)
            {
                case 1: spriteFrame = wahuaitem.getSpriteFrame("tian");break;
                case 2: spriteFrame = wahuaitem.getSpriteFrame("di");break;
                case 3: spriteFrame = wahuaitem.getSpriteFrame("ying");break;
                case 4: spriteFrame = wahuaitem.getSpriteFrame("chang");break;
                default: break;
            }     
        }
        if( null != spriteFrame )
        {
            this.players[_ChairID].getChildByName("jia").getComponent(cc.Sprite).spriteFrame = spriteFrame;
        }
    },
    //设置逃花信息
    setTaoHua:function(_ChairID,bVisible)
    {
        cc.log("设置逃花信息 {0}".format(_ChairID));
        let self = this;
        self.players[_ChairID].getChildByName("taohua").active = bVisible;
    },
    setBaoDao:function (_ChairID,Num)
    {
        cc.log("设置包道",Num);
        let self = this;
        let BaoDao = self.players[_ChairID].getChildByName("BaoDao")
        let shu = BaoDao.getChildByName("shu")
        BaoDao.active = true;
        if( Num <= 0 )
        {
            shu.getComponent(cc.Label).string = ':{0}'.format(-1*Num)
            BaoDao.active = false;
        }
        else
        {
            shu.getComponent(cc.Label).string = '{0}'.format(Num)
        }
    },
    SetYePaotype:function(_ChairID,Type)
    {
        let self = this;
        let ShengZhang = self.players[_ChairID].getChildByName("ShengZhang")
        let typeName=["未压迫","杠留白","打留白","吃没送","打留花","送未送"]
        ShengZhang.getComponent(cc.Label).string = typeName[Type]
        if( Type == 0 )
        {
            ShengZhang.getComponent(cc.Label).string="";
        }
    },
    //
    setPeiDao:function(_ChairID,bVisible)
    {
        cc.log("设置陪道信息 {0}".format(_ChairID));
        let self = this;
        self.players[_ChairID].getChildByName("peidao").active = bVisible;
    },
    //设置胡牌信息
    setHu:function(_ChairID,bVisible)
    {
        let self = this;
        if( _ChairID >= 0 && _ChairID < 4)
        {
            self.players[_ChairID].getComponent(cc.Sprite).enabled= bVisible;
        }
        
    },
    //设置名字信息
    setName:function(_ChairID,Name)
    {
        let self = this;
        self.players[_ChairID].getChildByName("name").getComponent(cc.Label).string = Name;
    },
    //设置花信息
    sethuaNum:function(_ChairID,Num)
    {
        let self = this;
        let hua = self.players[_ChairID].getChildByName("hua");
        let huaNum = hua.getChildByName("huaNum")
        huaNum.getComponent(cc.Label).string = 'x{0}'.format(Num)
    },
    //设置牌信息
    setCards:function(_ChairID,CardDataArr,Score,Dif,HuPai)
    {
        let self = this;
        let scale = 0.9
        let cards = self.players[_ChairID].getChildByName("cards")
        var showKuang =false;
        for(let i=0; i < CardDataArr.length; i++)
        {
            let CardNode = cc.instantiate(self.cardPrefab);
            let CardNodeJs = CardNode.getComponent('gandengyanCard')
            CardNodeJs.ChangeCardFrameByCardData_Out(0,CardDataArr[i]);
            CardNode.scaleX = scale;
            CardNode.scaleY = scale;
            if( i == 2 )
            {
                //CardNode.x = (CardNode.width) * (cards.childrenCount-1);
                CardNode.y = 20;
                CardNode.parent = cards.children[cards.childrenCount-1];
            }
            else
            {
                CardNode.x = (CardNode.width) * (cards.childrenCount)+Dif;
                CardNode.setLocalZOrder(100-cards.childrenCount)
                CardNode.parent = cards;
            }
           
            if( i == 0 )
            {
                let ScoreNode = CardNode.getChildByName("Score")
                ScoreNode.active = true;
                ScoreNode.getComponent(cc.Label).string = '{0}'.format(Score)
            }
            if( CardDataArr[i] == HuPai && showKuang == false)
            {
                let CardKuang = CardNode.getChildByName("kuang")
                CardKuang.active = true;
                showKuang = true;
            }
        }
    },
    //设置计道数
    setdaoShu:function(_ChairID,Num)
    {
        let self = this;
        let shu = self.players[_ChairID].getChildByName("daoShu").getChildByName("shu")
        if( Num < 0 )
        {
            shu.getComponent(cc.Label).string = ':{0}'.format(-1*Num)
        }
        else
        {
            shu.getComponent(cc.Label).string = '{0}'.format(Num)
        }
    },
    //设置总道数
    settotalDaoShu:function(_ChairID,Num)
    {
        let self = this;
        let shu = self.players[_ChairID].getChildByName("totalDaoShu").getChildByName("shu")
        if( Num < 0 )
        {
            shu.getComponent(cc.Label).string = ':{0}'.format(-1*Num)
        }
        else
        {
            shu.getComponent(cc.Label).string = '{0}'.format(Num)
        }
    },
    //设置两数
    setliang:function(_ChairID,Num)
    {
        let self = this;
        let liang = self.players[_ChairID].getChildByName("liang")
        if( Num >= 0 )
        {
            liang.getComponent(cc.Label).string = '+{0} 两'.format(Num)
        }
        else
        {
            liang.getComponent(cc.Label).string = '{0} 两'.format(Num)
        }
        
    },
    setyapo:function(_ChairID,bVisible)
    {
        let self = this;
        let yapo = self.players[_ChairID].getChildByName("yapo");
        yapo.active = bVisible;
    },
    //
    setLeaveRoomBtnVisible:function(bVisible)
    {
        this.LeaveRoomBtn.active = bVisible;
    },
    //分享按扭响应
    onClickShareBtn:function()
    {
        cc.log("点击了分享按扭")
        this.node.removeFromParent();
    },
    //开始游戏按扭响应
    onClickStargGameBtn:function()
    {
        cc.log("点击了开始游戏按扭")
        this.node.parent.getChildByName("controller").emit('CMD_Ready');
        this.node.removeFromParent()
    },
    //离开房间按扭响应
    onClickLeaveRoomBtn:function()
    {
        cc.log("点击了离开房间按扭")
        //this.node.parent.getChildByName("controller").emit('onExit');
        //this.node.parent.getChildByName("controller").getComponent("gandengyanRule").exitGame()
        this.node.active = false;
        this.node.parent.getChildByName("controller").getComponent("gandengyanRule").nextAction();
    },
});
