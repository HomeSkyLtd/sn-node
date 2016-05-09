var Driver = require('../drivers/udp/driver.js');
var Rainfall = require("./communicator");
var program = require('commander');

var packageReceived = function (driver) {
	console.log('[LISTENING] port : ' + driver._rport);

	var comm = new Rainfall.Communicator(driver);
	comm.listen(function (msg, from) {
		var types = Rainfall.PACKAGE_TYPES.get(msg.packageType).key;
		console.log("Message of type " + types + " from " + from.address + ":" + from.port);
<<<<<<< HEAD
		console.log("Message: " + JSON.stringify(msg) + "\n");
=======
>>>>>>> 1f9be22bfd53d763c0e02ca75e31b99d1d6e0ec0
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
