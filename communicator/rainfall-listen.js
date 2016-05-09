var Driver = require('../drivers/udp/driver.js');
var Rainfall = require("./communicator");
var program = require('commander');

program
	.usage('<port>')
	.version('0.0.1')
	.arguments('[port]')
	.action(function (port) {
		Driver.createDriver({rport: port}, function (err, driver) {
			if (err) console.log(err);
			else {
				console.log('[LISTENING] port : ' + driver._rport);
			}
		});
	})
	.parse(process.argv);

if (program.rawArgs.length < 3) {
	Driver.createDriver({}, function (err, driver) {
		if (err) console.log(err);
		else {
			console.log('[LISTENING] port : ' + driver._rport);
		}
	});
}
