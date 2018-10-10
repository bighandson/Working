
var gandengyancfg =
    {
        gameid: 120,
        name: '干瞪眼',
        shareName: '干*瞪*眼',
        createRoomPreb  : 'gdy/gdyright',
        roomScene: 'roomScene',                               // 房间场景
        gameScene: 'gandengyanscene',                          // 游戏场景
        rule: 'gandengyanRule',                          // 游戏规则
        sound: 'gandengyanSound',                        // 声音控制
        record: 'MJRecordController',                    // 复盘控制脚本
        server: 'hzmj.hzmjHandler',                        // 服务器
        title: 'youxi/yuhuanmah/texture/yhmj_title',
        chatSound: 'resources/game/jiande/sound/chat',//常用语,如果有方言版本填上路径
        freeroombtnPath : 'gdy',
        handCards: 17,
        totalCards: 136,
        mahScene: 'mahScene1',
        // btn: 'style/style2/prefab2/GameGroup/texture/yongkanggdy',
        mahPrefabs: {},
        // ifnew : true,
        //游戏场消耗的游戏豆
        // game_bean:
        // {
        //     cj: 40000, //初级
        //     zj: 400000,
        //     gj: 4000000,
        //     tj: 40000000
        // },
        hutype1:
        {
            0x00: '胡',
            0x1: '坎当',
            0x2: '碰碰胡',
            0x4: '混一色',
            0x8: '清一色',
            0x10: '字一色',
            0x20: '四花',
            0x40: '箭刻',
            0x80: '门风刻',
            0x100: '圈风刻',
            0x200: '单钓',
            0x400: '平胡',
            0x800: '胡边张'
        },
        //  //最低入场分数 --专家级暂不开放
        //  game_bean : {
        //     0x00: '1000', //初级
        //     0x01: '10000',//高级
        //     0x02: '10000',//专家级
        // },

        // //每局低分 --专家级暂不开放
        // game_score : {
        //     0x00: '3', //初级
        //     0x01: '30',//高级
        //     0x02: '300',//专家级
        // },

        //游戏场底分配置
        FreeMinFen: [1000, 20000, 50000],
        //游戏场最低要求
        FreeMaxFen: [20000, 5000000000000000000000, 5000000000000000000000],

        fanShu: true,
        fanShuName: '胡',
        createRoom:
        {
            jushu: [
                {
                    name: '5圈',
                    gamebh: '00000239',//（要改成对应的现在是错的）
                    data: 0x01,
                    num: 1
                },
                {
                    name: '10圈',
                    gamebh: '00000240',
                    data: 0x02,
                    num: 2
                },
                {
                    name: '20圈',
                    gamebh: '00000241',
                    data: 0x03,
                    num: 4
                }
            ],
            wanfa: [
                {
                    name: '经典模式',
                    data: 0x10 // -1表示没有数据
                },
                {
                    name: '疯狂模式',
                    data: 0x20 // -1表示没有数据
                },
            ],
            zhifu: [

                {
                    name: 'AA支付 ',
                    // gamebh : '00000002',
                    data: 0x01
                },

                {
                    name: '房主支付 ',
                    // gamebh : '00000001',
                    data: 0x00
                }

            ],
            renshu:
            [
                {
                    name: '5人',
                    num: 5,
                    data: 0x08
                },
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
            fengding: [

                {
                    name: '6倍',
                    // gamebh : '00000002',
                    data: 0x80
                },

                {
                    name: '12倍',
                    // gamebh : '00000001',
                    data: 0x100
                },

                {
                    name: '不封顶',
                    // gamebh : '00000001',
                    data: -1
                }
            ],
            time: [
                {
                    name: '房间限时',
                    data: 0x8000,
                }
            ],
        }
    }

gandengyancfg.getzhi = function (ruleFlag, expend, bAll) {
    // var Num = ruleFlag % 1000
    // var Zhi = Math.floor(Num / 100)
    // return Zhi
    return expend & 0x01
}

gandengyancfg.getdifeng = function (ruleFlag, expend, bAll) {
    //return Math.floor(ruleFlag / 10000)
    return (expend >> 8) & 0x0F
}

gandengyancfg.getwan = function (ruleFlag, expend, bAll) {
    // var num = ruleFlag % 100
    // return Math.floor(num / 10)
    return ruleFlag & 0x30
}
gandengyancfg.getrenshu = function (ruleFlag, expend, bAll) {
    //return ruleFlag % 10
    //return (expend >>1)&0x7F
    var ren = ruleFlag & 0x0F
    if (ren == 0x01) { return 2 }
    if (ren == 0x02) { return 3 }
    if (ren == 0x04) { return 4 }
    if (ren == 0x08) { return 5 }
}

gandengyancfg.getfengding = function (ruleFlag, expend, bAll) {
    //return Math.floor(ruleFlag / 1000)
    if ((ruleFlag & 0x80) == 0x80) { return 0x80 }
    if ((ruleFlag & 0x80) == 0x100) { return 0x100 }
    return -1

}

gandengyancfg.one = function (ruleFlag) {
    // var num = ruleFlag % 100
    // return Math.floor(num / 10)
    let wanfa ='';
    wanfa = ((ruleFlag & 0x30) == 0x10) ? '经典模式' : '疯狂模式'
    return wanfa;
}


gandengyancfg.two = function (ruleFlag) {
    //return Math.floor(ruleFlag / 1000)
    let fengding = '不封顶';
    if ((ruleFlag & 0x80) == 0x80) {fengding = '封顶6倍';}
    if ((ruleFlag & 0x80) == 0x100) {fengding = '封顶12倍';}
    return fengding

}

// 获取 玩法 和 支付方式
gandengyancfg.getInfoForSendFriend = function (ruleFlag, expend, bAll) {
    bAll = bAll || false;
    expend = expend || 0;

    let info = {}
    info.wanfa = ''

    info.wanfa +=gandengyancfg.one(ruleFlag);

    info.wanfa += gandengyancfg.two(ruleFlag);


    info.zhifu = (expend & 0x01) == 0x01 ? "AA支付" : "房主支付";
    
    cc.log(info);
    return info;
}

gandengyancfg.description =
    '       出牌顺序为自己杠过的白皮>送子>别人杠过的散张白皮>句子（散张白皮）>单张框牌；已打过的句子再摸上来必须打掉；牌局结束时，未按顺序出牌的判定为压迫。先打生张点胡要包牌，先打大花或生张花被吃杠胡的要包牌。\n' +
    '       大张：六六，一一，四四，三三，一三，四六，五五，二二，三四，二五，一六，五六，一二；\n' +
    '       小张：二三，四五，三六，一四，二四，三五，二六，一五。 '
// gandengyancfg.description =
//     '   玉环麻将，是流行于玉环一带的特色麻将游戏。使用万条筒字共136张牌（不使用春夏秋冬梅兰竹菊等花牌）， ' +
//     '由 4 个人参与，分别为东、南、西、北，每人手里抓 16 张牌，通过吃牌、碰牌、杠牌等方式，使手中的牌按照相关规定的牌型条件胡牌。\n' +
//         '一、牌型 \n' +
//         '顺： 3 张连续的牌，如 123 万。 \n' +
//         '刻： 3 张一样的牌，如 111 万。\n'  +
//         '杠： 4 张一样的牌，如 1111 万。杠牌后要从牌墙最后补一张牌。\n' +
//         '暗刻：自己摸到的 3 张一样的牌，称为暗刻。暗杠未杠出也算暗刻。\n' +
//         '白板：在玉环麻将中，摸到白板自动杠出，再从牌墙最后补一张牌。\n' +
//         '特殊名词： \n' +
//         '1 、坎档：吃一个顺子的中间一张牌，如 123 筒中的 2 筒， 456 万中的 5 万；\n' +
//         '2 、靠壁：如吃 123 筒中的 3 筒， 789 万中的 7 万。\n' +
//         '\n二、游戏规则 \n'  +
//         '(1) 顺序：骰子决定的方向、打牌的方向、轮流坐东的方向按逆时针；摸牌的方向按顺时针。\n' +
//         '(2) 坐庄： 2 个骰子 摸牌前投二次。第一次由庄家投，第二次由第一次投到的玩家来投，二次投骰数字相加的总和，从第二次投骰家开始逆时针计数，到投骰总和数时开始摸牌。\n' +
//         '(3) 摸牌：每次拿两墩（四张），摸满 16 张后庄家再多抓一张。\n' +
//         '(4) 财神的确定： 分完牌， 庄家摸第 17 张牌后，庄家的下家把紧跟着的一张牌翻开放到最后 ，作为财神。财神共有 3 个，胡牌时可以替代任何牌。 \n' +
//         '(5) 打牌： 玩家摸起一张牌后，再挑选一张不要的牌打出。\n' +
//         '(6)在玉环麻将中，没有春夏秋冬梅兰竹菊这8张花。当白板不为财神时，白板作为杠花，摸到后从牌堆最后补花。当白板为财神时，红中作为杠花。\n' +
//         '\n三、胡牌要求\n' +
//         '手中的牌满足 5 副刻（杠）或顺子 + 1 副对子的情况时，就可以胡牌。\n' +
//         '特殊牌型： \n' +
//         'a 、清一色：手上的牌都是同一种花色，并满足基本胡牌条件。 \n' +
//         'b 、混一色：手上的牌由一种花色 + 字牌组成，并满足基本胡牌条件。\n' +
//         'c 、碰碰胡：手上的牌没有顺子，由 5 副刻子（杠）加 1 副对牌组成。\n' +
//         'd 、平胡： 胡后全是顺子，只一个对子，而且最后胡的牌一定要靠壁而不是坎档，也不是对子中的一个（对子不能为中、发、风），称为“平胡”。\n' +
//         'e 、杠上开花：杠牌后，摸上的牌正好是自己要胡的牌，称为“杠上开花”。\n' +
//         'f 、拉杠：某玩家碰了一副刻子，如果他再补杠这副牌或打出这张牌，而正好另一个玩家又胡这张牌，此时另一个玩家可以胡牌，称为“拉杠”。\n' +
//         'g 、流局： 如果牌墙最后只剩下 16 张时 还没有人胡牌，则本局黄庄，黄庄时各家均计 0 分。\n' +
//         'h 、连庄：胡牌后，如果本局中又没有人杠过，则连庄。其他情况时均按逆时针轮庄。\n' +
//         '\n四、记分\n'  +
//         '一局结束时，玩家的记分为：\n' +
//         '胡家的分数：其他每个人要按胡牌者的总胡数负给其相应的分数。\n' +
//         '其他家的分数：胡数少的玩家要负给胡数多的玩家总胡数的差价。 \n' +
//         '其中，玩家的总胡数 = 其基础胡数和台数的乘积。总胡数（乘以台数后） 以 10 胡为一个单位。如 62 、 69 胡均算 70 胡。最高 400 胡封顶 。\n' +
//         '\n（ 1 ）基础胡数的计算\n' +
//         '基础胡数 =20+ 牌中的胡数。其中20是底胡，只有胡牌的人可以额外获得。 \n' +
//         '摸到每个杠花算 4 胡。\n' +
//         '摸到 2 个中、发、和自己位置相对应的风，算 2 胡。\n' +
//         '碰到字牌和一九的牌都算 4 胡，暗刻8胡，明杠和补杠算 16 胡，暗杠算 32 胡 。\n' +
//         '碰到普通牌时为2胡，暗刻4胡，明杠和补杠算 8 胡，暗杠算 16 胡 。\n'  +
//         '听的牌为坎档、靠壁、将牌 3 种情况时，自摸算 4 胡；别人“放冲”算两胡。\n' +
//         '其他牌型， 自摸算 2 胡，“放冲”没有胡数。\n' +
//         '\n（ 2 ）台数的计算\n' +
//         '台数是基础胡数所翻的倍数。每有一台多乘一个2，如下计算：【最高4台】\n' +
//         '0台=2^0=1倍（不翻倍），1台=2^1=2倍，2台=2^2=4倍，3台=2^3=8倍，4台=2^4=16倍\n' +
//         '每一个杠花（白板不为财神时白板是杠花，白板是财神时红中是杠花）、 3 个中或 3 个发都算作一台。玩家碰到与自己位置相对应的东南西北风也算一台。\n' +
//         '平胡、 杠上开花、拉杠 算一台。\n' +
//         '【注意】平胡必须全为顺子，且胡牌时不是坎档、靠壁，也不是将牌（一对，即单吊），否则不计平胡台数\n' +
//         '混一色和碰碰胡算 2 台。\n' +
//         '清一色算 4台。\n' +
//         '没有财神算一台，二个财神算一台，三个财神算 4 台。\n' +
//         '最高台数为 4 台，称为“腊子”。\n' +
//         '\n ( 3 ）特殊情况（承包）：\n' +
//         '在黄牌前 9 张时，如果此时放冲，则放冲者 要一个人承包 其他所有人本应支付的胡数，而其他人不用支付。\n' +
//         '\n（ 4 ）老鬼宁（老头）：\n' +
//         '杠花不杠、打财神（包括吃、碰），都称为“老鬼宁”，本局不允许胡牌，只能在牌局结束时计算胡数。'

module.exports = Object.freeze(gandengyancfg);