var Driver = require("../../communicator/test/test_driver.js");
var Leaf = require("../../leaf/leaf.js");
var Comm = require("../../communicator/communicator.js");

Driver.createDriver({id: 0}, function (err, driver) {
	if (err) console.log(err);
	else {

		Leaf.createLeaf(
			driver,
			{
				dataType: [],
				commandType: [{
					id: 0,
					type: "real",
					range: [0, 100],
					commandCategory: "lightswitch",
					unit: "%"
				}]
			},
			function (err, leaf) {
				if (err) console.log(err);
				else {
					leaf.listenCommand(
						function(obj){
							//Commmand executed here. 
							console.log("[leaf.listening] " + JSON.stringify(obj.command));
						},
						function() {
							if (err) console.log(err);
							else {
								console.log("[leaf.listening] Started listening for commands.")
							}
						});
				}
			});
	}
});

// This driver represents the controller that sends messages to the sensor above.
Driver.createDriver({id: 1}, (err, driver) => {
	var comm = new Comm.Communicator(driver);

	console.log("New communicator");
	var to = driver.getBroadcastAddress();
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

	msg = {
		packageType: Comm.PACKAGE_TYPES.command,
		command: [{
			id: 0,
			value: "increaselight"
		}]
	};
	comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
	console.log("Message with command sent.");
});
