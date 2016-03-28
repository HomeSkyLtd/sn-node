var driver = require("./driver.js");

function test(){
    udpDriver1 = new driver.UdpDriver({rport:4567});
    udpDriver2 = new driver.UdpDriver({rport:4568});
    udpDriver1.listen(
        (msg, from, server) => msgCallback(msg, from, server, udpDriver1),
        (err, server) => listenCallback(err, server, udpDriver1));
    udpDriver2.listen(
        (msg, from, server) => msgCallback(msg, from, server, udpDriver2),
        (err, server) => listenCallback(err, server, udpDriver2));
}

function msgCallback(msg, from, server, driver){
    console.log("Message received from " + from.address + ", port: " + from.port);
    console.log(new String(msg));
    driver.close();
    //process.exit();
}

function listenCallback(err, server, driver){
    if (!err) { 
        console.log("Listening to port " + server.port);
        console.log("Sending test message...")
        driver.send({address: "localhost", port: server.port}, "Test", function (err) {
            if (!err) console.log("Sent!");
            else console.log(err);
        });
    }
    else console.log("Error listening");
}

test();