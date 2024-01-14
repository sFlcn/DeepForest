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

const sass = gulpSass(dartSass);
const md = markdownit();

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
};

// External data collect
const dataCollect = () => {
  const historyData = JSON.parse(fs.readFileSync('source/data/history.json'));
  const albumsList = JSON.parse(fs.readFileSync('source/data/albums.json'));
  const copyrightsData = htmlMinify.minify(md.render(fs.readFileSync('source/data/copyrights.md', 'utf8')), {collapseWhitespace: true});
  const albumsData = [];
  
  for (let i = 0; i < albumsList.length; i++) {
    const albumName = albumsList[i].name;
    const albumTitle = albumsList[i].title;
    const albumYandexID = albumsList[i].yandexID;
    const albumMarkup = htmlMinify.minify(md.render(fs.readFileSync(`source/data/${albumName}.md`, 'utf8')), {collapseWhitespace: true});
    albumsData.push({ albumName, albumTitle, albumYandexID, albumMarkup });
  }
  
  return { historyData, copyrightsData, albumsData };
}

const cleanDirs = async () => { await deleteAsync(['build']); };

const pug = (done) => {
  gulp.src(paths.pug.src)
    .pipe(plumber())
    .pipe(gulppug({ locals: dataCollect() }))
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

// const scripts = (done) => {
//   gulp.src('.')
//     .pipe(webpack(webpackConf))
//     .pipe(gulp.dest(paths.scripts.dest))
//     .pipe(sync.stream());
//   done();
// };

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
          width: (metadata) => metadata.width / 3 * 2,
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
          width: (metadata) => metadata.width / 3 * 2,
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
  done();
  // await Promise.resolve('Images ready!');
};

const reload = (done) => {
  sync.reload();
  done();
};

const watcher = () => {
  gulp.watch(paths.styles.watch, gulp.series(styles));
  // gulp.watch(paths.scripts.watch, gulp.series(scripts));
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
  gulp.parallel(
    images,
    styles,
    // scripts,
    pug,
  ),
);

// Default
export default gulp.series(
  cleanDirs,
  copyResources,
  gulp.parallel(
    images,
    styles,
    // scripts,
    pug,
  ),
  gulp.series(
    server,
    watcher,
  ),
);
