var driver = require("../driver.js");

function test() {
	xbeeDriverSender = new driver.Driver({tty_port: "/dev/ttyUSB0"}, function() {
		console.log(xbeeDriverSender.getAddress());
	});
}

test();
