var driver = require("./driver.js");

function test() {
	xbeeDriverSender = new driver.Driver({tty_port: "/dev/ttyUSB0"}, function() {
		xbeeDriverSender.listen(
			(frame) => msgCallback(frame, xbeeDriverSender),
			(err) => listenCallback(err, xbeeDriverSender)
		);
	});
}

function msgCallback(frame, driver) {
	console.log("Status received: " + frame.deliveryStatus);
	driver.close();
}

function listenCallback(err, driver) {
	if (!err) {
		console.log("Listening to serial port");
		console.log("Sending test message...");
		driver.send(driver.getBroadcastAddress(), new Buffer("Ola Fabao"), function(err) {
			if (!err) console.log("Data sent!");
			else console.log(err);
		});
	} else {
		console.log("Error listening: " + err);
	}
}

test();
