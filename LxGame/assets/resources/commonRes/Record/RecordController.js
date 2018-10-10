//var MJRecordController = require('MJRecordController');

cc.Class({
    extends: cc.Component,

    properties: {
        playSprite     : cc.Sprite,
        playTexture    : cc.SpriteFrame,
        stopTexture    : cc.SpriteFrame,
        progressSlider : cc.Node,
        progressBar    : cc.ProgressBar,
        kuaitui        : cc.Node,
        kuaijin        : cc.Node,
        tui        : cc.Node,
        jin        : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.step=0;
        this.i=0;
        this.node.on(cc.Node.EventType.TOUCH_START,this.change,this);
        // let fupanprogress = this.progressSlider.getComponent('recordctrl');
        // fupanprogress.getshujus(this.mjrecord,this.data);
    },
    //获得数据
    getshuju:function (mjrecord,data) {
        this.mjrecord = mjrecord;
        this.data = data;
    },
    // 修改播放状态
    onPlayStop : function () {
        this._playButtonChange(!this.isStop);
    },

    /**
     * 修改状态
     */
    _playButtonChange : function (bStop) {
        if(this.isStop == bStop) return;
        this.isStop = bStop;
        if(this.isStop){
            this.playSprite.spriteFrame = this.stopTexture;
            this.mjrecord.pause();
        }else{
            this.playSprite.spriteFrame = this.playTexture;
            this.mjrecord.resume();
        }

        // var event = new cc.Event.EventCustom();
    },
    lastplay : function () {
        this.playSprite.spriteFrame = this.stopTexture;
        this.mjrecord.pause();
        this.mjrecord.lastStep();
    },
    nextplay : function () {
        this.playSprite.spriteFrame = this.stopTexture;
        this.mjrecord.pause();
        this.mjrecord.nextStep();
    },
    quickyNext : function () {
        this.playSprite.spriteFrame = this.playTexture;
        this.mjrecord.quicklyNext();
    },
    quickyLast : function () {
        this.playSprite.spriteFrame = this.stopTexture;
        this.mjrecord.pause();
        this.mjrecord.quicklyLast();
    },
    change : function () {
        if (this.i==0){
            this.node.opacity=0;
            this.kuaijin.active=false;
            this.kuaitui.active=false;
            this.jin.active=false;
            this.tui.active=false;
            this.playSprite.node.active=false;
            this.i=1;
        }else if (this.i==1){
            this.node.opacity=255;
            // this.kuaijin.active=true;
            // this.kuaitui.active=true;
            // this.jin.active=true;
            // this.tui.active=true;
            this.playSprite.node.active=true;
            this.i=0;
        }

    }
    // progerssBarChange : function () {
    //     var progress = this.progressSlider.progress;
    //         if (progress==1){
    //             this.step==this.data.steps.length
    //         }
    //         if (progress==0){
    //             this.step==0
    //         }
    //         cc.log('progress:',progress);
    //     this.mjrecord.RCMD_ActData(progress*this.data.steps.length);
    //     let fupanprogress = this.progressSlider.node.getComponent('SliderProgress');
    //     fupanprogress.setSlider(progress);
    // }
});
