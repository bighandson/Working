var hangzhmahjongConfig = {

    gameid : 129,
    name : '杭州麻将',
    createRoomPreb  : 'hangzhou/hangzhouright',
    gameScenePath : 'mahScene1',
    gameScene : 'mahScene1',     // 游戏场景
    rule      : 'hangzhoumahRule',                     // 游戏规则
    record    : 'MJRecordController',                  // 复盘控制脚本
    sound     : 'hangzhoumahSound',                      // 声音控制
    title     : 'game/hangzhou/texture/hzmj_title',
    chatSound : 'resources/game/hangzhou/sound/chat',
    server    : 'hzmj.hzmjHandler',                  // 服务器
    // cfgchat   : 'hangzhouCfgChat',
    sourcePath : 'hangzhou',
    freeroombtnPath : 'hzmj',
    SingleClick : [ true,0], //  0双 1单
    LanguageSound :[ true,0],  //0方 1普
    // nofupan : true,      // 不复盘
    prefab:{

    },
    // 牌规则
    handCards   : 14,                                 // 手牌张数
    totalCards  : 136,                                // 游戏牌张数
    bBDToValue  : true,                               // 白板是否当财神值

    game_bean : [40000,400000,4000000],
    game_score : [],
    hutype1: {
        0x00: '胡',
        0x1: '七对',
        0x2: '豪华七对',
        0x4: '两豪华七对',
        0x8: '三豪华七对',
        0x10: '暴头',
        0x20: '财飘',
        0x40: '杠暴',
        0x80: '杠飘',
        0x100: '飘杠'
    },
    fanShu: true,
    fanShuName:'番',
    createRoom: {
        jushu: [
            // {
            //     name: '4局（房卡x1）',
            //     gamebh: '00000016'
            // },
            {
                name: '8局（房卡x1）',
                num : 2,
                gamebh: '00000120'
            },
            {
                name: '16局（房卡x2）',
                num : 4,
                gamebh: '00000121'
            }
        ],
        renshu: [

            {
                name: '4人',
                num : 4,
                data: 0x04// -1表示没有数据
            },
            {
                name: '3人',
                num : 3,
                data: 0x02// -1表示没有数据
            },
            {
                name: '2人 ',
                num : 2,
                data: 0x01 // -1表示没有数据
            },
        ],
        wanfa: [
            // {
            //     name:        '普通结算',
            //     checked      : true,
            //     interactable : false,
            //     data:  -1 // -1表示没有数据
            // }
        ],
        kexuan : [
            {
                name: '有财神必拷响',
                checked: true,
                interactable : false,
                data: 0x10 // -1表示没有数据
            },

            {
                name: '不允许吃三滩',
                checked: true,
                interactable : false,
                data: 0x40 // -1表示没有数据
            },
            {
                name: '守庄限碰',
                checked: true,
                interactable : false,
                data: 0x20 // -1表示没有数据
            }
        ]
    }
}
hangzhmahjongConfig.getWanfa = function (ruleFlag,expend,bAll) {
    expend = expend || 0;

    let wanfaStr = '玩法：';
    let kexuan = hangzhmahjongConfig.createRoom.kexuan;
    bAll = bAll || false;
    if((ruleFlag &0x01) == 0x01){
        wanfaStr += '2人'
    }else if((ruleFlag &0x02) == 0x02){
        wanfaStr += '3人'
    }else{
        wanfaStr += '4人'
    }
    for(let i = 0; i < kexuan.length;i++)
    {
        let item = kexuan[i];

        if(bAll && item.data < 0){ // -1 选项
            wanfaStr +=  "  " + item.name;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            wanfaStr +=  "  " + item.name;
        }
    }


    if(expend>0) {
        wanfaStr += (expend & 0x01) == 0x01 ? " AA支付" : " 房主支付";
        // wanfaStr += '底分'+ (expend >> 8);
    }
    cc.log('玩法',wanfaStr);
    return wanfaStr;
}


