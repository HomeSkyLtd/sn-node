var driver = require("./driver.js");

function test(){
    // driver.listen((err, msg, from, socket)=>{
    //     if(err) console.log("Error listening");
    //     else {
    //         console.log("Message received from " + from.adress);
    //         console.log(msg);
    //     }
    // });

    driver.send({address: "localhost", port: 4567}, "Oi");
}

test();