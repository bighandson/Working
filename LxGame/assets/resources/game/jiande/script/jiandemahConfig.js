


var jiandemahjongConfig = {

    gameid          : 160,
    name            : '建德麻将',
    matchName         : '建德麻将随机底',
    createRoomPreb  : 'jiande/jianderight',
    gameScenePath   : 'mahScene1',
    gameScene       : 'mahScene1',                              // 游戏场景
    gameScene_Match : 'mahMtachScene',                          // 游戏比赛场景
    rule            : 'jiandemahRule',                          // 游戏规则
    record          : 'MJRecordController',                     // 复盘控制脚本
    sound           : 'jiandemahSound',                         // 声音控制
    title           : 'game/jiande/texture/jdmj_title',
    chatSound       : 'resources/game/jiande/sound/chat',
    server          : 'hzmj.hzmjHandler',                       // 服务器
    cfgchat         : 'jiandeCfgChat',
    sourcePath      : 'jiande',
    freeroombtnPath : 'jdmj',
    SingleClick     : [ true,0], //  0双 1单
    LanguageSound   :[ true,0],  //0方 1普
    // nofupan      : true,      // 不复盘
    prefab:{

    },
    // 牌规则
    handCards   : 17,                                 // 手牌张数
    totalCards  : 136,                                // 游戏牌张数
    bBDToValue  : true,                               // 白板是否当财神值

    game_bean : [40000,400000,4000000],
    game_score : [],
    hutype1: {
        0x01: '平胡',
        0x02: '爆头',
        0x04: '杠暴',
        0x08: '财飘',
        0x10: '杠飘',
        0x20: '飘杠',
        0x40: '八对',
        0x80: '清一色',
        0x100: '十三不搭',
        0x200: '清风子'
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
                name:        '白板财神',
                checked      : true,
                interactable : false,
                data:  -1 // -1表示没有数据
            }
        ]
    }
}
jiandemahjongConfig.getWanfa = function (ruleFlag,expend,bAll) {
    expend = expend || 0;

    let wanfaStr = '玩法：';
    let kexuan = jiandemahjongConfig.createRoom.kexuan;
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
jiandemahjongConfig.getInfoForSendFriend = function (ruleFlag, expend, bAll) {
    bAll = bAll || false;
    expend = expend || 0;
    let wanfa = jiandemahjongConfig.createRoom.kexuan;

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


jiandemahjongConfig.description =

    '   [开局]\n'+

    '   四方掷两枚骰子比大小确定庄家位置，总和最大的坐东风家，为庄家，然后依次按照点数逆时针坐下(点数相同先掷骰子的为大)\n'+

    '   [抓牌]\n'+

    '   系统自动发牌，游戏在一开始，每人得到十六张牌，然后庄家先抓牌打牌。\n'+

    '   [玩法及特殊规则]\n'+

    '   1、拿牌顺序：根据骰子数决定开牌位置，逆时针拿牌顺序，庄家起手17张牌，闲家起手16张牌，结束留9墩（18张）牌，少于9墩为流局，自动结束。\n'+

    '   2、财神：白板即为财神，为万能牌。\n'+

    '   3、吃碰杠：累计吃牌最多只能吃两手，碰、杠不限制，同一轮漏碰不可再碰，吃了上家的牌后不能马上打出相同的牌，需等一轮后方可打出同样的牌。\n'+

    '   4、杠牌：从牌末抓牌，每杠一次牌扣除两张牌。\n'+

    '   5、飘财：飘财一轮中，飘财的玩家可以吃牌碰牌，其他玩家不能吃碰以及至杠，但可以暗杠胡牌。\n'+

    '   6、清一色承包制(反承包)：A玩家胡清一色牌，B被A累计吃碰3手，则两人产生承包关系，A胡牌后B要承担三家所有分数，若B胡牌则A要反承包给B单家清一色番数(返程包的前提为A要清一色听牌，否则反承包关系不存在)，此时若C玩家被A玩家吃碰了第四手牌，则A于B的承包关系取消，此时的承包于反承包关系为A于C。若不存在承包于反承包关系的其余一家胡牌，则按普通胡牌番数计算即可。（备注：反承包只承包清一色自摸番数）\n'+

    '   7、飘财承包制：A玩家飘财过程中，如果B玩家的牌被A吃或碰导致A进行2次飘财或者财杠，则A在第一次飘财后产生的番数由B玩家承包，但在这过程中任意其他一家胡牌，则A牌作废。\n'+

    '   [胡牌的基本牌型]\n'+

    '   a．11，123，123，123，123，123。\n'+

    '   b．11，123，123，123，123，111（或1111，以下也是如此）。\n'+

    '   c．11，123，123，123，111，111。\n'+

    '   d．11，123，123，111，111，111。 \n'+

    '   e．11，123，111，111，111，111。\n'+

    '   f．11，111，111，111，111，111\n'+

    '   （注：11是两张完全相同的牌，123是连续的（万、筒、索）其中一种，111是三张完全相同的牌，1111是四张完全相同且被开杠的牌。）\n'+

    '   [规则]\n'+

    '   1、平胡：基本牌型胡牌，称平胡。（1台）\n'+

    '   2、暴头：玩家在胡牌前，手上有1张财神+5比牌的情况。则下轮玩家如果自摸胡牌，即为爆头。（2台）\n'+

    '   3、八对自摸：八对是由八对将牌（可以是字牌和类型牌）+任意一张牌组成的胡牌。（2台）\n'+

    '   4、八对暴头：手上已经有八对将牌，此时任意来一张牌即可胡牌。（4台）\n'+

    '   5、杠开：自己杠牌后摸起的那张牌组成的胡牌即为杠开。（2台）\n'+

    '   6、杠暴：在杠开的情况下暴头为杠暴。（4台）\n'+

    '   7、飘杠：在先飘财再杠爆的情况下叫飘杠（8台）\n'+

    '   8、杠飘：在先杠暴的情况下在飘财为杠飘（8台）\n'+

    '   9、十三不搭：牌型为东、南、西、北、中、发、白在加上万筒条各三张。（这个三张是有要求的，他必须是一、四、七；一、五、八等类型，也就是说在任意两张牌都是不能形成吃牌的，可能产生的包括147、148、149、158、159、169、258、259、269、369。另外在以上十六张牌内有一张重复，也就是将牌即可胡。（4台）\n'+

    '   10、清一色：所有牌都是万、筒、条中其中一类，胡牌方式跟平胡一样，也需要将牌。（10台）\n'+

    '   11、清一色暴头：必须在清一色的基础上，有财神进行的暴头，在暴头过程中，必须摸上同一类型的牌，既按清一色暴头计算。（20台）\n'+

    '   12、清风子：所有牌为字牌。无需满足一般平胡要求，即可为乱风胡牌。（10台）\n'+

    '   13、抢杠胡：有人在先前已经碰过牌，摸到第四张进行杠牌。如果这张牌刚好为其中某一家可以胡的牌，则可实行抢杠，抢杠最少为6番，如果杠牌者属于杠暴，则变12番。十三不搭抢杠为12番。如果自己胡清一色抢杠为30番。其余两家不参与该盘番数，别人打出第四张牌进行杠牌也无法抢杠。暴头时也无法对别人进行抢杠。清一色抢杠为60番。\n'+

    '   14、八对飘财：手上已有八对将牌，此时抓到一个财神，即可飘财，随后可暴头胡牌。（8台）\n'+

    '   15、清八对自摸：清一色的八对牌型（20台） \n'+

    '   16、十三不搭抢杠：通过抢胡得的牌进行的胡牌（被抢者付抢杠者12台）\n'+

    '   17、抢飘财杠：在飘杠的时候被抢杠（被抢着付抢杠者24台）\n'+

    '   所有抢杠一类都是被抢杠者一人付给抢杠人\n'+

    '   所以飘财一类飘双财都是飘一财的基础×2，飘三财为飘一财基础×4，以此类推。（例如：平胡飘财4台，飘双财8台，飘三财16台；八对飘财8台，飘双财16台，飘三财32台，飘四财64台）\n'

// jiandemahjongConfig.cfgchat = {
//     chatData:  ["等一下，我看下牌",
//         "有没有的碰啊，粘在哪里干嘛",
//         "喂猪啊，地摊放满了",
//         "算数，这盘超掉解树",
//         "底下有人的，弄张吃下",
//         "个接死吃死碰的啊",
//         "家里没米了是不是，这种牌都拿来胡",
//         "让你飞死啊。",
//         "你一个人胡去胡去，难不难为情的",
//         "上碰下自摸",
//         "少吃点嘞，吃吃掉财神个",
//     ],
//     // ["快点啦，人呢掉厕所里去啦","不好意思等我一下","打来碰一下","有没有吃的啦","哼，你这个牌打的真臭"
//     //     ,"算了，算了这盘玩好不来了","今天风头好，把你们赢光","我是佩服你，你自己一个人玩好了"],
//     // chatData:  ["打快点","盯住","流局","牌被碰走","牌太差","碰一下","我要胡了"],
//     // chatRes: "resources/youxi/yunhemahjong/sound/yhmjsound/voice/"
// }
module.exports = Object.freeze(jiandemahjongConfig);
