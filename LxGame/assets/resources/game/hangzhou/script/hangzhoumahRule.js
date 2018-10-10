var MJRule = require('MJRule');

var GamePlayer = require('GamePlayer');
cc.Class({
    extends: MJRule,
    properties: {
        //outCardBDChair : -1              // 打出财神的玩家方位
    },

    onLoad : function () {
        this._super();
        this.outCardBDChair = -1;
    },

    gameStart : function (masterid,baseMoney) {
        this._super(masterid,baseMoney);
        this.outCardBDChair = -1;
    },
    /**
     * 杭州麻将，出了财神，只能摸打
     * @param chair
     * @param data
     */
    onCmdOutPai : function (chair,data) {
        this._super(chair,data);
        if(this.isBD(data.pai)){
            this.outCardBDChair = chair;
        }
    },

    onCmdGetPai : function (chair,data){
        this._super(chair,data);
        if(this.outCardBDChair == chair){  // 取消出牌限制
            this.outCardBDChair = -1;
        }
    },

    // 飘彩财神只能摸打
    cannotOutCard : function (value,isGet) {
        cc.log('cannotOutCard',isGet);
        if(this.outCardBDChair < 0){
            return this._super(value,isGet);
        }

        return !isGet;
    },
    getChairBySeatId3: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 2) {
            if (chair == 2) {
                chair = 1;
            }
        } else if (seatId == 3) {
            if (chair == 2) {
                chair = 3;
            }
        }
        return chair;
    },

    getChairBySeatId2: function (seatId) {
        var chair = this.getChairBySeatId(seatId);
        if (seatId == 1) {
            if (chair == 3) {
                chair = 2;
            }
        } else if (seatId == 2) {
            if (chair == 1) {
                chair = 2;
            }
        }
        return chair;
    },

    getChairByUid: function (userid) {
        let seatid = GamePlayer.getSeatByUserid(userid);
        var chair = this.getChairBySeatId(seatid);
        if (this.roomType < 2) {
            if (!this.youxirenshu) {
                chair = this.getChairBySeatId(seatid);
            } else {
                switch (this.youxirenshu) {
                    case 2: chair = this.getChairBySeatId2(seatid); break;
                    case 4: chair = this.getChairBySeatId(seatid); break;
                }
            }

        } else {
            switch (this.ruleFlag & 0x07) {
                case 0x01: chair = this.getChairBySeatId2(seatid); break;
                case 0x02: chair = this.getChairBySeatId3(seatid); break;
                case 0x04: chair = this.getChairBySeatId(seatid); break;
            }
        }

        return chair;
    },
});