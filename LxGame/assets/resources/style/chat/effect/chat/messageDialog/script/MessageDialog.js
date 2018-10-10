/**
 * Created by Ximena on 2017/5/18.
 */

cc.Class({
  extends : cc.Component,
  properties:{
    content:cc.Node,
    item : cc.Prefab
  },

  onLoad:function(){
    // this._addItem(1,'不要吵，专心玩儿游戏吧！');
    // this._addItem(2,'快点吧，我等到花儿都谢了！');
    // this._addItem(3,'不好意思，我得离开一会儿！');
    // this._addItem(4,'你的牌打的太好了！');
    // this._addItem(5,'又断线了，网络怎么这么差！');
    // this._addItem(6,'再见了，我会想念大家的！');
    /*
    *龙游十三道
    */
    this._addItem(1,'按这个节奏打下去，我要打一年!');
    this._addItem(2,'打牌这么慢的，都要睡着了!');
    this._addItem(3,'不要吵，专心打你的牌!');
    this._addItem(4,'不要催不要催，让我想一下再出！');
    this._addItem(5,'你牌打成这个样子，还是回家练练再来吧');
    this._addItem(6,'美女，牌打得这么好，微信加一个？');
    this._addItem(7,'小鬼呢，晚上出来吃个夜宵呗');
  },

  _addItem:function(cmdIdx,string){
    let item  =  cc.instantiate(this.item);
    item.cmdIdx = cmdIdx;
    item.content = string;
    item.children[0].getComponent(cc.Label).string = string;
    item.parent = this.content;
    item.on(cc.Node.EventType.TOUCH_END,this._onItemSelect,this);
  },

  _onItemSelect:function(e){
    console.log(e.currentTarget.cmdIdx);
    this.node.active = false;
    let event = new cc.Event.EventCustom('SPEAK_MESSAGE',true);
    event.detail = {
      code:e.currentTarget.cmdIdx,
      content:e.currentTarget.content
    };
    this.node.dispatchEvent(event);
  }
});
