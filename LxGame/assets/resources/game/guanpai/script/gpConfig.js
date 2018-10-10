var wenzhougpConfig = {
    gameid                  : 308,
    name                    : '关牌',
    createRoomPreb          : 'gp/gpright',
    shareName               : '关牌',
    gameScene               : 'gpScene',
    rule                    : 'gpRule',
    record                  : 'MJRecordCController',
    sound                   : 'gpSound',
    server                  : 'game.gameHandler',
    ifnew                   : true,
    nofupan : true,      // 不复盘
    freeroombtnPath         : 'gp',
    SingleClick             : [ true,0], //  0双 1单
    LanguageSound           :[ true,0],  //0方 1普

    chatNodePos             : cc.p(-320, 180),                                     // 快捷短语 相对坐标

    prefab:{

    },

    createRoom: {
        jushu: [
            {
                name    : '8局（房卡x2）',
                num     : 2,
                gamebh  : '00000214',
            },
            {
                name: '16局（房卡x3）',
                num     : 4,
                gamebh: '00000215'
            }
        ],

        renshu:[
            {
                name    : '2人',
                num     : 2,
                data    : 0x00
            },
        ],
        wanfa: [
            {
                name : '三带二可带散牌',
                data : 0x12,     // 0x10 关牌通用玩法
            },
        ],
        kexuan: [
            {
                name : '全关翻倍',
                data : 0x04,
            },
        ],

    }
}
wenzhougpConfig.getWanfa = function (ruleFlag,expend,bAll) {
    expend = expend || 0;

    let wanfaStr = '2人';

    if(expend>0) {
        wanfaStr += (expend & 0x01) == 0x01 ? " AA支付" : " 房主支付";
    }

    wanfaStr += ' 玩法:三带二可带散牌 结算:全关翻倍';

    return wanfaStr;
}

wenzhougpConfig.description =
    '关牌规则：\n'+
'1、牌数：一副牌，除去大王，小王，红桃2，草花2，方块2，黑桃A，剩下总共48张牌。\n'+
'2、发牌： 由系统随机分发3家的牌，每家16张。其中一沓16张牌不用。\n'+
'出牌： 第一次为黑桃3先出，如果两人游戏时双方都摸不到黑桃3，那么黑桃4先出，以下依此类推。\n'+
'3、牌型以及牌大小原则\n'+
'A、牌的大小顺序：2，A，K，Q，J，10，9，8，7，6，5，4，3。\n'+
'B、牌形分为：单张、 一对、 三张、 3带2、姐妹对（两张三张都可以连接，且连接数量无限）、顺子（数量无限制，且可以连接A2345，34567，10JQKA）、炸弹（4带1，A炸为三个A带1）\n'+
'C、除了炸弹以外，普通牌形不允许对压，相同牌形只有比它大的才能出。\n'+
'D、炸弹任何牌形都能出，炸弹的大小为：A、K，Q，J，10，9，8，7，6，5，4，3。\n'+
'4、胜负判定以及得分规则\n'+
'结算：获胜金币等于对手手中的剩余牌数*基础金\n'+
'全关：一个玩家在出完手牌的时候，对手一张都没有出手的情况即为全关，胜者可以得到翻倍的分数。当一名玩家手中的张数>=15 张，则算全关。\n'+
'基础金币设置：取携带金币最少玩家的1/30作为游戏的基础金。\n'+
'5、托管功能：\n'+
'游戏左下角设置托管功能，激活该功能后，对方出的所有牌默认“不要”'

module.exports = Object.freeze(wenzhougpConfig);