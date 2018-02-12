// including plugins
var gulp = require('gulp')
    , minifyCss = require("gulp-minify-css")
    , uglify = require("gulp-uglify-es").default
    , concat = require('gulp-concat')
    , rename=  require('gulp-rename')
    , merge = require('merge-stream')
    , sourcemaps = require('gulp-sourcemaps')
    , sequence=require('gulp-sequence');

var child = require('child_process');
var htmlreplace = require('gulp-html-replace');

var fs = require('fs');
var path = require('path');

var scriptsPath = './client/js/modules';

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function(file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('minify-css', function () {
    var folders = getFolders('./client/images/');
    var minify=gulp.src('./client/css/all.css') // path to your file
        .pipe(minifyCss())
        .pipe(gulp.dest('./client/dist/css/'));


    var folderImages = folders.map(function(folder) {
         gulp.src(path.join('./client/images/', folder, '/*'))
             .pipe(gulp.dest('./client/dist/images/'+folder));
    });

    var copyImages = gulp.src(path.join('./client/images', '/*'))
        .pipe(gulp.dest('./client/dist/images'));

    var fontFolders = getFolders('./client/fonts/');

    var folderFonts = fontFolders.map(function(folder) {
        gulp.src(path.join('./client/fonts/', folder, '/*'))
            .pipe(gulp.dest('./client/dist/fonts/'+folder));
    });

    var copyFonts = gulp.src(path.join('./client/fonts', '/*'))
        .pipe(gulp.dest('./client/dist/fonts'));

    var copyBootstrapFonts=gulp.src('./client/components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest('./client/dist/fonts'));
    // return merge(minify, folderImages,copyImages,folderFonts,copyFonts);
});

gulp.task('merge-css',function () {
    gulp.src('./client/css/*.css') // path to your file
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./client/dist/css/'));
});

gulp.task('merge-vendor-css',function () {
    gulp.src(['./client/components/bootstrap/dist/css/bootstrap.min.css',
        './client/components/angular-bootstrap/ui-bootstrap-csp.css',
        './client/components/font-awesome/css/font-awesome.min.css',
        './client/components/angular-ui-notification/dist/angular-ui-notification.min.css',
        './client/js/lib/bundles/ng-table.css',
        './client/components/sweetalert2/dist/sweetalert2.min.css',
        './client/components/ng-img-crop/compile/unminified/ng-img-crop.css',
        './client/components/angular-ui-select/dist/select.min.css',
        './client/components/datatables.net-dt/css/jquery.dataTables.min.css',
        './client/components/datatables.net-responsive-dt/css/responsive.dataTables.min.css',
    ]) // path to your file
        .pipe(concat('components.css'))
        .pipe(gulp.dest('./client/dist/components/'))
        .pipe(minifyCss())
        .pipe(rename('components.min.css'))
        .pipe(gulp.dest('./client/dist/components/'))
});

gulp.task('merge-components',function () {
    gulp.src(['./client/components/jquery/dist/jquery.min.js',
        './client/components/bootstrap/dist/js/bootstrap.min.js',
        './client/components/angular/angular.min.js',
        './client/components/angular-ui-router/release/angular-ui-router.min.js',
        './client/components/angular-cookies/angular-cookies.min.js',
        './client/components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        './client/components/underscore/underscore-min.js',
        './client/components/angular-ui-notification/dist/angular-ui-notification.js',
        './client/components/sweetalert2/dist/sweetalert2.all.min.js',
        './client/components/ng-file-upload/ng-file-upload.min.js',
        './client/components/ng-file-upload/ng-file-upload-shim.min.js',
        './client/components/ng-img-crop/compile/unminified/ng-img-crop.js',
        './client/components/angular-ui-select/dist/select.min.js',
        './client/components/datatables.net/js/jquery.dataTables.min.js',
        './client/components/datatables.net-responsive/js/dataTables.responsive.min.js',
    ]) // path to your file
        .pipe(concat('components.js'))
        .pipe(gulp.dest('./client/dist/components/'))
        .pipe(uglify())
        .pipe(rename('components.min.js'))
        .pipe(gulp.dest('./client/dist/components/'))
});

gulp.task('minify-js', function () {
    gulp.src([ './client/js/app.js','./client/js/services/*.js','./client/js/directives/*.js','./client/js/lib/*.js',
        './client/js/services.js']) // path to your files
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./client/dist/js/'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./client/dist/js/'));
});

gulp.task('merge-modules', function() {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(scriptsPath, folder, '/**/*.js'))
        // concat into foldername.js
            .pipe(concat(folder + '.js'))
            // write to output
            .pipe(gulp.dest('./client/dist/js/'))
            // minify
            .pipe(uglify())
            // rename to folder.min.js
            .pipe(rename(folder + '.min.js'))
            // write to output again
            .pipe(gulp.dest('./client/dist/js/'));
    });

    var root = gulp.src(path.join(scriptsPath, '/*.js'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./client/dist/js/'))
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('./client/dist/js/'));

    return merge(tasks, root);
});

gulp.task('watchDev',function () {
    gulp.watch(['./client/css/*.css'],['merge-css','minify-css']);
    gulp.watch([path.join(scriptsPath, '/*.js')],['merge-modules']);
    gulp.watch([ './client/js/app.js','./client/js/services/*.js','./client/js/directives/*.js','./client/js/lib/*.js',
        './client/js/services.js'],['minify-js'])
});


gulp.task('default', ['watchDev']);

gulp.task('run', sequence('merge-css','minify-css','merge-vendor-css','minify-js','merge-components','merge-modules'));
