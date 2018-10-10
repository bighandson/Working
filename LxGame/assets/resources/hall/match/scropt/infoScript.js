var LoadGame = require('LoadGame');

var config = require('Config');


cc.Class({
    extends: cc.Component,

    properties: {
        jl1 : cc.Label,
        jl2 : cc.Label,
        jl3 : cc.Label,
        jl4 : cc.Label,
	      jl5 : cc.Label,
        bs1 : cc.Label,
        bs2 : cc.Label,
        bs3 : cc.Label,
        bs4 : cc.Label,
        bs5 : cc.Label,
        bmBtn : cc.Node,
        ksBtn : cc.Node,
        tags : [cc.Node],
        pags : [cc.Node],
        pag3 : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});
    },

    choose : function (event,num) {
        for (var i = 0; i < this.tags.length; i++) {
            this.tags[i].active = false
            this.pags[i].active = false
        }

        this.tags[parseInt(num)].active = true
        this.pags[parseInt(num)].active = true
    },

    initRuleData : function (text) {
        let tt = []

        let textObject = JSON.parse(text)

        for (var key in textObject) {
            tt.push({'name' : key,'desc' : textObject[key]})
        }


        let self = this

        let loadCell = function (index) {

            if (index > tt.length - 1) {
                return
            }

            let info = tt[index]

            loadPrefab("hall/match/rulecell", function (module) {

                module.getChildByName('desc').getComponent(cc.Label).string = info.desc
                
                module.getChildByName('desc').getChildByName('name').getComponent(cc.Label).string = info.name

                module.parent = self.pag3

                loadCell(index + 1)
            })
        }

        loadCell(0)
    },

    initData : function (data,info,modules) {
        this.jl1.string = data.jlxxlist[0].jlms
        this.jl2.string = data.jlxxlist[1].jlms
        this.jl3.string = data.jlxxlist[2].jlms
        this.jl4.string = data.jlxxlist[3].jlms
	      this.jl4.node.parent.getComponent(cc.Label).string =data.jlxxlist[3].mc

        if(!!data.jlxxlist[4]){
	        this.jl5.string = data.jlxxlist[4].jlms
	        this.jl5.node.parent.getComponent(cc.Label).string =data.jlxxlist[4].mc
        }else{
	        this.jl5.node.parent.active = false
        }


        this.bs1.string = data.bsmc
        this.bs2.string = data.ksbssj
        this.bs3.string = data.ksbstj
        this.bs4.string = data.bsbmfy
        this.bs5.string = config.getGameById(data.gameid).name
        
        this.bmBtn.active = data.isbm == 0
        this.ksBtn.active = data.isbm != 0

        // this.bmBtn.active = false
        // this.ksBtn.active = false

        this.initRuleData(data.bsrule)

        this.choose(null,0)
        this.matchInfo = info
        this.cellModules = modules
    },

    onClose : function () {
        this.node.removeFromParent(true);
    },

    clickBsRule : function () {

        let self = this

        showLoadingAni()
        loadPrefab("hall/match/matchRule", function (module) {
            hideLoadingAni()

            module.getComponent('matchRuleScript').initData(self.ruleText)

            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },

    clickStart : function () {
        let address = this.matchInfo.address.split(":")
        LoadGame.LoadMatch(this.matchInfo.gameid,address[0],address[1])
    },

    bm : function () {
        let self = this
        PomeloClient.request('user.userHandler.post',{
            url : 'bs1010',
            data : {
                userid : UserCenter.getUserID(),
                lsh : this.matchInfo.lsh,
            }
        },function (data) {
            hideLoadingAni()
            cc.log('赛事报名请求结果:',data)
            if(data.code == 200 && data.result.status){
                if(!!data.result.results.length){
                    if (data.result.results[0].zt == '0') {  // 报名成功
                        self.bmBtn.active = false
                        self.ksBtn.active = true
                        self.cellModules.getChildByName('btn').getChildByName('bms1').active = false
                        self.cellModules.getChildByName('btn').getChildByName('bms2').active = true
                        showAlert('恭喜,报名成功!')
                        let list = [{'zhlx':data.result.results[0].zhlx,'zhye':data.result.results[0].zhye}]
                        UserCenter.setList(list)
                        GlobEvent.emit('update_UserCenter');
	                      GlobEvent.emit('Baoming',{lsh:self.matchInfo.lsh});
                    }else if (data.result.results[0].zt == '2') {  // 金币不足
                        showAlertBox(data.result.message,function () {
                            loadPrefab("hall/shop/shop", function (module) {
                                module.getComponent('shopScript')._selectToggle(''+0)

                                module.x = cc.winSize.width / 2;
                                module.y = cc.winSize.height / 2;
                                module.parent = cc.director.getScene();

                                module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
                            });
                        })
                    }
                }else{
                    showAlertBox('暂无赛事信息!')
                }
            }else {
                showAlertBox(data.result.message)
            }
        });
    },

    clickBm : function () {
        let self = this;
        var callbm = function (info) {
            if (info.bmfy > 0) {
                var bbegan = (info.flag & 2) == 0 ? '金币' : '钻石'
                showAlertBox('是否花费  '+ info.bmfy + bbegan + '  报名' + info.mc + '?',function () {
                    self.bm(info,module)
                },function () {})
                return
            }
            self.bm(info,module)
        }

        if ((this.matchInfo.flag &1)!= 0 && !UserCenter.getUserInfo().bdbz) {
            loadPrefab("hall/match/bdphone", function (module1) {
                module1.getComponent('renzhenScript').initData(function () {
                    callbm(this.matchInfo)
                })
                module1.x = cc.winSize.width / 2;
                module1.y = cc.winSize.height / 2;
                module1.parent = cc.director.getScene();

                module1.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
            });
            return
        }

        callbm(this.matchInfo)
    },

});
