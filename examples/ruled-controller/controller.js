/*jshint esversion: 6 */
var Rainfall = require("rainfall");
var Tcp = require("rainfall-tcp");
var Rule = require("./rule.js");
const readline = require('readline');

/*  Really simple controller, don't accept reconnections, do not ask for nodes description and no keepalive needed
*/

var ids = 0;
var rules = new Rule.Rule();
var nodeState = {};	// map of nodes id, each one has map of data ids which the value is the data from sensor.
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

function initRules () {
	rules.addRule({
		clause: [
			[
				{
					rhs: '1.1',
					operator: '>=',
					lhs: 20
				}
			]
		],
		command: {
			nodeId: 0,
			dataId: 1,
			value: 1,
			address: "192.168.1.110",
			port: 4568
		}
	});

	rules.addRule({
		clause: [
			[
				{
					rhs: '1.1',
					operator: '<',
					lhs: 20
				}
			]
		],
		command: {
			nodeId: 0,
			dataId: 1,
			value: 0,
			address: "192.168.1.110",
			port: 4568
		}
	});
}

Tcp.createDriver({rport:2356, broadcast_port: 2356, udplisten: true}, (err, driver) => {
	if (err) {
		console.log("Failed to start network interface:");
		console.log(err);
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
				console.log('	[command] Command ' + command.value + " sent to node " + command.nodeId);
			}
		);
	};

	initRules();
	
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
            if (err) {
				console.log(err);
			} else {
            	console.log("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
			}
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
			if (nodeState[obj.id] === undefined) {
				nodeState[obj.id] = {};
			}
			nodeState[obj.id][data.id] = data.value;
			console.log("	[data] Data with id " + data.id + " received: " + data.value);
		});

		rules.getCommandsIfClauseIsTrue((commands) => {
			commands.forEach(sendCommand);
		});
	}, 'data');

	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id > ids) {
            console.log("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        console.log("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((cmd) => {
			nodeState[obj.id][cmd.id] = cmd.value;
            console.log("   [external command] Command with id " + cmd.id + " received: " + cmd.value);
        });

		rules.getCommandsIfClauseIsTrue((commands) => {
			commands.forEach(sendCommand);
		});

	}, 'externalcommand');

	/*print_message("[initialized] Listening on port 2356 and broadcast port 2356");
    print_message("Press ENTER to insert rule");

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
	});*/
});

exports.nodeState = nodeState;
