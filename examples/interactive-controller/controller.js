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
            stdin.removeAllListeners("data");
            //Stop printing messages
            can_print = false;
            console.log("Entered Command mode.");
            const ask = readline.createInterface({
              input: process.stdin,
              output: process.stdout
            });
            ask.question("Inform the NODE_ID COMMAND_ID COMMAND to send the command: ", (answer) => {
                var params = answer.split(' ').map((val) => parseInt(val));
                rainfall.send(nodes[params[0]], { 
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
        nodes[id] = from;
        //Send message, saying he is the controller and no need for keepalive messages
        rainfall.send(from, {
            packageType: 'iamcontroller | lifetime',
            'yourId': id,
            'lifetime': 0,
        }, (err)=>{
            if (err) print_message(err);
            print_message("[new node] iamcontroller sent to node " + id + " (" + from.address + ":" + from.port + ")");
        });
	}, 'whoiscontroller | iamback');

	//Listens for data
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id >= nodes.length) {
			print_message("[new data]	Received data from unknown node " + obj.id);
			return;
		}
        print_message("[new data] Data from node " + obj.id + " received: ");
        //Print all received data
		obj.data.forEach((data) => {
			print_message("	[data] Data with id " + data.id + " received: " + data.value);
		});

	}, 'data');

	//Listens for external commands
	rainfall.listen((obj, from) => {
		if (obj.id < 0 || obj.id > nodes.length) {
            print_message("[new external command] Received external command from unknown node " + obj.id);
            return;
        }
        print_message("[new external command] External Command from node " + obj.id + " received: ");
        obj.command.forEach((cmd) => {
            print_message("   [external command] Command with id " + command.id + " received: " + command.value);
        });
	}, 'externalcommand');
});


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