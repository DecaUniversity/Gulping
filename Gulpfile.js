"use strict";

const gulp = require("gulp");
const del = require("del");
const vinylPaths = require("vinyl-paths");

const runSequence = require("run-sequence");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const gutil = require('gulp-util');

const injector = require('gulp-inject');
const path = require("path");

const browserSync = require("browser-sync");
const reload = browserSync.reload;

const util = require("./utils.js");

let srcFiles = {
	
	scss: [
		"!app/lib/**",
		"!app/lib",
		"app/**/*.scss",
	],
	html: [
		"!app/lib",
		"!app/lib/**",
		"app/**/*.html"
	],
	all: [
		"!app/lib",
		"!app/lib/**",
		"app/**/**.*"
	]
	
};

let destDir = {
	
	scss: "app/dist/css"
	
};

/**
 * Compiles .scss to .css
 */
gulp.task('sass', function() {
	
	util.printTask("sass");
	
	return gulp.src(srcFiles.scss)
		.pipe(sass())
		.pipe(gulp.dest(destDir.scss));
	
});

/**
 * Watch scss files for changes.
 * Perform actions based on the file event: added, deleted, changed.
 */

gulp.task('scss-watch', function(){

	util.printTask("scss-watch");

	let watcher = watch(srcFiles.scss, function(){
		console.log("Runninig deleteWatch sequence");

	});
	
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
				reload();
			});
		
	});
	
	watcher.on('add', function (filepath) {
		
		console.log(filepath + " is added. Adding corresponding .css files to app/css");

		runSequence('sass', 'inject');
		reload();
		
	});
	
	
	watcher.on('change', function (filepath) {
		
		console.log(filepath + " changed. Sassing it and injecting it");

		runSequence('sass', 'inject');
		reload();
		
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

	let injectSrc = gulp.src([
		"app/dist/css/**/*.css"
		], {read: false}
	);

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

	runSequence('clean:css','sass', 'inject', 'scss-watch', 'html-watch', "serve");

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
 * Default task
 */
gulp.task("default", function() {
	
	util.printTask("default");

	runSequence('init');

});



