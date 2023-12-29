const { src, dest, watch, parallel, series } = require("gulp");

const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const fs = require("fs");

const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

// Functions -------------------------------------------------
function plumberSetting(t) {
    return {
        errorHandler: notify.onError({
            title: t,
            message: "Error <%= error.message%>",
            sound: false,
        }),
    };
}

// Html include -----------------------------------------------
const fileInclude = require("gulp-file-include");
const fileincludeSetting = {
    prefix: "@@",
    basepath: "@file",
};
function includeHtml() {
    return src("app/pages/*")
        .pipe(plumber(plumberSetting("HTML")))
        .pipe(fileInclude(fileincludeSetting))
        .pipe(dest("app"))
        .pipe(browserSync.stream());
}

// Scss include -----------------------------------------------
const scss = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const autoprefixer = require("gulp-autoprefixer");
const sourcemaps = require("gulp-sourcemaps");
// const grupMedia = require("gulp-group-css-media-queries");
function styles() {
    return (
        src("app/scss/style.scss")
            .pipe(plumber(plumberSetting("Styles")))
            .pipe(sourcemaps.init())
            .pipe(sassGlob())
            .pipe(autoprefixer({ overrideBrowserslist: ["last 5 versions"] }))
            .pipe(concat("style.min.css"))
            .pipe(scss({ outputStyle: "compressed" }))
            // .pipe(grupMedia())
            .pipe(sourcemaps.write())
            .pipe(dest("app/css"))
            .pipe(browserSync.stream())
    );
}

// JS include -------------------------------------------------
const webpack = require("webpack-stream");
const babel = require("gulp-babel");

function scripts() {
    return src(["app/js/dev/*.js"])
        .pipe(plumber(plumberSetting("JS")))
        .pipe(babel())
        .pipe(webpack(require("./webpack.config.js")))
        .pipe(dest("app/js"))
        .pipe(browserSync.stream());
}
// function scripts() {
//     return src("app/js/dev/main.js")
//         .pipe(concat("main.min.js"))
//         .pipe(uglify())
//         .pipe(dest("app/js"))
//         .pipe(browserSync.stream());
// }

// Fonts -----------------------------------------------------
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

function fonts() {
    return src("app/fonts/src/*.*")
        .pipe(clean({ force: true })) //

        .pipe(
            fonter({
                formats: ["woff", "ttf"],
            }),
        )
        .pipe(src("app/fonts/*.ttf"))
        .pipe(ttf2woff2())

        .pipe(dest("app/fonts"));
}

// Images ----------------------------------------------------
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const svgSprite = require("gulp-svg-sprite");

function images() {
    return src(["app/images/src/*.*", "!app/images/src/*.svg"])
        .pipe(src("app/images/*.svg").pipe(dest("app/images/svg")))

        .pipe(newer("app/images"))
        .pipe(avif({ quality: 50 }))

        .pipe(src("app/images/src/*.*"))
        .pipe(newer("app/images"))
        .pipe(webp())
        .pipe(clean({ force: true })) //

        .pipe(src("app/images/src/*.*"))
        .pipe(newer("app/images"))
        .pipe(imagemin())
        .pipe(clean({ force: true })) //

        .pipe(dest("app/images"));
}

const spriteSetting = {
    mode: {
        stack: {
            sprite: "../sprite.svg",
            example: true,
        },
    },
};
function sprite() {
    return (
        src("app/images/svg/*.svg")
            // .pipe(clean({ force: true })) //
            .pipe(dest("app/images/svg"))
            .pipe(svgSprite(spriteSetting))
            .pipe(dest("app/images/svg"))
    );
}

// Other-------------------------------------------------------
const server = { server: { baseDir: "app/" } };
function watching() {
    browserSync.init(server);
    watch(["app/pages/**/*.html"], includeHtml);
    watch(["app/*.html"]).on("change", browserSync.reload);
    watch(["app/scss/**/*.scss"], styles);
    watch(["app/js/dev/**/*.js"], scripts);
    watch(["app/images/src"], images);
    watch(["app/fonts/src"], fonts);
}

function cleanDist(done) {
    if (fs.existsSync("dist")) {
        return src("dist", { read: false }).pipe(clean());
    }
    done();
}

// Building ---------------------------------------------------
const srcSetting = src(
    [
        "app/css/style.min.css",
        "app/js/*.js",
        "app/*.html",

        "app/images/*.*",
        "!app/images/svg/*.svg",
        "!app/images/svg/stack/sprite.stack.html",
        "app/images/svg/sprite.svg",

        "app/fonts/*.*",
    ],
    { base: "app" },
);
function building() {
    return srcSetting.pipe(dest("dist"));
}

// ------------------------------------------------------------
exports.includeHtml = includeHtml;
exports.styles = styles;
exports.scripts = scripts;
exports.fonts = fonts;
exports.images = images;
exports.sprite = sprite;
exports.watching = watching;
exports.building = building;

exports.build = series(cleanDist, building);
exports.default = parallel(includeHtml, styles, scripts, images, watching);
