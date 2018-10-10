var Share = require('Share');

cc.Class({
    extends: cc.Component,

    properties: {
        kefu : cc.Label,
        gongzhong : cc.Label
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});

        GlobEvent.on('WXShare',this.shareCallback.bind(this));

    },

    onClickCopy :function (event,num) { //1客服 2公众号
        if(num ==1){
            Device.copyClipboard(this.kefu.string);
            showAlert('已复制客服号')
        }else{
            Device.copyClipboard(this.gongzhong.string);
            showAlert('已复制公众号')
        }

    },
    // 返回大厅
    onclose: function () {
        this.node.removeFromParent(true);
    },

    // 分享好友
    onClickShareToFriend : function (event,to) {
        Share.shareToWX(0);
    },

    // 分享牌友圈
    onClickShareToFriendGroup : function () {
        Share.shareToWX(1);
    },

    /**
     * 分享回调成功
     */
    shareCallback : function (code) {
        if(code != 0) return;
        Share.checkShare();
    },/****xxxx***aaaa****bbbb*****cccc****dddd****/
});
