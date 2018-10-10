/**
 * Created by Ximena on 2017/5/18.
 */

cc.Class({
  extends:cc.Component,
  properties:{
    content:cc.Node,
    bg:cc.Node,
    voice:cc.Node,
    _chair:0
  },

  chat:function(content){
    this.node.active = true;
    this.scheduleOnce(function(){
        this.node.active = false;
    }.bind(this),4);
    this.content.getComponent(cc.Label).string = content;
    this._adaptChatSize();
  },

  _adaptChatSize:function(){
    let widthContent = this.content.getContentSize().width;
    let widthBg = this.bg.getContentSize().width;
    this.bg.setScale(widthContent/widthBg,1);
    this._updatePosition();
  },

  setChair:function(chair){
    this._chair = chair;
    if(chair===1||chair===2){
      this.bg.parent.setRotation(180);
      this.bg.parent.setPosition(0,20);
      this.voice.setRotation(180);
      this.voice.setPosition(0,20);
    }
    this._updatePosition();
  },

  _updatePosition:function(){
      let widthLeft = this.bg.parent.children[0].getContentSize().width;
      let widthRight = this.bg.parent.children[2].getContentSize().width;
      let widthContent = this.content.getContentSize().width;
      let diff = 0;
      if(widthContent>78){
        diff = 78;
      }
      this.bg.setPositionX(widthLeft+widthContent/2-45);
      this.bg.parent.children[2].setPositionX(widthLeft+widthContent+(widthRight)/2-45);
      let dir = 1;
      if(this._chair === 1|| this._chair === 2){
        dir = 3;
      }
      this.content.setPositionX(widthLeft-diff+widthContent/2-dir*widthContent/2);
  }

});
