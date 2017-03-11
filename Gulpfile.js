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
const mainBowerFiles = require("main-bower-files");
const ngsource = require("ngsource");

const browserSync = require("browser-sync");
const reload = browserSync.reload;

const log = require("bootstrap-logs");

const util = require("./utils.js");

/**
 * Fix for warning when running watchers on lib
 * Warning: Possible EventEmitter memory leak detected.
 */

require('events').EventEmitter.prototype._maxListeners = 999;

/**
 * Handles error messages in gulp tasks and prints a pretty message.
 * @param err Error thown by the pipe / task.
 */
let errorHandler = function (err) {
	
	const plugin = err.plugin || "Unknown";
	const message = err.message || "Unknown Error";
	const codeFrame = err.codeFrame || null;
	
	log.danger(`Build Error in ${plugin}`);
	log.danger(`${message}`);
	
	if (codeFrame) {
		log.danger(`${codeFrame}`);
	}
};

/******************************************************************************************
 FILE PATHS
 ******************************************************************************************/

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
	injectorAngular: []
	
};

let destDir = {
	
	scss: "app/dist",
	js: "app/dist"
	
};

/********************************************************************************
 TASKS
 ********************************************************************************/

/********************************************************************************
 Initialization Tasks
 ********************************************************************************/

/**
 * Default task
 */
gulp.task("default", function() {
	
	util.printTask("default");
	
	runSequence('init');
	
});

/**
 * Initialization task
 */
gulp.task("init", function() {
	
	util.printTask("init");
	
	try {
		
		ngsource.set({target: "app/dist"}, ["app/dist/**/*.css"]);
		
	} catch (error) {
		
		log.danger(error.stack);
		return;
		
	}
	
	const cleaning = [
		"clean:dist"
	];
	
	const watching = [
		'scss-watch',
		'html-watch',
		'js-watch',
		'lib-watch'
	];
	
	runSequence(cleaning,'sass', 'eslint', 'transpile', 'inject', 'inject:lib', watching, "serve");
	
});


/********************************************************************************
 Cleaning Tasks
 ********************************************************************************/

/**
 * Deletes the dist folder
 */
gulp.task("clean:dist", function () {
	
	util.printTask("clean:dist");
	
	return del([
		"app/dist"
	]);
	
});

/********************************************************************************
 Transforming Tasks
 ********************************************************************************/

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

/**
 * Transpile ES6 to ES5
 */
gulp.task("transpile", function () {
	
	const babelOptions = {
		
		presets: ["es2015"]
		
	};
	
	return gulp.src(srcFiles.js)
		.pipe(sourcemaps.init())
		.pipe(babel(babelOptions).on("error", function (err) {
			
			errorHandler(err);
			this.emit('end');
			
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(destDir.js));
	
});

/********************************************************************************
 Utility Tasks
 ********************************************************************************/

/**
 * Uses eslint to provide warning about style problems or potential pitfalls
 */
gulp.task("eslint", function () {
	
	return gulp.src(srcFiles.js)
		.pipe(eslint())
		.pipe(eslint.format());
	
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
	
	let injectSrc = gulp.src(ngsource.get(), {read: false});
	
	return gulp.src('app/index.html')
		.pipe(injector(injectSrc, injectOptions))
		.pipe(gulp.dest('app'));
});

gulp.task('inject:add-remove-file', function () {
	
	util.printTask("inject:add-remove-file");
	
	let injectOptions = {
		ignorePath: 'app/',
		addRootSlash: false,
		empty: true
	};
	
	let injectSrc = gulp.src(ngsource.refresh(), {read: false});
	
	return gulp.src('app/index.html')
		.pipe(injector(injectSrc, injectOptions))
		.pipe(gulp.dest('app'));
});


gulp.task('inject:lib', function () {
	
	util.printTask("inject:lib");
	
	/**
	 * devDependencies won't be injected into
	 */
	
	let injectOptions = {
		name: "bower",
		ignorePath: 'app/',
		addRootSlash: false,
		empty: true
	};
	
	return gulp.src("app/index.html")
		.pipe(injector(gulp.src(mainBowerFiles(), {read: false}), injectOptions))
		.pipe(gulp.dest("app"));
	
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

/********************************************************************************
 Watch Tasks
 ********************************************************************************/

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
		
		runSequence('eslint', 'transpile', 'inject:add-remove-file');
		
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
				runSequence('inject:add-remove-file');
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

gulp.task("lib-watch", function () {
	
	util.printTask("lib-watch");
	
	let watcher = watch([
			"bower.json"
		],
		{
			name: 'librarian',
			verbose: true,
			read: false,
			awaitWriteFinish: true
		});
	
	watcher.on('add', function (filepath) {
		
		console.log(`lib added: ${filepath}`);
		runSequence('inject:lib');
		
	});
	
	watcher.on('change', function (filepath) {
		
		console.log(`lib changed: ${filepath}`);
		runSequence('inject:lib');
		
	});
	
	
});


/********************************************************************************
 GitHub Pages Tasks
 ********************************************************************************/


/**
 * Delete the docs folder
 */
gulp.task("clean:docs", function () {
	
	return del([
		"docs"
	]);
	
});

/**
 * Copies dist content to docs: all of the compiles .scss and transpiled .js
 */
gulp.task("copy:dist:docs", function () {
	
	return gulp.src([
			"app/dist/**/*"
		], {
			base: "app/dist"
		})
		.pipe(gulp.dest("./docs"));
	
});

/**
 * Copies lib content to docs
 */
gulp.task("copy:lib:docs", function () {
	
	return gulp.src([
			"app/lib/**/*"
		], {
			base: "app"
		})
		.pipe(gulp.dest("./docs"));
	
});

/**
 * Copies app content to docs: anything that didn't require transformation
 */
gulp.task("copy:others:docs", function () {
	
	return gulp.src([
			"app/**",
			"!app/dist",
			"!app/dist/**",
			"!app/lib",
			"!app/lib/**",
			"!app/**/*.js",
			"!app/**/*.scss"
		], { base: "app" })
		.pipe(gulp.dest("docs"))
	
});

/**
 * For docs folder
 * Injects .scss files into index.html
 */
gulp.task('inject:docs', function () {
	
	util.printTask("inject:docs");
	
	let injectorAngularDocs = [
		'!docs/lib/**/*.*',
		'docs/**/*.css',
		'docs/main.app.js',
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
	];
	
	let injectOptions = {
		ignorePath: 'docs/',
		addRootSlash: false,
		empty: true
	};
	
	let injectSrc = gulp.src(injectorAngularDocs, {read: false});
	
	return gulp.src('docs/index.html')
		.pipe(injector(injectSrc, injectOptions))
		.pipe(gulp.dest('docs'));
});

/**
 * Builds docs folder needed for Github Pages deployment
 */
gulp.task("build:docs", function () {
	
	runSequence("clean:docs", "copy:dist:docs", "copy:others:docs", "copy:lib:docs", "inject:docs");
	
});
