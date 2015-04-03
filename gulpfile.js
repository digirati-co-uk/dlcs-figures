/**
 * Created by tom on 03/04/15.
 */
var gulp = require('gulp');
var data = require('gulp-data');
var fm = require('front-matter');
var marked = require('marked');
var fs = require('fs');
var es = require('event-stream');
var hogan = require('hogan.js');
var ext_replace = require('gulp-ext-replace');


var fileList = [];
gulp.task('indexSite', function () {
    console.log("in indexSite task");
    return gulp.src('md-src/**/*.md')
        // Extract YAML front-matter, convert content to markdown via gulp-data
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

    return gulp.src('md-src/**/*.md')

        // Extract YAML front-matter, convert content to markdown via gulp-data
        .pipe(data(function (file) {
            var content = fm(String(file.contents));
            //console.log('yaml:',file.relative);
            file.contents = new Buffer(marked(content.body, {renderer: renderer}));
            file.title = content.attributes.title;
            console.log(content.attributes.title);

            var name = file.relative.substr(0, file.relative.length - 3);
            file.name = name;

            var list = [];

            var sortedList = sortNav(fileList);

            console.log(sortedList);

            sortedList.forEach(function (item) {
                var active = false;
                if (item.name === name) {
                    active = true;
                }
                list.push({name: item.name, title: item.title, active: active});
            });
            file.list = list;
            //console.log(list);
            return content.attributes;
        }))


        // Run each file through a template
        .pipe(es.map(function (file, cb) {
            //console.log('file:',fileList);
            file.contents = new Buffer(template.render(file));

            cb(null, file);
        }))
        .pipe(ext_replace('.html'))
        // Output to build directory
        .pipe(gulp.dest('./gen/'));
});
