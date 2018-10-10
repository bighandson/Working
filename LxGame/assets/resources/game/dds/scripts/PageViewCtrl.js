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
        gutou:{
            default:[],
            type:cc.Sprite
        }


        
    },

    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
    onPageEvent (sender, eventType) {
        // 翻页事件
        if (eventType !== cc.PageView.EventType.PAGE_TURNING) {
            return;
        }
        // console.log("当前所在的页面索引:" + sender.getCurrentPageIndex());
        var self = this;
        if (sender.getCurrentPageIndex()==0){
            cc.loader.loadRes("img/gulv11", cc.SpriteFrame, function (err, spriteFrame) {
                for(let i=0;i<6;i++){
                    self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }
            });
        }
        if (sender.getCurrentPageIndex()==1){
            cc.loader.loadRes("img/gulv22", cc.SpriteFrame, function (err, spriteFrame) {
                for(let i=0;i<6;i++){
                    self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }
            });
        }
        if (sender.getCurrentPageIndex()==2){
            cc.loader.loadRes("img/gulv33", cc.SpriteFrame, function (err, spriteFrame) {
                for(let i=0;i<6;i++){
                    self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
                }
            });
        }
    }
});
