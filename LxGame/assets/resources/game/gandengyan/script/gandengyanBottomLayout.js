
const MJCoord = require('gandengyanCoord');


const BottomLayout = {
    init : function (count,scale) {
        this.mjNum = count;
        this.scale = scale;

        this.mjW = scale * MJCoord.MineInHandCard_W - 2;
        this.mjH = scale * MJCoord.MineInHandCard_H;

        this.outCardW = 54;
        this.outCardH = MJCoord.MineInOutCard_H;


        let width = cc.visibleRect.width;
        let bottomLeft = cc.visibleRect.bottomLeft;

        this.distToDiff = 30;
        this.distToEdge = 2;
        this.w = this.mjW * this.mjNum + this.distToDiff;
        this.h = this.mjH;

        this.startOutPosX = bottomLeft;

        this.startPosX = 192;//bottomLeft.x + (width - this.w) / 2 + this.mjW / 2-200;
        this.startPosY = 48;//bottomLeft.y + this.h / 2 + this.distToEdge;
    },

    /**
     * 获取胡牌位置
     * @param index  第几张
     * @param blockNum
     * @param diffPos
     * @returns {{x: number, y: number}}
     */
    getHuCardPos : function (index,blockNum) {
        let startX = 140;
        let y = this.startPosY*this.scale+6-20;
        let x = 60+blockNum*5+blockNum*3 * this.outCardW*this.scale +  index*this.outCardW*this.scale-35
        // let x = startX + (0==blockNum?0:10)+blockNum*5+blockNum*3 * this.outCardW*this.scale + index*this.outCardW*this.scale-35;
        return {
            x : x,
            y : y
        }
    },

    /**
     *  最后一张牌的偏移距离
     */
    getLastCardDiff : function () {
        return cc.p(15,0);
    },

    /**
     * 获取手牌
     * @param index
     * @param blockNum
     */
    getPosByIndex : function (index,blockNum,diffPos={x:0,y:0}){
        return this.getPosByIndexEx(index,blockNum,diffPos)
        //let x = this.startPosX + blockNum * 160 + index * this.mjW+diffPos.x;
        let startX = 140;
        let startY = this.startPosY*this.scale;
        let x = startX +  (startX + (0==blockNum?0:10)+blockNum*5+blockNum*3 * this.outCardW*this.scale) + index*75*this.scale + diffPos.x - 217;
        let y = startY+6;//+diffPos.y;
        return {
            x : x,
            y : y
        }
    },
    getPosByIndexEx:function(index,blockNum,diffPos={x:0,y:0})
    {
        let startX = 140;
        let startY = this.startPosY*this.scale;
        let retainNum = 9 - blockNum;
        if( index > retainNum )
        {
            index -= retainNum;
            startY += 150;
        }
        
        let x = startX +  (startX + (0==blockNum?0:10)+blockNum*5+blockNum*3 * this.outCardW*this.scale) + index*75*this.scale + diffPos.x - 217;
        let y = startY+6;//+diffPos.y;
        return {
            x : x,
            y : y
        }
    },

    getHandCardWidth : function () {
        return 75 * this.scale;
    },

    /**
     * 获取吃碰杠牌的位置
     * @param blockIndex
     * @param index
     */
    getBlockPosByIndex : function (blockIndex,index) {
        let diffY = 0;
        let diffX = 0;
        if(index===3){
            index = 1;
            diffY = 25;
            diffX = 0;
        }
        if(index===4){
            index = 0;
            diffY = 25;
            diffX = 0;
        }
        if(index===5){
            index = 2;
            diffY = 25;
            diffX = 0;
        }
        if(index===6){
            index = 1;
            diffY = 50;
            diffX = 0;
        }
        let x = 90+blockIndex*5+blockIndex*3 * this.outCardW*this.scale +  index*this.outCardW*this.scale-50;
        let y = this.startPosY*this.scale+6+diffY-20;
        return {
            x : x,
            y : y
        }
    },

    /**
     * 获取出牌的位置
     * @param index
     */
    getOutPos : function (index,num) {
        num = num || 0;
        let diffX = 300-110+65-14;
        let diffY = 50+26+60+12;
        if((num &0x07)==0x01){     //二人麻将
            if(index<17){
                diffX -= 4*this.outCardW;;
            }else if(index>16&index<34){
                diffX -= 4*this.outCardW;;
                diffY += this.outCardH-25;
                index -=17;
            }else if(index>33&index<51){
                diffX -= 4*this.outCardW;
                diffY += 2*this.outCardH-50;
                index -= 34;
            }else{
                diffX -= 4*this.outCardW;
                diffY += 3*this.outCardH-75;
                index -= 51;
            }
        }else{      //四人麻将
            if(index>23){
                index -= 23;
            }

            if(index>9&index<18){
                diffX += this.outCardW;
                diffY += this.outCardH-25;
                index -=10;
            }else if (index<10) {

            }else{
                diffX += 2*this.outCardW;
                diffY += 2*this.outCardH-50;
                index -=18;
            }
        }
        let x = this.startPosX + diffX+index * this.outCardW;
        let y = this.startPosY + diffY;

        return {
            x : x,
            y : y
        }
    },

    getFlowerPos:function(index){
        let diffX = 1055;
        let diffY = 115+20;
        let x = diffX-index*54;
        let y = diffY;
        return{
            x:x,
            y:y
        };
    }

};

module.exports = BottomLayout;
