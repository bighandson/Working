var LoadGame = require('LoadGame');
var config = require('Config');
const SSSCommand = require("SSSCommand");
const FAPAI_TIME = 0.1; //发牌间隔
cc.Class({
    extends: cc.Component,

    properties: {
        MAX_POKER_NUM:8, //手牌最大数目
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

        btnLayout:cc.Node,
        btnHandleNode:cc.Node,
        clockSprite:cc.Node,
        maskFrontSprite:cc.Node,
        clockLabel : cc.Label,
        clockSprite : cc.Node,
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

        this.SPACING_POKER_X_ARR = [107,95,95];
        
        this.pokersLayouts[0].on(cc.Node.EventType.TOUCH_START,this.headPokersLayoutStart, this);
        this.pokersLayouts[1].on(cc.Node.EventType.TOUCH_START,this.midPokersLayoutStart, this);
        this.pokersLayouts[2].on(cc.Node.EventType.TOUCH_START,this.endPokersLayoutStart, this);
        this.init();
    },



    init:function()
    {
        this.clockLabel = this.clockSprite.getChildByName("clockLabel").getComponent(cc.Label);
        this.startPos = cc.p(0, 0);
        this.movePos = cc.p(0, 0);
        //以防自动调换牌墩时,进入死循环.
        this.swapIndex1 = -1;
        this.swapIndex2 = -1;
        this.clickCount = 0;
        this.schedule(this.resetClickCount, 0.5);


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
        for(let index = 1;index < 6 ;index++)
        {
            let interactable = false;
            let btn = this.btnLayout.getChildByName("type"+index+"Button");
            btn.getComponent(cc.Button).interactable  = interactable;
        }
    },

    /**
     * 倒计时回调
     */
    callback:function () {
        SssManager.soundCtrl.playSound("resources/style/poker/effect/deal.mp3");
        this.handPokersLayout.children[this.pokerLength].active = true;
        this.pokerLength++;
        this.handPokersLayout.x = this.handPokersLayout.x - 556/8;
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
        this.acard = data;
        this.maskFrontSprite.active = true;
        this.selectedArray = [];
        this.selectedObj = {};
        this.isMoving = false;
        this.totalLength =data.length;
        this.pokerLength = 0;
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
            let pokerController = pokerPrefab.getComponent("sss4Poker");
            pokerController.init(SssManager.pokersAtlas,{data:data[i],index:i});
            // pokerController.init(SssManager.pokersAtlas,{num:num,type:type});
            // pokerPrefab.on(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
        }

        this.handPokersLayout.x = 21+566;
        this.refreshLayout(null,1);
        this.schedule(this.callback, FAPAI_TIME);
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


    headPokersLayoutStart:function(event)
    {
        event.stopPropagation();
        cc.log("headPokersLayoutStart");
        if(this.pokersLayouts[0].childrenCount > 0 && this.selectedArray.length == 0){
            this.onCancelClick(null,0);
        }else{
            if(this.selectedArray == null || this.pokersLayouts[0].childrenCount > 2)
            {
                return;
            }
            if((this.selectedArray.length + this.pokersLayouts[0].childrenCount) > 2){
                return;
            }
            if(this.pokersLayouts[0].childrenCount < 2 && this.pokersLayouts[0].childrenCount >0){
                for(let i = 0; i < this.pokersLayouts[0].childrenCount; ++i){
                    this.selectedArray.push(this.pokersLayouts[0].children[i]);
                }
            }
            if(this.selectedArray.length == 2){
                let flag = this.judgePokersWeight(0,this.selectedArray,true);
                if(flag){
                    for(let i =0; i < this.selectedArray.length; ++i){
                        this.selectedArray[i].getComponent('sss4Poker').setIsSelected(false);
                    }
                    this.selectedArray = [];
                    return;
                }
            }
            this.refreshLayout(this.pokersLayouts[0]);
        }
    },

    midPokersLayoutStart:function(event)
    {
        event.stopPropagation();
        cc.log("midPokersLayoutStart");
        if(this.pokersLayouts[1].childrenCount > 0 && this.selectedArray.length == 0){
            this.onCancelClick(null,1);
        }else{
            if(this.selectedArray == null || this.pokersLayouts[1].childrenCount > 3)
            {
                return;
            }
            if((this.selectedArray.length + this.pokersLayouts[1].childrenCount) > 3){
                return;
            }

            if(this.pokersLayouts[1].childrenCount < 3 && this.pokersLayouts[1].childrenCount >0){
                for(let i = 0; i < this.pokersLayouts[1].childrenCount; ++i){
                    this.selectedArray.push(this.pokersLayouts[1].children[i]);
                }
            }

            if(this.selectedArray.length == 3){
                let flag = this.judgePokersWeight(1,this.selectedArray,true)
                if(flag){
                    for(let i =0; i < this.selectedArray.length; ++i){
                        this.selectedArray[i].getComponent('sss4Poker').setIsSelected(false);
                    }
                    this.selectedArray = [];
                    return;
                }
            }
            this.refreshLayout(this.pokersLayouts[1]);
        }
    },

    endPokersLayoutStart:function(event)
    {
        event.stopPropagation();
        cc.log("midPokersLayoutStart");
        if(this.pokersLayouts[2].childrenCount > 0 && this.selectedArray.length == 0){
            this.onCancelClick(null,2);
        }else{
            if(this.selectedArray == null || this.pokersLayouts[2].childrenCount > 3)
            {
                return;
            }
            if((this.selectedArray.length + this.pokersLayouts[2].childrenCount) > 3){
                return;
            }

            if(this.pokersLayouts[2].childrenCount < 3 && this.pokersLayouts[2].childrenCount >0){
                for(let i = 0; i < this.pokersLayouts[2].childrenCount; ++i){
                    this.selectedArray.push(this.pokersLayouts[2].children[i]);
                }
            }

            if(this.selectedArray.length == 3){
                let flag = this.judgePokersWeight(2,this.selectedArray,true)
                if(flag){
                    for(let i =0; i < this.selectedArray.length; ++i){
                        this.selectedArray[i].getComponent('sss4Poker').setIsSelected(false);
                    }
                    this.selectedArray = [];
                    return;
                }
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
                        if(SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray) == 10){
                            if(index != 0 && targetIndex != 0 && isShowAlert){
                                this.swapPokersLayout(index,targetIndex);
                            }else{
                                flag = true;
                                layoutIndex = index;
                            }
                            break;
                        }
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
                        if(SssManager.rule.judgeWeightByPokersWeight(tempWeight,layoutArray,targetArray) == 10){
                            if(index != 0 && targetIndex != 0 && isShowAlert){
                                this.swapPokersLayout(index,targetIndex);
                            }else{
                                flag = true;
                                layoutIndex = index;
                            }
                            break;
                        }
                        //相同组合比较大小
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

        if(isShowAlert && flag)
        {
            SssManager.soundCtrl.playSound("resources/style/poker/effect/wrong.mp3");
            showAlert("前一墩不能大于后一墩");
        }
        return flag;
    },

    swapPokersLayout : function (index1,index2) {
        // this.swapPokersPosition(index1,index2);
        this.swapPokersData(index1,index2);
    },

    swapPokersPosition : function (index1,index2) {
        // if(this.pokersLayouts[1].childrenCount != 3 && this.pokersLayouts[2].childrenCount != 3){
        //     return;
        // }
        // showAlert("前墩大于后墩,自动调换");
        // this.prePos1 = this.pokersLayouts[index1].getPosition();
        // this.prePos2 = this.pokersLayouts[index2].getPosition();

        // let action1 = cc.moveTo(1,this.prePos1);
        // let action2 = cc.moveTo(1,this.prePos2);

        // this.pokersLayouts[index1].runAction(action2);
        // this.pokersLayouts[index2].runAction(action1);

        // let self = this;
        // let callback = function(){
        //     self.swapPokersData(index1,index2);
        // }
        // this.scheduleOnce(callback,1);
    },

    swapPokersData : function (index1,index2) {
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
        // array1.setPosition(this.prePos1);
        // array2.setPosition(this.prePos2);
        this.refreshOrderLabel();
        showAlert("前墩大于后墩,自动调换");
    },

    refreshPokersHandLayout:function()
    {
        let length = this.handPokersLayout.childrenCount;
        let startX;
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-this.POKER_SHOW_WIDHT) - 35;
        }else
        {
            //双数
            startX = -this.POKER_SHOW_WIDHT/2-(Math.floor(length/2) - 1)*this.POKER_SHOW_WIDHT - 35;
        }

        SssManager.rule.sortPokers(this.handPokersLayout.children);
        for(let i = 0;i < length ;i++)
        {
            let poker =this.handPokersLayout.children[i];
            poker.x = startX+this.POKER_SHOW_WIDHT*i + (5 * i);
            poker.setLocalZOrder(10000+i);
            poker.getComponent("sss4Poker").index = i;
        }
    },

    refreshPokersHandLayoutBySchedule:function(length)
    {
        let startX;
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-this.POKER_SHOW_WIDHT) - 35;
        }else
        {
            //双数
            startX = -this.POKER_SHOW_WIDHT/2-(Math.floor(length/2) - 1)*this.POKER_SHOW_WIDHT - 35;
        }

        for(let i = 0;i < length ;i++)
        {
            let poker =this.handPokersLayout.children[i];
            poker.x = startX+this.POKER_SHOW_WIDHT*i + (5 * i);
            poker.setLocalZOrder(10000+i);
        }
    },


    sortShunzi : function (pokers) {
        if(pokers.length == 3){
            let wIndex = -1;
            let index1 = -1;
            let index2 = -1;
            let wCount = 0;
            for(let i = 0; i < pokers.length; ++i){
                if(SssManager.rule.getPokerNumByPoker(pokers[i]) > 14){
                    wIndex = i;
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            let wWeight;
            if(wIndex > -1 && wCount != 2){
                if(SssManager.rule.getPokerNumByPoker(pokers[index1]) == 1){
                    if(SssManager.rule.getPokerNumByPoker(pokers[index2]) == 13){
                        wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index2]) - 1;
                        pokers[wIndex].getComponent("sss4Poker").weight = wWeight;;
                    }else if(SssManager.rule.getPokerNumByPoker(pokers[index2]) == 12){
                        wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index2]) + 1;
                        pokers[wIndex].getComponent("sss4Poker").weight = wWeight;;
                    }
                }else if(SssManager.rule.getPokerNumByPoker(pokers[index2]) == 1){
                    if(SssManager.rule.getPokerNumByPoker(pokers[index1]) == 13){
                        wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index1]) - 1;
                        pokers[wIndex].getComponent("sss4Poker").weight = wWeight;;
                    }else if(SssManager.rule.getPokerNumByPoker(pokers[index1]) == 12){
                        wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index1]) + 1;
                        pokers[wIndex].getComponent("sss4Poker").weight = wWeight;;
                    }
                }else{
                    let diff = SssManager.rule.getPokerNumByPoker(pokers[index1]) - SssManager.rule.getPokerNumByPoker(pokers[index2]);
                    let isTH = SssManager.rule.getPokerTypeByPoker(pokers[index1]) == SssManager.rule.getPokerTypeByPoker(pokers[index2]);
                    if(Math.abs(diff) <= 2){
                        if(Math.abs(diff) == 1){
                            if(diff == 1){
                                wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index1]) + 1;
                                pokers[wIndex].getComponent("sss4Poker").weight = wWeight;
                            }else{
                                wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index2]) + 1;
                                pokers[wIndex].getComponent("sss4Poker").weight = wWeight;
                            }
                        }else {
                            if(diff > 0){
                                wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index1]) - 1;
                                pokers[wIndex].getComponent("sss4Poker").weight = wWeight;
                            }else{
                                wWeight = SssManager.rule.getPokerWeightByPoker(pokers[index2]) - 1;
                                pokers[wIndex].getComponent("sss4Poker").weight = wWeight;
                            }
                        }
                    }
                }
            }
        }
        SssManager.rule.sortPokers(pokers);
    },

    refreshLayoutInSwapLayout : function (pokersLayout) {
        let autoUpPokers = [];
        if(pokersLayout != null)
        {
            //上中下墩
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                let poker = this.selectedArray[i];
                let pokerController = poker.getComponent("sss4Poker");
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
                    let pokerController = poker.getComponent("sss4Poker");
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
                    let pokerController = poker.getComponent("sss4Poker");
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
            //上中下墩
            this.sortShunzi(this.selectedArray);
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                let poker = this.selectedArray[i];
                let pokerController = poker.getComponent("sss4Poker");
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
            if(this.handPokersLayout.childrenCount == 2 || this.handPokersLayout.childrenCount == 3)
            {
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++)
                {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss4Poker");
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
            if(!(this.handPokersLayout.childrenCount == 2 || this.handPokersLayout.childrenCount == 3))
            {
                for(let i = 0;i < this.handPokersLayout.childrenCount;i++) {
                    let poker = this.handPokersLayout.children[i];
                    let pokerController = poker.getComponent("sss4Poker");
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
                    if(i == 0){
                        if(autoUpPokers.length != 2){
                            flag = true;
                        }
                    }
                    if(i != 0){
                        if(autoUpPokers.length != 3){
                            flag = true;
                        }
                    }
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
                this.sortShunzi(autoUpPokers);
                for(let i = 0;i < autoUpPokers.length;i++)
                {
                    let poker = autoUpPokers[i];
                    let pokerController = poker.getComponent("sss4Poker");
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
        for(let index = 0;index < 3 ; index++)
        {
            let pokerLayout = this.pokersLayouts[index];
            this.leftLabelsNode[index].active = false;
            let label = this.leftLabelsNode[index].getComponent(cc.Label);
            let str = "";
            let typeIndex = this.getTypeIndex(pokerLayout.children);
            if(typeIndex >=0 )
            {   
                str = SssManager.bzPokersType[typeIndex];
                label.string = str;
                this.leftLabelsNode[index].active = true;
            }
            pokerLayout.weight = typeIndex; //牌组合的权重
        }
    },

    getTypeIndex:function (children) {
        let typeIndex = 0;
        if(children.length >  0)
        {
            if( SssManager.rule.isHasTonghuashun(children))
            {
                typeIndex = 4;
            }
            else if( SssManager.rule.isHasSantiao(children))
            {
                typeIndex = 3;
            }
            else if(SssManager.rule.isHasShunzi(children))
            {
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
        return typeIndex;
    },

    refreshBtn:function()
    {
        for(let index = 1;index < 6 ;index++)
        {
            let interactable = false;
            if(index == 1)
            {
                //一对
                interactable = SssManager.rule.isHasDuizi(this.handPokersLayout.children);
            }else if(index == 2)
            {
                interactable = SssManager.rule.isHasShunzi(this.handPokersLayout.children);
            }else if(index == 3)
            {
                interactable = SssManager.rule.isHasSantiao(this.handPokersLayout.children);
            }else if(index == 4)
            {
                interactable = SssManager.rule.isHasTonghuashun(this.handPokersLayout.children);
            }else if(index == 5)
            {
                interactable = this.isSp > 4;
            }
            let btn = this.btnLayout.getChildByName("type"+index+"Button");
            btn.getComponent(cc.Button).interactable  = interactable;
        }
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
            let pokerController = poker.getComponent("sss4Poker");
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
            let pokerController = poker.getComponent("sss4Poker");
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
        let pokerController = poker.getComponent("sss4Poker");
        pokerController.setIsSelected(!pokerController.isSelected);
    },

    onCancelClick:function(event, customEventData)
    {
        // SssManager.soundCtrl.playSound("resources/shisanshui/sound1/effect/click_cancel.mp3");

        this.typeSelectedIndex = 0;
        let pokersLayout = this.pokersLayouts[customEventData];
        let array = [];
        if(pokersLayout.childrenCount > 0)
        {
            for(let i =  pokersLayout.childrenCount;i > 0;i--){
                let poker = pokersLayout.children[i-1];
                if(SssManager.rule.getPokerNumByPoker(poker) > 14){
                    poker.getComponent("sss4Poker").weight = 2000000;
                }
                array.push(poker);
            }
            SssManager.rule.sortPokers(array);
            for(let i =  0;i < array.length; ++i)
            {
                array[i].off(cc.Node.EventType.TOUCH_START, this.onPokerTouchStart, this);
                array[i].parent = this.handPokersLayout;
            }
            this.refreshLayout();
        }
        this.reSetSwapLayout();
    },

    onTypeClick:function(event, customEventData)
    {
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
                    // let sanArr;
                    for(let i = 0;i < this.typeArray.length;i++)
                    {
                        // if(i == 0)
                        // {
                        //     //获取散牌
                        //     sanArr = SssManager.rule.getSanpai(this.handPokersLayout.children,this.typeArray[i]);
                        // }
                        // if(sanArr.length > 0)
                        // {
                        //     for(let j = 0;j < 1 ;j++)
                        //     {
                        //         this.typeArray[i].push(sanArr[j]);
                        //     }
                        SssManager.rule.sortPokers(this.typeArray[i]);
                        // }
                    }
                }
                this.typeSelectedIndex = 0;
            }

        }
        else if(customEventData == 2)
        {
            if(this.typeArray == null)
                {
                    this.typeArray = SssManager.rule.getShunzi(this.handPokersLayout.children);
                    this.typeSelectedIndex = 0;
                }
        }else if(customEventData == 3)
        {
            if(this.typeArray == null)
            {
                this.typeArray = SssManager.rule.getSantiao(this.handPokersLayout.children);
                this.typeSelectedIndex = 0;
            }
        }else if(customEventData == 4)
        {
            if(this.typeArray == null)
                {
                    this.typeArray = SssManager.rule.getTonghuashun(this.handPokersLayout.children);
                    this.typeSelectedIndex = 0;
                }
        }else if(customEventData == 5){
            let self = this;
            if(self.spcialAlert == null)
            {
                let path;
                // if (!!SssManager.game.sssPrefabs.specialAlertNode) {
                //     path = 'youxi/{0}/prefab/specialAlert/specialAlertNode'.format(SssManager.game.sourcePath);
                // } else {
                //     path = 'game/poker/shisanshui/{0}/prefab/specialAlert/specialAlertNode'.format(SssManager.game.sssScene);
                // }
                cc.loader.loadRes('game/bz/prefab/specialAlert/specialAlertNode',cc.Prefab,function(error,prefab){
                    if (error) {
                        cc.error(error.message || error);
                        return;
                    }
                    self.spcialAlert = cc.instantiate(prefab);
                    self.spcialAlert.parent = self.node.parent;
                    let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController4");
                    specialAlertController.onShow(self.isSp,self.acard,self);
                });
            }else {
                let specialAlertController = self.spcialAlert.getChildByName("controller").getComponent("specialAlertController4");
                specialAlertController.onShow(this.isSp,this.acard,this);
            }
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
                this.handPokersLayout.children[i].getComponent("sss4Poker").setIsSelected(false);
            }

            for(let i = 0;i < this.selectedArray.length;i++)
            {
                this.selectedArray[i].getComponent("sss4Poker").setIsSelected(true);
            }
            this.typeSelectedIndex++;
            this.showCan();
        }
    },

    showCan:function()
    {
        for(let i = 0;i < this.pokersLayouts.length;i++)
        {
            let targetNum = 3;
            if(i == 0 )
            {
                targetNum = 2;
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
        cc.log('onCompareClick');
        SssManager.soundCtrl.playSound("resources/style/poker/effect/click01.mp3");
        let pokersIndexArray = [];
        let pokersArr = [];
        for(let index = 0 ;index < 3;index++)
        {
            let pokerLayout = this.pokersLayouts[index];
            for(let i = 0;i < pokerLayout.childrenCount;i++)
            {
                let poker = pokerLayout.children[i];
                let sss1Poker = poker.getComponent("sss4Poker");
                pokersIndexArray.push(sss1Poker.serverIndex);
                pokersArr.push([sss1Poker.num,sss1Poker.type]);
            }
        }
        if(pokersIndexArray.length == 8)
        {
            for(let i = 0;i < 3;i++)
            {
                if(this.judgePokersWeight(i,this.pokersLayouts[i].children,true))
                {
                    return;
                }
            }
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
            let pokerController = poker.getComponent("sss4Poker");
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
        }
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
