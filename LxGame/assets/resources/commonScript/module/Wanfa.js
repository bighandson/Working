

var getWanfa = function(game,ruleFlag,bAll)
{
    var wanfaStr= '';
    if(game.gameid == 161){
        wanfaStr += "玩法：";
        let jiesuan1 = game.createRoom.wanfa1;
        for(let i = 0; i < jiesuan1.length;i++)
        {
            let item = jiesuan1[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
                cc.log(wanfaStr)
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
        }
        wanfaStr += "\n模式：";
        let jiesuan2 = game.createRoom.wanfa2;
        for(let i = 0; i < jiesuan2.length;i++)
        {
            let item = jiesuan2[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
            cc.log( wanfaStr)
        }
        wanfaStr += "\n规则：";
        let jiesuan3 = game.createRoom.wanfa3;
        for(let i = 0; i < jiesuan3.length;i++)
        {
            let item = jiesuan3[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
        }
        // wanfaStr += "\n支付：";
        // let jiesuan4 = game.createRoom.zhifu;
        // for(let i = 0; i < jiesuan4.length;i++)
        // {
        //     let item = jiesuan4[i];
        //     if(bAll && item.data < 0){
        //         wanfaStr +=  item.name + "  " ;
        //     }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
        //         wanfaStr +=  item.name + "  " ;
        //     }
        // }

    }else if(game.gameid == 164){
        wanfaStr += "人数：";
        let jiesuan1 = game.createRoom.renshu;
        for(let i = 0; i < jiesuan1.length;i++)
        {
            let item = jiesuan1[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
                cc.log(wanfaStr)
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
        }
        wanfaStr += "\n玩法：";
        let jiesuan2 = game.createRoom.wanfa;
        for(let i = 0; i < jiesuan2.length;i++)
        {
            let item = jiesuan2[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
            cc.log( wanfaStr)
        }

    }else if (game.gameid == 165){
        wanfaStr += "人数：";
        let jiesuan1 = game.createRoom.renshu;
        for(let i = 0; i < jiesuan1.length;i++)
        {
            let item = jiesuan1[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
                cc.log(wanfaStr)
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
        }
    }else if (game.gameid == 301 || game.gameid == 303 || game.gameid == 305){
        wanfaStr += "人数：";

        wanfaStr +=parseInt((ruleFlag&0x03))+2+"人  ";

        wanfaStr += "玩法：";

            if((ruleFlag & 0x04) == 0x04) {
                wanfaStr += "红波浪模式" + "  " ;
            }else {
                wanfaStr += "特殊牌型" + "  " ;
            }


    }
    else {
        wanfaStr = '结算：';
        let wanfa = game.createRoom.wanfa;
        bAll = bAll || false;
        for(let i = 0; i < wanfa.length;i++)
        {
            let item = wanfa[i];

            if(bAll && item.data < 0){ // -1 选项
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data)
            {
                wanfaStr +=  item.name + "  " ;
            }
        }

        wanfaStr += "\n玩法：";
        let jiesuan = game.createRoom.kexuan;
        for(let i = 0; i < jiesuan.length;i++)
        {
            let item = jiesuan[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
        }

    }
    return wanfaStr;
}
var getWan = function(game,ruleFlag,bAll) {
    var wanfaStr= '';
    if(game.gameid == 161) {
        wanfaStr += "玩法：";
        let jiesuan1 = game.createRoom.wanfa1;
        for (let i = 0; i < jiesuan1.length; i++) {
            let item = jiesuan1[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
                cc.log(wanfaStr)
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
    }
    else if(game.gameid == 169)
    {
        var wanfa =  Math.floor( (ruleFlag %100)/10 );
        for( let i = 0 ; i < game.createRoom.wanfa.length; i++ )
        {
            let item = game.createRoom.wanfa[i];
            if( item.data == wanfa )
            {
                wanfaStr += item.name;
            }
        }
    }
    else if(game.gameid == 164||game.gameid == 165) {
        wanfaStr += "玩法：";
        let jiesuan1 = game.createRoom.wanfa;
        for (let i = 0; i < jiesuan1.length; i++) {
            let item = jiesuan1[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
                cc.log(wanfaStr)
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
    }else if (game.gameid == 301 || game.gameid == 303 || game.gameid == 305){
        wanfaStr += "人数：";

        wanfaStr +=parseInt((ruleFlag&0x03))+2+"人  ";

        wanfaStr += "玩法：";

            if((ruleFlag & 0x04) == 0x04) {
                wanfaStr += "红波浪模式" + "  " ;
            }else {
                wanfaStr += "特殊牌型" + "  " ;
            }


    }else if(game.gameid == 306) {
        wanfaStr += "玩法：";
        let wanfa = game.createRoom.wanfa2;
        for (let i = 0; i < wanfa.length; i++) {
            let item = wanfa[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
                cc.log(wanfaStr)
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
        cc.log(wanfaStr)
    }else if(game.gameid == 309) {
        wanfaStr += "玩法：";
        let wanfa = game.createRoom.wanfa2;
        for (let i = 0; i < wanfa.length - 1; i++) {
            let item = wanfa[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
                cc.log(wanfaStr)
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
        cc.log(wanfaStr)
    }else {
        wanfaStr = "玩法：";
        let jiesuan = game.createRoom.kexuan;
        for (let i = 0; i < jiesuan.length; i++) {
            let item = jiesuan[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
    }

    return wanfaStr;
};
var getSuan = function(game,ruleFlag,bAll) {
    var wanfaStr = '';
    if(game.gameid == 161) {
        wanfaStr += "模式：";
        let jiesuan2 = game.createRoom.wanfa2;
        for (let i = 0; i < jiesuan2.length; i++) {
            let item = jiesuan2[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
            cc.log(wanfaStr)
        }
        wanfaStr += "    规则：";
        let jiesuan3 = game.createRoom.wanfa3;
        for (let i = 0; i < jiesuan3.length; i++) {
            let item = jiesuan3[i];
            if (bAll && item.data < 0) {
                wanfaStr += item.name + "  ";
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
    }
    else if(game.gameid == 164) {
        var wanfaStr = '';
    }else if(game.gameid == 165) {
        wanfaStr += "玩法：";
        let jiesuan2 = game.createRoom.wanfa;
        for(let i = 0; i < jiesuan2.length;i++)
        {
            let item = jiesuan2[i];
            if(bAll && item.data < 0){
                wanfaStr +=  item.name + "  " ;
            }else if(item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr +=  item.name + "  " ;
            }
            cc.log( wanfaStr)
        }
    }else if(game.gameid == 306) {
        wanfaStr += "模式：";
        let jiesuan2 = game.createRoom.wanfa3;
        var holdType = parseInt((ruleFlag & 0x38) >> 3);
        if(holdType == 5){
            wanfaStr += "5以上,";
        }else if(holdType == 7){
            wanfaStr += "7以上,";
        }else{
            wanfaStr += "全牌,";
        }
        cc.log(wanfaStr);
    }else if (game.gameid == 301 || game.gameid == 303 || game.gameid == 305) {
        wanfaStr += "马牌: ";
        let mapai = game.createRoom.mapai;
        for (let i = 0; i < mapai.length; i++) {
            let item = mapai[i];
            if ((ruleFlag & 0x08) != 0x08) {
                cc.log(wanfaStr)
            } else {
                wanfaStr += item.name + "  ";
            }
        }
    }else if (game.gameid == 309) {
        wanfaStr += "结算: ";
        let mapai = game.createRoom.wanfa3;
        for (let i = 0; i < mapai.length; i++) {
            let item = mapai[i];
            if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
                break;
            }
        }
    }
    else if( game.gameid == 169 )
    {
        var zhifu = Math.floor(ruleFlag/100);
        for( let i = 0 ; i < game.createRoom.zhifu.length; i++ )
        {
            let item = game.createRoom.zhifu[i];
            if( item.data == zhifu )
            {
                wanfaStr += item.name;
            }
        }
    }
    else{
        wanfaStr = '结算：';
        let wanfa = game.createRoom.wanfa;
        bAll = bAll || false;
        for (let i = 0; i < wanfa.length; i++) {
            let item = wanfa[i];

            if (bAll && item.data < 0) { // -1 选项
                wanfaStr += item.name + "  ";
            } else if (item.data >= 0 && (ruleFlag & item.data) == item.data) {
                wanfaStr += item.name + "  ";
            }
        }
    }

    return wanfaStr;
}



module.exports= {
    getWanfa:getWanfa,
    getWan : getWan,
    getSuan:getSuan,
}



