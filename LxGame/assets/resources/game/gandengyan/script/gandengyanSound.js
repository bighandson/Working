
var OPT_CODE = require('MJCommand').OPT_CODE;
var MJSound = require('MJSound');
var gandengyanCardResoure = require("gandengyanCardResource")
var GDYCMD = require("GDYCMD")

var BaiGangSound = [
  'buhua.mp3'
];

var Sound_Path = [
    'a/',
    'b/'
]

var SexName=[
'female',
'man'
]

var SexNameGDY=[
'girl',
'boy'
]

const yuhuan_sound = {
    // 万
    1  : ['w1.mp3'],
    2  : ['w2.mp3'],
    3  : ['w3.mp3'],
    4  : ['w4.mp3'],
    5  : ['w5.mp3'],
    6  : ['w6.mp3'],
    7  : ['w7.mp3'],
    8  : ['w8.mp3'],
    9  : ['w9.mp3'],

    // 筒
    10 : ['t1.mp3'],
    11 : ['t2.mp3'],
    12 : ['t3.mp3'],
    13 : ['t4.mp3'],
    14 : ['t5.mp3'],
    15 : ['t6.mp3'],
    16 : ['t7.mp3'],
    17 : ['t8.mp3'],
    18 : ['t9.mp3'],

    // 条
    19 : ['s1.mp3'],
    20 : ['s2.mp3'],
    21 : ['s3.mp3'],
    22 : ['s4.mp3'],
    23 : ['s5.mp3'],
    24 : ['s6.mp3'],
    25 : ['s7.mp3'],
    26 : ['s8.mp3'],
    27 : ['s9.mp3'],

    28 : ['dong.mp3'],
    29 : ['nan.mp3'],
    30 : ['xi.mp3'],
    31 : ['bei.mp3'],
    32 : ['zhong.mp3'],
    33 : ['fa.mp3'],
    34 : ['bai.mp3']
};

// 吃碰杠
const yuhuan_OPTSound = {
    0x02 : [  // 吃
        'chi.mp3'
    ],
    0x04 : [  // 碰
        'peng.mp3'
    ],
    0x08 : [ // 杠
        'gang.mp3'
    ],
    0x8003 : [ //补花
        // 'hua.wav'
        'gangbai.mp3'
    ]
};

const yuhuan_Hu = [
    'hu.mp3'
]

