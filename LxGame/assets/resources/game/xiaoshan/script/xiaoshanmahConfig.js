
var xiaoshanmahConfig = {
    gameid: 128,
    name: '萧山麻将',
    createRoomPreb  : 'xiaoshan/xiaoshanright',
    gameScenePath : 'mahScene1',
    gameScene : 'mahScene1',     // 游戏场景
    rule      : 'xiaoshanmahRule',                     // 游戏规则
    record    : 'MJRecordController',                  // 复盘控制脚本
    sound     : 'xiaoshanmahSound',                      // 声音控制
    title     : 'game/xiaoshan/texture/xsmj_title',
    //chatSound : 'resources/game/jiande/sound/chat',
    server    : 'hzmj.hzmjHandler',                  // 服务器
    //cfgchat   : 'jiandeCfgChat',
    sourcePath : 'xiaoshan',
    freeroombtnPath : 'xsmj',
    SingleClick : [ true,0], //  0双 1单
    LanguageSound :[ false,1],  //0方 1普
    // nofupan : true,      // 不复盘
    prefab:{

    },

    // 牌规则
    handCards: 14,                                 // 手牌张数
    totalCards: 136,                                // 游戏牌张数
    bBDToValue: true,                               // 白板是否当财神值

    //游戏场底分配置
    FreeMinFen: [500, 20000, 50000],
    //游戏场最高上限配置
    FreeMaxFen: [5000, 200000, 5000000000000000000000],

    hutype1: {
        0x00: '胡',
        0x01: '七小对',
        0x02: '清七对',
        0x04: '豪华七对',
        0x08: '清豪华七对',
        0x10: '十风',
        0x20: '乱风',
        0x40: '正风',
        0x80: '暴头',
        0x100: '财飘',
        0x200: '杠开',
        0x400: '双杠开',
        0x800: '杠暴',
        0x1000: '双杠暴',
        0x2000: '杠飘',
        0x4000: '飘杠',
        0x8000: '对对胡',
        0x10000: '大吊车',
        0x20000: '清一色',
    },
    fanShu: true,
    fanShuName: '番',
    createRoom: {
        jushu: [
            // {
            //     name: '4局（房卡x1）',
            //     gamebh: '00000208'
            // },
            {
                name: '8局（房卡x1）',
                num:2,
                gamebh: '00000209'
            },
            {
                name: '16局（房卡x2）',
                num:4,
                gamebh: '00000210'
            }
        ],

        renshu: [
            {
                name: '4人',
                num:4,
                data: 0x04 // -1表示没有数据
            },

            {
                name: '3人',
                num:3,
                data: 0x02 // -1表示没有数据
            },
            {
                name: '2人',
                num:2,
                data: 0x01 // -1表示没有数据
            },

        ],
        
        wanfa: [
            {
                name: '三老庄封顶',
                data: 0x48 // -1表示没有数据
            },
            {
                name: '无限连庄',
                data: 0x28 // -1表示没有数据
            },


        ],
        caishen: [
            {
                name: '有财神不能平胡',
                data: 0x80 // -1表示没有数据
            },
        ],
        kexuan: [
            {
                name: '64倍封顶',
                data: 0x100 // -1表示没有数据
            },

            {
                name: '128倍封顶',
                data: 0x200 // -1表示没有数据
            },
            {
                name: '不封顶',
                data: 0x400 // -1表示没有数据
            }

        ],
        lianzhuang: [
            {
                name: '起手二老庄，豹子或8点以上加庄',
                checked: true,
                interactable: false,
                data: 0x1000 // -1表示没有数据
            },

            {
                name: '起手二老庄，豹子或10点以上加庄',
                checked: true,
                interactable: false,
                data: 0x2000 // -1表示没有数据
            },

            {
                name: '起手二老庄',
                checked: true,
                interactable: false,
                data: 0x800 // -1表示没有数据
            },

            {
                name: '起手三老庄',
                checked: true,
                interactable: false,
                data: 0x4000 // -1表示没有数据
            }

        ],

        tuodi: [
            {
                name: '100',
                data: 0x8000 // -1表示没有数据
            },

            {
                name: '200',
                data: 0x10000 // -1表示没有数据
            },

            {
                name: '500',
                data: 0x20000 // -1表示没有数据
            },

            {
                name: '1000',
                data: 0x40000 // -1表示没有数据
            },

            {
                name: '不拖底',
                data: 0x80000 // -1表示没有数据
            },
        ]

    }
};

