
var config = require('Config')

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
        leftNode  : cc.Node,
        rightNode : cc.Node,
        prebPtah  : [cc.Label],
    },

    // use this for initialization
    onLoad: function () {
        
        let loadContent = null

        let self = this;

        // 右边内容列表
        this.rights = {};

        loadContent = function (index) {
            if (index >= config.sort.length) {
                let gameid =  JSON.parse(cc.sys.localStorage.getItem(config.jgm+'lastGame'))
                let jiyiindex = 0;
                cc.log(gameid)

                self.leftNode.getChildren().forEach(function(item,index) {
                    cc.log(item.info.gameid == gameid)
                    if( item.info.gameid == gameid){
                        jiyiindex = index;
                    }
                })
                cc.log(jiyiindex)
                self.onchooseTap(jiyiindex)
                return;
            }

            let gameid = config.sort[index];
            if(gameid<100){
                // let info = config.games[gameid];
                loadPrefab("style/commonPreb/gameBtn", function (module) {
                    module.parent = self.leftNode;
                    module.active = false
                    module.info = {};
                    module.info.gameid = 0;
                    loadContent(index + 1);
                })
            }else{
                let info = config.games[gameid];

                loadPrefab("style/commonPreb/gameBtn", function (module) {
                    // module.getComponent('tableScript').setData(info, gameid);

                    module.getChildByName('nochoose').getChildByName('name').getComponent(cc.Label).string = info.name

                    module.getChildByName('choose').getChildByName('name').getComponent(cc.Label).string = info.name

                    module.on(cc.Node.EventType.TOUCH_START, function (event) { self.onchooseTap(index) });

                    module.info = info

                    module.parent = self.leftNode;

                    loadContent(index + 1);
                })
            }


        }

        loadContent(0)
    },
    onchooseTap : function (indexs) {
        let self = this;

        self.rightNode.getChildren().forEach(function(item,index) {
            item.active = false;
        })

        this.leftNode.getChildren().forEach(function(item,index) {
            item.getChildByName('choose').active = indexs == index;

            let gameid = item.info.gameid

            if (index == indexs) {
                self.gameid = gameid;
                if (!self.rights[gameid]) {
                    loadPrefab("hall/friendroom/create/" + config.games[gameid].createRoomPreb, function (module) {
                        module.parent = self.rightNode;
                        self.rights[gameid] = module;
                    })
                }else{
                    self.rights[gameid].active = true;
                }   
            }    
        });
    },
    
});
