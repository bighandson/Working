/**
 *  ios 接口
 */

window.IPAManager = {};

/**
 * 苹果内购
 * @param productId
 */
window.IPAManager.sendIPAPay = function (productId) {
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendIPAPay:',productId);
    }
}

/**
 * 苹果内购
 * @param errCode
 * @param uuid
 * @param receipt
 * @param productId
 */
window.IPAManager.IPAPayCallback = function (errCode,uuid,receipt,productId) {
    GlobEvent.emit('IPAPayCallback',errCode,uuid,receipt,productId);
}

/**
 * 苹果自带分享
 * @param url
 */
window.socialShare = function (url) {
    if(!cc.sys.isNative){
        return;
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','soicalShare:',url);
    }
}

/**
 * by Amao 2017.11.10  KSSDK 进行服务器交互 获取订单号  （用于第三方支付）
 * @spbh 商品编号
 * @channelId 客户端选择支付渠道
 */
window.IPAManager.sendInfoForServerAndGetOrder = function(productId,spbh,jgm,appId) {
    showLoadingAni()

    PomeloClient.request('user.userHandler.post',{
        url : '3063',
        data : {
            appid : appId,
            jgm   : jgm,
            spbh  : spbh,
            userid: UserCenter.getUserID(),
            expand: ""
        }
    },
    function (data) {
        hideLoadingAni();
        if(data.code == 200 && !!data.result.status){
            cc.log("请求订单信息:",data.result.results)
            showAlertBox('正在发送订单信息,请稍等');
            // 将 订单号 productId 推送到oc 层 发起支付
            var order = data.result.results[0].out_trade_no;

            var productid = data.result.results[0].productid;

            if(cc.sys.os == cc.sys.OS_IOS){
                jsb.reflection.callStaticMethod('NativeOcClass','SendOtherPay:ProductId:ChannelId:',order,productid,1);
            }
        }
    }
    );
}

/**
 * by Amao 2017.11.10 进行服务器交互 支付成功回调 通知服务器发起二次校验  （用于第三方支付）
 * @order 商品编号
 * @channelId 支付渠道
 */
window.IPAManager.sendInfoForServerCheckPayResult = function (order,productId,cpOrder,channelId) {
    // cc.log("yanzh jieguo -=========KAISHI  YANZHEN===========",)
    PomeloClient.request('user.userHandler.post',{
        url : '3064',
        data : {
            userid  : UserCenter.getUserID(),
            djhm    : order,
            zhlx    : 1,
            expand  : ''
        }
    },function (data) {
        hideLoadingAni();
        
        // cc.log("===================yanzh jieguo :",JSON.stringify(data))
        if(data.code == 200 && !!data.result.status){
            UserCenter.setList(data.result.results);
            GlobEvent.emit('update_UserCenter');
            showAlertBox('充值成功！');
        }else{
            showAlertBox('服务器暂忙,请稍后查询充值结果');
        }
    });
    
    // GlobEvent.emit('pay_finish',errCode,wxCache.spbh);
}