/**
 * Created by xiao cai on 2017/4/28.
 */
cc.Class({
    extends: cc.Component,

    properties: {
        msgLabel : cc.Label,
        closeBtn : cc.Node,
        yellowBtn : cc.Node,
        greenBtn:cc.Node,
        timed:cc.Label,

    },

    onLoad: function (){
    },

    show : function (msg,cb,time) {
        time = time || 0;
        this.node.on(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
        var tStr = time==0?'':time;
        this.msgLabel.string = msg ;
        this.timed.string = tStr;
        this._callback = cb || null;
        this.node.active = true;
    },

    onCancel : function (event) {
        this.node.active = false;
        var self = this
        this.unschedule(this._timeTick)
        if(this._callback){
            this._callback(0);      // cancel
        }
    },

    startCountDown : function (time,cb) {
        time = time || 0;
        if(time === 0){
            return;
        }
        this._time = time;
        //cb = cb || null;
        //var self = this;
        this.schedule(this._timeTick,1,time);
    },

    onOK : function (event) {
        this.node.off(cc.Node.EventType.TOUCH_START,this.onTouchStart,this);
        this.node.active = false;
        this.unschedule(this._timeTick);
        if(!!this._callback){
            this._callback(1);
        }
    },

    onTouchStart : function () {

    },

    showTip:function (msg) {
        this.closeBtn.active = false;
        this.yellowBtn.active = false;
        this.greenBtn.active = false;
        this.msgLabel.string = msg;
    },

    _timeTick : function () {
        this._time -=1;
        this.timed.string = this._time;

        if(this._time < 0){
            this.onCancel();
            // this.node.active = false;
            // if(!!this._callback){
            //     this._callback(0);
            // }
        }
    }

});