// if(cc.sys.platform == cc.sys.IPAD){
//     hangzhmahjongConfig.gameScene = 'ipadhangzhmahScene';
// }
xiaoshanmahConfig.getWanfa = function (ruleFlag, expend, bAll,roomType) {
    expend = expend || 0;

    let wanfaStr = '玩法：';
    let wanfa = xiaoshanmahConfig.createRoom.wanfa;
    bAll = bAll || false;
    for (let i = 0; i < wanfa.length; i++) {
        let item = wanfa[i];

        if (bAll && item.data < 0) { // -1 选项
            wanfaStr += item.name + "  ";
        } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
            wanfaStr += item.name + "  ";
        }
    }

    let caishen= xiaoshanmahConfig.createRoom.caishen;
    for(let i = 0; i < caishen.length;i++)
    {
        let item = caishen[i];

        if(bAll && item.data < 0){ // -1 选项
            wanfaStr +=  item.name + "  " ;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            wanfaStr +=  item.name + "  " ;
        }
    }

    if(roomType == 2){
        let renshu= xiaoshanmahConfig.createRoom.renshu;
        for(let i = 0; i < renshu.length;i++)
        {
            let item = renshu[i];
    
            if(bAll && item.data < 0){ // -1 选项
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
            {
                wanfaStr +=  item.name + "  " ;
            }
        }
    }
    

    let jiesuan= xiaoshanmahConfig.createRoom.kexuan;
    for(let i = 0; i < jiesuan.length;i++)
    {
        let item = jiesuan[i];

        if(bAll && item.data < 0){ // -1 选项
            wanfaStr +=  item.name + "  " ;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            wanfaStr +=  item.name + "  " ;
        }
    }

    let lianzhuang= xiaoshanmahConfig.createRoom.lianzhuang;
    for(let i = 0; i < lianzhuang.length;i++)
    {
        let item = lianzhuang[i];

        if(bAll && item.data < 0){ // -1 选项
            wanfaStr +=  item.name + "  " ;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            wanfaStr +=  item.name + "  " ;
        }
    }
    
    // wanfaStr += '拖底：'
    let tuodistring = '拖底：';
    let tuodi= xiaoshanmahConfig.createRoom.tuodi;
    for(let i = 0; i < tuodi.length;i++)
    {
        let item = tuodi[i];

        if(bAll && item.data < 0){ // -1 选项
            tuodistring +=  item.name + "  " ;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            tuodistring +=  item.name + "  " ;
        }
    }
    if(tuodistring == '拖底：'){
        wanfaStr += '无拖底';
    }else{
        wanfaStr += tuodistring;
    }
    if((ruleFlag &0x01) == 0x01){
        wanfaStr += '2人'
    }else if((ruleFlag &0x02) == 0x02){
        wanfaStr += '3人'
    }else{
        wanfaStr += '4人'
    }

    if (expend > 0) {
        wanfaStr += (expend & 0x01) == 0x01 ? " AA支付   " : " 房主支付  ";
    }
    cc.log('玩法', wanfaStr);
    return wanfaStr;

}


// 获取 玩法 和 支付方式
xiaoshanmahConfig.getInfoForSendFriend = function (ruleFlag, expend, bAll) {
    bAll = bAll || false;
    expend = expend || 0;
    let wanfa = xiaoshanmahConfig.createRoom.kexuan;

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

    let lianzhuang= xiaoshanmahConfig.createRoom.lianzhuang;
    for(let i = 0; i < lianzhuang.length;i++)
    {
        let item = lianzhuang[i];

        if(bAll && item.data < 0){ // -1 选项
            info.wanfa +=  item.name + " " ;
        }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
        {
            info.wanfa +=  item.name + " " ;
        }
    }

    info.zhifu = (expend & 0x01) == 0x01 ? "AA支付" : "房主支付";
    
    return info;
}



