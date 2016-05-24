/*jshint esversion: 6 */
var Rainfall = require("rainfall");
var Tcp = require("rainfall-tcp");
var Rule = require("./rule.js");
var Prop = require("./clause/clause.js");
const readline = require('readline');

/*  Really simple controller, don't accept reconnections, do not ask for nodes description and no keepalive needed
*/

var rules = new Rule.Rule();
var nodeState = {};	// map of nodes id, each one has map of data ids which the value is the data from sensor.

var nodes = [];

/* Example
	{
		"1": {
			"1": 10,
			"2": 20
		},
		"2": {
			"1": 30,
			"2": 40
		}
	}
*/

Tcp.createDriver({rport:2356, broadcast_port: 2356, udplisten: true}, (err, driver) => {
	if (err) {
		print_message("Failed to start network interface:");
		print_message(err);
		return;
	}
	var rainfall = new Rainfall.Rainfall(driver);

	var sendCommand = function (command) {
		rainfall.send(
			{
				address: command.address,
				port: command.port,
				family: 'IPv4'
			},
			{
				packageType: 'command',
				command: [{
					id: command.dataId,
					value: command.value
				}]
			},
			() => {
				print_message('	[command] Command ' + command.value + " sent to node " + command.nodeId);
			}
		);
	};

    //Listens for new connections and reconnections (but do not recognize them)
	rainfall.listen((obj, from) => {
		print_message("[new node] whoiscontroller/iamback received from " + from.address + ":" + from.port);

        //Send message, saying he is the controller and no need for keepalive messages
		var id = nodes.length;
        nodes[id] = {address: from};

        rainfall.send(from, {
            packageType: 'iamcontroller | lifetime | describeyourself',
            'yourId': id,
            'lifetime': 0,
        }, (err)=>{
            if (err) {
				print_message(err);
			} else {
            	print_message("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
			}
        });
	}, 'whoiscontroller | iamback');


	// Listens for descriptions
	rainfall.listen((obj, from) => {
		print_message("[NEW DESCRIPTION] from " + obj.id);
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
		//print_message("Description received: " + JSON.stringify(desc));
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
			if (nodeState[obj.id] === undefined) {
				nodeState[obj.id] = {};
			}
			nodeState[obj.id][data.id] = data.value;
			printFormattedData(false, data, nodes[obj.id]);
		});

		rules.getCommandsIfClauseIsTrue((commands) => {
			commands.forEach(sendCommand);
		});
	}, 'data');

	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id >= nodes.length) {
            print_message("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        print_message("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((cmd) => {
			if (nodeState[obj.id] === undefined) {
				nodeState[obj.id] = {};
			}
			nodeState[obj.id][cmd.id] = cmd.value;
            printFormattedData(true, cmd, nodes[obj.id]);
        });

		rules.getCommandsIfClauseIsTrue((commands) => {
			commands.forEach(sendCommand);
		});

	}, 'externalcommand');

	print_message("[initialized] Listening on port 2356 and broadcast port 2356");
    print_message("Press ENTER to insert rule");

    //Listens for console input
    var stdin = process.openStdin();
    stdin.addListener("data", function listener (d) {
        if (d.toString().trim() === "")  {
			if(!hasActuator()){
				print_message("No actuator registered in the controller");
				return;
			}
			stdin.removeAllListeners("data");
            //Stop printing messages

            print_message("Entered Command mode.");
            const ask = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });

			andExps = [];
			orExps = [];

			var insertRule = function (answer) {
				if (answer === 'AND') {
					ask.question("Inform a proposition: ", (answer) => {
						var params = parseParams(answer.split(' '));
						if (params.length !== 3) {
							can_print = true;
							print_message("Proposition must be: 'rhs operator lhs'.");
						} else {
							andExps.push(new Proposition(params[2], params[1], params[0]));
							ask.question("Write AND, OR or OK: ", insertRule);
						}
					});
				} else if (answer === 'OR') {
					orExps.push(andExps);
					andExps = [];
					ask.question("Inform a proposition: ", (answer) => {
						var params = parseParams(answer.split(' '));
						if (params.length !== 3) {
							can_print = true;
							print_message("Proposition must be: 'rhs operator lhs'.");
						} else {
							andExps.push(new Proposition(params[2], params[1], params[0]));
							ask.question("Write AND, OR or OK: ", insertRule);
						}
					});
				} else if (answer === 'OK') {
					orExps.push(andExps);
					ask.question('When the rule is obeyed, execute the command (inform NODE_ID COMMAND_ID VALUE): ', (answer) => {
						var params = parseParams(answer.split(' '));
						if (params.length !== 3) {
							can_print = true;
							print_message("Command must be: 'nodeId commandId value'.");
						} else {
							var command = {
								nodeId: params[2],
								dataId: params[1],
								value: params[0],
								address: nodes[params[2]].address.address,
								port: nodes[params[2]].address.port
							};

							rules.addRule({
								clause: orExps,
								command: command
							});

							ask.close();
							can_print = true;
							stdin = process.openStdin();
							stdin.addListener("data", listener);
							print_message("Press ENTER to send command message");

						}
					});
				} else {
					ask.question('Please, enter "AND" or "OR" or "OK"', insertRule);
				}
			};


			var rule;
			printActuators();
			printSensors();
			can_print = false;
            ask.question("Inform the rule. Inform a proposition: ", (answer) => {
                var params = parseParams(answer.split(' '));
				if (params.length !== 3) {
					can_print = true;
					print_message("Proposition must be: 'rhs operator lhs'.");
					return;
				} else {
					andExps.push(new Proposition(params[2], params[1], params[0]));
					ask.question('Write AND, OR or OK: ', insertRule);
				}
            });
		}
	});
});

