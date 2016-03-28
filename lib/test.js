var Lib = require("./lib.js");

var MyJSON = new Lib.Lib();

var json = { type: "control", class: "actuator", category: "lightSensor", temperature: 0, luminance: 101, switch: 11, dim: 12 };
console.log("Original JSON:");
console.log(json);

console.log("\nEncoded JSON:");
new_json = MyJSON.encode(json);
console.log("Length: " + new_json.length + " bytes");
console.log(new_json);

console.log("\nDecoded JSON");
MyJSON.decode(new_json, (err, obj) => {
    if(err != null) console.log("Error decoding message: " + err);
    else console.log(obj);
});
