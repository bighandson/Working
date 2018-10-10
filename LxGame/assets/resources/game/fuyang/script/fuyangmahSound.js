
const fymj_sound = {
    1 : [
        "w1.mp3"
    ],

    2 : [
        "w2.mp3"
    ],

    3 : [
        "w3.mp3"
    ],

    4 : [
        "w4.mp3"
    ],

    5 : [
        "w5.mp3"
    ],

    6 : [
        "w6.mp3"
    ],

    7 : [
        "w7.mp3"
    ],

    8 : [
        "w8.mp3"
    ],

    9 : [
        "w9.mp3"
    ],

    // 万 end
    10 : [
        "t1.mp3"
    ],

    11 : [
        "t2.mp3"
    ],

    12 : [
        "t3.mp3"
    ],

    13 : [
        "t4.mp3"
    ],

    14 : [
        "t5.mp3"
    ],

    15 : [
        "t6.mp3"
    ],

    16 : [
        "t7.mp3"
    ],

    17 : [
        "t8.mp3"
    ],

    18 : [
        "t9.mp3"
    ],

    // 筒end

    19 : [
        "s1.mp3"
    ],

    20 : [
        "s2.mp3"
    ],

    21 : [
        "s3.mp3"
    ],

    22 : [
        "s4.mp3"
    ],

    23 : [
        "s5.mp3"
    ],

    24 : [
        "s6.mp3"
    ],

    25 : [
        "s7.mp3"
    ],

    26 : [
        "s8.mp3"
    ],

    27 : [
        "s9.mp3"
    ],

    // 条end

    28 : [
        "dong.mp3",
    ],

    29 : [
        "nan.mp3"
    ],

    30 : [
        "xi.mp3"
    ],

    31 : [
        "bei.mp3"
    ],

    32 : [
        "zhong.mp3"
    ],

    33 : [
        "fa.mp3"
    ],

    34 : [
        "bai.mp3",
    ]
};

// 吃碰杠
const fymj_OPTSound = {
    0x02 : [  // 吃
        "chi.mp3"
        // "chi2.wav",
        // "chi3.wav"
    ],
    0x04 : [  // 碰
        "peng.mp3"
    ],
    0x08 : [ // 杠
        "gang.mp3"
    ],
    0x8003 : [ //补花
        // 'hua.wav'
    ]
};

// 自摸胡
const fymj_ZIMO = [
    "zimo.mp3"
];

const fymj_HU = [
    "fangchong.mp3"
];

//天胡
// const fymj_TIANHU = [
//     "tianhu.mp3"
// ];

//地胡
// const fymj_DIHU = [
//     "dihu.mp3"
// ];

var MJSound = require('MJSound');

cc.Class({
    extends: MJSound,

    properties: {

    },

    playPai : function (sex,pai){
        if(this.bLanguageSound==1){
            this._super(sex,pai);
        }else{
            let files = fymj_sound[pai];
            this._playFYMJSound(sex,files);
        }
    },

    playEatCmd : function(sex,opcode){
        if(this.bLanguageSound==1){
            this._super(sex,opcode);
        }else {
            let files = fymj_OPTSound[opcode];
            this._playFYMJSound(sex,files);
        }
    },
    playHu : function (sex,bNotZimo) {
        if(this.bLanguageSound==1){
            this._super(sex,bNotZimo);
        }else {
            let files = bNotZimo ? fymj_HU : fymj_ZIMO;
            this._playFYMJSound(sex,files);
        }
    },

    _playFYMJSound : function (sex,files) {
        let url;
        if(sex == 1){ // 男的
            url = 'resources/game/fuyang/sound/boy/'
        }else{
            url = 'resources/game/fuyang/sound/girl/'
        }
        SettingMgr.playSound(url + files);
    },
});
