/**
 * Created by deng on 2017/4/19.
 */

var config = require('Config');

/**
 * 获取任务列表
 * @param mlfl 任务目录分类
 * @param rwfl 任务分类
 * [@param] expend 扩展字段
 * @param cb
 */
var getTaskLists = function (mlfl,rwfl,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '7001',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            mlfl : mlfl,
            rwfl : rwfl,
            expend : expend,
        }
    },function (data) {
        if(data.code == 200){  // 获取成功
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

/**
 * 领取奖励
 * @param lsh
 * [@param] expend
 * @param cb
 */
var receiveReward = function (lsh,expend,cb) {
    if(arguments.length === 2 && typeof expend === 'function') {
        cb = expend;
        expend = '';
    } else {
        expend = expend || '';
    }

    PomeloClient.request('user.userHandler.post',{
        url : '7100',
        data : {
            userid : UserCenter.getUserID(),
            jgm    : config.jgm,
            lsh    : lsh,
            expend :expend
        }
    },function (data) {
        if(data.code == 200){
            cc.log(data)
            UserCenter.setList(data.result.results[0].zbgrfhzlist);
            GlobEvent.emit('update_UserCenter');
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    })
}


module.exports = {
    getTaskLists : getTaskLists,
    receiveReward:receiveReward,
}