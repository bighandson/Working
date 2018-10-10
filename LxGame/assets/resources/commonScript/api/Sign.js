
// /**
//  *  获取每日签到信息
//  */
var config = require('Config');
var Singlist = null;

var date = null;
var day = 0;
var houers =0;
var year = 0;
var month = 0;
var getSignlist = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '5005',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
         cc.log(data);
        if(data.code == 200&&data.result.status){
            if(!!data.result){
                var date = new Date();
                day =date.getDate();
                houers =date.getHours();
                year = date.getFullYear();
                month = date.getMonth()
                Singlist = data.result.results;
                if(!!data.result.results[0].zhye){
                    UserCenter.setYouxibiNum(data.result.results[0].zhye);

                }

                cb(null,Singlist);
            }else {
                cb(new Error('错误'),'获取签到奖励为空');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var saveSignlist = function (cb) {

   let datenow = new Date();
    let daynow =datenow.getDate();
    let monthnow = datenow.getMonth()
    let houersnow =datenow.getHours();
    let yearnow = datenow.getFullYear();
    cc.log(Singlist)
    if(!Singlist){
        getSignlist('',cb);
    }else if(Singlist[0].ret == 0){
        getSignlist('',cb);
    }else{
         if(yearnow-year>0){
             getSignlist('',cb)
        }else if(monthnow- month>0){
            getSignlist('',cb)
        }else if(daynow-day>0){
            if(houersnow>5){
                getSignlist('',cb)
            }else{
                cb(null,Singlist);
            }
        }else {
            cb(null,Singlist);
        }
    }

};
GlobEvent.on('ClearMessage',function () {
    Singlist = null;
});


module.exports = {
    saveSignlist:saveSignlist,
}