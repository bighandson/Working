

cc.Class({
    extends: cc.Component,

    properties: {
        slider : cc.Slider,
        progressBar : cc.ProgressBar
    },

    // use this for initialization
    onLoad: function () {

    },
    
    onClickSlider : function () {
         this.progressBar.progress=this.slider.progress;

    },
    
    setSlider : function(v){
        this.progressBar.progress=this.slider.progress = v;
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
