var config = require("Config");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
    },

    // use this for initialization
    onLoad: function () {
        SettingMgr.playBg(config.backMusic);
        this.node.children[1].children[1].getComponent(cc.Label).string = formatNum(UserCenter.getYouxibiNum());
    },
    onClose: function () {
        this.node.removeFromParent(true);
    },
    onClickJinbi: function (event, num) {
        //var path = 'style/style2/prefab/Shop' ;
        loadPrefab("hall/shop/shop", function (module) {
            module.getComponent('shopScript')._selectToggle('0')
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },

    onReturnClick: function () {
        SettingMgr.playSound(config.clickEffect);
        cc.director.loadScene(config.lobbyScene, function (err) {
            if (err) {

                cc.log("载入预制体失败:", path);

                return;
            }
        });
    },
    onHelpClick: function () {
        SettingMgr.playSound(config.clickEffect);
        var path = "game/wabao/prefab/rule";//
        cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
            if (err) {
                cc.log("载入预制体失败:", path);
                return;
            }
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
        });
    },
});
