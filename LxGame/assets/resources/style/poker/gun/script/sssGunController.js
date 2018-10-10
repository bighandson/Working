cc.Class({
    extends: cc.Component,

    properties: {
    },

    // use this for initialization
    onLoad: function () {
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on('finished',  this.onFinished,    this);
        // this.animation.on('onCompleted',  this.onCompleted,    this);
    },

    onShow:function(chair,targetPlayerList)
    {
        cc.log("targetPlayerList",targetPlayerList)
        this.chair = chair;
        this.targetPlayerList = targetPlayerList;
        this.index = 0;
        let targetPlayer = targetPlayerList[this.index];
        this.node.active = true;
        this.play(targetPlayer);
    },


    getScale:function(sourceChair,targetChair)
    {
        let scaleArr = [1,1];

        if(sourceChair == 0)
        {
            if(targetChair == 1)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 2)
            {
                // scaleArr[0] = -1;
            }else if(targetChair == 3)
            {
            }else if(targetChair == 4)
            {
            }
        }else if(sourceChair == 1)
        {
            if(targetChair == 0)
            {
            }else if(targetChair == 2)
            {
            }else if(targetChair == 3)
            {
                
            }
            else if(targetChair == 4)
            {
                
            }
        }else if(sourceChair == 2)
        {
            if(targetChair == 0)
            {
            }else if(targetChair == 1)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 3)
            {
            }
            else if(targetChair == 4)
            {
            }
        }else if(sourceChair == 3)
        {
            if(targetChair == 0)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 1)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 2)
            {
                scaleArr[0] = -1;
            }
            else if(targetChair == 4)
            {
            }
        }

        else if(sourceChair == 4)
        {
            if(targetChair == 0)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 1)
            {
                scaleArr[0] = -1;
            }else if(targetChair == 2)
            {
                scaleArr[0] = -1;
            }
            else if(targetChair == 3)
            {
                scaleArr[0] = -1;
            }
        }

        return scaleArr;
    },

    getRotation:function(sourceChair,targetChair)
    {
        let rotation;
        if(sourceChair == 0)
        {
            if(targetChair == 1)
            {
                rotation = -35;
            }else if(targetChair == 2)
            {
                rotation = 90;
            }else if(targetChair == 3)
            {
                rotation = 45;
            }else if(targetChair == 4)
            {
                rotation = 15;
            }
        }else if(sourceChair == 1)
        {
            if(targetChair == 0)
            {
                rotation = -35;
            }else if(targetChair == 2)
            {
                rotation = 35;
            }else if(targetChair == 3)
            {
                rotation = 0;
            }
            else if(targetChair == 4)
            {
                rotation = 35;
            }
        }else if(sourceChair == 2)
        {
            if(targetChair == 0)
            {
                rotation = -65;
            }else if(targetChair == 1)
            {
                rotation = 65;
            }else if(targetChair == 3)
            {
                rotation = 0;
            }
            else if(targetChair == 4)
            {
                rotation = -35;
            }
        }else if(sourceChair == 3)
        {
            if(targetChair == 0)
            {
                rotation = 65;
            }else if(targetChair == 1)
            {
                rotation = 35;
            }else if(targetChair == 2)
            {
                rotation = 0;
            }
            else if(targetChair == 4)
            {
                rotation = -35;
            }
        }else if(sourceChair == 4)
        {
            if(targetChair == 0)
            {
                rotation = 35;
            }else if(targetChair == 1)
            {
                rotation = 0;
            }else if(targetChair == 2)
            {
                rotation = -35;
            }
            else if(targetChair == 3)
            {
                rotation = -65;
            }
        }

        return rotation;
    },

    play:function(targetPlayerNode)
    {
        this.targetPlayerNode = targetPlayerNode;
        // this.targetPlayerNode.active = true;
        this.count = 0;
        //清空
        for(let i = 0;i < 3 ;i++)
        {
            this.targetPlayerNode.getChildByName("holeNode").children[i].active = false;
        }

        this.node.rotation = this.getRotation(this.chair,targetPlayerNode.chair);
        let scaleArr     = this.getScale(this.chair,targetPlayerNode.chair);
        this.node.scaleX =scaleArr[0];

        this.targetPlayerNode.getChildByName("holeNode").active = true;
        let animState = this.animation.play();
        animState.wrapMode = cc.WrapMode.Loop;
        animState.repeatCount = 3;
    },

    onFinished:function()
    {
        this.index += 1;
        if(this.targetPlayerList[this.index] != null)
        {
            this.play(this.targetPlayerList[this.index]);
        }else
        {
            this.node.active = false;
            SssManager.controller.checkGun();
        }
    },

    onStart:function()
    {
        SssManager.soundCtrl.playSound("resources/style/poker/effect/gun.mp3");
    },

    onCompleted:function()
    {
        this.targetPlayerNode.getChildByName("holeNode").children[this.count].active = true;
        ++this.count;
    },
});
