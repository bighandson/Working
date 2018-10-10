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
        leftNode : cc.Node,
        rightNode: cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});
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
                    loadPrefab("style/commonPreb/label", function (module) {
                            
                        self.rightNodechild = module

                        module.width = 600

                        module.getComponent(cc.Label).string = self.tList[index].rightdesc

                        module.parent = self.rightNode;
                    }) 
                }
            }
        }

        loadTitle = function (index) {
            if (index >= config.sort.length) {
                choose(0)
                return;
            }

            let gameid = config.sort[index];

            let info = config.games[gameid];

            loadPrefab("hall/rule/ruleNode", function (module) {
                module.getChildByName('title').getComponent(cc.Label).string = info.name

                module.rightdesc = info.description

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
