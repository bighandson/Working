var config = require('Config');
var notice = config.notice;
var setNotice = function(tab){
	notice = tab;
};
var getNotice = function(){
	return notice;
};
 module.exports = {
     setNotice:setNotice,
     getNotice,getNotice
}