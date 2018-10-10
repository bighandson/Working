var config = require('Config');
var getDuiList = function (expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8800',
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

var getDuiEdList = function (expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8815',
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


var getDuiEdXq = function (lsh,expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8816',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			lsh:lsh,
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




var Duihuan = function (spbh,expend,cb) {
	PomeloClient.request('user.userHandler.post',{
		url : 'm8801',
		data : {
			userid : UserCenter.getUserID(),
			jgm : config.jgm,
			expand : expend,
			spbh:spbh
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
	getDuiList : getDuiList,
	Duihuan:Duihuan,
	getDuiEdList:getDuiEdList,
	getDuiEdXq:getDuiEdXq
}