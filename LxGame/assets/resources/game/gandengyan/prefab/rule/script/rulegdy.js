var LoadGame = require('LoadGame');

var WanFa = require('Wanfa');

cc.Class({
    extends: cc.Component,
    properties: {
        ruleRichText:cc.RichText,
        btnToggleGroup:cc.ToggleGroup
    },

    // use this for initialization
    onLoad: function () {
        cc.log("this.btnToggleGroup.childrenCount = "+this.btnToggleGroup.node.childrenCount);
        for(let i = 1;i <= this.btnToggleGroup.node.childrenCount;i++)
        {
            let toggle = this.btnToggleGroup.node.getChildByName("toggle"+i);
            toggle.index = i;
            toggle.on("toggle",this.onToggle.bind(this),this)
        }
        cc.log('游戏规则');
        this.richText = this.ruleRichText.getComponent(cc.RichText);
        //this.richText.string = LoadGame.getCurrentGame().description || '全民梦游游戏出品';
    },

    onToggle:function(event)
    {
        let self = this;
        var scrollView = this.richText.node.parent.parent.getComponent(cc.ScrollView);
        scrollView.scrollToTop();
        this.index =event.currentTarget.index;
        if( this.index ==  1) {
            //规则getWanfa
            //this.richText.string = LoadGame.getCurrentGame().description || '全民梦游游戏出品';
        }else
        {
            //玩法
            this.scheduleOnce(function () {
                let game = LoadGame.getCurrentGame();
                this.richText.string = !!game.getWanfa?game.getWanfa(self.ruleFlag,self.expend,true):WanFa.getWanfa(game,self.ruleFlag,true);
            },0.1)
        }
    },
    setExpend :function (expend) {
        this.expend = expend;
    },

    setRuleFlag:function(ruleFlag)
    {
        this.ruleFlag = ruleFlag;
        //this.richText.string = WanFa.getWanfa(LoadGame.getCurrentGame(),this.ruleFlag);
    },


    onCloseClick:function(){
        this.node.parent.active = false;
    },
});
