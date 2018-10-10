
var PAITYPES = cc.Enum({
    NULL : -1,
    WAN : -1,  // 万字牌
    TONG : -1, // 筒字牌
    SUO : -1,  // 索字牌
    FENG : -1, // 东南西北风
    ZFB : -1, // 中发白
    FLOWER : -1, // 花牌
});

var PAI = cc.Enum({
    PAI_NULL:-1,
    PAI_W1:-1,PAI_W2:-1,PAI_W3:-1,PAI_W4:-1,PAI_W5:-1,PAI_W6:-1,PAI_W7:-1,PAI_W8:-1,PAI_W9:-1,// 万字牌
    PAI_T1:-1,PAI_T2:-1,PAI_T3:-1,PAI_T4:-1,PAI_T5:-1,PAI_T6:-1,PAI_T7:-1,PAI_T8:-1,PAI_T9:-1,// 筒字牌
    PAI_S1:-1,PAI_S2:-1,PAI_S3:-1,PAI_S4:-1,PAI_S5:-1,PAI_S6:-1,PAI_S7:-1,PAI_S8:-1,PAI_S9:-1,// 索字牌
    PAI_FE : -1, PAI_FS : -1, PAI_FW : -1, PAI_FN : -1, // 东南西北风
    PAI_FZ : -1, PAI_FF : -1, PAI_FB : -1,              // 中发白
    PAI_HM : -1,PAI_HL : -1,PAI_HZ : -1,PAI_HJ : -1,                 // 梅兰竹菊
    PAI_HC : -1,PAI_HX : -1,PAI_HQ : -1,PAI_HD : -1,                 // 春夏秋冬
});

var PAI_NAME = [
    "空牌",
    "一万","二万","三万","四万","五万","六万","七万","八万","九万",
    "一筒","二筒","三筒","四筒","五筒","六筒","七筒","八筒","九筒",
    "一条","二条","三条","四条","五条","六条","七条","八条","九条",
    "东风","南风","西风","北风",
    "红中","发财","白板"
]

var TYTE_FIRST = {
    1 : PAI.PAI_W1,
    2 : PAI.PAI_T1,
    3 : PAI.PAI_S1,
    4 : PAI.PAI_FE,
    5 : PAI.PAI_FZ
};

function paiType(pai) {
    if(pai >= PAI.PAI_W1 && pai <= PAI.PAI_W9){
        return PAITYPES.WAN;
    }

    if(pai >= PAI.PAI_T1 && pai <= PAI.PAI_T9){
        return PAITYPES.TONG;
    }

    if(pai >= PAI.PAI_S1 && pai <= PAI.PAI_S9){
        return PAITYPES.SUO;
    }

    if(pai >= PAI.PAI_FE && pai <= PAI.PAI_FN){
        return PAITYPES.FENG;
    }

    if(pai >= PAI.PAI_FZ && pai <= PAI.PAI_FB){
        return PAITYPES.ZFB;
    }

    if(pai >= PAI.PAI_HM && pai <= PAI.PAI_HD){
        return PAITYPES.FLOWER;
    }
    return PAITYPES.NULL;
}

function isFlower(pai) {
    return paiType(pai) == PAITYPES.FLOWER;
}

function invalidPai(pai) {
    if(pai >= PAI.PAI_W1 && pai <= PAI.PAI_HD){
        return true;
    }
    return false;
}

/**
 * 是否同花
 */
function isSameFlower() {
    let values;
    if(typeof arguments[0] == 'array'){
        values = arguments[0];
    }else {
        values = arguments;
    }

    for(let i = 0; i < values.length - 1; i++){
        if(paiType(values[i]) != paiType(values[i+1])){
            return false;
        }
    }

    return true;
}

function TransmitPaiToFormat(pai) {
    var type = paiType(pai);
    return '0x'+ (type-1) + (pai-TYTE_FIRST[type]+1);
}

function visualize(pai) {
    return PAI_NAME[pai];
}

module.exports = {
    PAI : PAI,
    paiType : paiType,
    TransmitPaiToFormat : TransmitPaiToFormat,
    visualize : visualize,
    invalidPai : invalidPai,
    isFlower : isFlower,
    isSameFlower : isSameFlower
}