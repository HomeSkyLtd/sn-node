/*jshint esversion: 6 */
var db = require("./database").db;
var Communicator = require("../../communicator/communicator");
var Udp = require("../../drivers/udp/driver.js");

var nodes = [];
const KEEP_ALIVE_TIME = 10 * 1000;//10s

function startTimer(node_id, id) {
	if (id !== undefined)
		clearTimeout(id);
	return setTimeout(() => {
        db.deactivateNode(node_id, () => { });
		console.log("Deactivating node with id " + node_id + " due to timeout.");

	}, 2 * KEEP_ALIVE_TIME);
}


const NETWORK_MAP = [Udp];
db.getNetworks((nets) => {
	nets.forEach((key, net) => {
		if (!NETWORK_MAP[net.type]) {
            console.log("Unexisting network interface");
            return;
        }
        NETWORK_MAP[net.type].createDriver(net.params, (err, driver) => {
			if (err) {
				console.log("Failed to start network interface:");
				console.log(err);
				return;
			}
			var com = new Communicator.Communicator(driver);

			function nodeInit() {
				db.newNode((id) => {
					com.send(from, {
						packageType: 'iamcontroller | describeyourself | lifetime',
						'yourid': id,
						'lifetime': KEEP_ALIVE_TIME,
					});
				});
			}

			//Listens for new connections
			com.listen((obj, from) => {
				console.log("[NEW CONNECTION] (network " + net.id + ")");
				nodeInit();
			}, 'whoiscontroller');

			//Listens for reconnections
			com.listen((obj, from) => {
				console.log("[RECONNECTION] from " + obj.id + " (network " + net.id + ")");
				db.nodeExists(obj.id, (exists) => {
					if (exists) {
						com.send(from, {
							packageType: 'welcomeback | lifetime',
							'yourid': id,
							'lifetime': KEEP_ALIVE_TIME,
						});
                        db.activateNode(node_id, () => {});
					}
					else
						nodeInit();
				});
			}, 'iamback');

			//Listens for descriptions
			com.listen((obj, from) => {
				console.log("[NEW DESCRIPTION] from " + obj.id + " (network " + net.id + ")");
				obj.dataType.forEach((key, val) => {
					var desc = { nodeClass: val.nodeClass };
					if (val.nodeClass & Communicator.NODE_CLASSES.actuator)
						desc.commandType = val.commandType;
					if (val.nodeClass & Communicator.NODE_CLASSES.sensor)
						desc.dataType = val.dataType;
					db.setNodeDescription(obj.id, desc, () => {});
				});
				var timerId = startTimer(obj.id);
				com.listen((obj, from) => {
					console.log("[KEEP ALIVE] from " + obj.id);
					timerId = startTimer(obj.id, timerId);
				}, 'keepalive');
			}, 'description');

			//Listens for data
			com.listen((obj, from) => {
				var time = Date.now();
				console.log("[NEW DATA] from " + obj.id  + " (network " + net.id + ") at " + time);
				db.getNode(obj.id, (err, desc, activated) => {
					if (err) {
						console.log("	Received data from unknown node");
						return;
					}
                    if (!activated) {
                        console.log("   Received data from deactivated node");
                        return;
                    }
					obj.data.forEach((key, data) => {
						if (desc.dataType && desc.dataType[data.id] !== undefined) {
							console.log("	Data with id " + data.id + " received: " + data.value);
							db.insertNodeData(obj.id, time, data, () => {});
						}
						else
							console.log("	Data with id " + data.id + " not declared");
					});
				});
			}, 'data');

			//Listens for external commands
			com.listen((obj, from) => {
				var time = Date.now();
				console.log("[NEW COMMAND] from " + obj.id  + " (network " + net.id + ") at " + time);
				db.getNode(obj.id, (err, desc) => {
                    if (err) {
                        console.log("   Received data from unknown node");
                        return;
                    }
					obj.command.forEach((key, command) => {
						if (desc.commandType && desc.commandType[data.id] !== undefined) {
							console.log("	External Command with id " + command.id + " received: " + command.value);
							db.insertNodeCommand(obj.id, time, command, () => {});
						}
						else
							console.log("	External Command with id " + command.id + " not declared");
					});
				});
			}, 'externalcommand');
		});
	});
});
