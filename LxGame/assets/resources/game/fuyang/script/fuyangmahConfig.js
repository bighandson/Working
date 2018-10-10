var fuyangmahConfig = {
    gameid: 164,
    name: '富阳麻将',
    createRoomPreb: 'fuyang/fyright',
    gameScenePath: 'mahScene1',
    gameScene: 'mahScene1',     // 游戏场景
    rule: 'fuyangmahRule',                     // 游戏规则
    sound: 'fuyangmahSound',                        // 声音控制
    record: 'MJRecordController',                  // 复盘控制脚本
    title: 'game/fuyang/texture/fuyangtitle',
    // chatSound : 'resources/youxi/fuyangmah/sound/chat',
    server: 'hzmj.hzmjHandler',                  // 服务器
    // 牌规则
    sourcePath: 'fuyang',
    freeroombtnPath: 'fymj',
    SingleClick: [true, 0], //  0双 1单
    LanguageSound: [true, 0],  //0方 1普
    chatPosition : {x:600,y:-70},

    // nofupan : true,      // 不复盘
    prefab: {},
    handCards: 14,                                 // 手牌张数
    totalCards: 136,                                // 游戏牌张数
    bBDToValue: false,                              // 白板是否当财神值
    //游戏场底分配置
    FreeMinFen: [500, 20000, 50000],
    //游戏场最低要求
    FreeMaxFen: [5000, 5000000000000000000000, 5000000000000000000000],

    hutype1: {
        0x01: '清一色 3台',
        0x02: '混一色 1台',
        0x04: '对对胡 1台',
        0x08: '箭刻 1台',
        0x10: '全部风牌 13台',
        0x20: '门风刻 1台',
        0x40: '财神头',
    },
    fanShu: true,
    fanShuName: '台',
    // 房卡房间创建时的配置
    createRoom: {
        jushu: [
            // {
            //     name: '4局（房卡x1）',
            //     gamebh: '00000001'
            // },
            {
                name: '8局（房卡x1）',
                num: 2,
                gamebh: '00000124'
            },
            {
                name: '16局（房卡x2）',
                num: 4,
                gamebh: '00000125'
            }
        ],
        renshu: [
            {
                name: '4人',
               num: 4,
                data: 0x04
            },
            {
                name: '3人',
                num: 3,
                data: 0x02
            },
            {
                name: '2人',
                num: 2,
                data: 0x01
            },
        ],

        wanfa: [
            {
                name: '普通',
                data: 0x10 // -1表示没有数据
            },
            {
                name: '牛头杠',
                data: 0x40 // -1表示没有数据
            },
        ],
        kexuan: [
            {
                name: '接庄',
                data: 0x20 // -1表示没有数据
            },
        ]
    },
};

fuyangmahConfig.getWanfa = function (ruleFlag, expend, bAll) {
    expend = expend || 0;

    let wanfaStr = '玩法：';
    let wanfa = fuyangmahConfig.createRoom.wanfa;
    bAll = bAll || false;
    for (let i = 0; i < wanfa.length; i++) {
        let item = wanfa[i];

        if (bAll && item.data < 0) { // -1 选项
            wanfaStr += item.name + "  ";
        } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
            wanfaStr += item.name + "  ";
        }
    }

    let renshu = fuyangmahConfig.createRoom.renshu;
    for (let i = 0; i < renshu.length; i++) {
        let item = renshu[i];

        if (bAll && item.data < 0) { // -1 选项
            wanfaStr += item.name + "  ";
        } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
            wanfaStr += item.name + "  ";
        }
    }

    if (expend > 0) {
        wanfaStr += (expend & 0x01) == 0x01 ? "AA支付   " : "房主支付  ";
    }
    cc.log('玩法', wanfaStr);
    return wanfaStr;
}

// 获取 玩法 和 支付方式
fuyangmahConfig.getInfoForSendFriend = function (ruleFlag, expend, bAll) {
    bAll = bAll || false;
    expend = expend || 0;
    let wanfa = fuyangmahConfig.createRoom.wanfa;

    let info = {}
    info.wanfa = ''
    for (let i = 0; i < wanfa.length; i++) {
        let item = wanfa[i];
        if (bAll && item.data < 0) { // -1 选项
            info.wanfa += item.name + " ";
        } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
            info.wanfa += item.name + " ";
        }
    }


    info.zhifu = (expend & 0x01) == 0x01 ? "AA支付" : "房主支付";
    
    return info;
}


