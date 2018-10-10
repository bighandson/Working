
var config = require('Config');
cc.Class({
    extends: cc.Component,

    properties: {
        sliderSound:cc.Slider,
        sliderEffect:cc.Slider,
        sound_onoff:cc.Toggle,
        effect_onoff:cc.Toggle,
        barEffect:cc.ProgressBar,
        barSound:cc.ProgressBar,
        hall : cc.Node,
        game : cc.Node,
        LanguageSound:cc.Toggle,
        singleclick:cc.Toggle,
    },

    // use this for initialization
    onLoad: function () {
        // volume_sound
        let volume_sound = SettingMgr.getBgVolume();
        this.sliderSound.progress = volume_sound ;
        this.sliderSound.node.on('slide',this.soundSlider,this);
        let soundprogress = this.sliderSound.node.getComponent('SliderProgress');
        soundprogress.setSlider(volume_sound);
        if (volume_sound>0){
            this.sound_onoff.uncheck();
        }

        // volume_effect
        let volume_effect = SettingMgr.getEffectVolume();
        this.sliderEffect.progress = volume_effect ;
        this.sliderEffect.node.on('slide',this.effectSlider,this);
        let effectprogress = this.sliderEffect.node.getComponent('SliderProgress');
        effectprogress.setSlider(volume_effect);
        if (volume_effect>0){
            this.effect_onoff.uncheck()
        }
        this.hall.active = true;
        this.game.active = false;
        GlobEvent.on('SettingShow',this.onShow.bind(this));
        this.node.on(cc.Node.EventType.TOUCH_START,function () {
        });
    },

    gameIn:function (gameid) {
        this.hall.active = false;
        this.game.active = true;
        let game = config.games[gameid];

        // let languagetype;  //0方 1普
        if(!!game.LanguageSound && !!game.LanguageSound.length){
            this.game.getChildByName('fangyan').active = game.LanguageSound[0];
            this.languagetype = game.LanguageSound[1];
            this.languagetype = parseInt(cc.sys.localStorage.getItem('LanguageSound') || this.languagetype);
        }else {
            this.game.getChildByName('fangyan').active = true;
            this.languagetype = parseInt(cc.sys.localStorage.getItem('LanguageSound') || 0);
        }
        cc.log('languagetype',!this.languagetype)
        this.LanguageSound.isChecked = !this.languagetype;

        // let singletype;  //  0双 1单
        if(!!game.SingleClick && !!game.SingleClick.length){
            this.game.getChildByName('danji').active = game.SingleClick[0];
            this.singletype = game.SingleClick[1];
            this.singletype = parseInt(cc.sys.localStorage.getItem('SingleClick') || this.singletype);
        }else {
            this.game.getChildByName('danji').active = true;
            this.singletype = parseInt(cc.sys.localStorage.getItem('SingleClick') || 0);
        }
        cc.log('singletype',!!this.singletype)
        this.singleclick.isChecked = !!this.singletype;
    },

    onLanguageClick: function () {

        if(this.languagetype == 0){
            this.languagetype = 1;
            cc.sys.localStorage.setItem('LanguageSound','1')
        }else{
            this.languagetype = 0;
            cc.sys.localStorage.setItem('LanguageSound','0')
        }
        this.LanguageSound.isChecked = !this.languagetype;
        GlobEvent.emit('LANGUAGE_CHANGE',this.languagetype);
    },

    onSingleClick:function(){
        if(this.singletype==0){
            this.singletype = 1;
            cc.sys.localStorage.setItem('SingleClick','1');
        }else{
            this.singletype = 0;
            cc.sys.localStorage.setItem('SingleClick','0');
        }
        cc.log('singletype',!!this.singletype)
        this.singleclick.isChecked = !!this.singletype;
        GlobEvent.emit('SINGLE_CHANGE',this.singletype);

    },

    soundSlider : function () {
      let progress = this.sliderSound.progress;
      SettingMgr.setBgVolume(progress);
      if(progress==0 && !this.sound_onoff.isChecked){
          this.sound_onoff.check()
      }else if (progress>0 &&this.sound_onoff.isChecked){
          this.sound_onoff.uncheck();
      }
    },

    effectSlider : function () {
        let progress = this.sliderEffect.progress;
        SettingMgr.setEffectVolume(progress);
        if(progress==0 && !this.effect_onoff.isChecked){
            this.effect_onoff.check()
        }else if (progress>0 &&this.effect_onoff.isChecked) {
            this.effect_onoff.uncheck();
        }
    },

    onbutton1Click:function(){
        pomelo.removeAllListeners();
        if(!!PomeloClient.isConnected){
            pomelo.disconnect();
        }
        PomeloClient.isConnected = false;
        cc.director.loadScene(config.loginScene);
        //切换账号 清除私有信息
        GlobEvent.emit('ClearMessage');
    },

    onbuttoneffectClick:function(event){
        let progress = this.sliderEffect.progress;
        let isChecked = this.effect_onoff.isChecked;
        if (isChecked){
            progress = 0;
        }else if(this.sliderEffect.progress<0.001&&!isChecked){
            progress = 1;
        }
        SettingMgr.setEffectVolume(progress);
        let effectprogress = this.sliderEffect.node.getComponent('SliderProgress');
        effectprogress.setSlider(progress);

    },
    onbuttonsoundClick:function(){
        let progress = this.sliderSound.progress;
        let isChecked = this.sound_onoff.isChecked;
        if (isChecked){
            progress = 0;
        }else if(this.sliderSound.progress <0.001&&!isChecked){
            progress =0.3;
        }
        SettingMgr.setBgVolume(progress);
        let soundprogress = this.sliderSound.node.getComponent('SliderProgress');
        soundprogress.setSlider(progress);
    },
    onprotocolClick:function () {

        loadPrefab("hall/Protocol/Protocol",function (module) {

            // module.getComponent('noticeScript').initData({})
            
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();

            module.getChildByName('box').runAction(cc.sequence(cc.scaleTo(0.1,1.1),cc.scaleTo(0.1,1)))
        });

        // this.node.active = false;
        // var path = '{0}/prefab/Protocol'.format(config.resourcesPath);
        // loadPrefab(path);
    },
    onaboutClick:function () {
        //this.node.active = false;
        showAlertBox('版本号：'+config.version)
    },
    onDestroy : function () {
        GlobEvent.removeAllListeners('SettingShow');
    },
    onClose : function () {
        this.node.removeFromParent();
    },
    onShow : function () {
        this.node.active = true;
    },




    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
