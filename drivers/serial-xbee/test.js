var driver = require("./driver.js");

function test() {
	xbeeDriver1 = new driver.Driver({tty_port: "/dev/ttyAMA0"});
	xbeeDriver1.listen(
		(frame) => msgCallback(frame, xbeeDriver1),
		(err) => listenCallback(err, xbeeDriver1)
	);
}

function msgCallback(frame, driver) {
	remote_address = frame.remote64;

	console.log("Message received from " + frame.remote64 + ":");
	console.log(frame.data);
	driver.close();
}

function listenCallback(err, driver) {
	if (!err) {
		console.log("Listening to serial port");
		console.log("Sending test message...");
		driver.send({address: remote_address}, "Sending test", function(err) {
			if (!err) console.log("Data sent!");
			else console.log(err);
		});
	} else {
		console.log("Error listening: " + err);
	}
}

test();
