var config = require('Config');
var LoadGame = require('LoadGame');
const gpCommand = require('gpCommand');

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {

        gpManager.rule = this.node.getComponent(config.getGameById(308).rule);
        this.initData();
        this.addPomeloListeners();

        this.node.on('CMD_Ready',this.CMD_Ready,this);
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
        if(!gpManager.isResLoadComplete)
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

    },
    //CMD start
    CMD_Ready:function()
    {
        var route = this.game.server + '.CMD_Ready';
        PomeloClient.request(route);
    },

    CMD_Exit:function()
    {
        var route = this.game.server + '.CMD_Exit';
        PomeloClient.request(route);
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
        // this._renders[chair].clearForGame();
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
        cc.log('RCMD_Kick');
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
        if(msgArr[data.bt] == null || msgArr[data.bt] == ''){
            return;
        }
        showAlertBox(msgArr[data.bt],function () {
            self.backLobby();
        });
    },

    RCMD_close:function(data){
        ////////////////-----cc.log("RCMD_close");
        ////////////////-----cc.log(data);
    },

    RCMD_GameStart:function(data){
        ////////////////-----cc.log("RCMD_GameStart");
        ////////////////-----cc.log(data);

        this.isPlaying = true;
    },

    RCMD_Timeout:function(data){
        ////////////////-----cc.log("RCMD_Timeout");
        ////////////////-----cc.log(data);
    },

    RCMD_Expend:function(data){

    },

    RCMD_signup:function(data){
        ////////////////-----cc.log("RCMD_signup");
        ////////////////-----cc.log(data);

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
        ////////////////-----cc.log("RCMD_MobileSignUp");
        ////////////////-----cc.log(data);
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
        cc.log("RCMD_PlayerStatus");
        this.node.emit('RCMD_PlayerStatus',data);
    },

    RCMD_initParam:function(data){

        this.gameid = data.gameid;
        this.EHBTimes = data.EHBTimes || 15;
        this.outTimes = data.outTimes || 10;
        this.roomType = data.roomType;
        //this.ruleFlag = data.ruleFlag&0xF0;
        //this.roomcode = retData.roomcode;
        this.currGame = data.currGame || 0;
        this.totalGame = data.totalGame || 0;
        this._currentFeng =  0;
        // 游戏配置信息
        this.game = config.getGameById(this.gameid);
        // this.node.emit('RCMD_initParam',data);
        // this.initRender();
        // this.resetGame();
        this.soundCtrl = this.node.addComponent(this.game.sound || 'gpSound');  // 默认普通话
        // 复盘记录不需要触摸出牌
        // this.setTouchEvent();
        // this.initCardRoom();

        this.node.emit("RCMD_initParam",data);
    },

    RCMD_ServerHeartOut:function(data){
        ////////////////-----cc.log("RCMD_ServerHeartOut");
        ////////////////-----cc.log(data);
    },

    RCMD_TaskSeat:function(data){
        ////////////////-----cc.log("RCMD_TaskSeat");
        ////////////////-----cc.log(data);

        this.seatId = data.seatid;
        this.tableId = data.tableid;
        gpManager.mySeatId = this.seatId;
        this.node.emit('RCMD_TaskSeat',data);
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

    RCMD_SitIn:function(data){
        ////////////////-----cc.log("RCMD_SitIn");
        ////////////////-----cc.log(data);
        this.node.emit('RCMD_SitIn',data);
    },

    RCMD_Result:function(data){
        ////////////////-----cc.log("RCMD_Result");
        ////////////////-----cc.log(data);
        this.isPlaying = false;
        this.node.emit('RCMD_Result',data);
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
        ////////////////-----cc.log("RCMD_Command");
        ////////////////-----cc.log(data);
        let cmd = data.cmd;
        // data.cmd = data.cmd.toString(16);
        let retData = data.data;
        ////////////////-----cc.log("cmd = 0x" + data.cmd.toString(16));
        if (cmd == gpCommand.RESP_CMD.RCMD_INITDATA) {
            ////////////////-----cc.log("RCMD_Command in");
            cc.log('RCMD_INITDATA',retData);
            this.totalGame = retData.totalGame;
            this.baseMoney = retData.baseMoney;
            this.playerNum = this.getruleFlagPlayer(retData.ruleFlag);
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
        } else if (cmd == gpCommand.RESP_CMD.RCMD_GameStart)
        {
            //开始游戏
            this.setMsgBlocked(true);
            this.isPlaying = true;

        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_Runfirst)
        {
            //
            this.setMsgBlocked(true);
        }
        else if (cmd == gpCommand.RESP_CMD.RCMD_SendCard)
        {
            //收到牌
            this.isPlaying = true;
            this.setMsgBlocked(true);
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_Change)
        {
            //收到结果
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_Eastwind)
        {
            //指定借东风
            //this.userarray = retData.userarray;//玩家数据
            this.setMsgBlocked(true);
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_First)
        {
            //指定出牌人

            //this.userarray = retData.userarray;//玩家数据
            this.setMsgBlocked(true);
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_OutCardDLink)
        {
            //
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_OutCard)
        {
            //转发出牌
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_GiveUpOutCard) {
            //转发出牌
            this.setMsgBlocked(true);

            //this.userarray = retData.userarray;//玩家数据
        }else if(cmd == gpCommand.RESP_CMD.RCMD_Result)
        {
            this.isPlaying = false;
            this.setMsgBlocked(true);
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_SendPrise)
        {

            this.setMsgBlocked(true);
        }
        else if(cmd == gpCommand.RESP_CMD.RCMD_SendLightCardID)
        {

            this.setMsgBlocked(true);
        }
        else
        {
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
        for(var i = 0; i < gpManager.msgRCMDQueue.length; i++){
            pomelo.on(gpManager.msgRCMDQueue[i],this.msgQueue.bind(this));
        }

        //不需要加入队列的消息
        for(var i = 0; i < gpManager.msgRCMDList.length;i++){
            var msg = gpManager.msgRCMDList[i];
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

        var ret =gpManager.combination(pokers,1);
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
        for(let i = 0; i < gpManager.msgRCMDQueue.length; i++){
            pomelo.removeAllListeners(gpManager.msgRCMDQueue[i]);
        }

        //不需要加入队列的消息
        for(let i = 0; i < gpManager.msgRCMDList.length; i++){
            pomelo.removeAllListeners(gpManager.msgRCMDList[i]);
        }

        ////////////////-----cc.log(this.msgList.length);
    },

    /**
     * 把消息放入队列
     * @param data
     */
    msgQueue:function(data){
        if(data.route == 'RCMD_Command' && data.cmd == 0x810E){
            this.RCMD_Command(data);
        }else{
            this.msgList.push(data);
        }

    },

    getPokerWeightByPoker:function(poker)
    {
        return poker.getComponent("gppokerCtr").weight;
    },

    getPokerTypeByPoker:function(poker)
    {
        return poker.getComponent("gppokerCtr").type;
    },
    getpokeriofoByPoker:function(poker)
    {
        return poker.getComponent("gppokerCtr").info;
    },
    tacklePokers:function(pokers)
    {
        let temp = pokers;
        this.sortHandPokersBToS(temp);
        let arr=this.getCardInfo(temp);
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
        return poker.getComponent("gppokerCtr").num;
    },
    getPokerNumByPokerS:function(poker)
    {
        return poker.getComponent("gppokerCtrS").num;
    },

    getPokerIndexByPoker: function(poker)  {
        return poker.getComponent("gppokerCtr").index;
    },


    sortHandPokers:function(pokers)
    {
        pokers.sort(function(a,b){
            return a.getComponent("gppokerCtr").weight-b.getComponent("gppokerCtr").weight;
        });
    },

    sortHandPokersBToS:function(pokers)
    {
        pokers.sort(function(a,b){
            return b.getComponent("gppokerCtr").weight-a.getComponent("gppokerCtr").weight;
        });
    },
    sortHandPokersTempML: function (pokers) {
        pokers.sort(function(a,b){
            if(a.getComponent("gppokerCtr").pokerNum == b.getComponent("gppokerCtr").pokerNum)
            {
                return b.getComponent("gppokerCtr").weight - a.getComponent("gppokerCtr").weight;
            }
            else
            {

                return b.getComponent("gppokerCtr").pokerNum - a.getComponent("gppokerCtr").pokerNum;
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
                        pokers[j].getComponent("gppokerCtr").pokerNum = temp[0];
                    }
                    else
                        pokers[j].getComponent("gppokerCtr").pokerNum = temp[1];
                }

            }
        }
        cc.log("pokers!!!!",pokers);
        this.sortHandPokersTempML(pokers);

    },

    sortSelectedNumPokers:function(pokers)
    {
        pokers.sort(function(a,b){
            return a.getComponent("gppokerCtr").num - b.getComponent("gppokerCtr").num;
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

    //把node类型的pokers数组 转化成牌点和数量
    createDictionary:function(pokers,isKing)
    {
        let pokersArr=[];
        let m;
        if(isKing)
        {
            m=15;
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
            // if (count > 0) {pokersArr.push(temp);}
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
                if(this.getPokerNumByPokerS(pokers[i])==num)
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
    //  获取手牌可以顺连牌的列表 数量  2 - K
    createDicSHUN:function(pokers)
    {
        let pokersArr=[];
        let n=0;
        for(var num = 3;num<=15;num++)
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
    // 返回数组中 tempArr[i] 个数>=n的列表
    createSHUNCardNumArr:function(tempArr,num,n)
    {
        let numArr = [];
        for(var i=0;i<tempArr.length;i++)
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
        let ret =gpManager.combination(pokers,1);
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


        let ret =gpManager.combination(pokers,1);
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
        let tempArr=this.createDictionary(pokers);
        let numArr = [];
        for (var i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            if (temp[1] == length && temp[0] > num) {
                numArr.push(temp[0])
            }
        }
        return numArr;
    },


    //获取单张///
    getDanzhang:function(pokers,length,num,isKing){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组


        tempArr=this.createDictionary(pokers,isKing);
        // numArr=this.createCardNumArr(tempArr,num,1,false);
        //  by Amao  修改 只能搜索单张
        numArr = this.getDicForNums(pokers,num,1);
        let ret =gpManager.combination(pokers,1);
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

    //判断是否单张//
    judgeDanZhang:function(pokers,lenght,num)
    {   
        if(pokers.length != lenght)
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

    //获取对子//
    getDuizi:function(pokers,length,num,isKing){

        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length)
        {
            return pokArr;
        }

        tempArr=this.createDictionary(pokers,isKing);
        numArr=this.createCardNumArr(tempArr,num,2,false);


        let ret =gpManager.combination(pokers,1);
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
    //判断是否是对子//
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


    //获取三张//
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

        
        let ret =gpManager.combination(pokers,1);
        for(var i = 0;i<numArr.length;i++)
        {
            let temp1 = [];
            let n = 0;
            for(var j = 0;j < ret.length;j++)
            {
                let temp = ret[j];

                if(numArr[i]==this.getPokerNumByPoker(temp[0]) && numArr[i] != 14)
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
    //检查是否三张//
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

    // 获取arr内 连续的组
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

    //获取连对//
    getLiandui:function(pokers,length,num){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length<length||pokers.length<4)
        {   
            return pokArr;
        }

        tempArr=this.createDicSHUN(pokers);

        // let tempnumArr=this.createSHUNCardNumArr(tempArr,num,2);
        let tempnumArr = [];

        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] > num && ttemp[1] >= 2) {
                tempnumArr.push(ttemp)
            }
        }

        if (tempnumArr.length < 2) {return [];}

        numArr=this.getNumArr(tempnumArr,length/2);


        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,2);
        }

        let ret =gpManager.combination(pokers,1);
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

    //判断是否连对//
    judgeLianDui:function(pokers,length,num)
    {   
        
        // if(pokers.length!=length||pokers.length%2!=0||pokers.length<4||this.judgeZapai(pokers,pokers.length/2))
        if(pokers.length!=length||pokers.length%2!=0||pokers.length<4)
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

    //获取三连//
    getSanLian:function(pokers,length,num){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        if(pokers.length<length||pokers.length<6)
        {
            return pokArr;
        }

        tempArr=this.createDicSHUN(pokers);
        let tempnumArr = [];

        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] > num && ttemp[1] >= 3) {
                tempnumArr.push(ttemp)
            }
        }

        if (tempnumArr.length < 2) {return [];}   //三张数组不超过2 直接返回

        numArr=this.getNumArr(tempnumArr,length/3);

        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3);
        }

        let ret =gpManager.combination(pokers,1);
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

                    if(tep[0]==this.getPokerNumByPoker(temp[0]) && tep[0] != 14)
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
    //判断是否三连//
    judgeSanlian:function(pokers,length,num)
    {
        if(pokers.length!=length||pokers.length%3!=0||pokers.length<6||this.judgeZapai(pokers,pokers.length/3))
        {   
            return false;
        }

        let tempDZ=this.getSanLian(pokers,length,num);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
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

    //飞机待对
    getFeiJi:function(pokers,length,num) 
    {
        if(pokers.length<length || pokers.length<10 )
        {
            return [];
        }

        let pokArr=[];

        let tempArr=this.createDicSHUN(pokers);//字典
        

        let tempnumArr = [];  // 三张数组
        let danArr = [];

        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] > num && ttemp[1] >= 3) {
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

        // cc.log("poktemp",poktemp)

        let ret =gpManager.combination(pokers,1);

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
    //飞机带对
    judgeFeiji:function(pokers,length,num)
    {   
        if(pokers.length != length || pokers.length < 10 || pokers.length % 5 != 0)
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

    // 将飞机需要的散牌序列化 全部转化成1张1张的 数组 
    createArrayForLenght:function (list,length) {
        let array = [];
        let result = [];

        for (var i = 0; i < list.length; i++) {
            let one = list[i];
            for (var j = 0; j < one[1]; j++) {
                if (one[1] > 0) {
                    let tt = [];
                    tt.push(one[0]);
                    tt.push(1);
                    array.push(tt)
                }
            }
        }

        if (array.length < length) { return result;}

        for (var i = 0; i < array.length - length + 1; i++) {
            let temp = [];
            for (var k = 0; k < length; k++) {
                temp.push(array[k + i]);
            }
            result.push(temp)
        }


        return result;
    },

    // 将数组重新整合
    createArrayForEnd:function (list) {
        let array = [];
        let result = [];

        for (var i = 0; i < list.length; i++) {
            let one = list[i];
            if (!array[i]) {array[i] = [];}

            for (var index = 0; index < 16; index++) {
                array[i][index] = 0;
            }

            for (var k = 0; k < one.length; k++) {
                let kk = one[k];
                array[i][kk[0]] += kk[1];
            }  
        }

        for (var i = 0; i < array.length; i++) {
            if (!result[i]) {result[i] = [];}
            for (var j = 0; j < 16; j++) {
                if (array[i][j] > 0 ) {
                    let temp = [];
                    temp.push(j);
                    temp.push(array[i][j]);
                    result[i].push(temp)
                }
            }
        }
        return result;
    },

    // numArr = 三连 数组  array2 三牌    array3 所有三连数组  检查三连数组 将当前组没有用到的三连放入散牌计算
    createFeiJi_sanpai:function (numArr,array2,tempnumArr) {
        let danArr = [];  // 所有散牌列表

        for (var i = 0; i < array2.length; i++) {
            danArr.push(array2[i])
        }


        for (var i = 0; i < tempnumArr.length; i++) {
            let temp = tempnumArr[i];
            let isHave = false
            for (var j = 0; j < numArr.length; i++) {
                if (numArr[j][0] == temp[0]) {
                    isHave = true;
                    break;
                }
            }
            if (!isHave) { //如果不在 当前三连列表  添加到散牌列表中
                danArr.push(temp)
            }
        }


        let n = 0;
        for (var k = 0; k < numArr.length; k++) {
            let kk = numArr[k];
            n += kk[1];
        }

        let lastNum = numArr.length * 5 - n //  需要带的散牌个数

        let sanpai = this.createArrayForLenght(danArr,lastNum);

        return sanpai
    },

    //  获取手牌可以顺连牌的列表 数量  3 - K
    createDicFeiJi:function(pokers)
    {
        let pokersArr=[];
        let n=0;
        for(var num = 3;num<=15;num++)
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

    //飞机带散牌
    getFeiJi_sanpai:function(pokers,length,num) 
    {
        if(pokers.length<length || pokers.length<10 )
        {
            return [];
        }

        let pokArr=[];
        let poktemp = [];

        let tempArr=this.createDicSHUN(pokers);//字典
        let tempnumArr = [];  // 三张数组
        let danArr = []; //其他杂牌

        for (var i = 0; i < tempArr.length; i++) {
            let ttemp = tempArr[i];
            if (ttemp[0] > num && ttemp[1] >= 3) {
                tempnumArr.push(ttemp)
            }else{
                danArr.push(ttemp)
            }
        }


        if (tempnumArr.length < 2) {return [];}   //三张数组不超过2 直接返回


        let numArr=this.getNumArr(tempnumArr,length/5);  // 取出连续的3连组合
        
        if (length == 0) {
            numArr = this.getNumArrNull(tempnumArr,3); // 取出最大3连组合
        }

        if (numArr.length <= 0 ) {return []}  // 最终数组为空  直接返回


        for (var i = 0; i < numArr.length; i++) {
            let san = numArr[i];

            let sanpai = this.createFeiJi_sanpai(san,danArr,tempnumArr)
            if (sanpai.length > 0) {
                for (var m = 0; m < sanpai.length; m++) {
                    let temp = [];
                    for (var w = 0; w < san.length; w++) {
                        temp.push(san[w]);
                    }

                    for (var l = 0; l < sanpai[m].length; l++) {
                        temp.push(sanpai[m][l]);
                    }
                    poktemp.push(temp);
                }
            }
        }

        cc.log("poktemp",poktemp)

        let poktemps = this.createArrayForEnd(poktemp)

        let ret =gpManager.combination(pokers,1);

        for (var i = 0; i < poktemps.length; i++) {
            let listArr = poktemps[i];
            
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
    //飞机带散牌
    judgeFeiji_sanpai:function(pokers,length,num)
    {   
        if(pokers.length != length || pokers.length < 10 || pokers.length % 5 != 0)
        {
            return false;
        }

        let tempFJ=this.getFeiJi_sanpai(pokers,length,num);

        if(tempFJ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
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

    // 获取三带二的翅膀  length == 1 杂牌 length ==2 对子
    getSanDaierArr:function (pokers,length) {
        if(pokers.length < length)
        {
            return false;
        }
        var tempnumArr = []

        let pokersArr=[];

        let n=0;
        for(var num = 3;num<=15;num++)
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


        var  chibang = [];

        for (var i = 0; i < pokersArr.length; i++) {
            if (pokersArr[i][1] == length) {
                chibang.push(pokersArr[i])
            }
        }

        if (length == 1 && chibang.length < 2) {return [];}

        return chibang;
    },

    //三带2杂
    getSanDaier:function (pokers,length,num) {
        if(pokers.length < 5 || (length != 5 && length != 0)) {
            return false;
        }

        var tempArr=this.createDicSHUN(pokers); // 字典 需要检查的牌组

        var tempnumSan=this.createSHUNSanlianCardNumArr(tempArr,num,3);  // 获取三连数组

        if (tempnumSan.length <=0 ) {return [];}  // 没有三连 返回空数组

        var tempnumArr = [];    //翅膀数组

        // 获取压过当前桌牌的三连 且A 不能加入计算
        var listSan = [];
        for (var i = 0; i < tempnumSan.length; i++) {
            // if (tempnumSan[i][0] > num  && tempnumSan[i][0] != 14) {
            if (tempnumSan[i][0] > num) {
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
                    temp.push(san);
                    temp.push(azpai1);
                    temp.push(azpai2);
                    poktemp.push(temp);
                }
            } 
        }

        let ret =gpManager.combination(pokers,1);

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
    // 三带二杂
    judgeSanLianEr:function(pokers,length,num){
        if(pokers.length!=length || (length != 5 && length != 0))
        {
            return false;
        }


        let tempSLE=this.getSanDaier(pokers,length,num);


        if(tempSLE.length>0)
        {
            return true;
        }
        else
        {   
            return false;
        }
    },


    //三带对
    getSanDaidui:function (pokers,length,num) {
        if(pokers.length < 5 || (length != 5 && length != 0)) {
            return false;
        }

        var tempArr=this.createDicSHUN(pokers); // 字典 需要检查的牌组

        var tempnumSan=this.createSHUNSanlianCardNumArr(tempArr,num,3);  // 获取三连数组

        if (tempnumSan.length <=0 ) {return [];}  // 没有三连 返回空数组

        var tempnumArr = [];    //翅膀数组

        // 获取压过当前桌牌的三连 且A 不能加入计算
        var listSan = [];
        for (var i = 0; i < tempnumSan.length; i++) {
            // if (tempnumSan[i][0] > num  && tempnumSan[i][0] != 14) {
            if (tempnumSan[i][0] > num) {
               listSan.push(tempnumSan[i]) 
            }
        }

        // 没有三连压过num 返回空数组
        if (listSan.length <=0 ) {return [];}  

        let listDui = this.getSanDaierArr(pokers,2);

        if (listDui.length < 1) {return [];}

        var pokArr = [];
        var poktemp = [];

        
        for (var i = 0; i < listSan.length; i++) {
            let san = listSan[i];
            
            if (listDui.length > 0) {
                for (var k = 0; k < listDui.length; k++) {
                    let temp = [];
                    let adui = listDui[k];
                    temp.push(san);
                    temp.push(adui);
                    poktemp.push(temp);
                }
            }
        }

        let ret =gpManager.combination(pokers,1);

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
    //三带对
    judgeSanLiandui:function(pokers,length,num){
        if(pokers.length!=length || (length != 5 && length != 0))
        {
            return false;
        }


        let tempSLE=this.getSanDaidui(pokers,length,num);


        if(tempSLE.length>0)
        {
            return true;
        }
        else
        {   
            return false;
        }
    },


    RCMD_MatchOver:function(data){
        ////////////////-----cc.log('RCMD_MatchOver',data);
        if(data.count == 0){
            let self = this;
            showAlertBox('房主解散了房间',function () {
                self.backLobby();
            });
        }else{
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

            let ret =gpManager.combination(pokers,1);
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

    changePokers : function (array) {
        let sArray = this.getShunziDic(array)

        let aa = []

        for (var i = 0; i < sArray.length; i++) {
            if (sArray[i][1] > 0) {
                aa.push(sArray[i])
            }
        }

        return aa
    },

    // 获取顺子提示
    getShunZiTips:function (handpokers,selectedArray,type,length) {
        let sArray = this.changePokers(selectedArray)
        let hArray = this.changePokers(handpokers)

        //选中的从小到大排序
        sArray.sort(function (a,b) {return a[0] >  b[0]})

        let maxCard = sArray[sArray.length-1][0]
        let minCard = sArray[0][0]

        if (maxCard == 15) {
            return [];
        }
        // 选中有重复的
        for (var i = 0; i < sArray.length; i++) {
            if (sArray[i][1] > 1) {
                return [];
            }
            
        }

        // let isA_min = false

        // // 判断A 因为无论A什么时候选中 都只有一种可能  那就是最大
        // if (maxCard == 14) {
        //     // 判断是否需要作为最小的1来组成顺子 那么就需要判断手牌里是否存在2  (作为最大14 只需要正常判断即可)
        //     for (var i = 0; i < hArray.length; i++) {
        //         if (hArray[i][0] == 2) {
        //             isA_min = true
        //             break
        //         }
        //     }

        // }

        if (maxCard - minCard < 4) {return []}  

        let temps = []
        

        for (var i = minCard; i <= maxCard;  i++) {
            let isReturn = false
            for (var k = 0; k < hArray.length; k++) {
                if(hArray[k][0] == i && hArray[k][1] > 0){
                    let tt = []
                    tt.push(i)
                    tt.push(1)
                    temps.push(tt);
                    isReturn = true
                }
            }
            if (!isReturn) {
                return []
            }
        }

        let choose = []
        let pokArr =[]

        choose.push(temps)

        let ret =gpManager.combination(handpokers,1);

        for(var i = 0;i<choose.length;i++)
        {   
            let temp1 = []
            let tmp=choose[i];
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
                        break;
                    }
                }
            }
            pokArr.push(temp1);
        }

        return pokArr
    },

    // by Amao
    // 获取可以大过num的length 长度的所有数组
    getShunziForFive:function(array,length,num)
    {   
        let temps = array.sort(function (a,b) {
            return a[0] > b[0];
        })

        let arr = [];

        if (length == 0) {
            for (var i = 0; i < temps.length; i++) {
                let tmp = temps[i];
                let tempnumArr = [];
                let tempCardNum = 0;
                if (tmp[0] > num) {
                    for (var k = 0; k <= 17; k++) {
                        let tt = temps[k+i];
                        if (k == 0) {
                            tempnumArr.push(tt);
                        }else{                
                            if (tempCardNum + 1 != tt[0]) {
                                break;
                            }
                            tempnumArr.push(tt);
                        }
                        tempCardNum = tt[0];
                    }
                    if (tempnumArr.length >= 5) {
                        arr.push(tempnumArr)
                    }
                }
            }

            return arr;
        }

        for (var i = 0; i < temps.length; i++) {
            let tmp = temps[i];
            let tempnumArr = [];
            let tempCardNum = 0;
            if (tmp[0] > num) {
                for (var k = 0; k < length; k++) {
                    if (k+i >= temps.length - 1) {break;}
                    let tt = temps[k+i];
                    if (k == 0) {
                        tempnumArr.push(tt);
                    }else{                
                        if (tempCardNum + 1 != tt[0]) {
                            break;
                        }
                        tempnumArr.push(tt);
                    }
                    tempCardNum = tt[0];
                }
                if (tempnumArr.length == length) {
                    arr.push(tempnumArr)
                }
            }
        }

        return arr;
    },

    // 获取所有可以计算顺子的牌
    getShunziDic:function (pokers) {
        let pokersArr=[];
        let n=0;
        for(var num = 3;num <= 15;num++)
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
    // 获取连续的顺子
    getNumArrShunzi:function(arr,n,num)
    {
        n = parseInt(n);
        let numArr = [];
        let temp = arr;

        // 正常判断
        for(var i = 0;i<temp.length;i++)
        {
            let tmp = [];
            if (temp[i] != null && temp[i][0] > num) {
                tmp.push(temp[i]);

                for(var j =1;j<n;j++){   
                    let temp1=temp[i+j];
                    if (!temp1 || temp1[0] == 15) {break;}  // 取不到牌点 或者 牌点为2 不能加入顺子
                    if(temp[i][0]==temp1[0]-j){
                        tmp.push(temp[i+j]);
                    }else { break; }
                }
                if(tmp.length == n) { numArr.push(tmp); }
            } 
        }


        let isHaveA = false;
        let isHave2 = false;

        let tmp = [];
        n = arr.length;
        // 特殊判断
        for(var i = 0;i < temp.length; i++)
        {
            if (temp[i][0] == 14) {
                isHaveA = true;
                tmp.push(temp[i]);
            }
            if (temp[i][0] == 15) {
                isHave2 = true;
                tmp.push(temp[i]);
            }
        }

        if (isHaveA && isHave2 && num == 2) {
            
            for (var k = 3; k < 14; k++) {
                let isNext = false;
                for (var m = 0; m < temp.length; m++) {
                    if (temp[m][0] == k) {
                        tmp.push(temp[m]);
                        isNext = true;
                        break;
                    }
                }
                if (!isNext) { break;}
            }

            if(tmp.length >=5){ numArr.push(tmp); }
        }

        return numArr;
    },

    // 获取顺子 null
    getNumArrShunziNull:function(arr,n,num)
    {   

        n = parseInt(n);
        let numArr = [];
        let temp = arr;

        // 正常判断
        for(var i = 0;i<temp.length;i++)
        {
            let tmp = [];
            if (temp[i] != null && temp[i][0] > num) {
                tmp.push(temp[i]);

                for(var j =1;j<n;j++){   
                    let temp1=temp[i+j];
                    if (!temp1 || temp1[0] == 15) {break;}  // 取不到牌点 或者 牌点为2 不能加入顺子
                    if(temp[i][0]==temp1[0]-j){
                        tmp.push(temp[i+j]);
                    }else { break; }
                }
                if(tmp.length >= 5) { numArr.push(tmp); }
            } 
        }

        let isHaveA = false;
        let isHave2 = false;

        let tmp = [];
        n = arr.length;
        // 特殊判断
        for(var i = 0;i < temp.length; i++)
        {
            if (temp[i][0] == 14) {
                isHaveA = true;
                tmp.push(temp[i]);
            }
            if (temp[i][0] == 15) {
                isHave2 = true;
                tmp.push(temp[i]);
            }
        }

        if (isHaveA && isHave2 && num == 2) {
            
            for (var k = 3; k < 14; k++) {
                let isNext = false;
                for (var m = 0; m < temp.length; m++) {
                    if (temp[m][0] == k) {
                        tmp.push(temp[m]);
                        isNext = true;
                        break;
                    }
                }
                if (!isNext) { break;}
            }

            if(tmp.length >=5){ numArr.push(tmp); }
        }


        return numArr;
    },


    //获取顺子//
    getShunZi:function(pokers,length,num)
    {   
        
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组
        // if(pokers.length<length||pokers.length<5||(num+length)==15)
        if(pokers.length < length || pokers.length<5)
        {
            return pokArr;
        }

        tempArr=this.getShunziDic(pokers);

        let tempnumArr=this.createSHUNCardNumArr(tempArr,num,1);

        numArr=this.getNumArrShunzi(tempnumArr,length,num);

        if (length == 0) {
            numArr=this.getNumArrShunziNull(tempnumArr,pokers.length,2);
        }

        

        let ret =gpManager.combination(pokers,1);

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
    //判断是否顺子  5以上的顺子都可以出//
    judgeShunzi:function(handpokers,pokers,length,num)
    {   
        if(pokers.length < 5 || handpokers.length != length || this.judgeDuizi(pokers,pokers.length,2)) // 有2张一样的牌 不是顺子
        {
            return false;
        }

        let tempDZ=this.getShunZi(handpokers,length,num);  // 所有数组里 可以连成 length 长度的链子

        if(tempDZ.length>0 && tempDZ[0].length == length)
        {
            return true;
        }
        else
        {
            return false;
        }

        // for(var i = 0;i<tempDZ.length;i++){
        //     var temp = tempDZ[i];
        //     var n=0;
        //     var handArr = this.createDictionary(temp,true);
            
        //     if(handArr.length == pokerArr.length){
        //         for(var j = 0;j<handArr.length;j++){
        //             var Arr1 = pokerArr[j];
        //             var Arr2 = handArr[j];
        //             if(Arr1[0]==Arr2[0]&&Arr1[1]==Arr2[1]){
        //                 n++;
        //             }
        //         }
        //         if(n==handArr.length){
        //             return true;
        //         }
        //     }
        // }
        return false;
    },

    //获取炸弹//
    getZhaDan:function(pokers,length,num,isKing,Rtype){
        let numArr=[];//符合牌型的牌数字的数组
        let tempArr=[];//临时数组
        let pokArr=[];//存放牌数组

        if(pokers.length < length)
        {
            return pokArr;
        }


        tempArr=this.createDictionary(pokers,isKing);

        
        for (var i = 0; i < tempArr.length; i++) {
            let temp = tempArr[i];
            if (temp[1] >= length) {
                if (Rtype > 9) {
                    if (temp[0] > num) {numArr.push(temp[0]);}
                }else {
                    numArr.push(temp[0]);
                }
            }
        }

        if (length == 3) {
            numArr=this.createCardNumArr(tempArr,13,3,true);
        };

        

        let danzhang = this.getDanzhang(pokers,1,1);  // 取出所有单张 可以带出去

        let ret =gpManager.combination(pokers,1);
        
        for(let i = 0;i<numArr.length;i++)
        {   
            let temp1 = [];
            let n = 0;
            for(let j = 0;j < ret.length;j++)
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

            if (danzhang.length > 0) {
                for (let i = 0; i < danzhang.length; i++) {
                    let zhandan = [];
                    for (let j = 0; j < temp1.length; j++) {
                        zhandan.push(temp1[j]);
                    }
                    zhandan.push(danzhang[i][0]);
                    pokArr.push(zhandan);
                }
            }
            else{
                pokArr.push(temp1);
            }
        }
        cc.log("pokArr",pokArr)
        return pokArr;
    },
    //检查是否炸弹//
    judgeZhaDan:function(pokers,length,num,Rtype,isCheckLicit)
    {   
        
        if(pokers.length < length )
        {
            return false;
        }

        if (length == 4 && pokers.length > 5) {return false;}
        if (length == 3 && pokers.length > 4) {return false;}

        let tempDZ=this.getZhaDan(pokers,length,num,true,Rtype);

        if(tempDZ.length>0)
        {
            return true;
        }
        else
        {
            return false;
        }
    },


});
