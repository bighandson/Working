// <<<<<<< HEAD
var config = require('Config');
var Recharge = require('Recharge');

var list1 = null ;
var list2  = null;

var getExchangeBeansList =function (account_type,expend,cb) {
    if(!!list1) {
        cb(null,list1)
    }else{
        getListBeans(account_type,expend,cb)
    }

}
var getExchangeCardList =function (account_type,expend,cb) {
    if(!!list2) {
        cb(null,list2)
    }else{
        getListCard(account_type,expend,cb)
    }

}

var getListBeans = function (account_type,expend,cb) {
    cc.log('getListBeans : ');
    PomeloClient.request('user.userHandler.post',{
        url : 'n3010',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            zhlx:account_type,
            expend : expend
        }
    },function (data) {
        cc.log('getListBeans : ',JSON.stringify(data));
        if(data.code == 200 && !!data.result.status){
            if(!!data){
                list1 = data.result;
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取兑换列表为空');
            }
        }else{
            cb(new Error(data.msg),data.msg);
        }
    });
};

var getListCard = function (account_type,expend,cb) {

    PomeloClient.request('user.userHandler.post',{
        url : '3072',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            zhlx:account_type,
            expend : expend
        }
    },function (data) {
        cc.log('getListCard : ',JSON.stringify(data));
        if(data.code == 200){
            if(!!data){
                list2 = data.result;
                cb(null,data.result);
            }else{
                cb(new Error('错误'),'获取兑换列表为空');
            }
        }else{
            cb(new Error(data.msg),data.msg);
        }
    });
};

/**
 * 金币兑换钻石
 */
var exchangegoods = function (lsh,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : 'n3013',
        data : {
            userid  : UserCenter.getUserID(),
            lsh     : lsh,
            jgm     : config.jgm,
            // vercode : Device.getBundleVersion(),
            // os      : Device.getOS(),
            expend  : expend,
        }
    },function (data) {
        cc.log(data)
        if(data.code == 200 && data.result.status){
            if(data.result.results[0].rtnState == 1){
                UserCenter.setList(data.result.results[0].list);
                cb(null,data.result);
            }else if(data.result.results[0].rtnState == 0){
                cb(null,data.result);
            }
        }else if(data.code == 200 && !data.result.status){
            showAlertBox(data.result.message);
        }else{
            cb(new Error(data.result.message),data.result.message);
        }
    });
}

var gotobuy = function (data) {
    var result = data.results[0];
    if(result.zfqd =='01'){
        //vercode : Device.getBundleVersion(),
        //os : Device.getOS(),
        //add by sword 2017-12-11
        //todo: 修改苹果支付expend 参数格式
        //修改为: 首充标志$兑换商品编号$jsonstr=JSON
    var expendjson = {
            buildid:Device.getBundleVersion(),
            os: Device.getOS()
        }
        var expend = result.scbz + '$' + result.dhspbh + '$jsonstr=' + JSON.stringify(expendjson) ;
        cc.log("gotobuy:",expend);
        Recharge.sendIPAPay(result.iap,result.spbh,expend);
    }
    else if (result.zfqd =='02'){
        Recharge.sendWeChatPay(result.spbh,result.zfqd,result.scbz + '$' + result.dhspbh);
    }else if(result.zfqd =='05'){
        var expendjson = {
            scbz : result.scbz,
            dhspbh : result.dhspbh,
        }
        Recharge.sendH5Pay(result.spbh,JSON.stringify(expendjson),function (err,data) {
            if(err){
                cc.log(err);
                return
            }
            cc.log(data);
            Recharge.setShop(true);
            Device.goWebURL(data);
        })

    }
}

module.exports = {
    getExchangeBeansList : getExchangeBeansList,
    exchangegoods:exchangegoods,
    getExchangeCardList:getExchangeCardList,
    gotobuy : gotobuy,
};


