

var SSSRule2 = require('SSSRule2');

cc.Class({
    extends: SSSRule2,

    properties: {
       
    },

    // use this for initialization
    onLoad: function () {
        this._super();
    },

    RCMD_Expend : function (data) {
        cc.log("RCMD_Expend");
        cc.log(data);
        var expend = data.data;
        if(expend.CMD == '001'){
            var arr = expend.ar;
            UserCenter.setList(arr);
        }
        if (data.data.CMD == '003'){
            cc.log('cmd003')
            this.renew = data.data.renew;
        }
        if (data.data.CMD == '004'){
            cc.log('cmd004')
            this.renew = data.data.renew;
            this.kicknum = data.data.exit;
        }
    },

    // /**
    //  * 判断顺子大小
    //  * @param pokers1
    //  * @param pokers2
    //  * @returns {*}
    //  */
    // judgeShunzi:function(pokers1,pokers2)
    // {
    //     let length1 = pokers1.length;
    //     let length2 = pokers2.length;
    //     let length = length1 < length2?length1:length2;
    //     for(let i = 0;i < length;i++)
    //     {
    //         let tempPoker1 = pokers1[i];
    //         let tempPoker2 = pokers2[i];
    //         if(this.getPokerNumByPoker(tempPoker1) != this.getPokerNumByPoker(tempPoker2))
    //         {   
    //             //如果顺子是 1 2 3 4 5则比较牌值大小
    //             //这样实现 1 2 3 4 5 是最小的顺子
    //             if(i == 0){
    //                 if(this.getPokerNumByPoker(pokers1[0]) == 1 && this.getPokerNumByPoker(pokers1[1]) == 5){
    //                     return this.getPokerNumByPoker(pokers1[0]) > this.getPokerNumByPoker(pokers2[0])
    //                 }
            
    //                 if(this.getPokerNumByPoker(pokers2[0]) == 1 && this.getPokerNumByPoker(pokers2[1]) == 5){
    //                     return this.getPokerNumByPoker(pokers1[0]) > this.getPokerNumByPoker(pokers2[0])
    //                 }
    //             }
    //             return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    //         }
    //     }
    //     //都相同，比第一个
    //     let tempPoker1 = pokers1[0];
    //     let tempPoker2 = pokers2[0];
    //     return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
    // },

    // /**
    //  * 判断同花顺大小
    //  * @param pokers1
    //  * @param pokers2
    //  * @returns {*}
    //  */
    // judgeTonghuashun : function (pokers1,pokers2) {
    //     cc.log("dqRule>>>>>>>>judgeTonghuashun");
    //     return this.judgeShunzi(pokers1,pokers2);
    // },

    getPokerWeightByPoker:function(poker)
    {   
        return poker.getComponent("sss4Poker").weight;
    },

    getPokerTypeByPoker:function(poker)
    {   
        return poker.getComponent("sss4Poker").type;
    },

    getPokerNumByPoker:function(poker)
    {
        return poker.getComponent("sss4Poker").num;
    },
    // /**
    //  * 葫芦
    //  * @param pokers
    //  * @returns {Array}
    //  */
    // getHulu: function (pokers) {
    //     let arr = [];
    //     let linshiarr = [];
    //     if (pokers.length < 5) {
    //         return arr;
    //     }
    //     let ret = SssManager.combination(pokers, 3);
    //     for (let i = 0; i < ret.length; i++) {
    //         let temp = ret[i];
    //         this.sortSelectedNumPokers(temp);

    //         if ((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
    //                 this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) )
    //         ) {
    //             let num = this.getPokerNumByPoker(temp[0]);
    //             if (!~linshiarr.indexOf(num)) {
    //                 arr.push(temp);
    //                 linshiarr.push(num);
    //             }
    //         }
    //     }

    //     let retArr = [];
    //     let linshiArr = [];
    //     //选最小的牌
    //     for (let i = 0; i < arr.length; i++) {
    //         let temp = arr[i];
    //         for (let j = pokers.length - 1; j >= 0; j--) {
    //             if (j > 0 && this.getPokerNumByPoker(temp[0]) != this.getPokerNumByPoker(pokers[j]) && this.getPokerNumByPoker(temp[0]) != this.getPokerNumByPoker(pokers[j - 1])
    //                 && ( this.getPokerNumByPoker(pokers[j]) == this.getPokerNumByPoker(pokers[j - 1]))
    //             ) {
    //                 if(!!pokers[j - 3] && this.getPokerNumByPoker(pokers[j]) == this.getPokerNumByPoker(pokers[j - 2])&& this.getPokerNumByPoker(pokers[j]) == this.getPokerNumByPoker(pokers[j - 3])){
    //                     var _temp = [].concat(temp);  //数组深度复制
    //                     _temp.push(pokers[j]);
    //                     _temp.push(pokers[j - 1]);
    //                     this.sortSelectedNumPokers(_temp);
    //                     linshiArr.push(_temp);
    //                     j -= 2;
    //                     cc.log('linshiArr1',linshiArr)
    //                     // break;

    //                 }else if(!! pokers[j - 2] && this.getPokerNumByPoker(pokers[j]) == this.getPokerNumByPoker(pokers[j -2]) ){
    //                     var _temp = [].concat(temp);  //数组深度复制
    //                     _temp.push(pokers[j]);
    //                     _temp.push(pokers[j - 1]);
    //                     this.sortSelectedNumPokers(_temp);
    //                     linshiArr.push(_temp);
    //                     j --;
    //                     cc.log('linshiArr2',linshiArr)
    //                     // break;
    //                 }else{
    //                     var _temp = [].concat(temp);  //数组深度复制
    //                     _temp.push(pokers[j]);
    //                     _temp.push(pokers[j - 1]);
    //                     this.sortSelectedNumPokers(_temp);
    //                     retArr.push(_temp);
    //                     cc.log('retArr',retArr)
    //                     // break;
    //                 }

    //             }
    
    //         }
    //     }

    //     cc.log(retArr);
    //     return (retArr.concat(linshiArr));
    // },
    // /**
    //  * 顺子
    //  * @param pokers
    //  * @returns {Array}
    //  */
    // getShunzi: function (pokers) {
    //     let arr = [];
    //     let linshiarr = [];//数组去重
    //     let arr1 = []; //数据A
    //     if (pokers.length < 5) {
    //         return arr;
    //     }
    //     let ret = SssManager.combination(pokers, 5);
    //     cc.log(ret);
    //     for (let i = 0; i < ret.length; i++) {
    //         let temp = ret[i];
    //         this.sortSelectedNumPokers(temp);

    //         if (this.getPokerNumByPoker(temp[4]) == 1) {
    //             if ((this.getPokerNumByPoker(temp[0]) == 13 &&
    //                     this.getPokerNumByPoker(temp[1]) == 12 &&
    //                     this.getPokerNumByPoker(temp[2]) == 11 &&
    //                     this.getPokerNumByPoker(temp[3]) == 10)) {

    //                 let num = this.getPokerNumByPoker(temp[0])+1;
    //                 if (!~linshiarr.indexOf(num)) {
    //                     arr.push(temp);
    //                     linshiarr.push(num);
    //                 }
    //             } else if ((this.getPokerNumByPoker(temp[0]) == 5 &&
    //                     this.getPokerNumByPoker(temp[1]) == 4 &&
    //                     this.getPokerNumByPoker(temp[2]) == 3 &&
    //                     this.getPokerNumByPoker(temp[3]) == 2)) {
    //                 let num = this.getPokerNumByPoker(temp[0]);
    //                 if (!~linshiarr.indexOf(num)) {
    //                     arr1.push(temp);
    //                     linshiarr.push(num);
    //                 }

    //             }
    //         } else {
    //             if (this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) + 1 &&
    //                 this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) + 2 &&
    //                 this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) + 3 &&
    //                 this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) + 4
    //             ) {
    //                 let num = this.getPokerNumByPoker(temp[0]);
    //                 if (!~linshiarr.indexOf(num)) {
    //                     arr.push(temp);
    //                     linshiarr.push(num);
    //                 }
    //             }

    //         }
    //     }
    //     cc.log(arr);
    //     return (arr.concat(arr1));
    // },

});
