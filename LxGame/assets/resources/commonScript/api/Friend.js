
var getOtherPlayer = function (userid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n2001',
        data : {
            userid : userid,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            console.log('2001',data)
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取用户信息失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};



// 检查是否好友
var checkIsFriend = function (userid,expand,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1805',
        data : {
            userid : UserCenter.getUserInfo().userid,
            chkuserid : userid,
        }
    },function (data) {
        if(data.code == 200){
            console.log('n1805',data)
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error(data.msg),data.msg);
            }
        }else {
            cb(new Error('错误'),'获取用户好友列表失败');
        }
    });
}

// 获取好友列表
var getFriendsList = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1803',
        data : {
            userid : UserCenter.getUserInfo().userid,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            console.log('n1803',data)
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error(data.msg),data.msg);
            }
        }else {
            cb(new Error('错误'),'获取用户好友列表失败');
        }
    });
}

// 搜索好友
var SceachFriends = function (userId,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1804',
        data : {
            userid : userId,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            console.log('n1804',data)
            if(!!data.result && data.result.results.length > 0){
                cb(null,data.result);
            }else{
                cb(new Error(data.result.message),data.result.message);
            }
        }else {
            cb(new Error('错误'),'搜索好友失败');
        }
    });
}

//添加好友
var addFriend = function (userid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1801',
        data : {
            userid   : UserCenter.getUserInfo().userid,
            hyuserid : userid,
            expand   : expend,
        }
    },function (data) {
        if(data.code == 200){
            console.log('n1801',data)
            if(!!data.result && data.result.results.length > 0){
                cb(null,data.result);
            }else{
                cb(new Error(data.result.message),data.result.message);
            }
        }else {
            cb(new Error('错误'),'搜索好友失败');
        }
    });
};
var deleteFriend = function (userid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1802',
        data : {
            userid : userid,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取用户信息失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};
var getFriend = function (userid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1802',
        data : {
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取用户信息失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};

// 发送给好友消息
var sendMessage = function (userid,msg,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1810',
        data : {
            buserid  : userid,
            userid   : UserCenter.getUserInfo().userid,
            lynr     : msg,
            expand   : '',
        }
    },function (data) {
        if(data.code == 200){
            console.log('n1810',data)
            if(!!data.result && data.result.results.length > 0){
                cb(null,data.result);
            }else{
                cb(new Error(data.result.message),data.result.message);
            }
        }else {
            cb(new Error('错误'),'搜索好友失败');
        }
    });
};

var getMessage = function (userid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n1811',
        data : {
            userid : userid,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            if(!!data.result){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取用户信息失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};


module.exports = {
    SceachFriends       : SceachFriends,
    getFriendsList      : getFriendsList,
    getOtherPlayer      : getOtherPlayer,
    addFriend           : addFriend,
    deleteFriend        : deleteFriend,
    sendMessage         : sendMessage,
    getMessage          : getMessage,
    getFriend           : getFriend,
    checkIsFriend       : checkIsFriend,

};