// 获取 玩法 和 支付方式
hangzhmahjongConfig.getInfoForSendFriend = function (ruleFlag, expend, bAll) {
    bAll = bAll || false;
    expend = expend || 0;
    let wanfa = hangzhmahjongConfig.createRoom.kexuan;

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


hangzhmahjongConfig.description =

    '游戏介绍\n'+

    '名词解释\n'+

    '　　1.庄家:第一局系统随机选择庄家。庄家胡牌或流局则继续当庄家。闲家谁胡牌谁当庄家。\n'+

    '    2.摸牌:庄家十四张牌，其余的座主十三张。庄家从牌中选出一张最无用的牌丢出。此时，其它三家都有权力要那张丢出的牌。庄家的下家，有权力吃或碰那张牌，其它两家则只可碰或杠那张牌。“ 碰 ” 比 “ 吃 ” 优先。\n'+

    '    3.丢骰子:骰子掷2次，第一次骰子翻财神，如（两颗骰子点数之和为7，财神位置就从庄家对家 右手边开始数7墩翻开的牌做为财神）。第二次骰子由第一次的数字决定谁来掷第二次骰子,然后抓牌\n'+

    '　　4.财神：白板作为财神\n'+

    '　　5.糊牌条件：1、起手三个财神或抓到三个财神不能有平胡，只能敲响（暴头）。不可以放冲跟自摸。如果是杠开可以糊，抢杠不能糊。2、如果自家的牌里有两个财神的话，一定要自摸，没有放冲。可以杠开，抢杠与自摸。3、财神头的牌，也就是财神爆头只能糊爆头可以自摸，没有放冲。4、单飘的牌可以胡杠开与抢杠与自摸不可以放冲。(四家都一样)  \n'+

    '　　6.放冲、自摸：比如三翻牌是20分起庄的，那自摸就加一翻也就是40，如果是放冲的，那放冲的人就支付40，其他没放冲的支付20就可以了。\n'+

    '\n胡牌类型\n'+
    '   七对： 七对是由七对将牌（可以是字牌和类型牌）组成的胡牌。在当局应得分数基础 ×2 。\n'+

    '   豪华七对： 是指七对中，有四个一样的牌充当两对牌用。在当局应得分数基础×4 。\n'+

    '   两豪华七对： 是指七对中，有两个“四个一样的牌充当两对牌用”。在当局应得分数基础 ×8 。\n'+

    '   三豪华七对： 是指七对中，有三个“四个一样的牌充当两对牌用”。在当局应得分数基础 ×16 。\n'+

    '   暴头： 玩家在胡牌前，手上有 1 颗财神 + 四比牌的情况。（因为财神可以变做任何的牌，所以下轮玩家摸到任何一张牌便可以胡牌了）则下轮玩家如果自摸胡牌，即为暴头。在当局应得分数基础 *2 倍。\n'+

    '   财飘： 玩家在手上拥有 2 颗财神 + 四比牌的情况下可以胡牌，（因为财神可以变做任何的牌，所以下轮玩家摸到任何一张牌便可以胡牌了）该轮玩家不胡牌，把手上的一颗财神打出去，到了下轮再暴头自摸胡牌就叫财飘。在当局暴头应得分数基础再 ×2 。说明：若有人财飘的时候，其余三家该轮不能吃、不能碰也不能放冲，只能自摸。下轮如果财飘者摸牌后没胡，则按照原来的规则继续游戏（即该吃该碰照常）。如果是连续 2 个财飘则：再 ×2 。\n'+

    '   杠开： 自己杠牌后摸起的那张牌组成的胡牌即为杠开（其他的麻将中称为杠上花）。在当局应得分数基础 ×2 。\n'+

    '   杠暴： 在杠开的情况下暴头就叫杠暴。在当局应得分数基础 ×4 。\n'+

    '   杠飘： 在有杠开的情况下财飘就叫杠飘。：在当局应得分数基础 ×8 。\n'+

    '   飘杠： 在先财飘再杠开的情况下自摸叫飘杠。：在当局应得分数基础 ×8。\n'+

    '   承包： 杭州麻将有承包规则：有人吃（包括碰）了你 3 次（总数），最后他自摸胡了，那就是你要承包所有的分。\n'+

    '   反承包： 有人吃（包括碰）了你 3 次（总数），最后你自摸胡了，那就是他要承包你所有的分的2倍。\n'+

    '   放炮： 杭州麻将平庄时不能放冲（点炮）的，只能自摸。只有在一个庄家，连庄 2 次以上才可以放冲。庄家可以放闲家的冲，闲家也可以放庄家的冲。但闲家和闲家之间不可以互相放冲。\n'+

    '   漏胡： 若玩家 A 为叫胡的状态下，如下家 B 打出一张玩家 A 可以胡的牌而玩家 A 却放弃不胡，那若对家 C 或上家 D 打出相同的一张牌时，玩家 A 是不能胡那一张的。 ，但只针对一张牌（不是玩家能胡的所有牌）有效。\n'+

    '   一炮多响： 一盘只能有一位胡牌者。如有一人以上同时表示捉冲时，从庄家按逆时针方向，顺序在前者被定为 " 胡牌者 " 。\n';
// }
module.exports = Object.freeze(hangzhmahjongConfig);
