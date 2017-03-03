"use strict";

const gulp = require("gulp");
const del = require("del");
const stripDebug = require("gulp-strip-debug");
const vinylPaths = require("vinyl-paths");

const runSequence = require("run-sequence");

const sass = require("gulp-sass");

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

gulp.task("default", ["clean:deleteTest"], function () {
	
	printTask("default");
	
});

/**
 * Deleting files and folders
 */

gulp.task("clean:deleteTest", function () {
	
	printTask("clean:deleteTest");
	
	return del([
		"app/deleteTest/folder1",
		"app/deleteTest/**/**.js"
	])
	
});

/**
 * Deleting files in a pipeline
 * Deletes files after processing them in a pipeline
 * Use vinyl-paths to easily get the file path of files in the stream
 * and pass it to the del method
 */

gulp.task("clean:deleteInPipeline", function () {
	
	printTask("clean:deleteInPipeline");
	
	return gulp.src("app/deleteInPipeline")
		.pipe(vinylPaths(del))
		.pipe(stripDebug())
		.pipe(gulp.dest("dist"));
	
});

// Deletes the .scss files and scss folder after compiling; keeps the .css

gulp.task("only-css", function () {
	
	printTask("only-css");
	
	runSequence("sass-del-scss", "del-scss-dir");
	
});

// Compiles .scss into .css

gulp.task("sass-del-scss", function () {
	
	printTask("sass-del-scss");
	
	return gulp.src("app/scss/**/*.scss")
		.pipe(sass())
		.pipe(gulp.dest("app/css"));
	
});

// Deletes the scss folder

gulp.task("del-scss-dir", function () {
	
	printTask("del-scss-dir");
	
	return del(["app/scss"]);
	
});


