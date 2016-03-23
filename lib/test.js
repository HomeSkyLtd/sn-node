var MyJSON = require("./lib.js");

var json = '{ "type": "control", "class": "actuator", "category": "lightSensor", "temperature": "0", "luminance": "101", "switch": "11", "dim": "12" }';
json = JSON.parse(json);
console.log(json)

new_json = MyJSON.parse(json);
console.log(new_json);
