
const LOGIN_METHOD = {};

// 登陆方式
LOGIN_METHOD.unkown = 0;
LOGIN_METHOD.uuid = 1;
LOGIN_METHOD.wechat = 2;
LOGIN_METHOD.userid = 3;

//首页场景按钮类型
var TAP_STYLE = {};

TAP_STYLE.jinbi = 0;          // 金币
TAP_STYLE.score = 1;          // 积分
TAP_STYLE.room = 2;           // 房卡
TAP_STYLE.match = 3;          // 比赛
TAP_STYLE.more = 4;           // 更多
TAP_STYLE.no = 5;
TAP_STYLE.game = 99;          // 游戏

var ROOM_LEVEL = {};          // 游戏房间等级
ROOM_LEVEL.primary = 1;       // 初级
ROOM_LEVEL.middle  = 2;       // 中级
ROOM_LEVEL.senior  = 3;       // 高级

// 账号类型
var ZHLX = {};
ZHLX.jinbi    = 1;   // 用户金币
ZHLX.yinhanbi = 2;   // 用户银行游戏币
ZHLX.youxibi  = 3;   // 用户身上游戏币
ZHLX.fangka   = 4;   // 用户房卡

// 支付渠道
var ZFQD = {};
ZFQD.ipa   = '01';
ZFQD.wxpay = '02';
ZFQD.alipay = '03';
ZFQD.qiye = '05';

module.exports = {
    LOGIN_METHOD : Object.freeze(LOGIN_METHOD),
    TAP_STYLE    : Object.freeze(TAP_STYLE),
    ROOM_LEVEL   : Object.freeze(ROOM_LEVEL),
    ZHLX         : ZHLX,
    ZFQD         : ZFQD
}