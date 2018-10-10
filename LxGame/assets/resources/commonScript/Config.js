
// var Constants = require('Constants');
// var TapStyle = Constants.TAP_STYLE;


var jiandeMah = require('jiandemahConfig')
var fuyangMah = require('fuyangmahConfig')
var sss       = require('sssConfig')
var bz        = require('bzConfig')
var gp        = require('gpConfig')
var xsMah     = require('xiaoshanmahConfig')
var ddz     = require('doudizhuConfig')
var hzMah     = require('hangzhoumahConfig')
var gdy     = require('gandengyanConfig')
var sky     = require('sankouyiConfig')

const config = {
    jgm          : '018',
    ffqd         : '001',
    scretKey     : 'bnngoo_hzmj_session_secret',
    lobbyScene   : 'hallScene',                       // 大厅
    loginScene   : 'loginScene',                       // 登陆场景
    roomScene    : 'gameScene',                          // 房间场景
    version      : '2.0.96',
    backMusic    : 'resources/commonRes/sound/bg2.mp3',  // 背景声音
    clickEffect  : 'resources/commonRes/sound/click.wav',   // 点击音效
    appName      : "乐享游戏天天",
    downLink     :  'http://www.bnngoo.com/down/yxtt',
    isRelease     : 1,           // //0: 测试  1: 生产
};

config.games = {
    129 : hzMah,
    160 : jiandeMah,
    164 : fuyangMah,
    306 : bz,
    320 : sss,
    308 : gp,
    128 :xsMah,
    311 : ddz,
    120 : gdy,
    321 : sky,
};

config.sort = [160,129,164,128,320,308,311,120,306]


config.weburl = 'http://agent2.bnngoo.com:3001';   // 支付，语音聊天， 热更新, 错误日志提交
config.gates = [

	{
		host : 'lxagent.bnngoo.net',
		port : 3010
	},
  //  {
	// 	host : 'agenttest.bnngoo.com',
	// 	port : 3010
	// },
    // {
    //     host : '118.31.22.219',
    //     port : 3010
    // }

];



config.getGameById = function (gameid) {
    return this.games[gameid];
}

module.exports = Object.freeze(config);