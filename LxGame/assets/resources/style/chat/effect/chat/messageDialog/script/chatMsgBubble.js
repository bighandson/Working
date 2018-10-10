// var CfgChat = require("CfgChat");
var LoadGame = require('LoadGame');
cc.Class({
    extends: cc.Component,

    properties: {
        node_1: cc.Node,
        node_2: cc.Node,
        label_str: cc.Label,
        label_str_bottom: cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.labelStrX = this.label_str.node.x
        this.controller = cc.find('Canvas/controller');
        // var game = config.getGameById(this.gameid);
        // this.soundCtrl = this.controller.getComponent(LoadGame.getCurrentGame().sound);
    },

    onShow: function (chair, sex, chatId) {
        if (!this.chair) {
            this.chair = chair;
        }
        let game = LoadGame.getCurrentGame();
        if (!!game.cfgchat) {
           var CfgChat = require(game.cfgchat);
        }else{
           var CfgChat = require("CfgChat")
        }
        let gameid = LoadGame.getCurrentGame().gameid;
        let str = CfgChat.chatData[chatId];
        this.label_str.string = str;
        this.label_str_bottom.string = str;
        let width = this.label_str.node.width;
        if (width < 100) {
            //防止width刷新不及时
            width = 400;
        }
        let node;
        let sprite_bg_1;
        let labelX;
        if (gameid == 320) {
            if (chair == 0 || chair == 4 || chair == 5) {
                node = this.node_1;
                this.node_2.active = false;
                labelX = this.labelStrX;
            } else {
                node = this.node_2;
                this.node_1.active = false;
                labelX = this.labelStrX - width + 20;
            }
        } else if(gameid == 311){
	        if (chair == 0 || chair == 2) {
		        node = this.node_1;
		        this.node_2.active = false;
		        labelX = this.labelStrX;
	        } else {
		        node = this.node_2;
		        this.node_1.active = false;
		        labelX = this.labelStrX - width + 20;
	        }
        } else {
            if (chair == 0 || chair == 3) {
                node = this.node_1;
                this.node_2.active = false;
                labelX = this.labelStrX;
            } else {
                node = this.node_2;
                this.node_1.active = false;
                labelX = this.labelStrX - width + 20;
            }
        }

        sprite_bg_1 = node.getChildByName("Sprite_bg_1");
        sprite_bg_1.width = width;
        this.label_str.node.x = labelX;
        this.label_str_bottom.node.x = labelX;
        node.active = true;
        this.scheduleOnce(this.hideChatMsg, 1.5);

        //播放声音

        if (gameid == 154) {
            playChatVoice(sex, chatId + 1, game, chair);
        } else {
            playChatVoice(sex, chatId + 1, game);
        }


    },

    hideChatMsg: function () {
        cc.log("hideChatMsg");
        this.controller.emit("HIDE_CHAT_MSG", this.chair);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
