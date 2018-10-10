
const MJCoord = require('MJCoord');


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
        if(this.mjNum > 14){
            this.startPosY = bottomRight.y+150; //- this.mjH ;
        }else{
            this.startPosY = bottomRight.y+190; //- this.mjH ;
        }

      this.startPosX = bottomRight.x-170+30; // + this.w;

    },

    /**
     * 获取胡牌位置
     * @param index 第几张手牌
     */
    getHuCardPos : function (index,blockNum) {
        let blockIndex = blockNum;
        //let x = this.startPosX - blockIndex*3*8 -index*9 -blockIndex*3+20;
        let x = this.startPosX;
        let y = this.startPosY + blockIndex*this.scale*3*30 + index*38*this.scale + blockIndex*9 - 20;//this.startPosY +index*this.scale*32+ (blockIndex*3*30*this.scale + blockIndex*9);
        return {
            x : x,
            y : y
        }
    },

    /**
     *  最后一张牌的偏移距离
     */
    getLastCardDiff : function () {
        //return cc.p(-4.5,15);
        return cc.p(0,15);
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
      //let x = this.startPosX -index*this.scale*11+ (- blockIndex*3*8*this.scale- blockIndex*3);
      let x = this.startPosX;
      let y = this.startPosY +index*this.scale*36+ (blockIndex*3*30*this.scale + blockIndex*15)+20;
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
        //let x = this.startPosX - blockIndex*3*8*this.scale -index*9*this.scale + diffX-blockIndex*3;
      let x = this.startPosX ;
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
    getOutPos : function (index,num) {
        // let sx = 1020;
        //let sy = 263;
        let sx = 1020+30;
        let sy = 223;
        let diffX = 0;
        let diffY = 0;
        if((num &  0x02) == 0x02){ //三人
            diffY = -20;
            diffX = 40;
            if(index < 12){

            }else if(index>11 & index<22){
                diffX -= 56;
                diffY += 38;
                index -= 12;
            }else if(index>21 & index<30){
                diffX -= 2*56;
                diffY += 2*38;
                index -= 22;
            }else{
                diffX -= 3*56;
                diffY += 3*38;
                index -= 30;
            }
        }else{
            if(index>9&index<18){
                //diffX -= 66;
                diffX -= 56;
                diffY += 38;
                index -=10;
            }else if (index<10) {

            }else{
                diffX -= 2*56;
                diffY += 2*38;
                index -=18;
            }
        }

        //let x = sx + diffX+index*(-10.4);
        let x = sx + diffX;
        let y = sy+diffY+index *37;

        return {
            x : x,
            y : y
        }
    },

    getFlowerPos:function(index){
      let diffX = 1080+30+30;
      let diffY = 523;
      let x = diffX;
      let y = diffY-index*30.75;
      return{
        x:x,
        y:y
      };
    }

};

module.exports = RightLayout;
