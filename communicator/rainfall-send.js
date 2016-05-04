var Driver = require('../drivers/udp/driver.js');
var Rainfall = require("./communicator");
var program = require('commander');

var packageTypes = Rainfall.PACKAGE_TYPES.enums.map((val) => { return val.key }).join('|');

program
	.usage('<address> <port> <packageType>')
	.version('0.0.1')
	.option('<address>', 'Address to send the package')
	.option('<port>', 'Port to send the package')
	.option('<packageType>', 'Package type', new RegExp('^(' + packageTypes + ')$'))
	.action(function (address, port, type) {
		console.log("[SENDING] " + address + ":" + port);
	})
	.parse(process.argv);