fuyangmahConfig.description =
    '[规则]\n' +
    '   1.玩家：4人，分别为东、南、西、北，庄家为东，逆时针作为按座位排序。\n' +
    '   2.张数：每人手里抓13张牌，庄家（出牌者）14张。\n' +
    '   3.庄家：即上一圈的胡牌者担任庄家。首次开局，以摇骰子最大者为庄家。\n' +
    '   4.开始：必须要四个人同时是准备状态，牌局才开始。\n' +
    '   5.胡牌：一局牌局只存在一个胡牌的玩家。\n' +
    '   6.牌局：游戏开始，正常情况牌局只存在胡牌或流局两种。\n' +
    '   7.自动托管：托管时间 3分钟，托管到当局游戏结束自动离开桌子\n' +
    '   8. 玩家人数：2人模式，只能碰不能吃，三台起自摸、四台起放冲，牌型只留：风牌、万牌、箭牌。\n' +
    '   9. 玩家人数：3人模式（牛头杠），只能碰不能吃，三台起自摸、四台起可放冲胡牌，取消北风位，其余牌型和4人麻将一样。\n' +
    '   10.特殊玩法：接庄：任意一位玩家做庄时胡牌或者流局，下一幅牌不管谁胡牌，筹码都是翻倍计算。\n' +
    '[玩法]\n' +
    '   1.游戏开始，庄家投掷两颗骰子，按照两颗骰子点数决定从哪边开始抓牌。庄家十四张牌，其余三人十三张。\n' +
    '   2.牌整理后，庄家不摸牌（庄家有14张牌），先出牌，然后其它三家都有权力要那张丢出的牌。即：庄家的下家（右手边的玩者），有权力吃或碰那张牌，其它两家则只可碰或杠那张牌。“碰”比“吃”优先（吃比假碰优先）。\n' +
    '[牌类顺序]\n' +
    '   1.风牌：东→南→西→北→东。\n' +
    '   2.箭牌：红中→发财→白板→红中。\n' +
    '   3.万牌：1→2→3→4→5→6→7→8→9→1。\n' +
    '   4.条牌：1→2→3→4→5→6→7→8→9→1。\n' +
    '   5.筒牌：1→2→3→4→5→6→7→8→9→1。\n' +
    '[特殊牌]\n' +
    '   1.财神：由开局塞子随机选择一张，整副财神牌只有3张并且财神牌可以充当任何牌，进行碰/杠/吃等牌型操作。\n' +
    '   （1）用财神替代的牌叫假牌，具体优先级：（真碰〉真杠〉真吃〉假碰〉假杠〉假吃），比如：有“2个红中”的人比只有“一个红中和财神”的人在进行“碰红中”时优先。\n' +
    '   2. 杠花：财神牌下一张（即按麻将牌类顺序排序确定杠花）。\n' +
    '   （1）杠花是玩家摸起后自动杠出的牌（不可留手过夜）\n' +
    '[胡牌规则]\n' +
    '   1.胡牌的基本牌型\n' +
    '   （1） 11、123、123、123、123。\n' +
    '   （2） 11、123、123、123、111（1111，下同）。\n' +
    '   （3） 11、123、123、111、111。\n' +
    '   （4） 11、123、111、111、111。\n' +
    '   （5） 11、111、111、111、111。\n' +
    '   2.胡牌条件\n' +
    '   （1） 胡牌者必须有2台以上的台头。\n' +
    '   （2） 允许放冲，放冲必须有3台以上的台头。\n' +
    '   （３） 清一色 ：3台, 混一色 ：1台, 对对胡 ：１台,　箭刻　：１台,　全部风牌　：１３台,　门风刻　：１台,\n' +
    '［其他］\n' +
    '   1.财神头不可放冲。\n' +
    '   2.二台起自摸，3台则可以放冲，放冲的人一个人承包输家的积分（只支付两位的积分，赢家只能收到两份积分），其他2位不用付。\n' +
    '   3.一盘只能有一位胡牌者。如有一人以上同时表示捉冲时，从庄家按逆时针方向，顺序在前者被定为“胡牌者”。\n' +
    '   4.将禁止弃先胡后，即在同一轮摸牌中如果前一家放铳给某一玩家而该玩家没有胡，则在这轮中该玩家不能吃其他玩家的铳，直到新的一轮摸牌。\n' +
    '   5.有一种胡牌叫“拉杠”，即摸牌者，拿一张牌去碰自己的AAA的牌型时，那张牌刚好是听牌者要的那张，则听牌者可以叫“拉杠”，即胡牌。被拉杠者，承包三家的积分，胡牌者可以拿到三份积分。\n' +
    '   \n';


module.exports = Object.freeze(fuyangmahConfig);