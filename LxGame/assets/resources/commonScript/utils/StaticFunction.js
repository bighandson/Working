window._bnngooLoading = null;
window._bnngooAlert = null;
window._bnngooAlertAction = null;


function toData(str) {
	// let years = str.substring(0,4)
	var m = str.substring(4, 6)
	var d = str.substring(6, 8)
	var h = str.substring(8, 10)
	var mi = str.substring(10, 12)

	return m + '/' + d + ' ' + h + ':' + mi
}


function PrefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}

function formatDate(value) {

	var h = Math.floor(value / 3600)

	if (h >= 1) {
		m = Math.floor((value - h * 3600) / 60)
	} else {
		m = Math.floor(value / 60)
	}

	s = Math.floor(value % 60)

	return PrefixInteger(h, 2) + ":" + PrefixInteger(m, 2) + ":" + PrefixInteger(s, 2)
}

/**
 * 飘字
 * @param str
 */
function showAlert(str) {
	cc.loader.loadRes('style/commonPreb/alertAction', function (err, alert) {
		if (err) {
			cc.log(err);
			return;
		}
		var _Alert = cc.instantiate(alert);
		_Alert.x = cc.winSize.width / 2;
		_Alert.y = cc.winSize.height / 2;
		_Alert.parent = cc.director.getScene();
		_Alert.getChildByName("alertLabel").getComponent(cc.Label).string = str;
		_Alert.setLocalZOrder(99999);
		_Alert.runAction(cc.sequence(cc.moveBy(1, cc.p(0, 200)), cc.callFunc(function () {
			_Alert.removeFromParent(true);
		})))
	});
}

function _moveAction() {
	_bnngooAlertAction.runAction(cc.sequence(cc.moveBy(1, cc.p(0, 200)), cc.callFunc(function () {
		_bnngooAlertAction.removeFromParent(true);
	})))
}

/**
 *  author       : xiao cai
 *  createtime   : 2017/04/25 16:50
 *  description  : 全局加载动画
 */
function showLoadingAni() {
	if (!_bnngooLoading) {
		cc.loader.loadRes('style/commonPreb/loading', cc.Prefab, function (err, prefab) {
			if (err) {
				cc.log(err);
				return;
			}
			;
			_bnngooLoading = cc.instantiate(prefab);
			_bnngooLoading.x = cc.winSize.width / 2;
			_bnngooLoading.y = cc.winSize.height / 2;
			_bnngooLoading.parent = cc.director.getScene();
			_bnngooLoading.setLocalZOrder(100000);
			cc.game.addPersistRootNode(_bnngooLoading);
		});
	} else {
		cc.game.addPersistRootNode(_bnngooLoading);
		_bnngooLoading.active = true;
	}
}

function hideLoadingAni() {
	if (!!_bnngooLoading) {
		_bnngooLoading.active = false;
	}
}

/**
 * 提示框
 * @param message
 * @param cb
 * @param time
 * @param timeEndCb
 */
function showAlertBox(message, okcb, cancelCb) {

	cc.loader.loadRes('style/dialog/dialog', function (err, box) {
		if (err) {
			hideLoadingAni()
			cc.log(err);
			return;
		}
		hideLoadingAni()
		_bnngooAlert = cc.instantiate(box);
		_bnngooAlert.x = cc.winSize.width / 2;
		_bnngooAlert.y = cc.winSize.height / 2;
		cc.game.addPersistRootNode(_bnngooAlert);
		var boxComp = _bnngooAlert.getComponent('dialogScript');
		boxComp.show(message, okcb, cancelCb);
		_bnngooAlert.parent = cc.director.getScene();
		_bnngooAlert.setLocalZOrder(100000);
	});

}

function hideAlertBox() {
	if (!!_bnngooAlert) {
		_bnngooAlert.getComponent('dialogScript').onColse();
		_bnngooAlert = null;
	}
}


/**
 * 提示框  确认取消
 * @param message
 * @param cb
 * @param time
 * @param timeEndCb
 */
function showConfirmBox(message, cb, time, timeEndCb) {
	var config = require('Config');
	cc.loader.loadRes('style/{0}/tools/tips'.format(config.resourcesPath), function (err, box) {
		if (err) {
			cc.log(err);
			return;
		}
		var item = cc.instantiate(box);
		item.x = cc.winSize.width / 2;
		item.y = cc.winSize.height / 2;
		cc.game.addPersistRootNode(item);
		var boxComp = item.getComponent('AlertBoxController');
		boxComp.greenBtn.active = true;
		boxComp.show(message, cb, time);
		boxComp.startCountDown(time, timeEndCb);
		item.parent = cc.director.getScene();
		item.setLocalZOrder(100000);
	});

}

