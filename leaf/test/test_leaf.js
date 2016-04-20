var Leaf = require("../leaf.js");
var Xbee = require("../../drivers/serial-xbee/driver.js");
var Comm = require("../../communicator/communicator.js")

var driver_sensor = new Xbee.Driver({tty_port: "/dev/ttyUSB0"}, () => {
	var sensor = new Leaf.Leaf(driver_sensor,
		[{
			id: 0,
			type: "float",
			range: [0, 40],
			measureStrategy: "periodic",
			category: "temperature"
		}],
		[], () => {
			var object = {id: 0, value: 26}
			sensor.sendData(object, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log("LEAF: data sent from sensor to controller.");
					console.log(object);
				}
			});
		});


	console.log("New sensor listening");
});
