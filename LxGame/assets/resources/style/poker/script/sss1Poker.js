cc.Class({
    extends: cc.Component,

    properties: {
        type:0,       //花色
        num:0,        //字牌
        weight:0,     //权重
        serverIndex:0, //服务器发过来的下标
        index:0,
        isSelected:false,
        bgSprite:cc.Node,
        numSprite:cc.Node,
        typeSSprite:cc.Node,
        typeBSprite:cc.Node,
        maskSprite:cc.Node,
        frontNode:cc.Node,
        backNode:cc.Node,
        mapaiSprite:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
    },

    /**
     * 初始化信息
     * @param pokersAtlas
     * @param data
     */
    init:function(pokersAtlas,data){
        // // cc.log(data);
        // this.num   = data.data[0];
        // this.type  = data.data[1];
        // this.serverIndex = data.index;
        // this.weight = SssManager.rule.getPokerWeight(this.type,this.num);
        // // cc.log("this.weight = " + this.weight)
        // if(this.num > 14){
        //     this.typeSSprite.getComponent(cc.Sprite).spriteFrame = null;
        //     if(this.type > 4){
        //         this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('joker_num_1');
        //         this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('joker_1');
        //     }else{
        //         this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('joker_num_2');
        //         this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('joker_2');
        //     }
        //     this.numSprite.x = -37;
        //     this.numSprite.y = 14;
        //     this.typeBSprite.x = 19;
        //     this.typeBSprite.y = -20;
        // }else{
        //     if(this.type == 2 || this.type == 4)
        //     {
        //         this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_red_'+this.num);
        //     }else {
        //         this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_black_'+this.num);
        //     }
        //     this.typeSSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_s_'+this.type);
        //     this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_'+this.type);
        //     this.numSprite.x = -35;
        //     this.numSprite.y = 53;
        //     this.typeSSprite.x = this.numSprite.x;
        //     this.typeSSprite.y = 8;
        //     this.typeBSprite.x = 20;
        //     this.typeBSprite.y = -42;
        // }

        this.num   = data.data[0];
        this.type  = data.data[1];
        this.serverIndex = data.index;
        this.weight = SssManager.rule.getPokerWeight(this.type,this.num);
        // cc.log("this.weight = " + this.weight)
        
        if(this.type == 2 || this.type == 4)
        {
            this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_red_'+this.num);
        }else {
            this.numSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('num_black_'+this.num);
        }
        this.typeSSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_s_'+this.type);
        // if(this.num > 10)
        // {
        //     this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame("face_cards_"+this.type+"_"+this.num);
        // }else{
            this.typeBSprite.getComponent(cc.Sprite).spriteFrame = pokersAtlas.getSpriteFrame('colour_'+this.type);
        // }

        //马牌判断
        let isShowMapaiMask = false;
        if(SssManager.mapai[0] != -1)
        {
            if(this.num == SssManager.mapai[0] && this.type == SssManager.mapai[1])
            {
                isShowMapaiMask = true;
            }
        }

        this.mapaiSprite.active = isShowMapaiMask;
    },


    /**
     * 设置是否选中
     * @param ret
     */
    setIsSelected:function(ret)
    {
        this.isSelected = ret;
        if(this.isSelected)
        {
            this.node.y = 20;
        }else {
            this.node.y = 0;
        }
    },

    /**
     * 播放动画
     * @param name
     */
    playAnim:function(name)
    {
        this.animation.play(name);
    },

    onFinished:function()
    {
        cc.log("onFinished");
        this.node.dispatchEvent(new cc.Event.EventCustom('pokerRollFinish',true));
    },

    /**
     * 设置牌的状态，1 = 正面 2 = 反面
     * @param state
     */
    setState:function(state)
    {
        if(state == 1)
        {
            this.frontNode.active = true;
            this.backNode.active = false;
        }else
        {
            this.frontNode.active = false;
            this.backNode.active = true;
        }
    },

    isTempPoker : function () {
        return !!this.isTempPoker;
    },

    setTempPokerState : function(){
        this.isTempPoker = true;
    },
});
