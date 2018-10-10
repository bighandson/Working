
var config = require('Config');
var LoadGame = require('LoadGame');
const SSSCommand = require("SSSCommand");
var SSSRule = require('SSSRule');
cc.Class({
    extends: SSSRule,

    properties: {
    },


    // use this for initialization
    onLoad: function () {
        SssManager.rule = this;

        this.initData();
        this.addPomeloListeners();
        this.node.on('CMD_Ready',this.CMD_Ready,this);
        this.node.on('CMD_Exit',this.CMD_Exit,this);
        //点击退出按钮
        this.node.on('onExit',this.onExit,this);

        let self = this;
        
        cc.loader.loadRes("game/bz/prefab/poker/pokerPrefab2",cc.Prefab,function(error,prefab){
            if (error) {
                cc.error(error.message || error);
                return;
            }
            //临时牌的对象池
            self.pokersPool = new cc.NodePool();
            let initCount = 4;
            for(let i = 0; i <= initCount; ++i){
                let poker = cc.instantiate(prefab);
                self.pokersPool.put(poker);
            }
        });
    },


    //得到该牌组的王的数量
    getCountAndIndexArrForWang : function (pokers) {
        let wCount = 0;//记录王的数量
        for(let i = 0; i < pokers.length; ++i){
            if(this.getPokerNumByPoker(pokers[i]) > 14){
                wCount++;
            }
        }
        return wCount;
    },

    //判断两张牌的差值是否小于diff,且poker1的值等于first,若first不传值,则不判断该条件
    isRightDiff : function (poker1,poker2,diff,first = -1) {
        let result1 = (this.getPokerNumByPoker(poker1) - this.getPokerNumByPoker(poker2) < diff)
        let result2;
        if(first == -1){
            result2 = true;
        }else{
            result2 = this.getPokerNumByPoker(poker1) == first;
        }
        return (result1 && result2)
    },

    //该牌组是否有两种或两种以上的花色
    isHasOtherHuase : function (pokers) {
        let type = this.getPokerTypeByPoker(pokers[0]);
        for(let i = 1; i < pokers.length; ++i){
            if(this.getPokerTypeByPoker(pokers[i]) != type){
                return true;
            }
        }
        return false;
    },

    //该牌组是否有一种或两种的数字
    isHasTwoOrOneNum : function (pokers) {
        let numCount = [];
        numCount.push(this.getPokerNumByPoker(pokers[0]));
        for(let i = 1; i < pokers.length; ++i){
            let num = this.getPokerNumByPoker(pokers[i]);
            if(!this.isNumsContainsNum(numCount,num)){
                numCount.push(num);
            }
        }
        return numCount.length < 3 ? true : false;
    },

    //该牌组是否只有一种的数字
    isHasOneNum : function (pokers) {
        let numCount = [];
        numCount.push(this.getPokerNumByPoker(pokers[0]));
        for(let i = 1; i < pokers.length; ++i){
            let num = this.getPokerNumByPoker(pokers[i]);
            if(!this.isNumsContainsNum(numCount,num)){
                numCount.push(num);
            }
        }
        return numCount.length == 1 ? true : false;
    },

    //nums中是否有数字num
    isNumsContainsNum : function (nums,num) {
        return !(!~nums.indexOf(num));
        // for(let i = 0; i < nums.length; ++i){
        //     if(nums[i] == num){
        //         return true;
        //     }
        // }
        // return false;
    },

    //该牌组是否有对子
    isHasDuizi : function(pokers,isHaveW = true){

        if(pokers.length < 2)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数字数组

        if(wCount == 0){
            if(arr2.length > 0) return true;
        }else if(wCount > 0){
            return true
        }
        return false;

        // let wCount;
        // if(isHaveW){
        //     wCount = this.getCountAndIndexArrForWang(pokers);
        // }else{
        //     wCount = 0;
        // }
         
        // //王的数量大于0,则说明该牌组有对子
        // if(wCount > 0){
        //     return true;
        // }

        // let ret = [];
        // if(pokers.length == 2){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,2);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]))
        //     {
        //         return true;
        //     }
        // }
        // return false;
    },


    //该牌组是否有两对
    isHasLiangdui : function (pokers,isHaveW = true) {
        if(pokers.length < 4)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数字数组

        if(wCount == 0){
            if(arr2.length > 1) return true;
        }else if(wCount == 1){
            if(arr2.length > 0) return true;
        }else if(wCount > 1){
            return true
        }
        return false;

        // let ret = [];
        // if(pokers.length == 4){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,4);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     //将该牌组从大到小排序
        //     this.sortSelectedNumPokers(temp);
            
            
        //     if(wCount == 0){//当没有王的时候,判断前两张和后两张是否是对子
        //         if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) 
        //         && this.getPokerNumByPoker(temp[2]) == this.getPokerNumByPoker(temp[3]))
        //         {
        //             return true;
        //         }
        //     }else if(wCount == 1) {//当有一张王的时候,判断后三张是否有对子,且后三张不是三条
        //         if(this.isHasDuizi(temp.slice(1),false) && !this.isHasSantiao(temp.slice(1),false))
        //         {
        //             return true;
        //         }
        //     }else if(wCount == 2) {//当有两张王的时候,判断后两张不是对子.
        //         if(this.getPokerNumByPoker(temp[2]) != this.getPokerNumByPoker(temp[3]))
        //         {
        //             return true;
        //         }
        //     }else {//当王的数量大于2,则有两对
        //         return true;
        //     }
        // }
        // return false;

    },

    //判断该牌组是否有三条
    isHasSantiao : function (pokers,isHaveW = true) {
        if(pokers.length < 3)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        if(wCount == 0){
            let arr3 = this.getArrForNumOrType(pokers,3,0);//获取数字出现三次的数字数组
            if(arr3.length > 0) return true;
        }else if(wCount == 1){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数字数组
            if(arr2.length > 0) return true;
        }else if(wCount > 1){
            return true
        }
        return false;

        // let ret = [];
        // if(pokers.length == 3){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,3);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     let wCount;
        //     if(isHaveW){
        //         wCount = this.getCountAndIndexArrForWang(temp);
        //     }else{
        //         wCount = 0;
        //     }
            
        //     this.sortSelectedNumPokers(temp);
        //     if(wCount == 0){//当没有王的时候,判断三张牌是否相同
        //         if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
        //         this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
        //         this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2])){
        //             return true;
        //         }
        //     }else if(wCount == 1){//当有一张王的时候,判断后两张是否是对子
        //         if(this.isHasDuizi(temp.slice(1),false)){
        //             return true;
        //         }
        //     }else{//当王的数量大于1的时候,则有三条
        //         return true;
        //     }
        // }

        // return false;
    },

    //判断该牌组是否有顺子
    isHasShunzi : function (pokers,isHaveW = true) {
        if(pokers.length < 5)
        {
            return false;
        }

        let ret = [];
        if(pokers.length == 5){
            ret.push(pokers);
        }else{
            ret = SssManager.combination(pokers,5);
        }

        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            let wCount;
            if(isHaveW){
                wCount = this.getCountAndIndexArrForWang(temp);
            }else{
                wCount = 0;
            }
            
            this.sortSelectedNumPokers(temp);
            //若最后一张为1
            if(this.getPokerNumByPoker(temp[4]) == 1){
                if(wCount == 0){
                    if((this.getPokerNumByPoker(temp[0]) == 13 &&
                    this.getPokerNumByPoker(temp[1]) == 12 &&
                    this.getPokerNumByPoker(temp[2]) == 11 &&
                    this.getPokerNumByPoker(temp[3]) == 10) ||

                    (this.getPokerNumByPoker(temp[0]) == 5 &&
                    this.getPokerNumByPoker(temp[1]) == 4 &&
                    this.getPokerNumByPoker(temp[2]) == 3 &&
                    this.getPokerNumByPoker(temp[3]) == 2)){
                        return true;
                    }
                }else if(wCount == 1 && !this.isHasDuizi(temp.slice(wCount),false)){
                    //若该牌组的第一张为王,且中间三张没有对子.
                    if(this.isRightDiff(temp[1],temp[3],4,13) || this.isRightDiff(temp[1],temp[3],4,5)){
                        return true;
                    }
                    if(this.isRightDiff(temp[1],temp[3],3,12) || this.isRightDiff(temp[1],temp[3],3,4)){
                        return true;
                    }
                }else if(wCount == 2 && !this.isHasDuizi(temp.slice(wCount),false)){
                    //若该牌组的第一、二张为王,且中间二张没有对子.
                    if(this.isRightDiff(temp[2],temp[3],4,13) || this.isRightDiff(temp[2],temp[3],4,5)){
                        return true;
                    }
                    if(this.isRightDiff(temp[2],temp[3],3,12) || this.isRightDiff(temp[2],temp[3],3,4)){
                        return true;
                    }
                    if(this.isRightDiff(temp[2],temp[3],2,11) || this.isRightDiff(temp[2],temp[3],2,3)){
                        return true;
                    }
                }else if(wCount == 3){
                    //三张王时,若第四张牌与A的差值小于5或者与1的差值小于5 则为顺子
                    if(14 - this.getPokerNumByPoker(temp[3]) < 5 || this.getPokerNumByPoker(temp[3]) - 1 < 5){
                        return true;
                    }
                }else if(wCount == 4){
                    //四张王时必有顺子
                    return true;
                }
            }else{//当没有1的时候
                if(wCount == 0){
                    if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1])+1 &&
                    this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2])+2 &&
                    this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3])+3 &&
                    this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4])+4
                    ){
                        return true;
                    }
                }else if(wCount < 4){
                    //当王的数量大于0小于4的时候,剩下的牌的最大差值小于5且没有对子时,则有顺子
                    if(this.isRightDiff(temp[wCount],temp[4],5) && !this.isHasDuizi(temp.slice(wCount),false)){
                        return true;
                    }
                }else if(wCount == 4){
                    //四张王时必有顺子
                    return true;
                }
            }
        }

        return false;

    },

    //该牌组是否有同花
    isHasTonghua : function (pokers,isHaveW = true){
        if(pokers.length < 5)
        {
            return false;
        }


        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        if(wCount == 0){
            let arr5 = this.getArrForNumOrType(pokers,5,1);//获取类型出现五次的数组
            if(arr5.length > 0) return true;
        }else if(wCount == 1){
            let arr4 = this.getArrForNumOrType(pokers,4,1);//获取类型出现四次的数组
            if(arr4.length > 0) return true;
        }else if(wCount == 2){
            let arr3 = this.getArrForNumOrType(pokers,3,1);//获取类型出现三次的数组
            if(arr3.length > 0) return true;
        }else if(wCount == 3){
            let arr2 = this.getArrForNumOrType(pokers,2,1);//获取类型出现两次的数组
            if(arr2.length > 0) return true;
        }else if(wCount > 3){
            return true;
        }
        return false;




        // let ret = [];
        // if(pokers.length == 5){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,5);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     let wCount;
        //     if(isHaveW){
        //         wCount = this.getCountAndIndexArrForWang(temp);
        //     }else{
        //         wCount = 0;
        //     }
            
        //     this.sortSelectedNumPokers(temp);
        //     //除了王之外的牌,如果花色一致,则是同花
        //     if (!this.isHasOtherHuase(temp.slice(wCount))){
        //         return true;
        //     }
        // }
        // return false;
    },

    //该牌组是否有葫芦
    isHasHulu : function (pokers,isHaveW = true) {
        if(pokers.length < 5)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        if(wCount == 0){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数组
            let arr3 = this.getArrForNumOrType(pokers,3,0);//获取数字出现三次的数组
            if(arr3.length > 0 && arr2.length > arr3.length){
                return true;
            }
            if(arr2.length == 0 && arr3.length > 1){
                return true;
            }
        }else if(wCount == 1){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数组
            if(arr2.length > 1) return true;
        }else if(wCount == 2){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数组
            if(arr2.length > 0) return true;
        }else if(wCount > 2){
            return true;
        }
        return false;


        // let ret = [];
        // if(pokers.length == 5){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,5);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     let wCount;
        //     if(isHaveW){
        //         wCount = this.getCountAndIndexArrForWang(temp);
        //     }else{
        //         wCount = 0;
        //     }
            
        //     this.sortSelectedNumPokers(temp);
        //     if(wCount == 0){
        //         //当没有王的时候,判断是否是三条与对子的组合
        //         if(this.isHasSantiao(temp.slice(0,3),false) && this.isHasDuizi(temp.slice(3),false)){
        //             return true;
        //         }
        //         if(this.isHasDuizi(temp.slice(0,2),false) && this.isHasSantiao(temp.slice(2),false)){
        //             return true;
        //         }
        //     }else if(wCount == 1){
        //         //当王的数量为1时,判断剩下的四张牌是否是两对或者有三条且不是铁支
        //         if((this.isHasLiangdui(temp.slice(1),false) || this.isHasSantiao(temp.slice(1),false)) && !this.isHasTiezhi(temp)){
        //             return true;
        //         }
        //     }else if(wCount == 2){
        //         //当王的数量为2时,判断剩下的三张牌是否是三条或者有对子
        //         if(this.isHasDuizi(temp.slice(2),false) || this.isHasSantiao(temp.slice(2),false)){
        //             return true;
        //         }
        //     }else{
        //         //当王的数量大于2时,则必有葫芦
        //         return true;
        //     }
        // }
        // return false;
    },

    //该牌组是否有铁支
    isHasTiezhi : function (pokers,isHaveW = true) {
        if(pokers.length < 4)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        if(wCount == 0){
            let arr4 = this.getArrForNumOrType(pokers,4,0);//获取数字出现四次的数组
            if(arr4.length > 0) return true;
        }else if(wCount == 1){
            let arr3 = this.getArrForNumOrType(pokers,3,0);//获取数字出现三次的数组
            if(arr3.length > 0) return true;
        }else if(wCount == 2){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数组
            if(arr2.length > 0) return true;
        }else if(wCount > 2){
            return true;
        }
        return false;

        // let ret = [];
        // if(pokers.length == 5){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,5);
        // }

        // for(let i = 0;i < ret.length;i++)
        // {
        //     let temp = ret[i];
        //     let wCount;
        //     if(isHaveW){
        //         wCount = this.getCountAndIndexArrForWang(temp);
        //     }else{
        //         wCount = 0;
        //     }
            
        //     this.sortSelectedNumPokers(temp);
        //     if(wCount == 0){
        //         if(this.isHasTwoOrOneNum(temp) && 
        //         (this.getPokerNumByPoker(temp[2]) == this.getPokerNumByPoker(temp[3])) && 
        //         (this.getPokerNumByPoker(temp[1]) == this.getPokerNumByPoker(temp[2]))){
        //             return true;
        //         }
        //     }else if(this.isHasTwoOrOneNum(temp.slice(wCount)) && !this.isHasLiangdui(temp.slice(wCount),false)){
        //         //除了王之外的牌,如果数字只有2种或1种,则是铁支
        //         return true;
        //     }
        // }
        // return false;
    },

    //该牌组是否有同花顺
    isHasTonghuashun:function(pokers,isHaveW = true){
        if(pokers.length < 5)
        {
            return false;
        }

        let ret = [];
        if(pokers.length == 5){
            ret.push(pokers);
        }else{
            ret = SssManager.combination(pokers,5);
        }

        for(let i = 0;i < ret.length;i++){
            let temp = ret[i];
            let wCount;
            if(isHaveW){
                wCount = this.getCountAndIndexArrForWang(temp);
            }else{
                wCount = 0;
            }
            
            this.sortSelectedNumPokers(temp);
            //除了王之外,花色一致
            if(!this.isHasOtherHuase(temp.slice(wCount))){
                if(this.isHasShunzi(temp)){
                    return true;
                }
            }
        }

        return false;
    },


    //该牌组是否有五霸
    isHasWuba : function (pokers,isHaveW = true) {
        if(pokers.length < 5)
        {
            return false;
        }

        let wCount;
        if(isHaveW){
            wCount = this.getCountAndIndexArrForWang(pokers);//获取该牌组王的个数
        } else{
            wCount = 0;
        }

        if(wCount == 0){
            let arr5 = this.getArrForNumOrType(pokers,5,0);//获取数字出现五次的数组
            if(arr5.length > 0) return true;
        }else if(wCount == 1){
            let arr4 = this.getArrForNumOrType(pokers,4,0);//获取数字出现四次的数组
            if(arr4.length > 0) return true;
        }else if(wCount == 2){
            let arr3 = this.getArrForNumOrType(pokers,3,0);//获取数字出现三次的数组
            if(arr3.length > 0) return true;
        }else if(wCount == 3){
            let arr2 = this.getArrForNumOrType(pokers,2,0);//获取数字出现两次的数组
            if(arr2.length > 0) return true;
        }else if(wCount > 3){
            return true;
        }
        return false;

        // let ret = [];
        // if(pokers.length == 5){
        //     ret.push(pokers);
        // }else{
        //     ret = SssManager.combination(pokers,5);
        // }
        // for(let i = 0;i < ret.length;i++){
        //     let temp = ret[i];
        //     let wCount;
        //     if(isHaveW){
        //         wCount = this.getCountAndIndexArrForWang(temp);
        //     }else{
        //         wCount = 0;
        //     }
            
        //     this.sortSelectedNumPokers(temp);
        //     //除了王之外,数字一致
        //     if(this.isHasOneNum(temp.slice(wCount))){
        //         return true;
        //     }
        // }

        // return false;
    },

    //获取对子
    getDuizi : function (pokers) {
        let arr = [];
        if(pokers.length < 2)
        {
            return arr;
        }

        let ret = SssManager.combination(pokers,2);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasDuizi(temp))
            {
                arr.push(temp);
            }
        }
        let tarr1 = [];
        let tarr2 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length < 2){
                tarr2.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2);
    },

    getLiangdui:function(pokers){
        let arr = [];
        if(pokers.length < 4)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,4);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasLiangdui(temp)){
                arr.push(temp);
            }
        }

        let tarr1 = [];
        let tarr2 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length < 4){
                tarr2.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2);
    },

    getSantiao:function(pokers){
        let arr = [];
        if(pokers.length < 3)
        {
            return arr;
        }

        let ret = SssManager.combination(pokers,3);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasSantiao(temp)){
                arr.push(temp);
            }
        }
        let tarr1 = [];
        let tarr2 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length < 3){
                tarr2.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2);
    },

    getShunzi:function(pokers){
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }

        let arr2 = this.getArrForNumOrType(pokers,2,0);
        let arr3 = this.getArrForNumOrType(pokers,3,0);

        let arr3Pokers = [];
        let arr2Pokers = [];

        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasShunzi(temp)){
                let is3 = false;
                let is2 = false;
                let numArr = this.getNumArrFromPokers(temp);
                for(let i = 0; i < arr3.length; ++i){
                    if(this.isNumsContainsNum(numArr,arr3[i])){
                        arr3Pokers.push(temp);
                        is3 = true;
                        break;
                    }
                }
                if(!is3){
                    for(let i = 0; i < arr2.length; ++i){
                        if(this.isNumsContainsNum(numArr,arr2[i])){
                            arr2Pokers.push(temp);
                            is2 = true;
                            break;
                        }
                    }
                    if(!is2){
                        arr.push(temp);
                    }
                }
            }
        }

        arr = arr.concat(arr2Pokers).concat(arr3Pokers);
        let tarr1 = [];
        let tarr2 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length < 5){
                tarr2.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2);
    },

    getTonghua:function(pokers){
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }

        let arr2 = this.getArrForNumOrType(pokers,2,0);
        let arr3 = this.getArrForNumOrType(pokers,3,0);

        cc.log('arr3=============',arr3);
        cc.log('arr2=============',arr2);

        let arr3Pokers = [];
        let arr2Pokers = [];
        

        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasTonghua(temp)){
                let is3 = false;
                let is2 = false;
                let numArr = this.getNumArrFromPokers(temp);
                for(let i = 0; i < arr3.length; ++i){
                    if(this.isNumsContainsNum(numArr,arr3[i])){
                        arr3Pokers.push(temp);
                        is3 = true;
                        break;
                    }
                }
                if(!is3){
                    for(let i = 0; i < arr2.length; ++i){
                        if(this.isNumsContainsNum(numArr,arr2[i])){
                            arr2Pokers.push(temp);
                            is2 = true;
                            break;
                        }
                    }
                    if(!is2){
                        arr.push(temp);
                    }
                }
            }
        }
        arr = arr.concat(arr2Pokers).concat(arr3Pokers);
        let tarr1 = [];
        let tarr2 = [];
        let tarr3 = [];
        let tarr4 = [];
        let tarr5 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length == 4){
                tarr2.push(arr[i]);
            }else if(numArr.length == 3){
                tarr3.push(arr[i]);
            }else if(numArr.length == 2){
                tarr4.push(arr[i]);
            }else if(numArr.length == 1){
                tarr5.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2).concat(tarr3).concat(tarr4).concat(tarr5);
    },

    getHulu:function(pokers){
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }

        let arr3 = this.getArrForNumOrType(pokers,3,0);

        let tempPoker;
        let tempArr = [];
        let isFirst = true;
        let poker3;
        let tempArrs = [];
        let temp;
        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            temp = ret[i];
            if(this.isHasHulu(temp)){
                poker3 = temp[2];
                let num = this.getPokerNumByPoker(poker3);
                num = (num == 1?14:num);
                if(tempArrs[num] == null){
                    tempArrs[num] = [];
                }
                tempArrs[num].push(temp);
            }
        }
        // tempArr.reverse();
        // arr = arr.concat(tempArr);
        tempArrs.push(tempArr);

        let tarr1 = [];
        let tarr2 = [];
        let tarr3 = [];
        let tarr4 = [];
        let tarr5 = [];
        let tarr6 = [];
        let tarr7 = [];
        let tarr8 = [];
        for(let i = 14; i > 0; --i){
            if(!tempArrs[i] || tempArrs[i].length == 0) continue;

            for(let j = tempArrs[i].length - 1; j > -1; j--){
                let numArr = this.getNumArrFromPokers(tempArrs[i][j]);
                cc.log(numArr);
                if(numArr.length == 4){
                    let flag = false;
                    let count = 0;
                    for(let p = 0; p < arr3.length; ++p){
                        if(this.isNumsContainsNum(numArr,arr3[p])){
                            count++;
                            if(count == 1){
                                flag = true;
                                tarr4.push(tempArrs[i][j]);
                            }else if(count == 2){
                                flag = true;
                                tarr5.push(tempArrs[i][j]);
                            }
                        }
                    }
                    if(!flag){
                        tarr3.push(tempArrs[i][j]);
                    }
                }else if(numArr.length < 4){
                    let flag = false;
                    let count = 0;
                    for(let p = 0; p < arr3.length; ++p){
                        if(this.isNumsContainsNum(numArr,arr3[p])){
                            count++;
                            if(count == 1){
                                flag = true;
                                tarr7.push(tempArrs[i][j]);
                            }else if(count == 2){
                                flag = true;
                                tarr8.push(tempArrs[i][j]);
                            }
                        }
                    }
                    if(!flag){
                        tarr6.push(tempArrs[i][j]);
                    }
                } else {
                    let flag = false;
                    let count = 0;
                    for(let p = 0; p < arr3.length; ++p){
                        if(this.isNumsContainsNum(numArr,arr3[p])){
                            count++;
                            if(count == 2){
                                flag = true;
                                tarr2.push(tempArrs[i][j]);
                            }
                        }
                    }
                    if(!flag){
                        tarr1.push(tempArrs[i][j]);
                    }
                }
            }
        }
        return tarr1.concat(tarr2).concat(tarr3).concat(tarr4).concat(tarr5).concat(tarr6).concat(tarr7).concat(tarr8);
    },

    getTiezhi:function(pokers){
        let arr = [];
        if(pokers.length < 4)
        {
            return arr;
        }

        let tempPoker;
        let tempArr = [];
        let tempArrs = [];
        let isFirst = true;
        let ret = SssManager.combination(pokers,4);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasTiezhi(temp)){
                arr.push(temp);
                // let poker4;
                // if(this.getPokerNumByPoker(temp[3]) != this.getPokerNumByPoker(temp[4])){
                //     poker4 = temp[3];
                // }else{
                //     poker4 = temp[4];
                // }
                // if(isFirst){
                //     tempPoker = poker4;
                //     tempArr.push(temp);
                //     isFirst = false;
                // }else {
                //     if(this.getPokerNumByPoker(poker4) == this.getPokerNumByPoker(tempPoker)){
                //         tempArr.push(temp);
                //     }else{
                //         tempArrs.push(tempArr);
                //         tempArr = [];
                //         tempPoker = poker4;
                //         tempArr.push(temp);
                //     }
                // }
            }
        }
        // tempArrs.push(tempArr);

        // for(let i = 0; i < tempArrs.length; ++i){
        //     for(let j = tempArrs[i].length - 1; j > -1; j--){
        //         arr.push(tempArrs[i][j]);
        //     }
        // }

        let tarr1 = [];
        let tarr2 = [];
        let tarr3 = [];
        let tarr4 = [];
        let tarr5 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length == 4){
                tarr2.push(arr[i]);
            }else if(numArr.length == 3){
                tarr3.push(arr[i]);
            }else if(numArr.length == 2){
                tarr4.push(arr[i]);
            }else if(numArr.length == 1){
                tarr5.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2).concat(tarr3).concat(tarr4).concat(tarr5);
    },

    getTonghuashun:function(pokers){
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }

        let arr2 = this.getArrForNumOrType(pokers,2,0);
        let arr3 = this.getArrForNumOrType(pokers,3,0);

        let arr3Pokers = [];
        let arr2Pokers = [];

        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasTonghuashun(temp)){
                let is3 = false;
                let is2 = false;
                let numArr = this.getNumArrFromPokers(temp);
                for(let i = 0; i < arr3.length; ++i){
                    if(this.isNumsContainsNum(numArr,arr3[i])){
                        arr3Pokers.push(temp);
                        is3 = true;
                        break;
                    }
                }
                if(!is3){
                    for(let i = 0; i < arr2.length; ++i){
                        if(this.isNumsContainsNum(numArr,arr2[i])){
                            arr2Pokers.push(temp);
                            is2 = true;
                            break;
                        }
                    }
                    if(!is2){
                        arr.push(temp);
                    }
                }
            }
        }

        arr = arr.concat(arr2Pokers).concat(arr3Pokers);
        let tarr1 = [];
        let tarr2 = [];
        let tarr3 = [];
        let tarr4 = [];
        let tarr5 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length == 4){
                tarr2.push(arr[i]);
            }else if(numArr.length == 3){
                tarr3.push(arr[i]);
            }else if(numArr.length == 2){
                tarr4.push(arr[i]);
            }else if(numArr.length == 1){
                tarr5.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2).concat(tarr3).concat(tarr4).concat(tarr5);
    },

    getWuba : function (pokers) {
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
            if(this.isHasWuba(temp)){
                arr.push(temp);
            }
        }
        let tarr1 = [];
        let tarr2 = [];
        let tarr3 = [];
        let tarr4 = [];
        let tarr5 = [];

        for(let i = 0; i < arr.length; ++i){
            let numArr = this.getNumArrFromPokers(arr[i]);
            if(numArr.length == 4){
                tarr2.push(arr[i]);
            }else if(numArr.length == 3){
                tarr3.push(arr[i]);
            }else if(numArr.length == 2){
                tarr4.push(arr[i]);
            }else if(numArr.length == 1){
                tarr5.push(arr[i]);
            }else{
                tarr1.push(arr[i]);
            }
        }
        return tarr1.concat(tarr2).concat(tarr3).concat(tarr4).concat(tarr5);
    },


    //将牌的数组,转化成牌数字的数组
    getNumArrFromPokers : function (pokers){
        let arr = [];
        for(let i = 0; i < pokers.length; i++){
            if(this.getPokerNumByPoker(pokers[i]) < 15){//排除王
                arr.push(this.getPokerNumByPoker(pokers[i]));
            }
        }
        return arr;
    },

    //将牌的数组,转化成牌类型的数组
    getTypeArrFromPokers : function (pokers){
        let arr = [];
        for(let i = 0; i < pokers.length; i++){
            if(this.getPokerNumByPoker(pokers[i]) < 15){//排除王
                arr.push(this.getPokerTypeByPoker(pokers[i]));
            }
        }
        return arr;
    },

    getArrForNums : function(arrs,count){
        if(count < 0){
            return [];
        }
        let arr = [];
        let numArr = [];
        count--;
        if(count == 0){
            //数组去重
            for(let i = 0; i < arrs.length; ++i){
                if(!~numArr.indexOf(arrs[i])){
                    numArr.push(arrs[i]);//如果不存在就添加
                }
            }
            return numArr;
        }
        for(let i = 0; i < arrs.length; ++i){
            if(!~numArr.indexOf(arrs[i])){
                numArr.push(arrs[i]);
            }else{
                arr.push(arrs[i]);//如果存在就添加
            }
        }
        return this.getArrForNums(arr,count);
    },

    //pokers里有2个或3个的数字有哪些,排除王
    getArrForNumOrType : function (pokers,count,type){
        let arrs;
        if(type == 0){
            arrs = this.getNumArrFromPokers(pokers);
        }else{
            arrs = this.getTypeArrFromPokers(pokers);
        }
        return this.getArrForNums(arrs,count);
    },
    

    /**
     * 判断两个乌龙的大小
     * @param poker1
     * @param poker2
     */
    judgeWulong:function(pokers1,pokers2,isShunzi = false) {
        let length1 = pokers1.length;
        let length2 = pokers2.length;
        let length = length1 < length2?length1:length2;

        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        
        
        for(let i = 0;i < length;i++)
        {
            let tempPoker1 = pokers1[i];
            let tempPoker2 = pokers2[i];
            if(this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2))
            {

            }else
            {
                if(isShunzi && SssManager.ruleInfo.emAtoFiveIsMin){
                    //如果顺子是 1 2 3 4 5则比较牌值大小
                    //这样实现 1 2 3 4 5 是最小的顺子
                    if(i == 0){
                        if(this.getPokerNumByPoker(pokers1[0]) == 1 && this.getPokerNumByPoker(pokers1[1]) == 5){
                            return this.getPokerNumByPoker(pokers1[0]) > this.getPokerNumByPoker(pokers2[0])
                        }
                
                        if(this.getPokerNumByPoker(pokers2[0]) == 1 && this.getPokerNumByPoker(pokers2[1]) == 5){
                            return this.getPokerNumByPoker(pokers1[0]) > this.getPokerNumByPoker(pokers2[0])
                        }
                    }
                }
                return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            }
        }

        for(let i = 0;i < length;i++)
        {
            let tempPoker1 = pokers1[i];
            let tempPoker2 = pokers2[i];
            if(this.getPokerWeightByPoker(tempPoker1) == this.getPokerWeightByPoker(tempPoker2))
            {

            }else
            {
                return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            }
        }
        //都相同，返回2
        return 2;
    },

    /**
     * 判断对子
     * @param pokers1
     * @param pokers2
     */
    judgeDuizi:function(pokers1,pokers2){
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有两张王则不会进入此判断
        if((wCount1 > 1) || (wCount2 > 1)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        //若有一张王,则王替换成最大的牌成对
        //若无王则不处理
        let type;
        let num;
        if(wCount1 == 1){
            type = 0;
            num = this.getPokerNumByPoker(pokers1[wCount1]);
            tempPokers1.push(this.getTempPoker(num,type));
        }

        if(wCount2 == 1){
            type = 0;
            num = this.getPokerNumByPoker(pokers2[wCount2]);
            tempPokers2.push(this.getTempPoker(num,type));
        }

        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);

        let tempPokerArr1 = [];
        let sanPokerArr1 = [];
        let tempPokerArr2 = [];
        let sanPokerArr2 = [];

        let prePoker;
        let flag = false;
        for(let i = 0;i < tempPokers1.length;i++)
        {
            prePoker = tempPokers1[i];
            for(let j = i+1;j <tempPokers1.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers1[j])){
                    if(tempPokerArr1.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr1.push(prePoker);
                        tempPokerArr1.push(tempPokers1[j]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }

        //获取散牌
        for(let i = 0;i < tempPokers1.length;i++)
        {
            if(!(tempPokers1[i] == tempPokerArr1[0] || tempPokers1[i] == tempPokerArr1[1]))
            {
                sanPokerArr1.push(tempPokers1[i]);
            }
        }

        flag = false;
        for(let i = 0;i < tempPokers2.length;i++)
        {
            prePoker = tempPokers2[i];
            for(let j = i+1;j <tempPokers2.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers2[j])){
                    if(tempPokerArr2.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr2.push(prePoker);
                        tempPokerArr2.push(tempPokers2[j]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }


        //获取散牌
        for(let i = 0;i < tempPokers2.length;i++)
        {
            if(!(tempPokers2[i] == tempPokerArr2[0] || tempPokers2[i] == tempPokerArr2[1]))
            {
                sanPokerArr2.push(tempPokers2[i]);
            }
        }

        if(this.getPokerNumByPoker(tempPokerArr1[0]) == this.getPokerNumByPoker(tempPokerArr2[0]))
        {
            let sanLength = sanPokerArr1.length < sanPokerArr2.length ? sanPokerArr1.length:sanPokerArr2.length;
            for(let i = 0;i < sanLength;i++)
            {
                if(this.getPokerNumByPoker(sanPokerArr1[i]) == this.getPokerNumByPoker(sanPokerArr2[i]))
                {

                }else
                {
                    //比较散牌
                    let result = this.getPokerWeightByPoker(sanPokerArr1[i]) > this.getPokerWeightByPoker(sanPokerArr2[i]);
                    this.clearTempPoker(tempPokers1,wCount1);
                    this.clearTempPoker(tempPokers2,wCount2);
                    return result;
                }
            }
            //都想相同，比较散排第一张
            let result = this.getPokerWeightByPoker(sanPokerArr1[0]) > this.getPokerWeightByPoker(sanPokerArr2[0]);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }else {
            let result = this.getPokerWeightByPoker(tempPokerArr1[0]) > this.getPokerWeightByPoker(tempPokerArr2[0]);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }
    },

    /**
     * 判断两对大小
     * @param pokers1
     * @param pokers2
     */
    judgeLiangdui:function(pokers1,pokers2)
    {

        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有两张王则不会进入此判断
        if((wCount1 > 1) || (wCount2 > 1)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        //若有一张王,则有一对,若最大的牌不是对子,则王替换成最大的牌成对,否则替换成第二大的牌成对
        //若无王则不处理
        let type;
        let num;
        if(wCount1 == 1){
            if(this.getPokerNumByPoker(pokers1[1]) == this.getPokerNumByPoker(pokers1[2])){
                type = 0;
                num = this.getPokerNumByPoker(pokers1[3]);
            }else{
                type = 0;
                num = this.getPokerNumByPoker(pokers1[1]);
            }
            tempPokers1.push(this.getTempPoker(num,type));
        }

        if(wCount2 == 1){
            if(this.getPokerNumByPoker(pokers2[1]) == this.getPokerNumByPoker(pokers2[2])){
                type = 0;
                num = this.getPokerNumByPoker(pokers2[3]);
            }else{
                type = 0;
                num = this.getPokerNumByPoker(pokers2[1]);
            }
            tempPokers2.push(this.getTempPoker(num,type));
        }

        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);
        

        let tempPoker1Arr = [];
        let sanPoker1;
        let tempPoker2Arr = [];
        let sanPoker2;

        let prePoker;
        for(let i = 0;i < tempPokers1.length;i++)
        {
            prePoker = tempPokers1[i];
            for(let j = i+1;j <tempPokers1.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers1[j])){
                    tempPoker1Arr.push(prePoker);
                    tempPoker1Arr.push(tempPokers1[j]);
                    break;
                }
            }
        }

        //获取散牌
        for(let i = 0;i < tempPokers1.length;i++)
        {
            let flag = false;
            for(let j = 0;j < tempPoker1Arr.length ;j++)
            {
                if(tempPokers1[i] == tempPoker1Arr[j])
                {
                    flag = true;
                    break;
                }
            }
            if(!flag)
            {
                sanPoker1 = tempPokers1[i];
                break;
            }
        }

        for(let i = 0;i < tempPokers2.length;i++)
        {
            prePoker = tempPokers2[i];
            for(let j = i+1;j <tempPokers2.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers2[j])){
                    tempPoker2Arr.push(prePoker);
                    tempPoker2Arr.push(tempPokers2[j]);
                    break;
                }
            }
        }

        //获取散牌
        for(let i = 0;i < tempPokers2.length;i++)
        {
            let flag = false;
            for(let j = 0;j < tempPoker2Arr.length ;j++)
            {
                if(tempPokers2[i] == tempPoker2Arr[j])
                {
                    flag = true;
                    break;
                }
            }
            if(!flag)
            {
                sanPoker2 = tempPokers2[i];
                break;
            }
        }

        if(this.getPokerNumByPoker(tempPoker1Arr[0]) == this.getPokerNumByPoker(tempPoker2Arr[0]))
        {
            if(this.getPokerNumByPoker(tempPoker1Arr[2]) == this.getPokerNumByPoker(tempPoker2Arr[2]))
            {
                //比散牌
                let result = this.getPokerWeightByPoker(sanPoker1) > this.getPokerWeightByPoker(sanPoker2);
                this.clearTempPoker(tempPokers1,wCount1);
                this.clearTempPoker(tempPokers2,wCount2);
                return result;
            }else
            {
                let result = this.getPokerWeightByPoker(tempPoker1Arr[2]) > this.getPokerWeightByPoker(tempPoker2Arr[2]);
                this.clearTempPoker(tempPokers1,wCount1);
                this.clearTempPoker(tempPokers2,wCount2);
                return result;
            }
        }else {
            let result = this.getPokerWeightByPoker(tempPoker1Arr[0]) > this.getPokerWeightByPoker(tempPoker2Arr[0]);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }
    },

    /**
     *
     *  判断三条大小
     * @param pokers1
     * @param pokers2
     */
    judgeSantiao:function(pokers1,pokers2)
    {

        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有三张王则不会进入此判断
        if((wCount1 > 2) || (wCount2 > 2)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        //若有一张王,则有一对,则王替换对子成为三条
        //若无王则不处理
        let type;
        let num;
        if(wCount1 == 1){
            for(let i = 0; i < tempPokers1.length; ++i){
                if(this.getPokerNumByPoker(tempPokers1[i]) == this.getPokerNumByPoker(tempPokers1[i+1])){
                    type = 0;
                    num = this.getPokerNumByPoker(tempPokers1[i]);
                    break;
                }
            }
            tempPokers1.push(this.getTempPoker(num,type));
        }else if(wCount1 == 2){
            type = 0;
            num = this.getPokerNumByPoker(tempPokers1[0]);
            for(let i =0; i < wCount1; ++i){
                tempPokers1.push(this.getTempPoker(num,type));
            }
        }

        if(wCount2 == 1){
            for(let i = 0; i < tempPokers2.length; ++i){
                if(this.getPokerNumByPoker(tempPokers2[i]) == this.getPokerNumByPoker(tempPokers2[i+1])){
                    type = 0;
                    num = this.getPokerNumByPoker(tempPokers2[i]);
                    break;
                }
            }
            tempPokers2.push(this.getTempPoker(num,type));
        }else if(wCount2 == 2){
            type = 0;
            num = this.getPokerNumByPoker(tempPokers2[0]);
            for(let i =0; i < wCount2; ++i){
                tempPokers1.push(this.getTempPoker(num,type));
            }
        }

        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);
        
        let tempPokerArr1 = [];
        let sanPokerArr1 = [];
        let tempPokerArr2 = [];
        let sanPokerArr2 = [];

        let prePoker;
        let flag = false;
        for(let i = 0;i < tempPokers1.length;i++)
        {
            prePoker = tempPokers1[i];
            for(let j = i+1;j <tempPokers1.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers1[j])){
                    if(tempPokerArr1.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr1.push(prePoker);
                        tempPokerArr1.push(tempPokers1[j]);
                        tempPokerArr1.push(tempPokers1[j+1]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }

        //获取散牌
        for(let i = 0;i < tempPokers1.length;i++)
        {
            if(!(tempPokers1[i] == tempPokerArr1[0] || tempPokers1[i] == tempPokerArr1[1]))
            {
                sanPokerArr1.push(tempPokers1[i]);
            }
        }

        flag = false;
        for(let i = 0;i < tempPokers2.length;i++)
        {
            prePoker = tempPokers2[i];
            for(let j = i+1;j <tempPokers2.length;j++)
            {
                if(this.getPokerNumByPoker(prePoker) == this.getPokerNumByPoker(tempPokers2[j])){
                    if(tempPokerArr2.length == 0)
                    {
                        //放入对子数组
                        tempPokerArr2.push(prePoker);
                        tempPokerArr2.push(tempPokers2[j]);
                        tempPokerArr2.push(tempPokers2[j+1]);
                    }
                    flag = true;
                    break;
                }
            }
            if(flag)
            {
                break;
            }
        }


        //获取散牌
        for(let i = 0;i < tempPokers2.length;i++)
        {
            if(!(tempPokers2[i] == tempPokerArr2[0] || tempPokers2[i] == tempPokerArr2[1]))
            {
                sanPokerArr2.push(tempPokers2[i]);
            }
        }

        if(this.getPokerNumByPoker(tempPokerArr1[0]) == this.getPokerNumByPoker(tempPokerArr2[0]))
        {
            let sanLength = sanPokerArr1.length < sanPokerArr2.length ? sanPokerArr1.length:sanPokerArr2.length;
            for(let i = 0;i < sanLength;i++)
            {
                if(this.getPokerNumByPoker(sanPokerArr1[i]) == this.getPokerNumByPoker(sanPokerArr2[i]))
                {

                }else
                {
                    //比较散牌
                    let result = this.getPokerWeightByPoker(sanPokerArr1[i]) > this.getPokerWeightByPoker(sanPokerArr2[i]);
                    this.clearTempPoker(tempPokers1,wCount1);
                    this.clearTempPoker(tempPokers2,wCount2);
                    return result;
                }
            }
            //都想相同，比较散排第一张
            let result = this.getPokerWeightByPoker(sanPokerArr1[0]) > this.getPokerWeightByPoker(sanPokerArr2[0]);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }else {
            let result = this.getPokerWeightByPoker(tempPokerArr1[0]) > this.getPokerWeightByPoker(tempPokerArr2[0]);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }
    },

    /**
     * 判断顺子大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeShunzi:function(pokers1,pokers2)
    {
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有三张王则不会进入此判断
        if((wCount1 > 2) || (wCount2 > 2)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        let type;
        let num;

        type = 0;
        if(wCount1 > 0){
            let numArr = [];
            for(let i = 0; i < tempPokers1.length; ++i){
                numArr.push(this.getPokerNumByPoker(tempPokers1[i]));
            }
            if(this.getPokerNumByPoker(tempPokers1[0]) == 1){
                if(this.getPokerNumByPoker(pokers1[4]) > 9){
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    for(let i = 2; i < 6; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }else{
                let min = this.getPokerNumByPoker(pokers1[4]);
                if(min < 11){
                    for(let i = min; i < min + 5; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    if(!this.isNumsContainsNum(numArr,1)){
                        num = 1;
                        tempPokers1.push(this.getTempPoker(num,type));
                    }
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }
        }

        if(wCount2 > 0){
            let numArr = [];
            for(let i = 0; i < tempPokers2.length; ++i){
                numArr.push(this.getPokerNumByPoker(tempPokers2[i]));
            }
            if(this.getPokerNumByPoker(tempPokers2[0]) == 1){
                if(this.getPokerNumByPoker(pokers2[4]) > 9){
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    for(let i = 2; i < 6; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }else{
                let min = this.getPokerNumByPoker(pokers2[4]);
                if(min < 10){
                    for(let i = min; i < min + 5; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    if(!this.isNumsContainsNum(numArr,1)){
                        num = 1;
                        tempPokers2.push(this.getTempPoker(num,type));
                    }
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }
        }
        
        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);

        let result =  this.judgeWulong(tempPokers1,tempPokers2,true);
        this.clearTempPoker(tempPokers1,wCount1);
        this.clearTempPoker(tempPokers2,wCount2);
        return result;
    },

    /**
     * 判断同花大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeTonghua:function(pokers1,pokers2)
    {
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有三张王则不会进入此判断
        if((wCount1 > 2) || (wCount2 > 2)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);
        let pokersWeight1 = 0;
        let pokersWeight2 = 0;

        let type;
        let num;
        
        // if(this.isHasSantiao(pokers1)){
        //     pokersWeight1 = 3
        // }else if(this.isHasLiangdui(pokers1)){
        //     pokersWeight1 = 2;
        // }else if(this.isHasDuizi(pokers1)){
        //     pokersWeight1 = 1;
        // }else{
        //     pokersWeight1 = 0;
        // }
        

        
        // if(this.isHasSantiao(pokers2)){
        //     pokersWeight2 = 3
        // }else if(this.isHasLiangdui(pokers2)){
        //     pokersWeight2 = 2;
        // }else if(this.isHasDuizi(pokers2)){
        //     pokersWeight2 = 1;
        // }else{
        //     pokersWeight2 = 0;
        // }
        

        // if(pokersWeight1 == pokersWeight2){
        //     if(pokersWeight1 == 0){
                num = 1;
                type = this.getPokerTypeByPoker(tempPokers1[0]);
                for(let i = 0; i < wCount1; ++i){
                    tempPokers1.push(this.getTempPoker(num,type));
                }
                type = this.getPokerTypeByPoker(tempPokers2[0]);
                for(let i = 0; i < wCount2; ++i){
                    tempPokers2.push(this.getTempPoker(num,type));
                }
                this.sortPokers(tempPokers1);
                this.sortPokers(tempPokers2);

                let result = this.judgeWulong(tempPokers1,tempPokers2);
                this.clearTempPoker(tempPokers1,wCount1);
                this.clearTempPoker(tempPokers2,wCount2);
                return result;
        //     }else{
        //         this.judgeWeightByPokersWeight(pokersWeight1,pokers1,pokers2);
        //     }
        // }else{
        //     return pokersWeight1 > pokersWeight2;
        // }
    },


    /**
     * 判断葫芦大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeHulu:function(pokers1,pokers2)
    {

        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有两张王则不会进入此判断
        if((wCount1 > 1) || (wCount2 > 1)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);
        

        let type;
        let num;

        if(wCount1 == 1){
            type = 0;
            num = this.getPokerNumByPoker(tempPokers1[0]);
            tempPokers1.push(this.getTempPoker(num,type));
        }

        if(wCount2 == 1){
            type = 0;
            num = this.getPokerNumByPoker(tempPokers2[0]);
            tempPokers2.push(this.getTempPoker(num,type));
        }


        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);

        let tempPoker1;
        let tempPoker2;
        let tempPoker11;
        let tempPoker22;
        if(this.getPokerNumByPoker(tempPokers1[0]) == this.getPokerNumByPoker(tempPokers1[1]) &&
            this.getPokerNumByPoker(tempPokers1[0]) == this.getPokerNumByPoker(tempPokers1[2]))
        {
            tempPoker1 = tempPokers1[0];
            tempPoker11 = tempPokers1[2];
        }else {
            tempPoker1 = tempPokers1[2];
            tempPoker11 = tempPokers1[0];
        }


        if(this.getPokerNumByPoker(tempPokers2[0]) == this.getPokerNumByPoker(tempPokers2[1]) &&
            this.getPokerNumByPoker(tempPokers2[0]) == this.getPokerNumByPoker(tempPokers2[2]))
        {
            tempPoker2 = tempPokers2[0];
            tempPoker22 = tempPokers2[2];
        }else {
            tempPoker2 = tempPokers2[2];
            tempPoker22 = tempPokers2[0];
        }

        if(this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2)){
            if(this.getPokerNumByPoker(tempPoker11) == this.getPokerNumByPoker(tempPoker22)){

            }else{
                let result = this.getPokerWeightByPoker(tempPoker11) > this.getPokerWeightByPoker(tempPoker22);
                this.clearTempPoker(tempPokers1,wCount1);
                this.clearTempPoker(tempPokers2,wCount2);
                return result;
            }
        }else{
            let result = this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }
        //都相同返回2
        this.clearTempPoker(tempPokers1,wCount1);
        this.clearTempPoker(tempPokers2,wCount2);
        return 2;
    },

    /**
     *  判断铁支大小
     * @param pokers1
     * @param pokers2
     */
    judgeTiezhi:function(pokers1,pokers2)
    {
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有四张王则不会进入此判断
        if((wCount1 > 3) || (wCount2 > 3)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        let type;
        let num;

        type = 0;
        if(wCount1 == 3){
            num = this.getPokerNumByPoker(tempPokers1[0]);
            for(let i = 0; i < 3; ++i){
                tempPokers1.push(this.getTempPoker(num,type));
            }
        }else{
            if(this.getPokerNumByPoker(tempPokers1[0]) == this.getPokerNumByPoker(tempPokers1[1])){
                num = this.getPokerNumByPoker(tempPokers1[0]);
                for(let i = 0; i < wCount1; ++i){
                    tempPokers1.push(this.getTempPoker(num,type));
                }
            }else{
                num = this.getPokerNumByPoker(tempPokers1[tempPokers1.length - 1]);
                for(let i = 0; i < wCount1; ++i){
                    tempPokers1.push(this.getTempPoker(num,type));
                }
            }
        }


        if(wCount2 == 3){
            num = this.getPokerNumByPoker(tempPokers2[0]);
            for(let i = 0; i < 3; ++i){
                tempPokers2.push(this.getTempPoker(num,type));
            }
        }else{
            if(this.getPokerNumByPoker(tempPokers2[0]) == this.getPokerNumByPoker(tempPokers2[1])){
                num = this.getPokerNumByPoker(tempPokers2[0]);
                for(let i = 0; i < wCount2; ++i){
                    tempPokers2.push(this.getTempPoker(num,type));
                }
            }else{
                num = this.getPokerNumByPoker(tempPokers2[tempPokers2.length - 1]);
                for(let i = 0; i < wCount2; ++i){
                    tempPokers2.push(this.getTempPoker(num,type));
                }
            }
        }

        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);

        let tempPoker1;
        let tempPoker2;
        let tempPoker11;
        let tempPoker22;
        if(this.getPokerNumByPoker(tempPokers1[0]) == this.getPokerNumByPoker(tempPokers1[1]) &&
            this.getPokerNumByPoker(tempPokers1[0]) == this.getPokerNumByPoker(tempPokers1[2]))
        {
            tempPoker1 = tempPokers1[0];
            tempPoker11 = tempPokers1[4];
        }else {
            tempPoker1 = tempPokers1[4];
            tempPoker11 = tempPokers1[0];
        }


        if(this.getPokerNumByPoker(tempPokers2[0]) == this.getPokerNumByPoker(tempPokers2[1]) &&
            this.getPokerNumByPoker(tempPokers2[0]) == this.getPokerNumByPoker(tempPokers2[2]))
        {
            tempPoker2 = tempPokers2[0];
            tempPoker22 = tempPokers2[4];
        }else {
            tempPoker2 = tempPokers2[4];
            tempPoker22 = tempPokers2[0];
        }

        if(this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2)){
            if(this.getPokerNumByPoker(tempPoker11) == this.getPokerNumByPoker(tempPoker22)){

            }else{
                let result = this.getPokerWeightByPoker(tempPoker11) > this.getPokerWeightByPoker(tempPoker22);
                this.clearTempPoker(tempPokers1,wCount1);
                this.clearTempPoker(tempPokers2,wCount2);
                return result;
            }
        }else{
            let result = this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            this.clearTempPoker(tempPokers1,wCount1);
            this.clearTempPoker(tempPokers2,wCount2);
            return result;
        }
        //都相同返回2
        this.clearTempPoker(tempPokers1,wCount1);
        this.clearTempPoker(tempPokers2,wCount2);
        return 2;
    },

    /**
     * 判断同花顺大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeTonghuashun:function(pokers1,pokers2)
    {
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //有四张王则不会进入此判断
        if((wCount1 > 3) || (wCount2 > 3)){
            return true;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);
        this.sortPokers(pokers1);
        this.sortPokers(pokers2);

        let type;
        let num;

        type = this.getPokerTypeByPoker(tempPokers1[0]);
        if(wCount1 > 0){
            let numArr = [];
            for(let i = 0; i < tempPokers1.length; ++i){
                numArr.push(this.getPokerNumByPoker(tempPokers1[i]));
            }
            if(this.getPokerNumByPoker(tempPokers1[0]) == 1){
                if(this.getPokerNumByPoker(pokers1[4]) > 9){
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    for(let i = 2; i < 6; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }else{
                let min = this.getPokerNumByPoker(pokers1[4]);
                if(min < 11){
                    for(let i = min; i < min + 5; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    if(!this.isNumsContainsNum(numArr,1)){
                        num = 1;
                        tempPokers1.push(this.getTempPoker(num,type));
                    }
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            num = i;
                            tempPokers1.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }
        }

        type = this.getPokerTypeByPoker(tempPokers2[0]);
        if(wCount2 > 0){
            let numArr = [];
            for(let i = 0; i < tempPokers2.length; ++i){
                numArr.push(this.getPokerNumByPoker(tempPokers2[i]));
            }
            if(this.getPokerNumByPoker(tempPokers2[0]) == 1){
                if(this.getPokerNumByPoker(pokers2[4]) > 9){
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            type = 0;
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    for(let i = 2; i < 6; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            type = 0;
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }else{
                let min = this.getPokerNumByPoker(pokers2[4]);
                if(min < 10){
                    for(let i = min; i < min + 5; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            type = 0;
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }else{
                    if(!this.isNumsContainsNum(numArr,1)){
                        type = 0;
                        num = 1;
                        tempPokers2.push(this.getTempPoker(num,type));
                    }
                    for(let i = 10; i < 14; ++i){
                        if(!this.isNumsContainsNum(numArr,i)){
                            type = 0;
                            num = i;
                            tempPokers2.push(this.getTempPoker(num,type));
                        }
                    }
                }
            }
        }
        
        this.sortPokers(tempPokers1);
        this.sortPokers(tempPokers2);

        let result = this.judgeWulong(tempPokers1,tempPokers2,true);
        this.clearTempPoker(tempPokers1,wCount1);
        this.clearTempPoker(tempPokers2,wCount2);
        return result;
    },

    /**
     * 判断五霸大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeWuba : function (pokers1,poker2) {
        let wCount1 = this.getCountAndIndexArrForWang(pokers1);
        let wCount2 = this.getCountAndIndexArrForWang(pokers2);

        //四张王的五霸是最大的牌型
        if(wCount1 == 4){
            return true;
        }

        if(wCount2 == 4){
            return false;
        }

        let tempPokers1 = pokers1.slice(wCount1);
        let tempPokers2 = pokers2.slice(wCount2);

        return this.getPokerWeightByPoker(tempPokers1[0]) > this.getPokerWeightByPoker(tempPokers2[0]);
    },


    /**
     *  判断两组相同牌型组合的大小
     * @param pokersWeight
     * @param pokers1
     * @param pokers2
     */
    judgeWeightByPokersWeight : function(pokersWeight,pokers1,pokers2)
    {
        let ret = false;
        if(pokersWeight == 0)
        {
            ret = this.judgeWulong(pokers1,pokers2)
        }else if(pokersWeight == 1)
        {
            ret = this.judgeDuizi(pokers1,pokers2)
        }else if(pokersWeight == 2)
        {
            ret = this.judgeLiangdui(pokers1,pokers2)
        }else if(pokersWeight == 3)
        {
            ret = this.judgeSantiao(pokers1,pokers2)
        }else if(pokersWeight == 4)
        {
            ret = this.judgeShunzi(pokers1,pokers2)
        }else if(pokersWeight == 5)
        {
            ret = this.judgeTonghua(pokers1,pokers2)
        }else if(pokersWeight == 6)
        {
            ret = this.judgeHulu(pokers1,pokers2)
        }else if(pokersWeight == 7)
        {
            ret = this.judgeTiezhi(pokers1,pokers2)
        }else if(pokersWeight == 8)
        {
            ret = this.judgeTonghuashun(pokers1,pokers2)
        }else if(pokersWeight == 9)
        {
            ret = this.judgeWuba(pokers1,pokers2)
        }
        return ret;
    },


    //创建一张临时牌来替换王
    getTempPoker : function (num,type) {
        let pokerPrefab = null;
        if(this.pokersPool.size() > 0){
            pokerPrefab = this.pokersPool.get();
        }else{
            pokerPrefab = cc.instantiate(SssManager.pokerPrefab);
        }
        let pokerController = pokerPrefab.getComponent("sss5Poker");
        let d = {data:{0:num,1:type}};
        pokerController.init(SssManager.pokersAtlas,d);
        pokerController.setTempPokerState();
        return pokerPrefab;
    },

    clearTempPoker : function (pokers,wCount) {
        if(wCount == 0){
            return;
        }
        let count = 0;
        for(let i = 0; i < pokers.length; ++i){
            if(pokers[i].isTempPoker){
                this.pokersPool.put(pokers[i]);
                count++;
                if(count == wCount){
                    break;
                }
            }
        }
    },

    sortSelectedTypePokers:function(pokers)
    {
        let self = this;
        pokers.sort(function(a,b){
            return self.getTypeWeight(b) - self.getTypeWeight(a) ;
        });
    },


    /**
     * 获取散牌
     * @param except
     */
    getSanpai:function(pokers,except)
    {
        let ret = [];
        let obj = {};
        // if(except!=null)
        for(let i = 0;i < pokers.length;i++)
        {
            let poker = pokers[i];
            if(except != null)
            {
                let flag = false;
                for(let j = 0;j < except.length;j++)
                {
                    if(this.getPokerNumByPoker(poker) == this.getPokerNumByPoker(except[j]) 
                    && this.getPokerTypeByPoker(except[j]) == this.getPokerTypeByPoker(poker))
                    {
                        flag = true;
                        break;
                    }
                }

                if(flag)
                {
                    continue;
                }
            }

            let num = this.getPokerNumByPoker(poker);
            if(obj["p_" + num] == null)
            {
                obj["p_" + num] = [];
            }
            obj["p_" + num].push(poker);
        }

        for(let num  = 2;num < 14 ;num++)
        {
            if(obj["p_" + num] != null && obj["p_" + num].length == 1)
            {
                ret.push(obj["p_" + num][0]);
            }
        }

        let num = 1;
        if(obj["p_" + num] != null && obj["p_" + num].length == 1)
        {
            ret.push(obj["p_" + num][0]);
        }

        return ret;
    },


    /**
     * 获取权重(A最大,黑红梅方)
     * @param type
     * @param num
     *
     */
    getPokerWeight:function(type,num)
    {
        let weight;
        if(num == 1)
        {
            weight = 1000000;
        }else if(num > 14)
        {
            weight = 2000000;
        }else{
            weight = num*1000;
        }

        weight += 4-type;
        return weight;
    },

    getTypeWeight:function(poker){
        let weight;
        let num = this.getPokerNumByPoker(poker);
        let type = this.getPokerTypeByPoker(poker);
        if(num == 1){
            num = 14;
            weight = (4-type)*1000;
        }else if(num > 14){
            weight = 2000000;
        }else{
            weight = (4-type)*1000;
        }

        weight += num;
        return weight;
    },

})