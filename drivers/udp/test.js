var driver = require("./driver.js");

function test(){
    udpDriver1 = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){});
    udpDriver1.listen(
        (msg, from) => msgCallback(msg, from, udpDriver1),
        (err) => listenCallback(err, udpDriver1));
}

function msgCallback(msg, from, driver){
    console.log("Message received from " + from.address + ", port: " + from.port);
    console.log(new String(msg));
    driver.close();
    //process.exit();
}

function listenCallback(err, driver){
    if (!err) { 
        console.log("Listening to port " + driver.RPORT);
        console.log("Sending test message...")
        driver.send(driver.getBroadcastAddress(), new Buffer("Test"), function (err) {
            if (!err) console.log("Sent!");
            else console.log(err);
        });
    }
    else console.log("Error listening");
}

test();
// var udpDriver1 = new driver.Driver({address:"192.168.50.133", rport:4567, broadcast_port:4567}, function(err){});
// udpDriver1.listen(()=>{}, (err)=>{
//     console.log(udpDriver1.getBroadcastAddress());
// });

