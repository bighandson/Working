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
        viewNode   : [cc.Node],
        nodeName   : [cc.String],
    },


    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});

        // 初始化界面 显示第一标签 创建房间
        this.onchooseTap(0)
    },

    onClose : function () {
        this.node.removeFromParent(true);
        GlobEvent.emit('hideZJInfo')
    },

    onchooseTap : function (indexs) {
        GlobEvent.emit('hideZJInfo')
        let self = this;
        this.viewNode.forEach(function(item,index) {  
            item.active = indexs == index;
            if (index == indexs && self.viewNode[index].getChildrenCount() == 0) {
                loadPrefab("hall/friendroom/"+self.nodeName[index], function (module) {
                    module.parent = self.viewNode[index];
                })
            }
        });   
    },

    // 切换标签页
    onToggle : function (event,indexInput) {
        this.onchooseTap(indexInput) 
    }
});
