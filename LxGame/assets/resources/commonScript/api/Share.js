
var config = require('Config');

var shareInfo = null;

//获取分享
var getActivity = function (expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '5006',
        data : {
            userid    : UserCenter.getUserID(),
            jgm       : config.jgm,
            expend    : expend
        }
    },function (data) {
        cc.log('getfenxiang',data);
        if(data.code == 200 && !!data.result.status){
            cb(null,data.result);
        }else{
            cb(new Error(data.msg),data.msg);
        }
    });
}


/**
 * 获取分享信息
 */
var getShareInfo = function (expend,cb) {
    if(shareInfo){
        cb(null,shareInfo);
        return;
    }

    PomeloClient.request('user.userHandler.post',{
        url : '5001',
        data : {
            userid    : UserCenter.getUserID(),
            jgm       : config.jgm,
            expend    : expend
        }
    },function (data) {
        cc.log('getShareInfo',data);
        if(data.code == 200 && !!data.result.status){
            shareInfo = data.result.results[0];
            cb(null,shareInfo);
        }else{
            cb(new Error(data.result.message),data.result.message);
        }
    });
}

/**
 * 分享图片
 * @param shareTo
 */
var shareToPic = function (shareTo,picurl) {
    var index = picurl.lastIndexOf('/');
    if(index < 0){
        return;
    }

    var image = picurl.substr(index+1);
    cc.log('shareToPic : ' +image);
    if(!cc.sys.isNative){
        GlobEvent.emit('WXShare',0);
        return;
    }

    var dirpath = jsb.fileUtils.getWritablePath() + 'share/';
    if(jsb.fileUtils.isFileExist(dirpath + image)){
        wxapi.sendImageToWxReq(dirpath + image,shareTo);
    }else{
        downloadFile(picurl,image,'share/',function (err,imagepath) {
            if(err){
                cc.log(err);
                return;
            }
            wxapi.sendImageToWxReq(imagepath,shareTo);
        });
    }
}

/**
 * 分享连接
 * @param shareTo
 */
var shareToLink = function (shareTo,shareInfo) {
    wxapi.sendWebPageToWxReq(shareInfo.yxfxbt,shareInfo.yxfxnr,shareInfo.yxfxdz,shareTo);
}

/**
 * 分享文字
 * @param shareTo
 */
var shareToText = function (shareTo,text) {
    wxapi.sendMessageToWxReq(text,shareTo);
}

var shareToWX = function (shareTo) {
    showLoadingAni();
    getShareInfo('',function (err,shareInfo) {
        hideLoadingAni();
       if(err){
           cc.log(err);
           return;
       }
       if(!!shareInfo.picurl){
           cc.log('shareInfo.picurl',shareInfo.picurl);
           shareToPic(shareTo,shareInfo.picurl);
       }else if(!!shareInfo.yxfxdz){
           cc.log('shareInfo.yxfxdz',shareInfo.yxfxdz);
           shareToLink(shareTo,shareInfo);
       }else if(!!shareInfo.yxfxnr){
           shareToText(shareTo,shareInfo.yxfxnr);
       }
    });
}

var checkShare = function (cb) {
    var shexpend = '';
    if(!!config.shareexpend){
        shexpend = config.shareexpend
    }
    cc.log(shexpend)
    PomeloClient.request('user.userHandler.post',{
        url : '5002',
        data : {
            userid : UserCenter.getUserID(),
            jgm    : config.jgm,
            fxqd   : config.ffqd,
            expand : shexpend,
        }
    },function (data) {
        cc.log('checkShare',JSON.stringify(data));
        if(cb){
            cb()
        }
        if(data.code == 200 && !!data.result.status){
            UserCenter.setList(data.result.results);
            GlobEvent.emit('update_UserCenter');

            showAlert("分享成功，恭喜获得奖励！");
        }
    });
}

module.exports = {
    shareToWX : shareToWX,
    checkShare : checkShare,
    getActivity : getActivity
}