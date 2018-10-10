var config = require('Config');
var bzSoundC = require('bzSoundController');
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
        resultNode:cc.Node,
        scoreNode:cc.Node
    },

    onLoad: function () {
        this.pokerArray = [];
        this.score = [];
        this.node.on('pokerRollFinish',this.pokerRollFinish,this);
        this.pokersLayout.on(cc.Node.EventType.TOUCH_START,this.onClickPokers,this);
    },

    /**
     *
     * @param retData
     * @param playerUI
     * @param type 1=玩家自己组好牌之后显示，size大；2= 翻牌时候的牌；3 = 特殊牌型 ;4 = 显示剩下的牌
     */
    onShow:function(retData,playerUI,type,isSResult = false)
    {
        cc.log('ssspokers onshow',retData);
        this.resultNode.active = false;
        this.ptNode.active = false;
        this.holeNode.active = false;
        this.specialSprite.active = false;
        this.score = retData["normalscore"];
        this.sort = retData["sort"];
        this.totalScore = retData['curwon'];
        this.specialtype = retData['specialtype'];
        this.playAnim = this.playAnim1;

        if(retData.seat != null)
        {
            let chair = SssManager.controller.getChairBySeatId(retData.seat);
            if(this.isFirst){
                this.ptNode.y += 20;
                this.isFirst = false;
            }
            if(SssManager.ruleInfo.m_nTruePlayers == 6){
                if(chair == 0 ||chair == 1 || chair == 5){
                    this.ptNode.x = -400;
                }else{
                    this.ptNode.x = -408+250;
                }
            }else{
                this.ptNode.x = -408+260;
            }
            // if(chair == 0 || chair == 2){
            //     this.ptNode.x = -408+350;
            // }else if(chair == 3){
            //     this.ptNode.x = -46-25;
            // }else if(chair == 1){
            //     this.ptNode.x = -408+16-25;
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
                handCard[index] = SssManager.getCardTypeNum(handCard[index]);
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
            let pokerController = pokerPrefab.getComponent("sss4Poker");
            pokerController.init(SssManager.pokersAtlas,{data:data[index],index:index});
            let layoutIndex;
            if(index < 2)
            {
                layoutIndex = 0;
            }else if(index < 5)
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
                this.isPokersStateIsOne = false;
            }else if(type == 2){
                layout = this.pokersLayouts[layoutIndex];
                pokerController.setState(2);
            }else if(type == 3){
                layout = this.pokersLayouts[layoutIndex];
                pokerController.setState(2);
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
            this.node.getChildByName("pokersLayout").scale = 0.62;
            //this.node.y = 250;
        }else if(type == 2){
            this.emptyLayout.active = false;
            this.pokersLayout.active = true;
            // this.node.y = 0;
            //开始播放比牌
            if(SssManager.game.sourcePath == 'fuyangbz'||config.resourcesPath == 'longyou'){
                for(let index = 0;index < 3 ;index++)
                {
                    this.pokersLayouts[index].active = true;
                }
            }else{
                for(let index = 0;index < 3 ;index++)
                {
                    this.pokersLayouts[index].active = false;
                }
            }
            this.ptNode.active = true;
            this.node.getChildByName("pokersLayout").scale = 0.62;
            this.playAnim(0);
        }else if(type == 3)
        {
            this.refreshSpecialPt();
            this.emptyLayout.active = false;
            this.pokersLayout.active = true;
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = true;
            }
            this.node.getChildByName("pokersLayout").scale = 0.62;
            if(isSResult){
                this.playAnim(0);
            }
        }else if(type == 4)
        {
            this.emptyLayout.active = true;
            this.pokersLayout.active = false;
            for(let index = 0;index < 3 ;index++)
            {
                this.pokersLayouts[index].active = true;
            }
            this.emptyLayout.scale = 0.62;
        }
    },

    refreshSpecialPt : function (){
        let self = this;
        let resStr = "s_"+this.specialtype;
        cc.loader.loadRes('game/bz/prefab/poker/texture/'+resStr, cc.SpriteFrame, function (err, spriteFrame) {
            if(err){
                cc.log(err);
                return;
            }
            self.specialSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.specialSprite.active = true;
        });
    },

    /**
     * 播放layout内的poker的动画
     * @param index
     */
    //显示每道的牌和输赢分数--index第几道 ---各玩家一起显示
    playAnim1:function(index){
        let self = this;
        self.index = index;
        if(self.type == 3){
            self.specialSprite.active = true;
            for(let index = 0;index < 3 ;index++)
            {
                self.pokersLayouts[index].active = true;
                for(let i=0;i<self.pokersLayouts[index].childrenCount;++i){
                    self.pokersLayouts[index].children[i].getComponent("sss4Poker").setState(1);
                }
            }
        }
        
        if(!!SssManager.game.sssPrefabs.bzSound){
            if(self.playerUI.chair == 0){
                bzSoundC.playSoundBySex('pai_'+this.retData["dun"+index],this.playerUI.sex);
            }
        }else{
            SssManager.soundCtrl.playSound("resources/style/poker/effect/exception.mp3");
        }
        let pokersLayout = self.pokersLayouts[self.index];
        pokersLayout.active = true;

        for(let i = 0;i < pokersLayout.childrenCount;++i){
            pokersLayout.children[i].getComponent('sss4Poker').setState(1);
        }

        let pt = self.ptNode.children[self.index+3];

        if(index >= 1){
            //将每墩的名字隐藏,分数留下
            let ptt = this.ptNode.children[index - 1 + 3];
            ptt.getComponent(cc.Sprite).spriteFrame = null;
        }
        
        //特殊牌型不显示每墩的分数
        if(self.type != 3){
            self.refreshScore2(pt,self.index);
        
            if(self.ptAtlas == null)
            {
                cc.loader.loadRes('game/bz/prefab/poker/texture/fpt', cc.SpriteAtlas, function (err, atlas) {
                    if(err){
                        cc.log(err);
                        return;
                    }
                    self.ptAtlas = atlas;
                    self.refreshPt(pt,self.index);
                });
            }else {
                self.refreshPt(pt,self.index);
            }
        }

        this.schedule(this.callback, 2);
    },

    //显示每道的牌和输赢分数--index第几道 ---各玩家从小到大依次显示
    playAnim2:function(index)
    {
        let self = this;
        self.index = index;
        let playAnimCallback = function () {
            if(self.type == 3){
                self.specialSprite.active = true;
                for(let index = 0;index < 3 ;index++)
                {
                    self.pokersLayouts[index].active = true;
                    for(let i=0;i<self.pokersLayouts[index].childrenCount;++i){
                        self.pokersLayouts[index].children[i].getComponent("sss4Poker").setState(1);
                    }
                }
            }
            if(!!SssManager.game.sssPrefabs.bzSound){
                // if(self.playerUI.chair == 0){
                bzSoundC.playSoundBySex('pai_'+this.retData["dun"+index],this.playerUI.sex);
                // }
            }else{
                SssManager.soundCtrl.playSound("resources/style/poker/effect/exception.mp3");
            }
            let pokersLayout = self.pokersLayouts[self.index];
            pokersLayout.active = true;

            for(let i = 0;i < pokersLayout.childrenCount;++i){
                pokersLayout.children[i].getComponent('sss4Poker').setState(1);
            }

            let pt = self.ptNode.children[self.index+3];
            if(config.resourcesPath == 'longyou'){
                if(self.index >= 1){
                    //将每墩的名字隐藏,分数留下
                    let ptt = self.ptNode.children[self.index - 1 + 3];
                    ptt.getComponent(cc.Sprite).spriteFrame = null;
                }
            }
            
            //特殊牌型不显示每墩的分数
            if(self.type != 3){
                if(SssManager.game.sourcePath == 'fuyangbz'){
                    self.refreshScore2(pt,self.index);
                }else{
                    self.refreshScore1(pt,self.index);
                }
            }

            if(self.ptAtlas == null)
            {
                cc.loader.loadRes('style/poker/texture/pt', cc.SpriteAtlas, function (err, atlas) {
                    if(err){
                        cc.log(err);
                        return;
                    }
                    self.ptAtlas = atlas;
                    self.refreshPt(pt,self.index);
                });
            }else {
                self.refreshPt(pt,self.index);
            }
        }
        let playerCount = SssManager.ruleInfo.m_nTruePlayers;
        this.scheduleOnce(playAnimCallback,0.7*this.sort[index]);
        this.schedule(this.callback, 0.7*playerCount + 0.3);
    },

    onClickPokers : function () {
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
                    let pokerController = pokerPrefab.getComponent("sss4Poker");
                    pokerController.setState(state);
                }
            }
        }
    },

    refreshOtherPlayerScore : function(score){
        this.scoreNode.active = true;
        if(score > 0){
            this.scoreNode.children[0].getComponent(cc.Label).string = '/'+ Math.abs(score);
            this.scoreNode.children[0].active = true;
            this.scoreNode.children[1].active = false;
        }else{
            this.scoreNode.children[1].getComponent(cc.Label).string = '/'+ Math.abs(score);
            this.scoreNode.children[0].active = false;
            this.scoreNode.children[1].active = true;
        }
        this.scoreNode.getComponent(cc.Animation).play();
    },


    //显示每道的输赢,所用资源不同
    refreshPt:function(pt,index)
    {
        pt.getComponent(cc.Sprite).spriteFrame = this.ptAtlas.getSpriteFrame('pt_'+this.retData["dun"+index]);
        pt.active = true;
    },

    refreshScore2 : function (pt,index){
        this.ptNode.children[index].active = true;
        if(this.score[index] > 0){
            pt.children[0].active = true;
            pt.children[1].active = false;
            pt.children[0].getComponent(cc.Label).string = '/'+ Math.abs(this.score[index]);
        }else{
            pt.children[0].active = false;
            pt.children[1].active = true;
            pt.children[1].getComponent(cc.Label).string = '/'+ Math.abs(this.score[index]);
        }
    },

    //显示每道的输赢,所用资源不同
    refreshScore1:function(pt,index){
        if(!!!this.score){
            return;
        }
        let path;
        let height;
        if(this.score[index] > 0){
            pt.children[0].children[0].active = true;
            pt.children[0].children[1].active = false;
            path = "game/poker/shisanshui/common/font/plus";
            height = 15;
        }else{
            pt.children[0].children[0].active = false;
            pt.children[0].children[1].active = true;
            path = "game/poker/shisanshui/common/font/reduce";
            height = 10;
        }
        let self = this;
        self.pd = pt.children[0];
        cc.loader.loadRes(path, cc.SpriteFrame, function (err, spriteFrame) {
            if(err){
                cc.log(err);
                return;
            }
            self.pd.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.pd.height = height;
        });
        pt.children[0].children[0].getComponent(cc.Label).string = Math.abs(this.score[index]).toString();
        pt.children[0].children[1].getComponent(cc.Label).string = Math.abs(this.score[index]).toString();
    },

    /**
     * 倒计时回调
     */
    callback:function () {
        this.rollCount++;
        //时间到了
        if(this.rollCount == 1)
        {
            //分数更新
            this.refreshScore(0);
            this.playAnim(1);
        }else if(this.rollCount == 2){
            //分数更新
            this.refreshScore(1);
            this.playAnim(2);
        }else if(this.rollCount == 3){
            //分数更新
            this.refreshScore(2);
            //翻完了
            //通知

            //将最后一墩的名字隐藏,分数留下
            let ptt = this.ptNode.children[2+3];
            ptt.getComponent(cc.Sprite).spriteFrame = null;

            //显示结算与准备按钮
            this.showResult();
            
            let ev = new cc.Event.EventCustom('ROLL_OVER',true);
            this.node.dispatchEvent(ev);
            this.unschedule(this.callback);
        }
    },

    //比完牌后,显示本局的输赢分数
    showResult : function () {
        cc.log('this.totalScore-----',this.totalScore);
        this.resultNode.active = true;
        this.ptNode.active = true;
        if(this.totalScore >= 0){
            this.resultNode.children[1].active = true;
            this.resultNode.children[2].active = false;
            this.resultNode.children[1].getComponent(cc.Label).string = '/'+Math.abs(this.totalScore);
        }else{
            this.resultNode.children[1].active = false;
            this.resultNode.children[2].active = true;
            this.resultNode.children[2].getComponent(cc.Label).string = '/'+Math.abs(this.totalScore);
        }
    },

    /**
     * 纸牌翻牌计数
     * @param event
     */
    pokerRollFinish:function(event)
    {
        this.rollCount++;
        if(this.rollCount == 2)
        {
            //分数更新
            this.refreshScore(0);
            this.playAnim(1);
        }else if(this.rollCount == 5)
        {
            //分数更新
            this.refreshScore(1);
            this.playAnim(2);
        }else if(this.rollCount == 8)
        {
            //分数更新
            this.refreshScore(2);
            //翻完了
            //通知
            let ev = new cc.Event.EventCustom('ROLL_OVER',true);
            this.node.dispatchEvent(ev);
        }
    },

    refreshScore:function(index)
    {
        return;
        // let normalScore = this.retData["normalscore"];
        // let updateScore = normalScore[index];
        // this.playerUI.beans += updateScore;
        // let plusSprite   = this.playerUI.getChildByName("plusSprite");
        // let reduceSprite = this.playerUI.getChildByName("reduceSprite");
        // let scoreLabel;
        // if(this.playerUI.beans < 0)
        // {
        //     plusSprite.active = false;
        //     reduceSprite.active = true;
        //     scoreLabel = reduceSprite.getChildByName("scoreLabel");
        // }else
        // {
        //     plusSprite.active = true;
        //     reduceSprite.active = false;
        //     scoreLabel = plusSprite.getChildByName("scoreLabel");
        // }
        //scoreLabel.getComponent(cc.Label).string = this.playerUI.beans;
    },
});
