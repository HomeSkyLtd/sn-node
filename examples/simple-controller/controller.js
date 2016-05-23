/*jshint esversion: 6 */
var Rainfall = require("rainfall");
var Tcp = require("rainfall-tcp");

/*  Really simple controller, don't accept reconnections, do not ask for nodes description and no keepalive needed
*/

var ids = 0;

Tcp.createDriver({rport:2356, broadcast_port: 2356, udplisten: true}, (err, driver) => {
	if (err) {
		console.log("Failed to start network interface:");
		console.log(err);
		return;
	}
	var rainfall = new Rainfall.Rainfall(driver);

    console.log("[initialized] CONTROLLER listening on port 2356 and broadcast port 2356");
	
    //Listens for new connections and reconnections (but do not recognize them)
	rainfall.listen((obj, from) => {
		console.log("[new node] whoiscontroller/iamback received from " + from.address + ":" + from.port);
        //Add id to node ids
        var id = ids++;
        //Send message, saying he is the controller and no need for keepalive messages
        rainfall.send(from, {
            packageType: 'iamcontroller | lifetime',
            'yourId': id,
            'lifetime': 0,
        }, (err)=>{
            if (err) console.log(err);
            console.log("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
        });
	}, 'whoiscontroller | iamback');

	//Listens for data
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id > ids) {
			console.log("[new data]	Received data from unknown node " + obj.id);
			return;
		}
        console.log("[new data] Data from node " + obj.id + " received: ");
        //Print all received data
		obj.data.forEach((data) => {
			console.log("	[data] Data with id " + data.id + " received: " + data.value);
		});

	}, 'data');

	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id > ids) {
            console.log("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        console.log("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((command) => {
            console.log("   [external command] Command with id " + command.id + " received: " + command.value);
        });
	}, 'externalcommand');
});
