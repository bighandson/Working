
// /**
//  *  获取战绩流水
//  */
var LoadGame = require('LoadGame');
var config = require('Config');
var getzhanji = function (gameid,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '8001',
        data : {
            gameid: gameid,
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

//获取战绩明细
var getzhanjidetial = function (lsh,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '8002',
        data : {
            lsh: lsh,
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        // cc.log("数据发送成功");
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

//获取战绩明细总分排行

var getzhanjirank = function (lsh,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '6011',
        data : {
            lsh: lsh,
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        // cc.log("数据发送成功");
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}




module.exports = {
    getzhanji:getzhanji,
    getzhanjidetial:getzhanjidetial,
    getzhanjirank:getzhanjirank,
}