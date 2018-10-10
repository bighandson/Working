var config = require('Config');
var LoadGame = require('LoadGame');
const seat = {2: [1, 3], 3: [1, 2, 3], 4: [0, 1, 2, 3]}
const seats = {
    5: {0: [0, -96], 1: [116, 9], 2: [62, 104], 3: [-62, 104], 4: [-111, 9]},
    6: {0: [62, -96], 1: [116, 9], 2: [62, 104], 3: [-62, 104], 4: [-111, 9], 5: [-62, -96]}
}
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
        table: cc.Node,
        ready: cc.Node,
        gaming: cc.Node,
        suo: cc.Node,
        player: [cc.Node],
        tableMessage: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        this.person = 0;
        this.gaming.active = false;
        this.ready.active = false;
        // this.suo.active = false;
    },
    onClickSit: function (event, num) {
        cc.log('坐下', num,this.gameid)
        let gameid = this.gameid;
        let tableid = this.tableid;

        showLoadingAni()
        if (this.player[num - 1].getChildByName('header').active) {
            showAlertBox('该座位已有玩家，禁止旁观')
            return;
        } else {

            if (this.info.chairNum == 2) {
                num = num == 2 ? 1 : 2
            } else if (this.info.chairNum == 3) {
                num--;
            }
            if (this.person == 0) {
                let message = JSON.parse(cc.sys.localStorage.getItem('setMoney' + this.gameid)) || {};
                cc.log(JSON.stringify( message))
                let lock = message.mima ? 1 : 0;
                let mima = message.mima || '';
                let min = message.minMoney || 0;
                let max = message.maxMoney;
                cc.log('max',max)
                if(UserCenter.getYouxibiNum()<this.info.originMinMoney) {
                    showAlertBox('您身上的金币低于本桌金币下限')
                    return
                }else if(UserCenter.getYouxibiNum() < min){
                    showAlertBox('您身上的金币低于自己设置金币下限')
                    return
                }
                if(UserCenter.getYouxibiNum()> 10000000) {
                    showAlertBox('您身上的金币高于一千万上限')
                    return
                }else if(!!max && UserCenter.getYouxibiNum() > max){
                    showAlertBox('您身上的金币高于自己设置金币上限')
                    return
                }

                LoadGame.enterFreeGame(gameid, tableid, num, lock, mima, min, max);
            } else {

                if (this.info.minMoney) {
                    if (UserCenter.getYouxibiNum() < this.info.minMoney) {
                        if(!!this.info.firstuserid){
                            showAlertBox('您身上的金币不满足【'+this.info.firstuserid+'】设置的入座条件')
                        }else{
                            showAlertBox('您身上的金币低于本桌金币下限')
                        }
                        return
                    }
                }

                if (this.info.maxMoney) {
                    if(!!this.info.firstuserid){
                        if (UserCenter.getYouxibiNum() > this.info.maxMoney) {
                            showAlertBox('您身上的金币不满足【'+this.info.firstuserid+'】设置的入座条件')
                            return
                        }
                    }else{
                        if (UserCenter.getYouxibiNum() > this.info.maxMoney) {
                            showAlertBox('您身上的金币超过本桌上限拉')
                            return
                        }
                    }

                }else{
                    if (UserCenter.getYouxibiNum() > 10000000) {
                        showAlertBox('您身上的金币超过一千万上限拉')
                        return
                    }
                }
                if (this.info.islock) {
                    hideLoadingAni()
                    loadPrefab("style/chairSetting/inputMima", function (module) {
                        module.x = cc.winSize.width / 2;
                        module.y = cc.winSize.height / 2;
                        module.parent = cc.director.getScene();
                        module.getComponent('chairMima').setMessage(gameid, tableid, num)
                    })
                }else{
                    LoadGame.enterFreeGame(gameid, tableid, num, 0,'',0, 0);
                }
            }

        }
    },
    getKongSeat:function () {
        let self = this;
        let seatNum = [];
        for (let i = 0; i < this.player.length; i++) {
            cc.log(this.player[i].active,this.player[i].getChildByName('header').active)
            if(!!this.player[i].active  && !this.player[i].getChildByName('header').active){
                seatNum.push(i+1)
            }
        }
        return seatNum
    },

    setData: function (info, gameid) {
        this.info = info;
        this.gameid = gameid;
        this.firstuserid = info.firstuserid;
        this.suo.active = !!this.info.islock
        this.game = config.getGameById(gameid);

            if (info.originMaxMoney) {
                this.tableMessage.string = info.tableId + ". " + formatNum(info.originMinMoney) + " - " + formatNum(info.originMaxMoney);
            } else {
                this.tableMessage.string = "("+info.tableId + ")  " + formatNum(info.originMinMoney) + " 起";
            }
        // }

        let table_Type = gameid < 300 ? "mah" : "pok";
        if(gameid == 120){
            table_Type = "pok";
        }
        let table_chairNum = info.chairNum;
        this.table_chairNum = table_chairNum;
        this.tableid = info.tableId;
        let tablePath = "game/scene/texture/" + table_Type + "_person" + table_chairNum;

        let readyPath;
        if(gameid < 300 && gameid != 120){
            readyPath = "game/scene/texture/" + table_Type + "_ready"+table_chairNum;
        }else{
            readyPath   = "game/scene/texture/" + table_Type + "_ready";
        }
        let startPath = "game/scene/texture/" + table_Type + "_start" + table_chairNum;
        let self = this;
        if (table_chairNum > 4) {
            for (let i = 0; i < self.player.length; i++) {
                self.player[i].active = (i < table_chairNum);
                if (i >= table_chairNum) {
                    break;
                }
                self.player[i].x = seats[table_chairNum][i][0];
                self.player[i].y = seats[table_chairNum][i][1];
                if (self.player[i].y > 100) {
                    self.player[i].getChildByName('header').getChildByName('name').y = 0;
                    if (self.player[i].x >= 0) {
                        self.player[i].getChildByName('header').getChildByName('name').x = 86;
                    } else {
                        self.player[i].getChildByName('header').getChildByName('name').x = -86;
                    }
                } else if (self.player[i].y < -80) {
                    self.player[i].getChildByName('header').getChildByName('name').y = 0;
                    if (self.player[i].x >= 0) {
                        self.player[i].getChildByName('header').getChildByName('name').x = 86;
                    } else {
                        self.player[i].getChildByName('header').getChildByName('name').x = -86;
                    }
                } else {
                    self.player[i].getChildByName('header').getChildByName('name').y = -56;
                }
            }
        } else {
            for (let i = 0; i < self.player.length; i++) {
                let chair = seat[table_chairNum]
                self.player[i].active = !!~chair.indexOf(i);
            }
        }
        for (let i = 0; i < self.player.length; i++) {
            self.player[i].getChildByName('header').active = false;
        }


        // 修改桌子
        getSpriteFrameByUrl(tablePath, function (err, spriteFrame) {
            if (err) {
                cc.log("load image error:" + tablePath)
                return;
            }
            if(self.table){
                self.table.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }

        });
        getSpriteFrameByUrl(readyPath, function (err, spriteFrame) {
            if (err) {
                cc.log("load image error:" + readyPath)
                return;
            }
            if(self.ready){
                self.ready.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }
        });
        getSpriteFrameByUrl(startPath, function (err, spriteFrame) {
            if (err) {
                cc.log("load image error:" + startPath)
                return;
            }
            if(self.gaming){
                self.gaming.getComponent(cc.Sprite).spriteFrame = spriteFrame;
            }

        });
    },

    refresh: function (info) {
        // cc.log(info)
        //
        this.info = info;
        this.suo.active = !!info.islock
        // cc.log(this.suo.active)
        //
        // if (info.firstuserid) {
        //     if (info.maxMoney) {
        //         this.tableMessage.string = info.tableId + ". " + formatNum(info.minMoney) + " - " + formatNum(info.maxMoney);
        //     } else {
        //         this.tableMessage.string = info.tableId + ". " + formatNum(info.minMoney) + " 起";
        //     }
        // } else {
        //     if (info.originMaxMoney) {
        //         this.tableMessage.string = info.tableId + ". " + formatNum(info.originMinMoney) + " - " + formatNum(info.originMaxMoney);
        //     } else {
        //         this.tableMessage.string = info.tableId + ". " + formatNum(info.originMinMoney) + " 起";
        //     }
        // }
    },
    changePlayer: function (player) {
        cc.log('changePlayer', this.person)
        if (player) {
            this.person++;
            cc.log(this.person)
            if (this.info.chairNum == 2) {
                if (player.seatid == 1) {
                    this.setPlayer(1, player)
                } else {
                    this.setPlayer(3, player)
                }
            } else if (this.info.chairNum == 3) {
                this.setPlayer(player.seatid, player)
            } else {
                this.setPlayer(player.seatid - 1, player)
            }
            if (this.person == this.info.chairNum) {
                this.gaming.active = true;
                this.ready.active = false;
            } else {
                this.gaming.active = false;
                this.ready.active = true;
            }

        }

    },
    clearPlayer: function (player) {
        cc.log('clearPlayer');
        if (player) {
            this.person--;
            cc.log(this.person)
            if (this.info.chairNum == 2) {
                if (player.seatid == 1) {
                    this.deletePlayer(1)
                } else {
                    this.deletePlayer(3)
                }
            } else if (this.info.chairNum == 3) {
                this.deletePlayer(player.seatid)
            } else {
                this.deletePlayer(player.seatid-1)
            }
            if (this.person == 0) {
                this.gaming.active = false;
                this.ready.active = false;
                this.suo.active = false;
            } else {
                this.gaming.active = false;
                this.ready.active = true;
            }


        }
    },
    deletePlayer: function (seat) {
        cc.log(seat)
        let self = this;
        self.player[seat].getChildByName('header').active = false;
        self.player[seat].getChildByName('header').getChildByName('name').getComponent(cc.Label).string = '';
        self.player[seat].getChildByName('header').getChildByName('head').getComponent(cc.Sprite).spriteFrame = '';
    },
    setPlayer: function (seat, player) {

        let self = this;
        self.player[seat].getChildByName('header').active = true;
        self.player[seat].getChildByName('header').getChildByName('name').getComponent(cc.Label).string = formatName(player.nick);
        let sexs = player.sex == 1 ? 'man' : 'woman';
        if (!isUrl(player.userImage)) {
            player.userImage = 'commonRes/other/' + sexs;
        }
	    loadHead(player.userImage, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            if(self.player){
                self.player[seat].getChildByName('header').getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
                self.player[seat].getChildByName('header').getChildByName('head').setContentSize(150, 150);
            }
        });
    },
    resetPerson: function () {
        this.person = 0;
    }
});
