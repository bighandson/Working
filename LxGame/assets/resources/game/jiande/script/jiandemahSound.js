var MJCommand = require('MJCommand');
const jdmj_sound = {
    1 : [
        "1w.mp3"
    ],

    2 : [
        "2w.mp3"
    ],

    3 : [
        "3w.mp3"
    ],

    4 : [
        "4w.mp3"
    ],

    5 : [
        "5w.mp3"
    ],

    6 : [
        "6w.mp3"
    ],

    7 : [
        "7w.mp3"
    ],

    8 : [
        "8w.mp3"
    ],

    9 : [
        "9w.mp3"
    ],

    // 万 end
    10 : [
        "1t.mp3"
    ],

    11 : [
        "2t.mp3"
    ],

    12 : [
        "3t.mp3"
    ],

    13 : [
        "4t.mp3"
    ],

    14 : [
        "5t.mp3"
    ],

    15 : [
        "6t.mp3"
    ],

    16 : [
        "7t.mp3"
    ],

    17 : [
        "8t.mp3"
    ],

    18 : [
        "9t.mp3"
    ],

    // 筒end

    19 : [
        "1s.mp3"
    ],

    20 : [
        "2s.mp3"
    ],

    21 : [
        "3s.mp3"
    ],

    22 : [
        "4s.mp3"
    ],

    23 : [
        "5s.mp3"
    ],

    24 : [
        "6s.mp3"
    ],

    25 : [
        "7s.mp3"
    ],

    26 : [
        "8s.mp3"
    ],

    27 : [
        "9s.mp3"
    ],

    // 条end

    28 : [
        "dong2.mp3",
    ],

    29 : [
        "nan2.mp3"
    ],

    30 : [
        "xi2.mp3"
    ],

    31 : [
        "bei2.mp3"
    ],

    32 : [
        "zhong2.mp3"
    ],

    33 : [
        "fa2.mp3"
    ],

    34 : [
        "caipiao.mp3"

    ]
};

// 吃碰杠
const jdmj_OPTSound = {
    0x02 : [  // 吃
        "chi2.mp3"
    ],
    0x04 : [  // 碰
        "peng2.mp3"
    ],
    0x08 : [ // 杠
        "gang2.mp3"
    ],
    0x8003 : [ //补花
        // 'hua.wav'
    ]
};

// 自摸胡
const jdmj_ZM = [
    "zimo.mp3",
];

//七对
const jdmj_QD = [
    "qidui.mp3",
];
//爆头
const jdmj_BT = [
    "baotou.mp3"
];
//杠爆
const jdmj_GB = [
    "gangbao.mp3"
];
//十三不搭
const jdmj_SSBD = [
    "shisanbuda.mp3"
];
//猜漂
const jdmj_CP = [
    "caipiao.mp3"
];


// const piaocai = [
//     "piaocai.mp3",
//     "piaocai(0).mp3"
// ];

var MJSound = require('MJSound');

cc.Class({
    extends: MJSound,

    properties: {

    },

    playPai : function (sex,pai){
        if(!!this.bLanguageSound){
            this._super(sex,pai);
        }else{
            let files = jdmj_sound[pai];
            this._playJDMJSoud(sex,files);
        }
    },

    playEatCmd : function(sex,opcode){
        if(!!this.bLanguageSound){
            this._super(sex,opcode);
        }else {
            let files = jdmj_OPTSound[opcode];
            this._playJDMJSoud(sex,files);
        }
    },
    playHu : function (sex,bNotZimo,chair,huflag,hutype1) {
        cc.log('胡了=========')
        if(!!this.bLanguageSound){
            this._super(sex,bNotZimo);
        }else {
            var files = jdmj_ZM;
            switch (huflag){
                case MJCommand.HUFLAG.MJR_HU_ZM:
                    files = jdmj_ZM;
                    cc.log(hutype1)
                    if(hutype1 & 0x100) {
                        files = jdmj_SSBD
                    }else if(hutype1 & 0x40){
                        files = jdmj_QD
                        cc.log('胡4')
                    }
                    else if(hutype1 & 0x8){
                        files = jdmj_CP
                        cc.log('胡3')
                    }else if(hutype1 & 0x4 ){
                        files = jdmj_GB
                        cc.log('胡2')
                    }else if(hutype1 & 0x2 ){
                        files = jdmj_BT
                        cc.log('胡2')
                    }
                    break
                // case MJCommand.HUFLAG.MJR_HU_GSKH:
                //     files = dqmj_GK;
                //     cc.log('杠开')
                //     break
                // case MJCommand.HUFLAG.MJR_HU_TH:
                //     files = dqmj_TH;
                //     cc.log('天胡')
                //     break
                // case MJCommand.HUFLAG.MJR_HU_DH:
                //     files = dqmj_DH;
                //     cc.log('地胡')
                //     break
                // default:
                //     cc.log('胡')
                //     files = dqmj_HU;
            }
            cc.log('自摸',!bNotZimo)

            this._playJDMJSoud(sex,files,chair);
        }
    },

    _playJDMJSoud : function (sex,files,chair) {
        let index = random(0,files.length);
        cc.log(files[index],index)
        let url;
        if(sex == 1){ // 男的
            url = 'resources/game/jiande/sound/boy/'
        }else{
            url = 'resources/game/jiande/sound/girl/'
        }
        SettingMgr.playSound(url + files[index]);
    },
});
