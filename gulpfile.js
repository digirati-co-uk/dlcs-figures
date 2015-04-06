
var gulp = require('gulp');
var data = require('gulp-data');
var fm = require('front-matter');
var marked = require('marked');
var fs = require('fs');
var eventStream = require('event-stream');
var hogan = require('hogan.js');
var ext_replace = require('gulp-ext-replace');


var fileList = [];
gulp.task('indexSite', function () {
    console.log("in indexSite task");
    return gulp.src('md-src/**/*.md')
        // Extract YAML front-matter, build a list of the md files so we can sort them
        .pipe(data(function (file) {
            var content = fm(String(file.contents));
            var name = file.relative.substr(0, file.relative.length - 3);
            fileList.push({name: name, title: content.attributes.title, order: content.attributes.order});
        }));
});

function compare(a, b) {
    if (typeof a.order === 'undefined') {
        return 1;
    }
    if (typeof b.order === 'undefined') {
        return -1;
    }
    if (a.order < b.order)
        return -1;
    if (a.order > b.order)
        return 1;

    return 0;
}

function sortNav(nav) {
    return nav.sort(compare);
}

gulp.task('default', ['indexSite'], function () {
    var renderer = new marked.Renderer();

    // replace the markdown renderer's code() function with our own one:
    renderer.code = function (code, language) {
        if (code.match(/^sequenceDiagram/) || code.match(/^graph/) || code.match(/^info/) || code.match(/^gantt/)) {

            return '<div class="mermaid">' + code + '</div>';
        }
        else {
            return '<pre><code>' + code + '</code></pre>';
        }
    };

    // Compile a template for rendering each page
    var template = hogan.compile(String(fs.readFileSync('template.html')));

    // ...and for (one-off) rendering the index page
    var indexTemplate = hogan.compile(String(fs.readFileSync('index.template.html')));

    var pipeOutput = gulp.src('md-src/**/*.md')

        // Extract YAML front-matter, convert content to markdown via gulp-data
        // gulp-data attaches a "data" property to the piped file
        // the passed function here is adding various other things as well
        .pipe(data(function (file) {
            var content = fm(String(file.contents));
            //console.log('yaml:',file.relative);
            file.contents = new Buffer(marked(content.body, {renderer: renderer}));
            file.title = content.attributes.title;
            console.log(content.attributes.title);

            var name = file.relative.substr(0, file.relative.length - 3);
            file.name = name;

            // this becomes file.data:
            return content.attributes;
        }))


        // Run each file through a template
        .pipe(eventStream.map(function (file, callback) {
            file.contents = new Buffer(template.render(file));
            callback(null, file);
        }))

        // change the file extension
        .pipe(ext_replace('.html'))

        // Output to build directory
        .pipe(gulp.dest('./gen/'));


    var indexFile = gulp.src("index.html")
        .pipe(eventStream.map(function (file, callback) {
            var list = [];
            var sortedList = sortNav(fileList);
            sortedList.forEach(function (item) {
                list.push({name: item.name, title: item.title});
            });
            file.list = list;
            file.contents = new Buffer(indexTemplate.render(file));
            callback(null, file);
        }))
        .pipe(gulp.dest('./'));


    return pipeOutput;
});


/*
/ To run this task, you need PhantomJS on the path
 */
gulp.task('makepngs', function () {

    var express = require('express');
    var app = express();
    app.use('/', express.static('./gen')); // we only need the html
    var port = process.env.PORT || 3000;
    var server = app.listen(port);
    console.log("now serving generated HTML on http://127.0.0.1:" + port);

    // for running phantomjs:
    var exec = require("child_process").exec;

    var pipeOutput = gulp.src('gen/*.html')

        // note to self - the "file" objects being streamed by gulp.src are "vinyl":
        // https://github.com/wearefractal/vinyl
        // https://medium.com/@contrahacks/gulp-3828e8126466

        // get the file name and save the png path in the gulp-data property
        .pipe(data(function (file) {
            var pos = file.path.lastIndexOf("gen/" + file.relative);
            var pngName = file.relative.replace(".html", ".png");
            var pngPath = file.path.substring(0, pos) + "png/" + pngName;
            return {"pngPath":pngPath, "uri":"http://127.0.0.1:" + port + "/" + file.relative };
        }))

        // sync because we want the streams to finish before closing the server
        .pipe(eventStream.map(function (file, callback) {

            var cmd = "phantomjs phpng.js " + file.data.uri + " " + file.data.pngPath;
            console.log("Will exec: " + cmd);
            exec(cmd, function(err, stdout, stderr) {
                console.log(stdout);
                console.log(stderr);
                console.log(err);
            });
            callback(null, file);
        }));

    // need this to happen synchronously
    server.close();

    return pipeOutput;
});