//商城兑换不足时购买提示框
function showConfirmShop(message, cb, time, timeEndCb) {
	var config = require('Config');
	cc.loader.loadRes('style/{0}/tools/tips1'.format(config.resourcesPath), cc.Prefab, function (err, prefab) {
		if (err) {
			cc.log(err);
			return;
		}
		var item = cc.instantiate(prefab);
		item.x = cc.winSize.width / 2;
		item.y = cc.winSize.height / 2;
		cc.game.addPersistRootNode(item);
		var boxComp = item.getComponent('AlertBoxController');
		boxComp.greenBtn.active = true;
		boxComp.show(message, cb, time);
		boxComp.startCountDown(time, timeEndCb);
		item.parent = cc.director.getScene();
		item.setLocalZOrder(100000);
	})

}

/**
 * 加载一个预制体
 * @param name  预制体的名字 root = style
 * @param [succCb] 加载成功后回调  主要用来初始化数据[可选参数]
 * @param [errCb] 发生错误时的回调  [可选参数]
 */
function loadPrefab(name, succCb, errCb) {
	// var path = 'style/' + name;
	var path = name;
	cc.loader.loadRes(path, cc.Prefab, function (err, prefab) {
		//hideLoadingAni();
		if (err) {
			if (!!errCb) {
				errCb(err);
			} else {
				cc.log('load prefab failed:', path);
			}
			return;
		}

		var module = cc.instantiate(prefab);

		if (!!succCb) {
			succCb(module);
		} else {
			module.x = cc.winSize.width / 2;
			module.y = cc.winSize.height / 2;
			module.parent = cc.director.getScene();
		}
	});
}

function loadHead(url, cb) {
	if (!cc.sys.isNative) {
		getSpriteFrameByUrl(url, cb)
		return;
	}
	cc.log('url', url);
	var arr = url.split('/');
	arr.sort(function (a,b) {
		return b.length - a.length
	})
	var imgName = arr[0]+'.jpg';
	cc.log('imagename: ' + imgName);
	var dirpath = jsb.fileUtils.getWritablePath() + 'activity\\';
	cc.log(dirpath);
	if (jsb.fileUtils.isFileExist(dirpath + imgName)) {
		cc.loader.load(dirpath + imgName, function (err, texture) {
			if (err) {
				cc.log(err);
				if (!!cb) cb(err);
				return;
			}

			if (!!cb) cb(null, new cc.SpriteFrame(texture));
			cc.log('successLoad');
		});
	} else {
		downloadFile(url, imgName, 'activity\\', function (err, path) {
			if (err) {
				cc.log(err);
				return;
			}
			cc.loader.load(dirpath + imgName, function (err, texture) {
				if (err) {
					cc.log(err);
					if (!!cb) cb(err);
					return;
				}
				if (!!cb) cb(null, new cc.SpriteFrame(texture));
				cc.log('successDown');
			});
		});
	}
}


function loadImg(url, cb) {
	if (!cc.sys.isNative) {
		getSpriteFrameByUrl(url, cb)
		return;
	}
	cc.log('url', url);
	var arr = url.split('/');
	var imgName = arr[arr.length-1];
	cc.log('imagename: ' + imgName);
	var dirpath = jsb.fileUtils.getWritablePath() + 'activity\\';
	cc.log(dirpath);
	if (jsb.fileUtils.isFileExist(dirpath + imgName)) {
		cc.loader.load(dirpath + imgName, function (err, texture) {
			if (err) {
				cc.log(err);
				if (!!cb) cb(err);
				return;
			}

			if (!!cb) cb(null, new cc.SpriteFrame(texture));
			cc.log('successLoad');
		});
	} else {
		downloadFile(url, imgName, 'activity\\', function (err, path) {
			if (err) {
				cc.log(err);
				return;
			}
			cc.loader.load(dirpath + imgName, function (err, texture) {
				if (err) {
					cc.log(err);
					if (!!cb) cb(err);
					return;
				}
				if (!!cb) cb(null, new cc.SpriteFrame(texture));
				cc.log('successDown');
			});
		});
	}
}

