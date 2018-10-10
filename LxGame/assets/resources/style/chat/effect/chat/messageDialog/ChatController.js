// var CfgChat = require("CfgChat");
const CfgGame = require("CfgGame");
var LoadGame = require('LoadGame');

cc.Class({
    extends: cc.Component,

    properties: {
        messageDialogPrefab:cc.Prefab,
        messageItemPrefab:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START,this.onMessageClickStart,this);

        this.controller = cc.find('Canvas/controller');
        //聊天监听
        pomelo.on('RCMD_Chat', this.RCMD_Chat.bind(this));
    },

    onDestroy:function(){
        pomelo.removeAllListeners('RCMD_Chat');
    },

    onMessageClickStart:function(){
        if(this.isClickClose)
        {
            cc.log("onMessageClickStart/////// return");
            this.isClickClose = false;
            return;
        }

        cc.log("onMessageClickStart " + this.isClickClose);
        if(!this.messageDialog)
        {
            this.messageDialog = cc.instantiate(this.messageDialogPrefab);
            //初始化pos
            this.messageDialogInit();
        }
        cc.log("onMessageClickStart");
        this.messageDialog.active = true;
    },

    messageDialogInit:function() {
        if(LoadGame.getCurrentGame().gameid == 306||LoadGame.getCurrentGame().gameid == 307){
            this.messageDialog.setPosition( cc.v2(this.messageDialog.x-329,this.messageDialog.y+100));
        }else if(LoadGame.getCurrentGame().gameid == 320){
            this.messageDialog.setPosition( cc.v2(this.messageDialog.x-359,this.messageDialog.y+100));
        }else{
            this.messageDialog.setPosition( cc.v2(this.messageDialog.x-349,this.messageDialog.y));
        }


        // 载入config 配置坐标
        let pos = LoadGame.getCurrentGame().chatNodePos
        if (pos) {
            this.messageDialog.setPosition( cc.v2(pos.x,pos.y));
        }

        let MJLanguageSound = parseInt(cc.sys.localStorage.getItem('MJLanguageSound'))||0;
        let game = LoadGame.getCurrentGame();
        if(game.cfgchat) {
            var CfgChat = require(game.cfgchat);
        }else {
            var CfgChat = require("CfgChat");
        }
        this.messageDialog.parent = this.node;
        this.contentLook = this.messageDialog.getChildByName("contentLook");
        this.content = this.messageDialog.getChildByName("content");

        //加载语句
        for (let index = 0; index < CfgChat.chatData.length; index++) {
            this.addItem(index, CfgChat.chatData[index]);
        }

        //初始化表情
        let contentLayout = this.contentLook.getChildByName("view").getChildByName("content");
        for (let i = 1; i <= contentLayout.childrenCount ; i++)
        {
            let lookLayout = contentLayout.getChildByName("look"+i+"Layout");
            for(let j = 1;j <= lookLayout.childrenCount ; j++)
            {
                let lookNode = lookLayout.getChildByName("look"+j+"Node");
                lookNode.cmdIdx = (i-1)*4+j+100;
                lookNode.on(cc.Node.EventType.TOUCH_END,this.onItemSelect,this);
            }
        }

        let btnToggleGroup =this.messageDialog.getChildByName("btnToggleGroup");
        for (let i = 1; i <= btnToggleGroup.childrenCount; i++)
        {
            let toggle = btnToggleGroup.getChildByName("toggle"+i);
            toggle.index = i;
            toggle.on("toggle",this.onToggle.bind(this),this)
        }

        let closeNode = this.messageDialog.getChildByName("closeNode");
        closeNode.on(cc.Node.EventType.TOUCH_START,this.onClickClose,this);

    },

    onClickClose:function(event)
    {
        cc.log("onClickClose");
        this.isClickClose = true;
        this.messageDialog.active = false;
    },

    onToggle:function(event)
    {
        if(event.currentTarget.index ==  1)
        {
            this.contentLook.active = true;
            this.content.active = false;
        }else {
            this.contentLook.active = false;
            this.content.active = true;
        }
    },

    RCMD_Chat:function(data){
        //表情或者文字
        //牌桌上显示
        cc.log("RCMD_Chat");
        //如果有多个需要加入队列

        this.controller.emit("SHOW_CHAT_MSG",data);
    },


    addItem:function(cmdIdx,string){
        let item  =  cc.instantiate(this.messageItemPrefab);
        item.cmdIdx = cmdIdx;
        item.content = string;
        item.children[0].getComponent(cc.Label).string = string;
        item.parent = this.messageDialog.getChildByName("content").getChildByName("view").getChildByName("content");
        item.on(cc.Node.EventType.TOUCH_END,this.onItemSelect,this);
    },

    onItemSelect:function(e){
        if(this.nextCd && this.nextCd > getTimestamp())
        {
            showAlert(CfgGame.alertData.CHAT_CD);
            return;
        }else
        {
            this.nextCd = getTimestamp() + CfgGame.cdData.CD_TIME;
        }
        this.messageDialog.active = false;
        //发送请求
        PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Chat",{chatId : e.currentTarget.cmdIdx},function (data) {
            cc.log(data);
        });
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
