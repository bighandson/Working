
cc.Class({
    extends: cc.Component,

    properties: {
        inputLabel : cc.Label,    // 输入内容
        inputNode : cc.Node,      // 小键盘
        TipsTxt : "",  // 输入框提示,
        mask : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        this.mask.active = false;

        this.mask.on(cc.Node.EventType.TOUCH_START, function (event) {
            let touches = event.getTouches();
            let touchLoc = touches[0].getLocation();
            let point = cc.p(touchLoc.x - 1334/2,touchLoc.y - 750/2)

            if (!cc.rectContainsPoint(self.inputNode.getBoundingBox(),point)   ||  !cc.rectContainsPoint(self.inputLabel.node.getBoundingBox(),point)) {
                self.onCloseNumNode();
            }
        });


        this.inputNode.active = false;
        this.mask.active = false;
        if (this.TipsTxt != '') {
            this.inputLabel.string = this.TipsTxt;
        }


        var closeEvent = function () {
            if (this.inputNode.active) {
                self.onCloseNumNode();
            }
        }

        GlobEvent.on('onCloseInputNode',closeEvent.bind(this))

        this.cleanup = function () {
            GlobEvent.removeListeners('onCloseInputNode',closeEvent)
        }
    },
    setPromoter:function (num) {
        cc.log(num)
        this.maxNum = num;
    },

    // 点击输入控件  获取或者清除焦点
    onClickInput : function () {
        cc.log("onClickInput")
        GlobEvent.emit('onCloseInputNode');

        if (!this.inputNode.active ) {
            this.inputLabel.string = "";
        }

        if (this.inputNode.active) {
            this.onCloseNumNode();
            return;
        }
        this.inputNode.active = true;
        this.mask.active = true;
    },

    // 小键盘点击事件处理
    onClickNum : function (event,num) {
        let maxNum = this.maxNum || 8
        if (num == 10) {
            this.inputLabel.string = "";
            // this.onCloseNumNode()
        }else if(num == 11){
            this.onCloseNumNode()
            // if (this.inputLabel.string.length > 0) {
            //     this.inputLabel.string = this.inputLabel.string.substr(0,this.inputLabel.string.length - 1);
            // }
        }else{
            if(this.inputLabel.string.length < maxNum-1){
                this.inputLabel.string = this.inputLabel.string + num;
            }else if(this.inputLabel.string.length == maxNum-1){
                this.inputLabel.string = this.inputLabel.string + num;
                this.onCloseNumNode();
            }else{
                this.onCloseNumNode();
            }

        }

    },

    // 关闭小键盘
    onCloseNumNode : function () {
        cc.log("onCloseNumNode")
        if (!this.inputNode.active) {
            return;
        }
        this.inputNode.active = false;
        this.mask.active = false;
        if (this.inputLabel.string === "") {
            this.inputLabel.string = this.TipsTxt;
        }
    },
});
