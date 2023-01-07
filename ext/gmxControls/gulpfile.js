var gulp = require('gulp'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	minify = require('gulp-minify'),
	eslint = require('gulp-eslint'),
	svgSymbols = require('gulp-svg-symbols'),
	cheerio = require('gulp-cheerio'),
	fs = require('fs'),
	deps = require('./build/deps.js'),
	depsJS = deps.depsJS,
	depsCSS = deps.depsCSS;

var name = 'gmxControls';
var dist = 'dist';

gulp.task('jsmin', ['lint'], function () {
	gulp.src(depsJS)
		.pipe(concat(name + '.js'))
		.pipe(minify({ext:{src: '-src.js'}}))
		.pipe(gulp.dest(dist))
});
gulp.task('cssmin', function () {
	return gulp.src(depsCSS)
		.pipe(concat(name + '.css'))
		.pipe(gulp.dest(dist + '/css'))
});
gulp.task('imgcopy', function () {
	return gulp.src('src/css/img/*.*')
		.pipe(gulp.dest(dist + '/css/img'))
});

gulp.task('lint', function () {
  return gulp.src(depsJS)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
gulp.task('sprites', function () {
  return gulp.src('src/css/svgIcons/*.svg')
    .pipe(svgSymbols({
			templates: ['default-svg']
		}))
		.pipe(cheerio(function ($, file) {
			['path', 'polygon', 'circle', 'rect', 'ellipse'].map(function (shape) {
					$(shape).removeAttr('fill');
					$(shape).removeAttr('class');
			});
    	}))
		.pipe(gulp.dest('src/css/img'))
		.pipe(gulp.dest('examples/img'))
		.pipe(gulp.dest(dist + '/css/img'));
});
gulp.task('sprites2', function () {
  return gulp.src('src/css/svgIcons2/*.svg')
    .pipe(svgSymbols({
			templates: ['default-svg']
		}))
		.pipe(cheerio(function ($, file) {
			['path', 'polygon', 'circle', 'rect', 'ellipse'].map(function (shape) {
					$(shape).removeAttr('fill');
					$(shape).removeAttr('class');
			});
    	}))
		.pipe(rename('svg-symbols2.svg'))
		.pipe(gulp.dest('src/css/img'))
		.pipe(gulp.dest(dist + '/css/img'));
});
gulp.task('svgCheck', ['sprites', 'sprites2'], function() {
	var str1 = fs.readFileSync('examples/svgIcons.tmp.html', 'utf8'),
		svg1 = fs.readFileSync(dist + '/css/img/svg-symbols.svg', 'utf8');

    str1 = str1.replace(/<svg\/>/, svg1);
	fs.writeFileSync('examples/svgIcons.html', str1);

	var str2 = fs.readFileSync('examples/svgIcons.tmp.html', 'utf8'),
		svg2 = fs.readFileSync(dist + '/css/img/svg-symbols2.svg', 'utf8');

    str2 = str2.replace(/<svg\/>/, svg2);
	fs.writeFileSync('examples/svgIcons2.html', str2);
});

gulp.task('default', ['jsmin', 'cssmin', 'imgcopy']);
