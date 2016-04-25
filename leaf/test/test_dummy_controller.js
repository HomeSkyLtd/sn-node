var Xbee = require("../../drivers/serial-xbee/driver.js");
var Comm = require("../../communicator/communicator.js")

var driver_control = new Xbee.Driver({tty_port: "/dev/ttyUSB0"}, () => {
	var comm = new Comm.Communicator(driver_control);

	console.log("New communicator");
	var to = driver_control.getBroadcastAddress();
	var msg = {
		packageType: Comm.PACKAGE_TYPES.iamcontroller,
		yourid: 1
	};
	comm.send(to, msg);
	console.log("Message iamcontroller sent.");

	var msg = {
		packageType: Comm.PACKAGE_TYPES.lifetime,
		lifetime: 5*1000
	};
	comm.send(to, msg);
	console.log("Message lifetime sent.");

	var msg = {
		packageType: Comm.PACKAGE_TYPES.describeyourself,
	};
	comm.send(to, msg);
	console.log("Message describeyourself sent.");
});
