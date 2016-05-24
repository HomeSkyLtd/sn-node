/*jshint esversion: 6*/

var Driver = require("rainfall-tcp");
var Leaf = require("rainfall-leaf");

//Creates the TCP driver
Driver.createDriver({rport: 4568}, function (err, driver) {
	if (err)
        console.log(err);
	else {
        //Creates the Leaf
		Leaf.createLeaf(
			driver,
			{
                //This leaf receives one command
				dataType: [],
				commandType: [{
					id: 0,
					type: "bool",
					commandCategory: "lightswitch",
                    range: [0, 1],
                    unit: ""
				}],
                path: false
			},
			function (err, leaf) {
				if (err)
                    console.log(err);
				else {
					leaf.listenCommand(
						function (obj) {
                            onCommand(obj.command[0]);
						},
						function() {
							if (err)
                                console.log(err);
							else {
                                //Node is running
								console.log("[initialized] Light switch initialized");
							}
						});
				}
			});
	}
});

//Command callback
function onCommand(cmd) {
    console.log("[command received] " + (!cmd.value ? "Turn off" : "Turn On"));
}
