/*jshint esversion: 6*/

var Leaf = require("rainfall-leaf");
var Driver = require("rainfall-tcp");
var Rainfall = require("rainfall");

var port = 4567;
if (process.argv[2]) {
	port = process.argv[2];
}

// This driver represents a sensor that listens controller messages.
Driver.createDriver({rport: port}, function(err, driver) {
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
				commandType: [],
				path: false
			},
			(err, leaf) => {
				if (err) console.log(err);
				else {
					console.log("[sensor] Node connected to network.");
					var i = 0;
					setInterval(() => {
						console.log("[sensor] sending data to controller");
						leaf.sendData({id: 1 , value: 18+i%10}, function (err) {if (err) console.log(err);});
						i += 1;
					}, 5*1000);
				}
			});
	}
});
