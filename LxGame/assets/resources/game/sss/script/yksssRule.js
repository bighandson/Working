

var SSSRule = require('SSSRule');

cc.Class({
    extends: SSSRule,

    properties: {
       
    },

    // use this for initialization
    onLoad: function () {
        this._super();
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
    sortSelectedTypePokers:function(pokers)
    {
        let self = this;
        pokers.sort(function(a,b){
            return self.getTypeWeight(b) - self.getTypeWeight(a) ;
        });
    },
    isHasWuTong:function(pokers)
    {   
        cc.log('WuTong')
         if(pokers.length < 5)
        {
            return false;
        }
        let ret = SssManager.combination(pokers,5);

         
       
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];
             
            if(this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) && 
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]) )           
            {
                return true;
            }
        }
        return false;
    },
    /**
     * 铁支
     * @param pokers
     * @returns {Array}
     */
    getWuTong:function(pokers)
    {
        let arr = [];
        if(pokers.length < 5)
        {
            return arr;
        }
        let ret = SssManager.combination(pokers,5);
        for(let i = 0;i < ret.length;i++)
        {
            let temp = ret[i];

            if((this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[1]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[2]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[3]) &&
                this.getPokerNumByPoker(temp[0]) == this.getPokerNumByPoker(temp[4]))
            )
            {
                arr.push(temp);
            }
        }
        cc.log(arr);
        return arr;
    },

    /**
     * 判断五同大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeWuTong:function(pokers1,pokers2)
    {

        return  this.getPokerNumByPoker(pokers1[0]) > this.getPokerNumByPoker(pokers2[0]);

    },

    /**
     * 判断同花大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeTonghua:function(pokers1,pokers2)
    {   
        
        // let tempPoker1 = pokers1[0];
        // let tempPoker2 = pokers2[0];
        // return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
        //
        let poker1type =  this.isHasLiangdui(pokers1) ? 2 : (this.isHasDuizi(pokers1)?1:0);
        let poker2type =  this.isHasLiangdui(pokers2) ? 2 : (this.isHasDuizi(pokers2)?1:0);
        if( poker1type > poker2type) return true;
        else if( poker1type < poker2type) return false;
        else 
        {
            if( poker1type > 0)
            {
                return poker1type == 1? this.judgeDuizi(pokers1,pokers2):this.judgeLiangdui(pokers1,pokers2)
            }
            else return this.judgeWulong(pokers1,pokers2);
        }
        
    },


    /**
     * 判断同花顺大小
     * @param pokers1
     * @param pokers2
     * @returns {*}
     */
    judgeTonghuashun:function(pokers1,pokers2)
    {
        let length1 = pokers1.length;
        let length2 = pokers2.length;
        let length = length1 < length2?length1:length2;
    
        for(let i = 0;i < length;i++)
        {
            let tempPoker1 = pokers1[i];
            let tempPoker2 = pokers2[i];
            if(this.getPokerNumByPoker(tempPoker1) == this.getPokerNumByPoker(tempPoker2))
            {
    
            }else
            {
                return this.getPokerWeightByPoker(tempPoker1) > this.getPokerWeightByPoker(tempPoker2);
            }
        }
        //都相同，比第一个
        let tempPoker1 = pokers1[0];
        let tempPoker2 = pokers2[0];
        
        return this.getPokerWeightByPoker(tempPoker1) >= this.getPokerWeightByPoker(tempPoker2) ;
    },
    


    /**
     *  判断两组相同牌型组合的大小
     * @param pokersWeight
     * @param pokers1
     * @param pokers2
     */
    judgeWeightByPokersWeight(pokersWeight,pokers1,pokers2)
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
            ret = this.judgeWuTong(pokers1,pokers2)
        }
        return ret;
    },
});
