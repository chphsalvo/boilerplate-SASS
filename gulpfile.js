// Dependencies
const gulp = require("gulp");
const sass = require("gulp-sass")(require("node-sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");

// Paths
const paths = {
    styles: {
        src: "sass/**/*.scss",
        dest: "css"
    }
};

// Task to compile Sass
function compileSass() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.styles.dest));
}

// Task to minify CSS
function minifyCss() {
    return gulp
        .src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(postcss([autoprefixer(), cssnano()]))
        .pipe(rename({ suffix: ".min" }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(paths.styles.dest));
}

// Combined task for styles
const style = gulp.series(compileSass, minifyCss);

// Watch task
function watch() {
    gulp.watch(paths.styles.src, style);
}

// Build task
const build = gulp.series(style);

// Export tasks
exports.compileSass = compileSass;
exports.minifyCss = minifyCss;
exports.style = style;
exports.watch = watch;
exports.build = build;