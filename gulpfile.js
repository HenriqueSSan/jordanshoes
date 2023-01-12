const { src, dest, watch, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const connect = require('gulp-connect');
const browserify = require('browserify');
const babelify = require('babelify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-minify-html');

const paths = {
	styles: {
		all: './src/styles/**/*.scss',
		main: './src/styles/index.scss',
	},

	html: {
		all: './public/**/*.html',
	},

	scripts: {
		all: './src/modules/**/*.js',
		main: './src/modules/app.js',
	},
	assets: {
		images: {
			all: './src/assets/img/**/*.{png,svg,jpeg,jpg}',
			output: 'dist/media',
		},
	},

	output: 'dist',
};

function compilerStyles() {
	return src(paths.styles.main)
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(dest(paths.output))
		.pipe(connect.reload());
}

function server() {
	connect.server({
		port: 3001,
		livereload: true,
		root: paths.output,
	});
}

function scripts() {
	return browserify(paths.scripts.main)
		.transform(
			babelify.configure({
				presets: ['@babel/preset-env'],
			})
		)
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(buffer())
		.pipe(uglify())
		.pipe(dest(paths.output))
		.pipe(connect.reload());
}

function html() {
	return src(paths.html.all)
		.pipe(
			htmlmin({
				comments: false,
			})
		)
		.pipe(dest(paths.output))
		.pipe(connect.reload());
}

function watchWorkspace() {
	watch(paths.styles.all, { ignoreInitial: false }, compilerStyles);
	watch(paths.html.all, { ignoreInitial: false }, html);
	watch(paths.scripts.all, { ignoreInitial: false }, scripts);
}

function images() {
	return src(paths.assets.images.all).pipe(dest(paths.assets.images.output));
}

exports.default = parallel(server, images, watchWorkspace);
