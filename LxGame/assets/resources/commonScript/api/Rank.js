/**
 * Created by ximena on 2017/5/26.
 */
 var config = require('Config');
 var wealth = null;
 var charm = null
var Saishi = null
 /**
  * 获取财富列表
  * @param cb
  */
 var getWealth = function (expend,cb) {

     if(arguments.length === 2 && typeof expend === 'function') {
         cb = expend;
         expend = null;
     } else {
         expend = expend || null;
     }

     if(wealth!=null){
       cb(null,wealth);
       return;
     }
     cc.log('request getWealth');
     PomeloClient.request('user.userHandler.post',{
         url : '6001',
         data : {
             userid : UserCenter.getUserID(),
             jgm    : config.jgm,
             expand : expend
         }
     },function (data) {
         if(data.code == 200){
              wealth = data.result;
             cb(null,wealth);
         }else {
             cb(new Error(data.msg),data.msg);
         }
     });
 }



var getSaishi = function (expend,cb) {

	if(arguments.length === 2 && typeof expend === 'function') {
		cb = expend;
		expend = null;
	} else {
		expend = expend || null;
	}

	if(Saishi!=null){
		cb(null,Saishi);
		return;
	}
	cc.log('request getWealth');
	PomeloClient.request('user.userHandler.post',{
		url : '6007',
		data : {
			userid : UserCenter.getUserID(),
			jgm    : config.jgm,
			expand : expend
		}
	},function (data) {
		if(data.code == 200){
			Saishi = data.result;
			cb(null,Saishi);
		}else {
			cb(new Error(data.msg),data.msg);
		}
	});
}

 /**
  * 获取魅力值列表
  * @param cb
  */
 var getCharm = function (expend,cb) {

     if(arguments.length === 2 && typeof expend === 'function') {
         cb = expend;
         expend = null;
     } else {
         expend = expend || null;
     }

     if(charm!=null){
       cb(null,charm);
       return;
     }
     cc.log('request getCharm');
     PomeloClient.request('user.userHandler.post',{
         url : '6003',
         data : {
             userid : UserCenter.getUserID(),
             jgm    : config.jgm,
             expand : expend
         }
     },function (data) {
         if(data.code == 200){
              charm = data.result;
             cb(null,charm);
         }else {
             cb(new Error(data.msg),data.msg);
         }
     });
 }
 //获取是否上榜状态
var getifrank = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '3018',
        data : {
            userid : UserCenter.getUserID(),
            jgm    : config.jgm,
            expand : expend
        }
    },function (data) {
        if(data.code == 200){
            cb(null, data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}


// 更改是否上榜状态

var setifrank = function (ifrank,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '3017',
        data : {
            userid : UserCenter.getUserID(),
            rankbz:ifrank,
            jgm    : config.jgm,
            expand : expend
        }
    },function (data) {
        cc.log('setifrank : ',JSON.stringify(data));
        if(data.code == 200){
            cb(null, data.result);
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

//获取当前寻宝信息
var getLSH = function (expend, cb) {
    PomeloClient.request('user.userHandler.post', {
        url: 'n9001',
        data: {
            userid: UserCenter.getUserID(),
            expand: expend
        }
    }, function (data) {
        // cc.log(data);
        if (data.code == 200) {
            cc.log("获取n9001数据：");
            cb(null, data.result);
        } else {
            cb(new Error(data.msg), data.msg)
            cc.log("获取数据失败!!!!");
        }
    });
}
//获取往期开奖期数
var getWanqi = function (expend, cb) {
    PomeloClient.request('user.userHandler.post', {
        url: 'n9002',
        data: {
            userid: UserCenter.getUserID(),
            expand: expend
        }
    }, function (data) {
        if (data.code == 200) {
            cc.log("请求成功的数据：", data);
            cb(null, data.result);
        } else {
            cb(new Error(data.msg), data.msg)
        }
    });
}
//获取当前下注矿工数
var getXiazhu = function (expend, num, cb) {

    this.lsh = null;
    let self = this;
    this.getLSH('', function (err, data) {
        if (err) {
            cc.log('err', err);
            return;
        }
        cc.log("再次请求n9001返回成功的数据!!!!!!!", data);
        self.lsh = data.results[0].lsh;
        cc.log("流水号:", self.lsh);
        // cc.log({
        //     userid:UserCenter.getUserID(),
        //     lsh:self.lsh,
        //     gmsl:num,
        //     expand:expend,
        // });
        PomeloClient.request("user.userHandler.post", {
            url: 'n9003',
            data: {
                userid: UserCenter.getUserID(),
                lsh: self.lsh,
                gmsl: num,
                expand: expend,
            }
        }, function (data) {
            if (data.code == 200) {
                cc.log("请求挖矿下注返回数据:", data);
                cb(null, data.result);
            } else {
                cb(new Error(data.msg), data.msg)
            }
        });
    });
}





 module.exports = {
     getWealth : getWealth,
     getCharm  : getCharm,
     getifrank:getifrank,
     setifrank:setifrank,
     getLSH: getLSH,
     getWanqi: getWanqi,
     getXiazhu : getXiazhu,
	   getSaishi:getSaishi
   }
