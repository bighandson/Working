var config = require('Config');
var getJiuji = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '5004',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200 && data.result.status){
            cc.log(data)
            if(data.result.results.length){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取数据失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};

var getCishu = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n5004',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
	    cc.log(data)
        if(data.code == 200 && data.result.status){

            if(data.result.results.length){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取数据失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};

module.exports = {
    getJiuji       : getJiuji,
    getCishu      : getCishu,
};