
var Friend = require('Friend')

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
        input : cc.Label,
        view  : cc.Node,
    },

    addFirendIntoView : function (info,cb) {
        let self = this;

        loadPrefab("hall/friend/ffriend", function (module) {
            
            let preb = module

            preb.getChildByName('name').getComponent(cc.Label).string = formatName(info.nc,8);

            let tx = info.tx || '';
            let sexs = info.xb == 1 ? 'man' : 'woman';
            if (!isUrl(tx)) {
                tx = 'commonRes/other/' + sexs;
            }

            getSpriteFrameByUrl(tx, function (err,spriteFrame) {
                if (err){
                    cc.log(err);
                    return;
                }
                preb.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame
                preb.getChildByName('head').setContentSize(150,150)
            });

            preb.parent = self.view;

            // 点击头像 弹出好友信息界面
            preb.on(cc.Node.EventType.TOUCH_START, function (event) { 
                loadPrefab("hall/friendInfo/friendInfo",function (module) {

                    module.getComponent('friendInfoScript').setData(info,function (info) {
                        self.addFirendIntoView(info)
                    },true)

                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();

                    module.getChildByName('box').scale = 0
                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))

                    hideLoadingAni()
                });
            });

            if (cb) {cb()}
        })
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {});
        showLoadingAni()

        let self = this;

        Friend.getFriendsList('',function (err,data) {
            if (!err) {
                // cc.log("===",data)
                let list = data.results


                let loadPreb = null

                loadPreb = function (index) {
                    if (index >= list.length) {
                        hideLoadingAni()
                        return;
                    }
                    let info = list[index];
                    self.addFirendIntoView(info,function () {
                        loadPreb(index + 1);
                    })
                }
                loadPreb(0)
            }
        })
    },

    // 返回大厅
    onClickBack: function () {
        this.node.removeFromParent(true);
    },

    //点击搜索
    onClickSearch : function () {
        let friendId = parseInt(this.input.string)

        if (!friendId ) {
            showAlertBox('搜索ID不能为空')
            return;
        }

        let self = this;
        
        Friend.SceachFriends(friendId,'',function (err,data) {
            if (!err) {
                showLoadingAni()
                let info = data.results[0]

                loadPrefab("hall/friendInfo/friendInfo",function (module) {

                    module.getComponent('friendInfoScript').setData(info,function (infos) {
                        cc.log('addFirendIntoView ==== ',infos)
                        self.addFirendIntoView(infos)
                    })

                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();

                    module.getChildByName('box').scale = 0
                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))

                    hideLoadingAni()
                });

            } else {
                showAlertBox(data)
            }
        })
    }
});
