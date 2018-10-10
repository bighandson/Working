cc.Class({
    extends: cc.Component,

    properties: {
        anim:cc.Animation
    },

    // use this for initialization
    onLoad: function () {

    },
    speedDown:function () {

        var animState=this.anim.getComponent(cc.Animation).getAnimationState('zhuanpan');
        // if(animState.speed<0.8*4/3){
        //     animState.speed=animState.speed-0.1*4/3;
        // }
        if(animState.speed<=0.5*4/3){
            animState.speed=animState.speed-0.05*4/3;
        }
        if(animState.speed<=0.35){
            animState.speed=0.35;
        }
         animState.speed=animState.speed-0.1*2/3;
    },
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
