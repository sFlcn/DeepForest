/* eslint-disable no-plusplus */
import gulp from 'gulp';
import plumber from 'gulp-plumber';
import fs from 'fs';
import sync from 'browser-sync';
import { deleteAsync } from 'del';
import rename from 'gulp-rename';
import gulppug from 'gulp-pug';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import autoprefixer from 'autoprefixer';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import sharpResponsive from 'gulp-sharp-responsive';
import markdownit from 'markdown-it';
import htmlMinify from 'html-minifier';
import webpack from 'webpack-stream';
import webpackConf from './webpack.config.cjs';
// import { log } from 'console';

const sass = gulpSass(dartSass);
const md = markdownit({ html: true });

const paths = {
  pug: {
    src: 'source/pug/*.pug',
    watch: 'source/pug/**/*.pug',
    dest: 'build/',
  },
  data: 'source/data/*',
  styles: {
    src: 'source/sass/style.scss',
    watch: 'source/sass/**/*.scss',
    dest: 'build/css/',
  },
  scripts: {
    src: 'source/js/script.js',
    watch: 'source/js/**/*.js',
    dest: 'build/js/',
  },
  images: {
    srcX2: 'source/assets/img-2jpg+webp-x2/*.png',
    srcX3: 'source/assets/img-2jpg+webp-x3/*.png',
    srcLoseless: 'source/assets/img-loseless/*.png',
    srcOrignAndWebpLsless: 'source/assets/img-original+webp-loseless/*.png',
    dest: 'build/img',
  },
  resources: {
    src: [
      'source/assets/fonts/*.{woff2,woff,otf,ttf}',
      'source/assets/img/**/*.{png,jpg,jpeg,svg}',
    ],
    base: 'source/assets/',
    dest: 'build/',
  },
  favicons: {
    src: 'source/assets/favicon/*',
    dest: 'build/',
  },
  layoutAddons: {
    yandexmetricaTrueTemplate: 'source/pug/yandex/_metrika-true.pug',
    yandexmetricaNullTemplate: 'source/pug/yandex/_metrika-dummy.pug',
    yandexmetricaTarget: '_yandexmetrika.pug',
    targetPosition: 'source/pug/yandex/',
  },
};

// ↓ External data collect ------------------------------------------------------------------ ↓
const getData = () => {
  const generateMarkupFromMD = (mdFile) => htmlMinify.minify(
    md.render(
      fs.readFileSync(`source/data/${mdFile}`, 'utf8'),
    ),
    { collapseWhitespace: true },
  );

  const jsonDataColletcion = (jsonFileName) => {
    const itemsArr = JSON.parse(fs.readFileSync(`source/data/${jsonFileName}.json`));
    // eslint-disable-next-line no-param-reassign
    const writeMarkupToObj = (obj) => { obj.markup = generateMarkupFromMD(`${obj.name}.md`); };

    // search "name" property in object to add markup
    for (let i = 0; i < itemsArr.length; i++) {
      const obj = itemsArr[i];
      if (obj.name) {
        writeMarkupToObj(obj);
      } else if (Array.isArray(obj.content)) {
        for (let j = 0; j < obj.content.length; j++) {
          if (obj.content[j].name) {
            writeMarkupToObj(obj.content[j]);
          }
        }
      }
    }
    return itemsArr;
  };

  const historyData = JSON.parse(fs.readFileSync('source/data/history.json'));
  const copyrightsMarkup = generateMarkupFromMD('copyrights.md');
  const albumsList = jsonDataColletcion('albums');
  const singlesnMixesList = jsonDataColletcion('albums--singles-remixes');
  const etcAlbumsList = jsonDataColletcion('albums--etc');
  const lyricsList = jsonDataColletcion('lyrics');

  return {
    historyData,
    copyrightsMarkup,
    albumsList,
    singlesnMixesList,
    etcAlbumsList,
    lyricsList,
  };
};

// ↑ ---------------------------------------------------------------------------------------- ↑

const cleanDirs = async () => { await deleteAsync(['build']); };

const embedLayoutAddons = (done) => {
  gulp.src(paths.layoutAddons.yandexmetricaTrueTemplate)
    .pipe(rename(paths.layoutAddons.yandexmetricaTarget))
    .pipe(gulp.dest(paths.layoutAddons.targetPosition));
  done();
};

const withoutLayoutAddons = (done) => {
  gulp.src(paths.layoutAddons.yandexmetricaNullTemplate)
    .pipe(rename(paths.layoutAddons.yandexmetricaTarget))
    .pipe(gulp.dest(paths.layoutAddons.targetPosition));
  done();
};

