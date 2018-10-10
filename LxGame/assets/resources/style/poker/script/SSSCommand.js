const data = {
    REQ_CMD:{
        //CMD_CardHand            :   0x010F,
        CMD_TSC_GROUP			 :   0x0306,
        CMD_IS_SPECIAL           :   0x0309,
        CMD_TCC_SHOWRESULTFINISH :   0x0315,
        CMD_TCC_REQUESTSTART      :  0x0317, //提前开始游戏
    },
    RESP_CMD:{
        RCMD_Chat				:	0x8015,
        RCMD_SitIn				:	0x8101,
        RCMD_Ready				:   0x8102,
        RCMD_GameStart			:   0x8103,
        RCMD_Result             :   0x8107,
        RCMD_CardHand           :   0x810F,//从服务器收到摊牌后的信息
        RCMD_INITDATA			:   0x8111,
        RCMD_SendCard           :   0x8114,
        RCMD_WaitForPlay		:   0x8123,
        RCMD_TSC_GROUP			:   0x8306,
        RCMD_TSC_RESET			:	0x8307,
        RCMD_TSC_RESETALL		:   0x8308,
        RCMD_TSC_SPECIALGROUP	:	0x8309,
        RCMD_TSC_ADJUSTALLGROUP	:	0x8310,
        RCMD_TSC_GAMEEND		:	0x8311,
        RCMD_RestoreGame		:   0x8316,
        RCMD_TCC_REQUESTSTART  :    0x8317,  // 提前开始后 重新下发ruleflag expend
    },
    EXPEND_SUB_CMD:{
        CMD_EXPAND_SUB_10000 : 10000,  //当前房间入座条件金币
        CMD_EXPAND_SUB_10003 : 10003,  //用户游戏中取款操作后，数据同步
        CMD_EXPAND_SUB_10002 : 1002,
        CMD_EXPAND_SUB_10004 : 10004,  //用户游戏中扣台费，数据同步
    }
}

module.exports = Object.freeze(data);