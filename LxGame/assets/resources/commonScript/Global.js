//
// Author: Amao
// Date: 2018-03-09 10:15:26
//
window.Global = {};

window.Global.ChatMsgList = [];

window.Global.FriendMsgList = [];

var MaxSvaeMsg = 20;

window.Global.init = function (){
	cc.log('开始监听')
	pomelo.on('Resp_transBoardCast',chatMsgRecive.bind(this))
	pomelo.on('Resp_transP2P',friendMsgRecive.bind(this))

}

// 接受好友消息
var friendMsgRecive = function (msg){
	cc.log('好友消息===',msg)
	Global.FriendMsgList.push(msg)

	GlobEvent.emit('changeFriendMsg');
}

// 几首世界消息
var chatMsgRecive = function (msg){
	cc.log('世界消息===',msg)
	if (Global.ChatMsgList.length >= MaxSvaeMsg) {
        Global.ChatMsgList.shift();  // 删除第一位
	}
	Global.ChatMsgList.push(msg)

	GlobEvent.emit('addChatMsg',msg);
}