xiaoshanmahConfig.description =

    '游戏介绍\n' +

    '名词解释\n' +

    '　　1.庄家:第一次开始游戏由系统随机决定一位玩家为庄家。庄家胡牌或流局则继续当庄家。闲家谁胡牌谁当庄家。\n' +

    '    2.摸牌:庄家十四张牌，其余的座主十三张。由庄家掷第一次骰子，再按骰子数数出第二位玩家再掷一次骰子，两个骰子和确定抓牌方，按较小的骰子数在抓牌方牌面从右往左数出牌墩开始抓牌。\n' +

    '    3.丢骰子:骰子掷2次，第一次骰子翻财神，如（两颗骰子点数之和为7，财神位置就从庄家对家 右手边开始数7墩翻开的牌做为财神）。第二次骰子由第一次的数字决定谁来掷第二次骰子,然后抓牌\n' +

    '　　4.财神：庄家抓完14张牌，闲家都抓完13张牌后的第一张抓牌即为财神。财神需要翻出来显示在桌面中央位置。\n' +

    '　　5.糊牌条件：萧山麻将只有自摸类胡牌没有放铳类胡牌。 \n' +

    '\n本地规则\n' +
    
    '　　 1，有承包关系和无承包关系两种，承包关系：连吃，碰同一家三摊或以上就要实施承包关系，或是前后两家同时吃碰中家三摊则前后两家都要实施承包关系，前*1 后*2。无承包关系：吃碰同一家最高为2摊\n' +

    '　　 2，有无限老庄和三老庄规则，无限老庄指可以一直胡上去，不封顶。三老庄指最高只能到三老庄，不能往上加，算牌都以三老庄计算。\n' +

    '　　 3，掷骰子规则 当开始游戏掷骰子的同时看骰子点数，笃一老庄家算分基数为2，笃二老庄家为4，骰子八点以下庄家算分基数为2，骰子八点以上算分基数为4，骰子为豹子算分基数为8。闲家不变。\n' +

    '　　 算分基数 例：以庄家自摸和爆头举例\n' +

    '　　 笃一老，庄家自摸，闲家每人付庄家2，庄家爆头，闲家每人付庄家4。\n' +

    '　　 笃二老，庄家自摸，闲家每人付庄家4，庄家爆头，闲家每人付庄家8。\n' +

    '　　 骰子八点以下，庄家自摸，闲家每人付庄家2，庄家爆头，闲家每人付庄家4。\n' +

    '　　 骰子八点以上，庄家自摸，闲家每人付庄家4，庄家爆头，闲家每人付庄家8。\n' +

    '　　 骰子为豹子，庄家自摸，闲家每人付庄家8，庄家爆头，闲家每人付庄家16。\n' +

    '　　 有财神不能平胡。\n' +

    '　　 财神打出后本轮不能吃碰明杠。\n' +

    '\n胡牌类型\n' +

    '　　 基本牌型\n' +
    
    '　　 123/123/123/123/11\n' +

    '　　 123/123/123/111/11\n' +

    '　　 123/123/111/111/11\n' +

    '　　 123/111/111/111/11\n' +

    '　　 111/111/111/111/11\n' +

    '   七对： 七小对	由七个对子组成的胡牌，不能有碰杠。\n' +

    '   清七对： 无财神的七对子。\n' +

    '   乱风： 14张全部风牌成型后胡牌，可以碰杠，不能叠加其他牌型。\n' +

    '   正风： 14张风字为刻子或杠子，不能叠加其他牌型。\n' +

    '   天胡： 庄家开始抓牌时候抓到的14张牌直接可以成型胡牌，不能叠加其他牌型。\n' +

    '   地胡： 闲家摸第一张牌可以胡的即为地胡，不能叠加其他牌型。\n' +

    '   杠： 有一个杠即可加一倍底注，不分明杠暗杠。\n' +

    '   豪华七对： 带有四张相同牌的七对子，带一个四张相同牌8倍，带两个四张相同牌16倍，带三个四张相同牌64倍（不能叠加其他牌型）。\n' +

    '   清豪七： 带有四张相同牌的七对子，且无财神 。\n' +

    '   十风： 从第一张开始连续打出十张风牌或字牌即为十风，若从第十一张开始每打一张则在此基础上再×2。不能叠加其他牌型 。\n' +

    '   暴头： 财神单吊胡牌即为暴头。\n' +

    '   财一飘： 打出财神后的下一圈即暴头胡牌。\n' +

    '   财二飘： 连续打出两个财神后的下一圈即暴头胡牌。\n' +

    '   大对子： 胡牌时所有牌都为刻子或杠子。\n' +

    '   大吊车： 吃碰杠后只剩一张牌单吊胡牌即为大吊车 。\n';

    '   庄家胡牌任何时候都比闲家得到或付出多1倍（不包括杠牌分）。以上所有分值最后都需乘上底注才是最后结果，最高算分为128倍（包括杠牌分）。\n'

module.exports = Object.freeze(xiaoshanmahConfig);