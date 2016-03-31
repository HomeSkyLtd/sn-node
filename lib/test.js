var Lib = require("./lib.js");
var Udp = require("../drivers/udp/driver.js");

var MyJSON = new Lib.Lib(new Udp.Driver({rport:4567, broadcast_port: 4567}));
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

function testSend() {
    MyJSON.listen((object, from) => { 
        console.log("Message received from: " + from.address + ":" + from.port);
        if (object.data == 1) {
            console.log("Received one!");
        }
        else if (object.data == 2) {
            console.log("Received two!");
            MyJSON.send({address: "localhost", port: 4567}, { packageType: 1, 'data': 3 });
        }
        else if (object.data == 3) {
            console.log("Received three! Stopping...");
            return false;
        }
     }, [1,2], [], function () {
        MyJSON.sendBroadcast({ packageType: 2, 'data': 1 });
        setTimeout(MyJSON.send({address: "localhost", port: 4567}, { packageType: 1, 'data': 2 }), 10);
        //MyJSON.send({address: "localhost", port: 4567}, obj);
        //MyJSON.send({address: "localhost", port: 4567}, obj);
        console.log("Listening");
    });
}

testSend();