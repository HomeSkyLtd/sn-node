var Lib = require("./lib.js");
var Udp = require("../drivers/udp/driver.js");

var MyJSON = new Lib.Lib(new Udp.Driver({rport:4567}));
/*
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
});*/


function test() {
    
    console.log(obj);
    var encoded = Lib.encode(obj);
    console.log(encoded);
    console.log(Lib.decode(encoded));
}

//test();

function testSend() {
    MyJSON.listen([7,8], [], () => { console.log('chegooou'); } , function () {
        var obj = { packageType: 7, 'data': { 'nodeClass': 1, 'data': [1,2,3,4,5]}};
        MyJSON.send(obj, {address: "localhost", port: 4567});
        MyJSON.send(obj, {address: "localhost", port: 4567});
        MyJSON.send(obj, {address: "localhost", port: 4567});
        console.log("listening");
    });
}

testSend();