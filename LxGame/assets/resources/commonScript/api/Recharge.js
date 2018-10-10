
/**
 *  充值管理
 */

var config = require('Config');
var async = require('async');

var ipaCache = {};
var wxCache = {};

var goToShop = false;

var chargeList = null;

var setShop = function (data) {
    goToShop = data;
}

var getShop = function () {
    return goToShop;
}

// h5下单
var sendH5Pay = function (spbh,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '3053',
        data : {
            userid : UserCenter.getUserID(),
            jgm    : config.jgm,
            spbh   : spbh,
            expand : expend
        }
    },function (data) {
        cc.log('sendWeChatPay',data);
        hideLoadingAni();
        if(data.code == 200 ){
            if(!!data.result.status){
                var res = data.result.results[0];
                var url = res.currequest_url+'app_id='+res.app_id+'&pay_type='+res.pay_type+'&order_id='+res.order_id+'&order_amt='+res.order_amt+'&notify_url='+res.notify_url+'&return_url='+res.return_url+'&goods_name='+res.goods_name+'&goods_num='+res.goods_num+'&goods_note='+res.goods_note+'&extends='+res.extends+'&time_stamp='+res.time_stamp+'&is_json='+res.is_json+'&sign='+res.sign;
                cb(null,url)
            }else {

                showAlertBox(data.result.message)
                cb(new Error(data.msg),data.msg)
            }

        }else{
            showAlertBox('充值失败');
            cb(new Error('充值失败'),'充值失败')
        }
    })
}





// 微信下单
var sendWeChatPay = function (spbh,zfqd,expend) {
    PomeloClient.request('user.userHandler.post',{
        url : '3051',
        data : {
            userid : UserCenter.getUserID(),
            appid  : Device.getAppID(),
            jgm    : config.jgm,
            spbh   : spbh,
            zfqd   : zfqd,
            expand : expend
        }
    },function (data) {
        cc.log('sendWeChatPay',data);
        hideLoadingAni();
        if(data.code == 200 ){
            if(!!data.result.status){
                var res = data.result.results[0];
                wxCache = {};
                wxCache.zhlx = res.zhlx;
                wxCache.djhm = res.out_trade_no;
                wxCache.expend = expend;
                wxCache.spbh = spbh;
                sendWXPay(res.partnerid,res.prepayid,res.noncestr,res.timestamp,res.sign,res.zhlx,res.out_trade_no,expend);
            }else {
                showAlertBox(data.result.message)
            }

        }else{
            showAlertBox('充值失败');
        }
    })
}

/**
 * 调用微信支付
 * @param partnerid
 * @param prepayid
 * @param noncestr
 * @param timestamp
 * @param sign
 * @param zhlx
 * @param djhm
 * @param expend
 */
var sendWXPay = function (partnerid,prepayid,noncestr,timestamp,sign,zhlx,djhm,expend) {
    wxapi.sendWXPay(partnerid,prepayid,noncestr,timestamp,sign);
}

// 苹果支付下单
var sendIPAPay = function (productId,spbh,expend) {
        cc.log('sendIPAPay : ',productId,spbh,expend);
        ipaCache = {};
        ipaCache.productId = productId;
        ipaCache.spbh = spbh;
        ipaCache.expend = expend;
        IPAManager.sendIPAPay(productId);
    }

// 微信支付校验
var validateWeChatPay = function (errCode) {
    cc.log('validateWeChatPay : ',errCode);
    if(errCode == 0){
        PomeloClient.request('user.userHandler.post',{
            url : '3061',
            data : {
                userid  : UserCenter.getUserID(),
                djhm    : wxCache.djhm,
                zhlx    : wxCache.zhlx,
                expand  : wxCache.expend
            }
        },function (data) {
            cc.log('validateWeChatPay',JSON.stringify(data));
            if(data.code == 200 && !!data.result.status){
                UserCenter.setList(data.result.results);
                GlobEvent.emit('update_UserCenter');
            }
        });
    }
    hideLoadingAni();
    GlobEvent.emit('pay_finish',errCode,wxCache.spbh);
}


