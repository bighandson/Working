/**
 * 十三水管理类
 * @type {{}}
 */
window.SssManager = {
    controller: null,
    rule: null,
    soundCtrl: null,
    designResolution: null,
    isResLoadComplete: false,//资源加载是否完成
    mapai: [-1, -1],
    ruleInfo: {},
    pokersPrefabPos: [cc.p(550, 0), cc.p(900, 290), cc.p(550, 495), cc.p(130, 290)],
    bzpokersPrefabPos: [cc.p(485, 40), cc.p(900, 90), cc.p(900, 390), cc.p(485, 475), cc.p(130, 440), cc.p(130, 140)],//八张
    fbzpokersPrefabPos: [cc.p(485, 55), cc.p(900, 70), cc.p(900, 390), cc.p(485, 460), cc.p(130, 460), cc.p(130, 140)],//八张
    // emptyPokersPos:[cc.p(499,126),cc.p(811,347),cc.p(499-80,516),cc.p(132-130,347)],
    emptyPokersPos: [cc.p(499, 126), cc.p(760, 277), cc.p(329, 516), cc.p(102 - 100, 277)],
    gunRotation: [45, -40, -135, 45],
    gunScale: [1, 1, 1, -1],
    gunPostion: [[80, 0], [-80, 0], [-80, 0], [80, 0], [80, 0], [-80, 0]],
    bzgunPostion: [[120, 100], [-80, 0], [0, -80], [80, 0], [0, -80], [80, 0]],//八张
    mySeatId: 1,
    myPokers: null,
    pokersType: ["乌龙", "对子", "两对", "三条", "顺子", "同花", "葫芦", "铁支", "同花顺", "五同"],
    bzPokersType: ["乌龙", "对子", "顺子", "三条", "同花顺"],
    msgRCMDQueue: [
        'RCMD_Start',
        'RCMD_Ready',
        'RCMD_exit',
        'RCMD_Kick',
        'RCMD_close',
        'RCMD_Timeout',
        "RCMD_Result",
        "RCMD_Command",//通用协议
        'RCMD_Expend',                  // 扩展协议
        'RCMD_MatchOver',
        'RCMD_SitIn',

        // 'RCMD_forceGameOver',            // 房卡解散
        // 'RCMD_replyForceGameOver',      // 同意解散
    ],

    //不需要加入队列的消息
    msgRCMDList: [
        'RCMD_signup',
        'RCMD_MobileSignUp',
        'RCMD_PlayerStatus',
        'RCMD_initParam',
        'RCMD_ServerHeartOut',
        'RCMD_TaskSeat',
        // 'RCMD_SitIn',
    ],

    MAX_PLAYERS: 4,
    gameid: null,

    setCurrentGameId: function (gameid) {
        SssManager.gameid = gameid;
    },


    /**
     * 服务端发来的16进制数据转为type，num
     * @param hex
     * @returns {*|Array}  arr[0] num;arr[1] type
     */
    getCardTypeNum: function (hex) {
        var LoadGame = require('LoadGame');
        var gameid = SssManager.gameid || LoadGame.getCurrentGameId();
        if (gameid == 306) { //十三水 八张
            var arr = [-1, -1];
            arr[0] = ((hex & 0xF0) >> 4);

            if (hex == 0xF5 || hex == 0xF4) {//大小王
                arr[1] = (hex & 0x0F);
            }
            else {
                arr[1] = 4 - (hex & 0x0F);
            }

            if (arr[0] == 0x0E) {//A
                arr[0] = 1;
            }

            return arr;
        } else {
            var arr = hex.split("");
            // cc.log("hex = " + hex);
            // cc.log(arr);
            if (arr[0].toUpperCase() == "A") {
                arr[0] = 10;
            } else if (arr[0].toUpperCase() == "B") {
                arr[0] = 11;
            } else if (arr[0].toUpperCase() == "C") {
                arr[0] = 12;
            } else if (arr[0].toUpperCase() == "D") {
                arr[0] = 13;
            } else if (arr[0].toUpperCase() == "E") {
                arr[0] = 1;
            } else {
                arr[0] = parseInt(arr[0]);
            }
            arr[1] = Math.abs(4 - parseInt(arr[1]));
            //arr[0] num;arr[1] type
            return arr;
        }
    },

    /**
     * 无序排列
     * @param arr
     * @param num
     * @returns {Array}
     */
    combination: function (arr, num) {
        var r = [];
        (function f(t, a, n) {
            if (n == 0) {
                return r.push(t);
            }
            for (var i = 0, l = a.length; i <= l - n; i++) {
                f(t.concat(a[i]), a.slice(i + 1), n - 1);
            }
        })([], arr, num);
        return r;
    },

    getRule: function (ruleFlag, expend) {
        var LoadGame = require('LoadGame');
        var gameid = SssManager.gameid || LoadGame.getCurrentGameId();
        if (gameid == 306) { //十三水 八张

            SssManager.ruleInfo.zhifu = (expend & 0x01) == 0x01; //是否AA支付

            this.ruleInfo.m_nTruePlayers = parseInt((ruleFlag & 0x07));  //真实玩家

            //是否有特殊牌型
            this.ruleInfo.m_bAllTeShuCardType = parseInt((ruleFlag & 0x40) >> 6) > 0;//

            //是否有大小鬼
            this.ruleInfo.HasJoker = parseInt((ruleFlag & 0x80) >> 7) > 0;

            //是否有红波浪
            this.ruleInfo.HasRedWave = parseInt((ruleFlag & 0x100) >> 8) > 0;

            var holdType = parseInt((ruleFlag & 0x38) >> 3);//10-全副牌，5-5以上，7-7以上
            this.ruleInfo.HoldTypeValue = holdType == 5 ? 5 : holdType == 7 ? 7 : 10;
            this.mapai = [-1, -1];
        } else {
            let renshu = 0;
            if (ruleFlag & 0x01) {
                renshu = 2;
            } else if (ruleFlag & 0x02) {
                renshu = 3;
            } else if (ruleFlag & 0x04) {
                renshu = 4;
            } else if (ruleFlag & 0x08) {
                renshu = 5;
            }

            this.ruleInfo.m_nTruePlayers = renshu;  //真实玩家

            cc.log("开始游戏=====真实人数===", this.ruleInfo.m_nTruePlayers)

            //0x01  红波浪　0x02 特殊牌型
            this.ruleInfo.m_bAllTeShuCardType = ((ruleFlag & 0x80) == 0x80);  //红波浪模式
            this.ruleInfo.m_expend = expend || 0;
            //0x08 是否有马牌
            var m_nHorseCardIndex;
            //有马牌
            //110000
            //马牌的索引（０：红桃Ａ，１：红桃１０，２：红桃５）

            if ((ruleFlag & 0x10) == 0x10) {
                this.mapai[1] = 2;
                this.mapai[0] = 5;
                this.ruleInfo.m_nHorseCardIndex = 2
            } else if ((ruleFlag & 0x20) == 0x20) {
                this.mapai[1] = 2;
                this.mapai[0] = 10;
                this.ruleInfo.m_nHorseCardIndex = 1
            } else if ((ruleFlag & 0x40) == 0x40) {
                this.mapai[1] = 2;
                this.mapai[0] = 1;
                this.ruleInfo.m_nHorseCardIndex = 0;
            } else {
                this.mapai = [-1, -1];
                this.ruleInfo.m_nHorseCardIndex = -1;
            }

        }
    },
};