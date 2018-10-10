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
        listNode : cc.Node,
    },

    // use this for initialization
    onLoad: function () {

    },

    initList : function (data) {
        cc.log(data)
        let self = this;
        for (let i = 0; i < data.length; i++) {
            loadPrefab("hall/friendroom/zhanji/zjTitle", function (module) {

                module.getComponent('zjTitleScript').initInfo(data[i])

                module.parent = self.listNode;
            })
        }
    }
    
});
