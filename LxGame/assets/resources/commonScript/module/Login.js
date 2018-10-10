/**
 * 登陆模块.
 */
var config = require('Config');
var crypto = require('crypto');
var querystring = require('querystring');
var async = require('async');
var LoadGame = require('LoadGame');
var Prop = require('Prop');
// 断线重连标志
var is_recovering = false;

/**
 * available : 0 网络不可用 1 可用
 */


function loginServer(data) {
    UserCenter.setUserInfo(data);
    let userInfo = UserCenter.getUserInfo();
    let user = {
        uid: userInfo.userid,
        password: userInfo.dlpwd,
        timestamp: Date.now()
    };

    let token = crypto.encrypt(user, config.scretKey);
    cc.sys.localStorage.setItem('localToken', token);
    SettingMgr.playBg(config.backMusic);
    Prop.saveProplist('', function (err, data) {
        if (!err) {
            cc.log(data)
        }
    });
}

/*
* 登陆前从http 拉取登陆服务器列表
*/

var postServers = function (url, params, callback) {
    if (!cc.sys.isNative) {
        return callback(true, '');
    }
    var xhr = cc.loader.getXMLHttpRequest();
    url = url + "?" + params
    // cc.log("url=====",url)
    xhr.open("GET",url);
    var err = false;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            callback(false, xhr.responseText);
        } else {
            callback(true, xhr.responseText);
        }
    };
    xhr.onerror = function () {
        callback(true)  
    }
    // 超时
    xhr.ontimeout = function () {
        callback(true)
        cc.log('xhr timeout')
    } 
    xhr.send("");
}

/**
 * 客户端多个连接
 * @param token
 * @param callback
 */
var multiLogin = function (token, callback) {
    let length = 0;   // 服务器数量
    let gates = [];   //服务器列表
    cc.log('multiLogin',new Date().getTime());
    if (!!PomeloClient.isConnected) {             // 重置连接状态
        PomeloClient.isConnected = false;
        pomelo.removeAllListeners();
        pomelo.disconnect();
    }

    let Login = null;

    Login = function (index) {

        // 所有服务器地址尝试一遍  都无法登陆
        if (index >= length) {// 登陆失败
            PomeloClient.isConnected = false;
            pomelo.removeAllListeners();
            pomelo.disconnect();
            if (callback) callback(true, "无法连接服务器,请稍后重试");
            hideLoadingAni();
            return
        }


        // 尝试一次连接
        PomeloClient.login(gates[index], token, function (err, data) {
            hideLoadingAni()
            if (!err && data.code == 200) {  // 成功
                _loginCallback();
                afterLoginServer(data);
                // 请求高防服务器
                PomeloClient.request('user.userHandler.post', {
                    url: '9016',
                    data: {
                        jgm: config.jgm,
                        tdbz: "1",
                    }
                }, function (datas) {
                    cc.log('login',datas)
                    if (datas.code == 200 && !!datas.result) {
                        // 登陆成功后保存服务器列表
                        let list = [];
                        for (var i = datas.result.length - 1; i >= 0; i--) {
                            let ip = datas.result[i];
                            list.push({
                                host: ip.iptd,
                                port: '3010'
                            })
                        }
                        cc.sys.localStorage.setItem('serverList', JSON.stringify(list));
                    }
                })
            } else {// 失败
                Login(index += 1)
            }
        });
    }

    postServers("http://m.bnngoo.com/home/GetDefenseIP", "jgm=" + config.jgm + "&" + "tdbz=" + 0 + "&envir=" + config.isRelease, function (err, data) {
        if (err) {  //错误处理
            // 获取保存的服务器列表
            let saveList = JSON.parse(cc.sys.localStorage.getItem('serverList'));
            gates = (saveList && saveList.length > 0) ? saveList : config.gates;
            length = gates.length;
            Login(0)
        } else {   //成功处理
            data = JSON.parse(data)
            let saveList = JSON.parse(cc.sys.localStorage.getItem('serverList'));
            let sBendi = (saveList && saveList.length > 0) ? saveList : config.gates;
            let sPost = data.results;

            for (var i = sBendi.length - 1; i >= 0; i--) {
                gates.push(sBendi[i])
            }

            for (var i = sPost.length - 1; i >= 0; i--) {
                let host1 = sPost[i].iptd
                let isHave = false;
                for (var i = sBendi.length - 1; i >= 0; i--) {
                    let host2 = sBendi[i].host
                    if (host1 == host2) {
                        isHave = true;
                    }
                }

                if (!isHave) {
                    gates.push({
                        host: host1,
                        port: '3010'
                    })
                }
            }

            length = gates.length;
            Login(0)
        }
    })
}


