
const UP_LAYER = 20;
const UpDistanceY = 40;
//const TagDiff = [cc.v2(0,-15),cc.v2(30,10),cc.v2(0,-10),cc.v2(-35,15)];
const TagDiff = [cc.v2(0,65),cc.v2(-45,10),cc.v2(0,-55),cc.v2(45,15)];

const TAG_TIPS = [
    'style/mahjong/MJCards/myTipMask',
    'style/mahjong/MJCards/rightTipMask',
    'style/mahjong/MJCards/myTipMask',
    'style/mahjong/MJCards/leftTipMask',
    'style/mahjong/MJCards/myBlockTipMask'
];

const BD_TIPS = [
    'style/mahjong/MJCards/myBDMask',
    'style/mahjong/MJCards/rightleftBDMask',
    'style/mahjong/MJCards/myBDMask',
    'style/mahjong/MJCards/rightleftBDMask',
    'style/mahjong/MJCards/myHandBDMask',
];


const FLOWER_MASK=[
    'style/mahjong/MJCards/my_light',
    'style/mahjong/MJCards/right_light',
    'style/mahjong/MJCards/my_light',
    'style/mahjong/MJCards/left_light'

]

const BD_OU_TAG = {
    0:[
        'style/mahjong/mah/texture/cai1',
        10,//-10,
        19//30
    ],
    1:[
        'style/mahjong/mah/texture/cai2',
        -15,
        12
    ],
    2:[
        'style/mahjong/mah/texture/cai3',
        10,
        19
    ],
    3:[
        'style/mahjong/mah/texture/cai4',
        13,
        2
    ]
}
const GH_OU_TAG = {
    0:[
        'style/mahjong/mah/texture/hua1',
        10,
        19
    ],
    1:[
        'style/mahjong/mah/texture/hua2',
        -15,
        10
    ],
    2:[
        'style/mahjong/mah/texture/hua3',
        9,19
    ],
    3:[
        'style/mahjong/mah/texture/hua4',
        15,
        2
    ]
}
const BD_HAND_TAG = 'style/mahjong/mah/texture/cai';

const HAND_MASK = 'style/mahjong/mah/texture/handmask';
// const XUE_TIP = 'game/mahjong/xueliuScene/texture/jiantou';


