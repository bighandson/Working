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
    onLoad: function () {

        this.animation =this.getComponent(cc.Animation);

    },

    init:function(pokersAtlas,data,info){
        this.type=data.type;
        this.num=data.num;
        this.info=info;
        this.weight = DdzManager.rule.getPokerWeight(this.type,this.num);
        if(this.type == 0)
        {
            var n=this.num-15;
            this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('king_num_'+n+'_s');
            this.numSprite.setPositionY(10);
            this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame("king_"+n+'_s');
            this.typeSSprite.getComponent(cc.Sprite).spriteFrame = null;
        }
        else
        {
            if(this.type == 2 || this.type == 4)
            {
                if(this.num>13&&this.num<16)
                {
                    var n=this.num-13;
                    this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_red_'+n+'_s');
                }else
                {
                    this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_red_'+this.num+'_s');
                }


            }else
            {
                if(this.num>13&&this.num<16)
                {
                    var n=this.num-13;
                    this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_black_'+n+'_s');
                }else
                {
                    this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_black_'+this.num+'_s');
                }

            }
            this.typeSSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_s_'+this.type+'_s');
            if(this.num > 10 && this.num < 14)
            {
                this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame("face_cards_"+this.type+"_"+this.num+'_s');
            }
            else
            {
                this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_'+this.type+'_s');
            }
        }
    },
    Scalto: function () {
        var Action = cc.scaleTo(0.01,0.7);
        this.node.runAction(Action);
    },
    //选中之后改变Y坐标
    setIsSelected:function(ret)
    {
        var url = 'resources/game/ddz/sound/effect/Snd_HitCard.mp3';
        this.isSelected = ret;
        var y = this.node.y;
        if(this.isSelected)
        {
            this.node.y = 20;
        }else {
            this.node.y = 0;
        }
        if(y!=this.node.y){
            SettingMgr.playSound(url);
        }
    },



});
