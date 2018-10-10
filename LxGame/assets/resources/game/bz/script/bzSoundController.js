
var GamePlayer = require('GamePlayer');

var bzSoundController = {};

bzSoundController.playSound = function (src) {
    let uid = UserCenter.getUserID();
    let player = GamePlayer.getPlayer(uid);
    let sex = parseInt(player.sex);
    if(sex != 1){
        sex = 2;
    }
    let music = "resources/youxi/"+SssManager.game.sourcePath+"/bzSound/"+src+"_"+sex+".mp3";
    cc.log('播放音效----',music)
    SssManager.soundCtrl.playSound(music);
}

bzSoundController.playSoundBySex = function (src,sex) {
    if(!sex){
        sex = 1;
    }
    if(sex != 1){
        sex = 2;
    }
    let music = "resources/youxi/"+SssManager.game.sourcePath+"/bzSound/"+src+"_"+sex+".mp3";
    cc.log('播放音效----',music)
    SssManager.soundCtrl.playSound(music);
}

module.exports = Object.freeze(bzSoundController);