"use strict";

const gulp = require("gulp");
const del = require("del");
const stripDebug = require("gulp-strip-debug");
const vinylPaths = require("vinyl-paths");

const runSequence = require("run-sequence");
const sass = require("gulp-sass");
const watch = require("gulp-watch");
const gutil = require('gulp-util');

const injector = require('gulp-inject');
const path = require("path");

const browserSync = require("browser-sync");
const reload = browserSync.reload;

const printTask = function (taskName) {
	
	let bannerFrame = "";
	let taskNameStrip = "";
	let bannerFrameOffSet = 20;
	let lengthTaskName = taskName.length;
	
	let totalBannerFrameLength = (bannerFrameOffSet * 2) + lengthTaskName;
	let topLimit = totalBannerFrameLength;
	let taskLetter = 0;
	
	while (totalBannerFrameLength > 0) {
		
		if (totalBannerFrameLength == topLimit || totalBannerFrameLength == 1) {
			
			taskNameStrip += "*";
			
		} else if (totalBannerFrameLength <= (topLimit - bannerFrameOffSet)
			&& totalBannerFrameLength > bannerFrameOffSet) {
			
			taskNameStrip += taskName[taskLetter++];
			
		}else {
			
			taskNameStrip += " ";
		
		}
		
		bannerFrame += "*";
		totalBannerFrameLength--;
	}
	
	console.log(bannerFrame);
	console.log(`${taskNameStrip}`);
	console.log(bannerFrame);
	
};

/**
 * Compiles .scss to .css
 */
gulp.task('sass', function() {
	
	printTask("sass");
	
	return gulp.src("app/scss/**/*.scss")
		.pipe(sass())
		.pipe(gulp.dest("app/css"));
	
});

/**
 * Watch scss files for changes.
 * Perform actions based on the file event: added, deleted, changed.
 */
gulp.task('scss-watch', function(){

	printTask("scss-watch");

	let watcher = gulp.watch('app/scss/**/*.scss', function(){
		console.log("Runninig deleteWatch sequence");

	});
	
	watcher.on('change', function(event){

		console.log(`Event type: ${event.type}`)

		if (event.type === 'deleted'){
			console.log(event.path + " is deleted. Deleting corresponding .css files from app/css");
			
			let fileNameBase = path.basename(event.path, '.scss');
			
			console.log(fileNameBase);
			
			del(['app/css/' + fileNameBase + '.*'])
				.then(function(paths){
					console.log("deleted files: " + paths.join('\n'));
					runSequence('inject');
					reload();
				});

		} else if (event.type === 'added'){

			console.log(event.path + " is added. Adding corresponding .css files to app/css");
			
			runSequence('sass', 'inject');
			reload();

		} else if (event.type === 'changed'){

			console.log(event.path + " changed. Sassing it and injecting it");
			
			runSequence('sass', 'inject');
			reload();

		}
	})
});

/**
 * Injects .scss files into index.html 
 */
gulp.task('inject', function () {

	let injectOptions = {
		ignorePath: 'app/',
		addRootSlash: false,
		empty: true
	};

	let injectSrc = gulp.src([
		"app/css/**/*.css"
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

	runSequence('sass', 'inject', 'scss-watch', "serve");

});

/**
 * Default task
 */
gulp.task("default", function() {

	runSequence('init');

});
