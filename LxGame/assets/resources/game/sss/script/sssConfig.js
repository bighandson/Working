var yongkangsssConfig = {
    gameid: 320,
    name: '罗松',
    createRoomPreb: 'sss/sssright',
    shareName: '罗松',
    gameScene: 'yksssScene',                               // 游戏场景
    rule: 'yksssRule',                                // 游戏规则
    record: 'SSSRecordController',                      // 复盘控制脚本
    sound: 'yksssSound',                               // 声音控制
    // title                   : 'youxi/yongkangmah/texture/hsmj_title',
    // chatSound               : 'resources/youxi/yongkangsss/sound/chat',   //常用语,如果有方言版本填上路径
    server: 'game.gameHandler',                         // 服务器
    freeroombtnPath: 'sss',                                      // 游戏场 游戏图标资源

    chatNodePos: cc.p(-320, 180),                                     // 快捷短语 相对坐标

    SingleClick: [false, 0],   //  0双 1单  游戏内设置配置
    LanguageSound: [false, 0],  //  0方 1普  游戏内设置配置
    chatPosition : {x:300,y:-400},
    // 游戏自由预制体
    prefab: {

    },

    // 房卡房间创建时的配置
    createRoom: {
        jushu: [
            {
                name: '10局（房卡x2）',
                num : 1,
                gamebh: '00000216'
            },
            {
                name: '20局（房卡x4）',
                num : 2,
                gamebh: '00000217'
            },
            {
                name: '30局（房卡x6）',
                num : 3,
                gamebh: '00000218'
            }
        ],
        renshu: [
            {
                name: '5人',
                num : 5,
                data: 0x08// -1表示没有数据
            },
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
            {
                name: '红波浪模式',
                checked: true,
                interactable: true,
                data: 0x80// -1表示没有数据
            },
            {
                name: '多一色',
                checked: false,
                interactable: true,
                data: 0x100 // -1表示没有数据
            },
        ],

        mapai: [
            {
                name: "红心A",
                data: 0x40,
            },
            {
                name: "红心五",
                data: 0x10,
            },
            {
                name: "红心十",
                data: 0x20,
            },
        ],

    },
}
yongkangsssConfig.getWanfa = function () {

}

yongkangsssConfig.description =
    '玩法介绍：\n'+
	'罗松游戏完美移植流行于浙江等地的扑克游戏，玩法支持多名玩家同时游戏，通过创建房间，邀请好友模式来进行游戏。\n'+
	'游戏开始后，系统将洗好的牌发给玩家，每位玩家获得13张，玩家将按手牌3-5-5的模式，配出头道，中道，尾道牌。配牌完成后与其他玩家两两进行比较，从头道依次比较三道牌大小，最终结算积分。\n'+
'比牌时，首先比较牌型，牌型一致再比较点数大小，最后比较花色。赢家积分：+1；输家积分：-1；当玩家配出指定牌型，会赢得更多积分。\n'+
	'头道赢牌牌型为三条时积分+3；中道赢牌牌型为葫芦时积分+2，铁支积分+8，同花顺积分+10，五同积分+20；尾道赢牌牌型为铁支时，同花顺积分+5，五同积分+10；\n'+
	'当一名玩家三道牌均大过另一名玩家，记为单杀，积分翻倍；\n'+
	'当一名玩家对其他全部玩家都造成单杀，记为全垒打，赢取的积分会在单杀的基础上再次翻倍。2人模式下全垒打不会生效。\n'+
'牌型介绍：\n'+
	'游戏模式：游戏支持红波浪玩法和多一色玩法。\n'+
'【红波浪模式】\n'+
	'红波浪模式下，单杀得分超过12分，以12分计。全垒打则在基础上翻倍，最高24分（针对单个玩家）。\n'+
'【多一色】\n'+
	'多一色模式下，牌库中多增加13张一色牌型“黑桃A-K”。多一色牌型的情况下会出现新的牌型“五同”（5张相同的牌），“五同”牌型为最大牌型大于“同花顺”。多一色模式特殊牌型有“一条龙”和“一条清龙”\n'+
	'两种特殊牌型，单杀或全垒打无封顶。\n'+
	'特殊牌型：游戏中有以下两种特殊牌型，特殊牌型可直接获胜并获得固定积分。\n'+
	'一条清龙：A,K,Q...4.3.2的清一色顺子。出现一条龙的玩家，可直接获得104分。（一条清龙特殊牌型只出现在清一色玩法中）\n'+
	'一条龙：A,K,Q...4.3.2的顺子。出现一条龙的玩家，可直接获得26分。（一条龙特殊牌型在多一色玩法中计52分）\n'+
	'注：特殊牌型，出现后点击相应按钮即可完成配牌，若玩家手动配牌，不记做特殊牌型。\n'+
	'马牌：拥有马牌的玩家，输赢的积分会额外翻倍。例如：当单杀达到封顶12分时，拥有马牌可以获得24分。特殊牌型也可获得马牌翻倍加成'


module.exports = Object.freeze(yongkangsssConfig);
