var MyJSON = require("./lib.js");

var json = { type: "control", class: "actuator", category: "lightSensor", temperature: 0, luminance: 101, switch: 11, dim: 12 };
console.log("Original JSON:");
console.log(json);

console.log("\nEncoded JSON:");
new_json = MyJSON.parse(json);
console.log(new_json);

console.log("\nDecoded JSON");
console.log(MyJSON.decode(new_json));
