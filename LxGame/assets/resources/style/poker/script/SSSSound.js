cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        cc.log("SSSSound load");
    },

    playSound : function (url) {
        SettingMgr.playSound(url);
    }

});
