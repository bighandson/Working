var exchange = require('Exchange');
var recharge = require('Recharge');
var config = require('Config');
var User = require('User');
cc.Class({
    extends: cc.Component,

    properties: {
        toggleGroup: cc.Node,
        view: cc.Node,
        miaoShu: cc.Label,
        huan: cc.Label
    },

    onLoad: function () {
        let self = this;

        let userInfo = UserCenter.getUserInfo();

        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, this.buyCallBack.bind(this));

        GlobEvent.on('update_UserCenter', this.updateShop.bind(this));

        GlobEvent.on('pay_finish', function (errcode, spbh) {
            if (errcode == 0) {
                showAlertBox('充值成功！')
                recharge.clearList();
                recharge.getReChargeList('', function (err, data) {
                    if (err) {
                        cc.log(err)
                        return
                    }
                    self._selectToggle(self.num)

                })


            }
        });

        this.updateShop();

        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        }, this);
    },

    onToggle: function (event, num) {
        this._selectToggle(num);
    },

    _selectToggle: function (num) {
        cc.log(num)


        this.view.removeAllChildren();

        num = parseInt(num)

        this.num = num;

        this.toggleGroup.children.forEach(function (node, index) {
            node.children[0].children[1].active = (index == num);
        });

        this.toggleGroup.getComponentsInChildren(cc.Toggle)[0].isChecked = false;
        this.toggleGroup.getComponentsInChildren(cc.Toggle)[1].isChecked = false;
        this.toggleGroup.getComponentsInChildren(cc.Toggle)[2].isChecked = false;
        this.toggleGroup.getComponentsInChildren(cc.Toggle)[num].isChecked = true;

        switch (num) {
            case 0:
                this.miaoShu.string = '1元 = 100通宝 = 1万金币'
                this.huan.string = '是否用通宝直接兑换成金币'
                this.showJinbi();
                break;
            case 1:
                this.miaoShu.string = '1元 = 100通宝 = 6颗钻石'
                this.huan.string = '是否用通宝直接兑换成钻石'
                this.showCard();
                break;
            case 2:
                this.miaoShu.string = ''
                this.showExchange();
                break;
        }
    },
    showExchange: function () {
        let self = this;
        exchange.getExchangeBeansList(3, '', function (err, data) {
            if (err) {
                showAlertBox(data)
                return;
            }
            let res = data.results;
            let len = res.length;
            var path = 'hall/shop/exchangeItem'

            cc.loader.loadRes(path, cc.Prefab, function (error, prefab) {
                if (error) {
                    cc.log(error)
                    return
                } else {
                    setTimeout(function () {
                        for (let k = 0; k < res.length; k++) {
                            let item = cc.instantiate(prefab);
                            item.parent = self.view;
                            item.getComponent('exchangeScript').setData(res[k], 'zuanshi', k + 1, function (index) {
                                self._selectToggle(index)
                            });
                        }
                    }, 100)
                }
            });
        })
    },
    showCard: function () {
        let self = this;
        recharge.getReChargeList('', function (err, data) {
            if (err) {
                cc.log(err);
                return;
            }

            let res = data.results;
            self.res = res;
            let len = res.length;
            var path = 'hall/shop/rechargeItem';

            cc.loader.loadRes(path, cc.Prefab, function (error, prefab) {
                if (error) {
                    cc.log(error)
                    return
                } else {
                    setTimeout(function () {
                        let i = 0;
                        for (let k = 0; k < self.res.length; k++) {
                            if (self.res[k].zhlx == 4) {
                                i++;
                                let item = cc.instantiate(prefab);
                                item.parent = self.view;
                                item.getComponent('rechargeScript').setData(self.res[k], 'zuanshi', i);
                            }
                        }
                    }, 100)
                }
            });
        })
    },
    showJinbi: function () {
        let self = this;
        recharge.getReChargeList('', function (err, data) {
            if (err) {
                cc.log(err);
                return;
            }

            let res = data.results;
            self.res = res;
            let len = res.length;
            var path = 'hall/shop/rechargeItem';

            cc.loader.loadRes(path, cc.Prefab, function (error, prefab) {
                if (error) {
                    cc.log(error)
                    return
                } else {
                    setTimeout(function () {
                        let i = 0;
                        for (let k = 0; k < res.length; k++) {
                            if (res[k].zhlx == '3') {
                                i++
                                let item = cc.instantiate(prefab);
                                item.parent = self.view;
                                item.getComponent('rechargeScript').setData(res[k], 'jinbi', i);
                            }
                        }
                    }, 100)
                }
            });
        })
    },
    onDestroy: function () {
        let self = this;
        GlobEvent.removeListener('update_UserCenter', this.updateShop.bind(this));

        GlobEvent.removeAllListeners('pay_finish');
    },

    updateShop: function () {
        // if (!!this.coin){
        //     this.coin.string = formatNum(UserCenter.getUserInfo().jinbiNum);
        // }

        // if (!!this.beans){
        //     this.beans.string = formatNum(UserCenter.getUserInfo().youxibiNum);

        // }

        // if (!!this.card){
        //     this.card.string =formatNum( UserCenter.getUserInfo().fangkaNum);
        // }
    },
    buyCallBack: function () {
        if (!!recharge.getShop()) {
            User.getUesrAccount('')
            recharge.setShop(false);
        }
    },

    onClose: function () {
        this.onDestroy();
        this.node.removeFromParent(true);
    }
});
