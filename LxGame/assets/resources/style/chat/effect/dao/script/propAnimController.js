var Porp = require("Prop");

cc.Class({
    extends: cc.Component,

    properties: {
        firstImage:{
            default:[],
            type:cc.Sprite
        },
        anim:cc.Animation,
        meiliItem:cc.Node

    },

    // use this for initialization
    onLoad: function () {
        this.controller = cc.find('Canvas/controller');
        this.animation = this.anim.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,    this);
    },

    playAnim:function(sourcePos,targetPos,index)
    {
        this.chair = index - 1;
        cc.log("playAnim");
        for(let i = 1;i< 5 ;i++)
        {
            let image =this.firstImage[i-1];
            if(index == i)
            {
                image.node.active = true;
            }else
            {
                image.node.active = false;
            }
        }

        this.anim.node.active = false;
        this.meiliItem.active = false;

        this.node.stopAllActions();
        this.node.setPosition(sourcePos);
        targetPos.y = targetPos.y-10;
        let time = cc.pDistance(sourcePos,targetPos)/1300;
        let seq = cc.sequence(cc.moveTo(time, targetPos), cc.callFunc(this.onComplete, this,index));

        this.node.runAction(seq);

        // this.anim.node.active = true;
        // let animState = this.animation.play("prop"+index+"Anim");
    },

    onComplete:function(target, index)
    {
        cc.log("onComplete");
        SettingMgr.playSound("resources/common/effect/dao/sound/dao_"+index+".mp3");
        let image =this.firstImage[index-1];
        image.node.active = false;
        this.anim.node.active = true;
        this.animation.index = index;
        let animState = this.animation.play("prop"+index+"Anim");
    },
    onFinished:function()
    {
        this.anim.node.active = false;
        this.meiliItem.y = -10;
        let targetPos = cc.v2(0,30);
        let self = this;
        Porp.getProplist(function(data1,data2) {
            let ret = data2.results;
            if (ret) {
                let obj = ret[self.animation.index-1];
                if(parseInt(obj.mlds) > 0)
                {
                    self.meiliItem.active = true;
                    self.meiliItem.getChildByName("meiliLabel").getComponent(cc.Label).string =obj.mlds;
                    let seq = cc.sequence(cc.moveBy(1, targetPos), cc.callFunc(self.onMeiliComplete, self))
                    self.meiliItem.runAction(seq);
                }else
                {
                    self.meiliItem.active = false;
                    self.onMeiliComplete();
                }
            }
        });
        cc.log("onFinished");
    },

    onMeiliComplete:function()
    {
        this.meiliItem.active = false;
        this.controller.emit("HIDE_DAO",this.chair);
    }


});
