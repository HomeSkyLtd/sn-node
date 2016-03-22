var driver = require("./driver.js");

function test(){
    driver.listen((err, msg, from, socket) => {
         if(err) console.log("Error listening");
         else {
             console.log("Message received from " + from.address + ", port: " + from.port);
             console.log(new String(msg));
             socket.close();
         }
     }, (err) => {
     	if (!err) { 
     		console.log("Listening!");
     		driver.send({address: "localhost", port: 4567}, "Oi", function () {
    			console.log("Sent!");
    		});
    	}
    });
}

test();