/**
 * 闲来接口
 */
var LoadGame = require('LoadGame')

window.xlapi = {};

window.xlapi.isInstallXL = function(){
    if(cc.sys.os == cc.sys.OS_IOS){
        return jsb.reflection.callStaticMethod('NativeOcClass','isInstallXL');
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        return true;
        //return jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','isInstallXL','()Z');
    }

    return false;
}

window.xlapi.sendTextToXL = function(text){
    if(!cc.sys.isNative){ return; }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendTextToXL:',text);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendTextToXL', '(Ljava/lang/String;)V',text);
    }
} 

window.xlapi.sendImageToXL = function(imagePath){
    if(!cc.sys.isNative){ return; }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendImageToXL:',imagePath);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendImageToXL', '(Ljava/lang/String;)V',imagePath);
    }
}

window.xlapi.sendLinkToXL = function(title,desc,roomId,roomToken){
    if(!cc.sys.isNative){ return; }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendLinkToXL:text:roomId:roomToken:',title,desc,roomId.toString(),roomToken);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendLinkToXL',
            '(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V',title,desc,roomId.toString(),roomToken);
    }
}

window.xlapi.sendAuthReqXL = function(scope,state){
    if(!cc.sys.isNative){ 
        XLAuthCallback(0)
        return; 
    }
    if(cc.sys.os == cc.sys.OS_IOS){
        jsb.reflection.callStaticMethod('NativeOcClass','sendXLAuthReq:',state);
    }else if(cc.sys.os == cc.sys.OS_ANDROID){
        jsb.reflection.callStaticMethod('org/cocos2dx/javascript/AppActivity','sendXLAuthReq',"(Ljava/lang/String;Ljava/lang/String;)V",scope,state);
    }
}

window.xlapi.XLAuthCallback = function(appid,code,state){
    GlobEvent.emit('XLAuthCode',appid,code,state);
}

window.xlapi.XLShareCallback = function(errCode){
    var code = !!errCode ? parseInt(errCode) : 0;
    GlobEvent.emit('XLShare', code);
}

window.xlapi.XLInviteCallback = function(roomId,roomToken){
    GlobEvent.emit('XLInvite',roomId,roomToken);
}