
// /**
//  *  获取活动信息
//  */
var config = require('Config');

var activitylist = null;

var date = null;
var day = 0;
var houers =0;
var year = 0;
var month = 0;

var saveactivityitem = function (notice_type,expend,cb) {
    PomeloClient.request('user.userHandler.post',{
        url : '4001',
        data : {
            id: '0',
            userid : UserCenter.getUserID(),
            notice_type:notice_type,
            jgm   : config.jgm,
            expand : expend,
        }
    },function (data) {
        cc.log("数据发送成功");
        if(data.code == 200){
            if(!!data.result){
                var date = new Date();
                day =date.getDate();
                houers =date.getHours();
                year = date.getFullYear();
                month = date.getMonth()
                activitylist = data.result;
                cb(null,activitylist);
            }else {
                cb(new Error('错误'), '获取活动信息为空');
            }
        }else {
            cb(new Error(data.msg),data.msg);
        }
    });
}

var getactivityitem = function (notice_type,expend,cb) {
    let datenow = new Date();
    let daynow =datenow.getDate();
    let monthnow = datenow.getMonth();
    let houersnow =datenow.getHours();
    let yearnow = datenow.getFullYear();
    if(!activitylist){
        saveactivityitem(notice_type,expend,cb);
    }else{
        if(yearnow-year>0){
            saveactivityitem(notice_type,expend,cb)
        }else if(monthnow- month>0){
            saveactivityitem(notice_type,expend,cb)
        }else if(daynow-day>0){
            if(houersnow>5){
                saveactivityitem(notice_type,expend,cb)
            }else{
                cb(null,activitylist);
            }
        }else {
            cb(null,activitylist);
        }
    }
}



var ifshow = true;
var ifshow2 = true;

var showactivity = function () {
    ifshow = true;
}
var hiddenactivity = function () {
    ifshow = false;
}

var getsifshow = function () {
    return ifshow;
}
var showactivity2 = function () {
    ifshow2 = true;
}
var hiddenactivity2 = function () {
    ifshow2 = false;
}

var getsifshow2 = function () {
    return ifshow2;
}





 module.exports = {
     showactivity:showactivity,
     hiddenactivity:hiddenactivity,
     getsifshow:getsifshow,
     getactivityitem:getactivityitem,
     showactivity2:showactivity2,
     hiddenactivity2:hiddenactivity2,
     getsifshow2:getsifshow2,
}