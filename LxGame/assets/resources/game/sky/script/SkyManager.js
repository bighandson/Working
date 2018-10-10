window.SkyManager = {
    controller:null,
    rule:null,
    autoplaySign : false,
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
        // 'RCMD_initParam',
        'RCMD_ServerHeartOut',
        // 'RCMD_TaskSeat',
        'RCMD_SitIn',
    ],

    MAX_PLAYERS : 4,

    getCardTypeNum:function(card) {
        var arr=[];
        if (card == 0x10) {
            arr[0]=1;
            arr[1]=16;
            arr[2]=card;
        }
        else if( card == 0x11)
        {
            arr[0]=2;
            arr[1]=17;
            arr[2]=card;
        }
        else {
            //(byte)(card&0xC0);
            // var color = (card & 0xC0) >> 6;
            // var value = (card & 0x3F);
            var color = (card & 0x0f);
            var value = (card & 0xf0)>>4;
            arr[0]=color;
            arr[1]=value;
            arr[2]=card;
        }
        return arr;
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