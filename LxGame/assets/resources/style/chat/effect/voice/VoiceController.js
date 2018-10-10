
/**
 *  语音聊天控制接口
 */

var config = require('Config');
var LoadGame = require('LoadGame');//.getCurrentGame();
const CfgGame = require("CfgGame");

cc.Class({
    extends: cc.Component,

    properties: {
        animPrefab : cc.Prefab
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START,this.onVoiceTouchStart,this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this.onVoiceTouchMove,this);
        this.node.on(cc.Node.EventType.TOUCH_END,this.onVoiceTouchEnd,this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.onVoiceTouchCancel,this);

        this._isPlayingAudio = false;
        this._isRecording = false;
        this._recordTime = 0;
        pomelo.on('RCMD_Voice',this.RCM_Voice.bind(this));

        this.msgList = [];  //语音队列
        // 语音上传
        GlobEvent.on('UploadAudio',this.uploadAudio.bind(this));
        // 语音播放完成
        GlobEvent.on('AudioPlay',this.audioPlayCallback.bind(this));

        this.currentGame = LoadGame.getCurrentGame();
        this.controller = cc.find('Canvas/controller');
    },

    onVoiceTouchStart : function () {
        if(this.nextCd && this.nextCd > getTimestamp())
        {
            showAlert(CfgGame.alertData.CHAT_VOICE_CD);
            return;
        }else
        {
            this.nextCd = getTimestamp() + CfgGame.cdData.CD_TIME;
        }
        cc.log('onVoiceTouchStart');
        this.startRecord();
    },

    onVoiceTouchMove : function (event) {
        cc.log('onVoiceTouchMove');
        if(!this._isRecording){
            return;
        }
        let distance = cc.pDistance(event.getLocation(),event.getStartLocation());
        if(distance > this.node.width){
            this.cancelRecord();
        }
    },

    onVoiceTouchEnd : function () {
        cc.log('onVoiceTouchEnd');
        if(!this._isRecording){
            return;
        }
        this.changeRecordStatus(false);
        this.stopRecord();
    },

    onVoiceTouchCancel : function () {
        cc.log('onVoiceTouchCancel');
        if(!this._isRecording){
            return;
        }
        this.changeRecordStatus(false);
        this.stopRecord();
    },

    RCM_Voice : function (data) {
        cc.log('RCM_Voice',this._isPlayingAudio);
        if(!this._isPlayingAudio && !this._isRecording){
            cc.log('直接播放');
            this._isPlayingAudio = true;
            this._playVoice(data);
        }else {
            cc.log('放入播放列表');
            this.msgList.push(data);
        }
    },

    /**
     * 开始录制
     */
    startRecord : function () {
        if(this._isPlayingAudio || this._isRecording){
            return;
        }

        cc.audioEngine.pauseAll();
        // 上传路径
        this._isRecording = true;
        NativeAudio.startRecord(config.weburl + '/upload');
        this.displayVoiceAnim();
    },

    /**
     *  停止录制
     */
    stopRecord : function () {
        if(this._recordTime < 1.5){   // 最少录制1s
            this.cancelRecord();
            return;
        }
        this.hideVoiceAnim();
        NativeAudio.stopRecord();
        cc.audioEngine.resumeAll();

    },

    /**
     * 取消录制
     */
    cancelRecord : function () {
        NativeAudio.cancelRecord();
        this.hideVoiceAnim();
        cc.audioEngine.resumeAll();
    },

    /**
     * 显示播放声音
     * @param userid
     */
    displayVoiceTips : function (userid) {
        this.controller.emit('DISPLAY_VOICE',{
            userid : userid
        });
    },

    /**
     * 隐藏播放语音提示
     */
    hideVoiceTips : function () {

        this.controller.emit('HIDE_VOICE');
    },

    displayVoiceAnim : function () {
        if(!this._voiceTips){
            this._voiceTips = cc.instantiate(this.animPrefab);
            // 计算位置
            // let worldPos = ;
            // let pos = this.node.convertToNodeSpace(worldPos);
            // cc.log('displayVoiceAnim display',pos);
            this._voiceTips.setPosition(cc.p(1334/2,750/2));
            this._voiceTips.parent = this.controller;
            this._voiceProgress = this._voiceTips.children[1].getComponent(cc.ProgressBar);
        }

        this._voiceTips.active = true;
        this._voiceProgress.progress = 0;
        this._recordTime = 0;
        this.schedule(this.updateProgress,0.1);
    },

    hideVoiceAnim : function () {
        this._voiceTips.active = false;
        this._voiceProgress.progress = 0;
        this.unschedule(this.updateProgress);
    },

    changeRecordStatus : function (status) {
        // 等待1s,文件上传
        this.scheduleOnce(function () {
            cc.log(this._isRecording);
            this._isRecording = status;
            this.audioPlayCallback();
        }.bind(this),1.0);

        // if(!!this._voiceTips) this._voiceTips.active = status;
    },


    updateProgress : function () {
        if(!!this._isRecording){
            this._recordTime += 0.1;
            this._voiceProgress.progress = this._recordTime/15;
            if(this._recordTime >= 15){  // 最多录制15s
                this.stopRecord();
            }
        }
    },

    /**
     *
     * @param flag 0 上传成功  其他上传失败
     * @param url 上传文件
     */
    uploadAudio : function (flag,url,time) {
        cc.log('uploadAudio',flag,url,time)
        if(flag == 0 ){
            if(time>=1500){
                cc.log(this.currentGame.server+'.CMD_Voice');
                PomeloClient.request(this.currentGame.server+'.CMD_Voice',{
                    voice : url
                },function (data) {
                    cc.log(data);
                });
            }else{
                showAlert('录音时间不能少于1.5s')
            }

        }
    },

    /**
     * 语音播放完成
     */
    audioPlayCallback : function () {
        cc.log('播放下一条语音','audioPlayCallback===========');
        this.hideVoiceTips();

        // 播放下一条语音
        let msg = this.msgList.shift();
        if(!msg){
            cc.audioEngine.resumeAll();
            this._isPlayingAudio = false;
            return;
        }else {
            this._playVoice(msg);
        }

    },

    _playVoice : function (data) {
        this._isPlayingAudio = true;
        this.displayVoiceTips(data.userid);

        //播放语音
        cc.audioEngine.pauseAll();
        var url = data.voice;
        if(!isUrl(url)){
            url = config.weburl + data.voice;
        }
        NativeAudio.playAudio(url);
    },

    // 销毁
    onDestroy : function () {
        cc.log('Voice controller close');
        GlobEvent.removeAllListeners('UploadAudio');
        GlobEvent.removeAllListeners('AudioPlay');
        pomelo.removeAllListeners('RCMD_Voice');
    }
});
