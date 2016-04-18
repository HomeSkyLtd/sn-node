var Communicator = require("communicator");
var Udp = require("udp");

var nodes = [];
var com;
var keepAliveTime = 10*1000;//10s
function startTimer(node_id, id) {
	if (id !== undefined)
		clearTimeout(id);
	setTimeout(() => {
		console.log("Removing node with id " + node_id + " due to timeout.");
		node[node_id] = null 
	}, keepAliveTime);
}

var udpDriver = new Udp.Driver(() => {
	
	com = new Communicator.Communicator(udpDriver);
	//Listen for new leafs
	com.listen((obj, from) => {
		console.log("[NEW CONNECTION]");
		com.send(from, {
			packageType: Communicator.PACKAGE_TYPES.iamcontroller | Communicator.PACKAGE_TYPES.describeyourself
			| Communicator.PACKAGE_TYPES.lifetime,
			'yourid': nodes.length,
			'lifetime': keepAliveTime,
		}, () => { nodes.push({}) });
	}, Communicator.PACKAGE_TYPES.whoiscontroller);

	//Register new nodes
	com.listen((obj, from) => {
		console.log("[NEW DESCRIPTION] from " + obj.id);

		for (var type in obj.dataType) {
			nodes[obj.id][type.id] = {
				'type': type,
				'measures': []
			};
		}
		startTimer(obj.id);
		

	}, Communicator.PACKAGE_TYPES.description);

	//Listen for data
	com.listen((obj, from) => {
		var time = Date.now();
		console.log("[NEW DATA] from " + obj.id  + " at " + time);
		for (var data in obj.data) {
			if (nodes[obj.id][data.id] === undefined)
				console.log("	Data with id " + data.id + " not declared");
			else {
				console.log("	Data with id " + data.id + " received: " + data.value);
				nodes[obj.id][data.id].measures.push({timestamp: time, data: data.value});
			}
		}
	}, Communicator.PACKAGE_TYPES.data);

	com.listen((obj, from) => {
		console.log("[KEEP ALIVE] from " + obj.id);
		startTimer(obj.id);
	}, Communicator.PACKAGE_TYPES.keepalive);
});



