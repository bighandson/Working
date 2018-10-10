window._MJLanguageSoundValue = null;

//游戏管理类
function getMJLanguageSound() {
    if (_MJLanguageSoundValue == null) {
        _MJLanguageSoundValue = getLocalItem("LanguageSound");
        _MJLanguageSoundValue = _MJLanguageSoundValue == null ? 0 : parseInt(_MJLanguageSoundValue)
    }
    return _MJLanguageSoundValue;
}


function setMJLanguageSound(value) {
    _MJLanguageSoundValue = parseInt(value);
    setLocalItem("LanguageSound", _MJLanguageSoundValue);
}

/**
 *
 * @param sex 性别
 * @param id 播放编号
 */
function playChatVoice(sex, id, game, chair) {
    cc.log('选择播放')
    var url
    var chatSound = game.chatSound;
    var config = require('Config');
    if (game.gameid == 303) {
        //方言
        var ran;
        
        if (parseInt(sex) == 1) {
            ran = (Math.random() * 10 + 1) % 3;
            url = chatSound + "/chat_" + id + "_" + parseInt(ran) + ".mp3";
        } else {
            ran = (Math.random() * 10 + 1) % 2 + 3;
            url = chatSound + "/chat_" + id + "_" + parseInt(ran) + ".mp3";
        }
        cc.log("方言 = " + url);
    } else if (game.gameid == 164 && config.jgm == '013' ) {
        if (_MJLanguageSoundValue == 1) {
            //普通话
            //暂时都是普通话
            if (parseInt(sex) == 1)
            {
                url = "resources/style/chat/effect/chat/chatBubble/voice/chat_" + id + "_1.mp3";
            } else {
                url = "resources/style/chat/effect/chat/chatBubble/voice/chat_" + id + "_2.mp3";
            }
        } else {
            var num = getMJLanguageSound();
            if (parseInt(sex) == 1) {
                url = chatSound + '/' + num + "/chat_" + id + "_1.mp3";
            } else {
                
                url = chatSound + '/' + num + "/chat_" + id + "_2.mp3";
            }
            cc.log("方言 = " + url);
        }

    } 
    // else if (game.gameid == 154) {
    //     if (_MJLanguageSoundValue == 1 || chatSound == null) {
    //         //普通话
    //         //暂时都是普通话
    //         if (parseInt(sex) == 1) {
    //             url = "resources/common/effect/chat/chatBubble/voice/chat_" + id + "_1.mp3";
    //         } else {
    //             url = "resources/common/effect/chat/chatBubble/voice/chat_" + id + "_2.mp3";
    //         }
    //     } else {
    //         var index = chair % 4;
    //         var index2 = 0;
    //         switch (index) {
    //             case 0:
    //             case 2:
    //                 index2 = 0;
    //                 
    //                 break;
    //             case 1:
    //                 index2 = 1;
    //                 break;
    //             case 3:
    //                 index2 = 2;
    //                 break;

    //         }
    //         var id2 = id + 14 * index2;
    //         
    //         //方言
    //         if (parseInt(sex) == 1) {
    //             url = chatSound + "/chat_" + id2 + "_1.mp3";
    //         } else {
    //             url = chatSound + "/chat_" + id2 + "_2.mp3";
    //         }
    //         cc.log("方言 = " + url);
    //     }
    // } 
    else {
        if (!game.cfgchat) {
            if (parseInt(sex) == 1) {
                url = "resources/style/chat/effect/chat/chatBubble/voice/chat_" + id + "_1.mp3";
            } else {
                url = "resources/style/chat/effect/chat/chatBubble/voice/chat_" + id + "_2.mp3";
            }
        } else if (!!game.cfgchat && !!game.chatSound && !!game.chatSoundpu) {
            if (_MJLanguageSoundValue == 1) {
                //普通话
                //暂时都是普通话
                if (parseInt(sex) == 1) {
                    url = game.chatSoundpu + "/chat_" + id + "_1.mp3";
                } else {
                    url = game.chatSoundpu + "/chat_" + id + "_2.mp3";
                }
            } else {
                //方言
                if (parseInt(sex) == 1) {
                    url = game.chatSound + "/chat_" + id + "_1.mp3";
                } else {
                    url = game.chatSound + "/chat_" + id + "_2.mp3";
                }
                cc.log("方言 = " + url);
            }
        } else if (!!game.cfgchat && !!game.chatSound) {
            if (parseInt(sex) == 1) {
                url = game.chatSound + "/chat_" + id + "_1.mp3";
            } else {
                url = game.chatSound + "/chat_" + id + "_2.mp3";
            }
            cc.log("方言 = " + url);
        }


    }

    SettingMgr.playSound(url);
}