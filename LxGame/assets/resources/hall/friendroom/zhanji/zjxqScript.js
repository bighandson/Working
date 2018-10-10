var config = require('Config')
var LoadGame = require('LoadGame');
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
        roomId      : cc.Label,
        time        : cc.Label,
        nickName    : cc.Node,
        zongfen     : cc.Node,
        view        : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.zhuan = {}
    },

    initInfo : function (data,info) {
        cc.log(info)
        this.roomId.string = info.fjhm;
        this.time.string   = info.jyrq;

        this.nickName.getChildren().forEach(function (item,index) {
            if(!!data[0].ifgrxxList[index]){
                item.active = true;
                item.getComponent(cc.Label).string = formatName(data[0].ifgrxxList[index].nc,8)
            }else{
                item.active = false;
            }
        })

        this.zongfen.getChildren().forEach(function (item,index) {
            if(!!data[0].ifgrxxList[index]){
                item.active = true;
                item.getComponent(cc.Label).string = data[0].ifgrxxList[index].ye
            }else{
                item.active = false;
            }
        })


        let loadCent = null

        let self = this;
        let game = config.getGameById(info.gameid);
        loadCent = function (Index) {
            cc.log(data[0])
            let len = info.mxbc
            if (Index >= len) {
                return;
            }

            loadPrefab("hall/friendroom/zhanji/zjCent", function (module) {
                module.getChildByName('fenshu').getChildren().forEach(function (item,index) {
                    if( !!data[0].ifgrxxList[index]){
                        item.active = true
                        item.getComponent(cc.Label).string =  data[0].ht[Index+1+'' +data[0].ifgrxxList[index].userid]
                    }else{
                        item.active = false
                    }
                })

                module.getChildByName('jushu').getComponent(cc.Label).string = '第'+(Index+1) +'局'
                module.getChildByName('fupan').active = !game.nofupan
                module.getChildByName('fupan').on(cc.Node.EventType.TOUCH_START, function () {
                    cc.log('战绩流水:',info.gameid,Index+1,info.lsh);
                    showLoadingAni();
                    pomelo.request('mjcard.cardHandler.getRecord',{
                        gameid : info.gameid,
                        mxbc : Index+1,
                        roomStr : info.lsh,
                    },function (data) {
                        cc.log(data);
                        if(data.code != 200 || !data.record.length){
                        hideLoadingAni();
                            showAlertBox('该复盘不存在或已被删除');
                            return;
                        }

                        LoadGame.setFupanGameId(info.gameid)

                        cc.director.loadScene(game.gameScene,function (err) {
                            if(err){
                                cc.log(err);
                                return;
                            }
                            let controller = cc.find('Canvas/controller');
                            var recordController = controller.addComponent(game.record);
                            cc.log(1,info.ruleFlag)
                            recordController.init(data.record[0],info.ruleFlag);
                        });
                    });
                });

                module.parent = self.view;

                loadCent(Index + 1);
            })
        }

        loadCent(0)
    },

    onclose : function () {
        this.node.removeFromParent()
    },
});
