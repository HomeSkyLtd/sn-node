var Driver = require('../drivers/udp/driver.js');
var Rainfall = require("./communicator");
var program = require('commander');

var packageReceived = function (driver) {
	console.log('[LISTENING] port : ' + driver._rport);

	var comm = new Rainfall.Communicator(driver);
	comm.listen(function (msg, from) {
		var types = Rainfall.PACKAGE_TYPES.get(msg.packageType).key;
		console.log("Message of type " + types + " from " + from.address + ":" + from.port);
		console.log("Message: " + JSON.stringify(msg) + "\n");
	}, null, null, null);
};

program
	.usage('<port>')
	.version('0.0.1')
	.arguments('[port]')
	.action(function (port) {
		Driver.createDriver({rport: port}, function (err, driver) {
			if (err) console.log(err);
			else {
				packageReceived(driver);
			}
		});
	})
	.parse(process.argv);

if (program.rawArgs.length < 3) {
	Driver.createDriver({}, function (err, driver) {
		if (err) console.log(err);
		else {
			packageReceived(driver);
		}
	});
}
