var LoadGame = require('LoadGame');
var config = require('Config');
const SSSCommand = require("SSSCommand");
cc.Class({
    extends: cc.Component,

    properties: {
        MAX_POKER_NUM:13, //手牌最大数目
        MAX_RES_NUM:2,
        SPACING_X:-46,
        POKER_SHOW_WIDHT:88,
        POKER_SIZE:cc.size(134, 180),
        SPACING_POKER_X_1:0,
        SPACING_POKER_X_2:0,
        SPACING_POKER_X_3:0,
        START_POKER:"START_POKER",
        SELECTED_PRE:"SELECTED_PRE",
        handPokersLayout:cc.Node, //手牌
        canSprites:{
            default:[],
            type:cc.Node
        },
        pokersLayouts:{
            default:[],
            type:cc.Node
        },

        leftLabelsNode:{
            default:[],
            type:cc.Node
        },

        sortBtnSprite:cc.Sprite,
        tspxBtnSprite:cc.Node,
        btnLayout:cc.Node,
        btnHandleNode:cc.Node,

        clockSprite:cc.Node,
        maskFrontSprite:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        cc.log("change");

        //牌数据
        //牌预制体的数组
        this.myPokersPrefabArr = [];

        
        this.pokersLayouts[0].index = 0;
        this.pokersLayouts[1].index = 1;
        this.pokersLayouts[2].index = 2;
        this.SPACING_POKER_X_ARR = [102,68,68];
       

        this.pokersLayouts[0].on(cc.Node.EventType.TOUCH_START,this.headPokersLayoutStart, this);
        this.pokersLayouts[1].on(cc.Node.EventType.TOUCH_START,this.midPokersLayoutStart, this);
        this.pokersLayouts[2].on(cc.Node.EventType.TOUCH_START,this.endPokersLayoutStart, this);
        this.init();
    },



    init:function()
    {
        this.clockLabel = this.clockSprite.getChildByName("clockLabel").getComponent(cc.Label);
        this.clockLabel.string = 26;
        this.startPos = cc.p(0, 0);
        this.movePos = cc.p(0, 0);
        //以防自动调换牌墩时,进入死循环.
        this.swapIndex1 = -1;
        this.swapIndex2 = -1;
        this.clickCount = 0;
        this.schedule(this.resetClickCount, 0.5);
        // this.schedule(this.clock,1);

        this.handPokersLayout.on(cc.Node.EventType.TOUCH_START, this.handPokersLayoutStart, this);
        this.handPokersLayout.on(cc.Node.EventType.TOUCH_MOVE, this.handPokersLayoutMove, this);
        this.handPokersLayout.on(cc.Node.EventType.TOUCH_END, this.handPokersLayoutEnd, this);
        this.handPokersLayout.on(cc.Node.EventType.TOUCH_CANCEL, this.handPokersLayoutCancel, this);
    },

    clock : function (){
        if(parseInt(this.clockLabel.string) > 0){
            this.clockLabel.string = parseInt(this.clockLabel.string) - 1;
        }

    },

    resetClickCount : function(){
        this.clickCount = 0;
    },

    /**
     * 刷新按钮
     */
    refreshButton:function()
    {
        for(let index = 1;index < 10 ;index++)
        {
            let interactable = false;
            let btn = this.btnLayout.getChildByName("type"+index+"Button");
            btn.getComponent(cc.Button).interactable  = interactable;
        }
        cc.log(this.isSp);
        this.tspxBtnSprite.active = this.isSp;
    },

    /**
     * 倒计时回调
     */
    callback:function () {
        SssManager.soundCtrl.playSound("resources/style/poker/effect/deal.mp3");
        this.handPokersLayout.children[this.pokerLength].active = true;
        this.pokerLength++;
        this.handPokersLayout.x = this.handPokersLayout.x - 596/13
        // this.refreshPokersHandLayoutBySchedule(this.pokerLength);
        if (this.pokerLength == this.totalLength)
        {

            this.unschedule(this.callback);
            this.maskFrontSprite.active = false;
            this.scheduleOnce(function(){
                this.refreshBtn();
            },0.1);
        }
    },

    onShow:function(data,isSp){
        //开始倒计时
        // this.timeCount = SssManager.rule.thinkTime;
        // this.schedule(this.callback, 1);
        this.clockSprite.active = SssManager.controller.roomType != 2;
        this.clockLabel.string = 26;
        this.schedule(this.clock,1);
        this.isSp = isSp || 0;
        this.maskFrontSprite.active = true;
        this.selectedArray = [];
        this.selectedObj = {};
        this.isMoving = false;
        this.totalLength =data.length;
        this.pokerLength = 0;
        this.sortType = 0;
        this.onChangeSortClickImg(1);
        this.refreshButton();
        for(let i = 0;i < data.length;i++)
        {
            let pokerPrefab = this.myPokersPrefabArr[i] ;
            if(pokerPrefab == null)
            {
                pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                pokerPrefab.parent = this.handPokersLayout;
                this.myPokersPrefabArr[i] = pokerPrefab;
            }

            pokerPrefab.active = false;
            //type 2,4为红的
            let pokerController = pokerPrefab.getComponent("sss1Poker");
            pokerController.init(SssManager.pokersAtlas,{data:data[i],index:i});
            pokerController.setIsSelected(false);
            // pokerController.init(SssManager.pokersAtlas,{num:num,type:type});
            // pokerPrefab.on(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
        }

        // if(isSp > 0)
        // {
        //     let self = this;
        //     if(self.spcialAlert == null)
        //     {
        //         cc.loader.loadRes('youxi/yongkangsss/prefab/specialAlert/specialAlertNode',cc.Prefab,function(error,prefab){
        //             if (error) {
        //                 cc.error(error.message || error);
        //                 return;
        //             }
        //             self.spcialAlert = cc.instantiate(prefab);
        //             self.spcialAlert.parent = self.node.parent;
        //             let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController5");
        //             specialAlertController.onShow(isSp,data);
        //         });
        //     }else {
        //         let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController5");
        //         specialAlertController.onShow(isSp,data);
        //     }
        // }


        this.handPokersLayout.x = 21+596;
        this.refreshLayout(null,1);
        this.schedule(this.callback, 0.07);
    },

    /**
     * 扑克触摸事件
     * @param event
     */
    onPokerTouchStart:function(event)
    {
        cc.log("onPokerTouchStart");
        // //前一个触摸的牌
        // let touchPoker = event.currentTarget;
        // if(touchPoker.parent == this.headPokersLayout || (this.touchPoker != null && this.touchPoker.parent == touchPoker.parent))
        // {
        //     return;
        // }
        //
        // if(this.touchPoker == null)
        // {
        //     this.touchPoker = touchPoker;
        // }else {
        //     //交换
        //     let parent1 = this.touchPoker.parent;
        //     let parent2 = touchPoker.parent;
        //     let p1 = this.touchPoker.getPosition();
        //     let p2 = touchPoker.getPosition();
        //     let zOrder1 = this.touchPoker.getLocalZOrder();
        //     let zOrder2 = touchPoker.getLocalZOrder();
        //
        //
        //     this.touchPoker.setPosition(p2);
        //     touchPoker.setPosition(p1);
        //     this.touchPoker.setLocalZOrder(zOrder2);
        //     touchPoker.setLocalZOrder(zOrder1);
        //     this.touchPoker.parent = parent2;
        //     touchPoker.parent = parent1;
        //     this.touchPoker = null;
        // }
    },

    clearPokersLayout : function (){
        for(let i = 0; i < this.pokersLayouts.length; ++i){
            this.pokersLayouts[i].removeAllChildren();
        }
    },


    headPokersLayoutStart:function()
    {
        cc.log("headPokersLayoutStart");
        if(this.pokersLayouts[0].childrenCount > 0){
            this.onCancelClick(null,0);
        }else{
            if(this.selectedArray == null || this.selectedArray.length != 3 || this.pokersLayouts[0].childrenCount > 0)
            {
                return;
            }
            if(this.judgePokersWeight(0,this.selectedArray,true))
            {
                return;
            }
            this.refreshLayout(this.pokersLayouts[0]);
        }
    },

    midPokersLayoutStart:function()
    {
        cc.log("midPokersLayoutStart");
        if(this.pokersLayouts[1].childrenCount > 0){
            this.onCancelClick(null,1);
            this.reSetSwapLayout();
        }else{
            if(this.selectedArray == null || this.selectedArray.length != 5 || this.pokersLayouts[1].childrenCount > 0)
            {
                return;
            }
            if(this.judgePokersWeight(1,this.selectedArray,true))
            {
                return;
            }
            this.refreshLayout(this.pokersLayouts[1]);
        }
    },

    endPokersLayoutStart:function()
    {
        cc.log("midPokersLayoutStart");
        if(this.pokersLayouts[2].childrenCount > 0){
            this.onCancelClick(null,2);
            this.reSetSwapLayout();
        }else{
            if(this.selectedArray == null || this.selectedArray.length != 5 || this.pokersLayouts[2].childrenCount > 0)
            {
                return;
            }
            if(this.judgePokersWeight(2,this.selectedArray,true))
            {
                return;
            }
            this.refreshLayout(this.pokersLayouts[2]);
        }
    },

    /**
     * 判断前后墩的权重
     * @param targetIndex
     * @returns {boolean}
     */
    judgePokersWeight:function(targetIndex,targetArray,isShowAlert)
    {
        SssManager.rule.sortPokers(targetArray);
        let targetWeight = this.getTypeIndex(targetArray);
        let flag = false;//排序是否有错
        let layoutIndex = 0;
        for(let index = 0; index < 3;index++)
        {
            let tempWeight = this.pokersLayouts[index].weight;
            let layoutArray =this.pokersLayouts[index].children;
            if(tempWeight == null)
            {
                tempWeight = -1;
            }
            if(tempWeight >= 0 && index != targetIndex)
            {
                if(index < targetIndex)
                {
                    if(tempWeight > targetWeight)
                    {
                        if(index != 0 && targetIndex != 0 && isShowAlert){
                            this.swapPokersLayout(index,targetIndex);
                        }else{
                            flag = true;
                            layoutIndex = index;
                        }
                        break;
                    }else if(tempWeight == targetWeight)
                    {
                        //相同组合比较大小
                        if(SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray) == 2){

                        }else{
                            if(SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray))
                            {
                                if(index != 0 && targetIndex != 0 && isShowAlert){
                                    this.swapPokersLayout(index,targetIndex);
                                }else{
                                    flag = true;
                                    layoutIndex = index;
                                }
                                break;
                            }
                        }
                    }
                }else if(index > targetIndex)
                {
                    if(tempWeight < targetWeight)
                    {
                        if(index != 0 && targetIndex != 0 && isShowAlert){
                            this.swapPokersLayout(index,targetIndex);
                        }else{
                            flag = true;
                            layoutIndex = index;
                        }
                        break;
                    }else if(tempWeight == targetWeight)
                    {
                       //相同组合比较大小
                        if(SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray) == 2){

                        }else{
                            if(!SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray))
                            {
                                if(index != 0 && targetIndex != 0 && isShowAlert){
                                    this.swapPokersLayout(index,targetIndex);
                                }else{
                                    flag = true;
                                    layoutIndex = index;
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }

        if(isShowAlert && flag)
        {
            SssManager.soundCtrl.playSound("resources/style/poker/effect/wrong.mp3");
            showAlert("前一墩不能大于后一墩");
        }
        return flag;
    },


    swapPokersLayout : function (index1,index2) {
        let array1 = this.pokersLayouts[index1];
        let array2 = this.pokersLayouts[index2];
        //若参数与之前记录的一致,则不执行,否则进入死循环.
        if(this.swapIndex1 == index1 && this.swapIndex2 == index2){
            return;
        }
        //将参数记录下来.
        this.swapIndex1 = index1;
        this.swapIndex2 = index2;
        this.refreshLayoutInSwapLayout(array2);
        let tempArray = new cc.Node();

        let array1Length = array1.childrenCount;
        for(let i = 0; i < array1Length; ++i){
            array1.children[0].parent = tempArray;
        }

        let array2Length = array2.childrenCount;
        for(let i = 0; i < array2Length; ++i){
            array2.children[0].parent = array1;
        }

        let tempLength = tempArray.childrenCount;
        for(let i = 0; i < tempLength; i++){
            tempArray.children[0].parent = array2;
        }

        showAlert("前墩大于后墩,自动调换");
    },

    refreshPokersHandLayout:function()
    {
        let length = this.handPokersLayout.childrenCount;
        let startX;
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-this.POKER_SHOW_WIDHT);
        }else
        {
            //双数
            startX = -this.POKER_SHOW_WIDHT/2-(Math.floor(length/2) - 1)*this.POKER_SHOW_WIDHT;
        }

        if(this.sortType == 0){
            SssManager.rule.sortPokers(this.handPokersLayout.children);
        }else{
            SssManager.rule.sortSelectedTypePokers(this.handPokersLayout.children);
        }
        
        for(let i = 0;i < length ;i++)
        {
            let poker =this.handPokersLayout.children[i];
            poker.x = startX+this.POKER_SHOW_WIDHT*i - 23;
            poker.setLocalZOrder(10000+i);
            poker.getComponent("sss1Poker").index = i;
        }
    },

    refreshPokersHandLayoutBySchedule:function(length)
    {
        let startX;
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-this.POKER_SHOW_WIDHT);
        }else
        {
            //双数
            startX = -this.POKER_SHOW_WIDHT/2-(Math.floor(length/2) - 1)*this.POKER_SHOW_WIDHT;
        }

        for(let i = 0;i < length ;i++)
        {
            let poker =this.handPokersLayout.children[i];
            poker.x = startX+this.POKER_SHOW_WIDHT*i - 23;
            poker.setLocalZOrder(10000+i);
        }
    },


    refreshLayoutInSwapLayout : function (pokersLayout) {
        let autoUpPokers = [];
        if(pokersLayout != null)
        {
            SssManager.rule.sortPokers(this.selectedArray);
            // this.selectedArray = this.sortPokers(this.selectedArray);
            //上中下墩
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                let poker = this.selectedArray[i];
                let pokerController = poker.getComponent("sss1Poker");
                pokerController.setIsSelected(false);
                poker.parent = pokersLayout;

                poker.x = this.POKER_SIZE.width/2+this.SPACING_POKER_X_ARR[pokersLayout.index]*i;
                poker.setLocalZOrder(10000+i);
                poker.on(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
            }

            pokersLayout.weight = this.getTypeIndex(pokersLayout.children); //牌组合的权重

            //清空选中
            this.selectedArray = [];
            for(let i = 0;i< this.canSprites.length;i++)
            {
                this.canSprites[i].active = false;
            }

            //如果剩下牌的个数能直接放到空的layout里，把剩下的牌变成选中的,如果可以放入三道中就放入
            if(this.handPokersLayout.childrenCount == 3 || this.handPokersLayout.childrenCount == 5)
            {
                SssManager.rule.sortPokers(this.handPokersLayout.children);
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++)
                {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss1Poker");
                    //更新选中
                    pokerController.setIsSelected(false);
                    autoUpPokers.push(poker);
                    poker.getChildByName("frontNode").getChildByName("maskSprite").active = false;
                }

                // isAutoUp = true;
                // this.showCan();
            }
        }else
        {
            if(!(this.handPokersLayout.childrenCount == 3 || this.handPokersLayout.childrenCount == 5))
            {
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++) {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss1Poker");
                    //更新选中
                    // pokerController.setIsSelected(false);
                }
                this.showCan();
            }
        }

        this.typeArray = null;
        this.touchPoker = null;
        this.refreshPokersHandLayout();
        this.refreshBtn();
        this.refreshHandHandleState();
        this.refreshOrderLabel();
    },

    // sortPokers : function (pokers) {
    //     let tpokers = pokers.slice(0);
    //     let numArr = SssManager.rule.getNumArrFromPokers(tpokers);
    //     let arr2 = SssManager.rule.getArrForNumOrType(tpokers,2,0);
    //     let arr3 = SssManager.rule.getArrForNumOrType(tpokers,3,0);
    //     let arr4 = SssManager.rule.getArrForNumOrType(tpokers,4,0);
        
    //     let pokersArr2 = [];
    //     let pokersArr3 = [];
    //     let pokersArr4 = [];
    //     for(let i = 0; i < arr4.length; ++i){
    //         let index = numArr.indexOf(arr4[i]);
    //         pokersArr4.push(tpokers[index]);
    //         pokersArr4.push(tpokers[index+1]);
    //         pokersArr4.push(tpokers[index+2]);
    //         pokersArr4.push(tpokers[index+3]);
    //         tpokers[index] = -1;
    //         tpokers[index+1] = -1;
    //         tpokers[index+2] = -1;
    //         tpokers[index+3] = -1;
    //     }
    //     for(let i = 0; i < arr3.length; ++i){
    //         let index = numArr.indexOf(arr3[i]);
    //         if(tpokers[index] != -1){
    //             pokersArr3.push(tpokers[index]);
    //             pokersArr3.push(tpokers[index+1]);
    //             pokersArr4.push(tpokers[index+2]);
    //             tpokers[index] = -1;
    //             tpokers[index+1] = -1;
    //             tpokers[index+2] = -1;
    //         }
    //     }
    //     for(let i = 0; i < arr2.length; ++i){
    //         let index = numArr.indexOf(arr2[i]);
    //         if(tpokers[index] != -1){
    //             pokersArr2.push(tpokers[index]);
    //             pokersArr2.push(tpokers[index+1]);
    //             tpokers[index] = -1;
    //             tpokers[index+1] = -1;
    //         }
    //     }
    //     cc.log('pokersArr2----------',pokersArr2);
    //     cc.log('tpokers----------',tpokers);
    //     pokers = [];
    //     for(let i = 0; i < pokersArr4.length; ++i){
    //         if(pokersArr4[i] != -1){
    //             pokers.push(pokersArr4[i]);
    //         }
    //     }
    //     for(let i = 0; i < pokersArr3.length; ++i){
    //         if(pokersArr3[i] != -1){
    //             pokers.push(pokersArr3[i]);
    //         }
    //     }
    //     for(let i = 0; i < pokersArr2.length; ++i){
    //         if(pokersArr2[i] != -1){
    //             pokers.push(pokersArr2[i]);
    //         }
    //     }
    //     for(let i = 0; i < tpokers.length; ++i){
    //         if(tpokers[i] != -1){
    //             pokers.push(tpokers[i]);
    //         }
    //     }
    //     cc.log('pokers----------',pokers);
    //     let numArr1 = SssManager.rule.getNumArrFromPokers(pokers);
    //     cc.log('numArr1----------',pokers);
    //     return pokers;
    // },

    /**
     * 刷新全部layout
     * @param pokersLayout
     * @type 1 = 不刷新btn
     */
    refreshLayout:function(pokersLayout,type)
    {
        let autoUpPokers = [];
        if(pokersLayout != null)
        {
            SssManager.rule.sortPokers(this.selectedArray);
            // this.selectedArray = this.sortPokers(this.selectedArray);
            cc.log('this.selectedArray-------',this.selectedArray);
            //上中下墩
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                let poker = this.selectedArray[i];
                let pokerController = poker.getComponent("sss1Poker");
                pokerController.setIsSelected(false);
                poker.parent = pokersLayout;

                poker.x = this.POKER_SIZE.width/2+this.SPACING_POKER_X_ARR[pokersLayout.index]*i;
                poker.setLocalZOrder(10000+i);
                poker.on(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
            }

            pokersLayout.weight = this.getTypeIndex(pokersLayout.children); //牌组合的权重

            //清空选中
            this.selectedArray = [];
            for(let i = 0;i< this.canSprites.length;i++)
            {
                this.canSprites[i].active = false;
            }

            //如果剩下牌的个数能直接放到空的layout里，把剩下的牌变成选中的,如果可以放入三道中就放入
            if(this.handPokersLayout.childrenCount == 3 || this.handPokersLayout.childrenCount == 5)
            {
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++)
                {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss1Poker");
                    //更新选中
                    pokerController.setIsSelected(false);
                    autoUpPokers.push(poker);
                    poker.getChildByName("frontNode").getChildByName("maskSprite").active = false;
                }

                // isAutoUp = true;
                // this.showCan();
            }
        }else
        {
            if(!(this.handPokersLayout.childrenCount == 3 || this.handPokersLayout.childrenCount == 5))
            {
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++) {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss1Poker");
                    //更新选中
                    // pokerController.setIsSelected(false);
                }

                this.showCan();
            }
        }

        //2017年7月13日21:23:04 start
        if(autoUpPokers.length > 0)
        {
            let flag = false;
            let targetIndex;
            let tempUpPokersLayout;

            for(let i = 0;i < this.pokersLayouts.length;i++) {
                if (this.pokersLayouts[i].childrenCount == 0){
                    targetIndex = i;
                    tempUpPokersLayout = this.pokersLayouts[i];
                    break;
                }
            }

            if(this.judgePokersWeight(targetIndex,autoUpPokers,false))
            {
                //不能直接上去，大小判断有误
                flag = true;
            }

            if(!flag && tempUpPokersLayout != null)
            {
                SssManager.rule.sortPokers(autoUpPokers);
                // autoUpPokers = this.sortPokers(autoUpPokers);
                for(let i = 0;i < autoUpPokers.length;i++)
                {
                    let poker = autoUpPokers[i];
                    let pokerController = poker.getComponent("sss1Poker");
                    pokerController.setIsSelected(false);
                    poker.parent = tempUpPokersLayout;
                    poker.x = this.POKER_SIZE.width/2+this.SPACING_POKER_X_ARR[tempUpPokersLayout.index]*i;
                    poker.setLocalZOrder(10000+i);
                    poker.on(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
                }
            }
        }
        //2017年7月13日21:23:04 end

        this.typeArray = null;
        this.touchPoker = null;
        this.refreshPokersHandLayout();
        if(type == null)
        {
            this.refreshBtn();
        }
        this.refreshHandHandleState();
        this.refreshOrderLabel();
    },

    refreshOrderLabel:function()
    {
        let self = this;
        for(let index = 0;index < 3 ; index++)
        {
            let pokerLayout = this.pokersLayouts[index];
            let pt = this.leftLabelsNode[index];
            let typeIndex = this.getTypeIndex(pokerLayout.children);
            if(typeIndex >= 0)
            {
                if(self.ptAtlas == null)
                {
                    cc.loader.loadRes("game/sss/prefab/change/texture/pt", cc.SpriteAtlas, function (err, atlas) {
                        if(err){
                            cc.log(err);
                            return;
                        }
                        self.ptAtlas = atlas;
                        self.refreshPt(pt,typeIndex);
                    });
                }else {
                    this.refreshPt(pt,typeIndex);
                }
            }else {
                pt.active = false;
            }
            pokerLayout.weight = typeIndex; //牌组合的权重
        }
    },

    refreshPt:function(pt,typeIndex)
    {
        pt.getComponent(cc.Sprite).spriteFrame = this.ptAtlas.getSpriteFrame('pt_'+typeIndex);
        pt.active = true;
    },

    getTypeIndex:function (children) {
        let typeIndex = 0;
        // console.time("getTypeIndex");
        if(children.length >  0)
        {
            if( SssManager.rule.isHasWuTong(children))
            {
                typeIndex = 9;
            }
            else if( SssManager.rule.isHasTonghuashun(children))
            {
                typeIndex = 8;
            }
            else if( SssManager.rule.isHasTiezhi(children))
            {
                typeIndex = 7;
            }
            else if( SssManager.rule.isHasHulu(children))
            {
                typeIndex = 6;
            }
            else if( SssManager.rule.isHasTonghua(children))
            {
                typeIndex = 5;
            }
            else if( SssManager.rule.isHasShunzi(children))
            {
                typeIndex = 4;
            }
            else if( SssManager.rule.isHasSantiao(children))
            {
                typeIndex = 3;
            }
            else if(SssManager.rule.isHasLiangdui(children)) {
                typeIndex = 2;
            }
            else if(SssManager.rule.isHasDuizi(children))
            {
                typeIndex = 1;
            }
        }else
        {
            typeIndex = -1;
        }
        // console.timeEnd("getTypeIndex");
        return typeIndex;
    },

    refreshBtn:function()
    {
    //    console.time("refreshBtn");
        for(let index = 1;index < 10 ;index++)
        {
            let interactable = false;
            if(index == 1)
            {
                //一对
                interactable = SssManager.rule.isHasDuizi(this.handPokersLayout.children);
            }else if(index == 2)
            {
                //两对
                interactable = SssManager.rule.isHasLiangdui(this.handPokersLayout.children);
            }else if(index == 3)
            {
                interactable = SssManager.rule.isHasSantiao(this.handPokersLayout.children);
            }else if(index == 4)
            {
                interactable = SssManager.rule.isHasShunzi(this.handPokersLayout.children);
            }else if(index == 5)
            {
                interactable = SssManager.rule.isHasTonghua(this.handPokersLayout.children);
            }else if(index == 6)
            {
                interactable = SssManager.rule.isHasHulu(this.handPokersLayout.children);
            }else if(index == 7)
            {
                interactable = SssManager.rule.isHasTiezhi(this.handPokersLayout.children);
            }else if(index == 8)
            {
                interactable = SssManager.rule.isHasTonghuashun(this.handPokersLayout.children);
            }else if(index == 9)
            {
                interactable = SssManager.rule.isHasWuTong(this.handPokersLayout.children);
            }
            let btn = this.btnLayout.getChildByName("type"+index+"Button");
            btn.getComponent(cc.Button).interactable  = interactable;
        }
        // console.timeEnd("refreshBtn");
    },

    handPokersLayoutStart:function(event)
    {
        this.isMoving = true;
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this.startPos = this.handPokersLayout.convertToNodeSpaceAR(touchLoc);
        for(let i = 0;i < this.handPokersLayout.childrenCount;i++)
        {
            let poker = this.handPokersLayout.children[i];
            if(this.isPokerClickBox(i == this.handPokersLayout.childrenCount-1,this.startPos,this.startPos,poker))
            {
                // this.refreshPokerState(poker);
                //选中的第一个
                this.selectedObj[this.START_POKER] = poker;
                poker.getChildByName("frontNode").getChildByName("maskSprite").active = true;
                break
            }
        }
    },

    isPokerClickBox:function(isEndPoker,startPos,endPos,poker)
    {
        let startPosX;
        let endPosX;
        if(startPos.x < endPos.x)
        {
            startPosX =startPos.x;
            endPosX =endPos.x;
        }else {
            startPosX =endPos.x;
            endPosX =startPos.x;
        }
        let xStart =poker.x-this.POKER_SIZE.width/2;
        let xEnd =poker.x+this.POKER_SIZE.width/2+this.SPACING_X;
        if(isEndPoker)
        {
            xEnd =poker.x+this.POKER_SIZE.width/2;
        }


        if (startPosX >= xStart && startPosX >= xStart + Math.abs(xStart-xEnd)) {
            return false;
        } else if (startPosX <= xStart && startPosX + Math.abs(startPosX-endPosX) <= xStart) {
            return false;
        }
        return true;
    },

    handPokersLayoutMove:function(event)
    {
        if(!this.isMoving)
        {
            return;
        }

        let startPoker = this.selectedObj[this.START_POKER];
        //没有选中的牌
        if(startPoker == null)
        {
            return;
        }

        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this.movePos = this.handPokersLayout.convertToNodeSpaceAR(touchLoc);

        for(let i = 0;i < this.handPokersLayout.childrenCount;i++)
        {
            let poker = this.handPokersLayout.children[i];
            let pokerController = poker.getComponent("sss1Poker");
            if(startPoker != poker)
            {
                if(this.isPokerClickBox(i == this.handPokersLayout.childrenCount-1,this.startPos,this.movePos,poker))
                {
                    //在选中区域
                    this.selectedObj[this.SELECTED_PRE+pokerController.index] = poker;
                    if(!poker.getChildByName("frontNode").getChildByName("maskSprite").active)
                    {
                        SssManager.soundCtrl.playSound("resources/style/poker/effect/click_poker.mp3");
                        poker.getChildByName("frontNode").getChildByName("maskSprite").active = true;
                    }
                }else
                {
                    //不在选中区域
                    this.selectedObj[this.SELECTED_PRE+pokerController.index] = null;
                    poker.getChildByName("frontNode").getChildByName("maskSprite").active = false;
                    if(poker.getChildByName("frontNode").getChildByName("maskSprite").active)
                    {
                        SssManager.soundCtrl.playSound("resources/style/poker/effect/click_poker.mp3");
                        poker.getChildByName("frontNode").getChildByName("maskSprite").active = false;
                    }
                }
            }
        }
    },

    /**
     * 结束选中
     * @param event
     */
    handPokersLayoutEnd:function(event)
    {
        cc.log("handPokersLayoutEnd");
        this.isMoving = false;
        this.refreshPokersState();
        this.selectedObj  = {};
        this.selectedArray = []; //选中的牌

        for(let i = 0;i < this.handPokersLayout.childrenCount;i++) {
            let poker = this.handPokersLayout.children[i];
            let pokerController = poker.getComponent("sss1Poker");
            if(pokerController.isSelected)
            {
                //更新选中
                this.selectedArray.push(poker);
            }
            poker.getChildByName("frontNode").getChildByName("maskSprite").active = false;
        }
        this.showCan();
    },

    handPokersLayoutCancel:function(event)
    {
        this.isMoving = false;
        this.selectedObj  = {};
        this.selectedArray = [];
        for(let i = 0;i < this.handPokersLayout.childrenCount;i++) {
            this.handPokersLayout.children[i].getChildByName("frontNode").getChildByName("maskSprite").active = false;
        }
    },

    refreshPokersState:function()
    {
        if(this.selectedObj[this.START_POKER] == null)
        {
            return;
        }

        //刷新第一个选中的
        this.refreshPoker(this.selectedObj[this.START_POKER]);
        for(let i = 0;i < this.MAX_POKER_NUM;i++)
        {
            let poker = this.selectedObj[this.SELECTED_PRE+i];
            if(poker != null)
            {
                this.refreshPoker(poker);
            }
        }
    },

    refreshPoker:function(poker)
    {
        SssManager.soundCtrl.playSound("resources/style/poker/effect/click_poker.mp3");
        let pokerController = poker.getComponent("sss1Poker");
        pokerController.setIsSelected(!pokerController.isSelected);
    },

    onCancelClick:function(event, customEventData)
    {
        // SssManager.soundCtrl.playSound("resources/shisanshui/sound1/effect/click_cancel.mp3");
        let pokersLayout = this.pokersLayouts[customEventData];
        cc.log(pokersLayout.children);
        if(pokersLayout.childrenCount > 0)
        {
            for(let i =  pokersLayout.childrenCount;i > 0;i--)
            {
                pokersLayout.children[i-1].off(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
                pokersLayout.children[i-1].parent = this.handPokersLayout;
            }
            this.refreshLayout();
        }
    },

    onTypeClick:function(event, customEventData)
    {
        // console.time("onTypeClick"+customEventData);
        SssManager.soundCtrl.playSound("resources/style/poker/effect/click01.mp3");
        if(this.preTypeClick != customEventData)
        {
            //与之前选的类型不同
            this.typeArray = null;
            this.preTypeClick = customEventData;
        }

        if(customEventData == 1)
        {
           //一对
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getDuizi(this.handPokersLayout.children);
                if(this.typeArray.length > 0)
                {
                    let sanArr;
                    for(let i = 0;i < this.typeArray.length;i++)
                    {
                       
                        //获取散牌
                        sanArr = SssManager.rule.getSanpai(this.handPokersLayout.children,this.typeArray[i]);
                        
                        if(sanArr.length > 2)
                        {
                            for(let j = 0;j < 3 ;j++)
                            {
                                this.typeArray[i].push(sanArr[j]);
                            }
                            SssManager.rule.sortPokers(this.typeArray[i]);
                        }
                    }
                }
                this.typeSelectedIndex = 0;
            }

        }
        else if(customEventData == 2)
        {
            //两对
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getLiangdui(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
                //获取散牌
                if(this.typeArray.length > 0)
                {
                    let sanArr;
                    for(let i = 0;i < this.typeArray.length;i++)
                    {
                        if(i == 0)
                        {
                            //获取散牌
                            sanArr = SssManager.rule.getSanpai(this.handPokersLayout.children,this.typeArray[i]);
                        }
                        if(sanArr.length > 0)
                        {
                            for(let j = 0;j < 1 ;j++)
                            {
                                this.typeArray[i].push(sanArr[j]);
                            }
                            SssManager.rule.sortPokers(this.typeArray[i]);
                        }
                    }
                }
            }
        }else if(customEventData == 3)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getSantiao(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
                //获取散牌
                if(this.typeArray.length > 0)
                {
                    
                    let sanArr;
                    for(let i = 0;i < this.typeArray.length;i++)
                    {
                        
                        sanArr = SssManager.rule.getSanpai(this.handPokersLayout.children,this.typeArray[i]);
                        
                        if(sanArr.length > 1)
                        {
                            for(let j = 0;j < 2 ;j++)
                            {
                                this.typeArray[i].push(sanArr[j]);
                            }
                            SssManager.rule.sortPokers(this.typeArray[i]);
                        }
                    }
                }
            }

        }else if(customEventData == 4)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getShunzi(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }else if(customEventData == 5)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getTonghua(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }else if(customEventData == 6)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getHulu(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }else if(customEventData == 7)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getTiezhi(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;

                //获取散牌
                if(this.typeArray.length > 0)
                {
                    let sanArr;
                    for(let i = 0;i < this.typeArray.length;i++)
                    {
                       
                        //获取散牌
                        sanArr = SssManager.rule.getSanpai(this.handPokersLayout.children,this.typeArray[i]);

                        if(sanArr.length > 0)
                        {
                            for(let j = 0;j < 1 ;j++)
                            {
                                this.typeArray[i].push(sanArr[j]);
                            }
                            SssManager.rule.sortPokers(this.typeArray[i]);
                        }
                    }
                }
            }
        }else if(customEventData == 8)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getTonghuashun(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }else if(customEventData == 9)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getWuTong(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }
        else if(customEventData == 10){
            PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
                {
                    cmd : SSSCommand.REQ_CMD.CMD_IS_SPECIAL,
                    data : {
                        userid:UserCenter.getUserID(),
                        type:1,
                    }
                }
            ,function (data) {
                cc.log(data);
            });
            this.hide();
        }

        if(this.typeArray != null && this.typeArray.length > 0)
        {
            //更新下标
            if(this.typeArray.length == this.typeSelectedIndex)
            {
                this.typeSelectedIndex = 0
            }

            this.selectedArray = this.typeArray[this.typeSelectedIndex];

            if(customEventData == 1)
            {
                if(this.sanArr != null && this.sanArr.length > 2)
                {
                    for(let i = 0;i < 3;i++)
                    {
                        this.selectedArray.push(this.sanArr[i]);
                    }
                    SssManager.rule.sortPokers(this.selectedArray);
                }
            }
            else if(customEventData == 2 || customEventData == 3)
            {
                if(this.sanArr != null && this.sanArr.length > 0)
                {
                    this.selectedArray.push(this.sanArr[0]);
                    SssManager.rule.sortPokers(this.selectedArray);
                }
            }

            //恢复默认
            for(let i = 0; i < this.handPokersLayout.childrenCount;i++)
            {   
                this.handPokersLayout.children[i].getComponent("sss1Poker").setIsSelected(false);
            }
            
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                this.selectedArray[i].getComponent("sss1Poker").setIsSelected(true);
            }
            this.showCan();
            this.typeSelectedIndex++;
        }
        // console.timeEnd("onTypeClick"+customEventData);
    },

    showCan:function()
    {
        for(let i = 0;i < this.pokersLayouts.length;i++)
        {
            let targetNum = 5;
            if(i == 0 )
            {
                targetNum = 3;
            }
            if(this.selectedArray.length == targetNum && this.pokersLayouts[i].childrenCount == 0)
            {
                //提示可以放入头
                this.canSprites[i].active = true;
                if(this.canSprites[i].getActionByTag(1) == null)
                {
                    let action = cc.repeatForever(cc.sequence(cc.fadeIn(1),cc.fadeOut(1.0)));
                    action.setTag(1);
                    this.canSprites[i].runAction(action);
                }
            }else
            {
                this.canSprites[i].active = false;
            }
        }
    },

    /**
     * 倒计时时间到了
     */
    overTime:function()
    {
        // cc.log("voerTime")
        showAlert("组牌超时");
        this.hide();
    },

    /**
     * 比牌
     */
    onCompareClick:function()
    {
        // console.time("onCompareClick");
        SssManager.soundCtrl.playSound("resources/style/poker/effect/click01.mp3");
        this.reSetSwapLayout();
        let pokersIndexArray = [];
        let pokersArr = [];
        for(let index = 0 ;index < 3;index++)
        {
            let pokerLayout = this.pokersLayouts[index];
            SssManager.rule.sortPokers(pokerLayout.children);
            for(let i = 0;i < pokerLayout.childrenCount;i++)
            {
                let poker = pokerLayout.children[i];
                let sss1Poker = poker.getComponent("sss1Poker");
                pokersIndexArray.push(sss1Poker.serverIndex);
                pokersArr.push([sss1Poker.num,sss1Poker.type]);
            }
        }
        cc.log("pokersIndexArray = ",pokersIndexArray);
        if(pokersIndexArray.length == 13)
        {
            // for(let i = 0;i < 3;i++)
            // {
            //     if(this.judgePokersWeight(i,this.pokersLayouts[i].children,true))
            //     {
            //         return;
            //     }
            // }
            // console.timeEnd("onCompareClick");

            PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
                {
                    cmd : SSSCommand.REQ_CMD.CMD_TSC_GROUP,
                    data : {
                        userid:UserCenter.getUserID(),
                        pokersIndexArray:pokersIndexArray
                    }
                }
                ,function (data) {
                cc.log(data);
            });
            // SssManager.controller.testPokers(0,pokersArr);
            this.hide();
        }else
        {
            showAlert("不符合比牌规则，请再组合一下哦");
        }
    },

    hide:function()
    {
        this.node.parent.active = false;
        this.onResetClick();
        this.unschedule(this.callback);
        this.unschedule(this.clock)
    },

    /**
     * 重置
     */
    onResetClick:function()
    {
        for(let index = 0;index < 3;index++)
        {
            this.onCancelClick(null,index);
        }
    },

    /**
     * 刷新操作按钮和手牌界面显示
     */
    refreshHandHandleState:function()
    {
        if(this.handPokersLayout.childrenCount == 0)
        {
            this.btnHandleNode.active = true;
            this.handPokersLayout.active = false;
        }else {
            this.btnHandleNode.active = false;
            this.handPokersLayout.active = true;
        }
    },

    onOutClick:function()
    {            //上中下墩
        for(let i = 0;i < this.selectedArray.length;i++)
        {
            let poker = this.selectedArray[i];
            let pokerController = poker.getComponent("sss1Poker");
            pokerController.setIsSelected(false);
        }
        this.selectedArray = [];

        this.clickCount++;
        let flag = false;
        for(let i = 0; i < this.pokersLayouts.length; ++i){
            if(this.pokersLayouts[i].childrenCount == 0){
                flag = true;
                break;
            }
        }

        if(!flag && this.clickCount > 1){
            this.clickCount = 0;
            this.onResetClick();
            this.reSetSwapLayout();
        }
    },

    onChangeSortClick : function (){
        this.onChangeSortClickImg();
        if(this.sortType == 0){
            SssManager.rule.sortSelectedTypePokers(this.handPokersLayout.children);
            let length = this.handPokersLayout.childrenCount;
            this.refreshPokersHandLayoutBySchedule(length);
            this.sortType = 1;
        }else{
            SssManager.rule.sortPokers(this.handPokersLayout.children);
            let length = this.handPokersLayout.childrenCount;
            this.refreshPokersHandLayoutBySchedule(length);
            this.sortType = 0;
        }
    },

    onChangeSortClickImg : function (index){
        let self = this;
        let res = 'sort_'+this.sortType;
        if(!!index){
            res = 'sort_'+index;
        }
        cc.loader.loadRes('game/sss/prefab/change/texture/'+res,cc.SpriteFrame,function(error,spriteFrame){
            if (error) {
                cc.error(error.message || error);
                return;
            }
            self.sortBtnSprite.spriteFrame = spriteFrame;
        });
    },

    //将此前记录下来的清除.
    reSetSwapLayout(){
        this.swapIndex1 = -1;
        this.swapIndex2 = -1;
    },

    onDestroy()
    {
        this.unschedule(this.callback);
        this.unschedule(this.resetClickCount);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
