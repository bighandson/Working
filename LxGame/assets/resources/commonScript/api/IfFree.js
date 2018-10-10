var config = require("Config")
var getIfFree = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9019',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            expend : expend
        }
    },function (data) {
        if(data.code == 200){
            console.log('9019',data)
            if(!!data.result && !!data.result.results.length ){
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};
module.exports= {
    getIfFree:getIfFree
}