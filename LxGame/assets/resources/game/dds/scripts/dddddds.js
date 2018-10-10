
const dongWu = [1,2,5,6,1,1,3,2,1,4,1]
const gaLv = [5,7,1,3,2,10]
const xh = [4000,3000,20000,6000,10000,2000]
const bang = [0,0,4,6]
cc.Class({

    extends: cc.Component,

    properties: {

        view:{
            default:[],
            type:cc.Node
        },
        label:{
            default:null,
            type:cc.Label
        },
        prafeb:{
            default:[],
            type:cc.Prefab
        },
        moneyTX:{
            default:[],
            type:cc.Prefab
        },
        touxiang:{
            default:null,
            type:cc.Node
        },
        youxidou:{
            default:null,
            type:cc.Node
        },
        jiqi:{
            default:[],
            type:cc.Node
        },
        lizi:{
            default:null,
            type:cc.Prefab
        },
        luobo : cc.Node,
        dagutou : cc.Node,
        langyabang : cc.Node,
    },
    onLoad:function()
    {
        this.xiaoji = [];
        this.houzi = [];
        this.tuzi=[];
        this.shizi=[];
        this.nainiu=[];
        this.yezhu=[];
        this.loadHead()
        let self = this;

        for(let i=0;i<11;i++) {
            this.view[i].setTag(0);
            this.houzi[i]=cc.instantiate(this.prafeb[0]);
            this.view[i].addChild(this.houzi[i]);
            this.houzi[i].setPosition(0,0);
            this['child1'+i]=this.houzi[i].getChildByName("view").getChildByName("houzi");
            this['child1'+i].on(cc.Node.EventType.TOUCH_START,this.mousedown,this);

            this.tuzi[i]=cc.instantiate(this.prafeb[1]);
            this.view[i].addChild(this.tuzi[i]);
            this.tuzi[i].setPosition(0,0);
            this['child2'+i]=this.tuzi[i].getChildByName("view").getChildByName("tuzi");
            this['child2'+i].on(cc.Node.EventType.TOUCH_START,this.mousedownTZ,this);

            this.shizi[i]=cc.instantiate(this.prafeb[2]);
            this.view[i].addChild(this.shizi[i]);
            this.shizi[i].setPosition(0,0);
            this['child3'+i]=this.shizi[i].getChildByName("view").getChildByName("shizi");
            this['child3'+i].on(cc.Node.EventType.TOUCH_START,this.mousedownSZ,this);

            this.nainiu[i]=cc.instantiate(this.prafeb[3]);
            this.view[i].addChild(this.nainiu[i]);
            this.nainiu[i].setPosition(0,0);
            this['child4'+i]=this.nainiu[i].getChildByName("view").getChildByName("nainiu");
            this['child4'+i].on(cc.Node.EventType.TOUCH_START,this.mousedownNN,this);

            this.yezhu[i]=cc.instantiate(this.prafeb[4]);
            this.view[i].addChild(this.yezhu[i]);
            this.yezhu[i].setPosition(0,0);
            this['child5'+i]=this.yezhu[i].getChildByName("view").getChildByName("yezhu");
            this['child5'+i].on(cc.Node.EventType.TOUCH_START,this.mousedownYZ,this);

            this.xiaoji[i]=cc.instantiate(this.prafeb[5]);
            this.view[i].addChild(this.xiaoji[i]);
            this.xiaoji[i].setPosition(0,0);
            this['child6'+i]=this.xiaoji[i].getChildByName("view").getChildByName("xiaoji");
            this['child6'+i].on(cc.Node.EventType.TOUCH_START,this.mousedownXJ,this);


            var animHZ=this['child'+dongWu[i]+i].getComponent(cc.Animation);
            // this.animHZ.play('Clip1');
            var animHZState = animHZ.play('Clip1');
            animHZState.on('finished',function () {
                cc.log('finished')
                self['child'+dongWu[i]+i].getComponent(cc.Animation).play('dongzuo');
            },self);
        }
        hideLoadingAni();
        this.w=[0,1,2,3,4,5,6,7,8,9,10];
        this.u=[];
        this.u1=[];

        this.dj = 1;
    },
    loadHead: function () {
        let tx = UserCenter.userInfo.picture;
        let sex = UserCenter.userInfo.xb;
        let sexs = sex == 1 ? 'man' : 'woman';
        if (!isUrl(tx)) {
            tx = 'commonRes/other/' + sexs;
        }
        let self = this;

        getSpriteFrameByUrl(tx, function (err, spriteFrame) {
            if (err) {
                cc.log(err);
                return;
            }
            self.touxiang.getChildByName('head').getComponent(cc.Sprite).spriteFrame = spriteFrame;
            self.touxiang.getChildByName('head').setContentSize(150, 150);
        });
    },

    mousedown:function(event)   //地鼠
    {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var hz = event.getCurrentTarget();
            var parent=hz.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[0] + bang[this.dj])){
                success = true;
            }
            self.gutou=parent.getChildByName("gutou");
            // var page=this.pageview.getComponent(cc.PageView).getCurrentPageIndex();
            switch (self.dj){

                case 1:
                    cc.loader.loadRes("youxi/dds/img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("youxi/dds/img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("youxi/dds/img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }
            self.panduan();
            if(!success){
                hz.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else{
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                hz.off(cc.Node.EventType.TOUCH_START,this.mousedown,this);
                self.panduanUP(xh[0]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                hz.getComponent(cc.Animation).playAdditive('daji');
                hz.getComponent(cc.Animation).play('Clip2');
                // self.scheduleOnce(function () {
                //     hz.getComponent(cc.Animation).node.active=false;
                //     parent.parent.tag=1;
                //     // self.gutou.getComponent(cc.Animation).stop();
                //     self.gutou.active=false;
                // },0.5);

                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                        self.panD();
                    }
                }
                cc.log(self.w);

            }
        }


    },
    mousedownTZ:function (event)  //兔子
    {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var tz = event.getCurrentTarget();
            var parent=tz.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);

            self.gutou=parent.getChildByName("gutou");
            // var page=this.pageview.getComponent(cc.PageView).getCurrentPageIndex();

            switch (self.dj){

                case 1:
                    cc.loader.loadRes("img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[0] + bang[this.dj])){
                success = true;
            }
            if(!success){
                self.panduan();
                tz.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else{
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                tz.off(cc.Node.EventType.TOUCH_START,this.mousedownTZ,this);
                self.panduanUP(xh[1]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                tz.getComponent(cc.Animation).playAdditive('daji');
                tz.getComponent(cc.Animation).play('Clip2');

                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                    }
                }
                cc.log(self.w);
                    self.panD();

            }
        }
    },
    mousedownSZ:function (event)     //老虎
    {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var sz = event.getCurrentTarget();
            var parent=sz.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[2] + bang[this.dj])){
                success = true;
            }
            self.gutou=parent.getChildByName("gutou");
            switch (self.dj){

                case 1:
                    cc.loader.loadRes("img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }

            if(!success){
                self.panduan();
                sz.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else {
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                sz.off(cc.Node.EventType.TOUCH_START,this.mousedownSZ,this);
                self.panduanUP(xh[2]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                sz.getComponent(cc.Animation).playAdditive('daji');
                sz.getComponent(cc.Animation).play('Clip2');
                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                    }
                }
                cc.log(self.w);
                    self.panD();
            }
        }
    },
    mousedownNN :function (event) {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var nn = event.getCurrentTarget();
            var parent=nn.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[3] + bang[this.dj])){
                success = true;
            }
            self.gutou=parent.getChildByName("gutou");
            switch (self.dj){

                case 1:
                    cc.loader.loadRes("img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }
            if(!success){
                self.panduan();
                nn.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else {
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                nn.off(cc.Node.EventType.TOUCH_START,this.mousedownNN,this);
                self.panduanUP(xh[3]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                nn.getComponent(cc.Animation).playAdditive('daji');
                nn.getComponent(cc.Animation).play('Clip2');
                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                    }
                }
                cc.log(self.w);
                self.panD();
            }
        }
    },
    mousedownYZ : function (event) {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var yz = event.getCurrentTarget();
            var parent=yz.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[4] + bang[this.dj])){
                success = true;
            }
            self.gutou=parent.getChildByName("gutou");
            switch (self.dj){

                case 1:
                    cc.loader.loadRes("img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }
            if(!success){
                self.panduan();
                yz.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else {
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                yz.off(cc.Node.EventType.TOUCH_START,this.mousedownYZ,this);
                self.panduanUP(xh[4]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                yz.getComponent(cc.Animation).playAdditive('daji');
                yz.getComponent(cc.Animation).play('Clip2');
                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                    }
                }
                cc.log(self.w);
                self.panD();
            }
        }
    },
    mousedownXJ : function (event) {
        var self=this;
        if (self.w.length==0){
            self.updater();
        }else {
            var xj = event.getCurrentTarget();
            var parent=xj.parent.parent;
            var q=parent.parent.name.toString().substr(4,2);
            var o=Math.floor(Math.random()*100);
            var success = false;
            if(o <= (gaLv[5] + bang[this.dj])){
                success = true;
            }
            self.gutou=parent.getChildByName("gutou");
            switch (self.dj){

                case 1:
                    cc.loader.loadRes("img/background/luobo-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 2:
                    cc.loader.loadRes("img/background/gutou-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

                case 3:
                    cc.loader.loadRes("img/background/langyabang-2", cc.SpriteFrame, function (err, spriteFrame) {
                        self.gutou.getComponent(cc.Sprite).spriteFrame = spriteFrame;
                    });
                    break;

            }
            if(!success){
                self.panduan();
                xj.getComponent(cc.Animation).playAdditive('daji');
                self.gutou.active=true;
                self.gutou.getComponent(cc.Animation).play('gutou');
            }else {
                var lizi = cc.instantiate(self.lizi);
                lizi.parent=parent.parent.parent;
                lizi.position=parent.parent.getPosition();
                var move1 = cc.moveBy(0.8,0,70);
                var move2 = cc.moveTo(0.5,cc.p(-333,-310));
                lizi.runAction(cc.sequence(move1.easing(cc.easeExponentialOut()),move2.easing(cc.easeExponentialOut()),cc.removeSelf()));
                xj.off(cc.Node.EventType.TOUCH_START,this.mousedownXJ,this);
                self.panduanUP(xh[5]);
                self.gutou.getComponent(cc.Animation).play('gutou');
                xj.getComponent(cc.Animation).playAdditive('daji');
                xj.getComponent(cc.Animation).play('Clip2');
                for(let i=0;i<self.w.length;i++){
                    if (self.w[i]==parseInt(q)-1){
                        self.u.push(self.w[i]);
                        self.w.splice(i,1);
                        self.w.sort(function (a,b) {
                            return a-b;
                        });
                        self.u.sort(function (a,b) {
                            return a-b;
                        });
                        self.quChong(self.w);
                        self.quChong(self.u);
                    }
                }
                cc.log(self.w);
                self.panD();
            }
        }
    },
    onluobo : function () {
        this.dj=1;
        this.luobo.children[1].active=false;
        this.dagutou.children[1].active=true;
        this.langyabang.children[1].active=true;
    },
    ongutou : function () {
        this.dj=2;
        this.luobo.children[1].active=true;
        this.dagutou.children[1].active=false;
        this.langyabang.children[1].active=true;
    },
    onlangyabang : function () {
        this.dj=3;
        this.luobo.children[1].active=true;
        this.dagutou.children[1].active=true;
        this.langyabang.children[1].active=false;
    },
    panduan:function()  //玩家金币减少动画
    {
        var self=this;
        self.moveby=cc.moveBy(0.4,cc.p(0,35));
        self.moveby2=cc.moveBy(0.2,cc.p(0,15));
        self.fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
        // var page=this.pageview.getComponent(cc.PageView).getCurrentPageIndex();
        var money=cc.instantiate(self.moneyTX[1]);
        self.youxidou.addChild(money);
        money.setPosition(0,20);
        switch(this.dj){

            case 1:
                money.getComponent(cc.RichText).string='<color=#00CCFF>-500</c>';
                money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
                var Str=parseInt(self.label.string);
                self.label.string=""+Str-(500)+"";
                break;

            case 2:
                money.getComponent(cc.RichText).string='<color=#00CCFF>-800</c>';
                money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
                var Str=parseInt(self.label.string);
                self.label.string=""+Str-(800)+"";
                break;

            case 3:
                money.getComponent(cc.RichText).string='<color=#00CCFF>-1000</c>';
                money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
                var Str=parseInt(self.label.string);
                self.label.string=""+Str-(1000)+"";
                break;
        }
    },

    panduanUP:function(i)   //玩家打中金币上升动画
    {
        var self=this;
        self.moveby=cc.moveBy(0.4,cc.p(0,35));
        self.moveby2=cc.moveBy(0.2,cc.p(0,15));
        self.fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
        var money=cc.instantiate(self.moneyTX[0]);
        self.touxiang.addChild(money);
        money.setPosition(0,0);
        // switch(this.dj){
        //
        //     case 1:
                money.getComponent(cc.RichText).string='<color=#FF3300>+'+i+'</c>';
                money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
                var Str=parseInt(self.label.string);
                self.label.string=""+Str-(-i)+"";
                // break;

        //     case 2:
        //         money.getComponent(cc.RichText).string='<color=#FF3300>+'+i+'</c>';
        //         money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
        //         var Str=parseInt(self.label.string);
        //         self.label.string=""+Str-(-i)+"";
        //         break;
        //
        //     case 3:
        //         money.getComponent(cc.RichText).string='<color=#FF3300>+'+i+'</c>';
        //         money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
        //         var Str =parseInt(self.label.string);
        //         self.label.string=""+Str-(-i)+"";
        //         break;
        // }
    },
    //
    // panduanOthers:function (e,i)      //  机器人打中金币上升动画
    // {
    //     var self=this;
    //     self.moveby=cc.moveBy(0.4,cc.p(0,35));
    //     self.moveby2=cc.moveBy(0.2,cc.p(0,15));
    //     self.fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //     var page=this.pageviewJQ.getComponent(cc.PageView).getCurrentPageIndex();
    //     var money=cc.instantiate(self.moneyTX[0]);
    //     self.jiqi[e].addChild(money);
    //     money.setPosition(0,0);
    //     switch(page){
    //
    //         case 0:
    //             money.getComponent(cc.RichText).string='<color=#FF3300>+'+500*i+'</c>';
    //             money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
    //             break;
    //
    //         case 1:
    //             money.getComponent(cc.RichText).string='<color=#FF3300>+'+5000*i+'</c>';
    //             money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
    //             break;
    //
    //         case 2:
    //             money.getComponent(cc.RichText).string='<color=#FF3300>+'+50000*i+'</c>';
    //             money.runAction(cc.sequence(self.moveby,cc.spawn(self.moveby2,self.fadeto)));
    //             break;
    //     }
    // },
    //
    // panduanJQ:function ()  //机器人棒子切换
    // {
    //     var self=this;
    //     // self.pageviewJQ.getComponent(cc.PageView).setCurrentPageIndex(x);
    //     // var page=self.pageviewJQ.getComponent(cc.PageView).getCurrentPageIndex();
    //     switch(self.x){
    //
    //         case 0:
    //             cc.loader.loadRes("img/gulv11", cc.SpriteFrame, function (err, spriteFrame) {
    //                 self.gt.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //             });
    //             break;
    //
    //         case 1:
    //             cc.loader.loadRes("img/gulv22", cc.SpriteFrame, function (err, spriteFrame) {
    //                 self.gt.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //             });
    //             break;
    //
    //         case 2:
    //             cc.loader.loadRes("img/gulv33", cc.SpriteFrame, function (err, spriteFrame) {
    //                 self.gt.getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //             });
    //             break;
    //     }
    //
    // },

    moni:function()  //模拟机器人1号动作
    {
        var _this=this;

        if (_this.w.length==0) {
            _this.updater();
        }else {
            var a=[0,0,0,0,1];
            var y=Math.floor(Math.random()*a.length);
            var m=Math.floor(Math.random()*_this.w.length);
            if (_this.view[_this.w[m]].tag==0){
                var dhz = _this.view[_this.w[m]].getChildByName("DaHouZi");
                var vi = dhz.getChildByName("view");
                var hz = vi.getChildByName("houzi");
                _this.gt = dhz.getChildByName("gutou");

                if (hz.getComponent(cc.Animation).getAnimationState('Clip2').isPlaying){
                    return;
                }
                if(a[y]==0){
                    _this.panduanJQ();
                    hz.getComponent(cc.Animation).play('daji');
                    _this.gt.getComponent(cc.Animation).play();
                }
                if(a[y]==1){
                    hz.off(cc.Node.EventType.TOUCH_START,_this.mousedown,_this);
                    _this.panduanJQ();
                    var bei=0;
                    switch (_this.x){
                        case 0:
                            bei=1;
                            break;
                        case 1:
                            bei=1.5;
                            break;
                        case 2:
                            bei=2.5;
                            break;
                    }
                    _this.panduanOthers(0,bei);
                    _this.gt.getComponent(cc.Animation).play();
                    hz.getComponent(cc.Animation).play('Clip2');
                    // _this.scheduleOnce(function() {
                    //     hz.active=false;
                    //     _this.gt.active=false;
                    // },0.5);
                    _this.view[_this.w[m]].tag=1;
                    _this.u.push(_this.w[m]);
                    _this.w.splice(m,1);
                    _this.w.sort(function (a,b) {
                        return a-b;
                    });
                    _this.u.sort(function (a,b) {
                        return a-b;
                    });
                    _this.quChong(_this.w);
                    _this.quChong(_this.u);
                    cc.log(_this.w);
                    _this.panD();

                }
            }
            else if(_this.view[_this.w[m]].tag==1){
                var dxj = _this.view[_this.w[m]].getChildByName("DaXiaoJi");
                var vi1 = dxj.getChildByName("view");
                var xj = vi1.getChildByName("xiaoji");
                _this.gt = dxj.getChildByName("gutou");

                if (xj.getComponent(cc.Animation).getAnimationState('Clip2').isPlaying){
                    return;
                }
                if(a[y]==0){
                    _this.panduanJQ();
                    xj.getComponent(cc.Animation).play('daji');
                    _this.gt.getComponent(cc.Animation).play();
                }
                if(a[y]==1){
                    xj.off(cc.Node.EventType.TOUCH_START,_this.mousedownXJ,_this);
                    _this.panduanJQ();
                    var bei=0;
                    switch (_this.x){
                        case 0:
                            bei=1;
                            break;
                        case 1:
                            bei=1.5;
                            break;
                        case 2:
                            bei=2.5;
                            break;
                    }
                    _this.panduanOthers(0,bei);
                    _this.gt.getComponent(cc.Animation).play();
                    xj.getComponent(cc.Animation).play('Clip2');
                    // _this.scheduleOnce(function() {
                    //     xj.active=false;
                    //     _this.gt.active=false;
                    // },0.5);
                    _this.view[_this.w[m]].tag=1;
                    _this.u.push(_this.w[m]);
                    _this.w.splice(m,1);
                    _this.w.sort(function (a,b) {
                        return a-b;
                    });
                    _this.u.sort(function (a,b) {
                        return a-b;
                    });
                    _this.quChong(_this.w);
                    _this.quChong(_this.u);
                    cc.log(_this.w);
                    _this.panD();

                }

            }
            else if(_this.view[_this.w[m]].tag==2){
                var dtz = _this.view[_this.w[m]].getChildByName("DaTuZi");
                var vi2 = dtz.getChildByName("view");
                var tz = vi2.getChildByName("laohu");
                _this.gt = dtz.getChildByName("gutou");

                if (tz.getComponent(cc.Animation).getAnimationState('Clip2').isPlaying){
                    return;
                }
                if(a[y]==0){
                    _this.panduanJQ();
                    tz.getComponent(cc.Animation).play('daji');
                    _this.gt.getComponent(cc.Animation).play();
                }
                if(a[y]==1){
                    tz.off(cc.Node.EventType.TOUCH_START,_this.mousedownTZ,_this);
                    _this.panduanJQ();
                    var bei=0;
                    switch (_this.x){
                        case 0:
                            bei=1;
                            break;
                        case 1:
                            bei=1.5;
                            break;
                        case 2:
                            bei=2.5;
                            break;
                    }
                    _this.panduanOthers(0,bei);
                    _this.gt.getComponent(cc.Animation).play();
                    tz.getComponent(cc.Animation).play('Clip2');
                    // _this.scheduleOnce(function() {
                    //     tz.active=false;
                    //     _this.gt.active=false;
                    // },0.5);
                    _this.view[_this.w[m]].tag=1;
                    _this.u.push(_this.w[m]);
                    _this.w.splice(m,1);
                    _this.w.sort(function (a,b) {
                        return a-b;
                    });
                    _this.u.sort(function (a,b) {
                        return a-b;
                    });
                    _this.quChong(_this.w);
                    _this.quChong(_this.u);
                    cc.log(_this.w);
                    _this.panD();

                }

            }

        }

    },


    //
    // moni2:function()  //模拟机器人2号动作
    // {
    //         var self=this;
    //         parseInt(self.Pageview.toString().length);
    //         // getJiqi
    // },
    upDownYZ :function () {
        var m=Math.floor(Math.random()*this.u.length);
        var dyz=this.view[this.u[m]].getChildByName("DaYeZhu");
        this.view[this.u[m]].setTag(3);
        var vi=dyz.getChildByName("view");
        var yz=vi.getChildByName("yezhu");
        var animyz=yz.getComponent(cc.Animation);
        var self=this;
        animyz.play('dongzuo');
        animyz.playAdditive('Clip1');
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });
        var gt=dyz.getChildByName("gutou");
        yz.on(cc.Node.EventType.TOUCH_START,self.mousedownYZ,self);
    },
    upDownNN :function () {
        var m=Math.floor(Math.random()*this.u.length);
        var dnn=this.view[this.u[m]].getChildByName("DaNaiNiu");
        this.view[this.u[m]].setTag(4);
        var vi=dnn.getChildByName("view");
        var nn=vi.getChildByName("nainiu");
        var animnn=nn.getComponent(cc.Animation);
        var self=this;
        animnn.play('dongzuo');
        animnn.playAdditive('Clip1');
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });
        var gt=dnn.getChildByName("gutou");
        // nn.active=true;
        // gt.active=true;
        nn.on(cc.Node.EventType.TOUCH_START,self.mousedownNN,self);
    },
    upDownXJ :function () {
        var m=Math.floor(Math.random()*this.u.length);
        var dxj=this.view[this.u[m]].getChildByName("DaXiaoJi");
        this.view[this.u[m]].setTag(1);
        var vi=dxj.getChildByName("view");
        var xj=vi.getChildByName("xiaoji");
        var animxj=xj.getComponent(cc.Animation);
        var self=this;
        animxj.play('dongzuo');
        animxj.playAdditive('Clip1');
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });
        var gt=dxj.getChildByName("gutou");
        // xj.active=true;
        // gt.active=true;
        xj.on(cc.Node.EventType.TOUCH_START,self.mousedownXJ,self);
    },
    upDownSZ:function ()  //狮子上升
    {
        var m=Math.floor(Math.random()*this.u.length);
        var dsz=this.view[this.u[m]].getChildByName("DaShiZi");
        this.view[this.u[m]].setTag(5);
        var vi=dsz.getChildByName("view");
        var sz=vi.getChildByName("shizi");
        var animsz=sz.getComponent(cc.Animation);
        var self=this;
        animsz.play('dongzuo');
        animsz.playAdditive('Clip1');
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });
        var gt=dsz.getChildByName("gutou");
        // sz.active=true;
        // gt.active=true;
        sz.on(cc.Node.EventType.TOUCH_START,self.mousedownSZ,self);

    },
    upDownTZ:function ()   //兔子上升
    {
        var m=Math.floor(Math.random()*this.u.length);
        cc.log(this.u);
        var dtz=this.view[this.u[m]].getChildByName("DaTuZi");
        this.view[this.u[m]].setTag(2);
        var vi=dtz.getChildByName("view");
        var tz=vi.getChildByName("tuzi");
        var animtz=tz.getComponent(cc.Animation);
        var self=this;
        animtz.play('dongzuo');
        animtz.playAdditive('Clip1');
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        cc.log(this.u);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });
        var gt = dtz.getChildByName("gutou");
        // tz.active=true;
        // gt.active=true;
        tz.on(cc.Node.EventType.TOUCH_START,self.mousedownTZ,self);

    },
    upDownHZ:function ()    //猴子上升
    {
        var m=Math.floor(Math.random()*this.u.length);
        cc.log(this.u);
        var dhz = this.view[this.u[m]].getChildByName("DaHouZi");
        this.view[this.u[m]].setTag(0);
        var vi = dhz.getChildByName("view");
        this.hz = vi.getChildByName("houzi");
        var animhz=this.hz.getComponent(cc.Animation);
        var self=this;
        animhz.play('Clip1');
        self.animhz2=animhz;
        self.w.push(self.u[m]);
        self.u.splice(m,1);
        cc.log(this.u);
        self.w.sort(function (a,b) {
            return a-b;
        });
        self.u.sort(function (a,b) {
            return a-b;
        });

        var gt = dhz.getChildByName("gutou");
        // gt.active=true;
        // self.ds.active=true;

        self.hz.on(cc.Node.EventType.TOUCH_START,self.mousedown,self);
        // self.scheduleOnce(function () {
        //     self.animds2.play('dongzuo');
        // },2.5);


    },
    quChong:function (args)  //去除数组重复
    {
        var self=this;
        for(let i=0;i<args.length;i++){
            if (self.u1.indexOf(args[i])<0){
                self.u1.push(args[i]);
            }
        }
        return self.u1;
    },
    updater:function ()  //重新加载场景
    {
        this.scheduleOnce(function () {
            cc.director.loadScene('sad4');
        },3);
    },
    // update:function(){
    //     if(this.w.length==0){
    //         this.scheduleOnce(function () {
    //             cc.director.loadScene('sad4');
    //         },3);
    //     }
    // },
    panD:function ()   //判断随机上升情况
    {
        this.e=Math.floor(Math.random()*99);
        this.f=Math.floor(Math.random()*2);
            if (this.e<=49){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownHZ();
                    }else {
                        return;
                    }
                },2);

            } else if (this.e<=65){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownXJ();
                    }else {
                        return;
                    }
                },2);
            }else if (this.e<=78){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownTZ();
                    }else {
                        return;
                    }
                },2);
            } else if (this.e<=88){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownYZ();
                    }else {
                        return;
                    }
                },2);
            } else if (this.e<=96){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownNN();
                    }else {
                        return;
                    }
                },2);
            }else if (this.e<=99){
                this.scheduleOnce(function () {
                    if (!this.u.length==0){
                        this.upDownSZ();
                    }else {
                        return;
                    }
                },2);
            }

    }

});