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
        text : cc.Label,
        view : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});
    },

    onClose : function () {
        this.node.removeFromParent(true);
    },

    initData : function (text) {
        let tt = []

        let textObject = JSON.parse(text)

        for (var key in textObject) {
            tt.push({'name' : key,'desc' : textObject[key]})
        }

        cc.log('------------',tt)

        let self = this

        let loadCell = function (index) {

            if (index > tt.length - 1) {
                return
            }

            let info = tt[index]

            loadPrefab("hall/match/rulecell", function (module) {

                module.getChildByName('desc').getComponent(cc.Label).string = info.desc
                
                module.getChildByName('desc').getChildByName('name').getComponent(cc.Label).string = info.name

                module.parent = self.view

                loadCell(index + 1)
            })
        }

        loadCell(0)
    },
});
