
var config = require('Config');
var Login = require('Login');
var Verification = require('Verification');
var MJCardResource = require('MJCardResource')

cc.Class({
  extends: cc.Component,
  properties: {
    manifestUrl: cc.RawAsset,
    progress: cc.ProgressBar,
    label: cc.Label,
  },

  onLoad: function () {
    this.progress.node.active = false;
    let animation = cc.find('Canvas').getComponent(cc.Animation);
    animation.on('finished', this.loadFinish, this);
  },


  loadFinish: function () {
    showLoadingAni();

    if (!cc.sys.isNative) {
      this._lodaMJRes();
      return;
    }

    let self = this;
    // 可写路径
    var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-assets');

    this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);

    if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
      this._am.retain();
    }
    Verification.getVerification('', '', function (result) {
      hideLoadingAni();
     cc.log('检测版本success:   ',result);
      // self.node.removeFromParent(true);
      let data = JSON.parse(result);
      cc.log("data json:" ,data);
      if (!!data.status) {
        // cc.log("ok======================")
        let results = data.results;
        cc.log("inner results：", results)
        let sjbz = results[0].sjbz;
        let url = results[0].ggappbbpzxx.url;
        cc.log(sjbz, url);
        if (sjbz == 1) {
          showAlertBox('检测有新版本，是否前往下载',function () {
              Device.goWebURL(url);
          },function () {
              self.checkUpdate();
          })

        } else if (sjbz == 2) {
          showAlertBox('当前版本过低，是否前往下载',function () {
              Device.goWebURL(url);
          },function () {
              cc.game.end();
          })
        } else {
          self.checkUpdate();
        }
      }

    }, function (err) {
      cc.log('报错了 直接进去')
      hideLoadingAni();
      self.checkUpdate();
    });

  },


  forAppstore: function () {
    /************************************************************/
    // appStore 审核 做无用post 数据流  by Amao 2017.10.25
    if (!cc.sys.isNative) {
      return;
    }
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
      } else if (xhr.readyState == 4) {
      }
    }
    xhr.open('POST', "https://api.bnngoo.com/ReceiveData");
    xhr.send("");
    /************************************************************/
  },

  checkUpdate: function () {
    cc.log("=======开始检查更新=======")

    // 没有本地配置文件  直接进入游戏
    if (!this._am.getLocalManifest().isLoaded()) {
      this._lodaMJRes();
      cc.log('Failed to load local manifest....');
      return;
    }

    this._checkListener = new jsb.EventListenerAssetsManager(this._am, this.checkCb.bind(this));
    cc.eventManager.addListener(this._checkListener, 1);
    this._am.checkUpdate();
  },

  checkCb: function (event) {
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
        cc.log("=======没有找到本地配置文件=======")
        this._lodaMJRes();
        break;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        cc.log("=======下载远程文件失败 更新停止=======")
        this._lodaMJRes();
        break;
      case jsb.EventAssetsManager.NEW_VERSION_FOUND:
        cc.log("=======发现新版本 开始更新=======")
        this.hotUpdate();
        break;
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
        cc.log("=======更新至最新版本 或者 已经是最新版本=======")
        this._lodaMJRes();
        break;
      case jsb.EventAssetsManager.UPDATE_PROGRESSION:
        //this.hotUpdate();
        return;
      case jsb.EventAssetsManager.UPDATE_FAILED:
        cc.log("=======更新失败 =======")
        //showAlertBoxWithOk('Update failed. ' + event.getMessage());    // 热更新失败
        this._lodaMJRes();
        break;
      default:
        cc.log('default : ', event.getEventCode());
        return;
    }
    cc.eventManager.removeListener(this._checkListener);
    this._checkListener = null;
  },

  // loadFinish: function () {
  //   cc.log("=======动画完成 =======")
  //   showLoadingAni();
  //   if (!cc.sys.isNative) {
  //     this._lodaMJRes();
  //     return;
  //   }
  //
  //   // 可写路径
  //   var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'remote-assets');
  //
  //   this._am = new jsb.AssetsManager(this.manifestUrl, storagePath);
  //
  //   if (!cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
  //     this._am.retain();
  //   }
  //
  //   // 检查是否有更新版本
  //   this.checkUpdate();
  // },

  hotUpdate: function () {
    this.progress.progress = 0;
    this.progress.node.active = true;
    this._updateListener = new jsb.EventListenerAssetsManager(this._am, this.updateCb.bind(this));
    cc.eventManager.addListener(this._updateListener, 1);
    this._am.update();
    this.label.string = '正在检测更新，请稍后...';
  },

  reStart: function () {
    cc.eventManager.removeListener(this._updateListener);
    this._updateListener = null;
    var searchPaths = jsb.fileUtils.getSearchPaths();
    var newPaths = this._am.getLocalManifest().getSearchPaths();

    Array.prototype.unshift(searchPaths, newPaths);
    cc.sys.localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
    jsb.fileUtils.setSearchPaths(searchPaths);
    cc.game.restart();
  },

  updateCb: function (event) {
    switch (event.getEventCode()) {
      case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:   // -- 本地配置文件没有找到
        this._lodaMJRes();
        break;
      case jsb.EventAssetsManager.UPDATE_PROGRESSION:  // 下载进度
        let percen = 0
        if (event.getAssetId() == "@manifest" || event.getAssetId() == "@version") {
          percen = event.getPercent()
        } else {
          percen = event.getPercentByFile()
        }
        this.progress.progress = percen / 100
        return;
      case jsb.EventAssetsManager.ASSET_UPDATED:        // 下载文件失败
        return;
      case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:     // 下载配置文件出错
      case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
        this._lodaMJRes();
        break;     // 解析mainfest文件出错
      case jsb.EventAssetsManager.ALREADY_UP_TO_DATE: //已经更新至最新版本 或者 已经是最新版本
        this._lodaMJRes();
        break;
      case jsb.EventAssetsManager.UPDATE_FINISHED:  // 更新完成
        this.reStart()
        break;
      case jsb.EventAssetsManager.UPDATE_FAILED:  //下载失败
        this._lodaMJRes();
        break;
      default:
        break;
    }
  },


  onDestroy: function () {
    if (this._updateListener) {
      cc.eventManager.removeListener(this._updateListener);
      this._updateListener = null;
    }

    if (this._am && !cc.sys.ENABLE_GC_FOR_NATIVE_OBJECTS) {
      this._am.release();
    }
  },

  tokenLogin: function () {
    Login.tokenLogin(function (err) {
      if (err) {
        cc.director.loadScene(config.loginScene);
      }
    });
  },

  _lodaMJRes: function () {
    let self = this;
    this.scheduleOnce(function () {
      cc.log("==========>>>进入游戏<<<==============")
      MJCardResource.loadMJCardsRes(function () {
        self.tokenLogin();
      });
    }, 0.1);
  }
});
