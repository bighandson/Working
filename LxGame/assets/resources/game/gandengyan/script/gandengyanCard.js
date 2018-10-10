const yuhuanCardResource = require('gandengyanCardResource');
var assert = require('assert');
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
    },

    // use this for initialization
    onLoad: function () {
        this.m_Send = false;
    },
    setChairID:function( _ChairID )
    {
        this.m_ChairID = _ChairID;
    },
    setCardData:function(_CardData)
    {
        this.m_CardData = _CardData
    },
    getCardData:function()
    {
        return this.m_CardData;
    },
    setTouchEnable: function(_Enable)
    {
        this.m_TouchEnable = _Enable;
        this.node.getChildByName("dark").active = !this.m_TouchEnable
    },
    setSend:function(bVisible)
    {
        this.m_Send = bVisible;
        this.node.getChildByName("Send").active = bVisible;
    },
    //已出的牌
    ChangeCardFrameByCardData_Out:function(_ChairID,CardData)
    {
        let spriteFrameName = yuhuanCardResource.getCardNameByData_Out(_ChairID,CardData);
        assert(spriteFrameName != null,"sprteFrameName == null");
        this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
    },
    //当前出的牌
    ChangeCardFrameByCardData_CurOut:function(_ChairID,CardData)
    {
        let spriteFrameName = yuhuanCardResource.getCardNameByData_CurOut(_ChairID,CardData);
        assert(spriteFrameName != null,"sprteFrameName == null");
        this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
    },
    ChangeCardFrameByCardData_Hand:function(_ChairID,CardData)
    {
        let spriteFrameName = yuhuanCardResource.getCardNameByData_Hand(_ChairID,CardData);
        assert(spriteFrameName != null,"sprteFrameName == null");
        this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
    },
    //吃牌
    ChangeCardFrameByCardData_Chi:function(_ChairID,CardData)
    {
        let spriteFrameName = yuhuanCardResource.getCardNameByData_Chi(_ChairID,CardData);
        assert(spriteFrameName != null,"sprteFrameName == null");
        this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
    },
     //杠牌
    ChangeCardFrameByCardData_Gang:function(_ChairID,CardData)
     {
         let spriteFrameName = yuhuanCardResource.getCardNameByData_Gang(_ChairID,CardData);
         assert(spriteFrameName != null,"sprteFrameName == null");
         this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
     },
    ChangeCardFrameByCardData_An:function(_ChairID,CardData)
    {
        let spriteFrameName = yuhuanCardResource.getCardNameByData_An(_ChairID,CardData);
        assert(spriteFrameName != null,"sprteFrameName == null");
        this.node.getComponent(cc.Sprite).spriteFrame = spriteFrameName;
    },
    /////////////////////////////////////////////////////内部函数
    _containTouhcPoint:function(x,y)
    {
        if( this.m_TouchEnable == false )
        {
            return false
        }
        let LeftBottomX = this.node.x - this.node.width/2;
        let LeftBottomY = this.node.y - this.node.height/2;
        let RightTopX   = this.node.x + this.node.width/2;
        let RightTopY   = this.node.y + this.node.height/2;

        if( x >= LeftBottomX && x <= RightTopX && y >= LeftBottomY && y <= RightTopY )
        {
            return true;
        }
        return false;
    },
});
