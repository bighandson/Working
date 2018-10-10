
// /**
//  *  获取邀请状态
//  */
var config = require('Config');
var getYaoqing = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9008',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
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

var sendYaoqing = function (password,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9009',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
            yqm : password
        }
    },function (data) {
        cc.log(data)
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var yanzhengYaoqing = function (num,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9010',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
            yqm : num
        }
    },function (data) {
        cc.log(data)
        if(data.code == 200 ){
            if( !!data.result.status){
                cb(null,data.result);
            }else{
                showAlertBox(data.result.message)
            }

        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}
var sendGou = function (gou) {
    cc.log('9011请求')
    PomeloClient.request('user.userHandler.post',{
        url : '9011',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : '',
            isbind: gou,
        }
    },function (data) {
        if(data.code == 200){
            cc.log(data)
        }else {
            cc.log(data.msg);
        }
    });
}






module.exports = {
    getYaoqing : getYaoqing,
    sendYaoqing : sendYaoqing,
    sendGou : sendGou,
    yanzhengYaoqing : yanzhengYaoqing

}