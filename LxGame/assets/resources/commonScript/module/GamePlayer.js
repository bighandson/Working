/**
 * 游戏玩家信息
 */
var config = require('Config');
var GamePlayer =  {};
GamePlayer.sitStatus = cc.Enum({
    Active  : -1,
    Ready   : -1,
    Playing : -1,
    Offline : -1,
    Escaped : -1,
    Null : -1
});

var Player = function (sitIn) {
    if(!!sitIn){
        this.setSitIn(sitIn);
    }
}

GamePlayer.getNum = function () {
    return Object.keys(this.players).length;
}


Player.prototype.setSitIn = function (sitIn) {
    this.userid = sitIn.userid;
    this.tableid = sitIn.tableid;
    this.seatid = sitIn.seatid;
    this.nick = formatName(sitIn.nick,8);
    this.classId = sitIn.classId;
    this.draw = sitIn.draw;
    this.escape = sitIn.escape;
    this.level = sitIn.level;
    this.lost = sitIn.lost;
    this.money = sitIn.money;
    this.score = sitIn.score || 0;
    this.sex = sitIn.sex;
    this.total = sitIn.total;
    this.totalwon = sitIn.totalwon;
    this.userImage = sitIn.userImage;
    this.won = sitIn.won;
    this.status = sitIn.status;
    if(!isUrl(sitIn.userImage)){
        let sexs = sitIn.sex==1?'man':'woman';
        this.userImage = 'commonRes/other/'+sexs;
    }
}

Player.prototype.updateScore = function () {

}

//GamePlayer.serverType = 'unknow';

GamePlayer.reset = function () {
    this.players = {};
}

GamePlayer.getUserStatus=function(userid){
    var player = this.getPlayer(userid);
    if(!player) return;

    return player.status;
}

GamePlayer.setUserStatus=function(userid,status){
    var player = this.getPlayer(userid);
    if(!player) return;

    player.status = status;
}

GamePlayer.removeAllPlayers = function () {
    this.players = {};
}

GamePlayer.addPlayers = function (sitIns) {
    sitIns.forEach(function (sitIn) {
        GamePlayer.addPlayer(sitIn);
    });
}

GamePlayer.addPlayer = function (sitIn) {
    if(!sitIn || !sitIn.userid){
        return null;
    }

    this.players[sitIn.userid] = new Player(sitIn);

    return this.players[sitIn.userid];
}

GamePlayer.getPlayer = function (userid) {
    if(!this.players[userid]) return null;
    return this.players[userid];
}

// GamePlayer.getPlayerBySeatId = function(seatId){
//     for (let player of this.players){
//         if (seatId == player.seatid){
//             return player;
//         }
//     }
//     return null;
// }

GamePlayer.getSeatByUserid = function (userid) {
    if(!this.players[userid]) return 0;
    return this.players[userid].seatid;
}

GamePlayer.removePlayer = function (userid) {
    if(!this.players[userid]){
        return;
    }
    delete this.players[userid];
}


GamePlayer.PlayerState = cc.Enum({
    Active	  : -1,
    Ready	  : -1,
    Playing	  : -1,
    Offline	  : -1,
    Escaped   : -1,
    Deposit   : -1,     // 托管
    Exit      : -1
});

module.exports = GamePlayer;
