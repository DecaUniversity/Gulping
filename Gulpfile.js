"use strict";

const gulp = require("gulp");
const del = require("del");
const stripDebug = require("gulp-strip-debug");
const vinylPaths = require("vinyl-paths");

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
	
	return gulp.src("app/deleteInPipeline")
		.pipe(vinylPaths(del))
		.pipe(stripDebug())
		.pipe(gulp.dest("dist"));
	
});

// Delete the .scss files after compiling but keep the .css

gulp.task("deleteSCSS", function () {
	
	return gulp.src("app/deleteSCSS/**/*.scss")
		.pipe(vinylPaths(del))
		.pipe(sass())
		.pipe(gulp.dest("app/compiledCSS"));
	
});


