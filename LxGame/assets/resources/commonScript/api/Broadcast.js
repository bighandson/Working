
var config = require('Config');
var message = null;
var time = 0;
//获取跑马灯消息
var getMessages = function (notice_type,expend,cb) {

    PomeloClient.request('user.userHandler.post',{
        url : '4001',
        data : {
            id          :0,
            userid      : UserCenter.getUserID(),
            jgm         : config.jgm,
            notice_type : notice_type,
            expand      : expend
        }
    },function (data) {
        cc.log('4001 :',data)
        if(data.code == 200 && data.result.status){
            time = new Date().getTime();
            message = data.result;
            cb(null,message);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

//判断时间是否有一个小时 获取公告
var getmessage = function (notice_type,expend,cb) {
    var timenow = new Date().getTime();
    if((timenow-time)>3600000){
        getMessages(notice_type,expend,cb);
    }else {
        cb(null,message);
    }
}

module.exports={
    getmessage:getmessage,
}