function afterLoginServer(data) {
    loginServer(data.user);
    GlobEvent.emit('onConnected');
    Global.init()  // 全局临时数据注册  初始化
    if (!data.gameid) {
        cc.director.loadScene(config.lobbyScene, function () {
            // 检测是否从外部拉起
            PullGame(1);
        });
    } else { // 断线数据恢复
        LoadGame.enterActGame(data.gameid, data.type);
    }
}

/**
 * 通过userid登陆游戏服务器
 * @param userid     用户id
 * @param password   用户密码
 * @param cb         回调
 */
var loginByUserid = function (userid, password, cb) {
    let token = crypto.encrypt({
        url: '1003',
        timestamp: Date.now(),
        data: {
            userid: userid,
            userpwd: password,
            jgm: config.jgm,
            appid: Device.getAppID(),
            vercode: 1,
            os: 1
        }
    }, config.scretKey);

    multiLogin(token, cb);
}

var loginByWeixin = function (appid, code, state, cb) {
    cc.log(appid, code, state);
    let token = crypto.encrypt({
        url: 'n1002',
        timestamp: Date.now(),
        data: {
            appid: appid,
            code: code,
            ffqd: config.ffqd,
            jgm: config.jgm,
            vercode: 1,
            os: 1
        }
    }, config.scretKey);

    multiLogin(token, cb);
}

var tokenLogin = function (cb) {

	cc.log('login1')
    let enToken = cc.sys.localStorage.getItem('localToken');
    if (!enToken) {
        cb(new Error('localToken is not found'));
        return;
    }

    let token = crypto.decrypto(enToken, config.scretKey);
    if (!token || !token.uid || !token.password) {
        cb(new Error('token parse error'));
        return;
    }
    //
    // token.uid = 10076365		;
	  //   token.password  = '5dcf2ec47aad1d1a565b627726d5d060';
    cc.log('login')
    loginByUserid(token.uid, token.password, cb);
}

var loginByVisitor = function (cb) {

    let token = crypto.encrypt({
        url: 'n1001',
        timestamp: Date.now(),
        data: {
            uuid: Device.getUUID(),
            jgm: config.jgm,
            ffqd: config.ffqd,
            vercode: 1,
            os: 1
        }
    }, config.scretKey);

    multiLogin(token, cb);
}

var _loginCallback = function () {
    pomelo.on('close', pomeloClose);   // 网络断开
    pomelo.on('onKick', onKick);

	pomelo.on("RCMD_HallKick",RCMD_HallKick)
    pomelo.on('RCMD_EnterRoom', RCMD_EnterRoom);    // 监听创建房间
    pomelo.on('RCMD_StartGame', RCMD_StartGame);    // 监听加入游戏服务器
    pomelo.on('RCMD_MobileInQueue', RCMD_MobileInQueue);    // 监听房卡房是否进入房间
}

/**
 * 创建房间 加入房间服务器下行
 * @param data
 */
