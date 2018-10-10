var config = require('Config');
var LoadGame = require('LoadGame');
const SSSCommand = require("SSSCommand");
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.log("SSSRule load");
        // SssManager.rule = this.node.getComponent(LoadGame.getCurrentGame().rule);
        SssManager.rule = this;

        this.initData();
        this.addPomeloListeners();
        this.node.on('CMD_Ready',this.CMD_Ready,this);
        this.node.on('CMD_Exit',this.CMD_Exit,this);
        //点击退出按钮
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
        if(!SssManager.isResLoadComplete)
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

    //CMD end

    RCMD_Start:function(data){
        cc.log("RCMD_Start");
        cc.log(data);
        this.msgBlocked = true;
        this.node.emit('RCMD_Start',data);
    },

    RCMD_Ready:function(data){
        cc.log("RCMD_Ready");
        cc.log(data);
        this.msgBlocked = true;
        // this._renders[chair].clearForGame();
        this.node.emit('RCMD_Ready',data);
        // this.nextAction();
    },

    /**
     * 玩家离开
     * @param data
     * @constructor
     */
    RCMD_exit:function(data){
        cc.log("RCMD_exit", data);
        // data.userid
        //清理用户界面
        if (data.userid == UserCenter.getUserID()) {
            this.removePomeloListeners();
            hideAlertBox();
            this.backLobby();
        }
        this.msgBlocked = true;
        this.node.emit('RCMD_exit', data);
    },

    /**
     *  {
     *  0：_T("您的人品不好，所以被踢下线") ,
        1：_T("帐号在另一个地方登录，您被迫下线") ,
        2：_T("您被管理员踢下线") ,
        3：_T("您的游戏币不足，不能继续游戏。") ,
        4：_T("你的断线或逃跑已经超过规定的次数,不能继续游戏")}
     */
    RCMD_Kick:function(data){
        this.msgBlocked = true;
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
        if(data.srtMsg == '游戏已结束'){
            return
        }
        showAlertBox(msgArr[data.bt],function () {
            self.backLobby();
        });
    },

    RCMD_close:function(data){
        cc.log("RCMD_close");
        cc.log(data);
    },

    RCMD_GameStart:function(data){
        cc.log("RCMD_GameStart");
        cc.log(data);

        this.isPlaying = true;
    },

    RCMD_Timeout:function(data){
        cc.log("RCMD_Timeout");
        cc.log(data);
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

    RCMD_Expend:function(data){
        cc.log("RCMD_Expend");
        cc.log(data);
        let expend = data.data;
        if(expend.CMD == '002'){
            var ar = expend.ar;
            for (let i=0;i<ar.length;i++){
                if (ar[i].zhlx==4){
                    UserCenter.setCardNum(ar[i].je);
                }
                if (ar[i].zhlx==3){
                    UserCenter.setYouxibiNum(ar[i].je);
                }
            }
        }
        if (data.data.CMD == '003'){
            cc.log('cmd003')
            this.renew = data.data.renew;
        }
        if (data.data.CMD == '004'){
            cc.log('cmd004')
            this.renew = data.data.renew;
            this.kicknum = data.data.exit;
        }
    },

    RCMD_signup:function(data){
        cc.log("RCMD_signup");
        cc.log(data);
        let self = this;
        if(!!data.flag){  // 登陆服务器失败
            hideLoadingAni();
            showAlertBox('进入游戏失败',function () {
                self.backLobby();
            });
        }
    },

    /**
     * 进入房间
     * @param data
     * @constructor
     */
    RCMD_MobileSignUp:function(data){
        cc.log("RCMD_MobileSignUp");
        cc.log(data);
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
        cc.log("RCMD_initParam");
        cc.log(data);

        this.gameid = data.gameid;
        this.EHBTimes = data.EHBTimes || 15;
        this.outTimes = data.outTimes || 10;
        this.roomType = data.roomType;
        this.ruleFlag = data.ruleFlag;             // 游戏规则
        this._currGame = data.currGame || 0;
        this._totalGame = data.totalGame || 0;
        this._currentFeng =  0;
        // 游戏配置信息
        this.game = config.getGameById(this.gameid);
        // this.node.emit('RCMD_initParam',data);
        // this.initRender();
        // this.resetGame();
        this.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话
        // 复盘记录不需要触摸出牌
        // this.setTouchEvent();
        // this.initCardRoom();

        this.node.emit("RCMD_initParam",data);
    },

    RCMD_ServerHeartOut:function(data){
        cc.log("RCMD_ServerHeartOut");
        cc.log(data);
    },

    RCMD_TaskSeat:function(data){
        cc.log("RCMD_TaskSeat");
        cc.log(data);

        this.seatId = data.seatid;
        this.tableId = data.tableid;
        SssManager.mySeatId = this.seatId;
        this.node.emit('RCMD_TaskSeat',data);
    },

    RCMD_SitIn:function(data){
        cc.log("RCMD_SitIn");
        cc.log(data);
        this.node.emit('RCMD_SitIn',data);
    },

    RCMD_Result:function(data){
        cc.log("RCMD_Result");
        cc.log(data);
        this.isPlaying = false;
        this.node.emit('RCMD_Result',data);
    },

    RCMD_Command:function(data) {
        cc.log("RCMD_Command");
        cc.log(data);
        let cmd = data.cmd;
        let retData = data.data;
        cc.log("cmd = 0x" + data.cmd.toString(16));
        if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
            cc.log("RCMD_Command in");
            this.totalGame = retData.totalGame;
            this.basescore = retData.basescore;
            this.createRoomID = retData.createRoomID;
            this.currGame = retData.currGame;
            this.gameid = retData.gameid;
            this.roomcode = retData.roomcode;
            this.roomType = retData.roomType;
            this.ruleFlag = retData.ruleFlag;
            this.thinkTime = retData.thinkTime;
            this.game = config.getGameById(this.gameid);
            this.soundCtrl = this.node.addComponent(this.game.sound || 'SSSSound');  // 默认普通话
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_GameStart)
        {
            this.msgBlocked = true;
            //开始游戏
            this.isPlaying = true;
            this.currGame = retData.currgame;
            this.totalGame = retData.totalgame;
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_SendCard)
        {
            //发牌
        } else if (cmd == SSSCommand.RESP_CMD.RCMD_CardHand)
        {
            cc.log('SSSCommand.RESP_CMD.RCMD_CardHand');
            cc.log(data);
            //摊牌之后收到牌
            //告知牌已经组合好了
        }else if(cmd == SSSCommand.RESP_CMD.RCMD_TSC_GAMEEND)
        {
            //锁住，播放动画
            this.msgBlocked = true;
            //收到结果
            this.bFullGun = retData.bFullGun;//全垒打
            this.bFullSpecial = retData.bFullSpecial;//特殊牌型
            this.bGun = retData.bGun;//打枪
            this.bHasSpecial = retData.bHasSpecial;//是否特殊牌型
            this.turePlayersCount = retData.turePlayersCount;//真实打牌的人个数
            this.userarray = retData.userarray;//玩家数据
            this.bGameOver = retData.bGameOver;
        }
        else if(cmd == SSSCommand.RESP_CMD.RCMD_RestoreGame)
        {
            //恢复牌局
        }
        else
        {
            cc.log("无效 cmd = "+cmd);
        }

        this.node.emit('RCMD_Command',data);
    },

    /**
     * 房卡房间游戏结束
     * @param data
     */
    RCMD_MatchOver:function(data){
        cc.log('RCMD_MatchOver',data);
        if(data.count == 0){
            let self = this;
            showAlertBox('房主解散了房间',function () {
                self.backLobby();
            });
        }else{
            this.node.emit('RCMD_MatchOver',data);
        }
    },

    /**
     *  返回大厅
     */
    backLobby: function () {
        // let backscene = !!config.roomScene ? config.roomScene : config.lobbyScene;
        // cc.director.loadScene(backscene);

        if(this.roomType <2){
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

    onExit: function () {

        cc.log('退出游戏===========',this.isPlaying,this.roomType)

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


    /**
     * 退出游戏服务器
     * @param cb
     */
    exitGame: function (cb) {
        let route = this.game.server + '.CMD_Exit';
        PomeloClient.request(route, cb);
    },

    addPomeloListeners:function()
    {
        // 消息队列
        for(var i = 0; i < SssManager.msgRCMDQueue.length; i++){
            pomelo.on(SssManager.msgRCMDQueue[i],this.msgQueue.bind(this));
        }

        //不需要加入队列的消息
        for(var i = 0; i < SssManager.msgRCMDList.length;i++){
            var msg = SssManager.msgRCMDList[i];
            pomelo.on(msg,this[msg].bind(this));
        }
    },


    removePomeloListeners : function () {
        for(let i = 0; i < SssManager.msgRCMDQueue.length; i++){
            pomelo.removeAllListeners(SssManager.msgRCMDQueue[i]);
        }

        //不需要加入队列的消息
        for(let i = 0; i < SssManager.msgRCMDList.length; i++){
            pomelo.removeAllListeners(SssManager.msgRCMDList[i]);
        }
    },

    /**
     * 把消息放入队列
     * @param data
     */
    msgQueue:function(data){
        let cmd = data.cmd;
        let route = data.route;
        if (cmd == SSSCommand.RESP_CMD.RCMD_INITDATA) {
            cc.log(data);
            cc.log("cmd = 0x" + data.cmd.toString(16));
            this[route](data);
        } else if(route == "RCMD_MatchOver" && this.currGame < this.totalGame)
        {
            //协商解散的指令立即解散
            this[route](data);
        }else {
            this.msgList.push(data);
        }
    },

    getPokerWeightByPoker:function(poker)
    {
        return poker.getComponent("sss4Poker").weight;
    },

    getPokerTypeByPoker:function(poker)
    {
        return poker.getComponent("sss4Poker").type;
    },

    getPokerNumByPoker:function(poker)
    {
        return poker.getComponent("sss4Poker").num;
    },


    /**
     * 排序
     *  如果要按从小到大排序，function sortNum(a, b) { return a-b};
     如果要按从大到小排序，function sortNum(a, b) { return b-a};
     如果打乱数组，function sortNum() { return 0.5 - Math.random()};
     */
    sortPokers:function(pokers)
    {
        let self = this;
        pokers.sort(function(a,b){
            return self.getPokerWeightByPoker(b) - self.getPokerWeightByPoker(a) ;
        });
    },

    sortSelectedNumPokers:function(pokers)
    {
        let self = this;
        pokers.sort(function(a,b){
            return self.getPokerNumByPoker(b) - self.getPokerNumByPoker(a) ;
        });
    },
    /**
     * 获取权重(A最大,黑红梅方)
     * @param type
     * @param num
     *
     */
    getPokerWeight:function(type,num)
    {
        let weight;
        if(num == 1)
        {
            weight = 1000000;
        }else if(num > 14)
        {
            weight = 2000000;
        }else{
            weight = num*1000;
        }

        weight += 4-type;
        return weight;
    },


















    /**
     * 对子
     * @param pokers
     * @returns {Array}
     */
    getDuizi:function(pokers)
    {
        let arr = [];
        let arr1 = [];
        if(pokers.length < 2)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,2);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];

            if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]))
            {
                arr.push(temp);
            }else if(this.getPokerNumByPoker(temp[0]) > 14){
                arr1.push(temp);
            }
        }
        return arr.concat(arr1);
    },

    /**
     * 三条
     * @param pokers
     * @returns {Array}
     */
    getSantiao:function(pokers)
    {
        let arr = [];
        let arr1 = [];
        let arr2 = [];
        if(pokers.length < 3)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            this.sortSelectedNumPokers(temp);

            if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) )
            {
                arr.push(temp);
            }else if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2]) ){
                arr1.push(temp);
            }else if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) > 14){
                arr2.push(temp);
            }
        }
        return arr.concat(arr1).concat(arr2);
    },

    /**
     * 顺子
     * @param pokers
     * @returns {Array}
     */
    getShunzi:function(pokers)
    {
        let arr = [];
        let arr1 = [];
        let arr2 = [];
        if(pokers.length < 3)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasShunzi(temp)){
                if(this.getPokerNumByPoker(temp[1]) > 14){
                    arr2.push(temp);
                }else if(this.getPokerNumByPoker(temp[0]) > 14){
                    arr1.push(temp);
                }else{
                    arr.push(temp);
                }
            }
            // this.sortSelectedNumPokers(temp);

            // if(this.getPokerNumByPoker(temp[2]) == 1)
            // {
            //     if((this.getPokerNumByPoker(temp[0]) == 13 &&
            //         this.getPokerNumByPoker(temp[1]) == 12) 
            //         ||
            //         (this.getPokerNumByPoker(temp[0]) == 3 &&
            //         this.getPokerNumByPoker(temp[1]) == 2))
            //     {
            //         arr.push(temp);
            //     }
            // } else
            // {
            //     if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])+1 &&
            //         this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])+2
            //     )
            //     {
            //         arr.push(temp);
            //     }

            // }
        }
        cc.log(arr);
        return arr.concat(arr1).concat(arr2);
    },

    /**
     * 同花顺
     * @param pokers
     * @returns {Array}
     */
    getTonghuashun:function(pokers)
    {
        let arr = [];
        let arr1 = [];
        let arr2 = [];
        let arr3 = [];
        if(pokers.length < 3)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasTonghuashun(temp)){
                if(this.getPokerNumByPoker(temp[2]) > 14){
                    arr3.push(temp);
                }else if(this.getPokerNumByPoker(temp[1]) > 14){
                    arr2.push(temp);
                }else if(this.getPokerNumByPoker(temp[0]) > 14){
                    arr1.push(temp);
                }else{
                    arr.push(temp);
                }
            }
            // if(this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) &&
            //     this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2])
            // )
            // {
            //     this.sortSelectedNumPokers(temp);
            //     if(this.getPokerNumByPoker(temp[2]) == 1)
            //     {
            //         if((this.getPokerNumByPoker(temp[0]) == 13 &&
            //             this.getPokerNumByPoker(temp[1]) == 12) 
            //             ||
            //             (this.getPokerNumByPoker(temp[0]) == 3 &&
            //             this.getPokerNumByPoker(temp[1]) == 2))
            //         {
            //             arr.push(temp);
            //         }
            //     } else
            //     {
            //         if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])+1 &&
            //             this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])+2
            //         )
            //         {
            //             arr.push(temp);
            //         }
            //     }
            // }
        }
        cc.log(arr);
        return arr.concat(arr1).concat(arr2).concat(arr3);
    },


    isHasDuizi:function(pokers)
    {
        let arr = [];
        if(pokers.length < 2)
        {
            return false;
        }
        //有王的时候则有对子
        //if(pokers.length == 2){
            for(let i = 0; i < pokers.length; ++i){
                if(this.getPokerNumByPoker(pokers[i]) > 14){
                    return true;
                }
            }
        //}
        //当三张牌的时候,若不是王的两张牌的差值大于2,则说明不能凑成顺子,则有对子.
        if(pokers.length == 3){
            let wIndex = -1;
            let index1 = -1;
            let index2 = -1;
            let wCount = 0;
            for(let i = 0; i < pokers.length; ++i){
                if(this.getPokerNumByPoker(pokers[i]) > 14){
                    wIndex = i;
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            if(wIndex > -1 && wCount != 2){
                let diff = this.getPokerNumByPoker(pokers[index1]) - this.getPokerNumByPoker(pokers[index2]);
                if(Math.abs(diff) > 2){
                    return true;
                }
            }
        }
        let ret = SssManager.combination(pokers,2);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]))
            {
                return true;
            }
        }
        return false;
    },

    /**
     * 三条
     * @param pokers
     * @returns {Array}
     */
    isHasSantiao:function(pokers)
    {
        if(pokers.length < 3)
        {
            return false;
        }
        //当三张牌的时候,若不是王的两张牌的差值等于0,则有三条.
        if(pokers.length == 3){
            let wIndex = -1;
            let index1 = -1;
            let index2 = -1;
            let wCount = 0;
            for(let i = 0; i < pokers.length; ++i){
                if(this.getPokerNumByPoker(pokers[i]) > 14){
                    wIndex = i;
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            if(wIndex > -1 && wCount != 2){
                let diff = this.getPokerNumByPoker(pokers[index1]) - this.getPokerNumByPoker(pokers[index2]);
                if(Math.abs(diff) == 0){
                    return true;
                }
            }
        }

        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            this.sortSelectedNumPokers(temp);
            if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
                this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2]))
            {
                return true;
            }
            if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2])){
                return true;
            }
            if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) > 14){
                return true;
            }
        }
        return false;

    },

    /**
     * 顺子
     * @param pokers
     * @returns {Array}
     */
    isHasShunzi:function(pokers)
    {
        if(pokers.length < 3)
        {
            return false;
        }
        //当三张牌的时候,若不是王的两张牌的差值小于等于2且不同花,则有顺子.
        if(pokers.length == 3){
            let wIndex = -1;
            let index1 = -1;
            let index2 = -1;
            let wCount = 0;
            for(let i = 0; i < pokers.length; ++i){
                if(this.getPokerNumByPoker(pokers[i]) > 14){
                    wIndex = i;
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }

            if(wIndex > -1 && wCount != 2){
                let isTH = this.getPokerTypeByPoker(pokers[index1]) == this.getPokerTypeByPoker(pokers[index2]);
                if(isTH){
                    return false;
                }
                if(this.getPokerNumByPoker(pokers[index1]) == 1){
                    if(this.getPokerNumByPoker(pokers[index2])== 13 || this.getPokerNumByPoker(pokers[index2])== 12){
                        return true;
                    }
                }else if(this.getPokerNumByPoker(pokers[index2]) == 1){
                    if(this.getPokerNumByPoker(pokers[index1])== 13 || this.getPokerNumByPoker(pokers[index1])== 12){
                        return true;
                    }
                }
                let diff = this.getPokerNumByPoker(pokers[index1]) - this.getPokerNumByPoker(pokers[index2]);
                if(Math.abs(diff) <= 2 && Math.abs(diff) > 0){
                    return true;
                }
            }
        }

        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            this.sortSelectedNumPokers(temp);
            if(this.getPokerNumByPoker(temp[2]) == 1)
            {
                if((this.getPokerNumByPoker(temp[0]) == 13 &&
                    this.getPokerNumByPoker(temp[1]) == 12) 
                    ||
                    (this.getPokerNumByPoker(temp[0]) == 3 &&
                    this.getPokerNumByPoker(temp[1]) == 2))
                {
                    return true;
                }
                if((this.getPokerNumByPoker(temp[0]) > 14 &&
                    this.getPokerNumByPoker(temp[1]) == 12) 
                    ||
                    (this.getPokerNumByPoker(temp[0]) > 14 &&
                    this.getPokerNumByPoker(temp[1]) == 13))
                {
                    return true;
                }
                if((this.getPokerNumByPoker(temp[0]) > 14 &&
                    this.getPokerNumByPoker(temp[1]) == 2) 
                    ||
                    (this.getPokerNumByPoker(temp[0]) > 14 &&
                    this.getPokerNumByPoker(temp[1]) == 3))
                {
                    return true;
                }
            } else
            {
                if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])+1 &&
                    this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])+2
                )
                {
                    return true;
                }
                let diff = this.getPokerNumByPoker(temp[1]) - this.getPokerNumByPoker(temp[2]);
                if(this.getPokerNumByPoker(temp[0]) > 14 && Math.abs(diff) <= 2 && Math.abs(diff) > 0){
                    return true;
                }
                if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) > 14){
                    return true;
                }
            }
        }
        return false;
    },


    /**
     * 同花顺
     * @param pokers
     * @returns {Array}
     */
    isHasTonghuashun:function(pokers)
    {
        if(pokers.length < 3)
        {
            return false;
        }
        //当三张牌的时候,若不是王的两张牌的差值小于等于2且同花,则有同花顺.
        if(pokers.length == 3){
            let wCount = 0;
            let wIndex = -1;
            let index1 = -1;
            let index2 = -1;
            for(let i = 0; i < pokers.length; ++i){
                if(this.getPokerNumByPoker(pokers[i]) > 14){
                    wIndex = i;
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            if(wCount == 2){
                return true;
            }else if(wIndex > -1){
                let isTH = this.getPokerTypeByPoker(pokers[index1]) == this.getPokerTypeByPoker(pokers[index2]);
                if(!isTH){
                    return false;
                }
                if(this.getPokerNumByPoker(pokers[index1]) == 1){
                    if(this.getPokerNumByPoker(pokers[index2])== 13 || this.getPokerNumByPoker(pokers[index2])== 12){
                        return true;
                    }
                }else if(this.getPokerNumByPoker(pokers[index2]) == 1){
                    if(this.getPokerNumByPoker(pokers[index1])== 13 || this.getPokerNumByPoker(pokers[index1])== 12){
                        return true;
                    }
                }
                let diff = this.getPokerNumByPoker(pokers[index1]) - this.getPokerNumByPoker(pokers[index2]);
                if(Math.abs(diff) <= 2 && Math.abs(diff) > 0){
                    return true;
                }
            }
        }

        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            this.sortSelectedNumPokers(temp);
            if((this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[1]) && this.getPokerTypeByPoker(temp[0]) == this.getPokerTypeByPoker(temp[2])) 
                || ((this.getPokerNumByPoker(temp[0]) > 14) && this.getPokerTypeByPoker(temp[1]) == this.getPokerTypeByPoker(temp[2]))
                || ((this.getPokerNumByPoker(temp[0]) > 14) && this.getPokerNumByPoker(temp[1]) > 14))
            {
                if(this.getPokerNumByPoker(temp[2]) == 1)
                {
                    if((this.getPokerNumByPoker(temp[0]) == 13 &&
                        this.getPokerNumByPoker(temp[1]) == 12) 
                        ||
                        (this.getPokerNumByPoker(temp[0]) == 3 &&
                        this.getPokerNumByPoker(temp[1]) == 2))
                    {
                        return true;
                    }
                    if((this.getPokerNumByPoker(temp[0]) > 14 &&
                        this.getPokerNumByPoker(temp[1]) == 12) 
                        ||
                        (this.getPokerNumByPoker(temp[0]) > 14 &&
                        this.getPokerNumByPoker(temp[1]) == 13))
                    {
                        return true;
                    }
                    if((this.getPokerNumByPoker(temp[0]) > 14 &&
                        this.getPokerNumByPoker(temp[1]) == 2) 
                        ||
                        (this.getPokerNumByPoker(temp[0]) > 14 &&
                        this.getPokerNumByPoker(temp[1]) == 3))
                    {
                        return true;
                    }
                } else
                {
                    if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])+1 &&
                        this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])+2
                    )
                    {
                        return true;
                    }
                    let diff = this.getPokerNumByPoker(temp[1]) - this.getPokerNumByPoker(temp[2]);
                    if(this.getPokerNumByPoker(temp[0]) > 14 && Math.abs(diff) <= 2 && Math.abs(diff) > 0){
                        return true;
                    }
                    if(this.getPokerNumByPoker(temp[0]) > 14 && this.getPokerNumByPoker(temp[1]) > 14){
                        return true;
                    }
                }
            }
        }
        return false;
    },


    /**
     * 判断两个乌龙的大小
     * @param poker1
     * @param poker2
     */
    judgeWulong:function(pokers1P,pokers2P,wIndex1,wIndex2)
    {
        //将牌组拷贝,这样牌组重新排序不会影响原牌组
        let pokers1 = [];
        let pokers2 = [];
        for(let i = 0; i < pokers1P.length; ++i){
            pokers1[i] = pokers1P[i]
        }
        for(let i = 0; i < pokers2P.length; ++i){
            pokers2[i] = pokers2P[i]
        }
        //若牌组出现 12 1 13/ 13 1 12/ 2 1 3 / 3 1 2的顺子 则将它们重新排序
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);
        
        let length1 = pokers1.length;
        let length2 = pokers2.length;
        let length = length1 < length2?length1:length2;
        let wwIndex1 = 0;
        let wwIndex2 = 0;
        
        //wIndex1,wIndex2的值如果不为-1,则代表对应的pokers1,pokers2里有王,并记录王的索引
        //如果wIndex1为空时,wwIndex1为-1
        if(wIndex1 != 0){
            wwIndex1 = wIndex1 || -1;
        }
        //如果wIndex2为空时,wwIndex2为-1
        if(wIndex2 != 0){
            wwIndex2 = wIndex2 || -1;
        }

        //如果牌组里带王,则将王的索引加1
        if(wwIndex1 != -1){
            wwIndex1++;
        }
        if(wwIndex2 != -1){
            wwIndex2++;
        }

        //按顺序一张一张的比数字大小
        for(let i = 0;i < length;i++)
        {
            let tempPoker1 = pokers1[i];
            let tempPoker2 = pokers2[i];
            if(this.getPokerNumByPoker(tempPoker1) != this.getPokerNumByPoker(tempPoker2))
            {
                return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            }
        }
        
        //都相同，比第一个
        let tempPoker1 = pokers1[0];
        let tempPoker2 = pokers2[0];
        // //都相同,且不同时有王
        // if(!(wwIndex1 != -1 && wIndex2 != -1)){
        //     //都相同,有王的小
        //     if(wwIndex1 > -1){
        //         return false;
        //     }
        //     if(wwIndex2 > -1){
        //         return true;
        //     }
        // }else{
        //     //都有王的时候,第一张都是王,比第二个
        //     if(wwIndex1==1){
        //         tempPoker1 = pokers1P[1];
        //     }
        //     if(wwIndex2 == 1){
        //         tempPoker2 = pokers2P[1];
        //     }
        // }
        return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    },



    changeTempByWang : function (wIndex1,w1,pokers1) {
        if(wIndex1 > -1){
            pokers1[wIndex1] = w1;
        }
    },

    /**
     * 判断对子
     * @param pokers1
     * @param pokers2
     */
    judgeDuizi:function(pokers1,pokers2)
    {
        let tempPokerArr1 = [];
        let sanPokerArr1 = [];
        let tempPokerArr2 = [];
        let sanPokerArr2 = [];

        

        if(this.getPokerNumByPoker(pokers1[0]) > 14 && this.getPokerNumByPoker(pokers1[1]) > 14){
            return true;
        }
        if(this.getPokerNumByPoker(pokers2[0]) > 14 && this.getPokerNumByPoker(pokers2[1]) > 14){
            return false;
        }

        let wIndex1 = -1;
        let w1;
        let maxIndex = -1;
        for (let i = 0; i < pokers1.length; ++i) {
            if(this.getPokerNumByPoker(pokers1[i]) > 14){
                wIndex1 = i;
            }
        }

        if(wIndex1 > -1 && pokers1.length >= 2){
            
            if(wIndex1 != 0){
                 maxIndex = 0;
            }else{
                maxIndex = 1;
            }
            
            for(let i = maxIndex + 1; i < pokers1.length; ++i){
                if(i != wIndex1){
                    if(this.getPokerWeightByPoker(pokers1[i]) > this.getPokerWeightByPoker(pokers1[maxIndex])){
                        maxIndex = i;
                    }
                }
            }
            let num = this.getPokerNumByPoker(pokers1[maxIndex]);
            let type = 5;
            let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
            let pokerController = pokerPrefab.getComponent("sss4Poker");
            let d = {data:{0:num,1:type}};
            pokerController.init(SssManager.pokersAtlas,d);
            w1 = pokers1[wIndex1];
            pokers1[wIndex1] = pokerPrefab;
        }

        let wIndex2 = -1;
        let w2;
        maxIndex = -1;
        for (let i = 0; i < pokers2.length; ++i) {
            if(this.getPokerNumByPoker(pokers2[i]) > 14){
                wIndex2 = i;
            }
        }
        if(wIndex2 > -1 && pokers2.length >= 2){
            if(wIndex2 != 0){
                 maxIndex = 0;
            }else{
                maxIndex = 1;
            }
            
            for(let i = maxIndex + 1; i < pokers2.length; ++i){
                if(i != wIndex2){
                    if(this.getPokerWeightByPoker(pokers2[i]) > this.getPokerWeightByPoker(pokers2[maxIndex])){
                        maxIndex = i;
                    }
                }
            }
            let num = this.getPokerNumByPoker(pokers2[maxIndex]);
            let type = 5;
            let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
            let pokerController = pokerPrefab.getComponent("sss4Poker");
            let d = {data:{0:num,1:type}};
            pokerController.init(SssManager.pokersAtlas,d);
            w2 = pokers2[wIndex2];
            pokers2[wIndex2] = pokerPrefab;
        }

        let prePoker;
        let flag = false;
        for(let i = 0;i < pokers1.length;i++)
        {
            prePoker = pokers1[i];
            for(let j = i+1;j <pokers1.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers1[j])){
                    if(tempPokerArr1.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr1.push(prePoker);
                        tempPokerArr1.push(pokers1[j]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }

        //获取散牌
        for(let i = 0;i < pokers1.length;i++)
        {
            if(!(pokers1[i] == tempPokerArr1[0] || pokers1[i] == tempPokerArr1[1]))
            {
                sanPokerArr1.push(pokers1[i]);
            }
        }

        flag = false;
        for(let i = 0;i < pokers2.length;i++)
        {
            prePoker = pokers2[i];
            for(let j = i+1;j <pokers2.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers2[j])){
                    if(tempPokerArr2.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr2.push(prePoker);
                        tempPokerArr2.push(pokers2[j]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }


        //获取散牌
        for(let i = 0;i < pokers2.length;i++)
        {
            if(!(pokers2[i] == tempPokerArr2[0] || pokers2[i] == tempPokerArr2[1]))
            {
                sanPokerArr2.push(pokers2[i]);
            }
        }

        let result;

        this.sortPokers(tempPokerArr1);
        this.sortPokers(tempPokerArr2);

        let tTempPokerArr1 = [];
        let tTempPokerArr2 = [];

        for(let i = 0; i < tempPokerArr1.length;++i){
            tTempPokerArr1[i] = tempPokerArr1[i];
        }

        for(let i = 0; i < tempPokerArr2.length;++i){
            tTempPokerArr2[i] = tempPokerArr2[i];
        }

        if(this.getPokerNumByPoker(tempPokerArr1[0]) == this.getPokerNumByPoker(tempPokerArr2[0]))
        {

            if(pokers1.length != pokers2.length){
                this.changeTempByWang(wIndex1,w1,pokers1);
                this.changeTempByWang(wIndex2,w2,pokers2);
                return this.getPokerWeightByPoker(tTempPokerArr1[0]) > this.getPokerWeightByPoker(tTempPokerArr2[0]);
                // if(!(wIndex1 > -1 && wIndex2 > -1)) {
                //     if(wIndex1 > -1){
                //         this.changeTempByWang(wIndex1,w1,pokers1);
                //         this.changeTempByWang(wIndex2,w2,pokers2);
                //         return false;
                //     }
                //     if(wIndex2 > -1){
                //         this.changeTempByWang(wIndex1,w1,pokers1);
                //         this.changeTempByWang(wIndex2,w2,pokers2);
                //         return true;
                //     }
                // }else{
                //     let temp1 = pokers1[0];
                //     let temp2 = pokers2[0];
                //     if(wIndex1 == 0){
                //         temp1 = pokers1[1];
                //     }
                //     if(wIndex2 == 0){
                //         temp2 = pokers2[1];
                //     }
                //     //比较散牌
                //     this.changeTempByWang(wIndex1,w1,pokers1);
                //     this.changeTempByWang(wIndex2,w2,pokers2);
                //     return this.getPokerWeightByPoker(temp1) > this.getPokerWeightByPoker(temp2);
                // }    
                // this.changeTempByWang(wIndex1,w1,pokers1);
                // this.changeTempByWang(wIndex2,w2,pokers2);
                // return pokers1.length > pokers2.length;
            }
            if(!(wIndex1 > -1 && wIndex2 > -1)) {
                if(wIndex1 > -1){
                    this.changeTempByWang(wIndex1,w1,pokers1);
                    this.changeTempByWang(wIndex2,w2,pokers2);
                    return false;
                }
                if(wIndex2 > -1){
                    this.changeTempByWang(wIndex1,w1,pokers1);
                    this.changeTempByWang(wIndex2,w2,pokers2);
                    return true;
                }
            }else{
                let temp1 = pokers1[0];
                let temp2 = pokers2[0];
                if(wIndex1 == 0){
                    temp1 = pokers1[1];
                }
                if(wIndex2 == 0){
                    temp2 = pokers2[1];
                }
                //比较散牌
                this.changeTempByWang(wIndex1,w1,pokers1);
                this.changeTempByWang(wIndex2,w2,pokers2);
                return this.getPokerWeightByPoker(temp1) > this.getPokerWeightByPoker(temp2);
            }
            let sanLength = sanPokerArr1.length < sanPokerArr2.length ? sanPokerArr1.length:sanPokerArr2.length;
            for(let i = 0;i < sanLength;i++)
            {
                if(this.getPokerWeightByPoker(sanPokerArr1[i]) == this.getPokerWeightByPoker(sanPokerArr2[i]))
                {
                }else
                {
                    //比较散牌
                    this.changeTempByWang(wIndex1,w1,pokers1);
                    this.changeTempByWang(wIndex2,w2,pokers2);
                    return this.getPokerWeightByPoker(sanPokerArr1[i]) > this.getPokerWeightByPoker(sanPokerArr2[i]);
                }
            }
            //都想相同，比较散排第一张
            if(sanLength == 0){
                if(!(wIndex1 > -1 && wIndex2 > -1)) {
                    if(wIndex1 > -1){
                        return false;
                    }
                    if(wIndex2 > -1){
                        return true;
                    }
                }
                this.changeTempByWang(wIndex1,w1,pokers1);
                this.changeTempByWang(wIndex2,w2,pokers2);
                return this.getPokerWeightByPoker(tempPokerArr1[0]) > this.getPokerWeightByPoker(tempPokerArr2[0]);
            }
            this.changeTempByWang(wIndex1,w1,pokers1);
            this.changeTempByWang(wIndex2,w2,pokers2);
            return this.getPokerWeightByPoker(sanPokerArr1[0]) > this.getPokerWeightByPoker(sanPokerArr2[0]);
        }else {
            this.changeTempByWang(wIndex1,w1,pokers1);
            this.changeTempByWang(wIndex2,w2,pokers2);
            return this.getPokerWeightByPoker(tempPokerArr1[0]) > this.getPokerWeightByPoker(tempPokerArr2[0]);
        }

        //比花色
        for(let i = 0;i < 3;i++)
        {
            this.changeTempByWang(wIndex1,w1,pokers1);
            this.changeTempByWang(wIndex2,w2,pokers2);
            return this.getPokerWeightByPoker(pokers1[i]) > this.getPokerWeightByPoker(pokers1[i]);
        }

    },


    /**
     * 判断三条和铁支
     * @param pokers1
     * @param pokers2
     * @returns {boolean}
     */
    judgeSantiaoTiezhi:function(pokers1P,pokers2P)
    {
        let pokers1 = pokers1P;
        let pokers2 = pokers2P;
        let tempPoker1;
        let tempPoker2;

        let wIndex1 = -1;
        for (let i = 0; i < pokers1.length; ++i) {
            if(this.getPokerNumByPoker(pokers1[i]) > 14){
                wIndex1 = i;
            }
        }

        let wIndex2 = -1;
        for (let i = 0; i < pokers2.length; ++i) {
            if(this.getPokerNumByPoker(pokers2[i]) > 14){
                wIndex2 = i;
            }
        }

        let prePoker;
        let flag = false;
        for(let i = 0;i < pokers1.length;i++)
        {
            prePoker = pokers1[i];
            for(let j = i+1;j <pokers1.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers1[j])){
                    tempPoker1 = prePoker;
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }

        flag = false;
        for(let i = 0;i < pokers2.length;i++)
        {
            prePoker = pokers2[i];
            for(let j = i+1;j <pokers2.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(pokers2[j])){
                    tempPoker2 = prePoker;
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }
        if(this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2)){
            if (wIndex1 > -1 && wIndex2 > -1) {
                return 10;
            }
            if(wIndex1 > -1){
                return false;
            }
            if(wIndex2 > -1){
                return true;
            }
        }
        return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    },

    /**
     *
     *  判断三条大小
     * @param pokers1
     * @param pokers2
     */
    judgeSantiao:function(pokers1,pokers2)
    {
        return this.judgeSantiaoTiezhi(pokers1,pokers2);
    },


    /**
     * 判断顺子大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeShunzi:function(pokers1,pokers2)
    {
        let wIndex1 = -1;
        let w1;
        let index1 = -1;
        let index2 = -1;
        if(pokers1.length == 3){
            for(let i = 0; i < pokers1.length; ++i){
                if(this.getPokerNumByPoker(pokers1[i]) > 14){
                    wIndex1 = i;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            let num;
            let type = 5;
            let maxIndex;
            if(wIndex1 > -1){
                if(this.getPokerNumByPoker(pokers1[index1]) == 3 && this.getPokerNumByPoker(pokers1[index2]) == 2){
                    let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                    let pokerController = pokerPrefab.getComponent("sss4Poker");
                    let d = {data:{0:1,1:type}};
                    pokerController.init(SssManager.pokersAtlas,d);
                    w1 =  pokers1[wIndex1];
                    pokers1[wIndex1] = pokerPrefab;
                }else{
                    if(this.getPokerNumByPoker(pokers1[index1]) == 1){
                        if(this.getPokerNumByPoker(pokers1[index2]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers1[index2]) == 12){
                            num = 13;
                        } 
                    }
                    if(this.getPokerNumByPoker(pokers1[index2]) == 1){
                        if(this.getPokerNumByPoker(pokers1[index1]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers1[index1]) == 12){
                            num = 13;
                        } 
                    }
                    let diff = this.getPokerNumByPoker(pokers1[index1]) - this.getPokerNumByPoker(pokers1[index2]);
                    let isTH = this.getPokerTypeByPoker(pokers1[index1]) == this.getPokerTypeByPoker(pokers1[index2]);
                    if(Math.abs(diff) == 1){
                        if(diff == 1){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers1[maxIndex]) + 1;
                    }else  if(Math.abs(diff) == 2){
                        if(diff == 2){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers1[maxIndex]) - 1;
                    }
                    if(isTH){
                        type = this.getPokerTypeByPoker(pokers1[index1]);
                    }
                    let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                    let pokerController = pokerPrefab.getComponent("sss4Poker");
                    if(num == 14){
                        num = 1
                    }
                    let d = {data:{0:num,1:type}};
                    pokerController.init(SssManager.pokersAtlas,d);
                    w1 =  pokers1[wIndex1];
                    pokers1[wIndex1] = pokerPrefab;
                }
            }
        }
        
        let wIndex2 = -1;
        let w2;
        index1 = -1;
        index2 = -1;
        if(pokers2.length == 3){
            for(let i = 0; i < pokers2.length; ++i){
                if(this.getPokerNumByPoker(pokers2[i]) > 14){
                    wIndex2 = i;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            let num;
            let type = 5;
            let maxIndex;
            if(wIndex2 > -1){
                if(this.getPokerNumByPoker(pokers2[index1]) == 3 && this.getPokerNumByPoker(pokers2[index2]) == 2){
                    let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                    let pokerController = pokerPrefab.getComponent("sss4Poker");
                    let d = {data:{0:1,1:type}};
                    pokerController.init(SssManager.pokersAtlas,d);
                    w2 =  pokers2[wIndex2];
                    pokers2[wIndex2] = pokerPrefab;
                }else{
                    if(this.getPokerNumByPoker(pokers2[index1]) == 1){
                        if(this.getPokerNumByPoker(pokers2[index2]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers2[index2]) == 12){
                            num = 13;
                        } 
                    }
                    if(this.getPokerNumByPoker(pokers2[index2]) == 1){
                        if(this.getPokerNumByPoker(pokers2[index1]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers2[index1]) == 12){
                            num = 13;
                        } 
                    }
                    let diff = this.getPokerNumByPoker(pokers2[index1]) - this.getPokerNumByPoker(pokers2[index2]);
                    let isTH = this.getPokerTypeByPoker(pokers2[index1]) == this.getPokerTypeByPoker(pokers2[index2]);
                    if(Math.abs(diff) == 1){
                        if(diff == 1){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers2[maxIndex]) + 1;
                    }else  if(Math.abs(diff) == 2){
                        if(diff == 2){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers2[maxIndex]) - 1;
                    }
                    if(isTH){
                        type = this.getPokerTypeByPoker(pokers2[index1]);
                    }
                    let pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
                    let pokerController = pokerPrefab.getComponent("sss4Poker");
                    if(num == 14){
                        num = 1
                    }
                    let d = {data:{0:num,1:type}};
                    pokerController.init(SssManager.pokersAtlas,d);
                    w2 = pokers2[wIndex2];
                    pokers2[wIndex2] = pokerPrefab;
                }
            }
        }
        let result = this.judgeWulong(pokers1,pokers2,wIndex1,wIndex2);
        this.changeTempByWang(wIndex1,w1,pokers1);
        this.changeTempByWang(wIndex2,w2,pokers2);
        return result;
        // let tempPoker1 = pokers1[0];
        // let tempPoker2 = pokers2[0];
        //
        // //A 5 4 3 2
        // if(this.getPokerNumByPoker(pokers1[0]) == 1 && this.getPokerNumByPoker(pokers1[1]) == 5)
        // {
        //     tempPoker1 =this.getPokerNumByPoker(pokers1[1]);
        // }
        //
        // //A 5 4 3 2
        // if(this.getPokerNumByPoker(pokers2[0]) == 1 && this.getPokerNumByPoker(pokers2[1]) == 5)
        // {
        //     tempPoker2 =this.getPokerNumByPoker(pokers2[1]);
        // }
        //
        // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    },


    createTempForWang : function (num,type,index,pokers) {
        let w1;
        let pokerPrefab1 = cc.instantiate(SssManager.pokerPrefab);
        let pokerController1 = pokerPrefab1.getComponent("sss4Poker");
        let d = {data:{0:num,1:type}};
        pokerController1.init(SssManager.pokersAtlas,d);
        w1 =  pokers[index];
        pokers[index] = pokerPrefab1;
        return w1;
    },

    /**
     * 判断同花顺大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeTonghuashun:function(pokers1,pokers2)
    {
        
        let index1 = -1;
        let index2 = -1;

        let wIndex1 = -1;
        let wIndex11 = -1;
        let w1,w11;
        let wCount = 0;
        if(pokers1.length == 3){
            for(let i = 0; i < pokers1.length; ++i){
                if(this.getPokerNumByPoker(pokers1[i]) > 14){
                    if(wIndex1 == -1){
                        wIndex1 = i;
                    }else{
                        wIndex11 = i;
                    }
                    wCount++;
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            let num;
            let type = 5;
            let maxIndex;
            if(wCount == 2){
                
                type = this.getPokerTypeByPoker(pokers1[index1]);
                if(this.getPokerNumByPoker(pokers1[index1]) == 1){

                    w1 = this.createTempForWang(13,type,wIndex1,pokers1);
                    w11 =  this.createTempForWang(12,type,wIndex11,pokers1);

                }else if(this.getPokerNumByPoker(pokers1[index1]) == 13){

                    w1 = this.createTempForWang(1,type,wIndex1,pokers1);
                    w11 =  this.createTempForWang(12,type,wIndex11,pokers1);

                }else if(this.getPokerNumByPoker(pokers1[index1]) == 2){

                    w1 = this.createTempForWang(1,type,wIndex1,pokers1);
                    w11 =  this.createTempForWang(3,type,wIndex11,pokers1);

                }else if(this.getPokerNumByPoker(pokers1[index1]) == 3){

                    w1 = this.createTempForWang(1,type,wIndex1,pokers1);
                    w11 =  this.createTempForWang(2,type,wIndex11,pokers1);

                }else {
                    let tNum = this.getPokerNumByPoker(pokers1[index1]);

                    w1 = this.createTempForWang(tNum+1,type,wIndex1,pokers1);
                    w11 =  this.createTempForWang(tNum+2,type,wIndex11,pokers1);
                }
            }else if(wIndex1 > -1){
                if(this.getPokerNumByPoker(pokers1[index1]) == 3 && this.getPokerNumByPoker(pokers1[index2]) == 2){

                    type = this.getPokerTypeByPoker(pokers1[index1]);
                    w1 = this.createTempForWang(1,type,wIndex1,pokers1);

                }else{
                    if(this.getPokerNumByPoker(pokers1[index1]) == 1){
                        if(this.getPokerNumByPoker(pokers1[index2]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers1[index2]) == 12){
                            num = 13;
                        } 
                    }
                    if(this.getPokerNumByPoker(pokers1[index2]) == 1){
                        if(this.getPokerNumByPoker(pokers1[index1]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers1[index1]) == 12){
                            num = 13;
                        } 
                    }
                    let diff = this.getPokerNumByPoker(pokers1[index1]) - this.getPokerNumByPoker(pokers1[index2]);
                    let isTH = this.getPokerTypeByPoker(pokers1[index1]) == this.getPokerTypeByPoker(pokers1[index2]);
                    if(Math.abs(diff) == 1){
                        if(diff == 1){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers1[maxIndex]) + 1;
                    }else  if(Math.abs(diff) == 2){
                        if(diff == 2){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers1[maxIndex]) - 1;
                    }
                    if(isTH){
                        type = this.getPokerTypeByPoker(pokers1[index1]);
                    }
                    if(num == 14){
                        num = 1
                    }
                    w1 = this.createTempForWang(num,type,wIndex1,pokers1);
                }
            }
        }
        
        let wIndex2 = -1;
        let wIndex22 = -1;
        let w2,w22;
        index1 = -1;
        index2 = -1;
        let wCount2 = 0;
        if(pokers2.length == 3){
            for(let i = 0; i < pokers2.length; ++i){
                if(this.getPokerNumByPoker(pokers2[i]) > 14){
                    if(wIndex2 == -1){
                        wIndex2 = i;
                    }else{
                        wIndex22 = i;
                    }
                    wCount2++
                }else if(index1 == -1){
                    index1 = i;
                }else{
                    index2 = i;
                }
            }
            let num;
            let type = 5;
            let maxIndex;
            //手上有两个王的情况
            if(wCount2 == 2){
                type = this.getPokerTypeByPoker(pokers2[index1]);
                if(this.getPokerNumByPoker(pokers2[index1]) == 1){

                    w2 = this.createTempForWang(13,type,wIndex2,pokers2);
                    w22 = this.createTempForWang(12,type,wIndex22,pokers2);

                }else if(this.getPokerNumByPoker(pokers2[index1]) == 13){

                    w2 = this.createTempForWang(1,type,wIndex2,pokers2);
                    w22 = this.createTempForWang(12,type,wIndex22,pokers2);

                }else if(this.getPokerNumByPoker(pokers2[index1]) == 2){

                    w2 = this.createTempForWang(1,type,wIndex2,pokers2);
                    w22 = this.createTempForWang(3,type,wIndex22,pokers2);

                }else if(this.getPokerNumByPoker(pokers2[index1]) == 3){

                    w2 = this.createTempForWang(1,type,wIndex2,pokers2);
                    w22 = this.createTempForWang(2,type,wIndex22,pokers2);

                }else {
                    let tNum = this.getPokerNumByPoker(pokers2[index1]);
                    w2 = this.createTempForWang(tNum+1,type,wIndex2,pokers2);
                    w22 = this.createTempForWang(tNum+2,type,wIndex22,pokers2);
                }
            }else if(wIndex2 > -1){
                if(this.getPokerNumByPoker(pokers2[index1]) == 3 && this.getPokerNumByPoker(pokers2[index2]) == 2){
                    type = this.getPokerTypeByPoker(pokers2[index1]);
                    w2 = this.createTempForWang(1,type,wIndex2,pokers2);
                }else{
                    if(this.getPokerNumByPoker(pokers2[index1]) == 1){
                        if(this.getPokerNumByPoker(pokers2[index2]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers2[index2]) == 12){
                            num = 13;
                        } 
                    }
                    if(this.getPokerNumByPoker(pokers2[index2]) == 1){
                        if(this.getPokerNumByPoker(pokers2[index1]) == 13){
                            num = 12;
                        }else if(this.getPokerNumByPoker(pokers2[index1]) == 12){
                            num = 13;
                        } 
                    }
                    let diff = this.getPokerNumByPoker(pokers2[index1]) - this.getPokerNumByPoker(pokers2[index2]);
                    let isTH = this.getPokerTypeByPoker(pokers2[index1]) == this.getPokerTypeByPoker(pokers2[index2]);
                    if(Math.abs(diff) == 1){
                        if(diff == 1){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers2[maxIndex]) + 1;
                    }else  if(Math.abs(diff) == 2){
                        if(diff == 2){
                            maxIndex = index1;
                        }else{
                            maxIndex = index2;
                        }
                        num = this.getPokerNumByPoker(pokers2[maxIndex]) - 1;
                    }
                    if(isTH){
                        type = this.getPokerTypeByPoker(pokers2[index1]);
                    }
                    if(num == 14){
                        num = 1
                    }
                    w2 = this.createTempForWang(num,type,wIndex2,pokers2);
                }
            }
        }
        // let tempPoker1 = pokers1[0];
        // let tempPoker2 = pokers2[0];
        // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
        let result = this.judgeWulong(pokers1,pokers2,wIndex1,wIndex2);
        if(wCount == 2){
            this.changeTempByWang(wIndex11,w11,pokers1);
        }
        if(wCount2 == 2){
            this.changeTempByWang(wIndex22,w22,pokers2);
        }
        this.changeTempByWang(wIndex1,w1,pokers1);
        this.changeTempByWang(wIndex2,w2,pokers2);
        return result;
    },

    /**
     *  判断两组相同牌型组合的大小
     * @param pokersWeight
     * @param pokers1
     * @param pokers2
     */
    judgeWeightByPokersWeight:function(pokersWeight,pokers1,pokers2)
    {
        let ret = false;
        if(pokersWeight == 0)
        {
            ret = this.judgeWulong(pokers1,pokers2)
        }else if(pokersWeight == 1)
        {
            ret = this.judgeDuizi(pokers1,pokers2)
        }else if(pokersWeight == 2)
        {
            ret = this.judgeShunzi(pokers1,pokers2)
        }else if(pokersWeight == 3)
        {
            ret = this.judgeSantiao(pokers1,pokers2)
        }else if(pokersWeight == 4)
        {
            ret = this.judgeTonghuashun(pokers1,pokers2)
        }
        return ret;
    },

    /**
     * 获取散牌
     * @param except
     */
    getSanpai:function(pokers,except)
    {
        let ret = [];
        let obj = {};
        // if(except!=null)
        for(let i = 0;i < pokers.length;i++)
        {
            let poker = pokers[i];
            if(except != null)
            {
                let flag = false;
                for(let j = 0;j < except.length;j++)
                {
                    if(poker == except[j])
                    {
                        flag = true;
                        break;
                    }
                }

                if(flag)
                {
                    continue;
                }
            }

            let num = this.getPokerNumByPoker(poker);
            if(obj["p_" + num] == null)
            {
                obj["p_" + num] = [];
            }
            obj["p_" + num].push(poker);
        }

        for(let num  = 2;num < 14 ;num++)
        {
            if(obj["p_" + num] != null && obj["p_" + num].length == 1)
            {
                ret.push(obj["p_" + num][0]);
            }
        }

        //A 牌
        let num = 1;
        if(obj["p_" + num] != null && obj["p_" + num].length == 1)
        {
            ret.push(obj["p_" + num][0]);
        }

        return ret;
    },


    /**
     * 获取剩余牌的组合
     * @param except
     */
    getRemainDuizi:function(pokers,except)
    {
        let ret = [];
        let obj = {};
        // if(except!=null)
        for(let i = 0;i < pokers.length;i++)
        {
            let poker = pokers[i];
            if(except != null)
            {
                let flag = false;
                for(let j = 0;j < except.length;j++)
                {
                    if(poker == except[j])
                    {
                        flag = true;
                        break;
                    }
                }

                if(flag)
                {
                    continue;
                }
            }

            let num = this.getPokerNumByPoker(poker);
            if(obj["p_" + num] == null)
            {
                obj["p_" + num] = [];
            }
            obj["p_" + num].push(poker);
        }

        for(let targetNum = 2;targetNum <= 4;targetNum++)
        {
            //对子start
            for(let num  = 2;num < 14 ;num++)
            {
                if(obj["p_" + num] != null && obj["p_" + num].length == targetNum)
                {
                    ret.push([obj["p_" + num][0],obj["p_" + num][1]]);
                }
            }

            let num = 1;
            if(obj["p_" + num] != null && obj["p_" + num].length == targetNum)
            {
                ret.push([obj["p_" + num][0],obj["p_" + num][1]]);
            }

            //如果有对子，就不用去拆分了
            if(targetNum == 2 && ret.length > 0)
            {
                break;
            }else if(targetNum == 3 && ret.length > 0)
            {
                break;
            }
            //对子end
        }
        return ret;
    },
});