// 苹果支付校验
var validateIPAPay = function (errCode,uuid,receipt,productId) {
    
    if(errCode == 0){
        //validateIPAPay(uuid,receipt,productId);
        var localIPAs = cc.sys.localStorage.getItem('localIPAs');
        if(!localIPAs){
            localIPAs = [];
        }else {
            localIPAs = JSON.parse(localIPAs);
        }

        localIPAs.push({
            uuid       : uuid,
            receipt    : receipt,
            spbh       : ipaCache.spbh || '',
            expand     : ipaCache.expend || ''    // 首次充值标志 + $ + dhspbh 兑换商品标号
        });
        cc.sys.localStorage.setItem('localIPAs',JSON.stringify(localIPAs));
        validateIPA(uuid,receipt,ipaCache.spbh,ipaCache.expend,function (data) {
            if(data.code == 200 && !!data.result.status){
            localIPAs.pop();
                cc.sys.localStorage.setItem('localIPAs',JSON.stringify(localIPAs));
            }
        });
    }
    // 通知支付完成
    hideLoadingAni();
    GlobEvent.emit('pay_finish',errCode,ipaCache.spbh);
}

var validateIPA = function (uuid,receipt,spbh,expend,cb) {
    cc.log('validateIPA',uuid,receipt,spbh,expend);
    PomeloClient.request('user.userHandler.post',{
        url  : '3062',
        data : {
        userid        : UserCenter.getUserID(),
            uuid          : uuid,
            jgm           : config.jgm,
            receiptData   : receipt,
            spbh          : spbh,
            expand        : expend    // 首次充值标志 + $ + dhspbh 兑换商品标号
        }
    },function (data) {
        cc.log('validateIPA',JSON.stringify(data));
        if(data.code == 200 && !!data.result.status){
        UserCenter.setList(data.result.results);
            GlobEvent.emit('update_UserCenter');
        }
        cb(data);
    });
}
/**
 * 苹果支付校验
 */
GlobEvent.on('onConnected',function () {
    cc.log('onConneted');
    var localIPAs = cc.sys.localStorage.getItem('localIPAs');
    if(!localIPAs){
        return;
        //localIPAs = [];
    }else {
        localIPAs = JSON.parse(localIPAs);
    }

    var err = false;
    async.whilst(
        function () {
            return (localIPAs.length > 0 && !err);
        },
        function (cb) {
            var data = localIPAs[0];
            validateIPA(data.uuid || UserCenter.getUserID(),data.receipt,data.spbh || '',data.expand || '',function (data) {
                if(data.code == 200){
                    localIPAs.shift();
                    cb();
                }else {
                    err = true;
                    cb(new Error('validate err'));
                }
            });
        },
        function (err) {
            if(err){
                cc.sys.localStorage.setItem('localIPAs',JSON.stringify(localIPAs));
            }else {
                cc.sys.localStorage.removeItem('localIPAs');
            }
        }
    );
});

// 监听微信支付回调
GlobEvent.on('WXPayCallback',function (errCode) {
    validateWeChatPay(errCode);
});

// 监听苹果支付回调
GlobEvent.on('IPAPayCallback',function (errCode,uuid,receipt,productId) {
    validateIPAPay(errCode,uuid,receipt,productId);
});

/**
 * 获取充值列表
 */
var getReChargeList = function (expend,cb) {
    if(!!chargeList){
        cb(null,chargeList);
        return;
    }
    PomeloClient.request('user.userHandler.post',{
        url : '3041',
        data : {
            userid : UserCenter.getUserID(),
            jgm : config.jgm,
            vercode : Device.getBundleVersion(),
            os : Device.getOS(),
            expand : expend
        }
    },function (data) {
        cc.log('getReChargeList',data);
        if(data.code == 200 && !!data.result.status){
        chargeList = data.result;
            cb(null,chargeList);
        }else{
            cb(new Error(data.msg),data.msg);
        }
    });
}
// <<<<<<< HEAD

/*
* by Amao 2017.11.10  KSSDK 发起支付  （用于第三方支付）
*/ 
var sendKssdkPay = function (partnerid,prepayid) {
    IPAManager.sendInfoForServerAndGetOrder(partnerid,prepayid,config.jgm,Device.getAppID())
}


// =======
var clearList = function(){
    chargeList = null;
}
// >>>>>>> origin/master
module.exports = {
getReChargeList : getReChargeList,
    sendWeChatPay   : sendWeChatPay,
    sendKssdkPay    : sendKssdkPay,
    clearList : clearList,
    sendIPAPay      : sendIPAPay,
    sendH5Pay : sendH5Pay,
    setShop : setShop,
    getShop : getShop
}