var Leaf = require("../leaf.js");
var Xbee = require("../../drivers/serial-xbee/driver.js");
var Comm = require("../../communicator/communicator.js")

var driver_1 = new Xbee.Driver({tty_port: "/dev/ttyUSB0"}, () => {
	var sensor = new Leaf.Leaf(driver_1,
		Comm.NODE_CLASSES.sensor,
		Comm.NODE_CATEGORIES.termometer, null);
});

var driver_2 = new Xbee.Driver({tty_port: "/dev/ttyUSB1"}, () => {
	var actuator = new Leaf.Leaf(driver_2,
		Comm.NODE_CLASSES.actuator,
		Comm.NODE_CATEGORIES.lightSwitch);
});
