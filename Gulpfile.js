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
		'app/dist/css/**/*.css',
		'app/dist/js/app.js',
		'app/dist/js/**/*module.js',
		'app/dist/js/**/*constants.js',
		'app/dist/js/**/*provider.js',
		'app/dist/js/**/*enum.js',
		'app/dist/js/**/*model.js',
		'app/dist/js/**/*config.js',
		'app/dist/js/**/*filter.js',
		'app/dist/js/**/*directive.js',
		'app/dist/js/**/*decorator.js',
		'app/dist/js/**/*interceptor.js',
		'app/dist/js/**/*service.js',
		'app/dist/js/**/*workflow.js',
		'app/dist/js/**/*repository.js',
		'app/dist/js/**/*resolver.js',
		'app/dist/js/**/*controller.js',
		'app/dist/js/**/*component.js',
		'app/dist/js/**/**.js'
	]
	
};

let destDir = {
	
	scss: "app/dist/css",
	js: "app/dist/js"
	
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
		
		console.log(filepath + " is deleted. Deleting corresponding .js files from app/dist/js");
		
		console.log(filepath);
		
		let fullPath = filepath;
		let rootToJS = "app/dist/js/";
		let fileNameBase = path.basename(filepath, '.js');
		let pathToJS = "";
		let fullPathToJS = "";
		
		let fullPathArray = fullPath.split("/");
		let index = 0;
		
		console.log(fullPathArray);
		
		for (let i = 0; i < fullPathArray.length; i++) {
			
			if (fullPathArray[i] === "app") {
				
				index = i;
				
				console.log(`index: ${index}, ${fullPathArray[i]}`);
				
				break;
				
			}
		}
		
		for (let i = index; i < fullPathArray.length - 1; i++) {
			
			console.log(i);
			
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
		
		console.log(filepath + " is deleted. Deleting corresponding .css files from app/css");

		console.log(filepath);

		let fullPath = filepath;
		let rootToCSS = "app/dist/css/";
		let fileNameBase = path.basename(filepath, '.scss');
		let pathToCSS = "";
		let fullPathToCSS = "";

		let fullPathArray = fullPath.split("/");
		let index = 0;

		console.log(fullPathArray);

		for (let i = 0; i < fullPathArray.length; i++) {

			if (fullPathArray[i] === "app") {

				index = i;

				console.log(`index: ${index}, ${fullPathArray[i]}`);

				break;

			}
		}

		for (let i = index; i < fullPathArray.length - 1; i++) {

			console.log(i);

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
		
		console.log(filepath + " is added. Adding corresponding .css files to app/css");

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
 * Deletes the dist/css folder
 */
gulp.task("clean:css", function () {
	
	util.printTask("clean:css");
	
	return del([
		"app/dist/css"
	]);
	
});

/**
 * Deletes the dist/js folder
 */

gulp.task("clean:js", function () {
	
	util.printTask("clean:js");
	
	return del([
		"app/dist/js"
	]);
	
});

/**
 * Default task
 */
gulp.task("default", function() {
	
	util.printTask("default");

	runSequence('init');

});