var RCMD_EnterRoom = function (data) {
    cc.log('RCMD_EnterRoom', data);
    var flag = data.flag;  // 0 表示成功 ， 失败
    var type = data.type;  // 0 创建房间 1 加入房间
    var tableid = data.tableid; // 桌子号码
    var seatid = data.seatid;  // 座位号
    var gameid = data.gameid || 0;

    switch (flag) {
        case 0:
            break;
        case 1:
            showAlertBox("账号不存在");
            break;
        case 2:
            showAlertBox("账号余额不足,请充值");
            break;
        case 3:
            showAlertBox("房卡不足,请充值");
            break;
        case 4:
            showAlertBox('房间号码不存在,请重新输入');
            break;
        case 5:
            showAlertBox('该房间已满员');
            break;
        case 6:
            showAlertBox('解散房间过于频繁了，请一个小时后重试');
            break;
        case 7:
            showAlertBox('请求参数错误');
            break;
        case 8:
            showAlertBox('游戏正在维护中');
            break;
        default:
            showAlertBox('进入房间异常,请稍后重试');
            break;
    }

    if (flag != 0) { // 0 成功
        return;
    }
    if (data.remaincard >= 0) {
        UserCenter.setCardNum(data.remaincard);
    }
    LoadGame.enterCardRoom(gameid, tableid, seatid);
}

// 进入游戏下行  2 进入房卡房 0/3 比赛场排队  1 休闲场
var RCMD_MobileInQueue = function (data) {
    if (data.type == 2) {  
        LoadGame.enterCardGame(data.gameid);
    }else if (data.type == 3 ||  data.type == 0) {
        LoadGame.enterMatchRoom(data.gameid);
    }
}

// 加入游戏服务器成功 下行
var RCMD_StartGame = function (data) {
    cc.log('RCMD_StartGame: ', data);

    let game = config.getGameById(data.gameid);
    LoadGame.setCurrentGameId(data.gameid)
    
    cc.director.loadScene(game.gameScene, function (err) {
        if (err) {
            cc.log(err);
            hideLoadingAni();
            return;
        }
        let controller = cc.find('Canvas/controller');
        controller.addComponent(game.rule);
    });
}


/**
 * 心跳超时， 麻将与服务器连接断开
 * @param data
 */
var RCMD_ServerHeartOut = function () {
    LoadGame.reinRoom(function (gameid, type) {
        if (!gameid) {
            cc.director.loadScene(config.lobbyScene);
            return;
        } else {
            LoadGame.enterActGame(gameid, type);
        }
    });
}

/**
 *  与服务器连接断开
 */
var pomeloClose = function () {
    setTimeout(function () {
        PomeloClient.isConnected = false;
        recoverLogin();
    }, 200);
}

// 断线恢复
var recoverLogin = function () {
    cc.log('recoverLogin')
    tokenLogin(function (err, desc) {
        if (err) {
            showAlertBox(desc);
            cc.director.loadScene(config.loginScene);
        }
    });
}

/**
 * 玩家被踢出服务器连接
 */
var onKick = function () {
    cc.log('onKick');                // 断线登陆
    PomeloClient.isConnected = false;
    pomelo.removeAllListeners();
    showAlertBox('该账号在其他设备登陆', function () {
        cc.director.loadScene(config.loginScene);
    });
}


var RCMD_HallKick = function(data){
	let msgArr = {
		0: '您的人品不好，所以被踢下线',
		1: '帐号在另一个地方登录，您被迫下线',
		2: '您被管理员踢下线',
		3: '您的游戏币不足，不能继续游戏。',
		4: '你的断线或逃跑已经超过规定的次数,不能继续游戏',
		255: data.srtMsg
	};
	let self = this;
	hideLoadingAni();
	// this.removePomeloListeners();
	showAlertBox(msgArr[data.bt], function () {

	});
}

/**
* 无法处理切换网络引起的断线问题  只能简单处理 每次网络状态切换  重置服务器连接  重新登录
*/
GlobEvent.on('networkAvailable', function (available) {
    cc.log("======>>>切换网络<<<======",available)
    // if (!available && !!PomeloClient.isConnected) {
    //     recoverLogin();
    // }

    if (!!PomeloClient.isConnected) {             // 重置连接状态
        PomeloClient.isConnected = false;
        pomelo.removeAllListeners();
        pomelo.disconnect();
    }

    recoverLogin();
});

GlobEvent.on('RCMD_ServerHeartOut', RCMD_ServerHeartOut);

module.exports = {
    loginByVisitor: loginByVisitor,
    loginByUserid: loginByUserid,
    tokenLogin: tokenLogin,
    loginByWeixin: loginByWeixin,
}