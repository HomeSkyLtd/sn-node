var driver = require("./driver.js");

function test(){
    driver.init({rport: 4567})
    driver.listen((err, msg, from, socket) => {
         if(err) console.log("Error listening");
         else {
             console.log("Message received from " + from.address + ", port: " + from.port);
             console.log(new String(msg));
             socket.close();
             process.exit();
         }
     }, (err) => {
        if (!err) { 
            console.log("Listening!");
            console.log("Sending test message...")
            driver.send({address: "localhost", port: 4567}, "Test", function () {
                console.log("Sent!");
            });
        }
    });
}

test();