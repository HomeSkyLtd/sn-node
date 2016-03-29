var driver = require("./driver.js");

function test() {
	xbeeDriverSender = new driver.Driver({tty_port: "/dev/ttyAMA0"});
	xbeeDriverSender.listen(
		(frame) => msgCallback(frame, xbeeDriverSender),
		(err) => listenCallback(err, xbeeDriverSender)
	);
}

function msgCallback(frame, driver) {
	console.log("Message received from " + frame.remote64 + ":");
	console.log(frame.data);
	driver.close();
}

function listenCallback(err, driver) {
	if (!err) {
		console.log("Listening to serial port");
		console.log("Sending test message...");
		driver.send({address: DESTINY_ADDRESS_HERE}, "Sending test", function(err) {
			if (!err) console.log("Data sent!");
			else console.log(err);
		});
	} else {
		console.log("Error listening: " + err);
	}
}

test();
