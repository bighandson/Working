// window.PastData = {}

// PastData.setPastData = function (data) {
//     this.pastList = [];
//     for(var i = 0;i<data.length;i++){
//         var past = {};
//         past.userid = data.id;
//         this.pastList.push(past);    }
// };

// PastData.getPastData = function (data) {
//     return this.pastList;
// };
window.WabaoData = {}

//保存流水号信息
WabaoData.setSerialData = function(data){
    this.serialList= [];
    for(var i =0; i< data.length;i++){
        var serial = {};
        serial.userid = UserCenter.getUserID();
        serial.lsh = data.lsh;
        this.serialList.push(serial);
    }
};
//获取流水号信息
WabaoData.getSerialData = function(data){
    return this.serialList;
}
