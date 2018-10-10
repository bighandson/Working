
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
var config = require('Config');
 cc.Class({
   extends:cc.Component,
   properties:{
       bg:cc.Node,
     optPass  : cc.Node,
     optEat   : cc.Node,
     optHit   : cc.Node,
     optBar   : cc.Node,
     optHu    : cc.Node
   },

     onLoad:function()
     {
         this.sourceWidth = this.bg.width;
         this.ADD_WIDTH = 140;
         cc.log("this.sourceWidth = "+this.bg.width);
         if(config.lobbyScene == 'ouxunLobbyScene'){
            var optPass = cc.instantiate(this.optPass);
            optPass.parent = this.optPass.parent;
            this.optPass.removeFromParent(true);
            this.optEat.scale = 1.2;
            this.optHit.scale = 1.2;
            this.optBar.scale = 1.2;
            this.optHu.scale = 1.2;
         }
     },

   showTool : function (opcode) {
     let posCount = 0;
     this.node.active = true;
     this.optEat.active = opcode & RCMD_ACTION.optEat;
     this.optHit.active = opcode & RCMD_ACTION.optHit;
     this.optBar.active = opcode & RCMD_ACTION.optBar;
     this.optHu.active = opcode & RCMD_ACTION.optHu;
     if(this.optEat.active)
     {
         posCount++;
     }
     if(this.optHit.active)
    {
       posCount++;
    }
    if(this.optBar.active)
    {
       posCount++;
    }
    if(this.optHu.active)
    {
       posCount++;
    }
        cc.log("posCount = "+posCount);
       this.bg.width =  this.sourceWidth+this.ADD_WIDTH*posCount;
       cc.log("this.bg.width = "+this.bg.width);

   },
   
   hideTool : function () {
     this.node.active = false;
   },
   
   onAction : function (event,code) {
     let ev = new cc.Event.EventCustom('TOOL_ACTION',true);
     ev.setUserData(code);
     this.node.dispatchEvent(ev);
   }
   
 });
