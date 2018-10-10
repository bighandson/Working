var config = require("Config");
cc.Class({
    extends: cc.Component,

    properties: {
      
    },
    onLoad: function () {

    },
    onButtonClick:function(event, customData){
        switch(customData){
            case 'skip':
                cc.log('skip dazhouLobbyScene');
                cc.director.loadScene(config.lobbyScene);
                break;
            default:
                break;
        }
    },
});
