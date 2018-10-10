
// /**
//  *  获取道具信息并保存本地  仅登录调用
//  */
var config = require('Config');
var prop = null;
var saveProplist = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '3010',
        data : {
            id: '0',
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
        // cc.log("数据发送成功");
        if(data.code == 200){
            if(!!data.result){
                prop = data.result;
                cb(null,prop);
                //cc.sys.localStorage.setItem('proplist',JSON.stringify(data.result.result))
            }else {
                cb(new Error('错误'),'获取道具列表为空');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var getProplist = function (cb) {
    //JSON.stringify(cc.sys.localStorage.getItem('proplist'))
    if(!prop){
        saveProplist('',cb);
    }else {
        cb(null,prop);
    }
}




module.exports = {
    getProplist:getProplist,
    saveProplist:saveProplist,
}