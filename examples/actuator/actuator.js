var Driver = require("../../communicator/test/test_driver.js");
var Leaf = require("../../leaf/leaf.js");

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
					unity: "%"
				}]
			},
			function (err, leaf) {
				if (err) console.log(err);
				else {
					leaf.listenCommand(
						function(){

						},
						function() {
							console.log("[leaf.listening] Started listening for commands.")
						});
				}
			});
	}
})
