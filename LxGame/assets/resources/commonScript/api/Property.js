var config = require('Config');
var getProperty= function (userid,expend,cb) {

    PomeloClient.request('user.userHandler.post',{
        url : '3002',
        data : {
            userid : userid,
            jgm   : config.jgm,
            expend : expend
        }
    },function (data) {
        if(data.code == 200){
            cb(null,data.result);
        }else{
            cb(new Error(data.msg),data.msg);
        }
    });
}


module.exports={
    getProperty:getProperty,

};