cc.Class({
    extends: MJSound,

    properties: {

    },

    onLoad : function () {
        this._super();
        this._index = random(0,Sound_Path.length)
    },
    playbuhua:function(sex)
    {
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/snd_buhua.mp3'
        SettingMgr.playSound(url);
    },
    playchi:function(sex)
    {
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/snd_chi.mp3'
        SettingMgr.playSound(url);
    },
    playgang:function(sex)
    {
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/snd_gang.mp3'
        SettingMgr.playSound(url);
    },
    playhu:function(sex)
    {
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/snd_hu.mp3'
        SettingMgr.playSound(url);
    },

    playtaohua:function(sex,Index)
    {
        let _index=['snd_taohua_tian','snd_taohua_di','snd_taohua_changsan','snd_taohua_yinpai']
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/'+_index[Index]+'.mp3'
        SettingMgr.playSound(url);
    },
    playxianhua:function(sex)
    {
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/snd_xianhua.mp3'
        SettingMgr.playSound(url);
    },
    playoutcard:function(sex,carddata)
    {
        let cardname = 'snd{0}.mp3'.format(gandengyanCardResoure.getCardSoundNameByData(carddata));
        let url = 'resources/game/gandengyan/sound/'+SexName[sex]+'/'+cardname;
        SettingMgr.playSound(url);
    },

    playoutcardGDY:function(sex,cardtype,carddata)
    {
        sex = sex == 2 ? 0 : 1;//排除0或1之外的数字,以防无法播放音效.
        if( cardtype == GDYCMD.CardType.CardType_single )
        {
            let cardname = "{0}.mp3".format(carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+cardname;
            SettingMgr.playSound(url); 
        }
        else if( cardtype == GDYCMD.CardType.CardType_duizhi )
        {
            let cardname = "{0}{1}.mp3".format(carddata,carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+cardname;
            SettingMgr.playSound(url); 
        }
        else if( cardtype == GDYCMD.CardType.CardType_shunzi )
        {
            //let cardname = "{0}{1}".format(carddata,carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+"Shunzi.mp3";
            SettingMgr.playSound(url); 
        }
        else  if( cardtype == GDYCMD.CardType.CardType_liandui )
        {
            //let cardname = "{0}{1}".format(carddata,carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+"liandui.mp3";
            SettingMgr.playSound(url); 
        }
        else if( cardtype >= GDYCMD.CardType.CardType_bomb3 && cardtype <= GDYCMD.CardType.CardType_bomb6 )
        {
            //let cardname = "{0}{1}".format(carddata,carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+"Boom.mp3";
            SettingMgr.playSound(url); 
        }
        else if( cardtype == GDYCMD.CardType.CardType_wangzha )
        {
            //let cardname = "{0}{1}".format(carddata,carddata)
            let url = 'resources/game/gandengyan/sound/'+SexNameGDY[sex]+'/'+"wangzha.mp3";
            SettingMgr.playSound(url); 
        }
    },
    playbgGDY:function()
    {
        SettingMgr.stopBg()
        SettingMgr.playBg("resources/game/gandengyan/sound/boy/bgmusic.mp3");
    },
    playPai : function (sex,pai,chair){
        if(!!this.bLanguageSound){
            this._super(sex,pai,chair);
        }else{
            let files = yuhuan_sound[pai];
            chair = chair || 0;
            this._playYuhuanSound(sex,files,chair);
        }
    },

    playEatCmd : function(sex,opcode,chair){
        if(!!this.bLanguageSound){
            if(opcode == OPT_CODE.optSupply){
                this._playBaiGang(sex);
            }else {
                this._super(sex,opcode,chair);
            }
        }else {
            let files = yuhuan_OPTSound[opcode];
            chair = chair || 0;
            this._playYuhuanCmd(sex,files,chair);
            //this._playHZMJSoud(sex,files,chair);
        }
    },

    playHu : function (sex,bNotZimo,chair) {
        if(!!this.bLanguageSound){
            this._super(sex,bNotZimo);
        }else {
            chair = chair || 0;
            this._playYuhuanHu(sex,chair);
        }
    },

    _playYuhuanSound : function (sex,files,chair) {
        var index = (this._index + chair) % Sound_Path.length;
        var sId = random(0,files.length);
        var url;
        if(sex == 1){
            url = 'resources/youxi/yuhuanmah/sound/boy/' + Sound_Path[index] + files[sId];
        }else {
            url = 'resources/youxi/yuhuanmah/sound/girl/' + Sound_Path[index] + files[sId];
        }
        cc.log('yuhuanSound',url);
        SettingMgr.playSound(url);
    },
    
    _playYuhuanHu : function (sex,chair) {
        var index = (this._index + chair) % Sound_Path.length;
        var sId = random(0,yuhuan_Hu.length);
        var url;
        if(sex == 1){
            url = 'resources/youxi/yuhuanmah/sound/boy/' + Sound_Path[index] + yuhuan_Hu[sId];
        }else {
            url = 'resources/youxi/yuhuanmah/sound/girl/' + Sound_Path[index] + yuhuan_Hu[sId];
        }
        cc.log('yuhuanSound',chair,index,url);
        SettingMgr.playSound(url);
    },
    
    _playYuhuanCmd : function (sex,files,chair) {
        var index = (this._index + chair) % Sound_Path.length;
        var sId = random(0,files.length);
        var url;
        if(sex == 1){
            url = 'resources/youxi/yuhuanmah/sound/boy/' + Sound_Path[index] + files[sId];
        }else {
            url = 'resources/youxi/yuhuanmah/sound/girl/' + Sound_Path[index] + files[sId];
        }
        SettingMgr.playSound(url);
    },

    // 播放白板杠
    _playBaiGang : function (sex) {
        var url;
        if(sex == 1){
            url = 'resources/youxi/yuhuanmah/sound/boy/' + BaiGangSound;
        }else {
            url = 'resources/youxi/yuhuanmah/sound/girl/' + BaiGangSound;
        }
        cc.log('_playBaiGang',url);
        SettingMgr.playSound(url);
    },
});