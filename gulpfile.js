//设置路径
const src='./src'
const dist='./dist'

//wxml语法实际就是html语法，不需要额外处理，直接release到目标目录即可
gulp.task('wxml',()=>{
    return gulp.src(`${src}/**/*.wxml`)
    .pipe(gulp.dest(dist))
})


//引入需要的模块，进行
/*将scss/sass文件编译成 wxss
px 转 rpx
将 webfont 转化成 base64 引入
将 .sass/.scss 改名为 .wxss
*/
/*可以不使用 CSS 的自动添加浏览器兼容前缀的 autoprefixer 插件，
而直接用小程序开发者工具的
「详情 -> 项目设置 -> 上传代码时样式自动补全」功能。 
*/
const rename=require('gulp-rename')
const postcss=require('gulp-postcss')
const pxtorpx=require('postcss-px2rpx')
const base64=require('postcss-font-base64')
const combiner=require('stream-combiner2')
gulp.task('wxss',()=>{
    const combined=combiner.obj([
        gulp.src(`${src}/**/*.{wxss,scss}`),
        sass().on('error',sass.logError),
        postcss([pxtorpx(),base64()]),
        rename((path) => (path.extname='.wxss')),
        gulp.dest(dist)
    ])
    combined.on('error',handleError)
})

//用babel 将es6/7编译为es5
//用sourcemap 以方便本地debug代码
gulp.task('js',()=>{
    gulp.src(`${src}/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(
        babel({
            presets:['env']
        })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(dist))
})

//对于json,image.wxs类文件，主要采取的方式是按照当前路径直接输出到目标目录，不需要额外处理
gulp.task('json',()=>{
    return gulp.src(`${src}/**/*.json`).pipe(gulp.dest(dist))
})
gulp.task('images',()=>{
    return gulp.src(`${src}/images/**`).pipe(gulp.dest(`${dist}`/images))
})
gulp.task(wxs)

//可以针对生产(上线)和开始两种不同的开发环境通过自定义gulp命令参数来区分
/*
下面用--type来区分，即
--type prod：代表生产发布打包
默认：为开发发布打包

在生产发布打包的流程中，
增加了对资源的压缩（js、html、json、css）和 jdists 的代码块预处理
*/
/*关于jdists代码块预处理工具
jdists是一种通过注释的方式，
将不同的代码块根据不同的指令进行处理的工具
根据触发器变量的值，决定是将注释里的代码维持为注释还是去掉注释使其发挥作用
*/
const sourcemaps=require('gulp-sourcemaps')
const jdists = require('gulp-jdists')
const through = require('through2')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const argv = require('minimist')(process.argv.slice(2))
// 判断 gulp --type prod 命名 type 是否是生产打包
const isProd = argv.type === 'prod'
const src = './client'
const dist = './dist'

gulp.task('js', () => {
    gulp
      .src(`${src}/**/*.js`)
      // 如果是 prod，则触发 jdists 的 prod trigger
      // 否则则为 dev trigger，后面讲解
      .pipe(
        isProd
          ? jdists({
              trigger: 'prod'
            })
          : jdists({
              trigger: 'dev'
            })
      )
      // 如果是 prod，则传入空的流处理方法，不生成 sourcemap
      .pipe(isProd ? through.obj() : sourcemaps.init())
      // 使用 babel 处理js 文件
      .pipe(
        babel({
          presets: ['env']
        })
      )
      // 如果是 prod，则使用 uglify 压缩 js
      .pipe(
        isProd
          ? uglify({
              compress: true
            })
          : through.obj()
      )
      // 如果是 prod，则传入空的流处理方法，不生成 sourcemap
      .pipe(isProd ? through.obj() : sourcemaps.write('./'))
      .pipe(gulp.dest(dist))
  })
  
//根据不同的发布环境，对task进行聚合(方便统一调用和监听更改)
gulp.task('watch', () => {//监听各文件的修改变化
    ;['wxml', 'wxss', 'js', 'json', 'wxs'].forEach((v) => {
      gulp.watch(`${src}/**/*.${v}`, [v])
    })
    gulp.watch(`${src}/images/**`, ['images'])
    gulp.watch(`${src}/**/*.scss`, ['wxss'])
  })
  
  gulp.task('clean', () => {//清除上一次打包的缓存
    return del(['./dist/**'])
  })
  
  gulp.task('dev', ['clean'], () => {//针对开发环境，统一执行下列任务(clean最先，下面的任务进行顺序则是随机的)
    runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud', 'watch')
  })
  
  gulp.task('build', ['clean'], () => {//针对发布环境，统一执行下列任务(clean最先，下面的任务进行顺序则是随机的)
    runSequence('json', 'images', 'wxml', 'wxss', 'js', 'wxs', 'cloud')
  })
 

  /*<remove trigger="prod">*/
import {getMood, geocoder} from '../../lib/api'
import {getWeather, getAir} from '../../lib/api-mock'
/*</remove>*/

/*<jdists trigger="prod">
import {getMood, geocoder, getWeather, getAir} from '../../lib/api'
</jdists>*/
