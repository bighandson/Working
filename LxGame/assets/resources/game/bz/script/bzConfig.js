var GamePlayer = require('GamePlayer');

var fuyangbzConfig = {
    gameid                  : 306,
    name                    : '八张',
    createRoomPreb          : 'bz/bzright',
    shareName               : '八张',
    gameScene               : 'bzScene',                        // 游戏场景
    rule                    : 'bzRule',                         // 游戏规则
    record                  : 'bzRecordController',            // 复盘控制脚本
    sound                   : 'bzSound',                        // 声音控制
    chatSound               : 'resources/game/bz/chat',         //常用语,如果有方言版本填上路径
    server                  : 'game.gameHandler',               // 服务器
    ifnew                   : true,
    freeroombtnPath         : 'bz',
    SingleClick             : [ true,0], //  0双 1单
    LanguageSound           : [ true,0],  //0方 1普
    chatNodePos             : cc.p(-320, 180),                  // 快捷短语 相对坐标
    prefab                  :{},
    sssPrefabs              :{},
    // 房卡房间创建时的配置
    createRoom: {
        jushu: [
            {
                name: '10局（房卡x4）',
                num : 1,
                gamebh : '00000129'
            },
            {
                name: '20局（房卡x8）',
                num : 2,
                gamebh : '00000130'
            },
            {
                name: '30局（房卡x12）',
                num : 3,
                gamebh : '00000131'
            }
        ],
        renshu: [
            {
                name: '2人 ',
                num : 2,
                data: 0x02 // -1表示没有数据
            },
            {
                name: '3人',
                num : 3,
                data: 0x03// -1表示没有数据
            },
            {
                name: '4人',
                num : 4,
                data: 0x04// -1表示没有数据
            },
            {
                name: '5人',
                num : 5,
                data: 0x05// -1表示没有数据
            },
            {
                name: '6人',
                num : 6,
                data: 0x06// -1表示没有数据
            },
        ],
        wanfa: [
            {
                name: '不打枪',
                data: 0x10// -1表示没有数据
            },
            {
                name: '红波浪',
                data: 0x100// -1表示没有数据
            },
            {
                name: '大小王',
                data: 0x80 // -1表示没有数据
            },
            {
                name: '特殊牌型',
                data: 0x40 // -1表示没有数据
            },
        ],
        kexuan: [
            {
                name: '全牌',
                data: 0x08// -1表示没有数据
            },
            {
                name: '5以上',
                data: 0x28 // -1表示没有数据
            },
            {
                name: '7以上',
                data: 0x38 // -1表示没有数据
            },
        ]
    },
}

fuyangbzConfig.getWanfa = function (ruleFlag,expend,bAll) {

    let wanfaStr = '';

    let ren = GamePlayer.getNum();
    let queren = SssManager.ruleInfo.m_nTruePlayers - ren;
    const zhuanhuan = ['零','一','二','三','四','五','六','七','八','九'];
    let queStr = zhuanhuan[ren] +'缺' + zhuanhuan[queren] + ',';

    wanfaStr += queStr;

    wanfaStr += SssManager.ruleInfo.m_nTruePlayers + '人,';

    if(SssManager.ruleInfo.m_bAllTeShuCardType){
        wanfaStr += "特殊牌型,";
    }
    if(SssManager.ruleInfo.HasJoker){
        wanfaStr += "大小王,";
    }
    if(SssManager.ruleInfo.HasRedWave){
        wanfaStr += "红波浪模式,";
    }else{
        wanfaStr += "不打枪,";
    }

    wanfaStr += " 牌型：";
    if(SssManager.ruleInfo.HoldTypeValue == 5){
        wanfaStr += "5以上,";
    }else if(SssManager.ruleInfo.HoldTypeValue == 7){
        wanfaStr += "7以上,";
    }else if(SssManager.ruleInfo.HoldTypeValue == 10){
        wanfaStr += "全牌,";
    }

    if(SssManager.ruleInfo.zhifu){
        wanfaStr += 'AA支付!';
    }else{
        wanfaStr += '房主支付!';
    }

    cc.log('玩法',wanfaStr);
    return wanfaStr;

}

fuyangbzConfig.getWanfa1 = function (ruleFlag,expend,bAll) {
    
    let strArray=[];

    let renshu = SssManager.ruleInfo.m_nTruePlayers + '人,';

    let wanfaStr = '';
    let wanfaStr1 = '';
    if(SssManager.ruleInfo.m_bAllTeShuCardType){
        wanfaStr += "特殊牌型,";
    }

    if(SssManager.ruleInfo.HasJoker){
        wanfaStr += "大小王,";
    }

    if(SssManager.ruleInfo.HasRedWave){
        wanfaStr += "红波浪模式!";
    }else{
        wanfaStr += "不打枪!";
    }

    let paixing = "";
    if(SssManager.ruleInfo.HoldTypeValue == 5){
        paixing += "5以上";
    }else if(SssManager.ruleInfo.HoldTypeValue == 7){
        paixing += "7以上";
    }else if(SssManager.ruleInfo.HoldTypeValue == 10){
        paixing += "全牌";
    }

    let zhifu = '';
    if(SssManager.ruleInfo.zhifu){
        zhifu += 'AA支付!';
    }else{
        zhifu += '房主支付!';
    }

    strArray.push(renshu);
    strArray.push(wanfaStr + zhifu);
    strArray.push(paixing);
    strArray.push(zhifu);
    strArray.push(wanfaStr1);
    
    cc.log('玩法',wanfaStr);
    return strArray;
}



fuyangbzConfig.description =
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



module.exports = Object.freeze(fuyangbzConfig);
