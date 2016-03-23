var MyJSON = require("./lib.js");

var json = '{ "type": "data", "class": "sensor", "category": "termometer", "temperature": "25", "luminance": "10", "switch": "11", "dim": "12" }';
json = JSON.parse(json);

new_json = MyJSON.parse(json);
console.log(new_json);
