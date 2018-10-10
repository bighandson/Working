var GDYCardRes = require("GDYCardRes")

cc.Class({
    extends: cc.Component,

    properties: {
        type:0,
        num:0,
        info:0,
        weight:0,
        index:0,
        pokerNum:0,
        isSelect:false,
        bgSprite:cc.Node,     //背景
        numSprite:cc.Node,    //数字大小
        typeSSprite:cc.Node,  //小黑红梅方
        typeBSprite:cc.Node,  //大黑红梅方
        maskSprite:cc.Node,   //选中遮罩
    },

    // use this for initialization
    onLoad: function () 
    {

    },
    setCardData:function(_CardData)
    {
        if( this.m_CardData != _CardData )
        {
            this.m_CardData = _CardData
            this._onChangeCardData(_CardData)
        }
    },
    getCardData:function()
    {
        return this.m_CardData;
    },
    _onChangeCardData:function(_CardData)
    {
        this.numSprite.active = false;
        this.typeSSprite.active = false;
        this.typeBSprite.active =false;
        this.maskSprite.active = false;

        if( _CardData == 0 )
        {
            this.numSprite.active = false;
            this.typeSSprite.active = false;
            this.maskSprite.active = false;
            this.typeBSprite.active = false;
            this.bgSprite.getComponent(cc.Sprite).spriteFrame =  GDYCardRes.getCardSpriteFrame_Back()
            return 
        }
        if( _CardData == 51 || _CardData == 53 )
        {
            this.typeSSprite.active = true;
            this.typeBSprite.active = true;
            var frame = GDYCardRes.getCardSpriteFrame_King( _CardData == 51)
            this.typeSSprite.getComponent(cc.Sprite).spriteFrame = frame.num;
            // this.typeBSprite.getComponent(cc.Sprite).spriteFrame = frame.bigColor
            this.typeBSprite.active = false;
            return
        }
        var frame = GDYCardRes.getCardSpriteFrame_CardData(_CardData)
        this.numSprite.active = true;
        this.typeSSprite.active = true;
        this.typeBSprite.active = true;
        this.numSprite.getComponent(cc.Sprite).spriteFrame = frame.num;
        this.typeSSprite.getComponent(cc.Sprite).spriteFrame = frame.smallColor;
        this.typeBSprite.getComponent(cc.Sprite).spriteFrame = frame.bigColor;
    },
    setmaskVisble:function(bVis)
    {
        this.maskSprite.active = bVis;
    },
    ismaskVisble:function(bVis)
    {
        return this.maskSprite.active;
    },
     _containTouhcPoint:function(startPos,endPos,ball)
     {
            var leftx  = startPos.x < endPos.x ? startPos.x : endPos.x;
            var rightx = startPos.x < endPos.x ? endPos.x   : startPos.x;

            var cardletfx = this.node.x
            var cardletfy = ball == true ? this.node.x + this.node.width : this.node.x + 75

        if ( rightx < cardletfx  )
        {
            return false;
        }
        if( leftx > cardletfy )
        {
            return false;
        }
        return true;
    },
});
