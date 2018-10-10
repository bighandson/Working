
const MJCoord = require('MJCoord');


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

      this.startPosX = topRight.x - (width - this.w) / 2 + this.mjW-10+20;//70
      this.startPosY = topRight.y - this.h / 2 - this.distToEdge-16;//1
    },

    /**
     * 获取胡牌位置
     * @param index 第几张手牌
     */
    getHuCardPos : function (index,blockNum) {
        let blockIndex = blockNum;
        let x = this.startPosX + (0- blockIndex*3*50*this.scale - blockIndex*3)  - 0.8 * index * 54 * this.scale;
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
      //let x = this.startPosX + (0- blockIndex*3*35*this.scale - blockIndex*3)  - index * 35.75-20;
      let x = this.startPosX + (0- blockIndex*3*50*this.scale - blockIndex*3)  - index * 48-20;
      let y = this.startPosY;
      //console.log(index,blockNum);
      return {
          x : x,
          y : y
      }
    },

    getHandCardWidth : function () {
        return this.scale * 35;//35
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
        //let x = this.startPosX - blockIndex*3*35*this.scale - blockIndex*3  - index*35*this.scale;
        let x = this.startPosX - blockIndex*3*50*this.scale - blockIndex*8  - index*50*this.scale;
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
    getOutPos : function (index,num,paiNum) {
        num = num || 0;
	      paiNum = paiNum || 136
        //let sx = 893-21.5;
        //let sy = 625
        let sx = 893-45+20;
        let sy = 660
        let diffX = 54;//0
        let diffY = -30;

        if(num &0x01== 0x01){   //二人麻将
          if(paiNum >100){
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
          }else{
	          if(index>9&index<18){
		          //diffY -= 45;
		          //diffX -=43;
		          diffY -= 54;
		          diffX -=49;
		          index -=10;
		
	          }else if (index<10) {
		
	          }else{
		          index -=18;
		          diffX -=2*49;
		          diffY -= 2*54;
	          }
          }
         
        }else{      //四人麻将
          if(index>9&index<18){
              //diffY -= 45;
              //diffX -=43;
              diffY -= 54;
              diffX -=49;
              index -=10;

          }else if (index<10) {

          }else{
              index -=18;
              diffX -=2*49;
              diffY -= 2*54;
          }
        }

        let x = sx +diffX- index*48;//43
        let y = sy + diffY;
        return {
            x : x,
            y : y
        }
    },

    getFlowerPos:function(index){
      let diffX = 280;
      let diffY = 630;
      let x = diffX+index*36+20;
      return{
        x:x,
        y:diffY
      };
    }

};

module.exports = TopLayout;
