
var config = require('Config');
var GamePlayer = require('GamePlayer');
var LoadGame = require('LoadGame');
cc.Class({
    extends: cc.Component,

    properties: {
       contentrank:cc.Node,
    },

    // use this for initialization
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, function () {
        });
    },
    /**
     * @param roomuserid  房主
     * @param users
     * [
     * {
     *      userid : 12344,
     *      wins : 4,
     *      score : 100
     * },
     *  {
     *      userid : 12345,
     *      wins : 4,
     *      score : 100
     * }
     * ]
     */
    setVisible:function(_Charid,bVisbile)
    {
        this.contentrank.children[_Charid].active  =bVisbile;
        this.game = LoadGame.getCurrentGame();
    },
    show : function (roomuserid,users) {
        let self = this;
        if(!users){
            return
        }
        this.users = users;
        this.roomuserid = roomuserid;

        users.sort(function (a, b) {
            return b.score - a.score;
        });

        for(let i = 0;i<users.length;i++){
            var data =GamePlayer.getPlayer(users[i].userid);
            getSpriteFrameByUrl(data.userImage, function (err, spriteFrame) {
                if (err) {
                    return;
                }
                self.contentrank.children[i].children[1].getComponent(cc.Sprite).spriteFrame = spriteFrame;
            });
            self.contentrank.children[i].children[1].children[0].children[0].getComponent(cc.Label).string = data.nick;
            self.contentrank.children[i].children[2].getComponent(cc.Label).string = '胜局： '+users[i].wins;
            self.contentrank.children[i].children[3].active = (users[i].userid==roomuserid);
            self.contentrank.children[i].children[5].getComponent(cc.Label).string =users[i].score ;
            self.contentrank.children[i].active = true;
        }
    },

    onexitroom:function () {
        this.onClose();
    },
    setroomid:function(roomid)
    {
        this.m_roomid = roomid
    },
    onshareClick:function () {
        // var path = 'youxi/gandengyan/prefab/shareranking/sharerangking' ;
        // var self = this;
        // cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
        //     //hideLoadingAni();
        //     if (err) {
        //         cc.log(err);
        //         return;
        //     }
        //     //self.node.active = false;
        //     var module = cc.instantiate(prefab);
        //     //module.x = cc.winSize.width / 2;
        //     //module.y = cc.winSize.height / 2;
        //     module.parent = self.node.parent;
        //     module.parent = self.node.parent;
        //     module.getComponent('ShareCardControllergdy').show(self.roomuserid,self.users,self.m_roomid);
        // });

        let playerData;
        let descript = (this.game.shareName || this.game.name);
        descript += ' 房号:'+this.m_roomid+'\n';
        for(let i = 0; i < this.users.length; ++i){
            descript += this.users[i].nick+"("+this.users[i].userid+")  输赢:"+this.users[i].score+"\n";
        }

        this.shareText ='【'+descript+'】';
        let self = this;
        cc.loader.loadRes('style/style2/prefab2/gameShare/gameShare',cc.Prefab,function(error,prefab){
            if (error) {
                cc.error(error.message || error);
                return;
            }
            cc.log('加载成功')
            var module = cc.instantiate(prefab);
            module.x = cc.winSize.width / 2;
            module.y = cc.winSize.height / 2;
            module.parent = cc.director.getScene();
            var controller = module.getComponent("gameShareScript");
            controller.setText(self.shareText,1);
        });
    },

    onShow : function () {
        this.node.active = true;
    },
    
    onClose : function () {
        this.node.removeFromParent(true);
        let backscene = !!config.roomScene ? config.roomScene : config.lobbyScene;
        cc.director.loadScene(backscene);
    },

    onDestroy : function () {
        //GlobEvent.removeAllListeners('PREFAB_SHOW');
    }
    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
