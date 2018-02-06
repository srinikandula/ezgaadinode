// including plugins
var gulp = require('gulp')
    , minifyCss = require("gulp-minify-css")
    , uglify = require("gulp-uglify-es").default
    , concat = require('gulp-concat')
    , rename=  require('gulp-rename')
    , merge = require('merge-stream')
    , sourcemaps = require('gulp-sourcemaps')
    , usemin = require('gulp-usemin');

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
    gulp.src('./client/css/*.css') // path to your file
        .pipe(minifyCss())
        .pipe(gulp.dest('./client/css/minified'));
});

gulp.task('minify-js', function () {
    gulp.src([ './client/js/app.js','./client/js/services/*.js','./client/js/directives/*.js','./client/js/lib/*.js',
        './client/js/services.js']) // path to your files
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(gulp.dest('./client/js/'))
        .pipe(rename('app.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./client/js/'));
});

gulp.task('merge-modules', function() {
    var folders = getFolders(scriptsPath);

    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(scriptsPath, folder, '/**/*.js'))
        // concat into foldername.js
            .pipe(concat(folder + '.js'))
            // write to output
            .pipe(gulp.dest(scriptsPath))
            // minify
            .pipe(uglify({
                mangle: false
            }))
            // rename to folder.min.js
            .pipe(rename(folder + '.min.js'))
            // write to output again
            .pipe(gulp.dest(scriptsPath));
    });

    var root = gulp.src(path.join(scriptsPath, '/*.js'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest(scriptsPath))
    .pipe(uglify({
        mangle: false
    }))
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest(scriptsPath));

    return merge(tasks, root);
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
        .pipe(gulp.dest('./client/components/'))
        .pipe(uglify({mangle: false}))
        .pipe(rename('components.min.js'))
        .pipe(gulp.dest('./client/components/'))
});

gulp.task('replaceIndex.html',function () {
    // var replaceThis = [
    //     [ /^<script src="components/m, 'Hi' ],
    // ];
    gulp.src('./client/views/index.html')
        .pipe(htmlreplace({
            'js': 'js/bundle.min.js'
        }))
        .pipe(gulp.dest('./client/views/'));
})

gulp.task('merge-css',function () {
    gulp.src('./client/css/minified/*.css') // path to your file
        .pipe(concat('all.css'))
        .pipe(gulp.dest('./client/css/'));
});