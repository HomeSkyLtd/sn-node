var Leaf = require("../../leaf/leaf.js");
var Driver = require("./test_driver.js");
var Comm = require("../../communicator/communicator.js");

var driver = new Driver.Driver({id: 0}, function() {
	var temp_sensor = new Leaf.Leaf(
		driver,
		{
			dataType: [
				{
					id: 0,
					type: "real",
					range: [-10, 50],
					measureStrategy: "periodic",
					dataCategory: "temperature",
					unit: "ºC"
				}
			],
			commandType: []
		},
		() => {
			setInterval(() => {
				temp_sensor.sendData({id: 1 , value: 23.2}, function (err) {if (err) console.log(err)});
			}, 5*1000);
		});
});

var driver_control = new Driver.Driver({id: 1}, () => {
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
