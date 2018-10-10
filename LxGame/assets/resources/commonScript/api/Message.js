/**
 * Created by deng on 2017/4/19.
 */

var config = require('Config');

/**
 * 获取消息列表
 * @param notice_type 消息类型
 * @param cb
 */

var getMessages = function (notice_type,expend,cb) {
    let maxid = cc.sys.localStorage.getItem('message_id'+notice_type) || 0;
    PomeloClient.request('user.userHandler.post',{
        url : '4001',
        data : {
            id:maxid,
            userid : UserCenter.getUserID(),
            jgm    : config.jgm,
            notice_type : notice_type,
            expand : expend
        }
    },function (data) {
        if(data.code == 200 && data.result.status){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var getMessaged = function(notice_type,expend,cb) {
    getMessages(notice_type, expend, function (err, data) {
        if (err) {
            cc.log(err);
            cb(err);
        } else {
            //获取本地 red
            var ifred =  cc.sys.localStorage.getItem('message_ifred'+ notice_type)||0 ;
            var timenow = new Date().getTime();
            cc.sys.localStorage.setItem('timereq'+ notice_type, timenow);
            if (!!data) {

                let res = data.results;
                let len = res.length;
                //  保存message 最大id
                cc.log('消息',res)
                var newmaxid = res[0].id;

                let maxid = cc.sys.localStorage.getItem('message_id'+ notice_type) || 0;
                cc.sys.localStorage.setItem('message_id'+ notice_type, newmaxid);
                if (newmaxid > maxid) {
                    cc.sys.localStorage.setItem('message_ifred'+ notice_type, 1);
                    for (var i = 0; i < len; i++) {
                        //加入是否已读属性  0 已读   1 未读
                        res[i].ifread = 1;
                    }
                    if (len == 20) {
                        let ress = JSON.stringify(res)
                        cc.sys.localStorage.setItem('message_data'+ notice_type, ress);
                    } else if (len < 20) {
                        var message = cc.sys.localStorage.getItem('message_data'+ notice_type)||'';
                        if (!!message) {
                            let localllen = JSON.parse(message).length;
                            var num = 20 - len;
                            num = (num < localllen) ? num : localllen;
                            for (var i = 0; i < num; i++) {
                                res.push(JSON.parse(message)[i]);
                            }
                        }
                        let ress = JSON.stringify(res);
                        cc.sys.localStorage.setItem('message_data'+ notice_type, ress);
                    }

                    cb(null,1);
                    cc.sys.localStorage.setItem('message_ifred'+ notice_type,1);
                }else{
                    cb(null,ifred);
                }
            }else {
                cb(null,ifred);
            }
        }
    });
}


var getMsg =function(notice_type,expend,cb) {
    var maxid = cc.sys.localStorage.getItem('message_id'+ notice_type) || 0;
    if (maxid == 0) {
        getMessaged(notice_type,expend,cb);
    } else {
        var timereq = cc.sys.localStorage.getItem('timereq'+ notice_type)||0;
        var timenow = new Date().getTime();
        if ((timenow - timereq) > 3600000) {
            getMessaged(notice_type,expend,cb);

        }else {
            cb(null,cc.sys.localStorage.getItem('message_ifred'+ notice_type));
        }
    }
}

var updateread = function (notice_type,id) {
    var message = cc.sys.localStorage.getItem('message_data'+notice_type);
    var data = JSON.parse(message)
    for (let i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            data[i].ifread = 0;
        }
    }
    cc.sys.localStorage.setItem('message_data' + notice_type, JSON.stringify(data));
}

var getlocall = function (notice_type,cb) {
    var message =  cc.sys.localStorage.getItem('message_data' + notice_type);
    if(!!message){
        cb(JSON.parse(message));
    }else {
        cb();
    }

}

var setlocallitem =function (notice_type,data) {
    cc.sys.localStorage.setItem('message_ifred'+notice_type,data)
}


GlobEvent.on('ClearMessage',function () {
    cc.sys.localStorage.setItem('message_id2',0);
    cc.sys.localStorage.setItem('message_data2','');
});


module.exports = {
    getMessages : getMessages,
    getMsg:getMsg,
    updateread:updateread,
    getlocall:getlocall,
    setlocallitem:setlocallitem,
}
