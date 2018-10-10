/**
 * 个人中心
 */

window.UserCenter = {};

UserCenter.setUserID = function (userid) {
  this.userID = userid;
};

UserCenter.setFree = function(data) {
  if(data){
      this.userInfo.free = data;
  }

};

UserCenter.setCertificationStatus = function (stauts) {
  this.userInfo.rzzt = stauts;
};

UserCenter.getUserID = function () {
  return this.userID;
};


UserCenter.setList = function (list) {
  cc.log('setList:', JSON.stringify(list));
  if (!list || list.length == 0) {
    this.userInfo.jinbiNum = 0;
    this.userInfo.youxibiNum = 0;
    this.userInfo.yinhanbiNum = 0;
    this.userInfo.fangkaNum = 0;
    return;
  }

  for (var i = 0; i < list.length; i++) {
    var info = list[i];
    //cc.log('info:', info.zhlx);
    switch (info.zhlx) {
      case '1':
      case 1:  // 用户金币
        this.userInfo.jinbiNum = info.zhye;
        break;
      case '2':
      case 2:  // 用户银行游戏币
        this.userInfo.yinhanbiNum = info.zhye;
        break;
      case '3' :
      case 3:  // 用户身上游戏币
        this.userInfo.youxibiNum = info.zhye;
        break;
      case '4' :
      case 4:   // 用户房卡
        this.userInfo.fangkaNum = info.zhye;
        break;
    }
  }
};


UserCenter.setUserInfo = function (result) {
  this.userInfo = {};
  this.userID = result.userid;
  this.userInfo.userid = result.userid;
  this.userInfo.nc = formatName(result.nc, 8);
  this.userInfo.xb = result.xb; //1=男，2=女
  this.userInfo.picture = result.tx;
  
  this.userInfo.picturePath = result.txpath;
  this.userInfo.rzzt = result.rzzt;
  this.userInfo.zcqd = result.zcqd;
  this.userInfo.dlpwd = result.dlpwd;
  this.userInfo.token = result.token;
  this.userInfo.sid = result.sid;
  this.userInfo.sjhm = result.sjhm;
  this.userInfo.bdbz = result.bdbz;
  this.userInfo.gxqm = result.gxqm;
  this.userInfo.loginip = result.loginip;
  this.userInfo.payinfo = result.payinfo;

  if (!result.tk) {
    result.tk = result.token.substr(10, 20);
    
  }
  var signString = this.userInfo.userid + this.userInfo.token + result.tk;
  this.userInfo.sign = md5(signString);

  //金币信息
  var list = result.list;
  this.setList(list);
  cc.log('UserInfo:', UserCenter.userInfo);
  
};

UserCenter.getUserInfo = function () {
  return this.userInfo;
};

UserCenter.setSex = function (xb) {
    this.userInfo.xb = xb;
}

UserCenter.setGxqm = function (gxqm) {
    this.userInfo.gxqm = gxqm;
},
/**
 * 设置金币
 * value为玩家金币值
 */
UserCenter.setJinbiNum = function (value) {
  
  this.userInfo.jinbiNum = value;
},

  /**
   * 获取金币值
   */
  UserCenter.getJinbiNum = function () {
    cc.log("jinbi " + this.userInfo.jinbiNum);
    return this.userInfo.jinbiNum;
    
  },
  /**
   * 更新金币
   * value有符号（+-）
   */
  UserCenter.updateJinbiNum = function (value) {
    if (this.userInfo.jinbiNum + value < 0) {
      this.userInfo.jinbiNum = 0;
    }
    this.userInfo.jinbiNum = this.userInfo.jinbiNum + value;
    
  },
    /**
     * 设置银行币
     * value为玩家游戏币
     */
    UserCenter.setYinhanbiNum = function (value) {
        this.userInfo.yinhanbiNum = value;

    },
    /**
     * 获取银行币
     */
    UserCenter.getYinhanbiNum = function () {
        return this.userInfo.yinhanbiNum;
    },
    /**
     * 更新银行币
     * value有符号（+-）
     */
    UserCenter.updateYinhanbiNum = function (value) {
        if (this.userInfo.yinhanbiNum + value < 0) {
            this.userInfo.yinhanbiNum = 0;
        }
        this.userInfo.yinhanbiNum += value;

    },

  /**
   * 设置游戏币
   * value为玩家游戏币
   */
  UserCenter.setYouxibiNum = function (value) {
    this.userInfo.youxibiNum = value;

  },
  /**
   * 获取游戏币
   */
  UserCenter.getYouxibiNum = function () {
    return this.userInfo.youxibiNum;
  },
  /**
   * 更新游戏币
   * value有符号（+-）
   */
  UserCenter.updateYouxibiNum = function (value) {
    if (this.userInfo.youxibiNum + value < 0) {
      this.userInfo.youxibiNum = 0;
    }
    this.userInfo.youxibiNum += value;

  },
  //设置房卡
  UserCenter.setCardNum = function (value) {
    cc.log(value)
    this.userInfo.fangkaNum = value;
    

  },

  // 更新用户昵称
  UserCenter.updateNikename = function (value) {
    this.userInfo.nc = formatName(value, 8);
  }, 



//记住密码
  UserCenter.savePwd = function (userid, pwd) {
    cc.sys.localStorage.setItem('userid', userid);
    cc.sys.localStorage.setItem('userPwd', md5(pwd));
    
  };

//获取已记住的密码
UserCenter.getLocalPwd = function () {
  return {
    'userid': cc.sys.localStorage.getItem('userid'),
    'userPwd': cc.sys.localStorage.getItem('userPwd')
  };
};
