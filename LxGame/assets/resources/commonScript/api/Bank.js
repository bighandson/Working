var config = require('Config');

var changeBank = function (bz,je,expend,cb) { // 0 存 1 取
    PomeloClient.request('user.userHandler.post',{
        url : 'n3001',
        data : {
            userid : UserCenter.getUserID(),
            jgm   : config.jgm,
            cqbz : bz,
            zhlx : 3-bz,
            je : je,
            expand : expend,
        }
    },function (data) {
        cc.log(data)
        if(data.code == 200){
            if(data.result.results.length){
                cc.log(data.result.results)
                UserCenter.setList(data.result.results);
                GlobEvent.emit('update_UserCenter');
                cb(null,data.result.results)
            }else{
                cb(new Error(data.result.message),data.result.message);
            }
        }else {
            cb(new Error(data.result.message),data.result.message);
        }
    });
}




module.exports = {
    changeBank:changeBank,
}
