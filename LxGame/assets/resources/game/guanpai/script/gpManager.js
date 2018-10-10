window.gpManager = {
    controller:null,
    rule:null,
    designResolution:null,
    isResLoadComplete:false,
    pokersPrefabPos: [cc.p(500,125),cc.p(900,341),cc.p(500,400),cc.p(130,341)],
    mySeatId:1,
    msgRCMDQueue :[
        'RCMD_Start',
        'RCMD_Ready',
        'RCMD_exit',
        'RCMD_Kick',
        'RCMD_close',
        'RCMD_Timeout',
        "RCMD_Result",
        "RCMD_Command",//通用协议
        'RCMD_Expend' ,
        'RCMD_MatchOver',
    ],


    msgRCMDList : [
        'RCMD_signup',
        'RCMD_MobileSignUp',
        'RCMD_PlayerStatus',
        'RCMD_initParam',
        'RCMD_ServerHeartOut',
        'RCMD_TaskSeat',
        'RCMD_SitIn',
    ],

    MAX_PLAYERS : 4,

    getCardTypeNum:function(card) {
        var arr=[];
        if (card == 0x10) {
            arr[0]=0;
            arr[1]=16;
            arr[2]=card;
        }
        else if( card == 0x11)
        {
            arr[0]=0;
            arr[1]=17;
            arr[2]=card;
        }
        else {
            //(byte)(card&0xC0);
            var color = (card & 0xC0) >> 6;
            var value = (card & 0x3F);
            arr[0]=color+1;
            arr[1]=value;
            arr[2]=card;
        }
        return arr;
    },

    // for(var num = 3;num<=14;num++)
    // {
    //     let temp=[];
    //     let count=0;
    //     for(var i = 0;i<pokers.length;i++)
    //     {
    //         let x=this.getPokerNumByPoker(pokers[i]);
    //         if(x==num)
    //         {
    //             count += 1;
    //         }
    //     }

    //     temp.push(num);
    //     temp.push(count);



    //     pokersArr.push(temp);

    // }


    //by Amao 解析牌值,返回当前类型比对 最小值
    getCardMinnum:function(type,cards) {
        var sanList = []
        if (type == 6 || type == 9 || type == 8 || type == 10) { // 三代二
            for (var i = 3; i < 15; i++) {
                var count = 0

                for (var k = cards.length - 1; k >= 0; k--) {
                    let temp = gpManager.getCardTypeNum(cards[k])[1];
                    if (temp == i) {
                        count += 1;
                    }
                }

                if (count >= 3) {
                    sanList.push(i)
                }
            }

            sanList.sort(function (a,b) {
                return a > b;
            })
        }
        return sanList[0];
    },

    /**
     * @param arr
     * @param num
     * @returns {Array}
     */
    combination:function(arr, num)
    {
        var r=[];
        (function f(t,a,n)
        {
            if (n==0)
            {
                return r.push(t);
            }
            for (var i=0,l=a.length; i<=l-n; i++)
            {
                f(t.concat(a[i]), a.slice(i+1), n-1);
            }
        })([],arr,num);
        return r;
    },



};


