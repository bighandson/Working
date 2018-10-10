// 麻将操作码定义
const OPT_CODE = {
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
    optRunOut              : 0x10000,  // 玩家逃跑
    optRecordHu            : 0x1000000,  // 复牌胡
    optEatEx               : 0x20000,
    optHitEx               : 0x40000,
    optBarEx               : 0x80000,
    optNull                : 0,  //干什么也不行

};


const CMD_ACTION = {
    AT_UNKNOW       : 0,
    AT_AUTO         : 1,
    AT_HAND	        : 2,
    AT_TIMEOUT      : 3
}

var EATFLAG = {
    EAT_NULL             : 0,       //啥也没有
    EAT_LEFT             : 1,       //左吃
    EAT_MID              : 2 ,      //中吃
    EAT_RIGHT            : 3,      // 右吃
    EAT_HIT              : 4,      // 碰
    EAT_BAR              : 5,        // 杠(明杠、补杠）
    EAT_BAR_DRAK         : 6,   // 暗杠
}

var HUFLAG = {
    MJR_HU_ZM   : 1,    // 自摸
    MJR_HU_GSKH : 2,    // 杠上开花
    MJR_HU_TH   : 4,    // 天和
    MJR_HU_DH	: 8,    // 地和
    MJR_HU_QG	: 16,   // 抢杠
    MJR_HU_GSKH2	: 32,//后杠
    MJR_HU_HDLY : 64,   //海底捞月
}

module.exports = {
    OPT_CODE   : OPT_CODE,
    CMD_ACTION : CMD_ACTION,
    EATFLAG    : EATFLAG,
    HUFLAG     : HUFLAG
};
