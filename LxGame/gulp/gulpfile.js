/**
 * 构建打包工具.
 */
'use strict';

const fs = require('fs');
const gulp = require('gulp');
const concat = require('gulp-concat');
const del = require('del');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const  path = require('path');

//var destDir = '/Users/mac/Documents/BNNPackage/';

function getFolds(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

/**
 * 复制文件夹
 * @param dir 相对assets目录
 * [@param] : copy的目录，若为空，目录路径与dir相同
 */
function copyDirectory(dir,src) {
    if(typeof src == 'undefined'){
        src = dir;
    }
    gulp.src(dir)
        .pipe(gulp.dest(src));
}

gulp.task('rm:android',function(){
     let fileres = '../build/jsb-binary/frameworks/runtime-src/proj.android-studio/app/assets/res/*';
     let filesrc = '../build/jsb-binary/frameworks/runtime-src/proj.android-studio/app/assets/src/*';
     console.log(fileres);
     del.sync([fileres,filesrc],{force : true});
});

gulp.task('android',['rm:android'],function(){
    let dirres = '../build/jsb-binary/res/**/*';
    let dirsrc = '../build/jsb-binary/src/**/*';

    let fileres = '../build/jsb-binary/frameworks/runtime-src/proj.android-studio/app/assets/res';
     let filesrc = '../build/jsb-binary/frameworks/runtime-src/proj.android-studio/app/assets/src';

     copyDirectory(dirres,fileres);
     copyDirectory(dirsrc,filesrc);    
});