function getSpriteWritePath(url, cb) {
	if (!cc.sys.isNative) {
        return;
    }
	cc.log('url', url);
	var index = url.lastIndexOf('/');
	if (index < 0) {
		return;
	}

	var image = url.substr(index + 1);
	cc.log('imagename: ' + image);
	var dirpath = jsb.fileUtils.getWritablePath() + 'activity\\';
	cc.log(dirpath);
	if (jsb.fileUtils.isFileExist(dirpath + image)) {
		cc.loader.load(dirpath + image, function (err, texture) {
			if (err) {
				cc.log(err);
				if (!!cb) cb(err);
				return;
			}

			if (!!cb) cb(null, new cc.SpriteFrame(texture));
			cc.log('success');
		});
	} else {
		downloadFile(url, image, 'activity\\', function (err, path) {
			if (err) {
				cc.log(err);
				return;
			}
			cc.loader.load(dirpath + image, function (err, texture) {
				if (err) {
					cc.log(err);
					if (!!cb) cb(err);
					return;
				}

				if (!!cb) cb(null, new cc.SpriteFrame(texture));

			});
		});
	}
}

/**
 * 通过路径加载SpriteFrame
 * @param url   url可以是网络地址，也可以是本地路径
 * @param [callback]  加载成功回调，返回加载的SpriteFrame
 */
function getSpriteFrameByUrl(url, callback) {
	if (isUrl(url)) {
		// var reg = /(http|https)?:\/\/.*?(gif|png|jpg)/gi
		// if(!reg.test(url)){
		//     url += '.png';
		// }

		cc.loader.load({
			url: url,
			type: 'png'
		}, function (err, texture) {
			if (err) {
				if (!!callback) {
					callback(err);
					return;
				} else {
					cc.log('load spriteFrame failed:', url);
					return;
				}
			}
			if (!!callback) {
				callback(null, new cc.SpriteFrame(texture));
			} else {
				cc.log('load spriteFrame successed:', url);
			}
		});
	} else {
		cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
			if (err) {
				if (!!callback) {
					callback(err);
					return;
				} else {
					cc.log('load spriteFrame failed:', url);
					return;
				}
			}
			if (!!callback) {
				callback(null, spriteFrame);
			} else {
				cc.log('load spriteFrame successed:', url);
			}
		});
	}
}

/**
 * 从网络中下载资源
 * @param url         下载地址
 * @param filename     保存文件名称
 * @param path         保存路径
 */
function downloadFile(url, filename, path, callback) {
	if (!url) {
		callback(new Error('url must be not null'));
		return;
	}

	if (!cc.sys.isNative) {
		return callback(new Error('jsb in not supported'));
	}

	var dirpath = jsb.fileUtils.getWritablePath() + path;
	//var filepath = dirpath + filename;

	if (jsb.fileUtils.isFileExist(dirpath + filename)) {
		cc.log('Remote is find' + filename);
		var bRemove = jsb.fileUtils.removeFile(dirpath + filename);
		cc.log('removeFile  : ', bRemove);
	} else {
		cc.log('Remote is not find ' + filename);
		//return;
	}

	var xhr = new XMLHttpRequest();
	xhr.timeout = 30000;   // 30s
	// 超时
	xhr.ontimeout = function () {
		callback(new Error('down load timeout'));
	}

	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200 || xhr.status == 304) {
				xhr.responseType = 'arraybuffer';
				if (saveFile(dirpath, filename, xhr.response)) {
					callback(null, dirpath + filename);
				}
			} else {
				callback(new Error('down load error'));
				return;
			}
		}
	}

	xhr.open("GET", url, true);
	xhr.send();
}

/**
 *  保存文件
 */
function saveFile(dirpath, filename, data) {
	if (!data) {
		return false;
	}

	if (!jsb.fileUtils.isDirectoryExist(dirpath)) {
		jsb.fileUtils.createDirectory(dirpath);
	}

	if (jsb.fileUtils.writeDataToFile(new Uint8Array(data), dirpath + filename)) {
		cc.log('remote write file succeed');
		return true;
	} else {
		cc.log('remote write file failed');
		return false;
	}
}

/**
 * 读取本地数据
 * @param key
 */
function getLocalItem(key) {
	return cc.sys.localStorage.getItem(key);
}

/**
 * 写入本地数据
 * @param key
 * @param value
 */
function setLocalItem(key, value) {
	cc.sys.localStorage.setItem(key, value);
}