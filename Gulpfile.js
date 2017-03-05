"use strict";

const gulp = require("gulp");

const del = require("del");
const path = require("path");
const runSequence = require("run-sequence");

const watch = require("gulp-watch");

const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const eslint = require("gulp-eslint");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");

const injector = require('gulp-inject');

const browserSync = require("browser-sync");
const reload = browserSync.reload;


const util = require("./utils.js");

let srcFiles = {
	
	scss: [
		"!app/lib/**",
		"!app/lib",
		"!app/dist",
		"!app/dist/**",
		"app/**/*.scss",
	],
	html: [
		"!app/lib",
		"!app/lib/**",
		"!app/dist",
		"!app/dist/**",
		"app/**/*.html"
	],
	js: [
		"!app/lib",
		"!app/lib/**",
		"!app/dist",
		"!app/dist/**",
		"app/**/*.js"
	],
	injectorAngular: [
		'app/dist/**/*.css',
		'app/dist/app.js',
		'app/dist/**/*module.js',
		'app/dist/**/*constants.js',
		'app/dist/**/*provider.js',
		'app/dist/**/*enum.js',
		'app/dist/**/*model.js',
		'app/dist/**/*config.js',
		'app/dist/**/*filter.js',
		'app/dist/**/*directive.js',
		'app/dist/**/*decorator.js',
		'app/dist/**/*interceptor.js',
		'app/dist/**/*service.js',
		'app/dist/**/*workflow.js',
		'app/dist/**/*repository.js',
		'app/dist/**/*resolver.js',
		'app/dist/**/*controller.js',
		'app/dist/**/*component.js',
		'app/dist/**/**.js'
	],
	injectorAngularDocs: [
		'docs/**/*.css',
		'docs/app.js',
		'docs/**/*module.js',
		'docs/**/*constants.js',
		'docs/**/*provider.js',
		'docs/**/*enum.js',
		'docs/**/*model.js',
		'docs/**/*config.js',
		'docs/**/*filter.js',
		'docs/**/*directive.js',
		'docs/**/*decorator.js',
		'docs/**/*interceptor.js',
		'docs/**/*service.js',
		'docs/**/*workflow.js',
		'docs/**/*repository.js',
		'docs/**/*resolver.js',
		'docs/**/*controller.js',
		'docs/**/*component.js',
		'docs/**/**.js'
	]
	
};

let destDir = {
	
	scss: "app/dist",
	js: "app/dist"
	
};

/**
 * Compiles .scss to .css
 */
gulp.task('sass', function() {
	
	util.printTask("sass");
	
	let processors = [
		autoprefixer
	];
	
	return gulp.src(srcFiles.scss)
		.pipe(sass().on("error", sass.logError))
		.pipe(postcss(processors))
		.pipe(gulp.dest(destDir.scss));
	
});

gulp.task("eslint", function () {
	
	return gulp.src(srcFiles.js)
		.pipe(eslint())
		.pipe(eslint.format());
	
});

/**
 * Transpile ES6 to ES5
 */
gulp.task("transpile", function () {
	
	const babelOptions = {
		
		presets: ["es2015"]
		
	};
	
	return gulp.src(srcFiles.js)
		.pipe(sourcemaps.init())
		.pipe(babel(babelOptions))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(destDir.js));
	
});

/**
 * Watch js files and transpile them to ES5
 * This effort is made to support Safari and Safari Mobile.
 */
gulp.task("js-watch", function () {
	
	util.printTask("js-watch");
	
	let watcher = watch(srcFiles.js);
	
	watcher.on("change", function (filepath) {
		
		runSequence('eslint', 'transpile', 'inject');
		// reload();
		
	});
	
	watcher.on("add", function (filepath) {
		
		runSequence('eslint', 'transpile', 'inject');
		
	});
	
	watcher.on('unlink', function (filepath) {
		
		console.log(filepath + " is deleted. Deleting corresponding .js files from app/dist");
		
		let fullPath = filepath;
		let rootToJS = "app/dist/";
		let fileNameBase = path.basename(filepath, '.js');
		let pathToJS = "";
		let fullPathToJS = "";
		
		let fullPathArray = fullPath.split("/");
		let index = 0;
		
		for (let i = 0; i < fullPathArray.length; i++) {
			
			if (fullPathArray[i] === "app") {
				
				index = i;
				
				break;
				
			}
		}
		
		for (let i = index; i < fullPathArray.length - 1; i++) {
			
			if (i > index && i < fullPathArray.length - 1) {
				
				pathToJS += fullPathArray[i] + "/";
				
			}
			
		}
		
		fullPathToJS = rootToJS + pathToJS + fileNameBase + ".*";
		
		del(fullPathToJS)
			.then(function(paths){
				console.log("deleted files: " + paths.join('\n'));
				runSequence('inject');
				// reload();
			});
		
	});
	
});

