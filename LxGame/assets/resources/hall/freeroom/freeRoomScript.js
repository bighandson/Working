var LoadGame = require('LoadGame')
var config = require('Config');

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
        pageView :cc.PageView,
        listView1: cc.Node,
        listView2: cc.Node,
    },


    // use this for initialization
    onLoad: function () {

    },
    scroll :function(index){
        cc.log(index)
        this.pageView.scrollToPage(index)
    },

    change:function(){
        cc.log(this.pageView.getCurrentPageIndex())
	    this.pageView.getCurrentPageIndex() ? this.change0():this.change1()
    },


    //初始化参数
    initData: function (callback,change0,change1) {
        this.removeCallBack = callback;
        this.change0 = change0;
	    this.change1 = change1;
        let self = this;
        let loadBtn = null
        loadBtn = function (index) {
            if (index >= config.sort.length) {
                // 最后添加敬请期待
                // loadPrefab("hall/freeroom/gameFreeBtn", function (module) {
                //     getSpriteFrameByUrl("hall/freeroom/texture/jqqd", function (err, spriteFrame) {
                //         if (err) {
                //             cc.log(err);
                //             return;
                //         }
                //         module.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                //     });
                //     module.parent = self.listView;
                // })
                return;
            }

            let gameid = config.sort[index];
            if(gameid <100){
                loadPrefab("hall/freeroom/gameFreeBtn", function (module) {
                    getSpriteFrameByUrl("hall/freeroom/texture/"+gameid, function (err, spriteFrame) {
                        if (err) {
                            cc.log(err);
                            return;
                        }
                        module.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    // module.parent = self.listView1
                    module.parent = (index<8 ?  self.listView1: self.listView2);
                    loadBtn(index + 1);
                })
            }else{
                let info = config.games[gameid];

                loadPrefab("hall/freeroom/gameFreeBtn", function (module) {

                    getSpriteFrameByUrl("hall/freeroom/texture/" + info.freeroombtnPath, function (err, spriteFrame) {
                        if (err) {
                            cc.log(err);
                            return;
                        }
                        module.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });

                    module.on(cc.Node.EventType.TOUCH_END, function (event) {
                        self.onClickGame(gameid)
                    });

                    module.info = info
                    // module.parent = self.listView1
                    module.parent = (index<8 ?  self.listView1: self.listView2);

                    loadBtn(index + 1);
                })
            }
        }
        loadBtn(0)
    },

    // 点击返回
    onClickBack: function () {

        this.node.removeFromParent(true);

        if (this.removeCallBack) {
            this.removeCallBack()
        }
    },

    onClickGame: function (gameid) {
        let self = this;
        var myDate = new Date()
        cc.log('进入游戏',myDate.getMinutes(),myDate.getTime())
        LoadGame.getFreeRoomList(gameid, '', function (err, data) {
            if (err) {
                cc.log(err, data);
                showAlertBox(data)
                return
            }
            self.data = data;
            self.node.runAction(cc.fadeOut(0.3))
            cc.find('Canvas').runAction(cc.sequence(cc.fadeOut(0.3), cc.callFunc(function () {
                cc.director.loadScene('gameScene', function (err) {
                    if (err) {
                        cc.log(err);
                        hideLoadingAni();
                        return;
                    }
                    let gameScript = cc.find('Canvas').getComponent('gameScript')
                    cc.log(data[0])
                    gameScript.enterTable(gameid, data[0].address.split(':')[0], data[0].port)
                });
            })));

        })
    }
})

