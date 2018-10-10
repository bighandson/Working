
const MJCoord = require('gandengyanCoord');


const TopLayout = {
    init : function (count,scale) {
      this.mjNum = count;
      this.scale = scale;

      this.mjW = scale * MJCoord.TopInHandCard_W - 2;
      this.mjH = scale * MJCoord.TopInHandCard_H;

      this.outCardW = MJCoord.TopInOutCard_W;
      this.outCardH = MJCoord.TopInOutCard_H;


      let width = cc.visibleRect.width;
      let topRight = cc.visibleRect.topRight;

      this.distToDiff = 30;
      this.distToEdge = 2;
      this.w = this.mjW * this.mjNum + this.distToDiff;
      this.h = this.mjH;

      this.startOutPosX = topRight;

      this.startPosX = topRight.x - (width - this.w) / 2 + this.mjW-70;
      this.startPosY = topRight.y - this.h / 2 - this.distToEdge-1;
    },

    /**
     * 获取胡牌位置
     * @param index 第几张手牌
     */
    getHuCardPos : function (index,blockNum) {
        let blockIndex = blockNum;
        let x = this.startPosX + (0- blockIndex*3*35*this.scale - blockIndex*3)  - 0.8 * index * 54 * this.scale;
        let y = this.startPosY;
        //console.log(index,blockNum);
        return {
            x : x,
            y : y
        }
    },

    /**
     *  最后一张牌的偏移距离
     */
    getLastCardDiff : function () {
        return cc.p(-20,0);
    },


    /**
     * 获取手牌
     * @param index
     * @param blockNum
     */
    getPosByIndex : function (index,blockNum) {
      let blockIndex = blockNum;
      let x = this.startPosX + (0- blockIndex*3*35*this.scale - blockIndex*3)  - index * 35.75-20;
      let y = this.startPosY;
      //console.log(index,blockNum);
      return {
          x : x,
          y : y
      }
    },
    getPosByIndexEx:function(index,blockNum)
    {
      let blockIndex = blockNum;
      let retainNum = 9 - blockNum;
      let startX = this.startPosX;
      let startY = this.startPosY;
      if( index > retainNum )
      {//换排
          index -= retainNum;
          startY = this.startPosY;
          startX += 50; 
      }
      let x = startX;
      let y = startY +index*this.scale*36+ (blockIndex*3*30*this.scale + blockIndex*15)+20;
      return {
          x : x,
          y : y
      }
    },
    getHandCardWidth : function () {
        return this.scale * 35;
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
            diffY += 10;
            diffX += 0;
        }
        if(index===4){
            index = 0;
            diffY += 10;
            diffX += 0;
        }
        if(index===5){
            index = 2;
            diffY += 10;
            diffX += 0;
        }
        if(index===6){
            index = 1;
            diffY += 20;
            diffX += 0;
        }
        let x = this.startPosX - blockIndex*3*35*this.scale - blockIndex*3  - index*35*this.scale;
        let y = this.startPosY + diffY;
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
        let sx = 893-21.5;
        let sy = 625
        let diffX = 0;
        let diffY = 0;

        if((num &0x07)==0x01){   //二人麻将
            if(index < 17){
                diffX +=86;
            }else if(index>16&index<34){
                diffY -= 45;
                diffX +=86;
                index -=17;
            }else if(index>33&index<51){
                index -=34;
                diffX +=86;
                diffY -= 2*45;
            }else{
                index -=51;
                diffX +=86;
                diffY -= 3*45;
            }
        }else{      //四人麻将
            if(index>9&index<18){
                diffY -= 45;
                diffX -=43;
                index -=10;

            }else if (index<10) {

            }else{
                index -=18;
                diffX -=2*43;
                diffY -= 2*45;
            }
        }

        let x = sx +diffX- index*43;
        let y = sy + diffY;
        return {
            x : x,
            y : y
        }
    },

    getFlowerPos:function(index){
      let diffX = 425;
      let diffY = 670;
      let x = diffX+index*36;
      return{
        x:x,
        y:diffY
      };
    }

};

module.exports = TopLayout;
