/*jshint esversion: 6*/

var Leaf = require("../../leaf/leaf.js");
var Driver = require("../../drivers/udp/driver.js");
var Rainfall = require("../../rainfall/rainfall.js");

// This driver represents a sensor that listens controller messages.
Driver.createDriver({rport: 4567}, function(err, driver) {
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
					var i = 0;
					setInterval(() => {
						leaf.sendData({id: 1 , value: 20+i%10}, function (err) {if (err) console.log(err);});
						i += 0.1;
					}, 5*1000);
				}
			});
	}
});
