/**
 * 加载游戏场景.
 */

var config = require('Config');

var currentGameId = 0;
var currentType = '';
var currentFuPanGameId = 0;


var reSetCurrentGameId = function () {
    currentGameId = 0;
    currentType = '';
    currentFuPanGameId = 0;
}

// 获取休闲场 房间列表
var getFreeRoomList = function (gameid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9017',
        data : {
            userid : UserCenter.getUserID(),
            roomtype :1,
            money : UserCenter.getYouxibiNum(),
            gameid:  gameid,
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
        hideLoadingAni()
        if(data.code == 200 && data.result.status){
            if(!!data.result.results.length){
               cb(null,data.result.results)
            }else {
                cb(new Error('错误'), '获取房间列表为空');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

// 选择进入休闲场房间
var enterFreeTable = function (currentGameid,host,port) {
    showLoadingAni();
    var myDate = new Date()
    let game = config.getGameById(currentGameid);

    let route = game.server + '.enterRoom';

    PomeloClient.request(route, {
        gameid: currentGameid,
        userid: UserCenter.getUserID(),
        host:host,
        port:port,
    }, function (data) {
        hideLoadingAni();
    });
}

//进入休闲场游戏 lock 0  pwd  lock 1 pwd 桌子密码 min max 最小-最大money  默认0
var enterFreeGame = function (gameid, tableid,seateid,lock,pwd,min,max, cb) {
    cc.log('enterGame',gameid, tableid,seateid,lock,pwd,min,max)
    if (!PomeloClient.isConnected) {
        if (!!cb) {
            cb(new Error('与服务器断开连接'), '与服务器断开连接')
        }
        return;
    }
    let game = config.getGameById(gameid);

    if (!game) {
        return cb(new Error('该游戏暂为开放'), '该游戏暂为开放');
    }
    showLoadingAni();

    let route = game.server + '.sitIn';

    PomeloClient.request(route, {
        gameid : gameid,
        tableid: tableid,
        seatid: seateid,
        lock: lock,
        pwd: pwd,
        minMoney:min||0,
        maxMoney:max||0
    }, function (data) {
        cc.log('进入休闲场游戏:',data)
        YMEvent('FreeGame', game.gameid);
    });
}

// 创建房卡房
var createCardRoom = function (gameid, roomcard, gamebh, rule, expend, cb) {
    var route = 'mjcard.cardHandler.createRoom2';
    PomeloClient.request(route, {
        gameid: gameid,
        roomcard: roomcard,
        gamebh: gamebh,
        rule: rule,
        expend: expend,
    }, function (data) {
        cc.log('创建房卡房:',data);
    });
}

//进入到房卡房房间
var enterCardRoom = function (gameid, tableid, seatid) {
    showLoadingAni();

    PomeloClient.request('mjcard.cardHandler.enterCardRoom', {
        gameid : gameid,
        tableid: tableid,
        seatid: seatid,
    }, function (data) {
        console.log('进入到房卡房房间:',data)
    });
}

//进入到房卡房游戏
var enterCardGame = function (gameid) {
    showLoadingAni();

    PomeloClient.request('mjcard.cardHandler.sitIn', {
        gameid : gameid,
    }, function (data) {
        console.log('进入到房卡房游戏:',data)
        // 添加房卡房游戏统计
        YMEvent('FriendGame',gameid)
    });
}

//加入房卡房
var joinCardRoom = function (roomstr, cb) {
    var route = 'mjcard.cardHandler.joinRoom2';
    PomeloClient.request(route, {
        gameid: currentGameId,
        roompassword: roomstr
    }, function (data) {
        cc.log('加入房卡房:',data);
    });
}

//载入比赛房间
var LoadMatch = function (currentGameid,host,port) {
    showLoadingAni();
    var myDate = new Date()
    let game = config.getGameById(currentGameid);

    let route = game.server + '.enterRoom';

    PomeloClient.request(route, {
        gameid: currentGameid,
        userid: UserCenter.getUserID(),
        host:host,
        port:port,
    }, function (data) {
        hideLoadingAni();
    });
}

//进入比赛 开始排队等待
var enterMatchRoom = function (gameid) {
    cc.log("enterMatchRoom=====",gameid)
    showLoadingAni();
    let game = config.getGameById(gameid);
    
    this.setCurrentGameId(gameid)
    
    cc.director.loadScene(game.gameScene_Match, function (err) {
        if (err) {
            cc.log(err);
            hideLoadingAni();
            return;
        }
        let controller = cc.find('Canvas/controller');
        controller.addComponent(game.rule);
    }); 
}

//断线恢复
var enterActGame = function (gameid, type) {
    currentGameId = gameid;
    let game = config.getGameById(gameid);
    let scene = game.gameScene;
    if (!PomeloClient.isConnected) {
        hideLoadingAni();
        return;

    }
    showLoadingAni();

    let route = game.server + '.recover';
    PomeloClient.request(route, {
        gameid: gameid,
        type: type
    }, function (data) {
        hideLoadingAni();
        // if(type == 3){
	       //  PomeloClient.request(config.getGameById(currentGameId).server + '.MobileInQueue', function (data) {
	       //  });
        // }
        cc.log('断线重连:',data)
    })
}

// 重进房间 判断是否已经在游戏中 获取在线游戏
var reinRoom = function (cb) {
    PomeloClient.request('user.userHandler.online', {}, function (data) {
        cc.log(data);
        if (!data.gameid) {
            cb(null);
            return;
        } else {
            cb(data.gameid, data.type);
        }
    });
}

module.exports = {
    getCurrentGameId: function () {
        return currentGameId;
    },
    getCurrentType : function () {
        return currentType;
    },
    setFupanGameId : function (gameid) {
        currentFuPanGameId = gameid;
    },

    getFupanGameId : function (gameid) {
        return currentFuPanGameId;
    },

    getFuPanCurrentGame : function () {
        return config.getGameById(currentFuPanGameId);
    },

    getCurrentGame : function () {
        return config.getGameById(currentGameId);
    },
    setCurrentGameId : function (GameId) {
        currentGameId = GameId;
    },
    reinRoom: reinRoom,
    enterCardGame : enterCardGame,
    enterFreeGame: enterFreeGame,
    enterActGame: enterActGame,
    createCardRoom: createCardRoom,
    joinCardRoom: joinCardRoom,
    enterCardRoom: enterCardRoom,
    enterFreeTable: enterFreeTable,
    reSetCurrentGameId : reSetCurrentGameId,
    getFreeRoomList:getFreeRoomList,
    enterMatchRoom : enterMatchRoom,
    LoadMatch : LoadMatch,
}
