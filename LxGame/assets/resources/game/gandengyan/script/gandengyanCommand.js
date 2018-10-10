const yhwhCmd=
{
    //上行
    CMD_EAT : 1001,//吃牌
    CMD_GANG : 1002,//杠牌
    CMD_OUT : 1003,//出牌
    CMD_FOLD : 1004,//逃花
    CMD_SUPPLE_FLOWER : 1005,//补花
    CMD_PASS : 1006,//过
    CMD_HU : 1007,//胡牌
    CMD_CHANGE : 1008,//换牌
    CMD_Trusteeship : 1009,     //托管
    CMD_SHOW : 1010,//献花
    
//下行:
    RCMD_EAT : 1001,//吃牌
    RCMD_GANG : 1002,//杠牌
    RCMD_OUT : 1003,//出牌
    RCMD_SUPPLE_FLOWER : 1005,//补花
    RCMD_PASS : 1006,//过
    RCMD_GAME_START : -1001,//游戏开始
    RCMD_GAME_OVER : -1002,//游戏结束
    RCMD_FA_PAI : -1003,//发牌       
    RCMD_TIP_FLOD : -1004,//逃花提示
    RCMD_TURN : -1005,//谁的回合
    RCMD_TIP_FLOWER : -1006,//补花提示
    RCMD_TIP_EAT : -1007,//吃提示
    RCMD_TIP_GANG : -1008,//杠提示
    RCMD_TIP_OUT : -1009,//出牌提示
    RCMD_TIP_HU : -1010,//是否胡牌提示
    RCMD_TIP_CHANGE : -1011,//换牌提示
    RCMD_CHANGE : -1012,//换牌
    RCMD_RELOAD_TABLE : -1013,//重连
    RCMD_TIP_SHOW : -1014, //献花提示
    RCMD_Trusteeship : 1009,     //托管
    RCMD_SHOW : 1010,//献花
    RCMD_SHOW_CARD : -1015,//展示公牌
    RCMD_NOTICE : -1016,//系统提示
};

const OPT_CODE = 
{
    optGet                 : 0x01,
    optEat                 : 0x02,
    optHit                 : 0x04,
    optBar                 : 0x08,
    optTing                : 0x10,
    optHu                  : 0x20,
    optSupplyBar           : 0x40,
    optTou                 : 0x100,
    optOut                 : 0x200,
    optAnsHu               : 0x300,   // 有人和
    optCancel              : 0x8001, // 用户取消操作(内部使用)
    optFocus               : 0x8002,  // 用户设置焦点
    optSupply              : 0x8003,  // 用户补牌(用与指令传输
    optXianHua             : 0x8004,//用户献花
    optRunOut              : 0x10000,  // 玩家逃跑
    optRecordHu            : 0x1000000,  // 复牌胡
    optEatEx               : 0x20000,
    optHitEx               : 0x40000,
    optBarEx               : 0x80000,
    optNull                : 0,  //干什么也不行

};

module.exports = {
    OPT_CODE   : OPT_CODE,
    yhwhCmd    : yhwhCmd,
};