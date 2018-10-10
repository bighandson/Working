const CMD =
{
    //上行:
        CMD_OUT : 1003,//出牌
        CMD_PASS : 1006,//过      
        CMD_Trusteeship : 1009,     //托管

        CMD_TCC_REQUESTSTART : 0x0317, //说明：请求提早开始游戏

//下行:
        RCMD_TCC_REQUESTSTART : 0x8317, //说明：请求提早开始游戏

        RCMD_OUT : 1003,//出牌
        RCMD_PASS : 1006,//过

        RCMD_Trusteeship : 1009,     //托管
        CMD_DEBUG : 1099,//调试牌型

        RCMD_GAME_START : -1001,//游戏开始
        RCMD_GAME_OVER : -1002,//游戏结束
        RCMD_FA_PAI : -1003,//发牌
        RCMD_RE_CARD : -1007,//重新理牌

        RCMD_TURN : -1005,//谁的回合
        RCMD_RELOAD_TABLE : -1013,//重连
        RCMD_NOTICE : -1016,//系统提示
        RCMD_TIP_OUT : -1009,//出牌提示
}

const CardType=
{
    CardType_Null : 0,
    CardType_single  : 1,
    CardType_duizhi : 2,
    CardType_shunzi  : 3,
    CardType_liandui: 4,
    CardType_bomb3: 13,
    CardType_bomb4 : 14,
    CardType_bomb5 : 15,
    CardType_bomb6 : 16,
    CardType_wangzha: 30,
}
module.exports = 
{
    CMD : CMD,
    CardType : CardType,
}