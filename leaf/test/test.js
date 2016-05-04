var should = require("should");

var Leaf = require("../leaf.js");
var Driver = require("../../communicator/test/test_driver.js");
var Comm = require("../../communicator/communicator.js")

describe('sensor-driver', function () {
	Driver.createDriver({id: 1}, (err, driver) => {
		describe('leaf', function () {

			it('Sensor should boot without errors', function (done) {
				Leaf.createLeaf(
					driver,
					{
						dataType: [{
							id: 100,
							type: "real",
							range: [0, 40],
							measureStrategy: "periodic",
							dataCategory: "temperature",
							unit: "ºC"
						}],
						commandType: [],
						timeout: 5*1000,
						limitOfPackets: 3
					},
					(err, leaf) => {
						if (err || err !== null) {
							err.should.not.be.Error();
						} else {
							var object = [{id: 101, value: 26}, {id: 102, value: 100}];
							leaf.sendData(object, function(err) {
								if (err) {
									err.should.not.be.Error();
								} else {
									object.should.be.exactly("[{id: 101, value: 26}, {id: 102, value: 100}]");
								}
							});
						}
					});
					done();
			});
			console.log("New sensor listening");
		});
	});
});

describe("controller-driver", function () {

	it("Controller should send initial data without errors", function (done) {

		// Dummy controler
		Driver.createDriver({id: 0}, (err, driver) => {
			var comm = new Comm.Communicator(driver);

			var to = driver.getBroadcastAddress();
			var msg = {
				packageType: Comm.PACKAGE_TYPES.iamcontroller,
				yourId: 1
			};
			comm.send(to, msg, function(err) {if (err) done(err);});
			console.log("Message iamcontroller sent.");

			var to = driver.getBroadcastAddress();
			var msg = {
				packageType: Comm.PACKAGE_TYPES.welcomeback,
			};
			comm.send(to, msg, function(err) {if (err) done(err);});
			console.log("Message welcomeback sent.");

			msg = {
				packageType: Comm.PACKAGE_TYPES.lifetime,
				lifetime: 5*1000
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("Message lifetime sent.");

			msg = {
				packageType: Comm.PACKAGE_TYPES.describeyourself
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("Message describeyourself sent.");
		});
		done();
	});

});
