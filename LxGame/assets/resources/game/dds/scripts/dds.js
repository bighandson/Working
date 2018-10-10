cc.Class({
    extends: cc.Component,

    properties: {

        animation:{
            default:[],
            type:cc.Animation
        },
        animation2:{
            default:[],
            type:cc.Animation
        },
        animationM:{
            default:[],
            type:cc.Prefab
        },
        pageview:{
            default:null,
            type:cc.PageView
        },
        gutou:{
            default:[],
            type:cc.Sprite
        },
        label:{
            default:null,
            type:cc.Label
        }

    },

    onLoad: function () {

        for(var i=0;i<6;i++)
        {
            this.animation[i].getComponent(cc.Animation).on('finished',this.onfinished);
        }
        cc.log()
        this.animation[0].node.on(cc.Node.EventType.TOUCH_START,this.mousedown0,this);
        this.animation[1].node.on(cc.Node.EventType.TOUCH_START,this.mousedown1,this);
        this.animation[2].node.on(cc.Node.EventType.TOUCH_START,this.mousedown2,this);
        this.animation[3].node.on(cc.Node.EventType.TOUCH_START,this.mousedown3,this);
        this.animation[4].node.on(cc.Node.EventType.TOUCH_START,this.mousedown4,this);
        this.animation[5].node.on(cc.Node.EventType.TOUCH_START,this.mousedown5,this);
        // this.suiji();
        // this.moni();
        // this.schedule(function () {
        //     this.moni();
        // },1);
        // this.moni2();
        // this.schedule(function () {
        //     this.moni2();
        // },1);
        // function dasd(){
        //
        // }
        var b=[this.fc1(),this.fc2(),this.fc3()];
        b[0];
    },
    // jishi:function () {
    //     if(this.count===29) {
    //         this.unschedule(this.jishi);
    //         this.panduan();
    //         for (let m = 0; m < 6; m++) {
    //         this.animation[m].getComponent(cc.Animation).stop();
    //     }
    // }
    //     this.timer.string='计时:'+(29-this.count.toString())+' s';
    //     this.count++;
    // },
    // panduan:function () {
    //     cc.log('panduan');
    //     if(this.fenshu.toString()>=20){
    //         this.tongguan.string='通关了！'
    //     }else{
    //         this.tongguan.string='未通关！'
    //     }
    // },
    suiji:function(){
        // this.x=Math.floor(Math.random()*6);
        for(var x=0;x<6;x++) {
            this.anim = this.animation[x].getComponent(cc.Animation);
            var animState = this.anim.play('Clip1');
            animState.wrapMode = cc.WrapMode.PingPong;
            animState.repeatCount = 1;
            animState.speed = 1.1;
        }
    },
    // update: function () {
    //
    // },
    fc1:function () {
        cc.log('fc1')
    },
    onfinished:function (event) {
        cc.log(event);
    },
    mousedown0:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if(a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[0].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[0].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-1000+"";
                    break;
            }}
       else if (a[o]==1){
            var x=0;
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[0].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[0].node.active=false;
                    self.animation2[6].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[0].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[0].node.active=false;
                    self.animation2[6].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[0].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[0].node.active=false;
                    self.animation2[6].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    // mousedown0:function () {
    //     var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
    //     var o=Math.floor(Math.random()*a.length);
    //     var self=this;
    //     if(a[o]==0){
    //         var Page=self.pageview.getCurrentPageIndex();
    //         var anim2 = self.animation2[0].getComponent(cc.Animation);
    //         anim2.playAdditive();
    //         var anim = self.animation[0].getComponent(cc.Animation);
    //         anim.playAdditive('daji');
    //         switch (Page){
    //             case 0:
    //                 var money=cc.instantiate(self.animationM[0]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-218,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-10+"";
    //                 break;
    //             case 1:
    //                 var money=cc.instantiate(self.animationM[1]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-218,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-100+"";
    //                 break;
    //             case 2:
    //                 var money=cc.instantiate(self.animationM[2]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-218,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-1000+"";
    //                 break;
    //         }}
    //     else if (a[o]==1){
    //         var Page=self.pageview.getCurrentPageIndex();
    //         switch (Page){
    //             case 0:
    //                 var anim3=self.animation[0].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation2[0].node.active=false;
    //                 self.animation2[6].node.active=false;
    //                 var money=cc.instantiate(self.animationM[3]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-300,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-(-500)+"";
    //                 break;
    //             case 1:
    //                 var anim3=self.animation[0].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation2[0].node.active=false;
    //                 self.animation2[6].node.active=false;
    //                 var money=cc.instantiate(self.animationM[4]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-300,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-(-5000)+"";
    //                 break;
    //             case 2:
    //                 var anim3=self.animation[0].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation2[0].node.active=false;
    //                 self.animation2[6].node.active=false;
    //                 var money=cc.instantiate(self.animationM[5]);
    //                 self.node.addChild(money);
    //                 money.setPosition(-300,-238);
    //                 var moveby=cc.moveBy(0.4,cc.p(0,35));
    //                 var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //                 var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //                 money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //                 var Str=parseInt(self.label.string);
    //                 self.label.string=""+Str-(-50000)+"";
    //                 break;
    //         }
    //     }
    //
    // },
    mousedown1:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if (a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[1].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[1].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-1000+"";
                    break;
            }
        }else if(a[o]==1){
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[1].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[1].node.active=false;
                    self.animation2[7].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[1].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[1].node.active=false;
                    self.animation2[7].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[1].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[1].node.active=false;
                    self.animation2[7].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    mousedown2:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if (a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[2].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[2].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-1000+"";
                    break;
            }
        }else if(a[o]==1){
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[2].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[2].node.active=false;
                    self.animation2[8].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[2].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[2].node.active=false;
                    self.animation2[8].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[2].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[2].node.active=false;
                    self.animation2[8].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    mousedown3:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if (a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[3].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[3].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-1000+"";
                    break;
            }
        }else if(a[o]==1){
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[3].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[3].node.active=false;
                    self.animation2[9].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[3].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[3].node.active=false;
                    self.animation2[9].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[3].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[3].node.active=false;
                    self.animation2[9].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    mousedown4:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if (a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[4].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[4].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-1000+"";
                    break;
            }
        }else if(a[o]==1){
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[4].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[4].node.active=false;
                    self.animation2[10].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[4].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[4].node.active=false;
                    self.animation2[10].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[4].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[4].node.active=false;
                    self.animation2[10].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    mousedown5:function () {
        var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
        var o=Math.floor(Math.random()*a.length);
        var self=this;
        if (a[o]==0){
            var Page=self.pageview.getCurrentPageIndex();
            var anim2 = self.animation2[5].getComponent(cc.Animation);
            anim2.playAdditive();
            var anim = self.animation[5].getComponent(cc.Animation);
            anim.playAdditive('daji');
            switch (Page){
                case 0:
                    var money=cc.instantiate(self.animationM[0]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-10+"";
                    break;
                case 1:
                    var money=cc.instantiate(self.animationM[1]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-100+"";
                    break;
                case 2:
                    var money=cc.instantiate(self.animationM[2]);
                    self.node.addChild(money);
                    money.setPosition(-218,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(this.label.string);
                    this.label.string=""+Str-1000+"";
                    break;
            }
        }else if(a[o]==1){
            var Page=self.pageview.getCurrentPageIndex();
            switch (Page){
                case 0:
                    var anim3=self.animation[5].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[5].node.active=false;
                    self.animation2[11].node.active=false;
                    var money=cc.instantiate(self.animationM[3]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-500)+"";
                    break;
                case 1:
                    var anim3=self.animation[5].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[5].node.active=false;
                    self.animation2[11].node.active=false;
                    var money=cc.instantiate(self.animationM[4]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-5000)+"";
                    break;
                case 2:
                    var anim3=self.animation[5].getComponent(cc.Animation);
                    anim3.play('Clip2');
                    self.animation2[5].node.active=false;
                    self.animation2[11].node.active=false;
                    var money=cc.instantiate(self.animationM[5]);
                    self.node.addChild(money);
                    money.setPosition(-300,-238);
                    var moveby=cc.moveBy(0.4,cc.p(0,35));
                    var moveby2=cc.moveBy(0.2,cc.p(0,15));
                    var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
                    money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
                    var Str=parseInt(self.label.string);
                    self.label.string=""+Str-(-50000)+"";
                    break;
            }
        }

    },
    // moni:function () {
    //     var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
    //     var o=Math.floor(Math.random()*a.length);
    //     var self=this;
    //     if (a[o]==0){
    //         var y=Math.random()*8;
    //         setTimeout(function () {
    //             var ani=[0,0,1,1,1,1,1,1,2,2,2,2];
    //             var v=Math.floor(Math.random()*ani.length);
    //             var w=ani[v];
    //             switch(w){
    //                 case 0:
    //                     cc.loader.loadRes("img/gulv11", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //                 case 1:
    //                     cc.loader.loadRes("img/gulv22", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //                 case 2:
    //                     cc.loader.loadRes("img/gulv33", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //             }
    //             self.m=Math.floor(Math.random()*6);
    //             switch (self.m){
    //                 case 0:
    //                     self.animation2[6].getComponent(cc.Animation).playAdditive();
    //                     self.animation[0].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 1:
    //                     self.animation2[7].getComponent(cc.Animation).playAdditive();
    //                     self.animation[1].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 2:
    //                     self.animation2[8].getComponent(cc.Animation).playAdditive();
    //                     self.animation[2].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 3:
    //                     self.animation2[9].getComponent(cc.Animation).playAdditive();
    //                     self.animation[3].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 4:
    //                     self.animation2[10].getComponent(cc.Animation).playAdditive();
    //                     self.animation[4].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 5:
    //                     self.animation2[11].getComponent(cc.Animation).playAdditive();
    //                     self.animation[5].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }, y*1000);
    //     }else if(a[o]==1){
    //         switch (self.m){
    //             case 0:
    //                 var anim3=self.animation[0].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[0].node.active=false;
    //                 self.animation2[0].node.active=false;
    //                 self.animation2[6].node.active=false;
    //                 break;
    //             case 1:
    //                 var anim3=self.animation[1].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[1].node.active=false;
    //                 self.animation2[1].node.active=false;
    //                 self.animation2[7].node.active=false;
    //                 break;
    //             case 2:
    //                 var anim3=self.animation[2].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[2].node.active=false;
    //                 self.animation2[2].node.active=false;
    //                 self.animation2[8].node.active=false;
    //                 break;
    //             case 3:
    //                 var anim3=self.animation[3].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[3].node.active=false;
    //                 self.animation2[3].node.active=false;
    //                 self.animation2[9].node.active=false;
    //                 break;
    //             case 4:
    //                 var anim3=self.animation[4].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[4].node.active=false;
    //                 self.animation2[4].node.active=false;
    //                 self.animation2[10].node.active=false;
    //                 break;
    //             case 5:
    //                 var anim3=self.animation[5].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[5].node.active=false;
    //                 self.animation2[5].node.active=false;
    //                 self.animation2[11].node.active=false;
    //                 break;
    //             default:
    //                 break;
    //         }
    //         var money=cc.instantiate(self.animationM[3]);
    //         self.node.addChild(money);
    //         money.setPosition(-400,30);
    //         var moveby=cc.moveBy(0.4,cc.p(0,35));
    //         var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //         var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //         money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //     }
    //
    //
    // },
    // moni2:function () {
    //     var a=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1];
    //     var o=Math.floor(Math.random()*a.length);
    //     var self=this;
    //     self.m=Math.floor(Math.random()*6);
    //     if (a[o]==0){
    //         var y=Math.random()*8;
    //         setTimeout(function () {
    //             var ani=[0,0,1,1,1,1,1,1,2,2,2,2];
    //             var v=Math.floor(Math.random()*ani.length);
    //             var w=ani[v];
    //             switch(w){
    //                 case 0:
    //                     cc.loader.loadRes("img/gulv11", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //                 case 1:
    //                     cc.loader.loadRes("img/gulv22", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //                 case 2:
    //                     cc.loader.loadRes("img/gulv33", cc.SpriteFrame, function (err, spriteFrame) {
    //                         for(let i=0;i<6;i++){
    //                             self.gutou[i].getComponent(cc.Sprite).spriteFrame = spriteFrame;
    //                         }
    //                     });
    //                     break;
    //             }
    //             switch (self.m){
    //                 case 0:
    //                     self.animation2[6].getComponent(cc.Animation).playAdditive();
    //                     self.animation[0].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 1:
    //                     self.animation2[7].getComponent(cc.Animation).playAdditive();
    //                     self.animation[1].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 2:
    //                     self.animation2[8].getComponent(cc.Animation).playAdditive();
    //                     self.animation[2].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 3:
    //                     self.animation2[9].getComponent(cc.Animation).playAdditive();
    //                     self.animation[3].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 4:
    //                     self.animation2[10].getComponent(cc.Animation).playAdditive();
    //                     self.animation[4].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 case 5:
    //                     self.animation2[11].getComponent(cc.Animation).playAdditive();
    //                     self.animation[5].getComponent(cc.Animation).playAdditive('daji');
    //                     break;
    //                 default:
    //                     break;
    //             }
    //         }, y*1000);
    //     }else if(a[o]==1){
    //         switch (self.m){
    //             case 0:
    //                 var anim3=self.animation[0].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[0].node.active=false;
    //                 self.animation2[0].node.active=false;
    //                 self.animation2[6].node.active=false;
    //                 break;
    //             case 1:
    //                 var anim3=self.animation[1].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[1].node.active=false;
    //                 self.animation2[1].node.active=false;
    //                 self.animation2[7].node.active=false;
    //                 break;
    //             case 2:
    //                 var anim3=self.animation[2].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[2].node.active=false;
    //                 self.animation2[2].node.active=false;
    //                 self.animation2[8].node.active=false;
    //                 break;
    //             case 3:
    //                 var anim3=self.animation[3].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[3].node.active=false;
    //                 self.animation2[3].node.active=false;
    //                 self.animation2[9].node.active=false;
    //                 break;
    //             case 4:
    //                 var anim3=self.animation[4].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[4].node.active=false;
    //                 self.animation2[4].node.active=false;
    //                 self.animation2[10].node.active=false;
    //                 break;
    //             case 5:
    //                 var anim3=self.animation[5].getComponent(cc.Animation);
    //                 anim3.play('Clip2');
    //                 self.animation[5].node.active=false;
    //                 self.animation2[5].node.active=false;
    //                 self.animation2[11].node.active=false;
    //                 break;
    //             default:
    //                 break;
    //         }
    //         var money=cc.instantiate(self.animationM[3]);
    //         self.node.addChild(money);
    //         money.setPosition(400,30);
    //         var moveby=cc.moveBy(0.4,cc.p(0,35));
    //         var moveby2=cc.moveBy(0.2,cc.p(0,15));
    //         var fadeto=cc.fadeTo(0.2,0).easing(cc.easeCubicActionIn());
    //         money.runAction(cc.sequence(moveby,cc.spawn(moveby2,fadeto)));
    //     }
    //
    // },
    // update:function () {
    //     var self=this;
    //    if (self.animation2[11].node.active==false&&self.animation2[10].node.active
    //        ==false&&self.animation2[9].node.active==false&&self.animation2[8].node.active
    //        ==false&&self.animation2[7].node.active==false&&self.animation2[6].node.active==false){
    //        this.scheduleOnce(function () {
    //            cc.director.loadScene('sad4');
    //        },3);
    //    }else {
    //        return;
    //    }
    // }
});
