const data = {
    REQ_CMD:{
        CMD_OutCard             :   0x0105,
        CMD_GiveUpOutCard       :   0x0106,
    },
    RESP_CMD:{
        RCMD_Chat               :   0x8015,
        RCMD_SitIn              :   0x8101,
        RCMD_Ready              :   0x8102,
        RCMD_GameStart          :   0x810A,
        RCMD_Result             :   0x8107,
        RCMD_INITDATA			:   0x810E,
        RCMD_SendPrise          :   0x8212,
        RCMD_Start              :   0x810D,
        RCMD_SendCard           :   0x8103,
        RCMD_Change             :   0x810B,
        RCMD_First              :   0x8104,
        RCMD_OutCard            :   0x8105,
        RCMD_SendLightCardID    :   0x8213,

        RCMD_OutCardDLink       :   0x810C,
        RCMD_CleanCard          :   0x8210,
        RCMD_Runfirst           :   0x8211,
        RCMD_GiveUpOutCard      :   0x810F,
        RCMD_Eastwind           :   0x8108,
    },

}

module.exports = Object.freeze(data);