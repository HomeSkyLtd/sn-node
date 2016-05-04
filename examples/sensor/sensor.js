/*jshint esversion: 6*/

var Leaf = require("../../leaf/leaf.js");
var Driver = require("../../drivers/udp/driver.js");
var Comm = require("../../communicator/communicator.js");

// This driver represents a sensor that listens controller messages.
Driver.createDriver({rport: 4567}, function(err, driver) {
	if (err) console.log(err);
	else {
		Leaf.createLeaf(
			driver,
			{
				dataType: [
					{
						id: 0,
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
					setInterval(() => {
						leaf.sendData({id: 1 , value: 23.2}, function (err) {if (err) console.log(err);});
					}, 5*1000);
				}
			});
	}
});

/*
setTimeout(() => {
	Driver.createDriver({rport: 4568}, (err, driver) => {
		if (err) console.log(err);
		else {
			var comm = new Comm.Communicator(driver);

			console.log("New communicator");
			var to = {
				port: 4567,
				address: "192.168.1.111"
			};

			var msg = {
				packageType: Comm.PACKAGE_TYPES.iamcontroller,
				yourId: 1
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("[dummy-controller.send] Message iamcontroller sent.");

			msg = {
				packageType: Comm.PACKAGE_TYPES.welcomeback,
			};
			comm.send(to, msg, function(err) {if (err) done(err);});
			console.log("[dummy-controller.send] Message welcome back sent.");

			msg = {
				packageType: Comm.PACKAGE_TYPES.lifetime,
				lifetime: 5*1000
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("[dummy-controller.send] Message lifetime sent.");

			msg = {
				packageType: Comm.PACKAGE_TYPES.describeyourself
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("[dummy-controller.send] Message describeyourself sent.");
		}
	});
}, 5000);
*/
