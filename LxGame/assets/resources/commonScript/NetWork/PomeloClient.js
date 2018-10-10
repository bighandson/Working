window.PomeloClient = {
    isConnected: false
};

window.PomeloClient.request = function (route, msg, cb) {
    if (arguments.length === 2 && typeof msg === 'function') {
        cb = msg;
        msg = {};
    } else {
        msg = msg || {};
    }


    if (!PomeloClient.isConnected) {
        if (!!cb) cb({code: 505, msg: '与服务器连接断开'});
        return;
    }
    // cc.log(route, msg);
    msg.dlpwd = UserCenter.userInfo.dlpwd;
    msg.sid = UserCenter.userInfo.sid;

    pomelo.request(route, msg, cb);
}

// 登陆游戏服务器
window.PomeloClient.login = function (server, token, cb) {
    pomelo.removeAllListeners();
    pomelo.on('io-error', function () {
        if (cb) cb(new Error('与服务器连接失败'));
        return;
    });

    pomelo.init(server, function () {
        var route = 'connector.entryHandler.login';
        pomelo.request(route, {
            token: token,
        }, function (data) {
            if (data.code == 200) {
                PomeloClient.isConnected = true;
                if (cb) cb(null, data);
            } else {

                pomelo.removeAllListeners();
                pomelo.disconnect();
                if (cb) cb(new Error(data.msg));
            }
        });
    })
}

// 连接游戏服务器
window.PomeloClient.queryEntry = function (server, token, cb) {


    // 监听连接消息
    pomelo.on('io-error', function () {
        pomelo.removeAllListeners();
        cc.log('io-error');
        if (cb) cb(null, {code: 500, msg: '连接服务器失败'});
    });
    pomelo.init(server, function () {
        var route = 'gate.entryHandler.queryEntry';
        pomelo.request(route, {
            token: token
        }, function (data) {
            cc.log(data);

            if (data.code != 200) {
                if (cb) cb(null, data);
                return;
            }

            pomelo.init({host: data.msg.host, port: data.msg.port}, function () {
                var route = 'connector.entryHandler.entry';
                pomelo.request(route, {

                    token: data.msg.token,
                    key: UserCenter.userInfo.token,
                    sign: UserCenter.userInfo.sign
                }, function (data) {
                    if (data.code == 200) {
                        PomeloClient.isConnected = true;
                        if (cb) cb(null, data);
                    } else {
                        pomelo.removeAllListeners();
                        pomelo.disconnect();
                        if (cb) cb(null, data);
                    }
                });
            });
        })
    });
}