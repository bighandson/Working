
const config = require('Config');
const ACTION_CODE  = {
    AC_GET : 0,                          // 摸牌
    AC_SUPPLY_FLOWER : 1,                // 补牌
    AC_OUT : 2,                          // 出牌
    AC_EAT : 3,                         // 吃
    AC_HIT : 4,                         // 碰
    AC_BAR : 5,                         // 碰杠 补杠
    AC_ANBAR : 6,                       // 暗杠
    AC_HU  : 7,                          // 胡
    AC_SUPBAR : 8                         //补的牌
};

const ActionType = {
    AT_UNKNOW : 0,    // 未知
    AT_AUTO : 1,      // 托管
    AT_HAND : 2,      // 手动
    AT_TIMEOUT : 3   // 超时
};

const MJCommand = require('MJCommand');
const OPT_CODE = MJCommand.OPT_CODE;
const EATFLAG = MJCommand.EATFLAG;

cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        this._step = 0;          // 步数
        this.isRecordPlaying = false;
        // for test
        // this.init(data);
    },

    // 初始化
    init : function (data,ruleFlag) {

        this.data = data;
        console.log(data);
        let myseat = 1;
        for(let i =0;i<data.users.length;i++){
            if(data.users[i].userid == UserCenter.getUserID()){
                myseat = i+1;
                break
            }
        }
        this.game = config.getGameById(this.data.gameid);
        this.node.addComponent(this.game.rule);
        var initparam = {
            outTimes : 15,
            EHBTimes : 15,
            roomType : 99,         // 复盘
            gameid   : this.game.gameid,
            basecode : 100,
            roomcode : '0',
            currGame : this.data.mxbc,
            totalGame: 4,
            ruleFlag : ruleFlag,
            myseatid : myseat
        }

        pomelo.emit('RCMD_initParam',initparam);
        this.initilize();
        //this.play();
        var self = this;
        cc.loader.loadRes('commonRes/Record/gamerecord',cc.Prefab,function (err,prefab) {
            if (err){
                cc.log('record_err:',err);
                return;
            }
            cc.log('record_success');
            let record = cc.instantiate(prefab);
            record.parent = self.node.parent;//cc.find('Canvas');
            record.setPosition(0,-200);
            self.recordController = record.getComponent('RecordController').getshuju(self,self.data);
            // self.recordController1 = record.children[1].getComponent('recordctrl').getshujus(self,self.data);
        });

        this.scheduleOnce(this.play,1.5);
    },

    play : function () {
        this.isRecordPlaying = true;
        this.RCMD_GameStart();
        this.RCMD_SetBD();
        this.RCMD_Distribute();
        this.schedule(this.playStep,1.0,cc.macro.REPEAT_FOREVER,4.0);
    },

    stop : function () {
        this.isRecordPlaying = false;
        this.unschedule(this.playStep);
    },
    pause : function () {
        this.isRecordPlaying = false;
        this.unschedule(this.nextStep);
    },
    resume : function () {
        this.isRecordPlaying = true;
        this.unschedule(this.lastStep);
        this.schedule(this.playStep,1.0);
    },
    quicklyNext : function () {
        this.unschedule(this.playStep);
        this.schedule(this.nextStep,0.3);
    },
    quicklyLast : function () {
        this.isRecordPlaying = false;
        this.schedule(this.lastStep,0.3);
    },
    lastStep : function () {
        if (this._step==0){
            return;
        }
        this._step--;
        this.RCMD_ActData(this._step);
    },
    nextStep : function () {
        this.RCMD_Action(this._step);
        this._step++;
    },
    playAct : function () {

    },

    initilize : function () {
        var seatid = 0;
        for(var i = 0; i < this.data.users.length; i++){
            var user = this.data.users[i];
            if(user.userid == UserCenter.getUserID()){
                seatid = i+1;
                break;
            }
        }

        if(!seatid){
            seatid = 1;
        }

        pomelo.emit('RCMD_TaskSeat',{
            tableid : 0,
            seatid  : seatid,
        });

        // 构造SitIn
        var users = [];
        for(var i = 0; i < this.data.users.length; i++){
            var user = this.data.users[i];
            var usr = {};
            usr.userid = user.userid;
            usr.nick = user.nick;
            usr.sex = 1;
            usr.userImage = '';
            usr.seatid = i+1;
            usr.tableid = 0;
            usr.money = 0;
            usr.score = 0;
            usr.state = 0;
            usr.status = 0;
            users.push(usr);
        }
        cc.log(users);
        pomelo.emit('RCMD_SitIn',{
            route : 'RCMD_SitIn',
            users : users
        });
    },

    playStep : function () {
        if(!this.isRecordPlaying) return;
        this.nextStep();
    },

    // 构造游戏开始
    RCMD_GameStart : function () {
        var masterDir = this.data.masterDir;
        var userid = this.data.users[masterDir].userid;
        pomelo.emit('RCMD_GameStart',{
            route        : 'RCMD_GameStart',
            userid       : userid,
            baseMoney    : 0,
            currentJushu : 0,
            currentFeng  : 0
        });
    },

    // 构造发牌
    RCMD_Distribute : function () {
        var users = [];
        for(var i = 0; i < this.data.users.length; i++){
            var usr = {};
            var user = this.data.users[i];
            usr.userid = user.userid;
            usr.paiCount = user.pc;
            usr.isVisible = 1;
            usr.pais = user.pais.slice(0);
            users.push(usr);
        }
        pomelo.emit('RCMD_Distribute',{
            route : 'RCMD_Distribute',
            head  : 0,
            tail  : 0,
            users : users
        });
    },

    /**
     * 构造数据恢复
     */
    /**
     * {
            "dir" : 0,
            "action" : 2,
            "lps" : 2,
            "pai1" : 32,
            "pai2" : 0,
            "pai3" : 0,
            "pai4" : 0,
        },
     * @param step
     */
    RCMD_Action : function (step) {
        if(step < 0 || step >= this.data.steps.length){
            cc.log('play end!!!');
            this.RCMD_Result();
            this.stop();
            return;
        }
        var stepData = this.data.steps[step];
        var userid = this.getUseridByDir(stepData.dir);
        var action = stepData.action;
        var sData = {
            route : 'RCMD_Action',
            userid : userid
        };
        sData.data = {};
        switch (action){
            case ACTION_CODE.AC_GET:          // 摸牌
                sData.opCode = OPT_CODE.optGet;
                sData.data.pai = stepData.pai1;
                break;
            case ACTION_CODE.AC_SUPPLY_FLOWER:      // 补花
                sData.opCode = OPT_CODE.optSupply;
                sData.data.pai = stepData.pai1;
                sData.data.fpai = stepData.pai2;
                break;
            case ACTION_CODE.AC_OUT:              // 出牌
                sData.opCode = OPT_CODE.optOut;
                sData.data.pai = stepData.pai1;
                sData.data.ipos = 0;
                break;
            case ACTION_CODE.AC_EAT:             // 吃
                sData.opCode = OPT_CODE.optEat;
                sData.data.paiA = stepData.pai1;
                sData.data.paiB = stepData.pai2;
                sData.data.dA = 0;
                sData.data.dB = 0;
                break;
            case ACTION_CODE.AC_HIT:            // 碰
                sData.opCode = OPT_CODE.optHit;
                sData.data.dA = stepData.pai1;
                sData.data.dB = stepData.pai2;
                break;
            case ACTION_CODE.AC_BAR:            // 碰杠
                var lastuserid = this.getStepUserid(step-1);
                sData.opCode = OPT_CODE.optBar;
                if(userid == lastuserid){
                    sData.data.style = 2;
                    sData.data.da = stepData.pai2;
                    sData.data.pai = stepData.pai1;
                    sData.route = 'RCMD_Action';
                    sData.userid = userid;
                    pomelo.emit('RCMD_Action',sData);
                }else{           //
                    sData.data.style = 0;
                    sData.data.da = stepData.pai2;
                    sData.data.db = stepData.pai3;
                    sData.data.dc = stepData.pai4;
                    pomelo.emit('RCMD_Action',sData);
                }


                return;
            case ACTION_CODE.AC_SUPBAR:       // 补牌
                sData.opCode = OPT_CODE.optGet;
                sData.data.pai = stepData.pai1;
                break;
            case ACTION_CODE.AC_ANBAR:        // 暗杠
                sData.opCode = OPT_CODE.optBar;
                sData.data.style = 1;
                sData.data.pai = stepData.pai1;
                sData.data.da = stepData.pai1;
                sData.data.db = stepData.pai2;
                sData.data.dc = stepData.pai3;
                sData.data.dd = stepData.pai4;
                pomelo.emit('RCMD_Action',sData);
                return;
            case ACTION_CODE.AC_HU:              //胡
                sData.opCode = OPT_CODE.optRecordHu;
                sData.data.pai = stepData.pai1;
                sData.data.dwhu = this.data.huFan;
                sData.data.hutype1 = this.data.hutype1;
                sData.data.hutype2 = this.data.hutype2;
                break;
            default:
                return;
        }
        pomelo.emit('RCMD_Action',sData);
    },

    // 构造设置财神
    RCMD_SetBD : function () {
        pomelo.emit('RCMD_SetBD',{
            route  : 'RCMD_SetBD',
            iBD    : this.data.iBD,
            iBDPos : 0
        });
    },

    /**
     * 构造结算
     */
    RCMD_Result : function () {
        if(this.data.huFan == 0){    // 流局
            //pomelo.emit('RCMD_');
            var data = {};
            data.route = 'RCMD_Action';
            data.opCode = OPT_CODE.optRecordHu;
            data.userid = 0;
            data.data = {};
            data.data.pai = 0;
            pomelo.emit('RCMD_Action',data);
            return;
        }

        var data = {};
        data.route = 'RCMD_Result';
        data.result = this.data.huFan;
        data.ibate = 0;
        data.users = [];
        for(var i = 0; i < this.data.users.length; i++){
            var usr = this.data.users[i];
            var user = {};
            user.userid = usr.userid;
            user.curwon = usr.score;
            user.fanShu = -1;//usr.dwhu;
            user.score = usr.score;
            user.money = 0;
            data.users.push(user);
        }

        pomelo.emit('RCMD_Result',data);
        // var lastStepData = this.data.steps[this.data.steps.length - 1];
        // if(lastStepData.action == ACTION_CODE.AC_GET){  // 自摸胡
        //
        // }else {  // 点炮胡
        //
        // }
    },

    // 构造数据恢复
    RCMD_ActData : function (step) {
        var actData = {};
        actData.nCircle = 0;
        actData.nOutCards = 0;
        actData.iBD = this.data.iBD;
        actData.iBDPos = 0;
        actData.masterid = this.getUseridByDir(this.data.masterDir);
        actData.activeid = this.getStepUserid(step);
        actData.head = 0;
        actData.tail = 0;
        actData.lastPai = 0;
        actData.lastPlayerid = this.getStepUserid(step-1);
        actData.lastPlayerid = actData.lastPlayerid != 0 ? actData.lastPlayerid : actData.activeid;
        actData.users = [];
        actData.route = 'RCMD_ActData';
        // 恢复用户数据
        var playerCount = this.data.users.length;
        for(var i = 0; i < playerCount; i++) {
            var actUser = {};
            var user = this.data.users[i];
            actUser.userid = user.userid;
            actUser.isVisible = true;
            actUser.pais = user.pais.slice(0);
            actUser.flowers = [];
            actUser.eats = [];
            actUser.outs = [];
            actData.users[i] = actUser;
        }
        for(i = 0; i < step; i++){
            var stepData = this.data.steps[i];
            var activeUser = actData.users[stepData.dir];
            switch (stepData.action){
                case ACTION_CODE.AC_GET:              // 摸牌
                    activeUser.pais.push(stepData.pai1);
                    break;
                case ACTION_CODE.AC_OUT:             // 出牌
                    activeUser.outs.push(stepData.pai1);
                    this.removePais(activeUser.pais,[stepData.pai1]);
                    actData.lastPai = stepData.pai1;
                    break;
                case ACTION_CODE.AC_EAT:            // 吃
                    var eatInfo = this.getEatInfo(this.lastPai,stepData.pai1,stepData.pai2);
                    var eatDir = this.getStepDir(i-1) + 1;
                    this.removePais(activeUser.pais,[stepData.pai1,stepData.pai2]);
                    activeUser.eats.push({
                        flag : eatInfo.flag,
                        pai : eatInfo.min,
                        eatDir : eatDir
                    });
                    this.lastPai = 0;
                    break;
                case ACTION_CODE.AC_HIT:            // 碰
                    var eatDir = this.getStepDir(i-1) + 1;
                    this.removePais(activeUser.pais,[this.lastPai,this.lastPai]);
                    activeUser.eats.push({
                        flag : EATFLAG.EAT_HIT,
                        pai  : actData.lastPai,
                        eatDir : eatDir
                    });
                    this.lastPai = 0;
                    break;
                case ACTION_CODE.AC_ANBAR:         // 暗杠
                    var pai = stepData.pai1;
                    this.removePais(activeUser.pais,[pai,pai,pai,pai]);
                    activeUser.eats.push({
                        flag    : EATFLAG.EAT_BAR_DRAK,
                        pai    : pai,
                        eatDir : stepData.dir + 1
                    });
                    activeUser.pais.push(stepData.pai2);
                    break;
                case ACTION_CODE.AC_BAR:            // 杠
                    var lastdir = this.getStepDir(i-1);
                    if(lastdir == stepData.dir){  // 补杠
                        var pai = stepData.pai1;
                        for(var i = 0; i < activeUser.eats.length; i++){
                            var eat = activeUser.eats[i];
                            if(eat.pai == pai){
                                eat.flag = EATFLAG.EAT_BAR;
                                break;
                            }
                        }
                        this.removePais(activeUser.pais,[pai]);
                    }else { // 明杠
                        activeUser.eats.push({
                            flag : EATFLAG.EAT_BAR,
                            pai  : this.lastPai,
                            eatDir : lastdir + 1
                        });

                        this.removePais(activeUser.pais,[this.lastPai,this.lastPai,this.lastPai]);
                    }
                    activeUser.pais.push(stepData.pai2);
                    break;
                case ACTION_CODE.AC_SUPPLY_FLOWER:   // 补花
                    activeUser.pais.push(stepData.pai1);
                    if(!!stepData.pai2){
                        activeUser.flowers.push(stepData.pai2);
                    }
                    break;
            }
        }
        pomelo.emit('RCMD_ActData',actData);
        this._step = step;
    },

    getUseridByDir : function (dir) {
        let user = this.data.users[dir];
        return user.userid;
    },

    /**
     * 当前step操作的玩家
     * @param step
     */
    getStepUserid : function (step) {
        if(step < 0 || step >= this.data.steps.length){
            return 0;
        }

        var stepData = this.data.steps[step];
        return this.getUseridByDir(stepData.dir);
    },

    /**
     * 获取step之前最后一张出过的牌
     */
    getLastPaiByStep : function (step) {
        if(step >= this.data.steps.length || step <= 0){
            return 0;
        }
        for(var i = step; i >= 0; i--){
            var stepData = this.data.steps[i];
            if(stepData.action == ACTION_CODE.AC_OUT){
                return stepData.pai1;
            }
        }
        return 0;
    },

    getStepDir : function (step) {
        if(step < 0 || step >= this.data.steps.length){
            throw new Error('step error');
            // return -1;
        }
        var stepData = this.data.steps[step];
        return stepData.dir;
    },

    /**
     * 删除手中的牌
     * @param hpais    手中的牌
     * @param rpais    需要删除的牌
     */
    removePais : function (hpais,rpais) {
        var x=0;
        for (let i = 0; i < hpais.length; i++) {
            if (hpais[i] == rpais) {
                x = i;
            }
        }
        hpais.splice(x,1);
    },

    /**
     * 获取吃牌的信息
     * @param lastPai  上一张出的牌
     * @param value1   第一张吃的牌
     * @param value2   第二张出的牌
     */
    getEatInfo : function (lastPai,value1,value2) {
        var min = Math.min(lastPai,value1);
        min = Math.min(min,value2);
        var flag = EATFLAG.EAT_LEFT + (lastPai - min);   // 吃的标志
        return {
            flag : flag,
            min  : min
        }
    }
});
