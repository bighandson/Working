const data = {
    REQ_CMD:{
        CMD_OutCard             :   0x0105,
        CMD_GiveUpOutCard       :   0x0106,
        CMD_CallLandOwner       :   0x0120,  //叫地主
        CMD_GrabLandOwner       :   0x0121, //抢地主
        CMD_LightCard           :   0x0122,  //明牌
        CMD_AddTimes            :   0x0123,  //加倍
        CMD_LightStart          :   0x0124,//明牌开始
        CMD_LightCardAfter      :   0x0125,//发牌后明牌
    },
    RESP_CMD:{
        RCMD_Chat               :   0x8015, //33789
        RCMD_SitIn              :   0x8101,//33025
        RCMD_Ready              :   0x8102,
        RCMD_GameStart          :   0x810A,//33034
        RCMD_Result             :   0x8107,
        RCMD_INITDATA			      :   0x810E, //33038
        RCMD_SendPrise          :   0x8212, //33298
        RCMD_Start              :   0x810D,
        RCMD_SendCard           :   0x8103,   //33027
        RCMD_Change             :   0x810B,
        RCMD_First              :   0x8104, //33028
        RCMD_OutCard            :   0x8105, //33029
        RCMD_SendLightCardID    :   0x8213, //33299

        RCMD_OutCardDLink       :   0x810C, //33036
        RCMD_CleanCard          :   0x8210,
        RCMD_Runfirst           :   0x8211,
        RCMD_GiveUpOutCard      :   0x810F,//33039
        RCMD_Eastwind           :   0x8108,
        RCMD_CallLandOwner      :   0x8600,  //叫地主  34304
        RCMD_GrabLandOwner      :   0x8601,  //抢地主  34305
        RCMD_LightCard          :   0x8602,  //明牌    34306
        RCMD_AddTimes           :   0x8603,  //加倍    34307
        RCMD_LightStart         :   0x8605,  //明牌开始   34309
        RCMD_MoneyEnough        :   0x8604,          // 34308
        RCMD_SendPlayerInfo     :   0x8606,  //玩家信息   34310
        RCMD_SendTimesInfo      :   0x8607,  //发送  34311
        RCMD_LightCardAfter     :   0x8608,  //发牌后明牌
        RCMD_FirstExtend        :   0x8609,  //发牌指令扩展
    },
}

module.exports = Object.freeze(data);