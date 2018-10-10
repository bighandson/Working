var LoadGame = require('LoadGame');
cc.Class({
    extends: cc.Component,

    properties: {
        inputLabel: [cc.Label],    // 输入内容
    },

    // use this for initialization
    onLoad: function () {
        for (var i = this.inputLabel.length - 1; i >= 0; i--) {
            this.inputLabel[i].node.active = false
        }

        this.inputIndex = 0
    },


    // 小键盘点击事件处理
    onClickNum: function (event, num) {
        cc.log("event", num)
        if (num == 10) {
            for (var i = this.inputLabel.length - 1; i >= 0; i--) {
                this.inputLabel[i].node.active = false
            }
            this.inputIndex = 0
        } else if (num == 11) {
            if (this.inputIndex == 0) {
                return;
            }
            this.inputIndex -= 1
            this.inputLabel[this.inputIndex].string = '';
            this.inputLabel[this.inputIndex].node.active = false;
        } else {
            if (this.inputIndex >= 6) {  // 发送请求
                return;
            }
            this.inputLabel[this.inputIndex].string = num;
            this.inputLabel[this.inputIndex].node.active = true;

            this.inputIndex += 1;

            if (this.inputIndex >= 6) {  // 发送请求

                let password = ''
                for (var i = 0; i <= this.inputLabel.length - 1; i++) {
                    password = password + this.inputLabel[i].string
                }

                LoadGame.joinCardRoom(password)
            }
        }

    },
})
