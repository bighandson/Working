
window.SettingMgr = {
    bgId  : -1,
    bgStatus : true,
    soundStatus : true,
    bgKey       : 'backmusic',
    effectKey   : 'effectKey',
    /**
     * 设置背景声音状态
     * @param isOn
     */
    setBgStatus : function (isOn) {
        if(this.bgStatus == isOn){
            return;
        }

        if(this.bgStatus){
            this.resumeBg();
        }else{
            this.stopBg();
        }
    },

    /**
     *
     * @returns {boolean}
     */
    getBgStatus : function () {
        return this.bgStatus;
    },

    /**
     * 设置音效状态
     */
    setSoundStatus : function (isOn) {
        this.soundStatus = isOn;
    },

    /**
     * 播放背景声音
     */
    playBg : function (pathfile) {
       if(!this.bgStatus) return;
        if(this.bgId == -1){
            var url = cc.url.raw(pathfile);
            var v = this.getBgVolume();
            this.bgId = cc.audioEngine.play(url,true,v);
        }else {
            cc.audioEngine.resume(this.bgId);
        }
    },
    
    resumeBg : function () {
        if(this.bgId >= 0){
            cc.audioEngine.resume(this.bgId);
        }
    },
    
    pauseBg : function () {
        if(this.bgId >= 0){
            cc.audioEngine.pause(this.bgId);
        }
    },
    
    stopBg : function () {
        if(this.bgId >= 0){
            cc.audioEngine.stop(this.bgId);
            this.bgId = -1;
            this.setBgStatus(false);
        }
    },

    playSound : function (url) {
        if(!this.soundStatus) return;
        var sound = cc.url.raw(url);
        var v = this.getEffectVolume();
        cc.audioEngine.play(sound,false,v);
    },
    playSoundByMp3 : function (mp3) {
        if(!this.soundStatus) return;
        var v = this.getEffectVolume();
        cc.audioEngine.play(mp3,false,v);
    },
    stopSound : function (soundid) {
        if(!this.soundStatus) return;
        if(!soundid) return;
        cc.audioEngine.stop(soundid);
    },

    // android切换后台
    onPause : function () {
        if(this.bgId >= 0){
            cc.audioEngine.setVolume(this.bgId,0);
        }
    },

    // android切换到前台
    onResume : function () {
        if(this.bgId >= 0 && this.bgStatus){
            var volume = this.getBgVolume();
            cc.audioEngine.setVolume(this.bgId,volume);
        }
    },
    
    // 设置背景声音音量
    setBgVolume : function (volue) {
        if (volue < 0 || volue > 1){
            return;
        }
        if (this.bgId >= 0){
            cc.audioEngine.setVolume(this.bgId,volue);

        }

        cc.sys.localStorage.setItem(this.bgKey,volue);
        this.soundVolume = volue;
    },

    // 获取背景音量
    getBgVolume : function () {
         return cc.sys.localStorage.getItem(this.bgKey) || 0.3;
    },

    // 设置音效
    setEffectVolume : function (volue) {
        if (volue < 0 || volue > 1){
            return;
        }
        cc.sys.localStorage.setItem(this.effectKey,volue);
        this.effectVolume = volue;
    },
    //获取音效
    getEffectVolume : function () {

          return cc.sys.localStorage.getItem(this.effectKey) || 1;

       // return cc.sys.localStorage.getItem(this.effectKey) || 1;
    }
};