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
        this.m_HandCardParentNode1 = this.node.getChildByName("HandCardParentNode1");//手牌第一排父节点
        this.m_HandCardParentNode2 = this.node.getChildByName("HandCardParentNode2");//手牌第二排父节点
        this.m_OutCardParentNode = this.node.getChildByName("OutCardParentNode");//已出牌父节点
        this.m_ChiGangCardParentNode = this.node.getChildByName("ChiGangCardParentNode");//吃扛牌父节点

        this.m_Cards = this.node.getChildByName("Cards")
        this.m_OutCard = this.node.getChildByName("OutCard")

        let Card_Get = this.node.getChildByName("GetCard");//新取的牌
        Card_Get.active = false;
        
        // this.m_Card_Get = this._createOneCard(111);
        // this.m_Card_Get.parent = Card_Get.parent;
        // this.m_Card_Get.x = Card_Get.x;
        // this.m_Card_Get.y = Card_Get.y;

       //this.removeAllCards();

       this.m_Card_HandGDY = []
       this.m_Card_OutGDY = []
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
        // for(let i=0; i < Cards.length; i++ )
        // {
        //     this.addHandCardGDY(Cards[i]);
        // }


        var scaleX = 1
        var scaleY = 1
        var Off = 70
        var CountBeginPos = function(Num,_Off)
        {
            var Len  = (Num-1) * _Off + 150 * scaleX
            var BeginX = 1334/2 - Len/2
            return BeginX
        }
        var X = CountBeginPos(Cards.length,Off)
        for( var i = 0; i < Cards.length; i++ )
        {
            let CardNode = this._createOneCardGDY(Cards[i]);
            CardNode.scaleX = scaleX
            CardNode.scaleY = scaleY
            CardNode.parent = this.m_Cards
            CardNode.x = X + i * Off
            CardNode.y = -4
            this.m_Card_HandGDY.push(CardNode);
        }
    },
    addHandCardGDY:function(Card)
    {
         var Card_Hand = this._createOneCardGDY(Card);
            //let CardNodeJs = Card_Hand.getComponent('gandengyanCard');
            //CardNodeJs.ChangeCardFrameByCardData_Hand(this.m_ChairID,Card);
            //CardNodeJs.setTouchEnable(bTouchEnable);
            this.m_Card_HandGDY.push(Card_Hand);
            Card_Hand.parent = this.m_Cards
        // if( this.m_Card_HandGDY.length > 5 )
        // {
        //     var Remain = this.m_Card_HandGDY.length - 5;
        //     this.m_Cards.x = this.m_Cards.x - 95 * Remain
        // }
    },

    addHandCards:function(Cards,bTouchEnable=true)
    {
        assert(Cards != null,"增加手牌失败 Cards == null");
        for(let i=0; i < Cards.length; i++ )
        {
            this.addHandCard(Cards[i],false,bTouchEnable);
        }
    },
    //Card 牌值  bGet是否为新取牌
    addHandCard:function(Card,bGet,bTouchEnable=true)
    {
        assert(Card != null,"Card==null");
        if( true == bGet )
        {//新取的牌
            assert( this.m_Card_Get.active == false,"设置新牌，但是当前却为active");
            var CardJs_Ge = this.m_Card_Get.getComponent("gandengyanCard");
            CardJs_Ge.setChairID(this.m_ChairID);
            CardJs_Ge.setCardData(Card);
            CardJs_Ge.setSend(false)
            this.m_Card_Get.active = true;
            CardJs_Ge.ChangeCardFrameByCardData_Hand(this.m_ChairID,Card);
            CardJs_Ge.setTouchEnable(bTouchEnable);
        }
        else
        {
            var Card_Hand = this._createOneCard(Card);
            let CardNodeJs = Card_Hand.getComponent('gandengyanCard');
            CardNodeJs.ChangeCardFrameByCardData_Hand(this.m_ChairID,Card);
            CardNodeJs.setTouchEnable(bTouchEnable);
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
        let bfind = false;
        if( self.m_Card_Get.active && self.m_Card_Get.getComponent("gandengyanCard").getCardData() == Card )
        {
            self.m_Card_Get.active = false;
            return;
        }
        cc.log("移除手牌 {0}".format(Card));
        for(let i=0; i < self.m_Card_Hand.length; i++ )
        {
            if( self.m_Card_Hand[i].getComponent("gandengyanCard").getCardData() == Card )
            {
                self.m_Card_Hand[i].removeFromParent(true);
                self.m_Card_Hand.splice(i,1);
                return;
            }
        }
        cc.log("警告-----------------------------------删除牌时失败 {0}".format(Card));
        assert(false,"删除牌时失败");
    },
    removeAllHandCardGDY:function()
    {
        let self = this
        for( var j=0; j < this.m_Card_HandGDY.length; j++ )
        {
            self.m_Card_HandGDY[j].removeFromParent(true);
        }
        self.m_Card_HandGDY = []
    },
    removeHandCardGDY:function(Cards)
    {
        let self = this
        var OldLen = this.m_Card_HandGDY.length
        var Removelen = Cards.length
        for( var i=0; i < Cards.length; i++ )
        {
                for( var j=0; j < this.m_Card_HandGDY.length; j++ )
                {
                    if( self.m_Card_HandGDY[j].getComponent("GDYpoker").getCardData() == Cards[i] )
                    {
                        self.m_Card_HandGDY[j].removeFromParent(true);
                        self.m_Card_HandGDY.splice(j,1);

                        // if( this.m_Card_HandGDY.length < 5 )
                        // {
                        //     var Remain = 5 - this.m_Card_HandGDY.length ;
                        //     this.m_Cards.x = this.m_Cards.x + 95 * Remain
                        // }
                    }
                }
        }
        if( this.m_Card_HandGDY.length != OldLen - Removelen )
        {
            assert(false);
        }

       // cc.log("警告-----------------------------------删除牌时失败 {0}".format(Card));
        //assert(false,"删除牌时失败");
    },
    getHandCardDataGDY:function()
    {
        let CardData = [];
        for( var i=0; i < this.m_Card_HandGDY.length; i++ )
        {
             CardData.push(this.m_Card_HandGDY[i].getComponent("GDYpoker").getCardData());
        }
        return CardData
    },
    getHandCardData:function()
    {
        return 0;
        let self = this;
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
    getHandCardDataButGet:function()
    {
        let self = this;
        let CardData = [];
        for(let i=0; i < this.m_Card_Hand.length; i++)
        {
            CardData.push(this.m_Card_Hand[i].getComponent("gandengyanCard").getCardData());
        }
        return CardData;
    },
    getHandCardData_Get:function()
    {
        let self = this;
        if( self.m_Card_Get.active )
        {
            return this.m_Card_Get.getComponent("gandengyanCard").getCardData();
        }
        return null;
    },
    getHandCardData_CannotTouch:function()
    {
        let CardData = []
        for(let i=0; i < this.m_Card_Hand.length; i++)
        {
            let CardNode    =  this.m_Card_Hand[i];
            let CardNodejs  =  CardNode.getComponent("gandengyanCard");
            if( CardNodejs.m_TouchEnable == false )
            {
                CardData.push(CardNodejs.getCardData())
            }
        }
        return CardData;
    },
    getHandCardData_CanTouch:function()
    {
        let CardData = []
        for(let i=0; i < this.m_Card_Hand.length; i++)
        {
            let CardNode    =  this.m_Card_Hand[i];
            let CardNodejs  =  CardNode.getComponent("gandengyanCard");
            if( CardNodejs.m_TouchEnable == true && CardNodejs.m_Send == false )
            {
                CardData.push(CardNodejs.getCardData())
            }
        }
        return CardData;
    },
    getHandCardData_Send:function()
    {
        let CardData = []
        for(let i=0; i < this.m_Card_Hand.length; i++)
        {
            let CardNode    =  this.m_Card_Hand[i];
            let CardNodejs  =  CardNode.getComponent("gandengyanCard");
            if(  CardNodejs.m_Send == true )
            {
                CardData.push(CardNodejs.getCardData())
            }
        }
        return CardData;
    },
    getCardByCardData:function(CardData)
    {
        let self =  this;
        if( self.m_Card_Get.active && self.m_Card_Get.getComponent("gandengyanCard").getCardData() == CardData)
        {
            return self.m_Card_Get;
        }
        for(let i=0; i < self.m_Card_Hand.length; i++ )
        {
            let Data = self.m_Card_Hand[i].getComponent("gandengyanCard").getCardData();
            if( Data == CardData )
            {
                return self.m_Card_Hand[i];
            }
        }
        cc.log("根据牌数据{0}取牌实例失败",CardData);
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
        this.m_Card_Flower.y = -100;
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
        self.m_Card_Xian.active = bVisible;
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
        var delaytime = cc.delayTime(3);
        var finished = cc.callFunc(callback, self.m_Card_CurOut, 0);
        var seq = cc.sequence(delaytime, finished);
        self.m_Card_CurOut.runAction(seq)
    },
    //增加一张出的牌
    addOutCard:function(OutCard)
    {
        return this.addOutCardEx(OutCard)
        let CardNode = this._createOneCard(OutCard);
        let CardNodeJs = CardNode.getComponent("gandengyanCard");
        CardNodeJs.ChangeCardFrameByCardData_Out(this.m_ChairID,OutCard);
        this.m_OutCardParentNode.addChild(CardNode)
        //CardNode.parent = this.m_OutCardParentNode;
        //CardNode.zIndex = this.m_OutCardParentNode.childrenCount;
        CardNode.setLocalZOrder(1000-this.m_OutCardParentNode.childrenCount)
        this.m_Card_Out.push(CardNode);
    },
    addOutCardEx:function(OutCard)
    {
        let CardNode = this._createOneCard(OutCard);
        let CardNodeJs = CardNode.getComponent("gandengyanCard");
        CardNodeJs.ChangeCardFrameByCardData_Out(this.m_ChairID,OutCard);
        
        //var Row = Math.floor(this.m_OutCardParentNode.childrenCount/10)
        //var List =  this.m_OutCardParentNode.childrenCount%10
        var Row = 0
        var List = this.m_OutCardParentNode.childrenCount
        if( this.m_OutCardParentNode.childrenCount >= 10 )
        {
            Row = 1
            List = this.m_OutCardParentNode.childrenCount - 10
        }
        var CardSize = CardNode.getContentSize()
        CardNode.setPosition( CardSize.width*0.93  * List,CardSize.height * Row);
        this.m_OutCardParentNode.addChild(CardNode)
        this.m_Card_Out.push(CardNode);
    },
    addOutCardGDY:function(OutCard)
    {
        var scaleX = 0.5
        var scaleY = 0.5
        var Off = 30
        var CountBeginPos = function(Num,_Off)
        {
            var Len  = (Num-1) * _Off + 150 * scaleX
            var BeginX = 1334/2 - Len/2
            return BeginX
        }
        var X = CountBeginPos(OutCard.length,Off)
        for( var i = 0; i < OutCard.length; i++ )
        {
            let CardNode = this._createOneCardGDY(OutCard[i]);
            CardNode.scaleX = scaleX
            CardNode.scaleY = scaleY
            CardNode.parent = this.m_OutCard
            CardNode.x = X + i * Off
            CardNode.y = 280
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
    ///////////////////////////////测试接口函数
    // getChiPengCardData:function()
    // {
    //     let CardData =[]
    //     let children = this.m_ChiGangCardParentNode.children;
    //     for(let i = 0; i <children.length; i++ )
    //     {
    //         CardData.push(children[i].getComponent("gandengyanCard").getCardData())
    //     }
    //     return CardData
    // },
    ////////////////////////////////
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
    removeOutCardGDY:function()
    {
        this.m_OutCard.removeAllChildren(true)
    },
    //移除手牌
    removeAllCards_Hand:function()
    {
        this.m_HandCardParentNode1.removeAllChildren(true);
        this.m_HandCardParentNode2.removeAllChildren(true);
        this.m_Card_Hand.splice(0,this.m_Card_Hand.length);
        this.m_Card_Get.active = false;
    },
    //移除除新取的手牌之外所有牌
    removeAllCards_Hand_ButGet:function()
    {
        this.m_HandCardParentNode1.removeAllChildren(true);
        this.m_HandCardParentNode2.removeAllChildren(true);
        this.m_Card_Hand.splice(0,this.m_Card_Hand.length);
    },
    //移除所有的牌
    removeAllCards:function()
    {
        this.removeAllCards_Hand();
        this.m_OutCardParentNode.removeAllChildren(true);
        this.m_ChiGangCardParentNode.removeAllChildren(true);
        this.m_Card_Out.splice(0,this.m_Card_Out.length);
        this.m_Card_CurOut.active = false;
        this.m_Card_Xian.active = false;
        this.m_ChiGangNum = 0;

        this.m_Cards.removeAllChildren(true)
        this.m_OutCard.removeAllChildren(true)
    },
    removeAllCardsGDY:function()
    {
        this.m_OutCard.removeAllChildren(true)
        this.m_Cards.removeAllChildren(true)
        this.m_Card_OutGDY.splice(0,this.m_Card_OutGDY.length)
        this.m_Card_HandGDY.splice(0,this.m_Card_HandGDY.length)
    },
    testCurOutCard:function(_Card)
    {
        this.m_CardData_Out.push( _Card );
        this.refreshCardsPos_Out();
    },
    onTouchStartGDY:function(startPos,endPos)
    {
        let self = this;
        self.m_CurTouchCard = null
        self.m_CurSelectCard = null
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            var _startPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(startPos);
            var _endPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(endPos);
            let rlt = self.m_Card_HandGDY[i].getComponent("GDYpoker")._containTouhcPoint(_startPos,_endPos, i == self.m_Card_HandGDY.length-1)
            if( true == rlt )
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(true)
            }
            else
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false)
            }
        }
    },
    onTouchMoveGDY:function(startPos,endPos)
    {
        let self = this;
        self.m_CurTouchCard = null
        self.m_CurSelectCard = null
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            var _startPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(startPos);
            var _endPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(endPos);
            let rlt = self.m_Card_HandGDY[i].getComponent("GDYpoker")._containTouhcPoint(_startPos,_endPos,i == self.m_Card_HandGDY.length-1)
            if( true == rlt )
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(true)
            }
            else
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false)
            }
        }
    },
    onTouchEndGDY:function(startPos,endPos)
    {
        let self = this;
        self.m_CurTouchCard = null
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            var _startPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(startPos);
            var _endPos = self.m_Card_HandGDY[i].parent.convertToNodeSpaceAR(endPos);
            let rlt = self.m_Card_HandGDY[i].getComponent("GDYpoker")._containTouhcPoint(_startPos,_endPos,i == self.m_Card_HandGDY.length-1)
            if( true == rlt )
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(true)
            }
            else
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false)
            }
        }
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            if( self.m_Card_HandGDY[i].getComponent("GDYpoker").ismaskVisble() == true )
            {
                self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false)
                if( self.m_Card_HandGDY[i].y == 20 )
                {
                    self.m_Card_HandGDY[i].y = -4
                }
                else
                {
                    //self.m_CurSelectCard.push(self.m_Card_HandGDY[i])
                    self.m_Card_HandGDY[i].y = 20
                }
            }
        }
    },
    setAllCardsSelete:function(bSelete)
    {
        let self = this
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            self.m_Card_HandGDY[i].y = -4
            self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false)
        }
    },
    setCardsSeleteGDY:function(CardArrs,bSelete)
    {
        let self = this
        for( let j=0; j < CardArrs.length; j++ )
        {
            for(let i=0;i < self.m_Card_HandGDY.length; i++)
            {
                if( CardArrs[j] == self.m_Card_HandGDY[i].getComponent("GDYpoker").getCardData() )
                {
                    self.m_Card_HandGDY[i].getComponent("GDYpoker").setmaskVisble(false) 
                    if( bSelete == true )
                    {
                       self.m_Card_HandGDY[i].y = 20
                        
                    }
                    else
                    {
                        self.m_Card_HandGDY[i].y = -4
                    }
                    
                }
            }
        }
        
    },
    onTouchStart:function(x,y)
    {
        let self = this;
        self.m_CurTouchCard = null
        self.m_CurSelectCard = null
        for(let i=0;i < self.m_Card_Hand.length; i++)
        {
            var newVec2 = self.m_Card_Hand[i].parent.convertToNodeSpaceAR(cc.v2(x,y)); 
            let rlt = self.m_Card_Hand[i].getComponent("gandengyanCard")._containTouhcPoint(newVec2.x,newVec2.y)
            if( true == rlt )
            {
                self.m_Card_Hand[i].color = new cc.Color(125, 125, 125);
                self.m_CurTouchCard = self.m_Card_Hand[i];
                return ;
            }
        }
        if( self.m_Card_Get.active == true && self.m_Card_Get.getComponent("gandengyanCard")._containTouhcPoint(x,y) )
        {
            self.m_Card_Get.color = new cc.Color(125, 125, 125);
            self.m_CurTouchCard = self.m_Card_Get;
            return ;
        }
    },
    onTouchEnd:function(x,y)
    {
        let self = this
        if( self.m_CurTouchCard == null )
        {
            return;
        }
        for(let i=0;i < self.m_Card_Hand.length; i++)
        {
            var newVec2 = self.m_Card_Hand[i].parent.convertToNodeSpaceAR(cc.v2(x,y)); 
            let rlt = self.m_Card_Hand[i].getComponent("gandengyanCard")._containTouhcPoint(newVec2.x,newVec2.y)
            if( true == rlt &&  self.m_CurTouchCard == self.m_Card_Hand[i])
            {
                self.m_Card_Hand[i].color = new cc.Color(255, 255, 255);
                self.m_CurSelectCard = self.m_Card_Hand[i];
            }
        }
        if( self.m_Card_Get.active == true && self.m_Card_Get.getComponent("gandengyanCard")._containTouhcPoint(x,y) )
        {
            if( self.m_CurTouchCard == self.m_Card_Get )
            {
                self.m_CurSelectCard = self.m_Card_Get;
            }
        }
        self.m_CurTouchCard.color = new cc.Color(255, 255, 255);
    },
    getSelcetCardDataGDY:function()
    {
        let self = this;
        self.m_CurSelectCard = []
        for(let i=0;i < self.m_Card_HandGDY.length; i++)
        {
            if( self.m_Card_HandGDY[i].y == 20 )
            {
                self.m_CurSelectCard.push(self.m_Card_HandGDY[i].getComponent("GDYpoker").getCardData())
            }
        }
        return self.m_CurSelectCard
    },
    getSelcetdCardData:function()
    {
        if( null == this.m_CurSelectCard )
        {
            return null
        }
        return this.m_CurSelectCard.getComponent("gandengyanCard").getCardData()
    },
    getSelcetCard:function()
    {
        if( null == this.m_CurSelectCard )
        {
            return null
        }
        return this.m_CurSelectCard;
    },
    addChiCard:function(CardData1,CardData2)
    {
        let CardNode1 = this._createOneCard(CardData1);
        let CardNode2 = this._createOneCard(CardData2);
        CardNode1.getComponent("gandengyanCard").ChangeCardFrameByCardData_Chi(this.m_ChairID,CardData1);
        CardNode2.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData2);
        CardNode1.parent = this.m_ChiGangCardParentNode;
        CardNode2.parent = this.m_ChiGangCardParentNode;
        this.m_ChiGangNum += 1;
        let StartX = (this.m_ChiGangNum-1) * CardNode1.width*2 + (this.m_ChiGangNum -1) * 20;
        CardNode1.setPosition(StartX,0);
        CardNode2.setPosition(StartX + CardNode1.width,0 );
    },
    addGangCard:function(CardData1,CardData2)
    {
        let CardNode1 = this._createOneCard(CardData1);
        let CardNode2 = this._createOneCard(CardData2);
        let CardNode3 = this._createOneCard(0);
        CardNode1.getComponent("gandengyanCard").ChangeCardFrameByCardData_Chi(this.m_ChairID ,CardData1);
        CardNode2.getComponent("gandengyanCard").ChangeCardFrameByCardData_Gang(this.m_ChairID,CardData2);
        CardNode3.getComponent("gandengyanCard").ChangeCardFrameByCardData_An(this.m_ChairID,CardData1);
        CardNode1.parent = this.m_ChiGangCardParentNode;
        CardNode3.parent = this.m_ChiGangCardParentNode;
        CardNode2.parent = this.m_ChiGangCardParentNode;
        this.m_ChiGangNum += 1;
        let StartX = (this.m_ChiGangNum-1) * CardNode1.width*2 + (this.m_ChiGangNum -1) * 20;
        CardNode1.setPosition(StartX,0);
        CardNode3.setPosition(StartX + CardNode1.width,0 );
        CardNode2.setPosition(StartX + CardNode1.width/2, 15);
    },
    //新增一张扛牌
    addGangCardEx:function(CardData,ParentCard)
    {
        let CardNode = this._createOneCard(CardData);
        let CardNodeJs = CardNode.getComponent("gandengyanCard");
        CardNodeJs.ChangeCardFrameByCardData_An(this.m_ChairID,CardData);
        CardNode.parent = this.m_ChiGangCardParentNode;
        CardNode.setPosition(ParentCard.x,15 );
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
    setCardsTouchEnble:function(CardDataArr,_Enable)
    {
        // let self = this;
        // for(let i=0; i < CardDataArr.length; i++ )
        // {
        //     let Card =  self.getCardByCardData(CardDataArr[i]);
        //     if( null != Card )
        //     {
        //         Card.getComponent("gandengyanCard").setTouchEnable(_Enable);
        //     }
        // }  

        let self = this;
        for(let i=0; i < CardDataArr.length; i++ )
        {
            var CardData = CardDataArr[i];
            if( self.m_Card_Get.active && self.m_Card_Get.getComponent("gandengyanCard").getCardData() == CardData)
            {
                if( self.m_Card_Get.getComponent("gandengyanCard").m_TouchEnable == !_Enable )
                {
                    self.m_Card_Get.getComponent("gandengyanCard").setTouchEnable(_Enable);
                    continue;
                }
            }
            for(let i=0; i < self.m_Card_Hand.length; i++ )
            {
                let CardJs = self.m_Card_Hand[i].getComponent("gandengyanCard")
                let Data = CardJs.getCardData();
                if( Data == CardData && CardJs.m_TouchEnable == !_Enable )
                {
                    CardJs.setTouchEnable(_Enable);
                    continue;
                }
            }
        }

    },
    setAllCardsTouchEnble:function(_Enable)
    {
        let self = this;
        if(self.m_Card_Get.active )
        {
            self.m_Card_Get.getComponent("gandengyanCard").setTouchEnable(_Enable);
        }
        for(let i = 0; i < self.m_Card_Hand.length; i++)
        {
            self.m_Card_Hand[i].getComponent("gandengyanCard").setTouchEnable(_Enable);
        }
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
    setCardSend:function(CardDataArr,bVisible)
    {
        let self = this; 
        let TempCardData= []
        for(let x=0; x < self.m_Card_Hand.length; x++)
        {
            let CardJs = self.m_Card_Hand[x].getComponent("gandengyanCard")
            TempCardData.push(CardJs.getCardData())
        }
        cc.log("设置送子显示信息:",TempCardData)

        if( self.m_Card_Get.active )
        {
            cc.log("此时新取牌信息 ：",self.m_Card_Get.getComponent("gandengyanCard").getCardData())
        }
        
        
        for(let i=0; i < CardDataArr.length; i++)
        {
            if( self.m_Card_Get.active && self.m_Card_Get.getComponent("gandengyanCard").getCardData() == CardDataArr[i] )
            {
                self.m_Card_Get.getComponent("gandengyanCard").setSend(bVisible)
                continue;
            }
            for(let x=0; x < self.m_Card_Hand.length; x++)
            {
                let CardJs = self.m_Card_Hand[x].getComponent("gandengyanCard")
                if( CardJs.getCardData() == CardDataArr[i] && CardJs.m_Send == false )
                {
                    CardJs.setSend(bVisible)
                    break;
                }
            }
        }
    },
    setAllCardSend:function(bVisible)
    {
        let self = this;
        if( self.m_Card_Get.active )
        {
            self.m_Card_Get.getComponent("gandengyanCard").setSend(false)
        }
        for(let i=0; i < self.m_Card_Hand.length; i++)
        {
            let CardJs = self.m_Card_Hand[i].getComponent("gandengyanCard")
            CardJs.setSend(bVisible)
        }
    },
    //获得一张可以出的牌
    getOneCanOutCardData:function()
    {
        let self = this;
        if( self.m_Card_Get.active == true && self.m_Card_Get.getComponent("gandengyanCard").m_TouchEnable )
        {
            return self.m_Card_Get.getComponent("gandengyanCard").getCardData()
        }
        for(let i=0; i < self.m_Card_Hand.length; i++)
        {
            let CardJs = self.m_Card_Hand[i].getComponent("gandengyanCard")
            if( CardJs.m_TouchEnable == true )
            {
                return CardJs.getCardData()
            }
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
