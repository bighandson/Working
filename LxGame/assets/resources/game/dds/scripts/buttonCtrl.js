cc.Class({
    extends: cc.Component,

    properties: {
        pageview:{
            default:null,
            type:cc.PageView
        },
        buttonDown:{
            default:null,
            type:cc.Button
        },
        buttonUp:{
            default:null,
            type:cc.Button
        }
    },

    // use this for initialization
    onLoad: function () {
        this.buttonUp.getComponent(cc.Button).interactable=false;
        this.buttonUp.getComponent(cc.Button).enableAutoGrayEffect=true;
    },
    onDown:function () {
        var page=this.pageview.getComponent(cc.PageView);
        this.buttonUp.getComponent(cc.Button).interactable=true;
        var x=page.getCurrentPageIndex()+1;
        page.setCurrentPageIndex(x);
        cc.log(page.getCurrentPageIndex());
        if (page.getCurrentPageIndex()==2){
            this.buttonDown.getComponent(cc.Button).interactable=false;
            this.buttonDown.getComponent(cc.Button).enableAutoGrayEffect=true;
        }

    },
    onUp:function () {
        var page=this.pageview.getComponent(cc.PageView);
        this.buttonDown.getComponent(cc.Button).interactable=true;
        var x=page.getCurrentPageIndex()-1;
        page.setCurrentPageIndex(x);
        cc.log(page.getCurrentPageIndex());
        if (page.getCurrentPageIndex()==0){
            this.buttonUp.getComponent(cc.Button).interactable=false;
            this.buttonUp.getComponent(cc.Button).enableAutoGrayEffect=true;
        }
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
