/*jshint esversion: 6 */
var Rainfall = require("rainfall");
var Tcp = require("rainfall-tcp");

const readline = require('readline');

/*  Really simple controller but interactive, which you can send commands to actuators,
    don't accept reconnections, do not ask for nodes description and no keepalive needed
*/

//Keep track of nodes address
var nodes = [];

Tcp.createDriver({rport:2356, broadcast_port: 2356, udplisten: true}, (err, driver) => {
	if (err) {
		print_message("Failed to start network interface:");
		print_message(err);
		return;
	}
	var rainfall = new Rainfall.Rainfall(driver);

    print_message("[initialized] Listening on port 2356 and broadcast port 2356");
    print_message("Press ENTER to send command message");

    //Listens for console input
    var stdin = process.openStdin();
    stdin.addListener("data", function listener (d) {
        if (d.toString().trim() === "")  {
			if(!hasActuator()){
				console.log("No actuator registered in the controller");
				console.log("Press ENTER to send command message");
				return;
			}
			stdin.removeAllListeners("data");
            //Stop printing messages
            can_print = false;
            console.log("Entered Command mode.");
            const ask = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
			printActuators();
            ask.question("Inform the NODE_ID COMMAND_ID COMMAND to send the command: ", (answer) => {
                var params = answer.split(' ').map((val) => parseInt(val));
                rainfall.send(nodes[params[0]].address, {
                    packageType: 'command',
                    command: [{
                        id: params[1],
                        value: params[2]
                    }]
                }, (err) => {
                    if (err) console.log(err);
                    else {
                        console.log("[command sent] To node " + params[0]);
                    }
                    ask.close();
                    can_print = true;
                    stdin = process.openStdin();
                    stdin.addListener("data", listener);
                    print_message("Press ENTER to send command message");
               });

            });

        }
    });

    //Listens for new connections and reconnections (but do not recognize them)
	rainfall.listen((obj, from) => {
		print_message("[new node] whoiscontroller/iamback received from " + from.address + ":" + from.port);
        //Add id to nodes
        var id = nodes.length;
        nodes[id] = {address: from};
        //Send message, saying he is the controller and no need for keepalive messages
        rainfall.send(from, {
            packageType: 'iamcontroller | lifetime | describeyourself',
            'yourId': id,
            'lifetime': 0,
        }, (err)=>{
            if (err) print_message(err);
            print_message("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
        });
	}, 'whoiscontroller | iamback');

	//Listens for descriptions
	rainfall.listen((obj, from) => {
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
		nodes[obj.id].desc = desc;
		//console.log("Description received: " + JSON.stringify(desc));
	}, 'description');

	//Listens for data
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id >= nodes.length) {
			print_message("[new data]	Received data from unknown node " + obj.id);
			return;
		}
        print_message("[new data] Data from node " + obj.id + " received: ");
        //Print all received data
		obj.data.forEach((data) => {
            printFormattedData(false, data, nodes[obj.id]);
		});

	}, 'data');

	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id > nodes.length) {
            print_message("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        print_message("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((command) => {
           printFormattedData(true, command, nodes[obj.id]);
        });
	}, 'externalcommand');
});

printActuators = function(){
	console.log("Available actuators:");
	for(var i = 0 ; i < nodes.length ; ++i){
		// console.log(JSON.stringify(nodes));
		if(nodes[i].desc.nodeClass & Rainfall.NODE_CLASSES.actuator){
			console.log(`Node id: ${i}`);
			for(var commandId in nodes[i].desc.commandType){
				var command = nodes[i].desc.commandType[commandId];
				commandCategory = Rainfall.COMMAND_CATEGORIES.get(command.commandCategory).key;
				type = Rainfall.DATA_TYPES.get(command.type).key;

				console.log(`  id: ${command.id}\tcategory: ${commandCategory}\ttype: ${type}\trange:${command.range}`);
			}
		}
	}
};

printFormattedData = function (is_command, input, node) {
    var description = (is_command ? node.desc.commandType : node.desc.dataType)[input.id];
    
    if (is_command) {
        if (description === null)
            print_message("    [external command] Unexpected external command received: id " + input.id + "received: " + input.value);
        else
            print_message("    [external command] Command with id " + input.id + " (" + 
                Rainfall.COMMAND_CATEGORIES.get(description.commandCategory).key + ") received: " + input.value +
                description.unit);
    }
    else {
         if (description === null)
            print_message("    [data] Unexpected data received: id " + input.id + "received: " + input.value);
        else
            print_message("    [data] Data with id " + input.id + " (" + 
                Rainfall.DATA_CATEGORIES.get(description.dataCategory).key + ") received: " + input.value +
                description.unit);
    }
};

hasActuator = function(){
	for(var i = 0 ; i < nodes.length ; ++i){
		if(nodes[i].desc.nodeClass & Rainfall.NODE_CLASSES.actuator) return true;
	}
	return false;
};

//Function to not print messages while asking for input
var can_print = true;
var print_message = function () {
    var messages = [];

    return function (msg) {
        if (msg)
            messages.push(msg);
        if (can_print) {
            for (var message of messages) {
                console.log(message);
            }
            messages = [];
        }
    };

}();
