
var MJCard = require('MJCard');

cc.Class({
    extends: cc.Component,

    properties: {
        _mjcards : [],
        _stackCards : []
    },

    getOrCreateCard : function () {

        // if(this._stackCards.length > 0){
        //     mjcard = this._stackCards.pop();
        //     // 牌值清理
        //     mjcard.hideArrowTag();
        //     mjcard.setDown();
        //     mjcard.hitTipTag();
        //     mjcard.clearBDTag();
        //     mjcard.clearFlowerMask();
        //     mjcard.setActive(true);
        //     mjcard.clearCardMask();
        //     mjcard.clearXueMask();
        // }else {
        //     let node = new cc.Node();
        //     node.parent = this.node;
        //     mjcard = node.addComponent('MJCard');
        // }

        var mjcard;
        let node = new cc.Node();
        node.parent = this.node;
        mjcard = node.addComponent('MJCard');
        mjcard.idx = this._mjcards.length;
        this._mjcards.push(mjcard);
        return mjcard;
    },

    /**
     * 将牌放回到牌堆中
     */
    removeCardToStackByIndex : function (index) {
        let removeCard = this._mjcards.splice(index,1)[0];
        if(!!removeCard){
            removeCard.setActive(false);
            removeCard.setDown();
            removeCard.node.removeFromParent(true);
            //this._stackCards.push(removeCard);
        }
    },

    /**
     *  获取提起来的牌
     */
    getUpCard : function () {
        let upCard = null;
        for(let i = 0; i < this._mjcards.length; i++){
            let card = this._mjcards[i];
            if(card.isUp()){
                upCard = card;
            }
        }

        return upCard;
    },

    /**
     *  获取触摸的牌
     */
    getTouchCardByPos : function (p,upIndex) {
        // 先判断未站起来的牌
        if(upIndex >= 0){
            for(let i = 0; i < this._mjcards.length; i++){
                let card = this._mjcards[i];
                if(i != upIndex && card.containsPoint(p)){
                    return card;
                }
            }

            // 判断触摸是不是提起来的牌
            let upCard = this._mjcards[upIndex];
            if(upCard.containsPoint(p)){
                return upCard;
            }
        }else {
            for(let i = 0; i < this._mjcards.length; i++) {
                let card = this._mjcards[i];
                if(card.containsPoint(p)){
                    return card;
                }
            }
        }
        return null;
    },
    /**
     * 获取牌的索引
     * @param card
     */
    getHandCardIndex : function (card) {
        return card.getLayer() - this._mjcards[0].getLayer();
    },

    setSelectCardUp : function (index,card) {
        this.resetHandCards();
       // this._setCardUp(index,card);
        card.setUp();
    },
    
    resetHandCards : function () {
        for(let i = 0; i < this._mjcards.length; i++){
            let card = this._mjcards[i];
            card.setDown();
        }
    },

    /**
     * 获取牌张数
     * @param pai
     * @param index
     */
    CountPai : function (pai,index) {
        let ic = 0;
        index = index || 0;
        for(let i = index; i < this._mjcards.length; i++){
            let mjCard = this._mjcards[i];
            if(mjCard.getValue() == pai){
                ic++;
            }
        }

        return ic;
    },
    
    /**
     * 查找一张牌
     * @param pai
     * @param start
     * @constructor
     */
    FindPai : function (pai,start) {
        let i = start || 0;
        for(; i < this._mjcards.length;i++){
            let mjCard = this._mjcards[i];
            if(mjCard.getValue() == pai){
                return i;
            }
        }
        return -1;
    },

    /**
     * 删除指定的一张牌
     * @param value
     */
    removeCardByValue : function (value) {
        let index = this.FindPai(value,0);
        if(index < 0){
            return;
        }
        this.removeCardToStackByIndex(index);
    },

    getIndexByValue : function (value) {
        let len = this._mjcards.length -1;
        for(let i = len; i >= 0; i--){
            if(this._mjcards[i].getValue() == value){
                return i;
            }
        }
        return -1;
    },

    clearCards : function () {
        if(!this._mjcards){
            this._mjcards = [];
            this._stackCards = [];
            return;
        }

        while (this._mjcards.length > 0){
            let popCard = this._mjcards.pop();
            popCard.setActive(false);
            this._stackCards.push(popCard);
        }
    },

    getMJCards : function () {
        return this._mjcards;
    },

    // 获取牌值
    tovalue : function () {
        let list = [];
        this._mjcards.forEach(function (card) {
            list.push(card.getValue());
        });

        return list;
    }
});
