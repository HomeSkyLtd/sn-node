/*jshint esversion: 6 */
var Rainfall = require("../../rainfall/rainfall.js");
var Udp = require("../../drivers/udp/driver.js");

var nodes = [];
var id = 0;
const KEEP_ALIVE_TIME = 10 * 1000;//10s
var timers = {};

function currentTime() {
	var d = new Date(); // for now
	var hour = ("0" + d.getHours()).slice(-2);
	var min = ("0" + d.getMinutes()).slice(-2);
	var sec = ("0" + d.getSeconds()).slice(-2);
	return hour + ":" + min + ":" + sec;
}

function startTimer(node_id, id) {
	if (id !== undefined)
		clearTimeout(id);
	return setTimeout(() => {
		var index = nodes.indexOf(node_id);
		if (index > -1) {
			nodes.splice(index, 1);
		}

		console.log("Deactivating node with id " + node_id + " due to timeout.");
	}, 2 * KEEP_ALIVE_TIME);
}

Udp.createDriver({rport:2356, broadcast_port: 2356}, (err, driver) => {
	if (err) {
		console.log("Failed to start network interface:");
		console.log(err);
		return;
	}
	var com = new Rainfall.Rainfall(driver);

	function nodeInit(from) {
		id = id + 1;
		nodes.push(id);

		com.send(from, {
			packageType: 'iamcontroller | describeyourself | lifetime',
			'yourId': id,
			'lifetime': KEEP_ALIVE_TIME,
		}, (err)=>{
	        if(err) console.log(err);
	        else console.log("iamcontroller, describeyourself, lifetime Sent");
		});
	}

    console.log("Listening on port 2356 and broadcast port 2356");
	//Listens for new connections
	com.listen((obj, from) => {
		console.log("[NEW CONNECTION]");
		nodeInit(from);
	}, 'whoiscontroller');

	//Listens for reconnections
	com.listen((obj, from) => {
		console.log("[RECONNECTION] from " + obj.id);

			if (nodes.indexOf(obj.id) !== -1) {
				com.send(from, {
					packageType: 'welcomeback | lifetime',
					'lifetime': KEEP_ALIVE_TIME,
				}, (err) => {
                    if(err) console.log(err);
                });
				console.log("Sending welcomeback and lifetime to " + JSON.stringify(from));
                nodes.push(obj.id);
				timers[obj.id] = startTimer(obj.id, timers[obj.id]);
			}
			else {
				nodeInit(from);
			}
	}, 'iamback');

	//Listens for descriptions
	com.listen((obj, from) => {
		console.log("[NEW DESCRIPTION] from " + obj.id);
		var desc = {nodeClass: obj.nodeClass};

        var info = function(obj) {
            return obj.reduce((prev, cur)=>{
                if (prev[cur.id] !== undefined) console.error("dataType with repeated ids detected");
                prev[cur.id] = cur;
                return prev;
            }, {});
        };

        if (obj.nodeClass & Rainfall.NODE_CLASSES.actuator)
            desc.commandType = info(obj.commandType);
        if (obj.nodeClass & Rainfall.NODE_CLASSES.sensor)
            desc.dataType = info(obj.dataType);

		timers[obj.id] = startTimer(obj.id);
	}, 'description');

	com.listen((obj, from) => {
		console.log("[KEEP ALIVE] from " + obj.id);
		timers[obj.id] = startTimer(obj.id, timers[obj.id]);
	}, 'keepalive');

	//Listens for data
	com.listen((obj, from) => {
		var time = currentTime();
		console.log("[NEW DATA] from node " + obj.id + " at " + time);

		if (nodes.indexOf(obj.id) === -1) {
			console.log("	Received data from unknown node");
			return;
		}
		obj.data.forEach((data) => {
			console.log("	Data with id " + data.id + " received: " + data.value);
		});

	}, 'data');

	//Listens for external commands
	com.listen((obj, from) => {
		var time = currentTime();
		console.log("[NEW COMMAND] from " + obj.id  +" at " + time);

        if (nodes.indexOf(obj.id) === -1) {
            console.log("   Received data from unknown node");
            return;
        }
		obj.command.forEach((command) => {
			if (desc.commandType && desc.commandType[data.id] !== undefined) {
				console.log("	External Command with id " + command.id + " received: " + command.value);
				db.insertNodeCommand(obj.id, time, command, () => {});
			}
			else
				console.log("	External Command with id " + command.id + " not declared");
		});

	}, 'externalcommand');
});
