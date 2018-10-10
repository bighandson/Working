cc.Class({
    extends: cc.Component,

    properties: {

    },

    // use this for initialization
    onLoad: function () {
        /****xxxx***aaaa****bbbb*****cccc****dddd****/
    },

    /**
     * 取消托管
     */
    onCancelClick:function(){
      
        if (!!window.DdzManager && !!DdzManager.autoplaySign)
            {
	            DdzManager.tuoci  =0;
                DdzManager.autoplaySign = false;
                cc.log("DdzManager.autoplaySign-=",DdzManager.autoplaySign);  
            }   
          
        this.node.parent.active = false;
        GlobEvent.emit('AUTO_PLAY',false);/****xxxx***aaaa****bbbb*****cccc****dddd****/
    },
});
