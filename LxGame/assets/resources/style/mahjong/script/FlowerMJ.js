/**
 * Created by Ximena on 2017/5/15.
 */

 cc.Class({
   extends : cc.Component,
   properties:{
     //花牌数目
     flowerNumber:cc.Node,
     detailBg:cc.Node,
     detailFlowers:cc.Node,
     _chair:0
   },

   onLoad:function(){
     this.node.active = false;
     this.flowerNumber.parent.on(cc.Node.EventType.TOUCH_END,this.onWholeTouch,this);
   },

   addFlower:function(value){
     let frame = require('MJCardResource').getExtraImageByChair(0,value);
     let node = new cc.Node();
     let flower = node.addComponent(cc.Sprite);
     flower.spriteFrame = frame;
     node.parent = this.detailFlowers;
     this.node.active = true;
     this.updateFlowerNumber();
     this.updatePosition();
   },

   setChair:function(chair){
     this._chair = chair;
   },

   updateFlowerNumber:function(){
     let number = this.detailFlowers.childrenCount;
     this.flowerNumber.getComponent(cc.Label).string = number;
   },

   updatePosition:function(){
     let number = this.detailFlowers.childrenCount;
     if(number>0){
       let width = this.detailFlowers.children[0].getContentSize().width*number;
       let height = this.detailFlowers.children[0].getContentSize().height;
       console.log(this.detailFlowers.children[0].getContentSize());
       let x = [50+width/2,-50-width/2,-50-width/2,50+width/2];
       this.detailBg.width = width+20;
       this.detailBg.height = height;
       this.detailBg.parent.setPositionX(x[this._chair],height/2);
     }
   },

   onWholeTouch:function(){
      this.detailBg.parent.active = true;
      this.scheduleOnce(this.hideDetail.bind(this), 2);
   },

   hideDetail:function(dt){
     this.detailBg.parent.active = false;
   },

 });