const pug = (done) => {
  gulp.src(paths.pug.src)
    .pipe(plumber())
    .pipe(gulppug({ locals: getData() }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(sync.stream());
  done();
};

const styles = (done) => {
  gulp.src(paths.styles.src, { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass())
    .pipe(rename({
      basename: 'style',
      extname: '.css',
    }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(postcss([
      autoprefixer(),
      csso(),
    ]))
    .pipe(rename({
      basename: 'style',
      suffix: '-min',
      extname: '.css',
    }))
    .pipe(gulp.dest(paths.styles.dest, { sourcemaps: '.' }))
    .pipe(sync.stream());
  done();
};

const scripts = (done) => {
  gulp.src('.')
    .pipe(webpack(webpackConf))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(sync.stream());
  done();
};

const copyResources = (done) => {
  gulp.src(paths.resources.src, { base: paths.resources.base })
    .pipe(gulp.dest(paths.resources.dest));
  gulp.src(paths.favicons.src)
    .pipe(gulp.dest(paths.favicons.dest));
  done();
};

const images = (done) => {
  gulp.src(paths.images.srcX2)
    .pipe(sharpResponsive({
      formats: [
        {
          format: 'jpeg',
          rename: { suffix: '@1x' },
          jpegOptions: { progressive: true },
          width: (metadata) => metadata.width / 2,
        },
        {
          format: 'jpeg',
          jpegOptions: { progressive: true },
          rename: { suffix: '@2x' },
        },
        {
          format: 'webp',
          rename: { suffix: '@1x' },
          webpOptions: { lossless: false },
          width: (metadata) => metadata.width / 2,
        },
        {
          format: 'webp',
          rename: { suffix: '@2x' },
          webpOptions: { lossless: false },
        },
      ],
    }))
    .pipe(gulp.dest(paths.images.dest));
  gulp.src(paths.images.srcX3)
    .pipe(sharpResponsive({
      formats: [
        {
          format: 'jpeg',
          rename: { suffix: '@1x' },
          jpegOptions: { progressive: true },
          width: (metadata) => metadata.width / 3,
        },
        {
          format: 'jpeg',
          rename: { suffix: '@2x' },
          jpegOptions: { progressive: true },
          width: (metadata) => (metadata.width / 3) * 2,
        },
        {
          format: 'jpeg',
          jpegOptions: { progressive: true },
          rename: { suffix: '@3x' },
        },
        {
          format: 'webp',
          rename: { suffix: '@1x' },
          webpOptions: { lossless: false },
          width: (metadata) => metadata.width / 3,
        },
        {
          format: 'webp',
          rename: { suffix: '@2x' },
          webpOptions: { lossless: false },
          width: (metadata) => (metadata.width / 3) * 2,
        },
        {
          format: 'webp',
          rename: { suffix: '@3x' },
          webpOptions: { lossless: false },
        },
      ],
    }))
    .pipe(gulp.dest(paths.images.dest));
  gulp.src(paths.images.srcLoseless)
    .pipe(sharpResponsive({
      formats: [
        { format: 'png', rename: { suffix: '@1x' }, width: (metadata) => metadata.width / 0.5 },
        { format: 'png', rename: { suffix: '@2x' } },
        {
          format: 'webp',
          rename: { suffix: '@1x' },
          webpOptions: { lossless: true },
          width: (metadata) => metadata.width * 0.5,
        },
        {
          format: 'webp',
          rename: { suffix: '@2x' },
          webpOptions: { lossless: true },
        },
      ],
    }))
    .pipe(gulp.dest(paths.images.dest));
  gulp.src(paths.images.srcOrignAndWebpLsless)
    .pipe(sharpResponsive({
      includeOriginalFile: true,
      formats: [
        {
          format: 'webp',
          webpOptions: { nearLossless: true, effort: 5 },
        },
      ],
    }))
    .pipe(gulp.dest(paths.images.dest));
  done();
};

const reload = (done) => {
  sync.reload();
  done();
};

const watcher = () => {
  gulp.watch(paths.styles.watch, gulp.series(styles));
  gulp.watch(paths.scripts.watch, gulp.series(scripts));
  gulp.watch([paths.pug.watch, paths.data], gulp.series(pug, reload));
};

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build',
    },
    cors: true,
    notify: false,
    ui: false,
    open: false,
  });
  done();
};

// BUILD
export const build = gulp.series(
  cleanDirs,
  copyResources,
  embedLayoutAddons,
  gulp.parallel(
    images,
    styles,
    scripts,
    pug,
  ),
);

// Default
export default gulp.series(
  cleanDirs,
  copyResources,
  withoutLayoutAddons,
  gulp.parallel(
    images,
    styles,
    scripts,
    pug,
  ),
  gulp.series(
    server,
    watcher,
  ),
);
