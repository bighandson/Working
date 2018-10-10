
const MJCoord = require('gandengyanCoord');


const RightLayout = {
    init : function (count,scale) {
      this.mjNum = count;
      this.scale = scale;

      this.mjW = scale * MJCoord.RightInHandCard_W;
      this.mjH = scale * MJCoord.RightInHandCard_H;

      this.outCardW = MJCoord.RightInOutCard_W;
      this.outCardH = MJCoord.RightInOutCard_H;


      let height = cc.visibleRect.height;
      let bottomRight = cc.visibleRect.bottomRight;

      this.distToDiff = 50;
      this.distToEdge = 14;
      this.w = this.mjNum*this.distToEdge;
      this.h = this.mjH*this.mjNum + this.distToDiff;

      //this.startOutPosX = Right

      this.startPosX = bottomRight.x-140; // + this.w;
      this.startPosY = bottomRight.y+160; //- this.mjH ;
    },

    /**
     * 获取胡牌位置
     * @param index 第几张手牌
     */
    getHuCardPos : function (index,blockNum) {
        let blockIndex = blockNum;
        let x = this.startPosX - blockIndex*3*8 -index*9 -blockIndex*3+20;//this.startPosX -index*this.scale*10+ (- blockIndex*3*8*this.scale- blockIndex*3);
        let y = this.startPosY + blockIndex*3*30 + index*38*this.scale +blockIndex*9 - 20;//this.startPosY +index*this.scale*32+ (blockIndex*3*30*this.scale + blockIndex*9);
        return {
            x : x,
            y : y
        }
    },

    /**
     *  最后一张牌的偏移距离
     */
    getLastCardDiff : function () {
        return cc.p(-4.5,15);
    },

    getHandCardWidth : function () {
        return this.scale*36;
    },

    /**
     * 获取手牌
     * @param index
     * @param blockNum
     */
    getPosByIndex : function (index,blockNum) {
      let blockIndex = blockNum;
      let x = this.startPosX -index*this.scale*11+ (- blockIndex*3*8*this.scale- blockIndex*3);
      let y = this.startPosY +index*this.scale*36+ (blockIndex*3*30*this.scale + blockIndex*15)+20;
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
            diffY = 5;
            diffX = -1;
        }
        if(index===4){
            index = 2;
            diffY = 5;
            diffX = -1;
        }
        if(index===5){
            index = 0;
            diffY = 5;
            diffX = -1;
        }
        if(index===6){
            index = 1;
            diffY = 10;
            diffX = -1;
        }
      let x = this.startPosX - blockIndex*3*8*this.scale -index*9*this.scale + diffX-blockIndex*3;
      let y = this.startPosY + blockIndex*3*30*this.scale + index*30*this.scale +diffY+blockIndex*9;
      return {
          x : x,
          y : y
      }
    },

    /**
     * 获取出牌的位置
     * @param index
     */
    getOutPos : function (index) {
        let sx = 1020;
        let sy = 263;
        let diffX = 0;
        let diffY = 0;

        if(index>9&index<18){
            diffX -= 66;
            diffY += 38;
            index -=10;
        }else if (index<10) {

        }else{
            diffX -= 2*66;
            diffY += 2*38;
            index -=18;
        }
        let x = sx + diffX+index*(-10.4);
        let y = sy+diffY+index *37;

        return {
            x : x,
            y : y
        }
    },

    getFlowerPos:function(index){
      let diffX = 1020;
      let diffY = 603;
      let x = diffX+index*9;
      let y = diffY-index*30.75;
      return{
        x:x,
        y:y
      };
    }

};

module.exports = RightLayout;
