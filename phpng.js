
// Take a screenshot with phantomjs
var system = require('system');
var page = require('webpage').create();

var input = system.args[1];
var output = system.args[2];

page.open(input, function(status) {
    if(status == 'success'){
        window.setTimeout(function() {
            page.render(output);
            phantom.exit(0);
        }, 200);
    }
    else
    {
        console.log("error - phantom returned status " + status);
        phantom.exit(1);
    }
});


