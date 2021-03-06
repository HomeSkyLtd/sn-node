/*jshint esversion: 6*/

var should = require("should");

var Leaf = require("../leaf.js");
var Driver = require("rainfall/test/test_driver.js");
var Rainfall = require("rainfall");

describe('sensor-driver', function () {
	Driver.createDriver({id: 1}, (err, driver) => {
		describe('leaf', function () {

			it('Sensor should boot without errors', function (done) {
				Leaf.createLeaf(
					driver,
					{
						dataType: [{
							id: 101,
							type: "real",
							range: [0, 40],
							measureStrategy: "periodic",
							dataCategory: "temperature",
							unit: "ºC"
						},
						{
							id: 102,
							type: "int",
							range: [0, 255],
							measureStrategy: "periodic",
							dataCategory: "luminance",
							unit: "lm"
						}],
						commandType: [{
							id: 103,
							type: "real",
							range: [0, 1],
							commandCategory: "lightintensity",
							unit: "cd"
						}],
						timeout: 5*1000,
						limitOfPackets: 3,
						path: false
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

							object = {id: 103, value: 0.5};
							leaf.sendExternalCommand(object, function(err) {
								if (err) {
									err.should.not.be.Error();
								} else {
									object.should.be.exactly("{id: 103, value: 0.5}");
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
			var comm = new Rainfall.Rainfall(driver);

			var to = driver.getBroadcastAddress();
			var msg = {
				packageType: Rainfall.PACKAGE_TYPES.iamcontroller,
				yourId: 1
			};
			comm.send(to, msg, function(err) {if (err) done(err);});
			console.log("Message iamcontroller sent.");

			to = driver.getBroadcastAddress();
			msg = {
				packageType: Rainfall.PACKAGE_TYPES.welcomeback,
			};
			comm.send(to, msg, function(err) {if (err) done(err);});
			console.log("Message welcomeback sent.");

			msg = {
				packageType: Rainfall.PACKAGE_TYPES.lifetime,
				lifetime: 5*1000
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("Message lifetime sent.");

			msg = {
				packageType: Rainfall.PACKAGE_TYPES.describeyourself
			};
			comm.send(to, msg, function(err) {if (err) console.log("Send error: " + err);});
			console.log("Message describeyourself sent.");
		});
		done();
	});

});
