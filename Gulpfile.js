"use strict";

const gulp = require("gulp");
const del = require("del");

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
