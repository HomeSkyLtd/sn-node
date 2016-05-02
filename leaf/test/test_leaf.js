var Leaf = require("../leaf.js");
//var Xbee = require("../../drivers/serial-xbee/driver.js");
var Driver = require("./test_driver.js");
var Comm = require("../../communicator/communicator.js")

//var driver_sensor = new Xbee.Driver({tty_port: "/dev/ttyUSB1"}, () => {
var driver_sensor = new Driver.Driver({id: 1}, () => {
	console.log(driver_sensor);
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
					} else {
						console.log("[leaf.test_leaf] data sent from sensor to controller.");
						console.log(object);
					}
				});
			}
		});
	console.log("New sensor listening");
});

//var driver_control = new Xbee.Driver({tty_port: "/dev/ttyUSB0"}, () => {
// Dummy controler
var driver_control = new Driver.Driver({id: 0}, () => {
	var comm = new Comm.Communicator(driver_control);

	console.log("New communicator");
	var to = driver_control.getBroadcastAddress();
	var msg = {
		packageType: Comm.PACKAGE_TYPES.iamcontroller,
		yourId: 1
	};
	comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
	console.log("Message iamcontroller sent.");

	msg = {
		packageType: Comm.PACKAGE_TYPES.lifetime,
		lifetime: 5*1000
	};
	comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
	console.log("Message lifetime sent.");

	msg = {
		packageType: Comm.PACKAGE_TYPES.describeyourself
	};
	comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
	console.log("Message describeyourself sent.");
});
