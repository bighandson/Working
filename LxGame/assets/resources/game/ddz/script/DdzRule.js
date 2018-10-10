var config = require('Config');
var LoadGame = require('LoadGame');
const DdzCommand = require('DdzCommand');
var GamePlayer = require('GamePlayer');
// 'RCMD_Start',
//     'RCMD_Ready',
//     'RCMD_exit',
//     'RCMD_Kick',
//     'RCMD_close',
//     'RCMD_Timeout',
//     "RCMD_Result",
//     "RCMD_Command",//通用协议
//     'RCMD_Expend' ,
//     'RCMD_MatchOver',

// 'RCMD_signup',
//     'RCMD_MobileSignUp',
//     'RCMD_PlayerStatus',
//     'RCMD_initParam',
//     'RCMD_ServerHeartOut',
//     'RCMD_TaskSeat',
//     'RCMD_SitIn',
cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

        DdzManager.rule = this.node.getComponent(LoadGame.getCurrentGame().rule);
        this.initData();
        this.addPomeloListeners();

        this.node.on('CMD_Exit',this.CMD_Exit,this);
        this.node.on('onExit',this.onExit,this);

        
    },

    onDestroy:function()
    {
        this.removePomeloListeners();
    },
    /**
     * 帧事件处理消息队列
     */
    update:function()
    {
        if(!DdzManager.isResLoadComplete)
        {
            return;
        }
        if(this.msgBlocked)
        {
            return;
        }
        if(this.msgList.length == 0)
        {
            return;
        }

        let msg = this.msgList.shift();
        let route = msg.route;
        this[route](msg);
    },

    /**
     * 初始化数据
     */
    initData:function()
    {
        //存放消息数据的队列
        this.msgList = [];
        //消息队列是否阻塞
        this.msgBlocked = false;
        //游戏是否开始
        this.isPlaying = false;

        this.matchExit = false;
    },


    RCMD_Start:function(data){
        ////////////////-----cc.log("RCMD_Start");
        ////////////////-----cc.log(data);
        this.msgBlocked = true;
        this.node.emit('RCMD_Start',data);
    },

    RCMD_Ready:function(data){
        ////////////////-----cc.log("RCMD_Ready");
        ////////////////-----cc.log(data);
        this.msgBlocked = true;
        this.node.emit('RCMD_Ready',data);
    },

    /**
     *
     * @param data
     * userid, 离开哪个玩家
     */
    RCMD_exit:function(data){
        this.setMsgBlocked(true);
        this.node.emit('RCMD_exit',data);
        if (data.userid == UserCenter.getUserID()) {
            this.removePomeloListeners();
            this.backLobby();
        }
    },




    RCMD_Kick:function(data){
        ///this.msgBlocked = true;
        let msgArr = {
            0 :'您的人品不好，所以被踢下线',
            1 : '帐号在另一个地方登录，您被迫下线',
            2 : '您被管理员踢下线',
            3 : '您的游戏币不足，不能继续游戏。',
            4 : '你的断线或逃跑已经超过规定的次数,不能继续游戏',
            255 : data.srtMsg
        };
        let self = this;
        hideLoadingAni();
        this.removePomeloListeners();
        if(data.bt == 5){
            return
        }
        showAlertBox(msgArr[data.bt],function () {
            self.backLobby();
        });
    },

    RCMD_close:function(data){
        cc.log("服务端下发------RCMD_close", JSON.stringify(data));
    },

    RCMD_GameStart:function(data){
        cc.log("服务端下发------RCMD_GameStart", JSON.stringify(data));

        this.isPlaying = true;
    },

    RCMD_Timeout:function(data){
        cc.log("服务端下发------RCMD_Timeout", JSON.stringify(data));
    },

    RCMD_Expend:function(data){
        cc.log("服务端下发------RCMD_Expend", JSON.stringify(data));
    },

    RCMD_signup:function(data){
        cc.log("服务端下发------RCMD_close", JSON.stringify(data));

        if(!!data.flag){  // 登陆服务器失败
            hideLoadingAni();
            showAlertBox('进入游戏失败',function () {
                cc.director.loadScene(config.lobbyScene);  // 返回游戏大厅
            });
        }
    },

    /**
     * 进入房间
     * @param data
     * @constructor
     */
    RCMD_MobileSignUp:function(data){
        cc.log("服务端下发------RCMD_MobileSignUp", JSON.stringify(data));
        let flag = data.flag;
        let reason = data.reason;

        let self = this;
        if(flag != 0){
            hideLoadingAni();
            this.removePomeloListeners();
            showAlertBox(reason,function () {
                self.backLobby();
            });
        }
    },

    RCMD_PlayerStatus:function(data){
        cc.log("服务端下发------RCMD_PlayerStatus", JSON.stringify(data));
        this.node.emit('RCMD_PlayerStatus',data);
    },

    // RCMD_initParam:function(data){
    //
    //     this.gameid = data.gameid;
    //     this.EHBTimes = data.EHBTimes || 15;
    //     this.outTimes = data.outTimes || 10;
    //     this.roomType = data.roomType;
    //     //this.ruleFlag = data.ruleFlag&0xF0;
    //     //this. = retData.roomcode;
    //     this.currGame = data.currGame || 0;
    //     this.totalGame = data.totalGame || 0;
    //     this._currentFeng =  0;
    //     // 游戏配置信息
    //     this.game = config.getGameById(this.gameid);
    //     // this.node.emit('RCMD_initParam',data);
    //     // this.initRender();
    //     // this.resetGame();
    //     this.soundCtrl = this.node.addComponent(this.game.sound || 'DdzSound');  // 默认普通话
    //     // 复盘记录不需要触摸出牌
    //     // this.setTouchEvent();
    //     // this.initCardRoom();
    //
    //     this.node.emit("RCMD_initParam",data);
    // },

    RCMD_ServerHeartOut:function(data){
        cc.log("心跳着呢------RCMD_ServerHeartOut", JSON.stringify(data));
    },

    // RCMD_TaskSeat:function(data){
    //     ////////////////-----cc.log("RCMD_TaskSeat");
    //     ////////////////-----cc.log(data);
    //
    //     this.seatId = data.seatid;
    //     this.tableId = data.tableid;
    //     DdzManager.mySeatId = this.seatId;
    //     this.node.emit('RCMD_TaskSeat',data);
    // },

    RCMD_SitIn:function(data){
        cc.log("服务端下发------RCMD_SitIn", JSON.stringify(data));
        this.node.emit('RCMD_SitIn',data);
    },

    RCMD_Result:function(data){
        cc.log("服务端下发------RCMD_Result", JSON.stringify(data));
        this.isPlaying = false;
        this.node.emit('RCMD_Result',data);
    },

    sendExpend: function (data,cb) {
        PomeloClient.request(this.game.server + '.CMD_Expend', {
            data: data
        }, function (data) {
            if(!!cb){
                cb(data)
            }
            cc.log(data);
        });
    },

    setMsgBlocked:function(value)
    {
        this.msgBlocked = value;
    },

    getruleFlagCard:function(flag){
        cc.log('flag',flag);
        cc.log("flag&&&",flag&0x0F);
        switch(flag&0x0F){
            case 0x01:return 1;
            case 0x02:return 3;
            case 0x04:return 6;
            case 0x08:return 9;
        }
    },
    getruleFlagPlayer:function(flag){
        cc.log('flag',flag);
        cc.log("flag&&&",flag&0x10);
        if((flag&0x10)==0x10){
            return 2;
        }
        else
        {
            return 4;
        }
    },


    RCMD_Command:function(data) {

         cc.log("RCMD_Command",JSON.stringify(data));
        let cmd = data.cmd;
        let retData = data.data;
        this.setMsgBlocked(true);
        if (cmd == DdzCommand.RESP_CMD.RCMD_INITDATA) {

            cc.log("服务端下发(rule)------RCMD_Command", parseInt(data.cmd,16),JSON.stringify(data));
            cc.log('RCMD_INITDATA',retData);
            this.totalGame = retData.totalGame;
            this.baseMoney = retData.baseMoney;
            // this.playerNum = this.getruleFlagPlayer(retData.ruleFlag);
            this.playerNum = 3;
            this.cardSendNum = this.getruleFlagCard(retData.ruleFlag);
            //this.Numpokers = retData.;
            this.createRoomID = retData.createRoomID;
            this.currQuan = retData.currQuan;
            this.gameid = retData.gameid;
            this.roomKey = retData.roomKey;
            this.roomcode = retData.roomcode;
            this.roomType = retData.roomType;
            this.expend = retData.expend;
            this.game = config.getGameById(this.gameid);
            //this.soundCtrl = this.node.addComponent(this.game.sound || 'SkSound');  // 默认普通话
        } else if (cmd == DdzCommand.RESP_CMD.RCMD_LightStart) {

        } else if (cmd == DdzCommand.RESP_CMD.RCMD_CallLandOwner) {

        } else if (cmd == DdzCommand.RESP_CMD.RCMD_GrabLandOwner) {

        } else if (cmd == DdzCommand.RESP_CMD.RCMD_LightCard) {

        } else if (cmd == DdzCommand.RESP_CMD.RCMD_AddTimes) {

        } else if (cmd == DdzCommand.RESP_CMD.RCMD_GameStart)
        {
            //开始游戏
            this.setMsgBlocked(true);
            this.isPlaying = true;

        }
        else if (cmd == DdzCommand.RESP_CMD.RCMD_Runfirst)
        {
            //
            this.setMsgBlocked(true);
        }
        else if (cmd == DdzCommand.RESP_CMD.RCMD_SendCard)
        {
            //收到牌
            this.isPlaying = true;
            this.setMsgBlocked(true);
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_Change)
        {
            //收到结果
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_Eastwind)
        {
            //指定借东风
            //this.userarray = retData.userarray;//玩家数据
            this.setMsgBlocked(true);
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_First)
        {
            //指定出牌人

            //this.userarray = retData.userarray;//玩家数据
            this.setMsgBlocked(true);
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_OutCardDLink)
        {
            //
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_OutCard)
        {
            //转发出牌
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_GiveUpOutCard) {
            //转发出牌
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }else if(cmd == DdzCommand.RESP_CMD.RCMD_Result)
        {
            this.setMsgBlocked(true);
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_SendPrise)
        {

            this.setMsgBlocked(true);
        }
        else if(cmd == DdzCommand.RESP_CMD.RCMD_SendLightCardID)
        {

            this.setMsgBlocked(true);
        }
        else
        {
            this.setMsgBlocked(false);
            cc.log("无效 cmd = "+cmd);
        }

        this.node.emit('RCMD_Command',data);
    },



    /**
     *  返回大厅
     */
    backLobby : function () {
        if(this.roomType < 2 ){
            let backscene =  config.roomScene;
            cc.director.loadScene(backscene, function (err) {
                if (err) {
                    cc.log(err);
                    hideLoadingAni();
                    return;
                }
                let gameScript = cc.find('Canvas').getComponent('gameScript')
                gameScript.reInRoom()
            });
        }else{
            let backscene =  config.lobbyScene;
            cc.director.loadScene(backscene);
        }
    },


    addPomeloListeners:function()
    {
        // 消息队列
        for(var i = 0; i < DdzManager.msgRCMDQueue.length; i++){
            pomelo.on(DdzManager.msgRCMDQueue[i],this.msgQueue.bind(this));
        }

        //不需要加入队列的消息
        for(var i = 0; i < DdzManager.msgRCMDList.length;i++){
            var msg = DdzManager.msgRCMDList[i];
            pomelo.on(msg,this[msg].bind(this));
        }
    },
    getFJLianEr: function (pokers,length,num) {
        var numArr=[];//
        var tempArr=[];//
        var pokArr=[];//
        var Arr = [];
        var Arr1 = [];




        tempArr=this.createDicSHUN(pokers);///顺子只能到A
        var tempArr1=this.createDicSHUN(pokers);
        var tempnumArr=this.createSHUNCardNumArr(tempArr,num,3);
        var feijinumArr=this.getNumArr(tempnumArr,length/5);//////把飞机的数组取出来

        var tempnumArr1=this.deletFJDAIArr(tempArr1,feijinumArr);/////删除手牌中已经取到的飞机数组/////两个是因为下面的操作会冲掉


        var tempnumArr2=this.createSHUNCardNumArr(tempnumArr1,2,2);
        var lianduinumArr=this.getNumArr(tempnumArr2,length/5);

        numArr = this.combinationFJArr(feijinumArr,lianduinumArr);

        var ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            var tmp=numArr[i];
            var temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                var n = 0;
                var tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    var temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==tep[1])
                        {
                            break;
                        }
                    }
                }
            }

            pokArr.push(temp1);
        }

        return pokArr;
    },




    deletFJDAIArr:function(handArr,Arr){
        for(var i = 0;i<Arr.length;i++){
            var temp = Arr[i];
            for(var z = 0;z<temp.length;z++){
                for(var j = 0;j<handArr.length;j++){
                    if(temp[z][0]==handArr[j][0]){
                        handArr[j][1]=0;
                        break;
                    }
                }
            }
        }
        return handArr;
    },


    combinationFJArr:function(Arr1,Arr2){
        var Arr = [];
        if(Arr1.length!=0&&Arr2.length!=0){
            for(var i = 0;i<Arr2.length;i++)
            {
                var temp2 = Arr2[i];
                for(var k = 0;k<Arr1.length;k++){
                    var temp = Arr1[k];
                    var tempArr = [];
                    for(var n = 0;n<temp.length;n++){
                        tempArr.push(temp[n]);
                    }
                    for(var m =0;m<temp2.length;m++){
                        tempArr.push(temp2[m]);
                    }
                    Arr.push(tempArr);
                }

            }
        }
        return Arr;
    },


    removePomeloListeners : function () {
        for(let i = 0; i < DdzManager.msgRCMDQueue.length; i++){
            pomelo.removeAllListeners(DdzManager.msgRCMDQueue[i]);
        }

        //不需要加入队列的消息
        for(let i = 0; i < DdzManager.msgRCMDList.length; i++){
            pomelo.removeAllListeners(DdzManager.msgRCMDList[i]);
        }

        ////////////////-----cc.log(this.msgList.length);
    },

    /**
     * 把消息放入队列
     * @param data
     */
    msgQueue:function(data){
        cc.log("msgQueue",data);
        cc.log('========',this.msgList)
        if (this.matchExit) {
            return
        }
        if(!this.matchInit){
	        if(data.route == 'RCMD_Command' && data.cmd == 0x810E){
		        this.matchInit = true;
		        this.RCMD_Command(data);
	        }
        }else{
	        if(data.route == 'RCMD_Command' && data.cmd == 0x810E){
		        this.RCMD_Command(data);
	        }else{
		        this.msgList.push(data);
	        }
        }


    },

    getPokerWeightByPoker:function(poker)
    {
        return poker.getComponent("DdzpokerCtr").weight;
    },

    getPokerTypeByPoker:function(poker)
    {
        return poker.getComponent("DdzpokerCtr").type;
    },
    getpokeriofoByPoker:function(poker)
    {
        return poker.getComponent("DdzpokerCtr").info;
    },
    tacklePokers:function(pokers)
    {
        let temp = pokers;
        this.sortHandPokersBToS(temp);
        let arr=this.getCardInfo(temp);
        return arr;
    },
    racklePokers:function(pokers,type){
        let temp = pokers;
        if(type!=8){
            this.sortHandPokersBToS(temp);}
        else{
            this.sortHandPokersMToL(temp);}
        let arr = this.getCardInfo(temp);
        return arr;
    },

    getCardInfo:function(pokers){
        let arr=[];
        for(var i=0;i<pokers.length;i++)
        {
            let temp=this.getpokeriofoByPoker(pokers[i]);
            arr.push(temp);

        }
        return arr;
    },

    getPokerNumByPoker:function(poker)
    {
        return poker.getComponent("DdzpokerCtr").num;
    },
    getPokerNumByPokerS:function(poker)
    {
        return poker.getComponent("DdzpokerCtrS").num;
    },

    getPokerIndexByPoker: function(poker)  {
        return poker.getComponent("DdzpokerCtr").index;
    },


    sortHandPokers:function(pokers)
    {
        pokers.sort(function(a,b){
            return a.getComponent("DdzpokerCtr").weight-b.getComponent("DdzpokerCtr").weight;
        });
    },//