hasActuator = function(){
	for(var i = 0 ; i < nodes.length ; ++i){
		if(nodes[i].desc.nodeClass & Rainfall.NODE_CLASSES.actuator) return true;
	}
	return false;
};

printActuators = function(){
	print_message("Available actuators:");
	for(var i = 0 ; i < nodes.length ; ++i){
		// print_message(JSON.stringify(nodes));
		if(nodes[i].desc.nodeClass & Rainfall.NODE_CLASSES.actuator){
			print_message(`Node id: ${i}`);
			for(var commandId in nodes[i].desc.commandType){
				var command = nodes[i].desc.commandType[commandId];
				commandCategory = Rainfall.COMMAND_CATEGORIES.get(command.commandCategory).key;
				type = Rainfall.DATA_TYPES.get(command.type).key;

				print_message(`  id: ${command.id}\tcategory: ${commandCategory}\ttype: ${type}\trange:${command.range}`);
			}
		}
	}
};

printSensors = function(){
	print_message("Available sensors:");
	for(var i = 0 ; i < nodes.length ; ++i){
		// print_message(JSON.stringify(nodes));
		if(nodes[i].desc.nodeClass & Rainfall.NODE_CLASSES.sensor){
			print_message(`Node id: ${i}`);
			for(var dataId in nodes[i].desc.dataType){
				var data = nodes[i].desc.dataType[dataId];
				dataCategory = Rainfall.DATA_CATEGORIES.get(data.dataCategory).key;
				type = Rainfall.DATA_TYPES.get(data.type).key;

				print_message(`  id: ${data.id}\tcategory: ${dataCategory}\ttype: ${type}\trange:${data.range}`);
			}
		}
	}
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

parseParams = function (params) {
	var rhs = params[0];
	var lhs = params[2];

	if (rhs[0] === "\"") {
		rhs = rhs.substring(1, rhs.length - 1);
	} else {
		rhs = parseInt(rhs);
	}

	if (lhs[0] === "\"") {
		lhs = lhs.substring(1, lhs.length - 1);
	} else {
		lhs = parseInt(lhs);
	}

	return [lhs, params[1], rhs];
};

printFormattedData = function (is_command, input, node) {
    var description = null;
    var iters = is_command ? node.desc.commandType : node.desc.dataType;
    for (var i in iters) {
        var desc = iters[i];
        if (input.id === desc.id) {
            description = desc;
            break;
        }
    }
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

exports.nodeState = nodeState;
