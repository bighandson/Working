

cc.Class({
    extends: cc.Component,

    properties: {
        slider : cc.Slider,
        progressBar : cc.ProgressBar
    },

    // use this for initialization
    onLoad: function () {

    },

    onSlider : function () {
    },
    getshujus : function (mjrecord,data) {
        this.data=data;
        this.mjrecord=mjrecord;
        cc.log(this.data,this.mjrecord);
    },
    setSlider : function(Sender){
        cc.log(this.data,this.mjrecord);
        this.progressBar.progress=this.slider.progress;
        this.mjrecord.RCMD_ActData(Math.round(Sender.progress*this.data.steps.length));
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
