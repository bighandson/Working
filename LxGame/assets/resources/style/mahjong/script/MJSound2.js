
var MJSound = require('MJSound');

cc.Class({
    extends: MJSound,

    properties: {

    },
  
    _playMJSound : function (sex,filess) {
        let index = random(0,filess.length);
        let url;
        if(sex == 1){  // 男的
            url = 'resources/mahjong/sound1/mjsound/boy/' + filess[index];
        }else {
            url = 'resources/mahjong/sound1/mjsound/boy/' + filess[index];
        }

        SettingMgr.playSound(url);
    }
});
