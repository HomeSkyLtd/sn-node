//jshint esversion: 6

var Driver = require('../drivers/udp/driver.js');
var Rainfall = require("../rainfall/rainfall");
var program = require('commander');


var packageTypesRegex = new RegExp(Rainfall.PACKAGE_TYPES.enums.map((val) => { return val.key; }).join('|'));

program
	.usage('<address> <port> <packageType>')
	.version('0.0.1')
	.arguments('<address> <port> <packageType> [package]')
	.action(function (address, port, packageType, package) {
		var pkt;
		if (package) {
			pkt = JSON.parse(package);
		}
		else {
			pkt = {};
		}
		pkt.packageType = packageType;
		Driver.createDriver({}, (err, instance) => {
			var com = new Rainfall.Rainfall(instance);
			com.send({address: address, port: port}, pkt, (error) => {
				if (error) {
					console.log("Package not sent! Reason: ");
					console.log(error.message);
				}
				else
					console.log("Message sent!");
				com.close();
			});
		});
	})
	.parse(process.argv);
