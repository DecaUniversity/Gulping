"use strict";

const gulp = require("gulp");

const printTask = function (taskName) {
	
	let bannerFrame = "";
	let taskNameStrip = "";
	let bannerFrameOffSet = 20;
	let lengthTaskName = taskName.length;
	
	let totalBannerFrameLength = (bannerFrameOffSet * 2) + lengthTaskName;
	let topLimit = totalBannerFrameLength;
	let taskLetter = 0;
	
	console.log(totalBannerFrameLength);
	
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

gulp.task("default", function () {
	
	printTask("default");
	
});
