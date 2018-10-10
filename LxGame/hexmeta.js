
const uuidv3 = require('uuid/v3');
const MY_NAMESPACE = '48ea27eb-d14c-48ab-ac5c-d17db00d75b0';
var fs = require('fs');
var rd = require('rd');
var async = require('async');
var gm = require('gm').subClass({imageMagick: true});


// const uuidv1 = require('uuid/v1');
// console.log(uuidv1());

var filePath = './assets';

String.prototype.replaceAll = function (FindText, RepText) {
    var regExp = new RegExp(FindText, "g");
    return this.replace(regExp, RepText);
}

var dirFiles = rd.readFileSync(filePath);
/**
 *  1 替换 图片png  修改meta中 textureUUID  rawTextureUuid, 替换场景，预制体，动画，rawTextureUuid
 *  2  修改 plist 中的uuid
 *  2. 修改.anim的uuid,   替换场景 预制体的 anim uuid，
 *  3. 修改预制体 uuid，   替换场景 prefab uuid
 *  4. 修改场景中的 uuid,  替换场景 uuid
 */

var taskImage = function (callback) {
    //var files = rd.readFileFilterSync(filePath,/\.png.meta$|\.jpg.meta$/);
    var files = dirFiles.filter(function (file) {
        return /\.png.meta$|\.jpg.meta$/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var textureUUID = obj.uuid;

        var newUUID = uuidv3(textureUUID,MY_NAMESPACE);
        data = data.replaceAll(textureUUID,newUUID);

        var plist = file.replace(/\.png.meta$|\.jpg.meta$/,'.plist.meta');
        if(fs.existsSync(plist)){  // 如果存在plist 修改plist
            console.warn('plist : ',plist);
            var pData = fs.readFileSync(plist,'utf-8');
            pData = pData.replaceAll(textureUUID,newUUID);
            fs.writeFileSync(plist,pData,'utf-8');
        }

        // 资源合集
        var otherRes = dirFiles.filter(function (file) {
            return /\.labelatlas.meta$|\.fnt.meta$|\.prefab$|\.fire$/.test(file);
        });

        async.eachSeries(otherRes,function (file,cb2) {
            var oData = fs.readFileSync(file,'utf-8');
            oData = oData.replaceAll(textureUUID,newUUID);
            fs.writeFile(file,oData,'utf-8',function () {
               cb2();
            });
            
        },function () {
            var keys = Object.keys(obj.subMetas);
            async.eachSeries(keys,function (key,cb) {
                var uuid = obj.subMetas[key].uuid;
                var newSUUID = uuidv3(uuid,MY_NAMESPACE);
                data = data.replaceAll(uuid,newSUUID);
                replaceUUID(uuid,newSUUID,cb);
            },function () {
                fs.writeFileSync(file,data,'utf-8');
                cb1();
            });
        });
    },function () {
        console.log('task image completed!');
        callback();
    });
}

var taskPlist = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.plist.meta$/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var textureUUID = obj.uuid;

        var newUUID = uuidv3(textureUUID,MY_NAMESPACE);
        data = data.replaceAll(textureUUID,newUUID);

        replaceUUID(textureUUID,newUUID,function () {
            var keys = Object.keys(obj.subMetas);
            async.eachSeries(keys,function (key,cb) {
                var uuid = obj.subMetas[key].uuid;
                var newSUUID = uuidv3(uuid,MY_NAMESPACE);
                data = data.replaceAll(uuid,newSUUID);
                replaceUUID(uuid,newSUUID,cb);
            },function () {
                fs.writeFileSync(file,data,'utf-8');
                cb1();
            });
        });

    },function () {
        console.log('taskPlist completed!');
        callback();
    });
}

var taskResource = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.labelatlas.meta$|\.ttf.meta$|\.fnt.meta/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var uuid = obj.uuid;
        var newUUID = uuidv3(uuid,MY_NAMESPACE);
        data = data.replaceAll(uuid,newUUID);
        fs.writeFileSync(file,data,'utf-8');
        replaceUUID(uuid,newUUID,cb1);
    },function () {
        console.log('taskResource completed');
        callback();
    });
}

var taskAnim = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.anim.meta$/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var uuid = obj.uuid;
        var newUUID = uuidv3(uuid,MY_NAMESPACE);
        data = data.replaceAll(uuid,newUUID);
        fs.writeFileSync(file,data,'utf-8');
        replaceUUID(uuid,newUUID,cb1);
    },function () {
        console.log('task anim completed');
        callback();
    });
}

var taskPrefab = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.prefab.meta$/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var uuid = obj.uuid;

        var newUUID = uuidv3(uuid,MY_NAMESPACE);
        data = data.replaceAll(uuid,newUUID);
        fs.writeFileSync(file,data,'utf-8');
        replaceUUID(uuid,newUUID,cb1);
    },function () {
        console.log('taskPrefab completed');
        callback();
    });
}

var taskFire = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.fire.meta$/.test(file);
    });

    async.eachSeries(files,function (file,cb1) {
        var data = fs.readFileSync(file,'utf-8');
        var obj = JSON.parse(data);
        console.log('file : ',file);
        var uuid = obj.uuid;

        var newUUID = uuidv3(uuid,MY_NAMESPACE);
        data = data.replaceAll(uuid,newUUID);
        fs.writeFileSync(file,data,'utf-8');
        replaceUUID(uuid,newUUID,cb1);
    },function () {
        console.log('taskFire completed');
        callback();
    });
}

var gmTask = function (callback) {
    var files = dirFiles.filter(function (file) {
        return /\.png$|\.jpg$/.test(file);
    });

    async.eachSeries(files,function (file,cb) {
        console.log('gm file:',file);
        gm(file).colorize(0,1,2).write(file,function (err) {
            if(err){
                console.log(err);
                return cb(err)
            }
            cb();
        });
    },function () {
        console.log('gm file ok');
        callback();
    });
}

async.series([
    taskImage,
    taskPlist,
    taskAnim,
    taskPrefab,
    taskFire,
    taskResource,
    gmTask
],function (err,result) {
    console.warn('series complete!');
});

function replaceUUID(oldUUID,newUUID,callback) {
    var files = dirFiles.filter(function (file) {
        return /\.fire$|\.prefab$|\.anim$/.test(file);
    });
       // rd.readFileFilterSync(filePath,/\.fire$|\.prefab$|\.anim$/);
    async.eachSeries(files,function (file,cb) {
        var data = fs.readFileSync(file,'utf-8');
        data = data.replaceAll(oldUUID,newUUID);
        fs.writeFile(file,data,'utf-8',function (err) {
            cb(err);
        });
    },function () {
        callback();
    });
}


