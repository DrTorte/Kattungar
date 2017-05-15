const gulp = require('gulp');
const ts = require('gulp-typescript');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var tsify = require('tsify');
const TEXTURE_FILES = ['src/*.png', 'src/**/*.png'];
const HTML_FILES = ['src/*.html', 'src/**/*.html'];
const FRONT_FILES = ['src/scripts/*.ts'];

const tsProject = ts.createProject('tsconfig.json');

gulp.task('watch', ['scripts'], () => {
    gulp.watch('src/**/*.ts', ['scripts']);
    gulp.watch(TEXTURE_FILES, ['assets']);
    gulp.watch(HTML_FILES, ['html']);
    gulp.watch(FRONT_FILES, ['front']);
});

gulp.task('scripts', () => {
    const tsResult = tsProject.src()
    .pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('assets', function() {
    return gulp.src(TEXTURE_FILES)
    .pipe(gulp.dest('dist'));
});

gulp.task('html', function(){
    return gulp.src(HTML_FILES)
    .pipe(gulp.dest('dist'));
});

gulp.task('front', function(){
    return browserify({
        basedir:'.',
        debug:true,
        cache: {},
        entries: ['src/scripts/main.ts', 'src/scripts/user.ts', 'src/scripts/session.ts',
        'src/scripts/datastore.ts'],
        packageCache: {},
    })
    .plugin(tsify)
    .bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(source('scripts/bundle.js'))
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ['watch']);