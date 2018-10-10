var LoadGame = require('LoadGame');
const SSSCommand = require("SSSCommand");

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...

        alertText:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.arr = ["三顺","金抛","炸弹","四对子","一条龙","双金抛","三金抛","双炸弹","一条金龙"];
    },

    onShow:function(type,acard,change)
    {
        this.change = change || null;
        this.acard = acard;
        let str = this.arr[type - 5];
        this.node.parent.active = true;
        this.alertText.getComponent(cc.RichText).string = "<color=#A4C4D9>出现特殊牌型</c><color=#CBC07E>"+str+"</c><color=#A4C4D9>，</c> \n<color=#A4C4D9>是否按照特殊牌型出牌</c>"
    },

    onOkClick:function()
    {
        if(this.change != null){
            this.change.hide();
        }
        this.hide(1);
        SssManager.controller.showMyPokersSpecialCallback(this.acard);
    },

    onCancelClick:function()
    {
        this.hide(2);
        //SssManager.controller.showChangeDialog(this.acard);
    },

    /**
     *
     * @param type 1= 使用特殊牌型 ;2 = 自己组牌
     */
    hide:function(type)
    {
        if(type == 1)
        {
            PomeloClient.request(LoadGame.getCurrentGame().server + ".CMD_Command",
                {
                    cmd : SSSCommand.REQ_CMD.CMD_IS_SPECIAL,
                    data : {
                        userid:UserCenter.getUserID(),
                        type:type,
                    }
                }
                ,function (data) {
                    cc.log(data);
                });
        }
        this.node.parent.active = false;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
