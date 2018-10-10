
const GamePlayer = require('GamePlayer');
const config = require('Config');

cc.Class({
    extends: cc.Component,

    properties: {
        users : {
            default:[],
            type:cc.Node
        },
        startAgain : cc.Node,
        gameResult : cc.Node,
        leaveGame  : cc.Node,
        result2 : cc.Node,
        bgNode :cc.Node,
        winBgSF : cc.SpriteFrame,
        loseBgSF: cc.SpriteFrame,
        share:cc.Node,
    },

    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START,function () {

        },this);

        // this.mycolor = cc.color(255,255,204);
        // this.othercolor = cc.color(255,255,204);
    },

    /**
     * 显示结算消息
     * @param gameid
     * @param masterid
     * @param huInfo
     * @param resultInfo
     */


    showResult : function (resultData,roomType) {
        let self = this;
        this.controller = cc.find('Canvas/controller');
        var i = 0;
        for( ; i < 4; i++) {
            var userResult = resultData.ar[i];

            if (userResult.userid == UserCenter.getUserID()) {
                // if (userResult.isWin){
                //     // this.bgNode.getComponent(cc.Sprite).spriteFrame = this.winBgSF;
                // } else {
                //     this.bgNode.getComponent(cc.Sprite).spriteFrame = this.loseBgSF;
                //     this.bgNode.setPositionY(this.bgNode.y-30);
                // }
            }
            var userNode = this.users[i];
            userNode.getChildByName('nicheng').getComponent(cc.Label).string = userResult.username;
            userNode.getChildByName('difen').getComponent(cc.Label).string = resultData.basemoney;
            userNode.getChildByName('beishu').getComponent(cc.Label).string = userResult.times;
            userNode.getChildByName('defen').getComponent(cc.Label).string = userResult.curwon;
            userNode.getChildByName('dizhuIcon').active = userResult.isDizhu > 0;
            if (roomType != 2){
                self.share.active = false;
                self.leaveGame.active= true;
            }else{
                self.share.active = true;
                self.leaveGame.active= false;
            }
        }

    },

    getChairByUserid : function (userid)
    {
        let seatid = GamePlayer.getSeatByUserid(userid);
        return this.getChairBySeatId(seatid);
    },
    getChairBySeatId:function(seatId)
    {
        //return (seatId-this.seatId+MAX_PLAYERS)%MAX_PLAYERS;
        if(SkyManager.rule.playerNum==4){
            return (seatId-this.seatId+3)%3;
        }
        else{
            if(seatId == this.seatId){
                return 0;
            }else{
                return 2;
            }
        }

    },
    onReturnClick : function () {
        this.controller.emit('onExit');
        this.node.removeFromParent(true);
    },
    /**
     *  开始游戏
     */

    onclickContinue:function(event,num){
        let self = this;
        if(SkyManager.rule.roomType < 2){
            if(!!SkyManager.controller.minpoint){
                let jinbi = UserCenter.getYouxibiNum();
                let baoxian = UserCenter.getYinhanbiNum();
                if(jinbi < SkyManager.controller.minpoint){
                    showLoadingAni()
                    if( jinbi+ baoxian < SkyManager.controller.minpoint){
                        hideLoadingAni()
                        showAlertBox('账户金币不足',function () {
                            self.onReturnClick();
                        })
                    }else{
                        cc.log(SkyManager.controller.minpoint,jinbi)
                        let message;
                        let qugao;
                        let qudi = SkyManager.controller.minpoint - jinbi;
                        if(SkyManager.controller.maxpoint){
                            qugao = SkyManager.controller.maxpoint - jinbi;
                            message = '请取出'+qudi+'-'+qugao+'金币'
                        }else{
                            message = '请取出至少'+qudi+'金币'
                        }

                        showAlertBox(message,function () {
                            loadPrefab("hall/bank/bank",function (module) {
                                module.x = cc.winSize.width / 2;
                                module.y = cc.winSize.height / 2;
                                module.parent = cc.director.getScene();
                                hideLoadingAni()
                                cc.log(_bnngooLoading.active)

                                module.getComponent('bankScript').setBank(qudi,qugao,1,function (err,data) {

                                    if(err){
                                        cc.log(err)
                                        self.onReturnClick();
                                        return;
                                    }
                                    let message ={
                                        "CMD":"10003"
                                    }
                                    cc.log('100031',data)
                                    SkyManager.rule.sendExpend(message,function (data) {
                                        cc.log('10003',data)
                                        hideLoadingAni()
                                        if(data.code == 200){
                                            if (num == 1){
                                                self.controller.emit('msg_onceAgain');
                                            }else{
                                                self.controller.emit('msg_lightStart');
                                            }
                                            self.node.removeFromParent(true);
                                        }else{
                                            showAlertBox('取钱出错，请退出游戏后重试',function () {
                                                self.closeGmae()
                                            })
                                        }

                                    })
                                })
                                module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05,1.1),cc.scaleTo(0.05,1)))
                            });
                        },function () {
                            self.onReturnClick()
                        })
                    }
                }else{
                    if (num == 1){
                        self.controller.emit('msg_onceAgain');
                    }else{
                        self.controller.emit('msg_lightStart');
                    }
                    self.node.removeFromParent(true);
                }

            }else{
                showAlertBox('获取金币最小值失败，请退出游戏后再试',function () {
                    self.onReturnClick()
                })
            }
        }else{
            if (num == 1){
                self.controller.emit('msg_onceAgain');
            }else{
                self.controller.emit('msg_lightStart');
            }
            self.node.removeFromParent(true);
        }

    },
    onStartGame : function () {

    },
    onLightStart : function () {
        this.controller.emit('msg_lightStart');
        this.node.removeFromParent(true);
    },

    onClose : function () {
        this.controller.emit('resultClose');
        this.node.removeFromParent(true);
    },

    //退出房间
    closeGmae : function () {
        this.rule.node.emit('onExit');
        this.node.removeFromParent(true);
    },
    /**
     * 绘制牌
     */
    drawUserCards : function (mj,usr,lastPlayId) {
        mj.removeAllChildren(true);
        let startPosX = 0;
        let scale = this.game.handCards > 14 ? 0.8 : 1;
        for(let i = 0; i < usr.flowers.length; i++){
            let card = this._createMJCard(usr.flowers[i]);
            card.x = startPosX;
            card.scale = scale;
            startPosX += 50 * scale;
            card.parent = mj;
        }

       // startPosX += 10;
        for(let i = 0; i < usr.blockPais.length; i++){
            let block = usr.blockPais[i];
            if(block.blockFlag < 4){ // 吃
                for(let i = 0; i < block.values.length; i++){
                    let pai = block.values[i];
                    let card = this._createMJCard(pai);
                    card.scale = scale;
                    card.x = startPosX;
                    startPosX += 50 * scale;
                    card.parent = mj;
                }
            }else if(block.blockFlag == 4){ // 碰
                for(let i = 0; i < 3; i++){
                    let card = this._createMJCard(block.values[0]);
                    card.x = startPosX;
                    card.scale = scale;
                    startPosX += 50 * scale;
                    card.parent = mj;
                }
            }else {  // 杠
                if (i==usr.blockPais.length-1&&block.blockFlag==5&&this.huInfo.data.huflag == MJCommand.HUFLAG.MJR_HU_QG&&usr.userid==lastPlayId){
                    for(let i = 0; i < 3; i++) {
                        let card;
                        card = this._createMJCard(block.values[0]);
                        card.x = startPosX;
                        startPosX += 50 * scale;
                        card.scale = scale;
                        card.parent = mj;
                    }
                }else {
                    let bAnBar = block.blockFlag == 6;
                    for (let i = 0; i < 4; i++) {
                        let card;
                        if (!bAnBar || i == 3) {
                            card = this._createMJCard(block.values[0]);
                            cc.log('mingbugang')
                        } else {
                            card = this._createAnBar();
                            cc.log('angang')
                        }

                        if (i == 3) {
                            card.x = startPosX - 100 * scale;
                            card.y = 20;
                        } else {
                            card.x = startPosX;
                            startPosX += 50 * scale;
                        }
                        card.scale = scale;
                        card.parent = mj;
                    }
                }
            }
            //startPosX += 5;
        }

        startPosX += 10;
        for(let i = 0; i < usr.pais.length; i++){
            let card = this._createMJCard(usr.pais[i]);
            if(i == usr.pais.length-1 && usr.pais.length% 3 == 2) startPosX += 10;
            card.x = startPosX;
            card.scale = scale;
            startPosX += 50 * scale;
            card.parent = mj;

            var bd = this.rule.getBD();
            if(bd == usr.pais[i]){
                var mjcard = card.getComponent('MJCard');
                mjcard.setBDTag(0,false,0,22);
            }
        }
    },
    
    getCardsNumber : function (usr) {
        let total = 0;
        total += usr.flowers.length;
        total += usr.blockPais.length * 3;
        total += usr.pais.length;

        return total;
    },


    /**
     * 分享结算
     */
    onShareResult : function () {
        showLoadingAni();
        let shareTo = 1;
        captureScreen(this.node,function (err,path) {
           hideLoadingAni();
            if(err){
                return;
            }

            wxapi.sendImageToWxReq(path,shareTo);
        });
    },

});
