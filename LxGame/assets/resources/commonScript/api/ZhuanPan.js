
    var config= require('Config');
    var getZhuanPan=function (expend,cb) {
        PomeloClient.request('user.userHandler.post',{
            url:'5019',
            data:{
                userid:UserCenter.getUserID(),
                jgm:config.jgm,
                expend:expend,
            }

        },function (data) {
            cc.log(data)
           if (data.code==200 && !!data.result.status) {
               cb(null,data.result)
           }else {
               cb(new Error(data.msg),data.msg);
           }
        });
    };

    var getJiang = function (expend,cb) {
        PomeloClient.request('user.userHandler.post',{
            url:'5020',
            data:{
                userid:UserCenter.getUserID(),
                jgm:config.jgm,
                expend:expend,
            }
        },function (data) {
            cc.log(data)
            if (data.code==200 && !!data.result.status) {

                cb(null,data.result)
            }else {
                cb(new Error(data.msg),data.msg);
            }
        });
    }


    module.exports={
        getZhuanPan:getZhuanPan,
        getJiang : getJiang
    }