var Porp = require("Prop");
var Property = require('Property');
var LoadGame = require('LoadGame');
var Config = require('Config');
const  CfgGame = require("CfgGame");
cc.Class({
    extends: cc.Component,

    properties: {
        img:cc.Sprite,
        nickname:cc.Label,
        uid:cc.Label,
        propDetails:{
            default:[],
            type:cc.Node
        },
        propNums:{
            default:[],
            type:cc.Node
        },
        closeNode:cc.Node,
    },

    onLoad: function () {
        this.closeNode.on(cc.Node.EventType.TOUCH_START,this.onClickClose,this);
        this.controller = cc.find('Canvas/controller');
    },

    onClickClose:function(event)
    {
        cc.log("onClickClose");
        //去掉监听
        for(let i = 0;i < 4;i++)
        {
            let propDetail= this.propDetails[i];
            let bg = propDetail.getChildByName("bg");
            bg.off(cc.Node.EventType.TOUCH_START,this.clickProp,this);
        }
        this.node.active = false;
    },


    onShow:function(playerInfo,roomType){
        this.node.active = true;

        this.userid =playerInfo.userid;
        this.nickname.string =playerInfo.nick;
        this.uid.string =playerInfo.userid;
        let userImage = playerInfo.userImage;
        if (!isUrl(userImage)){
            let sexs = playerInfo.sex==1?'man':'woman';
            userImage = 'style/{0}/common/head/'.format(Config.resourcesPath)+sexs;
        }
        let img = this.img;
        getSpriteFrameByUrl(userImage,function (err,spriteFrame) {
            if(err) return;
            img.spriteFrame = spriteFrame;
        });

        if(!this.isInitPropDetails)
        {
            this.initPorp(roomType);
        }

        //刷新面框配置
        let userInfo = UserCenter.getUserInfo();
        let bBg = this.node.getChildByName("bBg");
        let sBg = this.node.getChildByName("sBg");
        let propDetails = this.node.getChildByName("propDetails");
        if(userInfo.userid == playerInfo.userid || Config.jgm == "009")
        {
            //玩家自己
            sBg.active = true;
            bBg.active = false;
            propDetails.active = false;
        }else {
            sBg.active = false;
            bBg.active = true;
            propDetails.active = true;
            for(let i = 0;i < 4;i++)
            {
                let propDetail= this.propDetails[i];
                let bg = propDetail.getChildByName("bg");
                bg.on(cc.Node.EventType.TOUCH_START,this.clickProp,this);
            }
        }

        this.loadProp(playerInfo.userid);
    },

    /**
     * 初始化道具配置
     */
    initPorp:function(roomType){

        this.isInitPropDetails = true;
        let self = this;

        Porp.getProplist(function(data1,data2){
            let ret = data2.results;
            cc.log(data2);
            if(ret)
            {
                for(let i = 0;i < ret.length;i++)
                {
                    let propDetail= self.propDetails[i];
                    let obj = ret[i];
                    let nameSprite = propDetail.getChildByName("nameSprite")
                    let imgUrl = "common/effect/dao/texture/prop_name_"+obj.bh;
                    getSpriteFrameByUrl(imgUrl,function (err,spriteFrame) {
                        if(err) return;
                        nameSprite.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });

                    // let logo_big = propDetail.getChildByName("logo_big");
                    // cc.loader.loadRes(obj.pic,cc.SpriteFrame,function (err,spriteFrame) {
                    //     if (err){
                    //         cc.log(err);
                    //         return;
                    //     }
                    //     logo_big.getComponent(cc.Sprite).spriteFrame  = spriteFrame;
                    // })

                    let costBgSprite  = propDetail.getChildByName("costBgSprite");
                    let costLabel = costBgSprite.getChildByName("costLabel");
                    costLabel.getComponent(cc.Label).string =obj.dj;

                    let meiliBgSprite = propDetail.getChildByName("meiliBgSprite");
                    if(parseInt(obj.mlds) == 0)
                    {
                        meiliBgSprite.active = false;
                    }else {
                        let meiliLabel = meiliBgSprite.getChildByName("meiliLabel");
                        meiliLabel.getComponent(cc.Label).string = "魅力+"+obj.mlds;
                    }

                    let bg = propDetail.getChildByName("bg");
                    bg.daobh = obj.bh;
                    bg.cost = obj.dj;
                    if(roomType < 2)
                    {
                        bg.on(cc.Node.EventType.TOUCH_START,self.clickProp,self);
                    }
                }
            }else
            {
                propDetails.active = false;
            }
        });
    },

    clickProp:function(event){
        cc.log(event);
        if(!this.node.active)
        {
            return;
        }
        if(this.nextCd && this.nextCd > getTimestamp())
        {
            showAlert(CfgGame.alertData.DAO_CD);
            return;
        }else
        {
            this.nextCd = getTimestamp() + CfgGame.cdData.CD_TIME;
        }

        if(UserCenter.getYouxibiNum() < event.currentTarget.cost)
        {
            showAlert(CfgGame.alertData.YOUXIBI_LESS)
            return;
        }
        PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Dao",{daobh:event.currentTarget.daobh,ruserid:this.userid,num:1,jgm:Config.jgm},function (data) {
            cc.log(data);
        });
        this.onClickClose();
    },

    /**
     * 加载个人信息
     * @param userid
     */
    loadProp:function (userid) {
        let self = this;
        Property.getProperty(userid,'',function (err,data) {
            if (err) {
                cc.log(err);
                return;
            }
            if(!!data.results){
                var len = data.results.length;
                let ret = data.results;

                for(let i= 0;i<len;i++){
                    let obj = ret[i];
                    let index = parseInt(obj.zhlx)-1;
                    let propNum = self.propNums[index];
                    propNum.getChildByName("number").getComponent(cc.Label).string =obj.ye;
                    // number.string  =obj.ye;
                    // cc.loader.loadRes(obj.slpic,cc.SpriteFrame,function (err,spriteFrame) {
                    //     if (err){
                    //         cc.log(err);
                    //         return;
                    //     }
                    //     propNum.getChildByName("logo").getComponent(cc.Sprite).spriteFrame  = spriteFrame;
                    // });
                }
            }
        });
    },

    onDestroy:function(){
    },
});
