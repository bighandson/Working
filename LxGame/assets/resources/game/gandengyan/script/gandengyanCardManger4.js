var assert = require('assert');
cc.Class({
    extends: cc.Component,

    properties: {
        cardPrefab:cc.Prefab,
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
        this.m_ChiGangNum = 0
        this.m_Card_Hand = [];//手牌数组
        this.m_Card_Out = []//已出牌
        this.m_Card_CurOut = this.node.getChildByName("CurOutCard");//当前出的牌
        this.m_Card_Xian = this.node.getChildByName("XianCard")
        this.m_Card_Get = this.node.getChildByName("GetCard");//新取的牌
        this.m_HandCardParentNode1 = this.node.getChildByName("HandCardParentNode1");//手牌第一排父节点
        this.m_HandCardParentNode2 = this.node.getChildByName("HandCardParentNode2");//手牌第二排父节点
        this.m_OutCardParentNode = this.node.getChildByName("OutCardParentNode");//已出牌父节点
        this.m_ChiGangCardParentNode = this.node.getChildByName("ChiGangCardParentNode");//吃扛牌父节点

        this.m_CardNumStr = this.node.getChildByName("CardNum").getChildByName("CardNumStr")
        this.m_OutCard = this.node.getChildByName("OutCard")
        this.m_CardNum = 0;
        
        //this.removeAllCards();
        this.removeAllCardsGDY();
    },
    setChairID:function( _ChairID )
    {
        this.m_ChairID = _ChairID;
    },//增加手牌
    getChairID:function()
    {
        return this.m_ChairID;
    },

    addHandCardsGDY:function(Cards)
    {
        assert(Cards != null,"增加手牌失败 Cards == null");
        for(let i=0; i < Cards.length; i++ )
        {
            this.addHandCardGDY(Cards[i]);
        }
    },
    addHandCardGDY:function(Card)
    {
         this.m_CardNum += 1
         this.m_CardNumStr.getComponent(cc.Label).string = this.m_CardNum.toString()
         this.m_CardNumStr.parent.active = true;
    },
    addHandCards:function(Cards)
    {
        assert(Cards == null,"增加手牌失败 Cards == null");
        for(let i=0; i < Cards.length; i++ )
        {
            this.addHandCard(Cards[i],false);
        }
    },
    //Card 牌值  bGet是否为新取牌
    addHandCard:function(Card,bGet)
    {
        assert(Card != null,"Card==null");
        if( true == bGet )
        {//新取的牌
            var CardJs_Ge = this.m_Card_Get.getComponent("gandengyanCard");
            CardJs_Ge.setChairID(this.m_ChairID);
            CardJs_Ge.setCardData(Card);
            this.m_Card_Get.active = true;
            CardJs_Ge.ChangeCardFrameByCardData_Hand(this.m_ChairID,Card);
        }
        else
        {
            var Card_Hand = this._createOneCard(Card);
            let CardNodeJs = Card_Hand.getComponent('gandengyanCard');
            CardNodeJs.ChangeCardFrameByCardData_Hand(this.m_ChairID,Card);
            this.m_Card_Hand.push(Card_Hand);
            if( this.m_HandCardParentNode2.childrenCount <= 10 )
            {
                Card_Hand.parent = this.m_HandCardParentNode2;
            }
            else
            {
                Card_Hand.parent = this.m_HandCardParentNode1;
            }
        }
    },
    removeHandCard:function(Card)
    {
        let self = this;
        if( self.m_Card_Get.active )
        {
            self.m_Card_Get.active = false;
            return;
        }
        if( self.m_Card_Hand.length >= 1 )
        {
            self.m_Card_Hand[self.m_Card_Hand.length-1].removeFromParent(true);
            self.m_Card_Hand.splice(self.m_Card_Hand.length-1,1);
            return;
        }
        assert(false,"删除手牌时失败");
    },

    removeHandCardGDY:function(Card)
    {
        this.m_CardNum -= Card.length
        this.m_CardNumStr.getComponent(cc.Label).string = "{0}".format(this.m_CardNum)
        if( this.m_CardNum <= 0 )
        {
            this.m_CardNumStr.parent.active = false;
        }
    },
    getHandCardData:function()
    {
        let CardData = [];
        if( self.m_Card_Get.active )
        {
            CardData.push(this.m_Card_Get.getComponent("gandengyanCard").getCardData());
        }
        for(let i=0; i < this.m_Card_Hand.length; i++)
        {
            CardData.push(this.m_Card_Hand[i].getComponent("gandengyanCard").getCardData());
        }
        return CardData;
    },
    ShowFlower:function(bVisible,OutCard)
    {
        let self = this;
        this.m_Card_Flower = this._createOneCard(111);
        this.m_Card_Flower.setScale(2.5)
        let CardNodeJs = this.m_Card_Flower.getComponent("gandengyanCard");
        CardNodeJs.ChangeCardFrameByCardData_Out(0,OutCard);

        let PlayerParent = this.node.parent.getChildByName("players")
        PlayerParent.addChild(this.m_Card_Flower)
        this.m_Card_Flower.x = -50
        let Player  = PlayerParent.getChildByName("p"+this.m_ChairID)
        let hua = Player.getChildByName("hua")

        var callback = function(pSender)
        {
            pSender.active =false;
            var aciton1 = cc.scaleTo(0.5, 2, 2);
            var easeIn = aciton1.easing(cc.easeIn(3.0));
            var action2 = cc.scaleTo(0.5,1,1)
            var easeOut = action2.easing(cc.easeOut(3.0))
            var seq = cc.sequence(easeIn,easeOut)
            hua.runAction(seq)
        }

        
        var delaytime = cc.delayTime(0.7);
        var moveto = cc.moveTo(0.5,Player.x,Player.y)
        var scale = cc.scaleTo(0.5, 1, 1);
        var spawn = cc.spawn(moveto,scale)
        var finished = cc.callFunc(callback, self.m_Card_Flower, 0);
        var seq = cc.sequence(delaytime,spawn, finished);
        self.m_Card_Flower.runAction(seq)
    },
    ShowXianCard:function(bVisible,OutCard)
    {
        let self = this;
        self.m_Card_Xian.active =  bVisible;
        if( false == bVisible )
        {
            return;
        }
        self.m_Card_Xian.getComponent('gandengyanCard').ChangeCardFrameByCardData_CurOut(this.m_ChairID , OutCard);
        self.m_Card_Xian.getComponent('gandengyanCard').setCardData(OutCard);

        var callback = function(pSender)
        {
            self.m_Card_Xian.active =false;
        }

        var delaytime = cc.delayTime(3);
        var finished = cc.callFunc(callback, self.m_Card_Xian, 0);
        var seq = cc.sequence(delaytime, finished);
        self.m_Card_Xian.runAction(seq)
    },
    addCurOutCard:function(OutCard)
    {
        let self = this;
        self.m_Card_CurOut.active = true;
        self.m_Card_CurOut.getComponent('gandengyanCard').ChangeCardFrameByCardData_CurOut(this.m_ChairID , OutCard);
        self.m_Card_CurOut.getComponent('gandengyanCard').setCardData(OutCard);
        self.m_Card_CurOut.setScale(2.5);
        var callback = function(pSender)
        {
            cc.log("显示完成")
            self.m_Card_CurOut.active =false;
            self.addOutCard(self.m_Card_CurOut.getComponent('gandengyanCard').getCardData());
        }
        var delaytime = cc.delayTime(5);
        var finished = cc.callFunc(callback, self.m_Card_CurOut, 0);
        var seq = cc.sequence(delaytime, finished);
        self.m_Card_CurOut.runAction(seq)
    },
    //增加一张出的牌
    addOutCard:function(OutCard)
    {
        let CardNode = this._createOneCard(OutCard);
        let CardNodeJs = CardNode.getComponent("gandengyanCard");
        CardNodeJs.ChangeCardFrameByCardData_Out(this.m_ChairID,OutCard);
        CardNode.parent = this.m_OutCardParentNode;
        this.m_Card_Out.push(CardNode);
    },

    addOutCardGDY:function(OutCard)
    {
        for( var i = 0; i < OutCard.length; i++ )
        {
            let CardNode = this._createOneCardGDY(OutCard[i]);
            CardNode.parent = this.m_OutCard
        }
    },
    //查找一张吃扛牌
    getCardFromChePengCard:function(CardData)
    {
        let children = this.m_ChiGangCardParentNode.children;
        for(let i = 0; i <children.length; i++ )
        {
            let CardJs = children[i].getComponent("gandengyanCard");
            if( CardJs.getCardData() == CardData )
            {
                return children[i];
            }
        }
        return null;
    },
    getCardByCardData:function(CardData)
    {
        let self =  this;
        if( self.m_Card_Get.active )
        {
            return self.m_Card_Get;
        }
        if( self.m_Card_Hand.length >= 1 )
        {
            self.m_Card_Hand[0];
        }
    },
    //查找一张出的牌
    getCardJsFromOutCard:function(CardData)
    {
        let children = this.m_OutCardParentNode.children;
        for(let i = 0; i <children.length; i++ )
        {
            let CardJs = children[i].getComponent("gandengyanCard");
            if( CardJs.getCardData() == CardData )
            {
                return CardJs;
            }
        }
        return null;
    },
     removeOutCardGDY:function()
    {
        this.m_OutCard.removeAllChildren(true)
    },
    //移除一张出的牌
    removeOutCard:function(CardData)
    {
        let self = this;
        if( self.m_Card_CurOut.active == true )
        {
            self.m_Card_CurOut.stopAllActions();
            self.m_Card_CurOut.active = false;
            return;
        }
        for(let i=0; i < this.m_Card_Out.length; i++ )
        {
            let CardNodeJs = this.m_Card_Out[i].getComponent("gandengyanCard");
            if( CardNodeJs.getCardData() == CardData )
            {
                this.m_Card_Out[i].removeFromParent(true);
                this.m_Card_Out.splice(i,1);
                return;
            }
        }
        assert(false,"移除一张出的牌 失败");
        cc.log("移除一张出的牌 失败");
    },
    //移除手牌
    removeAllCards_Hand:function()
    {
        this.m_HandCardParentNode1.removeAllChildren(true);
        this.m_HandCardParentNode2.removeAllChildren(true);
        this.m_Card_Hand.splice(0,this.m_Card_Hand.length);
        this.m_Card_Get.active = false;
    },
    //移除所有的牌
    removeAllCards:function()
    {
        this.removeAllCards_Hand();
        this.m_OutCardParentNode.removeAllChildren(true);
        //this.m_ChiGangCardParentNode.removeAllChildren(true);
        this.m_Card_Out.splice(0,this.m_Card_Out.length);
        this.m_Card_CurOut.active = false;
        this.m_Card_Xian.active =false;
        let children  = this.m_ChiGangCardParentNode.children;
        for(let i=0; i < children.length; i++ )
        {
            children[i].active = false;
        }
    },

    removeAllCardsGDY:function()
    {
        this.m_CardNumStr.getComponent(cc.Label).string = "0";
        this.m_CardNumStr.parent.active =false;
        this.m_OutCard.removeAllChildren(true)
        this.m_CardNum = 0
    },
    addChiCard:function(CardData1,CardData2)
    {
        let CardNode1 = this._getOneCardFromChiPeng();
        if( !CardNode1 )   
        {
            cc.log("增加吃牌，但是未找到控件");
            return;
        }
        CardNode1.active =true;

        let CardNode2 = this._getOneCardFromChiPeng();
        CardNode2.active = true;

        CardNode1.getComponent("gandengyanCard").ChangeCardFrameByCardData_Chi(this.m_ChairID,CardData1);
        CardNode2.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData2);

        CardNode1.getComponent("gandengyanCard").setCardData(CardData1)
        CardNode2.getComponent("gandengyanCard").setCardData(CardData2)

        CardNode1.children[0].active =false;
        CardNode2.children[0].active =false;
    },
    addGangCard:function(CardData1,CardData2)
    {
        let CardNode1 = this._getOneCardFromChiPeng();
        if( !CardNode1 )   
        {
            cc.log("增加扛牌，但是未找到控件");
            return;
        }
        CardNode1.active =true;

        let CardNode2 = this._getOneCardFromChiPeng();
        CardNode2.active = true;

        let CardNode3 = CardNode1.children[0]
        let CardNode4 = CardNode2.children[0]
        CardNode1.setLocalZOrder(100)

        CardNode3.active = true
        CardNode4.active = false;

        CardNode1.getComponent("gandengyanCard").ChangeCardFrameByCardData_Chi(this.m_ChairID,CardData1);
        CardNode2.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData2);
        CardNode3.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData1);

        CardNode1.getComponent("gandengyanCard").setCardData(CardData1)
        CardNode2.getComponent("gandengyanCard").setCardData(CardData2)
    },
    //新增一张扛牌
    addGangCardEx:function(CardData,ParentCard)
    {
        let CardNode3 = ParentCard.children[0]
        ParentCard.setLocalZOrder(100)
        CardNode3.active = true;
        CardNode3.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData);
    },
    getChiPengCardData:function()
    {
        let CardDataArr = []
        let children = this.m_ChiGangCardParentNode.children;
        for(let i=0; i < children.length; i++ )
        {
            let CardData = children[i].getComponent("gandengyanCard").getCardData();
            CardDataArr.push(CardData);
        }
        return CardDataArr
    },
    //将新取的牌移至手牌堆中
    moveGetCardToHand:function()
    {
        let self = this;
        if( self.m_Card_Get.active == true )
        {
            self.m_Card_Get.active = false;
            self.addHandCard(self.m_Card_Get.getComponent("gandengyanCard").getCardData(),false);
        }
    },
    //将当前牌立即移至出牌堆
    moveCurOutToOut:function()
    {
        let self = this;
        if( self.m_Card_CurOut.active == true )
        {
            self.m_Card_CurOut.stopAllActions();
            self.m_Card_CurOut.active = false;
            self.addOutCard(self.m_Card_CurOut.getComponent('gandengyanCard').getCardData());
        }
    },
    ///////////////////////////////
    _createOneCard:function(Card)
    {
        let self = this;
        var CardNode = cc.instantiate(self.cardPrefab);
        let CardNodeJs = CardNode.getComponent('gandengyanCard')
        //CardNodeJs.setChairID(this.m_ChairID)
        CardNodeJs.setCardData(Card)
        return CardNode;
    },
    _getOneCardFromChiPeng:function()
    {
        let children  = this.m_ChiGangCardParentNode.children;
        for(let i=0; i < children.length; i++ )
        {
            if( children[i].active == false )
            {
                return children[i]
            }
        }
    },
    _createOneCardGDY:function(Card)
    {
        let self = this;
        var CardNode = cc.instantiate(self.cardPrefab);
        let CardNodeJs = CardNode.getComponent('GDYpoker')
        //CardNodeJs.setChairID(this.m_ChairID)
        CardNodeJs.setCardData(Card)
        return CardNode;
    }
});
