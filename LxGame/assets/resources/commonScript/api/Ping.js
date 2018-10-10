//
// Author: Amao
// Date: 2017-10-26 09:42:15
//

/**  For Example

        var PING = require('Ping')

        PING.BindEvent(function (event){
            if (event.type == 1) {  // 良好
                cc.log("网络良好111:",event.ping);
            }else if(event.type == 2){  // 一般
                cc.log("网络一般111:",event.ping);
            }else if(event.type == 3){  // 差
                cc.log("网络较差111:",event.ping);
            }
        });

        PING.StartPing(5);

        PING.StopPing();

*/


var GapTime = 5;          // Ping 间隔时长
var Interval = null;      // 计时器实例
var PList = [];           // ping 记录 记录10条 取平均值
var PingingUrl = "https://api.bnngoo.com/ReceiveData";    //ping 地址

/*
 *网络状态监听
 *event = 1  良好
 *event = 2  一般
 *event = 3  差  
 */

var EventListener = function (event){
    if (event.type == 1) {  // 良好
        cc.log("网络良好:",event.ping);
    }else if(event.type == 2){  // 一般
        cc.log("网络一般:",event.ping);
    }else if(event.type == 3){  // 差
        cc.log("网络较差:",event.ping);
    }
};

// 绑定监听函数  (外部调用)
var BindEvent = function (func){
    EventListener = func;
};

//开始 (内部调用)
var start = function () {
    Interval = setInterval(function () {
        SendHttpPostOnce();
    }, GapTime*1000);
};

/**开始ping(外部调用)*/
var StartPing = function (gapTime,url) {
    if (gapTime) {
        GapTime = gapTime;
    };
    if (url) {
        PingingUrl = url;
    }
    start();
};

/**暂停ping*/
var StopPing = function () {
    if (Interval) {
        clearInterval(Interval);
        Interval = null;
    }
};

// 没ping一次  计算当前ping平均值 传递给应用层
var dowith = function () {
    
    let max = 0;
    for (var i = 0; i < PList.length; i++) {
        max += PList[i];
    }

    let ping = Math.floor(max/PList.length);


    if (ping > 500) {
        EventListener({type : 3,ping : ping});
    }else if(ping > 200){
        EventListener({type : 2,ping : ping});
    }else{
        EventListener({type : 1,ping : ping});
    }
};

// 发起一次 http 请求
var SendHttpPostOnce = function () {
    if(!cc.sys.isNative){
        return ;
    }
    let sendTime = (new Date()).valueOf(); 
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
            // post 失败 超时 ...... 
            let endTime = (new Date()).valueOf(); 
            if (PList.length > 10) {
                PList.splice(0,1);
            }
            PList.push(endTime - sendTime);
            dowith();
        }else if(xhr.readyState == 4 ){
            // post 成功
            let endTime = (new Date()).valueOf(); 
            if (PList.length > 10) {
                PList.splice(0,1);
            }
            PList.push(endTime - sendTime);
            dowith();
        }
    }
    xhr.open('POST', PingingUrl);
    xhr.timeout = 10000;  // 10秒超时
    xhr.send("");
};




module.exports = {
    EventListener : EventListener,
    BindEvent : BindEvent,
    start : start,
    StartPing : StartPing,
    StopPing : StopPing,
    dowith : dowith,
    SendHttpPostOnce : SendHttpPostOnce,
};