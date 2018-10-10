var config = require('Config');
var winningList = null;

var getWinningList = function (expend,cb)  {
    PomeloClient.request('user.userHandler.post',{
        url : '6004',
        data : {
            userid : UserCenter.getUserID(),
            phlx:'3',
            jgm   : config.jgm,
            expand : expend
        }
    },function (data) {
        // cc.log("数据发送成功");
        // cc.log(data)
        if(data.code == 200){
            if(!!data.result){
                winningList = data.result;
                cb(null,winningList);
            }else {
                cb(new Error('错误'), '获取活动信息为空');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}


 module.exports = {
     getWinningList:getWinningList,
     winningList,winningList
}