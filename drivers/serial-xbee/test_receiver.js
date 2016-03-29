var driver = require("./driver.js");

function test() {
	xbeeDriverReceiver = new driver.Driver({tty_port: "/dev/ttyUSB0"});
	xbeeDriverReceiver.listen(
		(frame) => msgCallback(frame, xbeeDriverReceiver),
		(err) => listenCallback(err, xbeeDriverReceiver)
	);
}

function msgCallback(frame, xbeeAPI, driver) {
	var new_frame = xbeeAPI.parseFrame(frame);

	console.log("Message received from " + new_frame.remote64 + ":");
	console.log(new_frame.data);
	driver.close();
}

function listenCallback(err, driver) {
	if (!err) {
		console.log("Listening to serial port");
		console.log("Waiting test message...");
	} else {
		console.log("Error listening: " + err);
	}
}

test();
