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
    3 : [
        'D30.mp3'
    ],
    4 : [
        'sandaiyi.mp3'
    ],
    5 : [
        'sandaiyidui.mp3'
    ],

    //顺子
    6 : [
        'Shunzi.mp3'
    ],

    //连对
    7 : [
        'liandui.mp3'
    ],

    //三连
    8 : [
        'feiji.mp3'
    ],

    //飞机dai2
    9 : [
        'feiji.mp3'
    ],
    //feijie dai 2 dui
    10 : [
        'feiji.mp3'
    ],

    //4个的炸弹
    11 : [//444456
        'sidaier.mp3'
    ],
    12 : [//444455
        'sidaier.mp3'
    ],
    13 : [//44445566
        'sidailiangdui.mp3'
    ],
    14 : [//
        'zadan.mp3'
    ],
    //王炸
    15 : [
        'wangzha.mp3'
    ]
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

const sk_baojing = [
    'baojing.mp3'
];
//飞机
const sk_feiji = [
    'end.mp3'
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
const ddz_playAbout = {
   1: ['bujiao.mp3',],//0
    2:['jiaodizhu.mp3',],//1
    3:['buqiang.mp3',],//2
    4:['qiang.mp3',],//3
    5:['qiang2.mp3',],//4
    6:['qiang3.mp3',],//5
    7:['bujiabei.mp3',],//6
    8:['jiabei.mp3',],//7
};

// const ddz_bujiao = [
//     'boom1.mp3',
// ];
// const ddz_jiaoDizhu = [
//     'boom1.mp3',
// ];
// const ddz_buQiang = [
//     'buqiang.mp3',
// ];
// const ddz_qiang1 = [
//     'qiang.mp3',
// ];
// const ddz_qiang2 = [
//     'qiang2.mp3',
// ];
// const ddz_qiang3 = [
//     'qiang3.mp3',
// ];
// const ddz_bujiabei = [
//     'bujiabei.mp3',
// ];
// const ddz_jiabei = [
//     'jiabei.mp3',
// ];
// const ddz_baojing1 = [
//     'baojing1.mp3',
// ];
// const ddz_baojing2 = [
//     'baojing2.mp3',
// ];
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
        // if(type>8 && type != 11){
        //     type = 8;
        // }else if(type>5 && type <8){
        //     type = 6;
        // } else if(type == 8) {
        //     type = 7;
        // }
        cc.log("播放出牌声音sex：{0}，type：{1}，type：{3}，URL：{4}".format(sex,type,pai));
        var len = 0;
        for(var key in sk_sound[type]){
            len++
        }
        // cc.log(type,len,pai)
        if(len >10){
            if(pai>len) return;
            this._playSKSound(sex,sk_sound[type][pai]);
        }else{
            this._playSKSound(sex,sk_sound[type]);
        }

    },

    playAboutLandOwner : function(type,sex){
        this._playEffect(ddz_playAbout[type],sex);
    },
    // playGrabOwner:function(,type,sex){
    //     if (isQiang) {
    //         if (type == 1) {
    //             this._playEffect(ddz_qiang1,sex);
    //         } else if (type == 2) {
    //             this._playEffect(ddz_qiang2,sex);
    //         } else {
    //             this._playEffect(ddz_qiang3,sex);
    //         }
    //     } else {
    //         this._playEffect(ddz_buQiang,sex,sex);
    //     }
    // },
    // playJiaBei:function(isJiabei,sex){
    //     if (isJiabei) {
    //         this._playEffect(ddz_jiabei,sex);
    //     } else {
    //         this._playEffect(ddz_bujiabei,sex);
    //     }
    // },
    // playbaojing1:function (sex) {
    //     this._playEffect(ddz_baojing1,sex);
    // },
    playBaojing:function () {
        this._playEffect(sk_baojing);
    },
    //过牌
    playPass:function(){
        this._playEffect(sk_pass);
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

    playBaojng:function(){
        this._playEffect(sk_baojing);
    },
    //出牌
    // playHitCard:function(){
    // 	this._playEffect(sk_hitCard);
    // },

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

    _playEffect : function (files,sex) {
        // return;
        let index = random(0,files.length);
        var url = 'resources/doudizhu/sound/effect/' + files[index];
        if (!!sex) {
            if(sex == 1){  // 男的
                url = 'resources/doudizhu/sound/boy/' + files[index];
            }else {
                url = 'resources/doudizhu/sound/girl/' + files[index];
            }
        }

        cc.log("------_playEffec\nsex:{0},files:{1}".format(sex,url));
        SettingMgr.playSound(url);
    },

    _playSKSound : function (sex,filess) {
        // return;
        let index = random(0,filess.length);
        let url;
        if(sex == 1){  // 男的
            url = 'resources/doudizhu/sound/boy/' + filess[index];
        }else {
            url = 'resources/doudizhu/sound/girl/' + filess[index];
        }
        cc.log("------_playEffec\nsex:{0},files:{1}".format(sex,url));
        SettingMgr.playSound(url);
    }
});