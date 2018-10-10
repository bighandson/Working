
const hzmj_sound = {
    1 : [
        "1wan1.wav",
        "1wan2.wav",
        "1wan3.wav"
    ],

    2 : [
        "2wan1.wav"
    ],

    3 : [
        "3wan1.wav"
    ],

    4 : [
        "4wan1.wav",
        "4wan2.wav"
    ],

    5 : [
        "5wan1.wav"
    ],

    6 : [
        "6wan1.wav"
    ],

    7 : [
        "7wan1.wav",
        "7wan2.wav"
    ],

    8 : [
        "8wan1.wav"
    ],

    9 : [
        "9wan1.wav"
    ],

    // 万 end
    10 : [
        "1tong1.wav"
    ],

    11 : [
        "2tong1.wav",
        "2tong2.wav"
    ],

    12 : [
        "3tong1.wav",
        "3tong2.wav"
    ],

    13 : [
        "4tong1.wav",
        "4tong2.wav"
    ],

    14 : [
        "5tong1.wav"
    ],

    15 : [
        "6tong1.wav"
    ],

    16 : [
        "7tong1.wav",
        "7tong2.wav"
    ],

    17 : [
        "8tong1.wav"
    ],

    18 : [
        "9tong1.wav",
        "9tong2.wav"
    ],

    // 筒end

    19 : [
        "1suo1.wav",
        "1suo2.wav",
        "1suo3.wav"
    ],

    20 : [
        "2suo1.wav"
    ],

    21 : [
        "3suo1.wav",
        "3suo2.wav"
    ],

    22 : [
        "4suo1.wav",
        "4suo2.wav"
    ],

    23 : [
        "5suo1.wav",
        "5suo2.wav"
    ],

    24 : [
        "6suo1.wav",
    ],

    25 : [
        "7suo1.wav",
        "7suo2.wav"
    ],

    26 : [
        "8suo1.wav",
        "8suo2.wav",
        "8suo3.wav"
    ],

    27 : [
        "9suo1.wav"
    ],

    // 条end

    28 : [
        "dong1.wav",
        "dong2.wav"
    ],

    29 : [
        "nan1.wav",
        "nan2.wav"
    ],

    30 : [
        "xi1.wav",
        "xi2.wav"
    ],

    31 : [
        "bei1.wav",
        "bei2.wav"
    ],

    32 : [
        "zhong1.wav"
    ],

    33 : [
        "fa1.wav",
        "fa2.wav",
        "fa3.wav"
    ],

    34 : [
        "bai1.wav",
        "bai2.wav",
        "bai3.wav",
        "bai4.wav"
    ]
};

// 吃碰杠
const hzmj_OPTSound = {
    0x02 : [  // 吃
        "chi1.wav",
        "chi2.wav",
        "chi3.wav"
    ],
    0x04 : [  // 碰
        "peng1.wav",
        "peng2.wav",
        "peng3.wav"
    ],
    0x08 : [ // 杠
        "gang1.wav",
        "gang2.wav"
    ],
    0x8003 : [ //补花
        // 'hua.wav'
    ]
};

// 自摸胡
const hzmj_ZIMO = [
    "hu1.wav",
    "hu2.wav",
    "hu3.wav"
];

// 点炮
const hzmj_HU = [
    "hu1.wav",
    "hu3.wav"
];

var MJSound = require('MJSound');

cc.Class({
    extends: MJSound,

    properties: {

    },

    playPai : function (sex,pai){
        if(!!this.bLanguageSound){
            this._super(sex,pai);
        }else{
            let files = hzmj_sound[pai];
            this._playHZMJSoud(sex,files);
        }
    },

    playEatCmd : function(sex,opcode){
        if(!!this.bLanguageSound){
            this._super(sex,opcode);
        }else {
            let files = hzmj_OPTSound[opcode];
            this._playHZMJSoud(sex,files);
        }
    },
    playHu : function (sex,bNotZimo) {
        if(!!this.bLanguageSound){
            this._super(sex,bNotZimo);
        }else {
            let files = bNotZimo ? hzmj_HU : hzmj_ZIMO;
            this._playHZMJSoud(sex,files);
        }
    },

    _playHZMJSoud : function (sex,files) {
        let index = random(0,files.length);
        let url;
        if(sex == 1){ // 男的
            url = 'resources/game/hangzhou/sound/boy/'
        }else{
            url = 'resources/game/hangzhou/sound/girl/'
        }
        SettingMgr.playSound(url + files[index]);
    },
});
