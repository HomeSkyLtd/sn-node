var Rainfall = require("./communicator");

var args = require('minimist')(process.argv.slice(2));

for (var k in args) {
    if (!args.hasOwnProperty(k) || k === '_') {
        continue;
    }
    console.log(k);

}