// =======
// var config = require('Config');
// var Recharge = require('Recharge');
//
// var list1 = null ;
// var list2  = null;
//
// var getExchangeBeansList =function (account_type,expend,cb) {
//         if(!!list1) {
//             cb(null,list1)
//         }else{
//             getListBeans(account_type,expend,cb)
//         }
//
//     }
// var getExchangeCardList =function (account_type,expend,cb) {
//     if(!!list2) {
//         cb(null,list2)
//     }else{
//         getListCard(account_type,expend,cb)
//     }
//
// }
//
//
//
//
//
// var getListBeans = function (account_type,expend,cb) {
//     cc.log('getListBeans : ');
//     PomeloClient.request('user.userHandler.post',{
//         url : '3072',
//         data : {
//             userid : UserCenter.getUserID(),
//             jgm : config.jgm,
//             zhlx:account_type,
//             expend : expend
//         }
//     },function (data) {
//         cc.log('getListBeans : ',JSON.stringify(data));
//         if(data.code == 200 && !!data.result.status){
//             if(!!data){
//                 list1 = data.result;
//                 cb(null,data.result);
//             }else{
//                 cb(new Error('错误'),'获取兑换列表为空');
//             }
//         }else{
//             cb(new Error(data.msg),data.msg);
//         }
//     });
// };
// var getListCard = function (account_type,expend,cb) {
//
//     PomeloClient.request('user.userHandler.post',{
//     url : '3072',
//         data : {
//             userid : UserCenter.getUserID(),
//             jgm : config.jgm,
//             zhlx:account_type,
//             expend : expend
//         }
//     },function (data) {
//         cc.log('getListCard : ',JSON.stringify(data));
//         if(data.code == 200){
//             if(!!data){
//                 list2 = data.result;
//                 cb(null,data.result);
//             }else{
//                 cb(new Error('错误'),'获取兑换列表为空');
//             }
//         }else{
//             cb(new Error(data.msg),data.msg);
//         }
//     });
// };
//
// /**
//  * 兑换房卡
//  */
// var exchangegoods = function (goods_type,expend,cb) {
//     PomeloClient.request('user.userHandler.post',{
//         url : '3013',
//         data : {
//         userid : UserCenter.getUserID(),
//             spbh:goods_type,
//             jgm : config.jgm,
//             vercode : Device.getBundleVersion(),
//             os : Device.getOS(),
//             expend : expend,
//         }
//     },function (data) {
//     cc.log(data)
//         if(data.code == 200&&data.result.status){
//             if(data.result.results[0].rtnState==1 && data.result.status==true){
//                 UserCenter.setList(data.result.results[0].list);
//                 cb(null,data.result);
//             }else if(data.result.results[0].rtnState==0){
//                 cb(null,data.result);
//             }
//         }else if(data.code == 200&&!data.result.status){
//             showAlertBox(data.result.message);
//         }else{
//             cb(new Error(data.msg),data.msg);
//         }
//     });
// }
//
// var gotobuy = function (data) {
//     var result = data.results[0];
//     if(result.zfqd =='01'){
//         //vercode : Device.getBundleVersion(),
//         //os : Device.getOS(),
//         //add by sword 2017-12-11
//         //todo: 修改苹果支付expend 参数格式
//         //修改为: 首充标志$兑换商品编号$jsonstr=JSON
//     var expendjson = {
//             buildid:Device.getBundleVersion(),
//             os: Device.getOS()
//         }
//         var expend = result.scbz + '$' + result.dhspbh + '$jsonstr=' + JSON.stringify(expendjson) ;
//         cc.log("gotobuy:",expend);
//         Recharge.sendIPAPay(result.iap,result.spbh,expend);
//     }
//     else if (result.zfqd =='02'){
//         Recharge.sendWeChatPay(result.spbh,result.zfqd,result.scbz + '$' + result.dhspbh);
//     }else if(result.zfqd =='05'){
//         var expendjson = {
//             scbz : result.scbz,
//             dhspbh : result.dhspbh,
//         }
//         Recharge.sendH5Pay(result.spbh,JSON.stringify(expendjson),function (err,data) {
//             if(err){
//                 cc.log(err);
//                 return
//             }
//             cc.log(data);
//             Recharge.setShop(true);
//             Device.goWebURL(data);
//         })
//
//     }
// }
//
// module.exports = {
//     getExchangeBeansList : getExchangeBeansList,
//     exchangegoods:exchangegoods,
//     getExchangeCardList:getExchangeCardList,
//     gotobuy : gotobuy,
// };
//
//
// >>>>>>> origin/master
