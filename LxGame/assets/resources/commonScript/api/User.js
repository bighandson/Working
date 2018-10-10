
var config = require('Config');

var changename = null;
/**
 * 实名认证
 */
var submitRealName = function (name,id,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '2004',
        data : {
            userid : UserCenter.getUserID(),
            zsxm   : name,
            sfzhm  : id,
             expand : expend,
        }
    },function (data) {
        // cc.log("数据发送成功");
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};

//获取红包


var gethongbao = function (beat,gameid,expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'n9004',
		data : {
			jgm : config.jgm,
      times:beat,
      gameid:gameid,
			expand : expend,
		}
	},function (data) {
		if(data.code == 200){
			cb(null,data.result);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
};



/**
 *  获取验证码
 */





var getyanzheng = function (phonenumber,type,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '9001',
        data : {
            cellPhone : phonenumber ,
            cateID    : type,
            expand    : expend,
        }
    },function (data) {
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};



/**
 *  绑定手机号码
 */


var bindCellPhone = function (phonenumber,yanzhengnumber,expend,cb) {
    PomeloClient.request('user.userHandler.post', {
        url: '2005',
        data: {
            userid: UserCenter.getUserID(),
            telphone: phonenumber,
            validationcode: yanzhengnumber,
            expand: expend,
        }
    }, function (data) {
        // cc.log(data)
        if (data.code == 200) {
            cb(null, data.result);
        } else {
            cb(new Error(data.msg), data.msg);
        }
    });
}
    // 获取是否绑定邀请码
var ifyaoqing = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '3019',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            cb(null,data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};

// 获取登录渠道  更改改名按钮状态

var saveChangename = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n2001',
        data : {
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        if(data.code == 200){
            // console.log('2001',data)
            if(!!data.result){
                changename = data.result;
                cb(null,changename);
            }else{
                cb(new Error('错误'),'获取个人信息失败');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
};



var getChangename = function (cb) {
    //JSON.stringify(cc.sys.localStorage.getItem('proplist'))
    if(!changename){
        saveChangename('',cb);
    }else {
        cb(null,changename);
    }
}

var sendName = function (name,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '2003',
        data : {
            nickname : name,
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        cc.log(data);
        if(data.code == 200){
            cb(null,data.result)
            if(data.result.status){
                UserCenter.updateNikename(data.result.results[0].nc)
                GlobEvent.emit('NikeName');
                GlobEvent.emit('update_UserCenter');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var changeSex = function (xb,expend) {
    PomeloClient.request('user.userHandler.post',{
        url : '2007',
        data : {
            xb : xb,
            userid : UserCenter.getUserID(),
            expand : expend,
        }
    },function (data) {
        cc.log(data);
        if(data.code == 200){
            if(data.result.status){
                // cc.log(data.result.results[0].xb)
                UserCenter.setSex(data.result.results[0].xb)
                GlobEvent.emit('update_UserCenter');
                GlobEvent.emit('update_Head');
            }
        }else {
            // cb(new Error(data.msg),data.msg);
        }
    });
}


// 修改个人信息  昵称 性别 签名 
var changeUser = function (name,sex,qm) {
    cc.log("修改个人信息",sex,name,qm)
    PomeloClient.request('user.userHandler.post',{
        url : '2008',
        data : {
            xb   : sex,
            nickname : name,
            gxqm : qm,
            userid : UserCenter.getUserID(),
            expand : '',
        }
    },function (data) {
        cc.log(JSON.stringify(data));
        if(data.code == 200){
            if(data.result.status){
                UserCenter.updateNikename(data.result.results[0].nickname)
                UserCenter.setSex(data.result.results[0].xb)
                UserCenter.setGxqm(data.result.results[0].gxqm)
                
                GlobEvent.emit('update_UserCenter');
                GlobEvent.emit('update_Head');

            }else{
                showAlertBox(data.result.message);
            }
        }else {
            showAlertBox('请求错误');
        }
    });
}


module.exports = {
    submitRealName : submitRealName,
    getyanzheng :getyanzheng,
    bindCellPhone :bindCellPhone,
    ifyaoqing:ifyaoqing,
    getChangename:getChangename,
    sendName:sendName,
    changeSex : changeSex,
    changeUser : changeUser,
	gethongbao:gethongbao
};