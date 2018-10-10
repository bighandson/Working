
var Activity = require('Activitylist')

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
        leftNode : cc.Node,
        rightNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});
        // showLoadingAni();

        let self = this;
        Activity.getactivityitem(1,"",function (err,data) {
            if (err) {
                cc.log(err);
                return;
            }
            let res =data.results ;
            let len = res.length;
            cc.log(data);
            if(!!len){
                self.initData(res)
                //showLoadingAni();
                // getSpriteFrameByUrl(self.url,function (err,spriteFrame) {
                //     hideLoadingAni();
                //     cc.log(err,'error');
                //         if (err) return;
                //         self.image.spriteFrame = spriteFrame;
                //         cc.log(self.url);
                // });
            }
        });
    },

    initData : function (data) {

        var loadTitle = null;

        let self = this;

        self.tList = [];

        let choose = function (index) {
            if (self.rightNodechild) { 
                self.rightNodechild.removeFromParent()
            }

            for (var i = 0; i < self.tList.length; i++) {
                self.tList[i].getChildByName('choose2').active = false
                self.tList[i].getChildByName('choose1').active = true
                
                if (index == i) {
                    self.tList[i].getChildByName('choose2').active = true
                    self.tList[i].getChildByName('choose1').active = false

                    if (!isUrl(self.tList[index].rightdesc)) {
                        loadPrefab("style/commonPreb/label", function (module) {
                            
                            self.rightNodechild = module

                            module.width = 600

                            module.getComponent(cc.Label).string = self.tList[index].rightdesc

                            module.parent = self.rightNode;
                        }) 
                    }else{
                        
                        loadPrefab("style/commonPreb/sprite", function (module) {
                            
                            self.rightNodechild = module

                            getSpriteFrameByUrl(self.tList[index].rightdesc, function (err,spriteFrame) {
                                if (err){
                                    cc.log(err);
                                    return;
                                }
                                module.getComponent(cc.Sprite).spriteFrame = spriteFrame
                            });

                            module.parent = self.rightNode;
                        })
                    }
                }
            }
        }

        loadTitle = function (index) {
            if (index >= data.length) {
                choose(0)
                return;
            }
            let info = data[index];

            loadPrefab("hall/notice/noticeNode", function (module) {
                module.getChildByName('date').getComponent(cc.Label).string = info.issue_time
                module.getChildByName('title').getComponent(cc.Label).string = info.notice_title

                module.rightdesc = info.notice_content

                module.on(cc.Node.EventType.TOUCH_START, function (event) { choose(index) });

                self.tList[index] = module;
                module.parent = self.leftNode;
                loadTitle(index + 1);
            })
        }
        loadTitle(0)
    },

    onClose : function () {
        this.node.removeFromParent(true);
    },
});
