
/**
 * Created by Ximena on 2017/5/9.
 */
const optCode = require('MJCommand').OPT_CODE;

cc.Class({
    extends: cc.Component,

    properties: {
      atlas:cc.SpriteAtlas,
      opt:cc.Node,
      optBg:cc.Node
    },

    start:function(){
      this.node.active = false;
    },

    playAni:function(opCode){
      console.log('opCode',opCode);
      switch (opCode) {
        case optCode.optEat:
          this._playAni('chi');
          break;
        case optCode.optHit:
          this._playAni('peng');
          break;
        case optCode.optBar:
          this._playAni('gang');
          break;
        case optCode.optTing:
          this._playAni('ting');
          break;
        case optCode.optHu:
          this._playAni('hu');
          break;
        default:
          this._playFinished();
      }
    },

    _playAni:function(name){
        console.log('name',name);
        this.node.active = true;
        this.opt.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(name);
        this.optBg.getComponent(cc.Sprite).spriteFrame = this.atlas.getSpriteFrame(name);
        this.opt.parent.getComponent(cc.Animation).play('opt');
        this.opt.parent.getComponent(cc.Animation).on('finished',this._playFinished,this);
    },

    _playFinished:function(e){
      console.log('_playFinished',e);
      let event = new cc.Event.EventCustom('OPT_FINISHED',true);
      this.node.dispatchEvent(event);
    }

});
