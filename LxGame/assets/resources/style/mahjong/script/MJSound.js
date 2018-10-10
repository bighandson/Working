/**
 * 麻将 声音基类
 */

// 点击牌
const Common_click = [
    'click.wav'
];

// 出牌
const Common_dealout = [
    'dealout.wav'
];

// 发牌
const Common_fapai = [
    'fapai.wav'
];

// 开局
const Common_start = [
    'kaiju.wav'
];

// 掷骰子
const Common_dice = [
    'touzi.mp3'
];

// 胜利
const Common_win = [
    'shengli.wav'
];

// 失败
const Common_lost = [
    'shibai.wav'
];

const Common_hudong = [
    'hudong.mp3'
];

// 吃碰杠
const Common_OPTSound = {
    0x02 : [  // 吃
        'chi.wav'
    ],
    0x04 : [  // 碰
        'peng.wav'
    ],
    0x08 : [ // 杠
        'gang.wav'
    ],
    0x8003 : [ //补花
        'hua.wav'
    ]
};

// 自摸胡
const Common_ZIMO = [
    'zimo.wav',
    'hu.wav'
];

// 点炮
const Common_HU = [
    'hu.wav'
];

// 流局
const Common_MissCarry = [
    'liuju.wav'
];

// 牌声音 ： 普通话
const Common_Pai = {
    // 万：
    1 : [
        'w1.wav'
    ],
    2 : [
        'w2.wav'
    ],
    3 : [
        'w3.wav'
    ],
    4 : [
        'w4.wav'
    ],
    5 : [
        'w5.wav'
    ],
    6 : [
        'w6.wav'
    ],
    7 : [
        'w7.wav'
    ],
    8 : [
        'w8.wav'
    ],
    9 : [
        'w9.wav'
    ],
    // 同
    10 : [
        't1.wav'
    ],
    11 : [
        't2.wav'
    ],
    12 : [
        't3.wav'
    ],
    13 : [
        't4.wav'
    ],
    14 : [
        't5.wav'
    ],
    15 : [
      't6.wav'
    ],
    16 : [
        't7.wav'
    ],
    17 : [
        't8.wav'
    ],
    18 : [
        't9.wav'
    ],
    // 条
    19 : [
        's1.wav'
    ],
    20 : [
        's2.wav'
    ],
    21 : [
        's3.wav'
    ],
    22 : [
        's4.wav'
    ],
    23 : [
        's5.wav'
    ],
    24 : [
        's6.wav'
    ],
    25 : [
        's7.wav'
    ],
    26 : [
        's8.wav'
    ],
    27 : [
        's9.wav'
    ],
    // 东南西北
    28 : [
        'dong.wav'
    ],
    29 : [
        'nan.wav'
    ],
    30 : [
        'xi.wav'
    ],
    31 : [
        'bei.wav'
    ],
    32 : [
        'zhong.wav'
    ],
    33 : [
        'fa.wav'
    ],
    34 : [
        'bai.wav'
    ]
};

var LoadGame = require('LoadGame')
cc.Class({
    extends: cc.Component,
    properties: {
        
    },

    onLoad : function () {
        this.bLanguageSound = getMJLanguageSound();  // 默认方言
        let game = LoadGame.getCurrentGame()
        if(!!game){
            if(!!game.LanguageSound && !!game.LanguageSound.length){
                this.bLanguageSound = game.LanguageSound[1];
                this.bLanguageSound = parseInt(cc.sys.localStorage.getItem('LanguageSound') || this.bLanguageSound);
            }else {
                this.bLanguageSound = parseInt(cc.sys.localStorage.getItem('LanguageSound') || 0);
            }
        }



    },

    // 设置方言
    setPlayLanguageSound : function (sound) {
        this.bLanguageSound = sound;
    },

    /**
     * 播放胡声音
     * @param sex
     * @param pai
     * @param bNotZimo  是否自摸， 默认自摸
     */
    playHu : function (sex,bNotZimo,chair,huflag,hutype1) {
        bNotZimo = bNotZimo || false;
        let files;
        if(bNotZimo){
            files = Common_HU;
        }else {
            files = Common_ZIMO;
        }
        this._playMJSound(sex,files);
    },
    //牌声音播放
    playPai : function (sex,pai,chair,isBD) {
        this._playMJSound(sex,Common_Pai[pai]);
    },

    // 吃 碰 杠 补花
    playEatCmd : function (sex,opcode) {
        let files = Common_OPTSound[opcode];
        this._playMJSound(sex,files);
    },
    
    // 流局
    playMissCarry : function () {
        this._playEffect(Common_MissCarry);
    },
    
    // 点击牌
    playClickPai : function () {
        this._playEffect(Common_click);
    },

    // 出牌声音
    playDealout : function () {
        this._playEffect(Common_dealout);
    },

    // 胜利
    playWin : function () {
        this._playEffect(Common_win);
    },
    
    // 失败
    playLost : function () {
        this._playEffect(Common_lost);
    },
    
    playMovePai : function () {
        this._playEffect(Common_hudong);
    },
    
    // 发牌
    playFapai : function () {
        this._playEffect(Common_fapai);
    },

    // 开局
    playGameStart : function () {
        this._playEffect(Common_start);
    },

    // 摇撒子
    playDice : function () {
        this._playEffect(Common_dice);
    },


    _playEffect : function (files) {
        let index = random(0,files.length);
        let url = 'resources/style/mahjong/sound/effect/' + files[index];
        SettingMgr.playSound(url);
    },
    
    _playMJSound : function (sex,filess) {
        let index = random(0,filess.length);
        let url;
        if(sex == 1){  // 男的
            url = 'resources/style/mahjong/sound/mjsound/boy/' + filess[index];
        }else {
            url = 'resources/style/mahjong/sound/mjsound/girl/' + filess[index];
        }

        SettingMgr.playSound(url);
    }
});