/**
 * Watch scss files for changes.
 * Perform actions based on the file event: added, deleted, changed.
 */

gulp.task('scss-watch', function(){

	util.printTask("scss-watch");

	let watcher = watch(srcFiles.scss);
	
	watcher.on('unlink', function (filepath) {
		
		console.log(filepath + " is deleted. Deleting corresponding .css files from app/dist");

		let fullPath = filepath;
		let rootToCSS = "app/dist/";
		let fileNameBase = path.basename(filepath, '.scss');
		let pathToCSS = "";
		let fullPathToCSS = "";

		let fullPathArray = fullPath.split("/");
		let index = 0;
		
		for (let i = 0; i < fullPathArray.length; i++) {

			if (fullPathArray[i] === "app") {

				index = i;
				
				break;

			}
		}

		for (let i = index; i < fullPathArray.length - 1; i++) {
			
			if (i > index && i < fullPathArray.length - 1) {

				pathToCSS += fullPathArray[i] + "/";

			}

		}

		fullPathToCSS = rootToCSS + pathToCSS + fileNameBase + ".*";

		del(fullPathToCSS)
			.then(function(paths){
				console.log("deleted files: " + paths.join('\n'));
				runSequence('inject');
				// reload();
			});
		
	});
	
	watcher.on('add', function (filepath) {
		
		console.log(filepath + " is added. Adding corresponding .css files to app/dist");

		runSequence('sass', 'inject');
		// reload();
		
	});
	
	
	watcher.on('change', function (filepath) {
		
		console.log(filepath + " changed. Sassing it and injecting it");

		runSequence('sass', 'inject');
		// reload();
		
	});
	
});

gulp.task('html-watch', function () {
	
	util.printTask("html-watch");
	
	let watcher = watch(srcFiles.html);
	
	watcher.on('change', function (filepath) {
		
		reload();
		
	})
	
});

/**
 * Injects .scss files into index.html
 */
gulp.task('inject', function () {
	
	util.printTask("inject");
	
	let injectOptions = {
		ignorePath: 'app/',
		addRootSlash: false,
		empty: true
	};
	
	let injectSrc = gulp.src(srcFiles.injectorAngular, {read: false});
	
	return gulp.src('app/index.html')
		.pipe(injector(injectSrc, injectOptions))
		.pipe(gulp.dest('app'));
});

/**
 * For docs folder
 * Injects .scss files into index.html
 */
gulp.task('inject:docs', function () {
	
	util.printTask("inject:docs");
	
	let injectOptions = {
		ignorePath: 'docs/',
		addRootSlash: false,
		empty: true
	};
	
	let injectSrc = gulp.src(srcFiles.injectorAngularDocs, {read: false});
	
	return gulp.src('docs/index.html')
		.pipe(injector(injectSrc, injectOptions))
		.pipe(gulp.dest('docs'));
});



/**
 * Serve application using browser-sync
 */
gulp.task("serve", function () {
	
	util.printTask("serve");
	
	browserSync.init({
		server: {
			baseDir: "app"
		}
	})
	
});

/**
 * Initialization task
 */
gulp.task("init", function() {
	
	util.printTask("init");
	
	const cleaning = [
		"clean:css",
		"clean:js"
	];
	
	const watching = [
		'scss-watch',
		'html-watch',
		'js-watch'
	];

	runSequence(cleaning,'sass', 'eslint', 'transpile', 'inject', watching, "serve");

});

/**
 * Deletes the dist folder
 */
gulp.task("clean:css", function () {
	
	util.printTask("clean:css");
	
	return del([
		"app/dist"
	]);
	
});

/**
 * Deletes the dist/js folder
 */

gulp.task("clean:js", function () {
	
	util.printTask("clean:js");
	
	return del([
		"app/dist"
	]);
	
});

/**
 * Default task
 */
gulp.task("default", function() {
	
	util.printTask("default");

	runSequence('init');

});

gulp.task("copy:dist:docs", function () {
	
	return gulp.src([
		"app/dist/**/*"
	], {
		base: "app/dist"
	})
		.pipe(gulp.dest("./docs"));
	
});

gulp.task("copy:others:docs", function () {
	
	return gulp.src([
			"!app/dist/**/*",
			"!app/**/*.js",
			"!app/**/*.scss",
			"app/**/*"
		], {
			base: "app"
		})
		.pipe(gulp.dest("docs"));
	
});

gulp.task("clean:docs", function () {
	
	return del([
		"docs"
	]);
	
});

gulp.task("build:docs", function () {
	
	runSequence("clean:docs", "copy:dist:docs", "copy:others:docs", "inject:docs");
	
});



