# Gulping: My Pipeline Adventure

This project has been a phenomenal learning experience. I am satisfied with the progress that I made on revamping my Gulp workflow. Instead of banging against the wall or blaming the tool, I decided to go back to basics and refresh my understanding of Gulp and fill any knowledge gaps that may be leading me to have a broken workflow. 

What an amazing experience it was to take my time to understand better what Gulp does and how it works. I incrementally built this project to advance from the very basics into the final Gulp workflow that I need for my Angular development. I saw myself not only reading more but also reading more carefully. This time, I was not copying and pasting code mindlessly from an example on Github or Stackoverflow. Nop. This time I was reading the code and making sure I was understanding what it was doing. I was diving into the documentation to understand the tool and the plugins I was using. I tested each code block in different ways to ensure the task was doing what I wanted and had the sufficient fallbacks to prevent complete failure or was strengthen to handle different use cases (such as not just changing a file, but adding a new one or deleting one).

It went from a messy buggy build to a performant beautiful one.

HIGHLIGHT: Gulp Workflow creates and populates a `docs` folder to use with [Github Pages](https://pages.github.com/)! 
 
### Surf this Pipeline

If you have `yarn` installed:

Note: This requires `yarn v0.16` or higher.

`yarn start`

If you prefer to use `npm`, please modify the `package.json` file `script` property:

From:

`"start": "yarn && bower install && gulp"`

to:

`"start": "npm install && bower install && gulp"`

and then run:

`npm start`

`start` is a script that will install the node and bower packages as well as start the Gulp automatic build workflow. Gulp will be running continuously in the background until you decide to stop it (CTRL + C in the Mac). A browser tab/window will open to display the application. Every time that you make a change to a non-library, non-node-module .css, .html or .js file, the browser will reload and display the changes automatically.

For any new .js file that you create, please ensure that you follow the following naming convention when using Angular:

``` javascript
/**
  Each file type is denoted by its ending name.
  A dot (.) should be placed before the name expect for the app.js file
  For example: sample.controller.js
  The files will be injected in index.html in this order from top to bottom.
  This ensures that each file has its proper dependencies injected before its
  own injection.
**/

  'app/app.js',
  'app/**/*module.js',
  'app/**/*constants.js',
  'app/**/*provider.js',
  'app/**/*enum.js',
  'app/**/*model.js',
  'app/**/*config.js',
  'app/**/*filter.js',
  'app/**/*directive.js',
  'app/**/*decorator.js',
  'app/**/*interceptor.js',
  'app/**/*service.js',
  'app/**/*workflow.js',
  'app/**/*repository.js',
  'app/**/*resolver.js',
  'app/**/*controller.js',
  'app/**/*component.js',
  'app/**/**.js'

  // Non-Angular scripts are injected last.
```


### Building for GitHub Pages:

At any stage of your development, you can build/re-build the docs folder that will be used by Github Pages as the source of content for your Page by running this command in another terminal window:

`gulp build:docs`

The docs folder will be create (or deleted and re-created) and populated with the transformed .scss and .js files along with the other project files needed to have a working page equal to the one you have been playing around with during development. 

To enable this Github feature:

* Go to your repo Settings.
* Scroll down to the Github Pages section.
* On Source select "master branch /docs folder". Note: If there is no docs folder in the repo, descendant of the root, this option will be disabled. 
* Click Save.
* Click on the link shown in the green banner and enjoy your live page! 


Gulp yeah! 

![pipe](pipe.jpg)

