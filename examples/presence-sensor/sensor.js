/*jshint esversion: 6*/


/*
    Just run this example with a controller running

*/


var Driver = require("rainfall-tcp");
var Leaf = require("rainfall-leaf");

//Creates the TCP driver
// This driver represents a sensor that listens controller messages.
var state = 0;
Driver.createDriver({ }, function(err, driver) {
    if (err) console.log(err);
    else {
        Leaf.createLeaf(
            driver,
            {
                dataType: [
                    {
                        id: 1,
                        type: "bool",
                        range: [0, 1],
                        measureStrategy: "event",
                        dataCategory: "presence",
                        unit: ""
                    }
                ],
                path: false
            },
            (err, leaf) => {
                if (err) console.log(err);
                else {
                    console.log("[initialized] Presence sensor initialized");
                    console.log("Press ENTER to send presence event");
                    console.log("Current state: nobody home");
                    var stdin = process.openStdin();
                    stdin.addListener("data", function(d) {
                        if (state === 0)
                             state = 1;
                         else
                            state = 0;
                        leaf.sendData({id:1, value: state}, (err) => {
                            if (err) console.log(err);
                            console.log("[data sent] " + (state === 0 ? "nobody home" : "there is someone") + " (" + state + ")");
                        });
                    });
                     
                }
            });
    }
});