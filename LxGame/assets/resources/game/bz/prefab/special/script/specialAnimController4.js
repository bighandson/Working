var bzSoundC = require('bzSoundController');
cc.Class({
    extends: cc.Component,

    properties: {
        nameSprite:cc.Node,
        pokersNode:cc.Node,
        animationNode:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,    this);
        this.animationNodeAnimation = this.animationNode.getComponent(cc.Animation);
    },

    onFinished:function()
    {
        this.node.active = false;
        //检查特殊牌型和全垒打
        SssManager.controller.checkSpecial();
    },

    //userdata 特殊牌型或者是全垒打
    onShow:function(userdata,playerUI)
    {
        this.node.active = true;
        let self = this;
        let resStr;
        let animationFrameIndex = 1;
        if(userdata.fullgunscore > 0)
        {
            //全垒打
            resStr = "qld";
            animationFrameIndex = 5;
        }else
        {
            //特殊牌型
            resStr = "s_"+userdata.specialtype;
            if(userdata.specialtype <= 6)
            {
                animationFrameIndex = 1;
            }else if(userdata.specialtype <= 8)
            {
                animationFrameIndex = 2;
            }else if(userdata.specialtype <= 10)
            {
                animationFrameIndex = 3;
            }else if(userdata.specialtype <= 13)
            {
                animationFrameIndex = 4;
            }else {

            }
        }
        if(!!SssManager.game.sssPrefabs.bzSound){
            if(resStr == 'qld'){
                bzSoundC.playSoundBySex('fanche',playerUI.sex);
            }else{
                bzSoundC.playSoundBySex("tpai_"+userdata.specialtype,playerUI.sex);
            }
        }
        let path;

        // if (!!SssManager.game.sssPrefabs.specialTexture) {
        //     path = 'youxi/{0}/prefab/special/texture/'.format(SssManager.game.sourcePath);
        // } else {
        //     path = 'game/poker/shisanshui/{0}/prefab/special/texture/'.format(SssManager.game.sssScene);
        // }
        cc.loader.loadRes('game/bz/prefab/special/texture/'+resStr,cc.SpriteFrame,function (err,res) {
            if (err) {
                cc.log(err);
                return;
            }
            self.nameSprite.getComponent(cc.Sprite).spriteFrame  = res;
        });

        let handCard = userdata["handcard"];
        // for(let index = 0;index < handCard.length;index++)
        // {
        //     handCard[index] = SssManager.getCardTypeNum(parseInt(handCard[index]).toString(16));
        // }
        //整理出组合好的牌
        let pokers = [];
        let dataIndex = 0;
        for(let i = 0;i < 3 ;i++)
        {
            let dun = userdata["dun"+i+"ar"];
            for(let index = 0;index < dun.length;index++)
            {
                let pokerIndex = parseInt(dun[index]);
                pokers[dataIndex] = handCard[pokerIndex];
                dataIndex++;
            }
        }
        
        for(let i = 0;i < 8;i++)
        {
            let poker = this.pokersNode.children[i];
            //type 2,4为红的
            let pokerController = poker.getComponent("sss4Poker");
            pokerController.init(SssManager.pokersAtlas,{data:pokers[i],index:i});
        }

        let animState = this.animation.play();
        this.animationNode.active = true;
        this.scheduleOnce(function(){
            let animState2 = self.animationNodeAnimation.play("sssSpecialFrame_"+animationFrameIndex);
            animState2.wrapMode = cc.WrapMode.Normal;
            animState2.repeatCount = 1;
        }, 0.8);
    },



    // onShowTest:function(userdata)
    // {
    //     this.node.active = true;
    //     let self = this;
    //     let resStr;
    //     let animationFrameIndex = 1;

    //     resStr = "qld";
    //     animationFrameIndex = 5;

    //     let specialtype = 12;
    //     resStr = "s_"+specialtype;
       
    //     if(specialtype <= 12)
    //     {
    //         animationFrameIndex = 3;
    //     }else if(specialtype <= 17)
    //     {
    //         animationFrameIndex = 4;
    //     }else if(specialtype <= 22)
    //     {
    //         animationFrameIndex = 3;
    //     }else if(specialtype <= 24)
    //     {
    //         animationFrameIndex = 4;
    //     }else {
        
    //     }
        
    //     if(resStr == 'qld'){
    //         SssManager.soundCtrl.playSound("resources/style/fuyang/bzSound/fanche.mp3");
    //     }else{
    //         SssManager.soundCtrl.playSound("resources/style/fuyang/bzSound/tpai_"+specialtype+".mp3");
    //     }

    //     cc.loader.loadRes('shisanshui/sss4/prefab/special/texture/'+resStr,cc.SpriteFrame,function (err,res) {
    //         if (err) {
    //             cc.log(err);
    //             return;
    //         }
    //         self.nameSprite.getComponent(cc.Sprite).spriteFrame  = res;
    //     });

    //     // let handCard = userdata["handcard"];
    //     // for(let index = 0;index < handCard.length;index++)
    //     // {
    //     //     handCard[index] = SssManager.getCardTypeNum(parseInt(handCard[index]).toString(16));
    //     // }
    //     // //整理出组合好的牌
    //     // let pokers = [];
    //     // let dataIndex = 0;
    //     // for(let i = 0;i < 3 ;i++)
    //     // {
    //     //     let dun = userdata["dun"+i+"ar"];
    //     //     for(let index = 0;index < dun.length;index++)
    //     //     {
    //     //         let pokerIndex = parseInt(dun[index]);
    //     //         pokers[dataIndex] = handCard[pokerIndex];
    //     //         dataIndex++;
    //     //     }
    //     // }
    //     //
    //     // for(let i = 0;i < 13;i++)
    //     // {
    //     //     let pokerData = pokers[i];
    //     //     let poker = this.pokersNode.children[i];
    //     //     //type 2,4为红的
    //     //     let type = pokerData[0];
    //     //     let num  = pokerData[1];
    //     //     let pokerController = poker.getComponent("sss1Poker");
    //     //     pokerController.init(SssManager.pokersAtlas,{num:num,type:type});
    //     // }


    //     let animState = this.animation.play();
    //     this.animationNode.active = true;
    //     this.scheduleOnce(function(){
    //         let animState2 = self.animationNodeAnimation.play("sssSpecialFrame_"+animationFrameIndex);
    //         animState2.wrapMode = cc.WrapMode.Normal;
    //         animState2.repeatCount = 1;
    //     }, 0.8);
    // },
});
