var Leaf = require("../leaf.js");
var Xbee = require("../../drivers/serial-xbee/driver.js");
var Comm = require("../../communicator/communicator.js")

var driver_sensor = new Xbee.Driver({tty_port: "/dev/ttyUSB1"}, () => {
	var sensor = new Leaf.Leaf(
		driver_sensor,
		{
			dataType: [{
				id: 100,
				type: "real",
				range: [0, 40],
				measureStrategy: "periodic",
				dataCategory: "temperature",
				unit: "ºC"
			}],
			commandType: [],
			timeout: 5*1000,
			limitOfPackets: 3
		},
		(err) => {
			if (err) {
				console.log(err);
			} else {
				var object = [{id: 101, value: 26}, {id: 102, value: 100}];
				sensor.sendData(object, function(err) {
					if (err) {
						console.log(err);
					}
				});
			}
		});
	console.log("New sensor listening");
});
