

const BottomLayout = require('gandengyanBottomLayout');
const RightLayout  = require('gandengyanRightLayout');
const TopLayout    = require('gandengyanTopLayout');
const LeftLayout   = require('gandengyanLeftLayout');
const MJCardResource = require('gandengyanCardResource');
const Command = require('MJCommand');
const RCMD_ACTION = Command.OPT_CODE;
const CMD_ACTION = Command.CMD_ACTION;
const EATFLAG = Command.EATFLAG;
const MJType = require('MJType');

const Layout = [
    BottomLayout,
    RightLayout,
    TopLayout,
    LeftLayout,
    LeftLayout
];

cc.Class({
    extends: cc.Component,

    properties: {

    },

    init : function (chair,count,scale,rule) {
        this._chair = chair;
        this.scale = scale;
        this._layout = Layout[chair];
        this._layout.init(count,scale);
        if(3 == this._chair||0 == this._chair){
          this._hands = this.createMJArray(20-this._chair);
        }else{
          this._hands = this.createMJArray();
        }
        this._handZOrder = 100;

        this._outs = this.createMJArray();
        this._outCardZOrder = 100;

        this._blocks = this.createMJArray();
        this._blockOrder = 100;

        if(0 == this._chair){
          this._flowers = this.createMJArray(11);
        }else{
          this._flowers = this.createMJArray();
        }

        // 保存吃碰杠的信息
        this.blockPais = [];
        this.rule = rule;
    },

    clearForGame : function () {
        this._hands.clearCards();
        this._outs.clearCards();
        this._blocks.clearCards();
        this._flowers.clearCards();
        this.blockPais = [];
        this._handZOrder = 100;
        this._outCardZOrder = 100;
        this._blockOrder = 100;
    },
    
    /**
     * 创建手牌
     * @param value
     */
    _createOneHand : function (value,isGet) {
        isGet = isGet || false;
        let diffPos;
        if(isGet){
            diffPos = this._layout.getLastCardDiff();
        }else {
            diffPos = cc.p(0,0);
        }
        let index = this._getHandsCardLen();
        let frame = MJCardResource.getInHandImageByChair(this._chair,value);
        let mjcard = this._hands.getOrCreateCard();
        mjcard.setCard(value,frame);
        mjcard.setCardScale(this.scale);
        let pos = this._layout.getPosByIndex(index,this._getBlocksLen());
        mjcard.setCardOriginPos(pos.x+diffPos.x,pos.y+diffPos.y);
        mjcard.setLayer(this._handZOrder);
        if(this._chair == 1){  // 左边
            //mjcard.setLayer(100 - index);
            this._handZOrder--;
        }else {
            this._handZOrder++;
        }

        if(this.rule.isBD(value)){
            mjcard.setBDTag(this._chair,true);
        }

        return mjcard;
    },

    _createOneHandBlock : function (value,isGet) {
        isGet = isGet || false;
        let diffPos;
        if(isGet){
            diffPos = this._layout.getLastCardDiff();
        }else {
            diffPos = cc.p(0,0);
        }
        let mjcard = this._hands.getOrCreateCard();
        let frame;
        if(MJType.invalidPai(value)){
            frame = MJCardResource.getExtraImageByChair(this._chair,value);
        }else{
            frame = MJCardResource.getAnFrame(this._chair);
        }
        let scale = [1,1,0.8,1];
        mjcard.setCardScale(scale[this._chair] * this.scale);
        mjcard.setCard(value,frame);
        let index = this._getHandsCardLen();
        let pos = this._layout.getHuCardPos(index,this._getBlocksLen());
        mjcard.setCardOriginPos(pos.x+diffPos.x,pos.y+diffPos.y);
        mjcard.setLayer(this._handZOrder);
        if(this._chair == 1){  // 左边
            //mjcard.setLayer(100 - index);
            this._handZOrder--;
        }else {
            this._handZOrder++;
        }

        if(this.rule.isBD(value)){
            mjcard.setBDTag(this._chair,false);
        }

        return mjcard;
    },

    _createOneBackHandBlock : function (value,isGet) {
        isGet = isGet || false;
        let diffPos;
        if(isGet){
            diffPos = this._layout.getLastCardDiff();
        }else {
            diffPos = cc.p(0,0);
        }
        let mjcard = this._hands.getOrCreateCard();
        let frame = MJCardResource.getAnFrame(this._chair);
        let scale = [1,1,0.8,1];
        mjcard.setCardScale(scale[this._chair] * this.scale);
        mjcard.setCard(value,frame);
        let index = this._getHandsCardLen();
        let pos = this._layout.getHuCardPos(index,this._getBlocksLen());
        mjcard.setCardOriginPos(pos.x+diffPos.x,pos.y+diffPos.y);
        mjcard.setLayer(this._handZOrder);
        if(this._chair == 1){  // 左边
            //mjcard.setLayer(100 - index);
            this._handZOrder--;
        }else {
            this._handZOrder++;
        }

        return mjcard;
    },
    /**
     * 恢复吃碰扛的数据
     * @param value  吃碰扛最小的牌值
     * @param flag   吃碰杠标志
     * @param dir    吃碰杠方位
     */
    dealActData : function (value,flag,dir) {
        let l1 = this.rule.toBlockValue(value);
        let l2 = this.rule.toBlockValue(value + 1);
        let l3 = this.rule.toBlockValue(value + 2);
        let blockNum = this._getBlocksLen();
        let pais = [l1,l2,l3];

        switch (flag){
            case 1:
            case 2:
            case 3:
                for(let i = 0; i < 3; i++){
                    let card = this._createOneBlockCard(pais[i],blockNum,i,false);
                    if((i+1) == flag){
                        card.setArrowTag(this._chair,dir);
                    }
                }

                break;
            case 4:
            case 5:
                let len = 3 + (flag - 4);
                for(let i = 0; i < len; i++){
                    let card = this._createOneBlockCard(l1,blockNum,i,false);
                    if((2 * len - 5) == i){
                        card.setArrowTag(this._chair,dir);
                    }
                }

                break;
            case 6:
                for(let i = 0; i < 4; i++){
                    let card = this._createOneBlockCard(l1,blockNum,i,i!=3);
                    if(i == 3){
                        card.setArrowTag(this._chair,dir);
                    }
                }
                break;
        }
        this.blockPais.push({
            blockFlag : flag,
            values : pais,
            dir : dir,
        });
    },
    dealActDataEX : function (p1,p2,p3,p4,p5,p6,p7,flag,dir) {
        let l1 = this.rule.toBlockValue(p1);
        let l2 = this.rule.toBlockValue(p2);
        let l3 = this.rule.toBlockValue(p3);
        let l4 = this.rule.toBlockValue(p4);
        let l5 = this.rule.toBlockValue(p5);
        let l6 = this.rule.toBlockValue(p6);
        let l7 = this.rule.toBlockValue(p7);
        let blockNum = this._getBlocksLen();
        let pais = [l1,l2,l3];
        let pais2 = [l1,l2,l3,l4,l5,l6,l7];
        if (l7 == 0){
            pais2 = [l1,l2,l3,l4,l5,l6];
        }
        if (l6 == 0){
            pais2 = [l1,l2,l3,l4,l5];
        }
        if (l5 == 0){
            pais2 = [l1,l2,l3,l4];
        }
        switch (flag){
            case 1:
            case 2:
            case 3:
                for(let i = 0; i < 3; i++){
                    let card = this._createOneBlockCard(pais[i],blockNum,i,false);
                    if((i+1) == flag){
                        card.setArrowTag(this._chair,dir);
                    }
                }

                break;
            case 4:
                let len = 3 + (flag - 4);
                for(let i = 0; i < len; i++){
                    let card = this._createOneBlockCard(pais[i],blockNum,i,false);
                    if((2 * len - 5) == i){
                        card.setArrowTag(this._chair,dir);
                    }
                }

                break;
            case 5:
            case 6:
                for(let i = 0; i < pais2.length; i++){
                    let card = this._createOneBlockCard(pais2[i],blockNum,i,false);
                    if(i == pais2.length-1){
                        card.setArrowTag(this._chair,dir);
                    }
                }
                break;
        }if (flag<=4){
            this.blockPais.push({
                blockFlag : flag,
                values : pais,
                dir : dir,
            });
        }else {
            this.blockPais.push({
                blockFlag : flag,
                values : pais2,
                dir : dir,
            });
        }

    },

    /**
     * 绘制手中的牌
     */
    createHandCards : function (count,pais) {
        this._hands.clearCards();
        pais = pais || [];
        while (pais.length < count){
            pais.push(255);
        }

        for(var i = 0; i < count; i++){
            this.onCmdGetPai(pais[i]);
        }

        this.freshHandCardsPos(true);
    },
    //繪製手中牌  血流
    createMoHandCards : function (count,pais) {
        this._hands.clearCards();
        pais = pais || [];
        while (pais.length < count){
            pais.push(255);
        }

        for(var i = 0; i < count; i++){

            this.onCmdGetPai(pais[i]);
        }
        this.freshMoHandCardsPos();
    },

    /**
     *
     * @param pais
     */
    addFlowers : function (pais) {
        for(let i = 0; i < pais.length; i++){
            var pai = pais[i];
            this._createOneFlower(pai);
        }
    },
    addFlowersEX : function (pais) {
        for(let i = 0; i < pais.length; i++){
            var pai = pais[i];
            this._createOneFlowerEX(pai);
        }
    },

    onCmdOutPai:function(value,index){
        let mjcards = this._hands.getMJCards();
        if(mjcards.length % 3 != 2 || this._chair == 0){   // 自己的不处理
            return;
        }
        var valueIndex = this.findCardValueIndex(value);
        if(valueIndex >= 0){
            index = valueIndex;
        }else{
            index = 0;
        }

        this.dealLocalOutCard(mjcards[index],value,index);
    },
    
    onCmdDistribute : function (value) {
        if(this._chair == 0){
            this._createOneHand(value);
        }else {
            if(MJType.invalidPai(value)){
                this._createOneHandBlock(value);
            }else {
                this._createOneHand(value);
            }
        }
    },
    
    onCmdGetPai : function (value) {
        //this._createOneHand(value,true);
        var mjcard;
        if(this._chair == 0){
            mjcard = this._createOneHand(value,true);
        }else {
            if(MJType.invalidPai(value)){
                mjcard = this._createOneHandBlock(value,true);
            }else {
                mjcard = this._createOneHand(value,true);
            }
        }

        return mjcard;
    },
    onCmdSupply : function (value,fpai,masterid) {
        cc.log('onCmdSupply : ',value,fpai);
        cc.log(masterid);
        this.scheduleOnce(function () {
            let pai = MJType.invalidPai(value) ? fpai : 255;
            this._createOneFlower(fpai,masterid);
            this._hands.removeCardByValue(pai);           // 删除花牌
            this.onCmdGetPai(value);
            this.freshHandCardsPos(true);
        },0.6)
    },
    onCmdSupplyEX : function (value,fpai,masterid) {
        cc.log('onCmdSupply : ',value,fpai);
        cc.log(masterid);
        this.scheduleOnce(function () {
            let pai = MJType.invalidPai(value) ? fpai : 255;
            this._createOneFlowerEX(fpai,masterid);
            this._hands.removeCardByValue(pai);           // 删除花牌
            this.onCmdGetPai(value);
            this.freshHandCardsPos(true);
        },0.6)
    },
    
    onCmdHu : function (pais) {
        this.reDrawBlockHandCards(pais);
    },

    onXueliuHu : function (pais,isback) {

        this._hands.clearCards();
        if(pais.length%3==2){
            for(let i = 0; i < pais.length-1; i++){
                let needDiffFlag = (i == pais.length-1 && (i+1) % 3 == 2);
                if(isback){
                    this._createOneBackHandBlock(pais[i],needDiffFlag);
                }else{
                    this._createOneHandBlock(pais[i],needDiffFlag);
                }
            }
        }else{
            for(let i = 0; i < pais.length; i++){
                let needDiffFlag = (i == pais.length-1 && (i+1) % 3 == 2);
                if(isback){
                    this._createOneBackHandBlock(pais[i],needDiffFlag);
                }else{
                    this._createOneHandBlock(pais[i],needDiffFlag);
                }
            }
        }

    },

    // 出牌 服务器下发出牌
    dealLocalOutCard : function (card,value,index) {
        this._createOneOutCard(value);
        this.playOutCardAnim(card);
        this.playOutCardSwitchAnim(card,index);
    },

    playOutCardAnim : function (card) {
        if(this.lastOutCard && card){
            let dstPos = this.lastOutCard.getCardPos();
            let pos = card.getCardPos();

            this.lastOutCard.node.setPosition(pos);
            this.lastOutCard.node.setLocalZOrder(300);
            let animTime = 0.1;
            let moveAnim = cc.moveTo(animTime,dstPos);
            this.lastOutCard.node.runAction(cc.sequence(moveAnim,cc.callFunc(function () {
                this.lastOutCard.setOriginLayer();
                this.rule.showOutTips(this._chair,this.lastOutCard);
            },this)));
        }else{
            cc.log('card : ', !!card);
        }
    },
    
    // 出牌后，手牌排序
    playOutCardSwitchAnim : function (card,index) {
        let mjcards = this._hands.getMJCards();
        card.setActive(false);
       // if(mjcards.length-1 == index || this._chair != 0)
        {
            this._hands.removeCardToStackByIndex(index);
            this.freshHandCardsPos();
            return;
        }

        // 绘制自己的手牌动画
        /**
        let lastCard = mjcards[mjcards.length-1];

        let lastIndex = this.getSortIndexByWeight(mjcards,card);
        let width = this._layout.getHandCardWidth();
        let self = this;
        let animTime = 0.2;
        if(lastIndex == mjcards.length){ // 最大的牌
            for(let i = index; i < mjcards.length-2; i++){
                let moveCard = mjcards[i];
                moveCard.node.runAction(cc.moveBy(animTime,-width,0));
            }

            lastCard.node.runAction(cc.sequence(cc.moveBy(animTime,-width,0),cc.callFunc(function () {
                self.removeHandCardIndex(index);
                self.freshHandCardsPos(true);
            },this)));
        }else{ //
            let srcPos = mjcards[lastIndex].getCardOriginPos();
            let dstPos = lastCard.getCardOriginPos();

            let flag = lastIndex - index;
            if(flag != 0){
                flag = flag / Math.abs(flag);
                let start = index;
                let end = flag < 0 ? lastIndex + flag : lastIndex;
                for(let i = start; i != end; i += flag){
                    let moveCard = mjcards[i];
                    moveCard.node.runAction(cc.moveBy(animTime,-flag * width,0))
                }
            }

            let anim1 = cc.moveTo(animTime,(srcPos.x + dstPos.x) / 2, srcPos.y + 100);
            let anim2 = cc.moveTo(animTime,srcPos.x,srcPos.y);
            lastCard.node.runAction(cc.sequence(anim1,anim2,cc.callFunc(function () {
                self.removeHandCardIndex(index);
                self.freshHandCardsPos(true);
            },this)));
        }
         */
    },

    dealHitCardsEX :  function (value,opcode,dA,dB,dir) {
        cc.log('dealHitCardsEX:  ',dA,dB)
        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_HIT,
            values : [value,dA,dB],
            dir : dir,
        });
        for(let i = 0; i < 2; i++){
            let card = this._createOneBlockCard(value,blockNum,i,false);
            if(i == 1){
                card.setArrowTag(this._chair,dir);
            }
        }
        let card = this._createOneBlockCard(dB,blockNum,2,false);
        // 找到真实值
        var ddA = this.findCardValueIndex(dA);
        if(ddA >= 0) {
            dA = ddA;
            if (dA == dB) {
                dB = this.findCardValueIndex(dB, ddA);
            }
            else {
              dB = this.findCardValueIndex(dB);
            }
        }else{
            dA = 1;
            dB = 0;
        }

        this.removeHandCardIndex(dA);
        this.removeHandCardIndex(dB);
        this.freshHandCardsPos();
    },
    /**
     * 碰
     * @param value
     * @param opcode
     * @param dA
     * @param dB
     * @param dir
     */
    dealHitCards : function (value,opcode,dA,dB,dir) {
        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_HIT,
            values : [value],
            dir : dir,
        });

        // 找到真实值
        var ddA = this.findCardValueIndex(value);
        if(ddA >= 0){
            dA = ddA;
            dB = this.findCardValueIndex(value,ddA);
        }

        for(let i = 0; i < 3; i++){
            let card = this._createOneBlockCard(value,blockNum,i,false);
            if(i == 1){
                card.setArrowTag(this._chair,dir);
            }
        }

        let minD = Math.min(dA,dB);
        let maxD = Math.max(dA,dB);

        this.removeHandCardIndex(maxD);
        this.removeHandCardIndex(minD);
        this.freshHandCardsPos();
    },

    /**
     * 吃
     * @param value
     * @param flag
     * @param paiA
     * @param paiB
     * @param dA
     * @param dB
     * @param dir
     */
    dealEatCards : function (value,flag,paiA,paiB,dA,dB,dir) {
        cc.log('dealEAtCards:   ',value,paiA,paiB,flag);
        let blockNum = this.blockPais.length;

        var ddA = this.findCardValueIndex(paiA);
        var ddB = this.findCardValueIndex(paiB);
        if(ddA >= 0){
            dA = ddA;
            dB = ddB;
        }

        let minD = Math.min(dA,dB);
        let maxD = Math.max(dA,dB);

        let values = [];
        if(flag == EATFLAG.EAT_LEFT){
            values = [value,paiA,paiB];
        }else if(flag == EATFLAG.EAT_MID){

            values = [paiA,value,paiB];
        }else {
            values = [paiA,paiB,value];
        }
        cc.log('dealEatCards : ',values);
        this.blockPais.push({
            blockFlag : flag,
            values : values,
            dir : dir,
        });
        for(let i = 0; i < 3; i++){
            let card = this._createOneBlockCard(values[i],blockNum,i,false);
            if(value == values[i]){
                card.setArrowTag(this._chair,dir);
            }
        }

        this.removeHandCardIndex(maxD);
        this.removeHandCardIndex(minD);
        this.freshHandCardsPos(true);
    },
    
    dealBarCards : function (value,opcode,data,dir) {
        if(data.style == 0){   // 明杠
            this.dealHitBarCards(value,data.da,data.db,data.dc,dir);
        }else if(data.style == 1){ // 暗杠
            this.dealAnBarCards(data.pai,data.da,data.db,data.dc,data.dd);
        }else if(data.style == 2){  // 补杠
            this.dealSupplyBarCards(data.pai,data.da);
        }
    },
    dealBarCardsEX : function (value,opcode,data,dir) {
        if(data.style == 0){   // 明杠
            this.dealHitBarCardsEX(value,data.da,data.db,data.dc,dir);
        }else if(data.style == 1){ // 暗杠
            this.dealAnBarCardsEX(data.pai,data.da,data.db,data.dc,data.dd);
        }else if(data.style == 2){  // 补杠
            this.dealSupplyBarCardsEX(data.pai,data.da);
        }
    },
    reDrawBlockHandCards : function (pais) {
        this._hands.clearCards();
        for(let i = 0; i < pais.length; i++){
            let needDiffFlag = (i == pais.length -1 && (i+1) % 3 == 2);
            this._createOneHandBlock(pais[i],needDiffFlag);
        }
    },
    dealHitBarCardsEX : function (value,da,db,dc,dir) {
        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_BAR,
            values : [value,da,db,dc],
            dir  : dir
        });
        let card1 = this._createOneBlockCard(value,blockNum,0,false);
        let card2 = this._createOneBlockCard(da,blockNum,1,false);
        let card3 = this._createOneBlockCard(db,blockNum,2,false);
        let card4 = this._createOneBlockCard(dc,blockNum,3,false);
        card4.setArrowTag(this._chair,dir);
        let start = 0;
        let startBD = 0;
        if( this.rule.isBD(da))
        {
            da = this.findCardValueIndex(da,startBD);
            startBD = da+1;
        }
        else
        {
            da = this.findCardValueIndex(da,start);
            start = da+1;
        }

        if( this.rule.isBD(db))
        {
            db = this.findCardValueIndex(db,startBD);
            startBD = db+1;
        }
        else
        {
            db = this.findCardValueIndex(db,start);
            start = db+1;
        }

        if( this.rule.isBD(dc))
        {
            dc = this.findCardValueIndex(dc,startBD);
            startBD = dc+1;
        }
        else
        {
            dc = this.findCardValueIndex(dc,start);
            start = dc+1;
        }
        if (da<0){
            da=1;
            db=2;
            dc=3;
        }
        let ds = [da,db,dc];
        ds.sort(function (a,b) {
            return a - b;
        });
        this.removeHandCardIndex(ds[2]);
        this.removeHandCardIndex(ds[1]);
        this.removeHandCardIndex(ds[0]);
        this.freshHandCardsPos();
    },
    dealHitBarCards : function (value,da,db,dc,dir) {
        var dda = this.findCardValueIndex(value);
        if(dda >= 0){
            da = dda;
            db = this.findCardValueIndex(value,dda+1);
            dc = this.findCardValueIndex(value,db+1);
        }

        let ds = [da,db,dc];
        ds.sort(function (a,b) {
           return a - b;
        });
        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_BAR,
            values : [value],
            dir  : dir
        });

        for(let i = 0; i < 4; i++){
            let card = this._createOneBlockCard(value,blockNum,i,false);
            if(i == 3){
                card.setArrowTag(this._chair,dir);
            }
        }

        this.removeHandCardIndex(ds[2]);
        this.removeHandCardIndex(ds[1]);
        this.removeHandCardIndex(ds[0]);
        this.freshHandCardsPos();
    },

    /**
     * 暗杠
     * @param value
     * @param da
     * @param db
     * @param dc
     * @param dd
     * @param dir
     */
    dealAnBarCards : function (value,da,db,dc,dd) {
        var dda = this.findCardValueIndex(value);
        if(da >= 0){
            da = dda;
            db = this.findCardValueIndex(value,dda+1);
            dc = this.findCardValueIndex(value,db+1);
            dd = this.findCardValueIndex(value,dc+1);
        }

        let dds = [da,db,dc,dd];
        dds.sort(function (a,b) {
            return a - b;
        });

        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_BAR_DRAK,
            values : [value],
            dir  : this._chair
        });

        for(let i = 0; i < 4; i++){
            let card = this._createOneBlockCard(value,blockNum,i,i!=3);
            if(i==3){
                card.setArrowTag(this._chair,this._chair);
            }
        }

        this.removeHandCardIndex(dds[3]);
        this.removeHandCardIndex(dds[2]);
        this.removeHandCardIndex(dds[1]);
        this.removeHandCardIndex(dds[0]);
        this.freshHandCardsPos(true);
    },
    dealAnBarCardsEX : function (value,da,db,dc,dd) {
        let blockNum = this.blockPais.length;
        this.blockPais.push({
            blockFlag : EATFLAG.EAT_BAR_DRAK,
            values : [da,db,dc,dd],
            dir  : this._chair
        });

        let card1 = this._createOneBlockCard(da,blockNum,0,false);
        let card2 = this._createOneBlockCard(db,blockNum,1,false);
        let card3 = this._createOneBlockCard(dc,blockNum,2,false);
        let card4 = this._createOneBlockCard(dd,blockNum,3,false);
        card4.setArrowTag(this._chair,this._chair);
        let start = 0;
        let startBD = 0;
        if( this.rule.isBD(da))
        {
            da = this.findCardValueIndex(da,startBD);
            startBD = da+1;
        }
        else
        {
            da = this.findCardValueIndex(da,start);
            start = da+1;
        }
        if( this.rule.isBD(db))
        {
            db = this.findCardValueIndex(db,startBD);
            startBD = db+1;
        }
        else
        {
            db = this.findCardValueIndex(db,start);
            start = db+1;
        }
        if( this.rule.isBD(dc))
        {
            dc = this.findCardValueIndex(dc,startBD);
            startBD = dc+1;
        }
        else
        {
            dc = this.findCardValueIndex(dc,start);
            start = dc+1;
        }
        if( this.rule.isBD(dd))
        {
            dd = this.findCardValueIndex(dd,startBD);
            startBD = dd+1;
        }
        else
        {
            dd = this.findCardValueIndex(dd,start);
            start = dd+1;
        }
        if (da<0){
            da=0;
            db=1;
            dc=2;
            dd=3;
        }
        let dds = [da,db,dc,dd];
        dds.sort(function (a,b) {
            return a - b;
        });
        this.removeHandCardIndex(dds[3]);
        this.removeHandCardIndex(dds[2]);
        this.removeHandCardIndex(dds[1]);
        this.removeHandCardIndex(dds[0]);
        this.freshHandCardsPos(true);
    },
    /**
     * 补杠
     * @param value
     * @param da
     */
    dealSupplyBarCards : function (value,da) {
        let blockNum = -1;
        let dir = 0;
        var dda = this.findCardValueIndex(value);
        if(dda >= 0){
            da = dda;
        }

        for(let i = 0; i < this.blockPais.length; i++){
            let blockValue = this.blockPais[i].values[0];
            if(blockValue == value ){
                this.blockPais[i].blockFlag = EATFLAG.EAT_BAR;
                dir = this.blockPais[i].dir;
                blockNum = i;
                break;
            }
        }

        if(blockNum < 0){
            cc.log('group num data is err');
            return;
        }
        cc.log('supply block num :',blockNum);
        let card = this._createOneBlockCard(value,blockNum,3,false);
        card.setArrowTag(this._chair,dir);
        this.removeHandCardIndex(da);
        this.freshHandCardsPos();
    },
    dealSupplyBarCardsEX : function (value,num) {
        let blockNum = -1;
        let dir = 0;

        let dda = this.findCardValueIndex(value);
        if (dda<0){
            dda = 0;
        }
        this.blockPais[num].blockFlag = EATFLAG.EAT_BAR;
        this.blockPais[num].values.push(value);
        dir = this.blockPais[num].dir;
        blockNum = num;
        let card = this._createOneBlockCard(value,blockNum,this.blockPais[num].values.length-1,false);
        card.setArrowTag(this._chair,dir);

        if(blockNum < 0){
            cc.log('group num data is err');
            return;
        }
        cc.log('supply block num :',blockNum);
        this.removeHandCardIndex(dda);
        this.freshHandCardsPos();
    },
    
    removeLastOutCard:function(){
        let len = this._getOutCardsLen();
        this._outs.removeCardToStackByIndex(len-1);
    },

    removeHandCardIndex : function(index){
        this._hands.removeCardToStackByIndex(index);
    },


    findCardValueIndex:function(value,startPos){
       return this._hands.FindPai(value,startPos);
    },

    freshHandCardsPos:function(bNotSort){
        bNotSort = bNotSort || false;
        let len = this._hands._mjcards.length;
        cc.log('ds',len)
        let self = this;
        let lastpai = [];
        if(len%3 ==2 ){
            lastpai = this._hands._mjcards.pop();
            if(!bNotSort){
                this._hands._mjcards.sort(function(a,b){
                    return self.rule.compareValue(a.getValue(),b.getValue());
                });
            }
            this._hands._mjcards.push(lastpai)
        }else{
            if(!bNotSort){
                this._hands._mjcards.sort(function(a,b){
                    return self.rule.compareValue(a.getValue(),b.getValue());
                });
            }
        }

        this._handZOrder = 100;
        for(let i=0;i<len ;i++){
          let mjcard = this._hands._mjcards[i];
            let pos;
            if(this._chair == 0){
                pos = this._layout.getPosByIndex(i,this._getBlocksLen());
            }else {
                if(MJType.invalidPai(mjcard.getValue())){
                    pos = this._layout.getHuCardPos(i+1,this._getBlocksLen());
                }else{
                    pos = this._layout.getPosByIndex(i,this._getBlocksLen());
                }
            }

          //let pos = this._layout.getPosByIndex(i,this._getBlocksLen());
            mjcard.setDown();
          mjcard.setCardOriginPos(pos.x,pos.y);
          if(i == len-1 && len % 3 == 2){
            let diff = this._layout.getLastCardDiff();
            mjcard.shiftMove(diff.x,diff.y);
          }
          mjcard.setLayer(this._handZOrder);
          if(this._chair == 1){
              this._handZOrder--;
          }else {
              this._handZOrder++;
          }
        }

    },
    freshMoHandCardsPos:function(bNotSort){
        bNotSort = bNotSort || false;
        let len = this._hands._mjcards.length;
        console.log('ds',len)
        let self = this;
        let lastpai = [];
        if(len%3 ==2 ){
            lastpai = this._hands._mjcards.pop();
            if(!bNotSort){
                this._hands._mjcards.sort(function(a,b){
                    return self.rule.compareValue(a.getValue(),b.getValue());
                });
            }
            this._hands._mjcards.push(lastpai)
        }else{
            if(!bNotSort){
                this._hands._mjcards.sort(function(a,b){
                    return self.rule.compareValue(a.getValue(),b.getValue());
                });
            }
        }
        this._handZOrder = 100;
        for(let i=0;i<len ;i++){
            let mjcard = this._hands._mjcards[i];
            let pos;
            if(this._chair == 0){
                pos = this._layout.getPosByIndex(i,this._getBlocksLen());
            }else {
                if(MJType.invalidPai(mjcard.getValue())){
                    pos = this._layout.getHuCardPos(i+1,this._getBlocksLen());
                }else{
                    pos = this._layout.getPosByIndex(i,this._getBlocksLen());
                }
            }

            //let pos = this._layout.getPosByIndex(i,this._getBlocksLen());
            mjcard.setDown();
            mjcard.setCardOriginPos(pos.x,pos.y);
            if(i == len-1 && len % 3 == 2){
                let diff = this._layout.getLastCardDiff();
                mjcard.shiftMove(diff.x,diff.y);
            }
            mjcard.setLayer(this._handZOrder);
            if(this._chair == 1){
                this._handZOrder--;
            }else {
                this._handZOrder++;
            }
        }

    },

    getTouchHandIndex:function(point){
      let len = this._hands._mjcards.length;
      for(let i=len-1;i>-1;i--){
        let mj = this._hands._mjcards[i].node;
        let width = mj.getContentSize().width;
        let height = mj.getContentSize().height;
        let p = mj.convertToNodeSpace(point);
        if(p.x>0&&p.x<width&&p.y>0&&p.y<height){
          return i;
        }
      }
      return -1;
    },

    _createOneBlockCard : function (value,blockNum,index,bAnBar) {
        let mjcard = this._blocks.getOrCreateCard();
        bAnBar = bAnBar || false;
        let scale = [1,0.8,0.65,0.8];
        mjcard.setCardScale(scale[this._chair]*this.scale);
        let frame = null;
        if(bAnBar){
          frame = MJCardResource.getAnFrame(this._chair);
        }else{
          frame = MJCardResource.getExtraImageByChair(this._chair,value);
        }
        mjcard.setCard(value,frame);
        let pos = this._layout.getBlockPosByIndex(blockNum,index);
        mjcard.setCardOriginPos(pos.x,pos.y);

        if(index ==3){
            cc.log('index=3,ZOrder',this._blockOrder);
            mjcard.setLayer(this._blockOrder + 100);
        }else if(index == 4){
            cc.log('index=4,ZOrder',this._blockOrder);
            mjcard.setLayer(this._blockOrder + 98.5);
        }else if(index == 5){
            cc.log('index=5,ZOrder',this._blockOrder);
            mjcard.setLayer(this._blockOrder + 110);
        }else if(index == 6){
            mjcard.setLayer(this._blockOrder + 200);
        } else {
            mjcard.setLayer(this._blockOrder);
            cc.log('ZOrder',this._blockOrder);
        }
        if(this.rule.isBD(value)){
            mjcard.setBDTag(this._chair,false);
        }
        if(this._chair == 1){
            this._blockOrder--;
        }else {
            this._blockOrder++;
        }
        cc.log('ZOrder',this._blockOrder);
        return mjcard;
    },

    _sortBlockOrder : function(){
        let blockNum = this.blockPais.length;
        let start = 0;
        for(let i=0;i<blockNum;i++){
            let values = this.blockPais[i].values;
            let len  = values.length;
            for(let j = 0; j<len ; j++){
                let z = j===3?103-start:100-start;
                if(3===this._chair){
                    z = j===3?103+start:100+start;
                }
                if(2===this._chair){
                    //this._blocks._mjcards[start].node.setRotation(180);
                }
                //console.log('start',start);
                this._blocks._mjcards[start].setLayer(z);
                start++;
            }
        }

        if (0 == this._chair) {
          for(let k=0;k<this._blocks._mjcards.length;k++){
            this._blocks._mjcards[k].setLayer(100+k);
          }
        }

    },

    _createOneOutCard:function(value){
      let mjcard = this._outs.getOrCreateCard();
      let frame = MJCardResource.getExtraImageByChair(this._chair,value);
      mjcard.setCard(value,frame);
      let len = this._getOutCardsLen();
      let pos = this._layout.getOutPos(len-1,this.rule.ruleFlag);
      mjcard.setCardOriginPos(pos.x,pos.y);
      let scale = [1,1,0.8,1];
      mjcard.setCardScale(scale[this._chair]);
      this._sortOutOrder();
      this.lastOutCard = mjcard;
        if(this.rule.isBD(value)){
            mjcard.setBDTag(this._chair,false);
        }
        return this.lastOutCard;
    },

    /**
     * 获取手牌的排序所用
     * @param mjcards
     * @param card
     */
    getSortIndexByWeight : function (mjcards,card) {
        let len = mjcards.length;
        let  Wc = this.rule.getMJWeight(card.getValue());
        for(let i = 0; i < len; i++){
            let Wi = this.rule.getMJWeight(mjcards[i].getValue());
            if(Wc < Wi){
                return i;
            }
        }

        return len;
    },

    _sortOutOrder : function(){
        //根据chair来设置出牌层次
        let len = this._outs._mjcards.length;
        for(let i=0;i<len;i++){
            let z = 100-i;

            if(this._chair === 1){
                if(i>9&&i<18){
                    z +=12;
                }else if(i>17){
                    z += 24;
                }
            }
            if(this._chair == 3||2===this._chair){
                z = 100+i;
                if(i>9&&i<18){
                    z +=12;
                }else if(i>17){
                    z += 24;
                }
            }
            this._outs._mjcards[i].setLayer(z);
        }
    },


    showTipTag:function(value,isVisible){
      for(let i in this._outs._mjcards){
        if(this._outs._mjcards[i].getValue()==value){
          this._outs._mjcards[i].setTipTag(this._chair,isVisible);
        }
      }
      for(let j in this._blocks._mjcards){
        if(this._blocks._mjcards[j].getValue()==value){
          this._blocks._mjcards[j].setTipTag(this._chair,isVisible);
        }
      }
    },

    createMJArray : function (zOrder) {
        zOrder = zOrder||10;
        let node = new cc.Node();
        let array = node.addComponent('gandengyanCardArray');
        node.parent = this.node.parent;
        node.setLocalZOrder(zOrder);
        return array;
    },

    _createOneFlower : function (value,masterid) {
       let index  = this._getFlowersLen();
       let mjcard = this._flowers.getOrCreateCard();
       let frame = MJCardResource.getExtraImageByChair(this._chair,value);
       mjcard.setCard(value,frame);
       let scale = [1,0.8,0.64,0.8];
       mjcard.setCardScale(scale[this._chair]);
       let pos = this._layout.getFlowerPos(index);
       mjcard.setCardOriginPos(pos.x,pos.y);
       this._sortFlowerOrder();
       if (!!masterid){
           cc.log(masterid);
           cc.log(this._chair);
           if (masterid-1==this._chair){
               if (value==MJType.PAI.PAI_HC||value==MJType.PAI.PAI_HM){
                   mjcard.setFlowerMask(this._chair);
               }

           }else if (Math.abs(masterid-this._chair)==2){
               if (value==MJType.PAI.PAI_HD||value==MJType.PAI.PAI_HZ){
                   mjcard.setFlowerMask(this._chair);
               }
           }else if (masterid-this._chair==3||masterid-this._chair==-1){
               if (value==MJType.PAI.PAI_HQ||value==MJType.PAI.PAI_HJ){
                   mjcard.setFlowerMask(this._chair);
               }
           }else {
               if (value==MJType.PAI.PAI_HX||value==MJType.PAI.PAI_HL){
                   mjcard.setFlowerMask(this._chair);
               }
           }
       }

    },
    _createOneFlowerEX : function (value,masterid) {
        let index  = this._getFlowersLen();
        let mjcard = this._flowers.getOrCreateCard();
        let frame = MJCardResource.getExtraImageByChair(this._chair,value);
        mjcard.setCard(value,frame);
        let scale = [1,0.8,0.64,0.8];
        mjcard.setCardScale(scale[this._chair]);
        let pos = this._layout.getFlowerPos(index);
        mjcard.setCardOriginPos(pos.x,pos.y);
        this._sortFlowerOrder();
        mjcard.setGHTag(this._chair);
        if (!!masterid){
            cc.log(masterid);
            cc.log(this._chair);
            if (masterid-1==this._chair){
                if (value==MJType.PAI.PAI_HC||value==MJType.PAI.PAI_HM){
                    mjcard.setFlowerMask(this._chair);
                }

            }else if (Math.abs(masterid-this._chair)==2){
                if (value==MJType.PAI.PAI_HD||value==MJType.PAI.PAI_HZ){
                    mjcard.setFlowerMask(this._chair);
                }
            }else if (masterid-this._chair==3||masterid-this._chair==-1){
                if (value==MJType.PAI.PAI_HQ||value==MJType.PAI.PAI_HJ){
                    mjcard.setFlowerMask(this._chair);
                }
            }else {
                if (value==MJType.PAI.PAI_HX||value==MJType.PAI.PAI_HL){
                    mjcard.setFlowerMask(this._chair);
                }
            }
        }

    },

    _createOneHU : function (value,masterid) {
        let index  = this._getFlowersLen();
        let mjcard = this._flowers.getOrCreateCard();
        let frame = MJCardResource.getExtraImageByChair(this._chair,value);
        mjcard.setCard(value,frame);
        let scale = [1,0.8,0.64,0.8];
        mjcard.setCardScale(scale[this._chair]);
        let pos = this._layout.getFlowerPos(index);
        mjcard.setCardOriginPos(pos.x,pos.y);
        this._sortFlowerOrder();
        return mjcard;
    },

    _sortFlowerOrder : function(){
        let len = this._flowers._mjcards.length;
        for(let i=0;i<len;i++){
            let  z = 100+i;
            if(3==this._chair){
              z = 50-i;
            }
            this._flowers._mjcards[i].setLayer(z);
        }
    },

    _getHandsCardLen : function () {
        let mj = this._hands.getMJCards();
        return mj.length;
    },

    _getOutCardsLen : function () {
        let out = this._outs.getMJCards();
        return out.length;
    },

    _getBlocksLen : function () {
        return this.blockPais.length;
    },

    _getFlowersLen:function(){
      return this._flowers.getMJCards().length;
    }

});
