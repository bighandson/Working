var LoadGame = require('LoadGame');
var gpCommand = require('gpCommand');

cc.Class({
    extends: cc.Component,

    properties: {
        MAX_POKER_NUM:16,
        MAX_RES_NUM:2,
        SPACING_X:-88,
        POKER_SHOW_WIDTH:46,
        POKER_SIZE:cc.size(134,180),
        START_POKER:"START_POKER",
        SELECTED_PRE:"SELECTED_PRE",
        gameBtnLayout:cc.Node,
        handCardLayout:cc.Node,
        outCardLayout:cc.Node,
        clockSprite:cc.Node,
        nocardTip:cc.Node,
        errortip:cc.Node,
        changePai:cc.Node,
        AnimationNode:cc.Node,
    },

    onLoad: function () {
        //牌数据
        this.loadCount = 0;
        this.selectedArray = [];
        this.selectedObj = {};
        let self = this;
        // cc.loader.loadRes("guanpai/gp/prefab/pokers/texture/pokers", cc.SpriteAtlas, function (err, atlas) {
        //     if(err){
        //         cc.log(err);
        //         return;
        //     }
        //     self.pokersAtlas = atlas;
        //     self.loadCount++;

        // });

        // var url = 'guanpai/gp/prefab/pokers/gppokerSprite';
        // cc.loader.loadRes(url,cc.Prefab,function (err,prefab) {
        //     if (err) {
        //         cc.log(err);
        //         return;
        //     }
        //     self.pokerPrefab = prefab;
        //     self.loadCount++;

        //     /*self.checkLoadRes();*/
        // });
        this.init();
    },

    init:function()
    {
        this.clockLabel = this.clockSprite.getChildByName("time").getComponent(cc.Label);
        this.startPos = cc.p(0, 0);
        this.movePos = cc.p(0, 0);
        this.isMoving = false;
        this.handCardLayout.on(cc.Node.EventType.TOUCH_START, this.handCardLayoutStart, this);
        this.handCardLayout.on(cc.Node.EventType.TOUCH_MOVE, this.handCardLayoutMove, this);
        this.handCardLayout.on(cc.Node.EventType.TOUCH_END, this.handCardLayoutEnd, this);
        this.handCardLayout.on(cc.Node.EventType.TOUCH_CANCEL, this.handCardLayoutCancel, this);
        this.isBtoS = true;

    },
    autoPlay : function () {
        this.timeCount = 1;
    },
    cancelAutoPlay : function () {
        this.timeCount = 14;
    },
    callback:function () {
        this.timeCount--;

        this.clockLabel.string = this.timeCount;

        if (this.timeCount == 0) {
            if(gpManager.rule.roomType == 2){
                this.unschedule(this.callback);
                if(this.gpGame.autoPlay && this.gpGame.autoPlay.active){
                    if (this.gameBtnLayout.getChildByName("noCard").active) {
                        this.onClickNoCard();
                    } else {
                        this.onClickTips();
                        this.onClickOutCard();
                    }
                }
            }else{
                this.unschedule(this.callback);
                if(!this.gpGame.autoPlay ||  !this.gpGame.autoPlay.active ){
                    this.gpGame.onClickAuto()
                }
                if (this.gameBtnLayout.getChildByName("noCard").active) {
                    this.onClickNoCard();
                } else {
                    this.onClickTips();
                    this.onClickOutCard();
                }
            }

        }
    },


    overTime:function()
    {
        showAlert("出牌超时");
        // this.onClickNoCard()
    },
    showtime:function(time,gpGame)
    {
        this.gpGame = gpGame;

        if(gpGame.autoPlay && gpGame.autoPlay.active){
            time = 1;
        }
        this.clockLabel.string = time;
        this.timeCount = time;
        this.schedule(this.callback, 1);
        //this.schedule(this.Btncallback,0.01);

        this.clockSprite.active = true
        this.clockSprite.opacity = 0
        this.clockSprite.setPositionY(125)
        this.clockSprite.runAction(cc.sequence(cc.spawn(cc.fadeIn(0.3),cc.moveTo(0.3,cc.p(0,0)))))
    },

    NOCardCallback:function()
    {

        this.nocardtime-=0.5;
        if(this.nocardtime==0){
            this.unschedule(this.NOCardCallback);
            this.onClickNoCard();
        }
        /*if(this.type==0)
         {
         this.typeArray = SkManage.rule.getMinokers(this.handCardLayout.children);
         cc.log("this.typeArray",this.typeArray);
         if(this.typeArray.length!=0)
         {
         this.selectedArray = this.typeArray[0];
         this.onClickOutCard();
         }
         }
         else
         {
         this.onClickNoCard();
         }*/

    },

    onShow:function(data,isPlayAni){

        this.handCardLayout.removeAllChildren(true);
        //var data1 = [[1,3],[1,3],[2,3],[2,3],[1,4],[1,4],[2,4],[2,4],[1,5],[1,5],[2,5],[2,5],[1,6],[1,6],[2,6],[2,6],[1,13],[1,13],
        //[2,13],[2,13],[3,13],[3,13],[4,13],[2,8],[2,9],[3,10],[3,10]];
        for(let index in data)
        {
            let card = data[index];
            let pokerPrefab = cc.instantiate(gpManager.pokerPrefab);
            pokerPrefab.parent = this.handCardLayout;
            if(isPlayAni==1/*||isPlayAni==0*/)
            {
                pokerPrefab.opacity = 0;
                // pokerPrefab.runAction(cc.scaleTo(0.01,0.7,1));
            }else{
                // pokerPrefab.runAction(cc.scaleTo(0.01,1));
            }
            
            pokerPrefab.runAction(cc.scaleTo(0.01,0.95));

            //type 2,4为红的
            let type = card[0];
            let num  = card[1];
            //let type = card1[0];
            //let num  = card1[1];
            let info = card[2];
            let pokerController = pokerPrefab.getComponent("gppokerCtr");
            pokerController.init(gpManager.pokersAtlas,{num:num,type:type},info,index);
        }

        if(isPlayAni==1)
        {
            var Layout = this.handCardLayout.getComponent(cc.Layout);
            Layout.spacingX = -92;
            this.pokLength = 0;
            this.changePai.getComponent(cc.Button).interactable = false;
            this.schedule(this.Pokcallback, 0.05);
        }else
        {
            this.refreshPokersHandLayout();
            gpManager.rule.msgBlocked = false;
        }

    },

    //更改透明度
    drawLine:function(){
        var graphics=this.getComponent(cc.Graphics);
        graphics.circle(0,0,200);
        //添加颜色及透明度
        let fillColor = cc.Color.RED;//声明一个颜色变量
        fillColor.a=200;//添加透明度


        graphics.stroke();
        graphics.fill();

    },

    Pokcallback:function()
    {
        var self = this;
        var pokers = this.handCardLayout.children[this.pokLength];

        this.pokLength++;
        if(this.pokLength == this.handCardLayout.childrenCount)
        {
            this.unschedule(this.Pokcallback);
            pokers.runAction(cc.sequence(cc.delayTime(0.05),cc.callFunc(function(){
                self.refreshPokersHandLayout();self.changePai.getComponent(cc.Button).interactable = true;
            })));
        }
        if(this.pokLength == 15)
        {
            gpManager.rule.msgBlocked = false;
        }
        pokers.runAction(cc.spawn(cc.fadeIn(0.3),cc.scaleTo(0.07,1,1)));
    },
    handCardLayoutStart:function(event)
    {
        this.isMoving = true;
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        this.startPos = this.handCardLayout.convertToNodeSpaceAR(touchLoc);
        for(let i = 0;i < this.handCardLayout.childrenCount;i++)
        {
            let poker = this.handCardLayout.children[i];
            if(this.isPokerClickBox(i == this.handCardLayout.childrenCount-1,this.startPos,this.startPos,poker))
            {

                //选中的第一个
                this.selectedObj[this.START_POKER] = poker;
                poker.getChildByName("maskSprite").active = true;
                break
            }
        }
    },
    handCardLayoutMove:function(event)
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
        this.movePos = this.handCardLayout.convertToNodeSpaceAR(touchLoc);

        for(let i = 0;i < this.handCardLayout.childrenCount;i++)
        {
            let poker = this.handCardLayout.children[i];
            let pokerController = poker.getComponent("gppokerCtr");
            if(startPoker != poker)
            {
                if(this.isPokerClickBox(i == this.handCardLayout.childrenCount-1,this.startPos,this.movePos,poker))
                {
                    //在选中区域
                    this.selectedObj[this.SELECTED_PRE+pokerController.index] = poker;
                    poker.getChildByName("maskSprite").active = true;
                }else
                {
                    //不在选中区域
                    this.selectedObj[this.SELECTED_PRE+pokerController.index] = null;
                    poker.getChildByName("maskSprite").active = false;
                }
            }
        }
    },

    handCardLayoutEnd:function(event)
    {
        this.isMoving = false;
        this.refreshPokerState();
        this.selectedObj  = {};
        this.selectedArray = []; //选中的牌

        for(let i = 0;i < this.handCardLayout.childrenCount;i++) {
            let poker = this.handCardLayout.children[i];
            let pokerController = poker.getComponent("gppokerCtr");
            if(pokerController.isSelected)
            {
                //更新选中
                this.selectedArray.push(poker);
            }
            poker.getChildByName("maskSprite").active = false;
        }
        if(this.selectedArray.length >= 2 &&(this.type == 2 ||this.type == 0 || this.type==7))
        {
            // var temp = gpManager.rule.hitGetShunZi(this.handCardLayout.children,this.selectedArray,this.type,this.length);
            var temp = gpManager.rule.getShunZiTips(this.handCardLayout.children,this.selectedArray,this.type,this.length);
            if(temp!=0)
            {
                for(var j = 0 ;j<this.selectedArray.length;j++)
                {
                    var slected=this.selectedArray;
                    slected[j].getComponent("gppokerCtr").setIsSelected(false,false);
                }
                
                this.selectedArray = [];
                var tempArr = temp[0];
                for(let i = 0;i < tempArr.length;i++)
                {
                    this.selectedArray.push(tempArr[i]);
                    tempArr[i].getComponent("gppokerCtr").setIsSelected(true,false);
                }
            }
        }
        this.isCanoutCard();
    },

    handCardLayoutCancel:function(event)
    {
        this.isMoving = false;
        this.selectedObj  = {};
        this.selectedArray = [];
        for(let i = 0;i < this.handCardLayout.childrenCount;i++) {
            this.handCardLayout.children[i].getChildByName("maskSprite").active = false;
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
    refreshPokerState:function()
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
                this.refreshPoker(poker,i==0);
            }
        }
    },
    refreshPoker:function(poker,isPlaySound)
    {
        let pokerController = poker.getComponent("gppokerCtr");
        pokerController.setIsSelected(!pokerController.isSelected,isPlaySound);
    },


    refreshPokersHandLayout:function()
    {
        let length = this.handCardLayout.childrenCount;
        let startX;
        var Layout = this.handCardLayout.getComponent(cc.Layout);
        if(length>=2&&length<=27)
        {
            Layout.spacingX = (-92+(27-length));
        }
        else if(length>0&&length<=2)
        {
            Layout.spacingX = -67;
        }
        if(length%2 == 1)
        {
            //单数
            startX = Math.floor(length/2)*(-this.POKER_SHOW_WIDTH);
        }else
        {
            //双数
            startX = -this.POKER_SHOW_WIDTH/2-(Math.floor(length/2) - 1)*this.POKER_SHOW_WIDTH;
        }

        if(this.isBtoS)
        {
            gpManager.rule.sortHandPokersBToS(this.handCardLayout.children);
        }
        else{
            gpManager.rule.sortHandPokersMToL(this.handCardLayout.children);
        }
        for(let i = 0;i < length ;i++)
        {
            let poker =this.handCardLayout.children[i];
            poker.x = startX+this.POKER_SHOW_WIDTH*i;
            poker.setLocalZOrder(10000+i);
            poker.getComponent("gppokerCtr").index = i;
        }
    },

    sortHandPokers:function()
    {
        this.isBtoS = !this.isBtoS;

        this.refreshPokersHandLayout();
    },

    // 1  单张(2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3)
    // 2  对子
    // 3  三张
    // 4  双顺(最少2连  比较最大的一张牌)
    // 5  三顺(最少2连  比较最大的一张牌)
    // 6  三带一对( 可以压三代二散牌)
    // 9 三代二散牌()
    // 7  顺子(最少5连  A2345 最小 10JQKA 最大  比较顺子最大的一张牌)
    // 8  飞机(飞机翅膀必须为连续的 如:4455 组数必须与飞机相同 只比较飞机三顺最大一张)
    // 10  炸弹(4x 比点数)
    // 11  炸弹(3a 比点数)
    showOutCardAni:function(type)
    {   
        var node = gpManager.controller.allEffectLayout;
        var self = this;
        var effectName ='';

        if (type == 1) {
            // effectName='danzhang/danzhang_preb';
        }else if(type == 2){
            // effectName='duizi/duizi_preb';
        }else if(type == 3){
            // effectName='sanzhang/sanzhang_preb';
        }else if(type == 4){
            effectName='liandui/liandui_preb';
        }else if(type == 5){
            effectName='liansan/liansan_preb';
        }else if(type == 6 || type == 9){
            effectName='sandaier/sandaier_preb';
        }else if(type == 7){
            effectName='shunzi/shunzi_preb';
            // node = self.AnimationNode;
        }else if(type == 8 || type == 10){
            effectName='feiji/feiji_preb';
        }else if(type > 10){
            effectName='zhadan/zhadan_preb';
        }



        if(effectName!=''){
            cc.loader.loadRes("game/guanpai/effect/"+effectName, cc.Prefab, function (err, prefab) {
                if (err) {
                    cc.log("载入出牌动画出错",err)
                    return;
                }
                var module = cc.instantiate(prefab);
                module.parent = node;
                module.getComponent(cc.Animation).on('finished',  function () {
                    module.removeFromParent(true);
                    // cc.log("播放完出牌动画后 清除")
                },module);
            });
        }
    },

    refreshLayout:function(type)
    {
        // cc.log('1111111111111',SkManage.rule.getCardInfo(this.selectedArray));
        //SkManage.rule.sortHandPokers(this.selectedArray);
        //cc.log('2222222222222',SkManage.rule.getCardInfo(this.selectedArray));
        //for(let i = 0;i < this.selectedArray.length;i++)
        //{
        //    let poker = this.selectedArray[i];
        //    let pokerController = poker.getComponent("pokerCtr");
        //    pokerController.setIsSelected(false);
        //    poker.removeFromParent();
        //    poker.parent = this.outCardLayout;
        //}

        var data = gpManager.rule.getCardInfo(this.selectedArray);
        this.outCardLayout.active = true;
        // var speed = 1000;
        // var tt =0;
        for(let index=0;index<data.length;index++)
        {
            this.selectedArray[index].removeFromParent();
            let cards = data[index];
            let card = gpManager.getCardTypeNum(cards);

            let pokerPrefab = cc.instantiate(gpManager.pokerPrefabS);

            pokerPrefab.parent = this.outCardLayout;

            let type = card[0];
            let num  = card[1];
            let info = card[2];

            let pokerController = pokerPrefab.getComponent("gppokerCtrS");
            pokerController.init(gpManager.pokersAtlasS,{num:num,type:type},info);
            /*pokerPrefab.x=oldPos.x;
             pokerPrefab.y=oldPos.y;
             var l = Math.sqrt(oldPos.x*oldPos.x+oldPos.y*oldPos.y);
             var t= l/speed;
             pokerPrefab.runAction(cc.sequence(cc.delayTime(tt),cc.moveTo(t,0,0)));
             tt+=t;*/
        }

        /*let Cardcount = this.handCardLayout.childrenCount;
         var Layout = this.handCardLayout.getComponent(cc.Layout);*/

        this.showOutCardAni(type); // 自己出牌特效

        //清空选中
        this.selectedArray = [];
        this.typeArray = null;
        this.gameBtnLayout.active=false;

        this.refreshPokersHandLayout();

    },


    //属性赋值
    getCardData:function(tableid,seatId,type,length,num,X,isshow)
    {
        if( type < 0) return;

        // cc.log("getCardData===type:",type);

        this.type=type;
        cc.log("this.type",this.type);
        this.length=length;
        //cc.log("this.length",this.length);
        this.num=num;
        cc.log("this.num",this.num);
        this.tableId=tableid;///
        //cc.log("this.tableID",this.tableId);
        this.seatId=seatId;
        //cc.log("this.seatId",this.seatId);
        this.X = X;
        //cc.log("this.X",this.X);
        if(isshow)
        {
            this.onshowTip();
        }
        this.isCanoutCard();
    },
    onClickNoCard: function () {
       
        let msg={cmd :gpCommand.REQ_CMD.CMD_GiveUpOutCard};
        cc.log("NoCard_msg",msg);
        PomeloClient.request(LoadGame.getCurrentGame().server+".CMD_Command",msg
            ,function (data) {
                // cc.log(data);
            });

        for(let i = 0;i < this.selectedArray.length;i++)
        {
            let poker = this.selectedArray[i];
            let pokerController = poker.getComponent("gppokerCtr");
            pokerController.setIsSelected(false,i==0);
        }
        //清空选中
        this.selectedArray = [];
        this.typeArray = null;
        this.gameBtnLayout.active=false;
        this.unschedule(this.callback);
        //this.unschedule(this.Btncallback);

    },

    isCanoutCard:function(){

        let tipsType = this.changeCardType(this.type);
        let cardType = this.judgeCanOutCard(tipsType,this.selectedArray,this.length,this.num);

        let Type = this.changeOutCardType(cardType);
        if(Type>0)
        {   
            this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button).interactable = true;
            //this.changeCardOut();
        }
        else {
            this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button).interactable = false;
        }
    },
    changeCardOut:function()
    {
        var button = this.gameBtnLayout.getChildByName("cardOut").getComponent(cc.Button);
        button.interactable = !button.interactable;
    },

    // 点击出牌 执行
    onClickOutCard:function()
    {
        if(this.selectedArray.length!=0)    
        {   
            let tipsType = this.changeCardType(this.type);
            let cardType = this.judgeCanOutCard(tipsType,this.selectedArray,this.length,this.num);
            let Type = this.changeOutCardType(cardType);
            cc.log("出牌类型:",cardType);
            if(Type>0)
            {   
                let array=gpManager.rule.tacklePokers(this.selectedArray);
                var msg = {
                    cmd : gpCommand.REQ_CMD.CMD_OutCard,
                    data:{
                        userid:UserCenter.getUserID(),
                        tableid: this.tableId,
                        seatid: this.seatId,
                        cardtype:Type,
                        cardnum:this.selectedArray.length,
                        cardarray:array
                    }
                };
                PomeloClient.request(LoadGame.getCurrentGame().server+".CMD_Command",msg
                    ,function (data) {
                        // cc.log(data);
                    });
                /*this.outCardLayout.removeAllChildren(true);*/
                this.refreshLayout(Type);
                this.gameBtnLayout.active=false;
                this.unschedule(this.callback);
                //this.unschedule(this.Btncallback);
            }
            else{
                for(let i = 0;i < this.selectedArray.length;i++)
                {
                    let poker = this.selectedArray[i];
                    let pokerController = poker.getComponent("gppokerCtr");
                    pokerController.setIsSelected(false,i == 0);
                }
                //清空选中
                this.selectedArray = [];
                this.errortip.active=true;
                this.errortip.runAction(cc.sequence(cc.show(),cc.delayTime(1),cc.hide()));
            }

        }
    },
    onshowTip:function(){
        let tipsType = this.changeCardType(this.type);
        let Array=this.getTipsArray(tipsType,this.length,this.num);

        if(this.length>this.handCardLayout.childrenCount&&Array.length == 0)
        {
            this.gameBtnLayout.active=false;
            this.nocardtime=1;
            this.schedule(this.NOCardCallback,0.5);
            this.nocardTip.active=true;
            this.nocardTip.opacity = 255;
            this.nocardTip.runAction(cc.sequence(cc.show(),cc.delayTime(0.7),cc.fadeOut(0.5),cc.hide()));
        }
        else if(Array.length==0) // 没有打过上家的牌
        {
            //this.onClickNoCard();

            this.timeCount = 5; //  没有打过上家的牌  倒计时 直接变成5秒
            if(this.gpGame.autoPlay && this.gpGame.autoPlay.active){
                this.timeCount = 1;
            }
            this.clockLabel.string = this.timeCount;

            
            this.nocardTip.active=true;
            this.nocardTip.opacity = 255;
            this.nocardTip.runAction(cc.sequence(cc.show(),cc.delayTime(0.7),cc.fadeOut(0.5),cc.hide()));
        }
    },

    //恢复默认
    onClickDefault : function(){
        cc.find('controller',this.node.getParent().getParent().getParent()).getComponent('gpGame').hidMenu()
        for(let i = 0; i < this.handCardLayout.childrenCount;i++)
        {
            this.handCardLayout.children[i].getComponent("gppokerCtr").setIsSelected(false,i==0);
        }
        for(let i = 0;i < this.selectedArray.length;i++)
        {
            let poker = this.selectedArray[i];
            let pokerController = poker.getComponent("gppokerCtr");
            pokerController.setIsSelected(false,i==0);
        }
        //清空选中
        this.selectedArray = [];
        if(this.typeArray) this.typeArray = null;
        this.isCanoutCard();
    },

    //出牌提示
    onClickTips:function()
    {   
        if(this.typeArray == null || this.typeArray.length == 0)
        {
            //SkManage.rule.createDictionary(this.handCardLayout.children);
            let tipsType = this.changeCardType(this.type);
            this.typeArray = this.getTipsArray(tipsType,this.length,this.num);
            // cc.log("this.typeArray",this.typeArray)
            if(this.typeArray.length==0){
                this.onClickNoCard();
                // this.nocardTip.active=true;
                // this.nocardTip.opacity = 255;
                // this.nocardTip.runAction(cc.sequence(cc.show(),cc.delayTime(0.7),cc.fadeOut(0.5),cc.hide()));
            }
            //this.typeArray = this.judgeCardType(0,1,9);
            this.typeSelectedIndex = 0;
        }
        if(this.typeArray != null && this.typeArray.length > 0)
        {
            //更新下标
            if(this.typeArray.length == this.typeSelectedIndex)
            {
                this.typeSelectedIndex = 0
            }

            this.selectedArray = this.typeArray[this.typeSelectedIndex];
            this.isCanoutCard();

            //所有手牌恢复默认
            for(let i = 0; i < this.handCardLayout.childrenCount;i++)
            {
                this.handCardLayout.children[i].getComponent("gppokerCtr").setIsSelected(false,false);
            }
            //提示牌面上移  显示选中状态
            for(let i = 0;i < this.selectedArray.length;i++)
            {
                this.selectedArray[i].getComponent("gppokerCtr").setIsSelected(true,i==0);
            }
            this.typeSelectedIndex++;
        }
    },
    changeOutCardType:function(type)
    {
        let temptype =type;
        return temptype;
    },

    changeCardType:function(type)
    {
        let temptype =type;
        return temptype;
    },
    getTipsArray:function(type,length,minNum)
    {
        let TipsArray=[];

        if (type == 0) {
            var Array=this.getTipsCardType(1,1,2,true,type);
            if(Array.length>0)
            {
                for(var i=0;i<Array.length;i++)
                {
                    let temp=Array[i];
                    TipsArray.push(temp);
                }
            }
            for(var t = 2;t <= 12; t++)
            {
                var tempArr= this.getTipsCardType(t,this.handCardLayout.childrenCount,2,true,type);

                if (t == 4 || t == 5 || t == 8 || t == 7 || t == 10) {
                    tempArr = this.getTipsCardType(t,0,2,true,type);
                }

                if(tempArr.length>0)
                {   
                    for(var i=0;i<tempArr.length;i++)
                    {
                        let temp=tempArr[i];
                        TipsArray.push(temp);
                    }
                }
            }

            TipsArray = this.JudgeLastCard(TipsArray);

            return TipsArray
        }
        else if (type == 9) {
            let Array1=this.getTipsCardType(9,length,minNum,true,9);
            let Array2=this.getTipsCardType(6,length,minNum,true,6);
            if(Array1.length>0)
            {
                for(var i=0;i<Array1.length;i++)
                {
                    let temp=Array1[i];
                    TipsArray.push(temp);
                }
            }
            if(Array2.length>0)
            {
                for(var i=0;i<Array2.length;i++)
                {
                    let temp=Array2[i];
                    TipsArray.push(temp);
                }
            }

            // 4张炸弹检查
            let Array3=this.getTipsCardType(11,4,2,true,type);
            if(Array3.length>0)
            {
                for(var i=0;i<Array3.length;i++)
                {
                    let temp=Array3[i];
                    TipsArray.push(temp);
                }
            } 
            let Array4=this.getTipsCardType(12,3,13,true,type);
            if(Array4.length>0)
            {
                for(var i=0;i<Array4.length;i++)
                {
                    let temp=Array4[i];
                    TipsArray.push(temp);
                }
            } 
        }
        else if (type == 10) {
            let Array1=this.getTipsCardType(10,length,minNum,true,10);
            let Array2=this.getTipsCardType(8,length,minNum,true,8);
            if(Array1.length>0)
            {
                for(var i=0;i<Array1.length;i++)
                {
                    let temp=Array1[i];
                    TipsArray.push(temp);
                }
            }
            if(Array2.length>0)
            {
                for(var i=0;i<Array2.length;i++)
                {
                    let temp=Array2[i];
                    TipsArray.push(temp);
                }
            }

            // 4张炸弹检查
            let Array3=this.getTipsCardType(11,4,2,true,type);
            if(Array3.length>0)
            {
                for(var i=0;i<Array3.length;i++)
                {
                    let temp=Array3[i];
                    TipsArray.push(temp);
                }
            } 
            let Array4=this.getTipsCardType(12,3,13,true,type);
            if(Array4.length>0)
            {
                for(var i=0;i<Array4.length;i++)
                {
                    let temp=Array4[i];
                    TipsArray.push(temp);
                }
            } 
        }
        else if (type == 11) {   // 4张炸弹 需要加入3张炸弹的判断
            // 4张炸弹检查
            let Array1=this.getTipsCardType(11,4,minNum,true,11);
            if(Array1.length>0)
            {
                for(var i=0;i<Array1.length;i++)
                {
                    let temp=Array1[i];
                    TipsArray.push(temp);
                }
            } 

            let Array2=this.getTipsCardType(12,3,2,true,12);

            if(Array2.length>0)
            {
                for(var i=0;i<Array2.length;i++)
                {
                    let temp=Array2[i];
                    TipsArray.push(temp);
                }
            } 
        }
        else if (type < 11){
            let Array1=this.getTipsCardType(type,length,minNum,true,type);
            if(Array1.length>0)
            {
                for(var i=0;i<Array1.length;i++)
                {
                    let temp=Array1[i];
                    TipsArray.push(temp);
                }
            } 
            // 4张炸弹检查
            let Array2=this.getTipsCardType(11,4,2,true,type);
            if(Array2.length>0)
            {
                for(var i=0;i<Array2.length;i++)
                {
                    let temp=Array2[i];
                    TipsArray.push(temp);
                }
            } 
            // 3张炸弹检查
            let Array3=this.getTipsCardType(12,3,2,true,type);
            if(Array3.length>0)
            {
                for(var i=0;i<Array3.length;i++)
                {
                    let temp=Array3[i];
                    TipsArray.push(temp);
                }
            } 
        }

        return TipsArray;
    },
    JudgeLastCard:function(Array)
    {
        let PokArray = [];
        var length = this.handCardLayout.childrenCount;

        for(var i = 0;i<Array.length;i++)
        {
            let temp = Array[i];
            if(temp.length == length)
            {
                PokArray.push(temp);
                break;
            }

        }
        if(PokArray.length == 0)
        {
            return Array;
        }
        else
        {
            return PokArray;
        }
    },


    // 1   单张(2 > A > K > Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3)
    // 2   对子
    // 3   三张
    // 4   双顺(最少2连  比较最大的一张牌)
    // 5   三顺(最少2连  比较最大的一张牌)
    // 6   三带一对( 可以压三代二散牌)
    // 9   三代二散牌()
    // 7   顺子(最少5连  A2345 最小 10JQKA 最大  比较顺子最大的一张牌)
    // 8   飞机带对
    // 10  飞机带散
    // 11  炸弹(4x 比点数)
    // 12  炸弹(3a 比点数)

    //获取手牌里可以压过当前牌型的手牌数组

    /* 获取手牌提示
    * @type 提示类型
    * @num  
    * @minNum 
    * @isKtips
    * @Rtype
    */
    getTipsCardType:function(type,num,MinNum,isKtips,Rtype)
    {   
        switch(type)
        {   
            case 1:                // 单张
                return gpManager.rule.getDanzhang(this.handCardLayout.children,num,MinNum,isKtips);
                break;
            case 2:                // 对子
                return gpManager.rule.getDuizi(this.handCardLayout.children,num,MinNum,true);
                break;
            case 3:                // 三张
                return gpManager.rule.getSanTiao(this.handCardLayout.children,num,MinNum,true);
                break;
            case 4:              // 双顺
                return gpManager.rule.getLiandui(this.handCardLayout.children,num,MinNum);
                break;
            case 5:                 // 三顺
                return gpManager.rule.getSanLian(this.handCardLayout.children,num,MinNum);
                break;
            case 6:                // 三带一对
                return gpManager.rule.getSanDaidui(this.handCardLayout.children,num,MinNum);
                break;
            case 7:                  // 顺子
                return gpManager.rule.getShunZi(this.handCardLayout.children,num,MinNum);
                break;
            case 8:                   // 飞机带对
                return gpManager.rule.getFeiJi(this.handCardLayout.children,num,MinNum);
                break;
            // case 9:                // 三代杂牌
            //     return gpManager.rule.getSanDaier(this.handCardLayout.children,num,MinNum);
            //     break;
            // case 10:               // 飞机带杂牌
            //     return gpManager.rule.getFeiJi_sanpai(this.handCardLayout.children,num,MinNum);
            //     break;
            case 11:                  // 炸弹
                return gpManager.rule.getZhaDan(this.handCardLayout.children,4,MinNum,true,Rtype);
                break;
            case 12:                  // 炸弹 3张
                return gpManager.rule.getZhaDan(this.handCardLayout.children,3,MinNum,true);
                break;
            default:
                return [];
                break;
        }
    },

    
    /* 检查是否有符合type 类型的手牌 可以打出
    * @type 类型
    * @selectArray 检查数组  
    * @length 
    * @MinNum
    * @Rtype
    */
    judgeISOUTCARD:function(type,selectArray,length,MinNum,Rtype)
    {   
        switch(type)
        {   
            case 1:                // 单张
                return gpManager.rule.judgeDanZhang(selectArray,1,MinNum);
                break;
            case 2:                   // 对子
                return gpManager.rule.judgeDuizi(selectArray,2,MinNum);
                break;
            case 3:                // 三张
                return gpManager.rule.judgeSanTiao(selectArray,3,MinNum);
                break;
            case 4:              // 双顺
                return gpManager.rule.judgeLianDui(selectArray,length,MinNum);
                break;
            case 5:                 // 三顺
                return gpManager.rule.judgeSanlian(selectArray,length,MinNum);
                break;
            case 6:                // 三带一对
                return gpManager.rule.judgeSanLiandui(selectArray,length,MinNum,true);
                break;
            case 7:                  // 顺子
                return gpManager.rule.judgeShunzi(selectArray,selectArray,length,MinNum);
                break;
            case 8:                   // 飞机带对
                return gpManager.rule.judgeFeiji(selectArray,length,MinNum);
                break;
            // case 9:                 // 三代杂牌
            //     return gpManager.rule.judgeSanLianEr(selectArray,length,MinNum);
            //     break;
            // case 10:                   // 飞机带杂牌
            //     return gpManager.rule.judgeFeiji_sanpai(selectArray,length,MinNum);
            //     break;
            case 11:                  // 炸弹 4张
                return gpManager.rule.judgeZhaDan(selectArray,4,MinNum,Rtype);
                break;
            case 12:                  // 炸弹 3张
                return gpManager.rule.judgeZhaDan(selectArray,3,MinNum);
                break;
            default:
                return false;
                break;
        }
    },

    
    /* 检查是否可以出牌 返回出牌类型
    * @type 类型
    * @selectArray 检查数组  
    * @length 
    * @num
    */
    judgeCanOutCard:function(type,selectArray,length,num)
    {   
        if(type==0)
        {
            for(var i = 1;i<=12;i++)
            {
                if(this.judgeISOUTCARD(i,selectArray,selectArray.length,2,type))
                {
                    return i;
                }
            }
        }
        else if (type == 9) { // 10牌型  三带杂牌 需要 再次检查下 带二一对
            if (this.judgeISOUTCARD(9,selectArray,length,num,9)) {
                return 9;
            }else if (this.judgeISOUTCARD(6,selectArray,length,num,6)) {
                return 6;
            }
        }
        else if (type == 10) { // 10牌型  飞机带杂牌  飞机带对子 也可以压
            if (this.judgeISOUTCARD(10,selectArray,length,num,10)) {
                return 10;
            }else if (this.judgeISOUTCARD(8,selectArray,length,num,8)) {
                return 8;
            }
        }else if(type == 11){
            if (this.judgeISOUTCARD(11,selectArray,length,num,type)) {
                return 11;
            }
            if (this.judgeISOUTCARD(12,selectArray,3,2,type)) {
                return 12;
            }
        }
        else if(this.judgeISOUTCARD(type,selectArray,length,num,type)){
            return type;
        }
        

        if(type <= 10){
            if (this.judgeISOUTCARD(11,selectArray,4,2,type)) {
                return 11;
            }
            if (this.judgeISOUTCARD(12,selectArray,3,2,type)) {
                return 12;
            }
        }

        return 0;
    }

});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
