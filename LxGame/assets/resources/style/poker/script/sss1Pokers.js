cc.Class({
    extends: cc.Component,

    properties: {
        pokersLayouts:{
            default:[],
            type:cc.Node
        },
        pokersLayout:cc.Node,
        ptNode:cc.Node,
        emptyLayout:cc.Node,
        holeNode:cc.Node,
        specialSprite:cc.Node,
    },

    onLoad: function () {
        this.pokerArray = [];
        this.node.on('pokerRollFinish',this.pokerRollFinish,this);
        this.pokersLayout.on(cc.Node.EventType.TOUCH_START,this.onClickPokers,this);
    },

    onClickPokers : function () {
        cc.log(this.playerUI);
        if(this.type == 1 && this.playerUI.chair == 0){
            cc.log('onClickPokers');
            let state;
            if(!this.isPokersStateIsOne){
                state = 1;
                this.isPokersStateIsOne = true;
            }else{
                state = 2;
                this.isPokersStateIsOne = false;
            }
            for(let index = 0;index < 3 ;index++){
                for(let i = 0;i < this.pokersLayouts[index].childrenCount; i++){
                    let pokerPrefab = this.pokersLayouts[index].children[i];
                    let pokerController = pokerPrefab.getComponent("sss1Poker");
                    pokerController.setState(state);
                }
            }
        }
    },

    /**
     *
     * @param retData
     * @param playerUI
     * @param type 1=玩家自己组好牌之后显示，size大；2= 翻牌时候的牌；3 = 特殊牌型 ;4 = 显示剩下的牌
     */
    onShow:function(retData,playerUI,type)
    {    
        this.ptNode.active = false;
        this.holeNode.active = false;
        this.specialSprite.active = false;
        this.score = retData["normalscore"];
        this.totalScore = retData['curwon'];

        if(retData.seat != null)
        {
            let chair = SssManager.controller.getChairBySeatId(retData.seat);
            // if(chair == 0 || chair == 1|| chair == 2)
            // {
            //     this.ptNode.x = -408+16;
            // }else {
                this.ptNode.x = -100;
            // }
        }
        for(let i = 0;i < this.ptNode.childrenCount;i++)
        {
            this.ptNode.children[i].active = false;
        }

        this.rollCount = 0;//翻拍计数
        //this.playerScore = playerUI.beans;//玩家起始分数
        this.playerUI = playerUI;
        this.retData = retData;
        this.type = type;
        let data;

        if(retData["handcard"] == null)
        {
            data = retData;
        }else{
            let handCard = retData["handcard"];
            for(let index = 0;index < handCard.length;index++)
            {
                handCard[index] = SssManager.getCardTypeNum(parseInt(handCard[index]).toString(16));
            }
            //整理出组合好的牌
            data = [];
            let dataIndex = 0;
            for(let i = 0;i < 3 ;i++)
            {
                let dun = retData["dun"+i+"ar"];
                for(let index = 0;index < dun.length;index++)
                {
                    let pokerIndex = parseInt(dun[index]);
                    data[dataIndex] = handCard[pokerIndex];
                    dataIndex++;
                }
            }
        }

        for(let index in data)
        {
            let pokerPrefab = this.pokerArray[index];
            if(pokerPrefab == null)
            {
                pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                this.pokerArray[index] = pokerPrefab;
            }

            //type 2,4为红的
            let pokerController = pokerPrefab.getComponent("sss1Poker");
            pokerController.init(SssManager.pokersAtlas,{data:data[index],index:index});
            let layoutIndex;
            if(index < 3)
            {
                layoutIndex = 0;
            }else if(index < 8)
            {
                layoutIndex = 1;
            }else {
                layoutIndex = 2;
            }


            let layout;
            if(type == 1)
            {
                layout = this.pokersLayouts[layoutIndex];
                pokerController.setState(2);
            }else if(type == 2){
                layout = this.pokersLayouts[layoutIndex];
                pokerController.setState(1);
            }else if(type == 3){
                layout = this.pokersLayouts[layoutIndex];
                pokerController.setState(1);
            }else if(type == 4)
            {
                layout = this.emptyLayout;
                pokerController.setState(1);
            }

            if(pokerPrefab.parent == null)
            {
                pokerPrefab.parent = layout;
            }
        }

        if(type == 1)
        {
            this.emptyLayout.active = false;
            this.pokersLayout.active = true;
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = true;
            }
            this.node.getChildByName("pokersLayout").scale = 0.6;
        }else if(type == 2){
            this.emptyLayout.active = false;
            this.pokersLayout.active = true;
            // this.node.y = 0;
            //开始播放比牌
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = false;
            }
            this.node.getChildByName("pokersLayout").scale = 0.6;
            this.ptNode.active = true;
            this.playAnim(0);
        }else if(type == 3)
        {
            this.specialSprite.active = true;
            this.emptyLayout.active = false;
            this.pokersLayout.active = true;
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = true;
            }
            this.node.getChildByName("pokersLayout").scale = 0.5;
        }else if(type == 4)
        {
            this.emptyLayout.active = true;
            this.pokersLayout.active = false;
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = true;
            }
            this.emptyLayout.scale = 0.5;
        }
    },

    /**
     * 播放layout内的poker的动画
     * @param index
     */
    playAnim:function(index)
    {
        SssManager.soundCtrl.playSound("resources/style/poker/effect/exception.mp3");
        let pokersLayout = this.pokersLayouts[index];
        pokersLayout.active = true;
        let pt = this.ptNode.children[index];

        this.refreshScore(pt,index);

        if(index >= 1){
            //将每墩的名字隐藏,分数留下
            let ptt = this.ptNode.children[index - 1];
            ptt.getComponent(cc.Sprite).spriteFrame = null;
        }

        let self = this;
        if(self.ptAtlas == null)
        {
            cc.loader.loadRes("style/poker/texture/pt", cc.SpriteAtlas, function (err, atlas) {
                if(err){
                    cc.log(err);
                    return;
                }
                self.ptAtlas = atlas;
                self.refreshPt(pt,index);
            });
        }else {
            this.refreshPt(pt,index);
        }
        this.schedule(this.callback, 1.2);
    },


    refreshPt:function(pt,index)
    {
        pt.getComponent(cc.Sprite).spriteFrame = this.ptAtlas.getSpriteFrame('pt_'+this.retData["dun"+index]);
        pt.active = true;
    },

    /**
     * 倒计时回调
     */
    callback:function () {
        this.rollCount++;
        //时间到了
        if(this.rollCount == 1)
        {
            this.playAnim(1);
        }else if(this.rollCount == 2){
            this.playAnim(2);
        }else if(this.rollCount == 3){
            //翻完了
            this.showResult();
            //通知
            let ev = new cc.Event.EventCustom('ROLL_OVER',true);
            this.node.dispatchEvent(ev);
            this.unschedule(this.callback);
        }
    },



    /**
     * 纸牌翻牌计数
     * @param event
     */
    pokerRollFinish:function(event)
    {
        this.rollCount++;
        if(this.rollCount == 3)
        {
            //分数更新
            this.refreshScore(0);
            this.playAnim(1);
        }else if(this.rollCount == 8)
        {
            //分数更新
            this.refreshScore(1);
            this.playAnim(2);
        }else if(this.rollCount == 13)
        {
            //分数更新
            this.refreshScore(2);
            //翻完了
            //通知
            let ev = new cc.Event.EventCustom('ROLL_OVER',true);
            this.node.dispatchEvent(ev);
        }
    },

    showResult:function(){
        //将第三墩的名字隐藏
        let ptt = this.ptNode.children[2];
        ptt.getComponent(cc.Sprite).spriteFrame = null;

        let resultLabel;
        let pt = this.ptNode.children[3];
        pt.active = true;
        if(this.totalScore > 0){
            pt.children[0].active = true;
            pt.children[1].active = false;
            resultLabel = pt.children[0];
        }else{
            pt.children[0].active = false;
            pt.children[1].active = true;
            resultLabel = pt.children[1];
        }
        resultLabel.getComponent(cc.Label).string = '/'+Math.abs(this.totalScore).toString();
    },

    refreshScore:function(pt,index)
    {
        let resultLabel;        
        if(this.score[index] > 0){
            pt.children[0].active = true;
            pt.children[1].active = false;
            resultLabel = pt.children[0];
        }else{
            pt.children[0].active = false;
            pt.children[1].active = true;
            resultLabel = pt.children[1];
        }
        resultLabel.getComponent(cc.Label).string = '/'+Math.abs(this.score[index]).toString();
    },

});