////
    sortHandPokersBToS:function(pokers)
    {
        pokers.sort(function(a,b){
            return b.getComponent("DdzpokerCtr").weight-a.getComponent("DdzpokerCtr").weight;
        });
    },
    sortHandPokersTempML: function (pokers) {
        pokers.sort(function(a,b){
            if(a.getComponent("DdzpokerCtr").pokerNum == b.getComponent("DdzpokerCtr").pokerNum)
            {
                return b.getComponent("DdzpokerCtr").weight - a.getComponent("DdzpokerCtr").weight;
            }
            else
            {

                return b.getComponent("DdzpokerCtr").pokerNum - a.getComponent("DdzpokerCtr").pokerNum;
            }
        });
    },

    sortHandPokersMToL:function(pokers)
    {
        var tempArr = this.createSortDictionary(pokers);
        for(var i = 0;i<tempArr.length;i++)
        {
            var temp = tempArr[i];
            for(var j = 0;j < pokers.length;j++)
            {
                if(temp[0]==this.getPokerNumByPoker(pokers[j]))
                {
                    if(temp[0]==16||temp[0]==17)
                    {
                        pokers[j].getComponent("DdzpokerCtr").pokerNum = temp[0];
                    }
                    else
                        pokers[j].getComponent("DdzpokerCtr").pokerNum = temp[1];
                }

            }
        }
        cc.log("pokers!!!!",pokers);
        this.sortHandPokersTempML(pokers);

    },

    sortSelectedNumPokers:function(pokers)
    {
        pokers.sort(function(a,b){
            return a.getComponent("DdzpokerCtr").num - b.getComponent("DdzpokerCtr").num;
        });
    },

    getPokerWeight:function(type,num){
        let weight;
        if(num == 17){
            weight = 10000;
        }
        else if(num == 18){
            weight = 20000;
        }
        else{
            weight = num*100;
        }

        weight += type;
        ////////////////-----cc.log(weight);
        return weight;
    },
    //删除提示重复的牌型
    deleteRepeat:function(pokers1,pokers2,length)
    {
        let tempSta=pokers1;
        let tempEnd=pokers2;
        let isrepeat=false;

        if(this.getPokerNumByPoker(tempSta[length-1])==this.getPokerNumByPoker(tempEnd[length-1]))
        {
            isrepeat=true
        }

        return isrepeat;

    },

    deletePokers:function(pokers,num)
    {
        let temp=[];
        for(var i = 0;i<pokers.length;i++)
        {
            if(this.getPokerNumByPoker(pokers[i])>num)
            {
                temp.push(pokers[i]);
            }
        }
        return temp;
    },



    //把符合所需的牌型放入数组
    pushPokers:function(arr,pokers)
    {
        if(arr.length!=0)
        {
            var isInto = true;
            for(let i=0;i<arr.length;i++)
            {
                if(this.deleteRepeat(arr[i],pokers,length))
                {
                    isInto =false;
                }
            }
            if(isInto)
            {
                arr.push(pokers);
            }
        }
        else
        {
            arr.push(pokers);
        }
        return arr;
    },
    createSortDictionary:function(pokers)
    {
        let pokersArr=[];

        for(var num = 3;num<=17;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                if(this.getPokerNumByPoker(pokers[i])==num)
                {
                    count++;
                }
            }
            if(count!=0)
            {
                temp.push(num);
                temp.push(count);
                pokersArr.push(temp);
            }
        }
        return pokersArr;
    },


    createDictionary:function(pokers,isKing)
    {
        let pokersArr=[];
        let m;
        if(isKing)
        {
            m=17;
        }
        else
        {
            m=15;
        }

        for(var num = 3;num<=m;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                if(this.getPokerNumByPoker(pokers[i])==num)
                {
                    count++;

                }
            }

            temp.push(num);
            temp.push(count);
            pokersArr.push(temp);

        }
        return pokersArr;

    },
    createXandYDictionary:function(pokers)
    {
        let pokersArr=[];

        for(var num = 3;num<=15;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                if(this.getPokerNumByPoker(pokers[i])==num)
                {
                    count++;
                }
            }
            if(count>0)
            {
                temp.push(num);
                temp.push(count);
                pokersArr.push(temp);
            }
        }
        return pokersArr;

    },
    createXandY:function(pokers)
    {
        let pokersArr=[];

        for(var num = 3;num<=15;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                if(this.getPokerNumByPoker(pokers[i])==num)
                {
                    count++;

                }
            }
            if(count>0)
            {
                temp.push(num);
                temp.push(count);
                pokersArr.push(temp);
            }


        }
        return pokersArr;

    },
    JudgeX:function(pokers)
    {
        var tempArr=this.createXandYDictionary(pokers);
        var X = tempArr.length;
        return X;
    },
    JudgeNum:function(pokers)
    {
        var isANum = false;
        var is2Num = false;
        var minnum = 15;
        var tempArr = this.createXandYDictionary(pokers);
        for(var i = 0 ;i<tempArr.length;i++)
        {
            var temp = tempArr[i];
            if(temp[0]<minnum){
                minnum = temp[0];
            }
            if(temp[0] == 14){
                isANum=true;
            }
            if(temp[0] == 15){
                is2Num = true;
            }
        }
        if(isANum&&is2Num){
            return 1;
        }
        else if(is2Num&&!isANum){
            return 2;
        }
        else{
            var arr = tempArr[0];
            return minnum;
        }
    },
    JudgeA:function(Arr){
        var isANum = false;
        var is2Num = false;
        for(var i = 0;i<Arr.length;i++)
        {
            var temp = Arr[i];
            if(temp[0] == 1){
                isANum=true;
            }
            if(temp[0] == 2){
                is2Num = true;
            }
        }
        if(isANum&&is2Num){
            return true;
        }
        else if(is2Num&&!isANum){
            return true;
        }
        else{
            return false;
        }
    },

    createDicSHUN:function(pokers)
    {
        let pokersArr=[];
        let n=0;
        for(var num = 3;num<=14;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                let x=this.getPokerNumByPoker(pokers[i]);
                if(x==num)
                {
                    count += 1;
                }
            }

            temp.push(num);
            temp.push(count);
            pokersArr.push(temp);

        }
        return pokersArr;
    },

    createSanLianErArr:function(handArr,Arr){
        for(var i=0;i<Arr.length;i++){
            var tempArr = Arr[i];
            for(var j=0;j<handArr.length;j++){
                var temp = handArr[i];
                if(tempArr[0]==temp[0]){
                    temp[1]=temp[1]-tempArr[1];
                    break;
                }
            }
        }
        return handArr;
    },
    createDicHuanShun:function(pokers)
    {
        let pokersArr=[];
        for(var num = 1;num<=14;num++)
        {
            var n=num;
            if(num==1)
            {
                n=14;
            }
            if(num==2)
            {
                n=15;
            }
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                let x=this.getPokerNumByPoker(pokers[i]);
                if(x==n)
                {
                    count += 1;
                }
            }

            temp.push(num);
            temp.push(count);

            pokersArr.push(temp);

        }
        return pokersArr;
    },
    createHitDicSHUN:function(pokers,num1,num2,n)
    {
        let pokersArr=[];
        for(var num = num1;num<=num2;num++)
        {
            let temp=[];
            let count=0;
            for(var i = 0;i<pokers.length;i++)
            {
                let x=this.getPokerNumByPoker(pokers[i]);
                if(x==num)
                {
                    count += 1;
                }
            }

            if(count >= n)
            {
                temp.push(num);
                temp.push(count);
                pokersArr.push(temp);
            }
        }
        // ////////////////-----cc.log(pokersArr);
        return pokersArr;
    },

    createDanZhangCardNumArr:function(tempArr,num,n,isPull)
    {
        let numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            let temp1 = tempArr[i];
            if(temp1[1]== n)
            {
                numArr.push(temp1[0]);
            }
        }
        if(!isPull)
        {
            for(var i=num-2;i<tempArr.length;i++)
            {
                let temp2 = tempArr[i];
                if(temp2[1]>n&&temp2[1]<4)
                {
                    numArr.push(temp2[0]);
                }
            }
        }

        return numArr;
    },
    //num 最小值 n 数组没给元素

    createCardNumArr:function(tempArr,num,n,isPull)
    {
        let numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            let temp1 = tempArr[i];
            if(temp1[1]==n)
            {
                numArr.push(temp1[0]);
            }
        }
        if(!isPull)
        {
            for(var i=num-2;i<tempArr.length;i++)
            {
                let temp2 = tempArr[i];
                if(temp2[1]>n&&temp2[1]<4)
                {
                    numArr.push(temp2[0]);
                }
            }
        }

        return numArr;
    },
    createFirstCardNumArr:function(tempArr)
    {
        let numArr = [];
        for(var i=0;i<tempArr.length;i++)
        {
            let temp1 = tempArr[i];
            if(temp1[1]>0&&temp1[1]<4)
            {
                numArr.push(temp1);
            }
        }

        return numArr;
    },
    createSHUNCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            let temp = tempArr[i];

            if(temp[1]>=n)
            {
                numArr.push(temp);
            }
        }
        return numArr;
    },

    createSHUNSanlianCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            let temp = tempArr[i];

            if(temp[1]>=n)
            {
                temp[1] = n;
                numArr.push(temp);
            }
        }
        return numArr;
    },
    createHUANSHUNCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=num;i<tempArr.length;i++)
        {
            let temp = tempArr[i];

            if(temp[1]>=n)
            {
                numArr.push(temp);
            }
        }
        return numArr;
    },
    createLianduiCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            let temp = tempArr[i];
            if(temp[1]>=n)
            {
                numArr.push(temp);
            }
        }
        return numArr;
    },
    createHUANLianduiCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=num;i<tempArr.length;i++)
        {
            let temp = tempArr[i];
            if(temp[1]>=n)
            {
                numArr.push(temp);
            }
        }
        return numArr;
    },


    getMinokers:function(pokers)
    {
        let pokArr=[];//存放牌数组
        let ret =DdzManager.combination(pokers,1);
        let temp = ret[0];
        pokArr.push(temp);
        return pokArr;
    },

    getFirstPok:function(pokers)
    {
        let numArr = [];
        let tempArr = [];
        let pokArr = [];
        tempArr = this.createDictionary(pokers,true);
        numArr = this.createFirstCardNumArr(tempArr);


        let ret =K105Manager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let temp1 = [];
            let n = 0;
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];
                let tep = numArr[i];

                if(tep[0]==this.getPokerNumByPoker(temp[0]))
                {
                    temp1.push(temp[0]);
                    n++;
                    if(n==tep[1])
                    {
                        break;
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;

    },
    // 获取pokers 里 数量为num的牌
    getDicForNums:function(pokers,num,length) {
        let tempArr=this.createDictionary(pokers,true);
        let numArr = [];
        for (var i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            if (temp[1] == length && temp[0] > num) {
                numArr.push(temp[0])
            }
        }
        return numArr;
    },
    //单张
    getDanzhang:function(pokers,length,num,isKing){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组


        tempArr=this.createDictionary(pokers,isKing);
        // numArr=this.createCardNumArr(tempArr,num,1,false);
        numArr=this.createDanZhangCardNumArr(tempArr,num,1,false);
        // numArr = this.getDicForNums(pokers,num,1);

        ////////////////-----cc.log(numArr);
        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];
                if(numArr[i]==this.getPokerNumByPoker(temp[0]))
                {
                    pokArr.push(temp);
                    break;
                }
            }
        }
        return pokArr;
    },

    //判断是否单张
    judgeDanZhang:function(pokers,lenght,num)
    {

        if(pokers.length != 1)
        {
            return false;
        }
        if(this.getPokerNumByPoker(pokers[0])>num)
        {
            return true;
        }
        else
        {return false;}
    },
    deleteKing:function(arr)
    {
        let ary = [];
        for(var i = 0;i<ary.length;i++)
        {
            let temp=arr[i];
        }
    },

    //对子

    getDuizi:function(pokers,length,num,isKing){

        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length && pokers.length != 2)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,isKing);
        numArr=this.createCardNumArr(tempArr,num,2,false);


        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let temp1 = [];
            let n = 0;
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];

                if(numArr[i]==this.getPokerNumByPoker(temp[0]))
                {
                    temp1.push(temp[0]);
                    n++;
                    if(n==2)
                    {
                        break;
                    }
                }
            }
            pokArr.push(temp1);
        }


        return pokArr;
    },
    //判断是否是对子
    judgeDuizi:function(pokers,length,num)
    {
        if(pokers.length!=length)
        {
            return false;
        }
        let tempDZ=this.getDuizi(pokers,length,num,true);
        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },


    //三张
    getSanTiao:function(pokers,length,num,isKing){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length<length)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,isKing);
        numArr=this.createCardNumArr(tempArr,num,3,true);


        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let temp1 = [];
            let n = 0;
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];

                if(numArr[i]==this.getPokerNumByPoker(temp[0]))
                {
                    temp1.push(temp[0]);
                    n++;
                    if(n==3)
                    {
                        break;
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },
    judgeSanTiao:function(pokers,length,num)
    {
        if(pokers.length!=length)
        {
            return false;
        }
        let tempDZ=this.getSanTiao(pokers,length,num,true);
        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    getNumArr:function(arr,n)
    {
        n = parseInt(n);
        let numArr = [];
        let temp = arr;
        for(var i = 0;i<temp.length+1-n;i++)
        {
            let tmp = [];
            let isTRUE;
            tmp.push(temp[i]);
            let temp2=temp[i];
            for(var j =1;j<n;j++)
            {
                let temp1=temp[i+j];
                if(temp2[0]==temp1[0]-j||temp1[0]==17)
                {
                    isTRUE=true;
                    tmp.push(temp[i+j]);
                }
                else
                {
                    isTRUE=false;
                }
            }
            if(isTRUE)
            {
                numArr.push(tmp);
            }

        }

        return numArr;
    },

    //连对
    getLiandui:function(pokers,length,num){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<6)
        {
            return pokArr;
        }

        tempArr=this.createDicSHUN(pokers);

        let tempnumArr=this.createSHUNCardNumArr(tempArr,num,2);
        numArr=this.getNumArr(tempnumArr,length/2);

        ////////////////-----cc.log("numArr_________!!!!!!",numArr);

        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let tmp=numArr[i];
            let temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                let n = 0;
                let tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    let temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==2)
                        {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;

    },
    getLianSan:function(pokers,length,num)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<6)
        {
            return pokArr;
        }
        //cc.log("连三---------------------")
        tempArr=this.createDicSHUN(pokers);

        let tempnumArr=this.createSHUNCardNumArr(tempArr,num,3);
        numArr=this.getNumArr(tempnumArr,length/3);

        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let tmp=numArr[i];
            let temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                let n = 0;
                let tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    let temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==3)
                        {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }
        return pokArr;
    },
    //判断是否是连对
    judgeLianDui:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length%2!=0||pokers.length<6||this.judgeZapai(pokers,pokers.length/2))
        {
            return false;
        }

        let tempDZ=this.getLiandui(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeLianSan:function(pokers,length,num)
    {
        // if(pokers.length!=length||pokers.length%3!=0||pokers.length<6||this.judgeZapai(pokers,pokers.length/3))
        if(pokers.length!=length||pokers.length%3!=0||pokers.length<6||this.judgeZapai(pokers,pokers.length/3))
        {
            return false;
        }

        let tempDZ=this.getLianSan(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeFeijiDaiEr:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length%4!=0||pokers.length<8)
        {
            return false;
        }

        let tempDZ=this.getFeijiDaiEr(pokers,length,num);


        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    getFeiJi:function(pokers,length,num)
    {
        if(pokers.length<length||pokers.length<10)
        {
            return [];
        }

        let pokArr=[];

        let tempArr=this.createDicSHUN(pokers);//字典


        let tempnumArr = [];  // 三张数组

        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] > num && ttemp[1] == 3) {
                tempnumArr.push(ttemp)
            }
        }

        if (tempnumArr.length < 2) {return [];}   //三张数组不超过2 直接返回

        let numArr=this.getNumArr(tempnumArr,length/5);

        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }

        if (numArr.length <= 0 ) {return []}

        let listDui = this.getSanDaierArr(pokers,2); // 对子

        if (listDui.length < numArr[0].length) {return [];}

        listDui = this.createArray(listDui,numArr[0].length)

        let poktemp = [];

        let ll = numArr[0].length


        for (var i = 0; i < numArr.length; i++) {
            let san = numArr[i];

            if (listDui.length > 0) {
                for (var n = 0; n < listDui.length; n++) {
                    let temp = [];
                    for (var k = 0; k < san.length; k++) {
                        temp.push(san[k])
                    }
                    let dui = listDui[n];
                    for (var j = 0; j < dui.length; j++) {
                        temp.push(dui[j])
                    }

                    poktemp.push(temp);
                }
            }
        }
        let ret =DdzManager.combination(pokers,1);

        for (var i = 0; i < poktemp.length; i++) {
            let listArr = poktemp[i];

            let aarr = [];
            for(var k = 0;k < listArr.length; k++)
            {
                let tmp = listArr[k];
                let n = 0;
                for(var j = 0;j < ret.length;j++)
                {
                    let temps = ret[j];

                    if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                    {
                        n++;
                        aarr.push(temps[0]);
                        if (n >= tmp[1]) {break;}
                    }
                }
            }

            pokArr.push(aarr)
        }

        return pokArr;
    },
    // 格式化数组 返回单元length 长度的数组列表
    createArray:function (array,length) {
        let list = [];
        for (var i = 0; i < array.length; i++) {
            let temp = array[i];
            let tts = [];
            let isMax = true;
            for (var k = 0; k < length; k++) {
                let tmp = array[i+k]
                if (!tmp) {
                    isMax = false;
                    break;
                }
                tts.push(tmp)
            }
            if (isMax) {list.push(tts);}
        }

        return list
    },
    judgeFeijiDaiErDui:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length%5!=0||pokers.length<10)
        {
            return false;
        }

        let tempFJ=this.getFeiJiDaiErDui(pokers,length,num);

        if(tempFJ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeSiDaiEr:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length !=  6)
        {
            return false;
        }

        let tempDZ=this.getSiDaiEr(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeSiDaiYiDui:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length !=  6|| pokers.length < 6)
        {
            return false;
        }

        let tempDZ=this.getSiDaiDui(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeSiDaiErDui:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length != 8 || pokers.length < 8)
        {
            return false;
        }

        let tempDZ=this.getSiDaiErDui(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeWangZha:function(pokers)
    {
        if(pokers.length!=2)
        {
            return false;
        }

        let tempDZ=this.getWangZha(pokers);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    getSiDaiEr:function(pokers,length,num) {
        if(pokers.length < 6 || length != 6) {
            return false;
        }

        var tempArr=this.createDictionary(pokers,true); // 字典 需要检查的牌组

        var tempnumSan=this.createSHUNSanlianCardNumArr(tempArr,num,4);  // 获取三连数组

        if (tempnumSan.length <=0 ) {return [];}  // 没有三连 返回空数组

        var tempnumArr = [];    //翅膀数组

        // 获取压过当前桌牌的三连 且A 不能加入计算
        var listSan = [];
        for (var i = 0; i < tempnumSan.length; i++) {
            if (tempnumSan[i][0] > num ) {
                listSan.push(tempnumSan[i])
            }
        }

        // 没有三连压过num 返回空数组
        if (listSan.length <=0 ) {return [];}


        let listDan = this.getSanDaierArr(pokers,1);

        if (listDan.length < 2) {return [];}

        var pokArr = [];
        var poktemp = [];


        for (var i = 0; i < listSan.length; i++) {
            let san = listSan[i];

            if (listDan.length > 0) {
                for (var k = 0; k < listDan.length - 1; k++) {
                    let temp = [];
                    let azpai1 = listDan[k];
                    let azpai2 = listDan[k+1];
                    if (azpai1[0] == 16 && azpai2[0] == 17) {
                        continue;
                    }
                    temp.push(san);
                    temp.push(azpai1);
                    temp.push(azpai2);
                    poktemp.push(temp);
                }
            }
        }

        let ret =DdzManager.combination(pokers,1);

        for (var i = 0; i < poktemp.length; i++) {
            let listArr = poktemp[i];

            let aarr = [];
            for(var k = 0;k < listArr.length; k++)
            {
                let tmp = listArr[k];
                let n = 0;
                for(var j = 0;j < ret.length;j++)
                {
                    let temps = ret[j];

                    if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                    {
                        n++;
                        aarr.push(temps[0]);
                        if (n >= tmp[1]) {break;}
                    }
                }
            }

            pokArr.push(aarr)
        }

        return pokArr;
    },
    //333344
    getSiDaiDui:function(pokers,length,num) {
        var numArr = [];
        var tempArr = [];
        var Arr = [];
        var pokArr = [];

        tempArr = this.createDictionary(pokers);
        var tempArr1 = this.createDictionary(pokers);
        var sanzhangnumArr = this.createDaiCardNumArr(tempArr1, num, 4, false);
        numArr = this.getsandaiyiArr(tempArr, sanzhangnumArr, 2);
        var ret = DdzManager.combination(pokers, 1);
        for (var i = 0; i < numArr.length; i++) {
            var tem = numArr[i];
            var temp1 = [];
            for (var z = 0; z < tem.length; z++) {
                var n = 0;
                var tmp = tem[z];
                for (var j = 0; j < ret.length; j++) {
                    var temp = ret[j];
                    if (tmp[0] == this.getPokerNumByPoker(temp[0])) {
                        temp1.push(temp[0]);
                        n++;
                        if (n == tmp[1]) {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },
    getSiDaiErDui:function(pokers,length,num) {
        if(pokers.length<length||pokers.length<8)
        {
            return [];
        }

        let pokArr=[];

        // let tempArr=this.createDicSHUN(pokers);//字典

        let tempArr=this.createDictionary(pokers,true);//字典

        let tempnumArr = [];  // 三张数组
        let siZhangArr = [];
        var hasDui = 0;


        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] != 14 && ttemp[0] > num && ttemp[1] == 4 ) {
                tempnumArr.push(ttemp)
            }
            // if (ttemp[1] == 4) {
            //     siZhangArr.push(ttemp)
            //     hasDui+=2;
            // }
        }

        let poktemp = [];
        if (tempnumArr.length < 1) {return [];}   //4张数组不超过2 直接返回
        if (tempnumArr.length == 2) {
            poktemp.push(tempnumArr);
        } else {
            let numArr=tempnumArr;

            if (length == 0) {
                numArr = this.getNumArrNull(tempnumArr,4);
            }

            if (numArr.length <= 0 ) {return []}


            let listDui = [];
            listDui = this.getSanDaierArr(pokers,2); // 对子

            if (listDui.length < 2) {return [];}

            listDui = this.createArray(listDui,2)



            let ll = numArr[0].length


            for (var i = 0; i < numArr.length; i++) {
                let san = numArr[i];


                if (listDui.length > 0) {
                    for (var n = 0; n < listDui.length; n++) {
                        let temp = [];
                        for (var k = 0; k < san.length; k++) {
                            temp.push(san[k])
                        }
                        temp.push.apply(temp,siZhangArr);
                        let dui = listDui[n];
                        for (var j = 0; j < dui.length; j++) {
                            temp.push(dui[j])
                        }

                        poktemp.push(temp);
                    }
                }
            }
        }



        let ret =DdzManager.combination(pokers,1);

        for (var i = 0; i < poktemp.length; i++) {
            let listArr = poktemp[i];

            let aarr = [];
            for(var k = 0;k < listArr.length; k++)
            {
                let tmp = listArr[k];
                let n = 0;
                for(var j = 0;j < ret.length;j++)
                {
                    let temps = ret[j];

                    if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                    {
                        n++;
                        aarr.push(temps[0]);
                        if (n >= tmp[1]) {break;}
                    }
                }
            }

            pokArr.push(aarr)
        }

        return pokArr;
    },
    //飞机
    getFeiJiDaiErDui:function(pokers,length,num){
        if(pokers.length<length||pokers.length<10 || length%5 != 0)
        {
            return [];
        }

        let pokArr=[];
        let leftArr = [];//除去三张数组之后的牌
        let tempArr=this.createDictionary(pokers,true);//字典
        let havePoker = [];//有牌的数组
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[1] >= 2) {
                havePoker.push(ttemp);
            }
        }
        this.sortotherPoker(havePoker)
        let tempnumArr = [];  // 三张数组
        let poktemp = [];
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] != 15 && ttemp[0] > num && ttemp[1] >= 3) {
                tempnumArr.push(ttemp);
            }
        }
        if (tempnumArr.length < 2 ||tempnumArr.length>length/5) {return [];}   //三张数组不超过2 直接返回

        let numArr=this.getNumArr(tempnumArr,length/5);
        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }
        if (numArr.length <= 0 ) {return []}
        for (var i = 0; i < numArr.length; i++) {
            let san = numArr[i];
            poktemp.push(san);
        }
        for (var i = 0; i < havePoker.length; i++) {
            let haveTemp = havePoker[i];
            if (haveTemp[1]==2){
                for (var j = 0; j < numArr.length; j++) {
                    if(this.pokerAllNum(poktemp[j])<length){
                       poktemp[j].push(haveTemp);
                    }
                }
            }else if(haveTemp[1]==3){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                    for (var j = 0; j < numArr.length; j++) {
                        if(this.pokerAllNum(poktemp[j])<length){
                           poktemp[j].push(haveTemp);
                        }
                    }
                    
                }
            }else if(haveTemp[1]==4){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                    for (var j = 0; j < numArr.length; j++) {
                        if(this.pokerAllNum(poktemp[j])<length){
                           poktemp[j].push(haveTemp);
                        }
                    }
                }
                
            }
        }
        let ret =DdzManager.combination(pokers,1);
        // for (var m = 0; m < poktemp.length; m++) {
            for (var i = 0; i < poktemp.length; i++) {
                let listArr = poktemp[i];
                listArr = this.deleteArr(listArr,length)
                let aarr = [];
                for(var k = 0;k < listArr.length; k++)
                {
                    let tmp = listArr[k];
                    let n = 0;
                    for(var j = 0;j < ret.length;j++)
                    {
                        let temps = ret[j];

                        if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                        {
                            n++;
                            aarr.push(temps[0]);
                            if (n >= tmp[1]) {break;}
                        }
                    }
                }

                pokArr.push(aarr)
            }
        // }
        let pokerEndarr = []
        for (var i = 0; i < pokArr.length; i++) {
           if (pokArr[i].length == length){
                pokerEndarr.push(pokArr[i])
                return pokerEndarr;
            }
        }
        return [];
        
    },
    getFeiJiDaiErDui1:function(pokers,length,num){
        if(pokers.length<length||pokers.length<8 || length%4 != 0)
        {
            return [];
        }

        let pokArr=[];
        let leftArr = [];//除去三张数组之后的牌
        let tempArr=this.createDictionary(pokers,true);//字典
        let havePoker = [];//有牌的数组
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[1] >= 2) {
                havePoker.push(ttemp);
            }
        }
        let tempnumArr = [];  // 三张数组
        let poktemp = [];
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] != 15 && ttemp[0] > num && ttemp[1] >= 3) {
                tempnumArr.push(ttemp);
            }
        }
        if (tempnumArr.length < 2) {return [];}   //三张数组不超过2 直接返回

        let numArr=this.getNumArr(tempnumArr,length/4);
        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }
        if (numArr.length <= 0 ) {return []}
        for (var i = 0; i < numArr.length; i++) {
            let san = numArr[i];
            poktemp.push(san);
        }
        for (var i = 0; i < havePoker.length; i++) {
            let haveTemp = havePoker[i];
            if (haveTemp[1]==2){
                for (var j = 0; j < numArr.length; j++) {
                    if(this.pokerAllNum(poktemp[j])<length){
                       poktemp[j].push(haveTemp);
                    }
                }
            }else if(haveTemp[1]==3){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                    let a = []
                    a[0] = haveTemp[0]
                    a[1] = 2
                    if(this.pokerAllNum(poktemp[j])<length){
                       poktemp[j].push(a);
                    }
                    
                }
            }else if(haveTemp[1]==4){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                   for (var j = 0; j < numArr.length; j++) {
                        let san = numArr[j];
                        if(haveTemp[0]==san[0]){
                            let a = []
                            a[0] = haveTemp[0]
                            a[1] = 1

                            if(this.pokerAllNum(poktemp[j])<length){
                               poktemp[j].push(a); 
                            }
                            
                        }
                    } 
                    
                }
                
            }
        }
        let ret =DdzManager.combination(pokers,1);
        // for (var m = 0; m < poktemp.length; m++) {
            for (var i = 0; i < poktemp.length; i++) {
                let listArr = poktemp[i];

                let aarr = [];
                for(var k = 0;k < listArr.length; k++)
                {
                    let tmp = listArr[k];
                    let n = 0;
                    for(var j = 0;j < ret.length;j++)
                    {
                        let temps = ret[j];

                        if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                        {
                            n++;
                            aarr.push(temps[0]);
                            if (n >= tmp[1]) {break;}
                        }
                    }
                }

                pokArr.push(aarr)
            }
        // }
        
        cc.log(pokArr)
        return pokArr;
    },
    IsInTable:function(arr,b){
        for (var i = 0; i < arr.length; i++) {
            let temp = arr[i]
            for (var j = 0; j < temp.length; j++) {
                let temp1 = temp[j]
                if (temp1[0] == b ){
                    return true
                }
            }
            
            return false
        }
    },
    pokerAllNum:function(arr){
        let count = 0
        for (var i = 0; i < arr.length; i++) {
            let temp = arr[i]
            count = count + Number(temp[1])
        }
        return count
    },
    deleteArr:function(arr,lengthNum){
        let nowNum = this.pokerAllNum(arr)
        let count = 0
        for (var i = 0; i < arr.length-1; i++) {
            let temp = arr[i]
            count = count + Number(temp[1])
        }
        for (var i = 0; i < arr.length; i++) {
            if (nowNum > lengthNum){
                arr[arr.length-1][1] = lengthNum - count
            }
        }
        return arr
    },
    sortotherPoker:function(arr)
    {
        arr.sort(function(a,b){
            return a[1]-b[1];
        });
    },
    getFeijiDaiEr:function(pokers,length,num){
        if(pokers.length<length||pokers.length<8 || length%4 != 0)
        {
            return [];
        }

        let pokArr=[];
        let leftArr = [];//除去三张数组之后的牌
        let tempArr=this.createDictionary(pokers,true);//字典
        let havePoker = [];//有牌的数组
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[1] >= 1) {
                havePoker.push(ttemp);
            }
        }
        this.sortotherPoker(havePoker)
        let tempnumArr = [];  // 三张数组
        let poktemp = [];
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] != 15 && ttemp[0] > num && ttemp[1] >= 3) {
                tempnumArr.push(ttemp);
            }
        }
        if (tempnumArr.length < 2 ) {return [];}   //三张数组不超过2 直接返回
        // for (var i = 0; i < tempnumArr.length; i++) {
        //     let temp = tempnumArr[i];
        //     if (temp[1]==4){
        //         temp[1] = 3
        //     }
        // }
        let numArr=this.getNumArr(tempnumArr,length/4);
        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }
        if (numArr.length <= 0 ) {return []}
        for (var i = 0; i < numArr.length; i++) {
            let san = numArr[i];
            poktemp.push(san);
        }
        for (var i = 0; i < havePoker.length; i++) {
            let haveTemp = havePoker[i];
            if (haveTemp[1]<3){
                for (var j = 0; j < numArr.length; j++) {
                    if(this.pokerAllNum(poktemp[j])<length){
                       poktemp[j].push(haveTemp);
                    }
                }
            }else if(haveTemp[1]==3){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                    for (var j = 0; j < numArr.length; j++) {
                        if(this.pokerAllNum(poktemp[j])<length){
                           poktemp[j].push(haveTemp);
                        }
                    }
                    
                }
            }else if(haveTemp[1]==4){
                if(this.IsInTable(numArr,haveTemp[0]) == false){
                    for (var j = 0; j < numArr.length; j++) {
                        if(this.pokerAllNum(poktemp[j])<length){
                           poktemp[j].push(haveTemp);
                        }
                    }
                }else{
                    for (var j = 0; j < numArr.length; j++) {
                        let san = numArr[j];
                        if(haveTemp[0]==san[0]){
                            let a = []
                            a[0] = haveTemp[0]
                            a[1] = 1

                            if(this.pokerAllNum(poktemp[j])<length){
                               poktemp[j].push(a); 
                            }
                            
                        }
                    } 
                }
                
            }
        }
        let ret =DdzManager.combination(pokers,1);
        // for (var m = 0; m < poktemp.length; m++) {
            for (var i = 0; i < poktemp.length; i++) {
                let listArr = poktemp[i];
                listArr = this.deleteArr(listArr,length)
                let aarr = [];
                for(var k = 0;k < listArr.length; k++)
                {
                    let tmp = listArr[k];
                    let n = 0;
                    for(var j = 0;j < ret.length;j++)
                    {
                        let temps = ret[j];

                        if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                        {
                            n++;
                            aarr.push(temps[0]);
                            if (n >= tmp[1]) {break;}
                        }
                    }
                }

                pokArr.push(aarr)
            }
        // }
        let pokerEndarr = []
        for (var i = 0; i < pokArr.length; i++) {
           if (pokArr[i].length == length){
                pokerEndarr.push(pokArr[i])
                return pokerEndarr;
            }
        }
        return [];
        
    },
    getFeijiDaiEr1:function(pokers,length,num)
    {
        if(pokers.length<length||pokers.length<8 || length%4 != 0)
        {
            return [];
        }

        let pokArr=[];

        // let tempArr=this.createDicSHUN(pokers);//字典

        let tempArr=this.createDictionary(pokers,true);//字典

        let tempnumArr = [];  // 三张数组
        let danArr = [];
        var hasDan = 0;
        let mayArr = [];
        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[1] >= 0) {
                mayArr.push(ttemp);
            }

                if (ttemp[0] != 15 && ttemp[0] > num && ttemp[1] >= 3) {
                    tempnumArr.push(ttemp);
                    if (pokers.length == length) {
                        if (ttemp[1] == 4) {
                            hasDan++;
                        }
                    }

                }
            if (pokers.length == length) {
                if (ttemp[0] == 15 && (ttemp[1] == 3 || ttemp[1] == 4)) {
                    danArr = ttemp;
                    hasDan+=ttemp[1];
                    if (ttemp[1] >= 3) {

                    }
                }
            }

        }

        if (tempnumArr.length < 2) {return [];}   //三张数组不超过2 直接返回

        let numArr=this.getNumArr(tempnumArr,length/4);


        if (numArr.length <= 0 ) {return []}

        if (pokers.length == length) {
            hasDan += (tempnumArr.length - length/4)*3;
        }



        // for (var i = 0; i < numArr[0].length; i++) {
        //     let ttemp = numArr[0][i];
        //     if (ttemp[1] == 4) {
        //         hasDan++;
        //     }
        // }


        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }



        let poktemp = [];
        let listDui = [];

        if (hasDan == length/4) {
            poktemp.push(mayArr);
        } else {
            let listDui1 = this.getSanDaierArr(pokers,1);

            let listDui2 = [];
            listDui2 = this.getSanDaierArr(pokers,2); //获取几张一样的单牌

            if (listDui1.length >= (length/4-hasDan)) {
                listDui1 = this.createArray(listDui1,length/4-hasDan);
                listDui.push.apply(listDui,listDui1);
            } else if (listDui2.length * 2 == (length/4-hasDan)) {
                listDui2 = this.createArray(listDui2,listDui2.length);
                listDui.push.apply(listDui,listDui2);

            } else if (listDui1.length+listDui2.length*2  == (length/4-hasDan)){
                listDui1 = this.createArray(listDui1,listDui1.length);
                listDui2 = this.createArray(listDui2,listDui2.length);
                listDui.push.apply(listDui,listDui1);
                listDui.push.apply(listDui,listDui2);
            }else if (listDui2.length * 2 > (length/4-hasDan)) {
                listDui = [];
                for (var i = 0; i < numArr.length; i++) {
                    let san = numArr[i];
                    poktemp.push(san);
                    // let temp = [];
                    // for (var k = 0; k < san.length; k++) {
                    //     temp.push(san[k])
                    // }
                    // poktemp.push(temp);

                }

            } else if (listDui1.length+listDui2.length*2  > (length/4-hasDan)){
                listDui = [];
                for (var i = 0; i < numArr.length; i++) {
                    let san = numArr[i];
                    poktemp.push(san);
                    // let temp = [];
                    // for (var k = 0; k < san.length; k++) {
                    //     temp.push(san[k])
                    // }
                    // poktemp.push(temp);

                }
            } else {
                listDui = [];
                for (var i = 0; i < numArr.length; i++) {
                    let san = numArr[i];
                    poktemp.push(san);
                    // let temp = [];
                    // for (var k = 0; k < san.length; k++) {
                    //     temp.push(san[k])
                    // }
                    // poktemp.push(temp);

                }
            }

            // if (listDui.length < 1) {return [];}



            // let ll = numArr[0].length


            for (var i = 0; i < numArr.length; i++) {
                let san = numArr[i];

                if (listDui.length > 0) {
                    for (var n = 0; n < listDui.length; n++) {
                        let temp = [];
                        for (var k = 0; k < san.length; k++) {
                            temp.push(san[k])
                        }
                        let dui = listDui[n];
                        for (var j = 0; j < dui.length; j++) {
                            temp.push(dui[j])
                        }

                        poktemp.push(temp);
                    }
                }
            }
        }


        let ret =DdzManager.combination(pokers,1);

        for (var i = 0; i < poktemp.length; i++) {
            let listArr = poktemp[i];

            let aarr = [];
            for(var k = 0;k < listArr.length; k++)
            {
                let tmp = listArr[k];
                let n = 0;
                for(var j = 0;j < ret.length;j++)
                {
                    let temps = ret[j];

                    if(tmp[0] == this.getPokerNumByPoker(temps[0]))
                    {
                        n++;
                        aarr.push(temps[0]);
                        if (n >= tmp[1]) {break;}
                    }
                }
            }

            pokArr.push(aarr)
        }
        // if (pokArr[0].length == pokers.length){
            return pokArr;
        // }else {
        //     return []
        // }


    },

    // 获取三带二的翅膀  length == 1 杂牌 length ==2 对子
    getSanDaierArr:function (pokers,length) {
        if(pokers.length < length)
        {
            return false;
        }
        var tempnumArr = []

        // var tempArr=this.createDicSHUN(pokers);
        var tempArr=this.createDictionary(pokers,true);

        var  chibang = [];

        for (var i = 0; i < tempArr.length; i++) {
            if (tempArr[i][1] == length) {
                chibang.push(tempArr[i])
            }
        }

        if (length == 1 && chibang.length < 1) {return [];}

        return chibang;
    },
    getFeiJi:function(pokers,length,num)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<6)
        {
            return pokArr;
        }
        tempArr=this.createDicSHUN(pokers);
        let tempnumArr=this.createSHUNCardNumArr(tempArr,num,3);
        numArr=this.getNumArr(tempnumArr,length/3);
        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let tmp=numArr[i];
            let temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                let n = 0;
                let tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    let temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==3)
                        {
                            break;
                        }
                    }
                }
            }

            pokArr.push(temp1);
        }

        return pokArr;

    },
    getSanLianArr:function(FeijiArr,LianduiArr){
        var Arr = [];
        if(FeijiArr.length!=0&&LianduiArr.length!=0){
            for(var i=0;i<FeijiArr.length;i++)
            {
                for(var j = 0;j<FeijiArr.length;j++)
                {
                    Arr[i*LianduiArr.length+j].push(FeijiArr[i]);
                    Arr[i*LianduiArr.length+j].push(LianduiArr[j]);
                }
            }
        }
        return Arr;
    },
    getSanLianEr: function (pokers,length,num) {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<10)
        {
            return pokArr;
        }

        tempArr=this.createDicSHUN(pokers);
        var tempArr1=this.createDicSHUN(pokers);
        var tempnumArr=this.createSHUNSanlianCardNumArr(tempArr,num,3);
        var feijinumArr=this.getNumArr(tempnumArr,length/5);


        //var tempnumArr1=this.createSanLianErArr(tempArr,feijinumArr);
        var tempnumArr1=this.deletFJDAIArr(tempArr1,feijinumArr);

        var tempnumArr2=this.createSHUNSanlianCardNumArr(tempnumArr1,2,2);
        var lianduinumArr=this.getNumArr(tempnumArr2,length/5);

        numArr = this.combinationFJArr(feijinumArr,lianduinumArr);

        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let tmp=numArr[i];
            let temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                let n = 0;
                let tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    let temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==tep[1])
                        {
                            break;
                        }
                    }
                }
            }

            pokArr.push(temp1);
        }

        return pokArr;
    },
    judgeSanLianEr:function(pokers,length,num){
        // cc.log('飞机',length,num)
        if(pokers.length!=length||pokers.length%5!=0||pokers.length<10)
        {
            return false;
        }
        let tempSLE=this.getSanLianEr(pokers,length,num);
        if(tempSLE.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    // 3332
    getSanDaiYi:function(pokers,length,num){
        var numArr = [];
        var tempArr = [];
        var Arr = [];
        var pokArr=[];

        tempArr=this.createDictionary(pokers,true);
        var tempArr1=this.createDictionary(pokers,true);
        var sanzhangnumArr=this.createDaiCardNumArr(tempArr1,num,3,false);
        numArr=this.getsandaiyiArr(tempArr,sanzhangnumArr,1);
        var ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            var tem = numArr[i];
            var temp1 = [];
            for(var z = 0;z<tem.length;z++)
            {
                var n = 0;
                var tmp = tem[z];
                for(var j = 0;j < ret.length;j++)
                {
                    var temp = ret[j];
                    if(tmp[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==tmp[1])
                        {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },
    createDaiCardNumArr:function(tempArr,num,n,isPull)
    {
        var numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            var temp1 = tempArr[i];
            if(temp1[1]==n)
            {
                numArr.push(temp1);
            }
        }
        if(!isPull){
            for(var i=num-2;i<tempArr.length;i++)
            {
                var temp2 = tempArr[i];
                if(temp2[1]>n&&temp2[1]<=4)
                {
                    temp2[1]=n;
                    numArr.push(temp2);
                }
            }
        }

        return numArr;
    },
    // createDaiCardNumArr:function(tempArr,num,n,isPull)
    // {
    //     var numArr = [];
    //     for(var i=num-2;i<tempArr.length;i++)
    //     {
    //         var temp1 = tempArr[i];
    //         if(temp1[1]==n)
    //         {
    //             numArr.push(temp1);
    //         }
    //     }
    //     if(!isPull){
    //         for(var i=num-2;i<tempArr.length;i++)
    //         {
    //             var temp2 = tempArr[i];
    //             if(temp2[1]>n&&temp2[1]<=4)
    //             {
    //                 temp2[1]=n;
    //                 numArr.push(temp2);
    //             }
    //         }
    //     }
    //
    //     return numArr;
    // },
    getSidaiErduiArr:function(handArr,Arr,NUM){

        var Array = [];
        for(var i = 0;i<Arr.length;i++){
            /// var temp = this.deleteSanDAIArr(handArr,Arr[i]);
            let listDui = this.getSanDaierArr(handArr,2); // 对子

            if (listDui.length < 2) {return [];}

            var Arr1 = this.createArray(listDui,2)
            var temp1 = Arr[i];
            // var Arr1 = this.createDaiCardNumArr(handArr,2,NUM,true);
            if(Arr1.length!=0){
                for(var j = 0;j<Arr1.length;j++)
                {
                    var tempArr = [];
                    var temp = Arr1[j];
                    if(temp[0]!=temp1[0]){
                        tempArr.push(Arr1[j]);
                        tempArr.push(Arr[i]);
                        Array.push(tempArr);
                    }
                }
            }
        }

        return Array;
    },
    getsandaiyiArr:function(handArr,Arr,NUM){

        var Array = [];
        for(var i = 0;i<Arr.length;i++){
            /// var temp = this.deleteSanDAIArr(handArr,Arr[i]);
            var temp1 = Arr[i];
            var Arr1 = this.createDaiCardNumArr(handArr,2,NUM,true);
            if(Arr1.length!=0){
                for(var j = 0;j<Arr1.length;j++)
                {
                    var tempArr = [];
                    var temp = Arr1[j];
                    if(temp[0]!=temp1[0]){
                        tempArr.push(Arr1[j]);
                        tempArr.push(Arr[i]);
                        Array.push(tempArr);
                    }
                }
            }
        }

        return Array;
    },

    createDaiCardNumArr:function(tempArr,num,n,isPull)
    {
        var numArr = [];
        for(var i=num-2;i<tempArr.length;i++)
        {
            var temp1 = tempArr[i];
            if(temp1[1]==n)
            {
                numArr.push(temp1);
            }
        }
        if(!isPull){
            for(var i=num-2;i<tempArr.length;i++)
            {
                var temp2 = tempArr[i];
                if(temp2[1]>n&&temp2[1]<=4)
                {
                    temp2[1]=n;
                    numArr.push(temp2);
                }
            }
        }

        return numArr;
    },
    judgeSanDaiYi:function(pokers,length,num){
        if(pokers.length!=4)
        {
            return false;
        }
        var tempSDY=this.getSanDaiYi(pokers,length,num);
        if(tempSDY.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    judgeSanDaiYiDui:function(pokers,length,num){
        if(pokers.length!=length || (length != 5 && length != 0))
        {
            return false;
        }

        let tempSLE=this.getSanDaiYidui(pokers,length,num);

        if(tempSLE.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    //三带对 33322
    getSanDaiYidui:function (pokers,length,num) {
        var numArr = [];
        var tempArr = [];
        var Arr = [];
        var pokArr=[];

        tempArr=this.createDictionary(pokers);
        var tempArr1=this.createDictionary(pokers);
        var sanzhangnumArr=this.createDaiCardNumArr(tempArr1,num,3,false);
        numArr=this.getsandaiyiArr(tempArr,sanzhangnumArr,2);
        var ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            var tem = numArr[i];
            var temp1 = [];
            for(var z = 0;z<tem.length;z++)
            {
                var n = 0;
                var tmp = tem[z];
                for(var j = 0;j < ret.length;j++)
                {
                    var temp = ret[j];
                    if(tmp[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==tmp[1])
                        {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },


    getNumArrNull:function(arr,length)
    {
        let numArr = [];
        let temp = arr.sort(function (a,b) {
            return a[0] > b[0];
        })

        let tempnumArr = []
        let tempCardNum = 0;
        for(var i = 0;i < temp.length;i++)
        {
            let tt = temp[i]
            if (i == 0) {
                tempnumArr.push(tt);
            }else{
                if (tempCardNum + 1 != tt[0]) {
                    break;
                }
                tempnumArr.push(tt);
            }
            tempCardNum = tt[0];
        }
        if (tempnumArr.length >= 2) {
            numArr.push(tempnumArr);
        }

        return numArr;
    },
    //判断是否是飞机
    judgeFeiji:function(pokers,length,num)
    {

        if(pokers.length!=length||pokers.length%3!=0||pokers.length<6||this.judgeZapai(pokers,pokers.length/3))
        {
            return false;
        }
        let tempFJ=this.getFeiJi(pokers,length,num);
        if(tempFJ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    RCMD_MatchOver:function(data){
        cc.log('RCMD_MatchOver',data);
        if(data.count == 0){
            let self = this;
            showAlertBox('房主解散了房间',function () {
                self.backLobby();
            });
        }else{
            for(let i = 0;i<data.users.length;i++) {
                data.users[i].userImage = GamePlayer.getPlayer(data.users[i].userid).userImage;
                data.users[i].nick = GamePlayer.getPlayer(data.users[i].userid).nick;
            }
            this.node.emit('RCMD_MatchOver',data);
        }
    },
    onExit: function () {
        if (this.roomType > 10 || !PomeloClient.isConnected) {  // 复盘
            this.backLobby();
            return;
        }

        if (this.isPlaying) {
            showAlert("正在游戏中无法退出");
            return
        }

        let self = this;

        if (self.roomType == 2 ) {
            var tips = UserCenter.getUserID() == self.createRoomID ? "退出后房间将保留，是否退出房间？" : "是否直接退出？";
            showAlertBox(tips, function () {
                if (UserCenter.getUserID() != self.createRoomID) {
                    self.node.emit('CMD_forceGameOver');
                }
                self.removePomeloListeners();
                self.backLobby();
            });
            return;
        }else  if(self.roomType < 2 ){
            self.CMD_Exit();
            // self.nextAction();
        }
    },

    CMD_Exit:function()
    {
        var route = this.game.server + '.CMD_Exit';
        PomeloClient.request(route);
    },

    exitGame : function (cb) {
        let route = this.game.server + '.CMD_Exit';
        PomeloClient.request(route,cb);
    },
    controllNum:function(arr)
    {
        let numArr=[];
        let Array1=arr[0];
        let Array2=arr[1];
        let Array3=arr[2];
        for(var i=0;i<Array1.length;i++)
        {
            let temp1=Array1[i];
            for(var j=0;j<Array2.length;j++)
            {
                let temp2=Array2[j];
                for(var k=0;k<Array3.length;k++)
                {
                    let temp=[];
                    let temp3=Array3[k];
                    temp.push(temp1);
                    temp.push(temp2);
                    temp.push(temp3);
                    numArr.push(temp);
                }
            }
        }
        return numArr;
    },
    judgeZapai:function(pokers,X)
    {
        let tempArr=[];
        let n=0;
        tempArr=this.createDicSHUN(pokers);
        for(var i=0;i<tempArr.length;i++)
        {
            let temp=tempArr[i];
            if(temp[1]>0)
            {
                n++;
            }
        }
        if(n>X)
        {
            return true;
        }
        else
            return false;
    },
    getPokerIndes:function(pokers,poker1)
    {
        var NUM;
        var Index = this.getPokerIndexByPoker(poker1);
        var Num = this.getPokerNumByPoker(poker1);
        for(var i =0;i<pokers.length;i++)
        {
            var tempindex = this.getPokerIndexByPoker(pokers[i]);
            if(tempindex==Index)
            {
                NUM=i;
                break;
            }
        }
        if(NUM==0)
        {
            return true;
        }else
        {
            for(var j =0;j<NUM;j++)
            {
                if(Num==this.getPokerNumByPoker(pokers[j]))
                {
                    return false;
                }
            }
            return true;
        }

    },
    getHit:function(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        for(var Max = MaxNum;Max >=MinNum+controllNUM;Max--)
        {
            var length = Max-MinNum+1;
            tempArr=this.createHitDicSHUN(pokers,MinNum,Max,getnums);
            numArr=this.getNumArr(tempArr,length);

            let ret =DdzManager.combination(pokers,1);
            for(var i = 0;i<numArr.length;i++)
            {
                let tmp=numArr[i];
                let temp1 = [];

                for(var t =0 ;t<tmp.length;t++)
                {
                    let n = 0;
                    let tep = tmp[t];
                    if(tep[0]==this.getPokerNumByPoker(Array[0])||tep[0]==this.getPokerNumByPoker(Array[1]))
                    {
                        n=1;
                    }
                    for(var j = 0;j < ret.length;j++)
                    {
                        let temp = ret[j];

                        if(tep[0]==this.getPokerNumByPoker(temp[0]))
                        {
                            if(n==getnums)
                            {
                                break;
                            }
                            if(this.isPushPoker(temp[0],Array))
                            {
                                temp1.push(temp[0]);
                                n++;
                            }

                        }
                    }
                }
                pokArr.push(temp1);
            }
            if(pokArr.length!=0)
            {
                break;
            }
        }
        return pokArr;
    },
    isPushPoker:function(temp,Array){
        for(var i=0;i<Array.length;i++){
            if(this.getPokerIndexByPoker(temp)==this.getPokerIndexByPoker(Array[i])){
                return false;
            }
        }
        return true;
    },
    hitGetShunZi:function(pokers,Array,type,length)
    {

        let pokArr=[];
        var MaxNum = 0;
        var MinNum = 0;
        var getType = 0;
        var controllNUM=4;
        var getnums = 1;
        var ischange;
        if(pokers.length<5)
        {
            return pokArr;
        }
        if(this.getPokerNumByPoker(Array[1])>=this.getPokerNumByPoker(Array[0]))
        {
            MaxNum = this.getPokerNumByPoker(Array[1]);
            if(MaxNum>14){MaxNum=13;}
            MinNum = this.getPokerNumByPoker(Array[0]);

            ischange=this.getPokerIndes(pokers,Array[1]);
        }
        else
        {
            MaxNum = this.getPokerNumByPoker(Array[0]);
            if(MaxNum>14){MaxNum=13;}
            MinNum = this.getPokerNumByPoker(Array[1]);
            ischange=this.getPokerIndes(pokers,Array[0]);
        }

        if(type == 0)
        {
            if(MaxNum == MinNum)
            {
                return pokArr;
            }
            if(MaxNum-MinNum>1)
            {
                controllNUM = MaxNum-MinNum;
                var feiji = this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,3,2,type);
                if(feiji.length!=0)
                {
                    return feiji;
                }
            }
            if((MaxNum-MinNum)>3&&!ischange)//////
            {
                MaxNum=MaxNum;
            }
            else if((MaxNum-MinNum)>1&&ischange)
            {
                getType=1;
                controllNUM = MaxNum-MinNum;/////
                getnums =2;
                var temp = this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type);
                if(temp.length != 0)
                {
                    return this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type);
                }
                else{
                    if((MaxNum-MinNum)>3)
                    {
                        MaxNum=MinNum+4;
                        getType=0;
                        controllNUM = 4;
                        getnums =1;
                        var temp = this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type);
                        if(temp.length != 0)
                        {
                            return this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type);
                        }
                        else
                        {
                            getType=0;
                            controllNUM = 4;
                            getnums =1;
                            MaxNum = MinNum+4;
                        }
                    }
                    else
                    {
                        if(MinNum+4<15){
                            MaxNum = MinNum+4;
                        }
                        getType=0;
                        controllNUM = 4;
                        getnums =1;
                    }
                }

            }
            else
            {
                if(MinNum+4<15){
                    MaxNum = MinNum+4;
                }
            }

        }
        if(type == 2)
        {

            controllNUM = length-1;
            MaxNum = MinNum+controllNUM;
            if(MaxNum>14){
                return pokArr;
            }
        }
        if(type == 4)
        {
            if(MaxNum-MinNum>1)
            {
                MaxNum=MaxNum;
            }
            else
            {
                MaxNum = length/2+MinNum-1;
            }
            getnums = 2;
            controllNUM =2;
            if(MaxNum>14){
                return pokArr;
            }
        }
        if(type == 6){
            if(MaxNum-MinNum>1)
            {
                MaxNum=MaxNum;
            }
            else
            {
                MaxNum = length/3+MinNum-1;
            }
            if(MaxNum>14){
                return pokArr;
            }
            getnums = 3;
            controllNUM =2;
        }

        return this.getHit(pokers,Array,MaxNum,MinNum,controllNUM,getnums,getType,type);
        ///
    },

    //顺子
    getShunZi:function(pokers,length,num)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<5||(num+length)==15)
        {
            return pokArr;
        }

        tempArr=this.createDicSHUN(pokers);
        let tempnumArr=this.createSHUNCardNumArr(tempArr,num,1);
        numArr=this.getNumArr(tempnumArr,length);



        let ret =DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let tmp=numArr[i];
            let temp1 = [];

            for(var t =0 ;t<tmp.length;t++)
            {
                let n = 0;
                let tep = tmp[t];
                for(var j = 0;j < ret.length;j++)
                {
                    let temp = ret[j];

                    if(tep[0]==this.getPokerNumByPoker(temp[0]))
                    {
                        temp1.push(temp[0]);
                        n++;
                        if(n==1)
                        {
                            break;
                        }
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },
    //判断是否顺子
    judgeShunzi:function(handpokers,pokers,length,num)
    {
        if(pokers.length<5 || pokers.length != length)
        {
            return false;
        }
        var pokerArr = this.createDictionary(pokers,false);
        let tempDZ=this.getShunZi(handpokers,length,num);
        for(var i = 0;i<tempDZ.length;i++){
            var temp = tempDZ[i];
            var n=0;
            var handArr = this.createDictionary(temp,false);
            if(handArr.length==pokerArr.length){
                for(var j = 0;j<handArr.length;j++){
                    var Arr1=pokerArr[j];
                    var Arr2 = handArr[j];
                    if(Arr1[0]==Arr2[0]&&Arr1[1]==Arr2[1]){
                        n++;
                    }
                }
                if(n==handArr.length){
                    return true;
                }
            }

        }
        return false;
    },



    //炸弹
    getZhaDan:function(pokers,length,num,isKing){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length<length)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,isKing);
        numArr=this.createCardNumArr(tempArr,num,length,true);


        let ret = DdzManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let temp1 = [];
            let n = 0;
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];

                if(numArr[i]==this.getPokerNumByPoker(temp[0]))
                {
                    temp1.push(temp[0]);
                    n++;
                    if(n==length)
                    {
                        break;
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr;
    },

    judgeZhaDan:function(pokers,length,num)
    {
        // if(pokers.length!=length||this.judgeZapai(pokers,1))
        if(pokers.length != 4 )
        {
            return false;
        }
        let tempDZ=this.getZhaDan(pokers,length,num,true);
        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },

    getWangZha:function(pokers)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length<2)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,true);

        let temp1 = tempArr[tempArr.length-1];
        let temp2 = tempArr[tempArr.length-2];
        if(temp1[1]==1&&temp2[1]==1)
        {
            for(var i = 0;i<pokers.length;i++)
            {
                if(temp1[0]==this.getPokerNumByPoker(pokers[i])||temp2[0]==this.getPokerNumByPoker(pokers[i])){
                    numArr.push(pokers[i]);
                }
            }
            pokArr.push(numArr);
        }


        return pokArr;


    },

    //天王炸
    getTWZha:function(pokers)
    {
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length<4)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,true);
        let temp1 = tempArr[tempArr.length-1];
        let temp2 = tempArr[tempArr.length-2];
        if(temp1[1]==1&&temp2[1]==1)
        {
            for(var i = 0;i<pokers.length;i++)
            {
                if(temp1[0]==this.getPokerNumByPoker(pokers[i])||temp2[0]==this.getPokerNumByPoker(pokers[i])){
                    numArr.push(pokers[i]);
                }
            }
            pokArr.push(numArr);
        }

        return pokArr;


    },
    judgeTWZha:function(pokers)
    {
        //let tempTWZ=pokers;
        if(pokers.length!=4)
        {
            return false;
        }
        let tempTWZ=this.getTWZha(pokers)
        if(tempTWZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }

    },


});
