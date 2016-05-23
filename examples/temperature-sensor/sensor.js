/*jshint esversion: 6*/

var Leaf = require("rainfall-leaf");
var Driver = require("rainfall-tcp");

// This driver represents a sensor that listens controller messages.
Driver.createDriver({}, function(err, driver) {
    if (err) console.log(err);
    else {
        Leaf.createLeaf(
            driver,
            {
                dataType: [
                    {
                        id: 1,
                        type: "real",
                        range: [-10, 50],
                        measureStrategy: "periodic",
                        dataCategory: "temperature",
                        unit: "ºC"
                    }
                ],
                commandType: []
            },
            (err, leaf) => {
                if (err) console.log(err);
                else {
                    console.log("[initialized] Temperature sensor initialized");
                    var i = 0;
                    setInterval(() => {
                        var value = Math.floor(20+i%10);
                        leaf.sendData({id: 1 , value: value}, function (err) {
                            if (err) console.log(err);
                            console.log("[data sent] temperature: " + value + "ºC");
                        });
                        i += 1;
                    }, 5*1000);
                }
            });
    }
});
