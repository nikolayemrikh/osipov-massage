

const gulp = require(`gulp`);
const imagemin = require(`gulp-imagemin`);
const del = require(`del`);
const debug = require(`gulp-debug`);
const terser = require(`gulp-terser`);
const postcss = require(`gulp-postcss`);
const rename = require(`gulp-rename`);
const svgstore = require(`gulp-svgstore`);
const webp = require(`gulp-webp`);
const variables = require(`postcss-css-variables`);
const postcssPresetEnv = require(`postcss-preset-env`);
const minify = require(`postcss-csso`);
const postcssImport = require(`postcss-import`);
const mixins = require(`postcss-mixins`);
const precss = require(`precss`);
const rollup = require(`gulp-better-rollup`);
const mqpacker = require(`css-mqpacker`);
const server = require(`browser-sync`).create();
const babel = require(`rollup-plugin-babel`);
const nodeResolve = require(`rollup-plugin-node-resolve`);
const commonjs = require(`rollup-plugin-commonjs`);
const json = require(`rollup-plugin-json`);
const sourcemaps = require(`gulp-sourcemaps`);

gulp.task(`css`, function () {
  return gulp.src(`src/pcss/style.pcss`)
  .pipe(postcss([
    mixins(),
    postcssImport(),
    precss({
      import: false,
      variables: false,
      properties: false,
      nesting: false,
      extend: false
    }),
    variables(),
    postcssPresetEnv(),
    mqpacker({
      sort: true
    }),
    minify({comments: `none`})
  ]))
  .pipe(rename({extname: `.css`}))
  .pipe(gulp.dest(`build/css`, {sourcemaps: `.`}));
});

gulp.task(`images`, function () {
  return gulp.src(`src/img/**/*.{png,jpg,svg}`)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(`src/img`));
});

gulp.task(`webp`, function () {
  return gulp.src(`src/img/**/*.jpg`)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(`src/img`));
});

gulp.task(`sprite`, function () {
  return gulp.src(`src/img/*.svg`)
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename(`sprite.svg`))
    .pipe(gulp.dest(`build/img`));
});

gulp.task(`html`, function () {
  return gulp.src(`src/*.html`)
    .pipe(gulp.dest(`build`));
});

gulp.task(`server`, function () {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(`src/sass/**/*.{scss,sass}`, gulp.series(`css`));
  gulp.watch(`src/*.html`).on(`change`, gulp.series(`html`, server.reload));
});

gulp.task(`refresh`, function (done) {
  server.reload();
  done();
});

gulp.task(`copy`, function () {
  return gulp.src([
    `src/fonts/**/*.{woff,woff2}`,
    `src/img/**`,
    `src/js/**`
  ], {
    base: `src`
  })
  .pipe(gulp.dest(`build`));
});

gulp.task(`clean`, function () {
  return del(`build`);
});

gulp.task(`js`, () => {
  return gulp.src([`src/index.js`])
      .pipe(debug({title: `debug`}))
      .pipe(plumber())
      .pipe(sourcemaps.init())
      .pipe(rollup({
        plugins: [
          nodeResolve({
            jsnext: true,
            browser: true
          }),
          commonjs(),
          json(),
          babel({
            babelrc: false,
            exclude: [`node_modules/**`, `src/js/**.test.js`],
            presets: [
              [`@babel/preset-env`, {modules: false, useBuiltIns: `entry`}]
            ]
          })
        ]
      }, `iife`))
      .pipe(terser())
      .pipe(sourcemaps.write(``))
      .pipe(gulp.dest(`build/js`));
});

gulp.task(`build`, gulp.series(
    `clean`,
    `copy`,
    `css`,
    `js`,
    `html`
));

gulp.task(`start`, gulp.series(`build`, `server`));
