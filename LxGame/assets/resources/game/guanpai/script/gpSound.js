const sk_sound = {
    //单张
    1 : {
        1:[
            '2.mp3'
        ],
        2 : [
            '3.mp3'
        ],

        3 : [
            '4.mp3'
        ],

        4 : [
            '5.mp3'
        ],

        5 : [
            '6.mp3'
        ],

        6 : [
            '7.mp3'
        ],

        7 : [
            '8.mp3'
        ],

        8 : [
            '9.mp3'
        ],

        9 : [
            '10.mp3'
        ],

        10 : [
            'J.mp3'
        ],

        11 : [
            'Q.mp3'
        ],

        12 : [
            'K.mp3'
        ],

        13 : [
            'A.mp3'
        ],

        14 : [
            'Joke_s.mp3'
        ],

        15 : [
            'Joke.mp3'
        ]
    },

    //对子
    2 : {
        1:[
            '22.mp3'
        ],
        2 : [
            '33.mp3'
        ],

        3 : [
            '44.mp3'
        ],

        4 : [
            '55.mp3'
        ],

        5 : [
            '66.mp3'
        ],

        6 : [
            '77.mp3'
        ],

        7 : [
            '88.mp3'
        ],

        8 : [
            '99.mp3'
        ],

        9 : [
            '1010.mp3'
        ],

        10 : [
            'JJ.mp3'
        ],

        11 : [
            'QQ.mp3'
        ],

        12 : [
            'KK.mp3'
        ],

        13 : [
            'AA.mp3'
        ],
    },

    //三张
    3 : [
        'D30.mp3'
    ],

    //连对
    4 : [
        'liandui.mp3'
    ],

    //三连
    5 : [
        'liansan.mp3'
    ],

    //三连二
    6 : [
        'threeAndTwo.mp3'
    ],

    //顺子
    7 : [
        'Shunzi.mp3'
    ],

    //飞机
    8 : [
        'feiji.mp3'
    ],
    //三连二
    9 : [
        'threeAndTwo.mp3'
    ],
    //飞机
    10 : [
        'feiji.mp3'
    ],

    //王炸
    11 : [
        'Boom.mp3'
    ],
    //王炸
    12 : [
        'Boom.mp3'
    ],
};

//过牌
const sk_pass = [
    'pass.mp3',
];

//大过上家
const sk_da = [
    'Da.mp3'
];

//开牌
const sk_start = [
    'start.mp3'
];

//出牌
const sk_outCatd = [
    'cardOut.mp3'
];
//发牌
const sk_fapai = [
    'Special_Dispatch.mp3'
];

//胜利
const sk_win = [
    'win.mp3'
];

//失败
const sk_lose = [
    'lose.mp3'
];


//飞机
const sk_feiji = [
    'plane.ogg'
];


//炸弹
const sk_boom1 = [
    'boom1.mp3',
];
const sk_boom2 = [
    'boom2.mp3',
];
const sk_boom3 = [
    'boom3.mp3',
];
const sk_boom4 = [
    'boom4.mp3',
];
const sk_boom5 = [
    'boom5.mp3',
];

//结算
const sk_chouma = [
    'end.mp3'
];
cc.Class({
    extends: cc.Component,
    properties: {

    },

    onLoad : function () {
        this.bLanguageSound = getMJLanguageSound();  // 默认方言
    },

    // 设置方言
    setPlayLanguageSound : function (sound) {
        this.bLanguageSound = sound;
    },

    /**
     * 出牌声音
     * @param sex
     * @param pai   2 - A
     * @param type  牌的类型，单张，对子，三连，炸弹
     */
    playPai : function(sex,pai,type){
        var len = 0;
        for(var key in sk_sound[type]){
            len++
        }
        if(len >10){
            if(pai>len) return;
            this._playSKSound(sex,sk_sound[type][pai]);
        }else{
            this._playSKSound(sex,sk_sound[type]);
        }
    },

    //过牌
    playPass:function(sex){
        if (sex == 1) {
            var url = 'resources/game/guanpai/sound/boy/pass.mp3';
        }else{
            var url = 'resources/game/guanpai/sound/girl/pass.mp3';
        }

        SettingMgr.playSound(url);
    },

    //开牌
    playStart:function(){
        this._playEffect(sk_start);
    },

    //出牌
    playOutpai : function(){
        this._playEffect(sk_outCatd);
    },
    //发牌
    playFapai:function(){
        this._playEffect(sk_fapai);
    },

    //胜利
    playWin:function(){
        this._playEffect(sk_win);
    },

    //失败
    playLose:function(){
        this._playEffect(sk_lose);
    },

    //飞机
    playFeiji:function(){
        this._playEffect(sk_feiji);
    },

    //炸弹
    playBoom1:function(){
        this._playEffect(sk_boom1);
    },
    playBoom2:function(){
        this._playEffect(sk_boom2);
    },
    playBoom3:function(){
        this._playEffect(sk_boom3);
    },
    playBoom4:function(){
        this._playEffect(sk_boom4);
    },
    playBoom5:function(){
        this._playEffect(sk_boom5);
    },
    //结算
    playEnd:function(){
        this._playEffect(sk_chouma);
    },

    _playEffect : function (files) {
        // return;
        let index = random(0,files.length);
        let url = 'resources/game/guanpai/sound/effect/' + files[index];
        SettingMgr.playSound(url);
    },

    _playSKSound : function (sex,filess) {
        // return;
        let index = random(0,filess.length);
        let url;
        if(sex == 1){  // 男的
            url = 'resources/game/guanpai/sound/boy/' + filess[index];
        }else {
            url = 'resources/game/guanpai/sound/girl/' + filess[index];
        }
        SettingMgr.playSound(url);
    }
});