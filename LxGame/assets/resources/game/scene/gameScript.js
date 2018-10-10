var LoadGame = require('LoadGame');
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

        view: cc.Node,
        zuanshi: cc.Label,
        jinbi: cc.Label,
    },


    // use this for initialization
    onLoad: function () {
        this.msgList = [];

        this.blocked = false;
        this.playerList = {};
        this.tableList = {};
        this.playerTable = {};
        this.ready = false;
        this.rein = false;
        this.RetriveTableList = [];
        this.tables = {};
        pomelo.on('RCMD_MobileSignUp', this.RCMD_MobileSignUp.bind(this))
        GlobEvent.on('update_UserCenter', this.updateUsercenter.bind(this));
        SettingMgr.stopBg();
        SettingMgr.playBg(config.backMusic);
        this.loadIndex = 0;

        this.addPomeloListeners();
        this.enterTable();
        this.reInRoom();
        this.updateUsercenter();
    },
    update: function () {
        if (this.RetriveTableList.length && this.loadIndex < this.RetriveTableList.length) {
            this.loadTable(this.loadIndex)
        }
    },

    loadTable: function (index) {
        if (this.isLoadfinish) {
            return
        }
        this.isLoadfinish = true
        let self = this;
        let info = this.RetriveTableList[index];
        loadPrefab("game/scene/table/table", function (module) {
            module.getComponent('tableScript').setData(info, self.currentGameid);
            if(self.tables){
                self.tables[info.tableId] = module;
            }
            module.parent = self.view;
            if(self.playerTable && self.playerTable[info.tableId]){
                for(let i=0;i<self.playerTable[info.tableId].length;i++){
                    self.addSeat(self.playerTable[info.tableId][i].userid, info.tableId);
                }
            }
            self.isLoadfinish = false
            self.loadIndex++
            if( self.RetriveTableList && self.loadIndex >= self.RetriveTableList.length){
                self.nextAction()
            }
        })
    },

    updateUsercenter: function () {
        if (this.jinbi) {
            this.jinbi.string = formatNum(UserCenter.getUserInfo().youxibiNum);
            cc.log(this.jinbi.string )
        }
        if (this.zuanshi) {
            this.zuanshi.string = formatNum(UserCenter.getUserInfo().fangkaNum);
        }

    },
    //服务器命令监听函数
    addPomeloListeners: function () {
        // 消息队列
        let msgList = [
            'RCMD_RetriveTableState',
            'RCMD_RetrivePlayerList',
            'RCMD_RetriveTableList',
            'RCMD_HallExit',
            'RCMD_HallTaskSeat',
            'RCMD_LeaveSeat',
            // "RCMD_StartGame",
            'RCMD_Dressinfo',
        ];

        for (var i = 0; i < msgList.length; i++) {
            pomelo.on(msgList[i], this.msgQueue.bind(this));
        }
    },

    removePomeloListeners: function () {
        let msgList = [
            'RCMD_RetriveTableState',
            'RCMD_RetrivePlayerList',
            'RCMD_RetriveTableList',
            'RCMD_HallExit',
            'RCMD_HallTaskSeat',
            'RCMD_LeaveSeat',
            // "RCMD_StartGame",
            'RCMD_MobileSignUp',
            'RCMD_Dressinfo',
        ];

        for (let i = 0; i < msgList.length; i++) {
            pomelo.removeAllListeners(msgList[i]);
        }

    },
    msgQueue: function (data) {
        console.log(data);
        cc.log('开始处理其他消息')
        if (data.route == 'RCMD_Dressinfo') {
            var myDate = new Date()
            cc.log('RCMD_Dressinfo', myDate.getMinutes(), myDate.getTime())
            this.ready = true;
        }
        if (!this.ready) {
            if (data.route == 'RCMD_RetrivePlayerList' || data.route == 'RCMD_RetriveTableList') {
                var myDate = new Date()
                cc.log('RCMD_RetrivePlayerList', myDate.getMinutes(), myDate.getTime())
                if (!this.blocked) {
                    this.blocked = true;
                    this[data.route](data);
                } else {
                    this.msgList.push(data);
                }
            }
            return
        }
        if (!this.msgList) {
            return;
        }
        if (!this.blocked) {
            this.blocked = true;
            this[data.route](data);
        } else {
            this.msgList.push(data);
        }
    },
    nextAction: function (event) {
        if (!!event) {
            event.stopPropagation();
        }
        let msg = this.msgList.shift();
        if (!msg) {
            this.blocked = false;
            return;
        }

        let route = msg.route;
        cc.log(msg);
        // 切换后台
        this.scheduleOnce(function () {
            this[route](msg);
        });
    },
    RCMD_Dressinfo: function () {
        this.personAll = true;
        this.nextAction();
    },
    reInRoom: function () {
        cc.log('reInRoom')
        if (!this.rein) {
            this.rein = true
        } else {
            this.game = LoadGame.getCurrentGame();
            this.currentGameid = LoadGame.getCurrentGameId();
            cc.log('reInRoom请求', this.currentGameid)

            var route = this.game.server + '.EnterHallRoom';
            PomeloClient.request(route,{
                flag:1
            }, function (data) {
                cc.log(data);
            });
        }

    },
    enterTable: function (currentGameid, host, port) {
        let self = this;
        this.currentGameid = currentGameid;
        this.host = host;
        this.port = port;

        if (!!this.host && !!this.currentGameid && !!this.port) {
            this.game = config.getGameById(this.currentGameid);
            LoadGame.enterFreeTable(currentGameid, self.host, self.port)
        }
    },
    RCMD_MobileSignUp: function (event) {
        hideLoadingAni();
        let self = this;
        cc.log('RCMD_MobileSignUp')
        if (event.flag == 0) {
            var myDate = new Date()
            var route = this.game.server + '.EnterHallRoom';
            PomeloClient.request(route, {
                // gameid: currentGameid,
                // userid: UserCenter.getUserID(),
                // host:host,
                // port:port,
                flag:1
            }, function (data) {
                cc.log(data);
            });
        }else {
            showAlertBox(event.reason,function () {
	            cc.director.loadScene('hallScene', function (err) {
		            if (err) {
			            cc.log(err);
			            hideLoadingAni();
			            return;
		            }
		            let hallScript = cc.find('Canvas').getComponent('hallScript')
		            hallScript.onClickFreeGame()
	            })
            })
        }
    },
    RCMD_RetriveTableList: function (event) {
        let data = event.tables;
        var myDate = new Date()
        cc.log('RCMD_RetriveTableLis===', myDate.getMinutes(), myDate.getTime())
        // cc.sys.localStorage.setItem('table', JSON.stringify(data))
        for (let i = 0; i < data.length; i++) {
            this.tableList[data[i].tableId] = data[i]
            this.tableList[data[i].tableId].seatNum = 0
        }
        this.RetriveTableList = data;
        // this.initData(data, this.currentGameid)
    },
    RCMD_RetrivePlayerList: function (event) {
        cc.log(event)
        var myDate = new Date()
        cc.log('RCMD_RetrivePlayerList===', myDate.getMinutes(), myDate.getTime())
        let users = event.users;
        for (let i = 0; i < users.length; i++) {
            this.playerList[users[i].userid] = users[i];
        }
        cc.log(this.playerList)
        if(!this.personAll){
            for (let i = 0; i < users.length; i++) {
                if(users[i].tableid){
                    if(!this.playerTable[users[i].tableid]){
                        this.playerTable[users[i].tableid] = [];
                    }
                    this.playerTable[users[i].tableid].push(users[i]) ;
                }
            }
        }
        this.nextAction();
    },
    RCMD_HallExit: function (event) {
        cc.log(event)
        let userid = event.userid;
        this.playerList[userid] = null;
        cc.log(this.playerList)
        this.nextAction();
    },

    // RCMD_StartGame: function () {
    //     cc.log('RCMD_StartGame')
    //     let self = this;
    //     let game = self.game;
    //     cc.director.loadScene(game.gameScene, function (err) {
    //         if (err) {
    //             cc.log(err);
    //             hideLoadingAni();
    //             return;
    //         }
    //         // 添加休闲场游戏统计
    //         YMEvent('FreeGame', game.gameid);
    //         let controller = cc.find('Canvas/controller');
    //         controller.addComponent(game.rule);
    //     });
    // },
    RCMD_HallTaskSeat: function (event) {
        cc.log(event)
        if (!event.tableid) {
            switch (event.iret) {
                case 1  :
                    showAlertBox('密码错误');
                    break
                case 2  :
                    showAlertBox('当前座位有玩家，请更换座位');
                    break
                case 3  :
                    showAlertBox('当前座位不存在，请更换座位');
                    break
                case 4  :
                    showAlertBox('当前金币不满足房间条件');
                    break
                default :
                    showAlertBox('进入游戏失败')
            }


        } else {
            let userid = event.userid;
            let user = this.playerList[userid];
            user.tableid = event.tableid;
            user.seatid = event.seatid;
            user.islock = event.islock;
            cc.log(this.playerList)



            if (event.userid == event.firstuserid) { // 创建
                this.tableList[user.tableid].islock = user.islock;
                this.tableList[user.tableid].firstuserid = event.userid;
                this.tableList[user.tableid].maxMoney = event.maxMoney;
                this.tableList[user.tableid].minMoney = event.minMoney;
                this.tables[this.playerList[userid].tableid].getComponent('tableScript').refresh(this.tableList[user.tableid])
            }

            this.addSeat(userid, event.tableid);
        }

        this.nextAction();
    },
    RCMD_LeaveSeat: function (event) {
        cc.log(event)

        let userid = event.userid;
        // if(userid == UserCenter.getUserID()){
        //     return
        // }
        let user = this.playerList[userid];
        cc.log(userid, this.playerList)
        if (this.playerList[userid].tableid) {
            //cc.log(this.tables)
            this.tables[this.playerList[userid].tableid].getComponent('tableScript').clearPlayer(this.playerList[userid]);
        }
        if (this.tableList[user.tableid].firstuserid == event.userid) {
            this.tableList[user.tableid].firstuserid = '';
            this.tableList[user.tableid].islock = 0;
            this.tableList[user.tableid].minMoney = 0;
            this.tableList[user.tableid].maxMoney = 0;

        }

        this.tableList[user.tableid].seatNum -= 1

        this.tables[this.playerList[userid].tableid].getComponent('tableScript').refresh(this.tableList[user.tableid])
        user.tableid = 0;
        user.seatid = 0;
        user.islock = 0;
        cc.log(this.playerList)
        this.nextAction();
    },
    takeSeat: function () {
        cc.log(this.playerList);
        let uesrids = Object.keys(this.playerList)
        for (let item in this.tables) {
            this.tables[item].getComponent('tableScript').resetPerson();
        }
        for (let i = 0; i < uesrids.length; i++) {
            if (this.playerList[uesrids[i]] && this.playerList[uesrids[i]].tableid) {
                cc.log(this.playerList[uesrids[i]].tableid, i)
                this.tableList[this.playerList[uesrids[i]].tableid].seatNum += 1  // 桌子上坐了一个人

                cc.log('桌子上坐了一个人')
                this.tables[this.playerList[uesrids[i]].tableid].getComponent('tableScript').changePlayer(this.playerList[uesrids[i]]);
            }
        }

    },
    addSeat: function (userid, tableid) {
        if (tableid) {
            this.tableList[tableid].seatNum += 1  // 桌子上坐了一个人
            cc.log(tableid, '桌子上坐了一个人')
            this.tables[tableid].getComponent('tableScript').changePlayer(this.playerList[userid]);
        }
    },

    setPlayer: function () {

    },

    //初始化参数
    initData: function (tableList, gameid) {
        // showLoadingAni()

        let self = this;

        // self.view.active = false
        // 桌子列表
        // this.tables = [];
        //
        // let loadTable = null

        // loadTable = function (index) {
        //
        //     // if (index >= tableList.length) {
        //     if (index >= 5) {
        //         cc.log('桌子加载完毕');
        //         var myDate = new Date()
        //         cc.log('桌子加载完毕', myDate.getMinutes(), myDate.getTime())
        //         self.nextAction();
        //         self.view.setOpacity(0.5);
        //         self.view.active = true;
        //         self.view.runAction(cc.fadeIn(0.3));
        //         hideLoadingAni()
        //         return;
        //     }
        //
        //     let info = tableList[index];
        //     loadPrefab("game/scene/table/table", function (module) {
        //         module.getComponent('tableScript').setData(info, gameid);
        //         self.tables[info.tableId] = module;
        //         module.parent = self.view;
        //         loadTable(index + 1);
        //     })
        // }
        // loadTable(0)

    },

    // 点击返回
    onClose: function () {
        showLoadingAni()
        LoadGame.reSetCurrentGameId();
        let route = this.game.server + '.CMD_Exit';
        PomeloClient.request(route, {
            flag: 1,
        });
        cc.director.loadScene('hallScene', function (err) {
            if (err) {
                cc.log(err);
                hideLoadingAni();
                return;
            }
            let hallScript = cc.find('Canvas').getComponent('hallScript')
            hallScript.onClickFreeGame()
        })
    },

    //金币充值
    addjinBi: function () {
        // body...
    },

    //钻石充值
    addZuanshi: function () {
        // body...
    },

    //快速开始
    quickStart: function () {
        // cc.log(this.tableList)

        // cc.log(this.playerList)

        let money = UserCenter.getUserInfo().youxibiNum

        let tList = []

        // cc.log('this.tableList.length',this.tableList.length,this.tableList)
        let ttlist = Object.keys(this.tableList)

        for (let i = 0; i < ttlist.length; i++) {
            let tt = this.tableList[ttlist[i]]
            // cc.log(tt.islock == 0, money >= tt.minMoney, tt.chairNum - tt.seatNum)
            if (tt.islock == 0 && money >= tt.minMoney && tt.chairNum - tt.seatNum > 0) {
                // cc.log(i, tt)
                if (tt.maxMoney == 0) {
                    tList.push(tt)
                } else if (money <= tt.maxMoney) {
                    tList.push(tt)
                }
            }
        }
        cc.log(tList)
        tList.sort(function (a, b) {
            function num(x) {
                if (x.chairNum == 2 && x.seatNum == 1) {
                    return Math.pow(2, 6)
                } else {
                    return Math.pow(x.chairNum, x.seatNum)
                }
            }

            return num(b) - num(a)

        })

        tList.sort(function (a, b) {
            function num(x) {
                if (x.chairNum == 2 && x.seatNum == 1) {
                    return Math.pow(2, 6)
                } else {
                    return Math.pow(x.chairNum, x.seatNum)
                }
            }

            if (num(a) == num(b)) {
                return b.minMoney - a.minMoney
            } else {
                return num(b) - num(a)
            }
        })
        cc.log("快速开始 搜索到的桌子", tList)
        let seatNum = this.tables[tList[0].tableId].getComponent('tableScript').getKongSeat()
        if (seatNum.length) {
            this.tables[tList[0].tableId].getComponent('tableScript').onClickSit(null, seatNum[0])
        } else {
            showAlert('当前座位全满', function () {
                console.log(1)
            })
        }

    },


    //保险箱
    onBank: function () {
        let self = this;
        loadPrefab("hall/bank/bank", function (module) {
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            module.getComponent('bankScript').setRoom(function () {

                cc.log('roombank请求')
                var route = self.game.server + '.synUserMoney';
                PomeloClient.request(route, {
                    userid: UserCenter.getUserID(),
                    zhlx: 3
                }, function (data) {
                    cc.log(data);
                });
            })
            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.05, 1.1), cc.scaleTo(0.05, 1)))
        });
    },

    //更多
    moreButtons: function () {
        this.buttons.active = !this.buttons.active
    },

    //规则
    onRule: function () {

    },

    //设置
    onSetting: function () {
        let self = this;
        loadPrefab("style/chairSetting/chairSetting", function (module) {
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            module.getComponent('chairSettingScript').init(self.currentGameid)
            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1, 1.1), cc.scaleTo(0.1, 1)))
        });
    },

    onDestroy: function () {
        this.removePomeloListeners();
        GlobEvent.removeAllListeners('update_UserCenter');
    },

});
