
var config = require('Config');
var getDzList = function (expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8813',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			expand : expend,
		}
	},function (data) {
		if(data.code == 200){  // 获取成功
			cb(null,data.result);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
}
var addDzList = function (name,num,code,addr, expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8810',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			xm:name,
			sjhm:num,
			addrcode:code,
			addr:addr,
			expand : expend,
		}
	},function (data) {
		if(data.code == 200){  // 获取成功
			cb(null,data.result);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
}
var changeDzList  = function (xh,name,num,code,addr, expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8811',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			xh:xh,
			xm:name,
			sjhm:num,
			addrcode:code,
			addr:addr,
			expand : expend,
		}
	},function (data) {
		if(data.code == 200){  // 获取成功
			cb(null,data.result);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
}

var setMoren = function(xh,expend,cb){
	PomeloClient.request('user.userHandler.post',{
		url : 'm8814',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			xh:xh,
			expand : expend,
		}
	},function (data) {
		if(data.code == 200){  // 获取成功
			cb(null,data.result);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
}

module.exports = {
	getDzList : getDzList,
	addDzList : addDzList,
	changeDzList:changeDzList,
	setMoren:setMoren
}