
var config = require('Config');
var LoadGame = require('LoadGame');

cc.Class({
    extends: cc.Component,

    properties: {
        jinbi : cc.Label,
        zuanshi : cc.Label,
        btnView : cc.Node,
        cellView : cc.Node,
        tips : cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function (event) {});

        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
	    GlobEvent.on('Baoming',this.baomingShua.bind(this));
        this.updateUsercenter()
    },

	baomingShua:function(data){
        let lsh = data.lsh;
        let self = this;
        for(let item in self.mlist){
            if(self.mlist[item].lsh = lsh){
	            self.mlist[item].isbm = 1;
            }
        }
  },

    // 初始化比赛界面
    initMatch : function (mlist) {
        console.log('mlist-------->>',mlist);
        this.mlist = mlist;

        if (mlist.length == 0) {
            this.tips.active = true
            return
        }

        let self = this

        let loadCell = function (index) {

            if (index > mlist.length - 1) {
                return
            }

            let info = mlist[index]

            loadPrefab("hall/match/cell", function (module) {

                module.parent = self.cellView

                getSpriteFrameByUrl('hall/match/texture/icon' + info.icon, function (err, spriteFrame) {
                    if (err) {
                        cc.log(err);
                        return;
                    }
                    hideLoadingAni()
                    module.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                });

                // 比赛名称
                module.getChildByName('name').getComponent(cc.Label).string = info.mc
                // 报名人数
                module.getChildByName('renshu').getComponent(cc.Label).string = info.bmrs

                // 报名费用
                if (info.bmfy != 0) {
                    module.getChildByName('btn').getChildByName('feiyong').getComponent(cc.Label).string = info.bmfy
                    module.getChildByName('btn').getChildByName('feiyong').getChildByName('jinbi').active = (info.flag & 2) == 0
                    module.getChildByName('btn').getChildByName('feiyong').getChildByName('zuanshi').active = (info.flag & 2) != 0
                }

                module.getChildByName('gameName').getComponent(cc.Label).string = config.getGameById(info.gameid).name

                let time = info.remainSecond
                if (time <= 0) { module.getChildByName('daojishi').active = false }


                let tt = formatDate(time).split(":")
                module.getChildByName('daojishi').getChildByName('hour').getComponent(cc.Label).string = tt[0]
                module.getChildByName('daojishi').getChildByName('min').getComponent(cc.Label).string = tt[1]
                module.getChildByName('daojishi').getChildByName('ss').getComponent(cc.Label).string = tt[2]

                let  updateTime = function () {
                    time --
                    if (time <= 0) {
                        module.getChildByName('daojishi').active = false
                        if (info.isbm == 1) {
                            module.getChildByName('btn').getChildByName('bms1').active = info.isbm != 1
                            module.getChildByName('btn').getChildByName('bms2').active = info.isbm == 1
                        }else{
                            module.getChildByName('btn').active = false
                            module.getChildByName('btn1').active = true
                        }
                        return
                    }
                    let tt = formatDate(time).split(":")
                    module.getChildByName('daojishi').getChildByName('hour').getComponent(cc.Label).string = tt[0]
                    module.getChildByName('daojishi').getChildByName('min').getComponent(cc.Label).string = tt[1]
                    module.getChildByName('daojishi').getChildByName('ss').getComponent(cc.Label).string = tt[2]
                }

                module.getComponent('nullScript').schedule(updateTime,1)

                module.getChildByName('bg').on(cc.Node.EventType.TOUCH_END, function (event){ 
                    if (info.bszt == 1) {
                        self.openMatch(info,module) 
                    }else{
                        showAlertBox('比赛已开始,你没有报名参加该场比赛!')
                    }
                    
                });

                module.getChildByName('btn').on(cc.Node.EventType.TOUCH_END, function (event) {
                    if (info.isbm == 1) {
                        self.matchStart(info)
                    }else{
                        var callbm = function (info) {
                            if (info.bmfy > 0) {
                                var bbegan = (info.flag & 2) == 0 ? '金币' : '钻石'
                                showAlertBox('是否花费  '+ info.bmfy + bbegan + '  报名' + info.mc + '?',function () {
                                    self.matchBm(info,module)
                                },function () {})
                                return
                            }
                            self.matchBm(info,module)
                        }

                        if ((info.flag &1)!= 0 && !UserCenter.getUserInfo().bdbz) {
                            loadPrefab("hall/match/bdphone", function (module1) {
                                module1.getComponent('renzhenScript').initData(function () {
                                    callbm(info)
                                })
                                module1.x = cc.winSize.width / 2;
                                module1.y = cc.winSize.height / 2;
                                module1.parent = cc.director.getScene();

                                module1.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
                            });
                            return
                        }

                        callbm(info)
                    } 
                });

                module.getChildByName('btn').getChildByName('bms1').active = info.isbm != 1
                module.getChildByName('btn').getChildByName('bms2').active = info.isbm == 1

                module.getChildByName('btn').active = info.bszt == 1
                module.getChildByName('btn1').active = info.bszt != 1

                if (info.bszt != 1) {
                    module.getChildByName('btn').active = info.isbm == 1
                    module.getChildByName('btn1').active = info.isbm != 1
                }
                
                loadCell(index + 1)
            })
        }

        loadCell(0)
    },


    // 进入比赛详情界面
    openMatch : function (info,modules) {
        PomeloClient.request('user.userHandler.post',{
            url : 'bs1009',
            data : {
                userid : UserCenter.getUserID(),
                jgm   : config.jgm,
                lsh : info.lsh,
            }
        },function (data) {
            hideLoadingAni()
            cc.log('赛事详情请求结果:',data)
            if(data.code == 200 && data.result.status){
                if(!!data.result.results.length){
                    showLoadingAni()
                    loadPrefab("hall/match/matchinfo", function (module) {
                        hideLoadingAni()

                        module.getComponent('infoScript').initData(data.result.results[0],info,modules)

                        module.x = cc.winSize.width / 2;
                        module.y = cc.winSize.height / 2;
                        module.parent = cc.director.getScene();

                        module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
                    });
                }else {
                    showAlertBox('获取赛事列表为空')
                }
            }else {
                showAlertBox(data.msg)
            }
        });
    },

    //关闭界面
    onclose : function () {
        this.node.removeFromParent(true);
        GlobEvent.removeListener('update_UserCenter', this.updateUsercenter.bind(this));
    },

    // 更新 财富显示
    updateUsercenter: function () {
        if (this.jinbi) {
            this.jinbi.string = formatNum(UserCenter.getUserInfo().youxibiNum);
        }
        if (this.zuanshi) {
            this.zuanshi.string = formatNum(UserCenter.getUserInfo().fangkaNum);
        }
    },

    //点击金币按钮  进入商城中心
    onClickShop: function (event,num) {
        showLoadingAni()
        loadPrefab("hall/shop/shop", function (module) {
            hideLoadingAni()
            module.getComponent('shopScript')._selectToggle(''+num)

            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },

    //点击比赛记录
    onClickRecord: function () {
        showLoadingAni()
        PomeloClient.request('user.userHandler.post',{
            url : 'bs1012',
            data : {
                userid : UserCenter.getUserID(),
            }
        },function (data) {
            hideLoadingAni()
            cc.log('赛事记录请求结果:',data)
            if(data.code == 200 && data.result.status){
                loadPrefab("hall/match/record", function (module) {
                    module.getComponent('recordScript').initdata(data.result.results[0].jllist)

                    module.x = cc.winSize.width / 2;
                    module.y = cc.winSize.height / 2;
                    module.parent = cc.director.getScene();

                    module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))

                    hideLoadingAni()
                });
            }else {
                showAlertBox(data.result.message)
            }
        });  
    },

    matchStart : function (info) {
        let address = info.address.split(":")
        LoadGame.LoadMatch(info.gameid,address[0],address[1])
    },

    matchBm : function (info,modules) {
        let self = this

        PomeloClient.request('user.userHandler.post',{
            url : 'bs1010',
            data : {
                userid : UserCenter.getUserID(),
                lsh : info.lsh,
            }
        },function (data) {
            hideLoadingAni()
            cc.log('赛事报名请求结果:',data)
            if(data.code == 200 && data.result.status){
                if(!!data.result.results.length){
                    if (data.result.results[0].zt == '0') {  // 报名成功
                        modules.getChildByName('btn').getChildByName('bms1').active = false
                        modules.getChildByName('btn').getChildByName('bms2').active = true
                        info.isbm = 1
                        showAlert('恭喜,报名成功!')
                        let list = [{'zhlx':data.result.results[0].zhlx,'zhye':data.result.results[0].zhye}]
                        UserCenter.setList(list)
                        GlobEvent.emit('update_UserCenter');
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
});