cc.Class({
    extends: cc.Component,

    properties: {

    },

    // 设置牌值
    setCard : function (value,frame) {
        if(!frame){
            console.log(value,frame);
            throw new Error('Frame should not be null');
        }
        this._value = value;
        if(!this.bgPic){
            this.bgPic = this.node.addComponent(cc.Sprite);
        }

        this.bgPic.spriteFrame = frame;

        return this;
    },

    containsPoint : function (p) {
        if(!this.node.active){
            return false;
        }

        let scale = this.node.scale;
        let pos = this.node.getPosition();
        let size = this.getCardSize();
        size.width -= 20;
        pos.x += 10;
        var rect = cc.rect(pos.x - scale * size.width / 2,pos.y - scale * size.height/2-40,size.width * scale, scale * size.height+40);
        return cc.rectContainsPoint(rect,p);
    },

    containsOriginPos : function (p) {
        if(!this.node.active){
            return false;
        }

        var size = this.getCardSize();
        var rect = cc.rect(this._originPos.x - size.width / 2,this._originPos.y - size.height/2,size.width, size.height);
        return cc.rectContainsPoint(rect,p);
    },

    getValue : function () {
        return this._value;
    },
    //获取牌类型 1万 19 条 10 筒
    getType :function () {
        if(this._value>=1 && this._value<=9){
            return 1;
        }else if(this._value>=10 && this._value<=18){
            return 19;
        }else if(this._value>=19 && this._value<=27){
            return 10;
        }
    },


    getCardSize : function () {
        return {
            width : this.node.width * this.node.scale,
            height : this.node.height * this.node.scale
        }
    },

    setCardPos : function (x,y) {
        this.node.setPosition(x,y);
        return this;
    },

    setCardOriginPos : function (x,y) {
        this._originPos = cc.p(x,y);
        this.node.setPosition(this._originPos);
        return this;
    },

    getCardOriginPos : function (x,y) {
        return this._originPos;
    },

    getCardPos : function () {
        return this.node.getPosition();
    },

    selectCardUpDiff : function (diffX,diffY) {
        let pos = this.node.getPosition();
        this.node.setPosition(pos.x+diffX,pos.y+diffY);
    },

    removeCardFromParent : function (cleanup) {
        cleanup = cleanup || false;
        this.node.removeFromParent(cleanup);
    },

    setActive : function (active) {
        this.node.active = active;
    },

    isActive : function () {
        return this.node.active;
    },

    setLayer : function (zOrder) {
        this._originZorder = zOrder;
        this.node.setLocalZOrder(zOrder);
    },

    setOriginLayer : function () {
        this.node.setLocalZOrder(this._originZorder);
    },

    getLayer : function () {
        return this._originZorder;
    },

    isUp : function () {
        return !!this._isUp;
    },

    setUp : function () {
        this._isUp = true;
        this.node.setLocalZOrder(this._originZorder + UP_LAYER);
        this.node.setPosition(this._originPos.x, this._originPos.y + UpDistanceY);
    },

    setDown : function () {
        this._isUp = false;
        this.node.setPosition(this._originPos);
        this.node.setLocalZOrder(this._originZorder);
        return this;
    },

    setCardScale : function (scale) {
        this.node.scale = scale;
    },

    hideArrowTag:function(){
      if(!!this.tag){
        this.tag.node.active = false;
        this.tag.node.removeFromParent(true);
        this.tag = null;
      }
    },

    //设置吃碰杠标识
    setArrowTag:function(chair,dir){
        let path = 'style/mahjong/mah/texture/arrow';
        let self = this;
        if(!!this.tag){
            this.tag.node.active = true;
        }else {
            cc.loader.loadRes(path,cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                self.tag = new cc.Node().addComponent(cc.Sprite);
                self.tag.node.parent = self.node;
                if(chair<0||chair>3){
                    cc.log('invalid chair...',chair);
                }
                self.tag.node.setPosition(TagDiff[chair]);
                self.tag.node.setRotation(self._getRotation(chair,dir));
                self.tag.spriteFrame = spriteFrame;
            });
        }
    },

    _getRotation:function(chair,dir){
        cc.log('_getRotation : ',chair,dir);
      let chairAngle = 180-chair*90;
      let dirAngle = -(dir-chair)*90;
      return chairAngle+dirAngle;
    },


    //设置财神标识
    setBDTag:function(chair,isHand,x,y,huout){
        if(!this.BDtag){
           let bg  = new cc.Node();
           var url = '';
           if(isHand){
                url = BD_HAND_TAG; 
           }else{
                url = BD_OU_TAG[chair][0];
                x = BD_OU_TAG[chair][1];
                y = BD_OU_TAG[chair][2];
           }
            cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {
                let sprite = bg.addComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            });

            bg.parent = this.node;
            this.BDtag = bg;
            this.BDtag.x = x || 20;//-10
            this.BDtag.y = y || 20;//30
            if(!!huout&&chair == 0){
                this.BDtag.x = 25;
                this.BDtag.y = 40;
            }
        }

        this.BDtag.active = true;
    },
    
    clearBDTag : function () {
        if(!!this.BDtag){
            this.BDtag.active = false;
        }
    },
    //设置杠花标识
    setGHTag:function(chair,x,y){
        if(!this.GHtag){
            let bg  = new cc.Node();
            var url = '';

            url = GH_OU_TAG[chair][0];
            x = GH_OU_TAG[chair][1];
            y = GH_OU_TAG[chair][2];

            cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {
                let sprite = bg.addComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
            });

            bg.parent = this.node;
            this.GHtag = bg;
            this.GHtag.x = x || -10;
            this.GHtag.y = y || 30;
        }

        this.GHtag.active = true;
    },

    clearGHTag : function () {
        if(!!this.GHtag){
            this.GHtag.active = false;
        }
    },
    setBDKuangTag:function(dir,isVisible){
        // if(!isVisible && !this.tipBDTag){
        //     return;
        // }

        // if(!this.tipBDTag){
        //     let url = BD_TIPS[dir];
        //     let self = this;
        //     cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {
        //         if(err){
        //             cc.log(err);
        //             return;
        //         }
        //         self.tipBDTag = new cc.Node().addComponent(cc.Sprite);
        //         self.tipBDTag.node.x = 0;
        //         self.tipBDTag.node.y = 3;
        //         self.tipBDTag.node.parent = self.node;
        //         self.tipBDTag.spriteFrame = spriteFrame;
        //         self.tipBDTag.node.active = isVisible;
        //     });
        // }else{
        //     this.tipBDTag.node.active = isVisible;
        // }
    },


    hitBDKuangTag : function () {
        // if(!!this.tipBDTag){
        //     this.tipBDTag.node.active = false;
        // }
    },


    //设置手牌提示标识
    setTipTag:function(dir,isVisible,isblock){
        if(!isVisible && !this.tipTag){
            return;
        }
        isblock = isblock || false
        if(isblock && (dir==0 || dir==2)){
            dir =4
        }
        if(!this.tipTag){
            let url = TAG_TIPS[dir];
            let self = this;
            cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                self.tipTag = new cc.Node().addComponent(cc.Sprite);
                self.tipTag.node.parent = self.node;
                self.tipTag.spriteFrame = spriteFrame;
                self.tipTag.node.active = isVisible;
            });
        }else{
            this.tipTag.node.active = isVisible;
        }
    },

    
    hitTipTag : function () {
        if(!!this.tipTag){
            this.tipTag.node.active = false;
        }
    },

    setFlowerMask:function(dir){

        if(!this.flowermask){
            let url = FLOWER_MASK[dir];
            let self = this;
            cc.loader.loadRes(url,cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }
                self.flowermask = new cc.Node().addComponent(cc.Sprite);
                self.flowermask.node.parent = self.node;
                self.flowermask.spriteFrame = spriteFrame;
            });
        }else{
            this.flowermask.node.active = true;
        }
    },

    clearFlowerMask : function () {
        if(!!this.flowermask){
            this.flowermask.node.active = false;
        }
    },

    // 设置手牌遮罩
    setCardMask : function () {
        if(!this.maskTip){
            let self = this;
            cc.loader.loadRes(HAND_MASK,cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }

                self.maskTip = new cc.Node();
                let sprite = self.maskTip.addComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
                //self.maskTip.scale = self.node.scale;
                self.maskTip.parent = self.node;
            });
        }else{
            this.maskTip.active = true;
        }
    },

    clearCardMask : function () {
        if(!!this.maskTip){
            this.maskTip.active = false;
        }
    },
    //血流停牌提示
    // setXueTip:function () {
    //     if(!this.tipXue){
    //         let self = this;
    //         cc.loader.loadRes(XUE_TIP,cc.SpriteFrame,function (err,spriteFrame) {
    //             if(err){
    //                 cc.log(err);
    //                 return;
    //             }

    //             self.tipXue = new cc.Node();
    //             let sprite = self.tipXue.addComponent(cc.Sprite);
    //             sprite.spriteFrame = spriteFrame;
    //             self.tipXue.parent = self.node;
    //             self.tipXue.y = 65;
    //         });
    //     }else{
    //         this.tipXue.active = true;
    //     }
    // },
    // clearXueTip:function () {
    //     if(!!this.tipXue){
    //         this.tipXue.active = false;
    //     }
    // },

    //血流遮罩2
    setXueMask : function () {
        if(!this.maskXue){
            let self = this;
            cc.loader.loadRes(HAND_MASK,cc.SpriteFrame,function (err,spriteFrame) {
                if(err){
                    cc.log(err);
                    return;
                }

                self.maskXue = new cc.Node();
                let sprite = self.maskXue.addComponent(cc.Sprite);
                sprite.spriteFrame = spriteFrame;
                self.maskXue.parent = self.node;
            });
        }else{
            this.maskXue.active = true;
        }
    },

    clearXueMask : function () {
        if(!!this.maskXue){
            this.maskXue.active = false;
        }

    },

    isXueMask : function () {
        if(!!this.maskXue){
            return this.maskXue.active
        }else{
            return false
        }

    },

    shiftMove : function (diffX,diffY) {
        this._originPos.x += diffX;
        this._originPos.y += diffY;
        this.node.setPosition(this._originPos);
    },


});
