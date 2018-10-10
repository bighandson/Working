const config = require('Config');


cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function(data,ruleflag) {
        let self = this;
        cc.log('十三水复盘',data,ruleflag);
        let ruleFlag = ruleflag;
        var recorddata = data.result.userarray;
        SssManager.setCurrentGameId(data.gameid);

        this.game = this.node.getComponent('yksssGame');

        var roomcontroller = this.addComponent("CardRoomController");
        this.game._initDataFinish = true;
        this.game.playerPokers = [];
        this.game.refreshMenuActive();
        this.TeskSeat(data);
        this.SitIn(data);
        if ((ruleFlag & 0x08) == 0x08 && data.gameid != 306) //有马牌
        {  //110000
            SssManager.ruleInfo.m_nHorseCardIndex = parseInt((ruleFlag >> 4) & 0x03);  //马牌的索引（０：红桃Ａ，１：红桃１０，２：红桃５）
            SssManager.mapai[1] = 2;
            if(SssManager.ruleInfo.m_nHorseCardIndex == 0)
            {
                SssManager.mapai[0] = 1;
            }else if(SssManager.ruleInfo.m_nHorseCardIndex == 1)
            {
                SssManager.mapai[0] = 5;
            }else if(SssManager.ruleInfo.m_nHorseCardIndex == 2)
            {
                SssManager.mapai[0] = 10;
            }
        }
        else
        {
            SssManager.mapai = [-1,-1];
            SssManager.ruleInfo.m_nHorseCardIndex = -1;
        }
        this.scheduleOnce(function(){
            self.game.showResult(JSON.parse(data.result),1);
        },2);
        this.gamex = config.getGameById(data.gameid);
        var rule = this.node.addComponent('yksssRule');
        SssManager.rule = rule;
        SssManager.soundCtrl = this.node.addComponent('yksssSound');     
    },

    TeskSeat: function (data) {
        
        //获取自己seat
        var seatid = 0;
        for(var i = 0; i < data.users.length; i++){
            var user = data.users[i];
            if(user.userid == UserCenter.getUserID()){
                seatid = i+1;
                break;
            }
        }
        SssManager.ruleInfo.m_nTruePlayers = data.users.length;

        if(!seatid){
            seatid = 1;
        }

        this.node.emit('RCMD_TaskSeat',{
            tableid : 0,
            seatid  : seatid,
        });
    },

    SitIn: function (data) {

        // 构造SitIn
        var users = [];
        for(var i = 0; i < data.users.length; i++){
            var user = data.users[i];
            var usr = {};
            usr.classId = 0;
            usr.draw = 0;
            usr.escape = 0;
            usr.level = 0;
            usr.lost = 0;
            usr.total = 0;
            usr.totalwon = 0;
            usr.won = 0;
            usr.userid = user.userid;
            usr.nick = user.nick;
            usr.sex = 1;
            usr.userImage = '';
            usr.seatid = user.seat;
            usr.tableid = 0;
            usr.money = 0;
            usr.score = 0;
            usr.state = 0;
            usr.status = 0;
            users.push(usr);
        }
        cc.log(users);
        this.node.emit('RCMD_SitIn',{users:users});
    },
});
