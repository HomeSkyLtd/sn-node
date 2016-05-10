/*jshint esversion: 6 */

var Enum = require('enum');
var Rainfall = require("../rainfall");
var fs = require("fs");

/**
 * Construct instance of Leaf and get controller address.
 * @class
 * @param {Object} driver Driver object
 * @param {Object} args Arguments object: </br>
 * <ul>
 * 		<li> {Array} dataType list of dataTypes to specify data.
 * 		<li> {Array} commandType list of commandList to specify data.
 * 		<li> {Integer} timeout time between two attempts of sending whoiscontroller.
 * 		<li> {Integer} limitOfPackets number of attempts before stoping.
 * </ul>
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter.
 */
function Leaf (driver, args, callback) {
	nPackagesSent = 0;

	this._driver = driver;
	this._nodeClass = parseClass(args.dataType, args.commandType);

	this._dataType = args.dataType;
	this._rainandType = args.commandType;

	this._listOfCallbacks = [];

	var timeout = 10*1000;
	if (args.timeout) {
		timeout = args.timeout;
	}

	var limitOfPackets = 3;
	if (args.limitOfPackets) {
		limitOfPackets = args.limitOfPackets;
	}

	this._rain = new Rainfall.Rainfall(this._driver);

	var id_dir = process.env.HOME + "/.node_id";
	var obj = {};

	fs.access(id_dir, fs.F_OK, (err) => {
		if (!err) {
			this._myId = fs.readFileSync(id_dir, 'utf8', 'r');
			obj = {
				packageType: Rainfall.PACKAGE_TYPES.iamback,
				id: this._myId
			};

			this._rain.listen((msg, from) => {
				clearInterval(timerknock);

				console.log("[leaf.listening] Message welcomeback received from " + JSON.stringify(from));

				callback(null, this);

				return false;
			}, Rainfall.PACKAGE_TYPES.welcomeback, null,
			function () {console.log("[leaf.listening] Starting listening for welcome back.");});

		} else {
			obj = {packageType: Rainfall.PACKAGE_TYPES.whoiscontroller};

			this._rain.listen((msg, from) => {
						clearInterval(timerknock);

						console.log("[leaf.listening] Message iamcontroller received from " + JSON.stringify(from) + ": " + JSON.stringify(msg));
					    this._controllerAddress = from;
					    this._myId = msg.yourId;

						fs.writeFile(id_dir, this._myId, function (err) {
							if (err) throw err;

							console.log("[leaf.listening] file " + id_dir + " created.");
						});

						for (var func of this._listOfCallbacks) {
							func(this);
						}

						callback(null, this);

						return false;
				    }, Rainfall.PACKAGE_TYPES.iamcontroller, null, null);
		}

		this._rain.listen((msg, from) => {
				clearInterval(timerknock);

				var lifetimeCallback = function (that) {
					console.log("[leaf.listening] Message lifetime received");

					that._controllerAddress = from;
					that._lifetime = msg.lifetime;

					if (that._lifetime !== 0) {
						setInterval(() => {
							var object = {
								packageType: Rainfall.PACKAGE_TYPES.keepalive,
								id: that._myId
							};
							that._rain.send(from, object, function (err) { if (err) throw err; });

							console.log("[leaf.listening] Message keep alive sent to CONTROLLER.");
						}, that._lifetime);
					}
				};

				if (this._myId) {
					lifetimeCallback(this);
				} else {
					this._listOfCallbacks.push(lifetimeCallback);
				}

				return false;
			}, Rainfall.PACKAGE_TYPES.lifetime, null, null);

		this._rain.listen((msg, from) => {
			clearInterval(timerknock);

			var describeYourselfCallback = function (that) {
				console.log("[leaf.listening] Message describeyourself received");

				var enumClass = Rainfall.NODE_CLASSES.get(that._nodeClass);
				var object = {
					packageType: Rainfall.PACKAGE_TYPES.description,
					id: that._myId,
					nodeClass: that._nodeClass
				};

				if (enumClass.has(Rainfall.NODE_CLASSES.actuator) && enumClass.has(Rainfall.NODE_CLASSES.sensor)) {
					object.dataType = that._dataType;
					object.commandType = that._rainandType;
				} else if (enumClass.has(Rainfall.NODE_CLASSES.actuator)) {
					object.commandType = that._rainandType;
				} else if (enumClass.has(Rainfall.NODE_CLASSES.sensor)) {
					object.dataType = that._dataType;
				}

				that._rain.send(from, object, function (err) { if (err) throw err; });
				console.log("[leaf.listening] message description sent " + JSON.stringify(object));
			};

			if (this._myId) {
				describeYourselfCallback(this);
			} else {
				this._listOfCallbacks.push(describeYourselfCallback);
			}

			return false;
		}, Rainfall.PACKAGE_TYPES.describeyourself, null, null);

		this._rain.sendBroadcast(obj, function (err) {
			if (err) throw err;
		});
		++nPackagesSent;
		console.log("[leaf.sending] message " + JSON.stringify(obj) + " sent in broadcast. " + nPackagesSent + " attempt(s).");

		timerknock = setInterval(() => {
			++nPackagesSent;
			if (nPackagesSent > limitOfPackets) {
				callback(new Error("Package sent " + args.limitOfPackets + " times. Stoping connection"), this);
				clearInterval(timerknock);
			} else {
				this._rain.sendBroadcast(obj, function (err) {
					if (err) throw err;
				});
				console.log("[leaf.sending] message " + JSON.stringify(obj) + " sent in broadcast. " + nPackagesSent + " attempt(s).");
			}
		}, timeout);

	});
}

/**
 * Factories instance of Leaf and get controller address.
 * @class
 * @param {Object} driver Driver object
 * @param {Object} args Arguments object: </br>
 * <ul>
 * 		<li> {Array} dataType list of dataTypes to specify data.
 * 		<li> {Array} commandType list of commandList to specify data.
 * 		<li> {Integer} timeout time between two attempts of sending whoiscontroller.
 * 		<li> {Integer} limitOfPackets number of attempts before stoping.
 * </ul>
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter.
 */
function createLeaf(driver, args, callback) {
	new Leaf(driver, args, callback);
}

/**
 * Send a message with data from sensor to controller.
 * @param {Object|Array} data Array of objects or one object with this fields
 * <ul>
 * 		<li>id: which of its parameters he is sending.
 * 		<li>value: value captured by sensor.
 * </ul>
 * @param {Leaf~onDataSent} [callback] function executed after data is sent
 */
Leaf.prototype.sendData = function (data, callback) {
	if (!data) throw Error("[leaf.sendData] Can't send undefined object.");
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.sensor)) {
		var msg = "[leaf.sendData] This leaf is not a sensor. Data cannot be sent.";
		throw new Error(msg);
	}

	var object = {
		packageType: Rainfall.PACKAGE_TYPES.data,
		id: this._myId
	};

	if (!Array.isArray(data)) {
		data = [data];
	}

	object.data = data;
	console.log("[leaf.sendData] data sent " + JSON.stringify(object));

	this._rain.send(this._controllerAddress, object, callback);
};

/**
 * Listen a message with command from actuator to controller.
 * @param {Leaf~onCommandListened} [callback] function to be called when a object (command) arrives
 * @param {Leaf~onListening} [callback] function to be called when it starts listening
 */
Leaf.prototype.listenCommand = function (objectCallback, listenCallback) {
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.actuator)) {
		var msg = "[leaf.listenCommand] This leaf is not a actuator. Command cannot be received.";
		throw new Error(msg);
	}

	this._rain.listen(objectCallback, Rainfall.PACKAGE_TYPES.command, this._controllerAddress, listenCallback);
	console.log("[leaf.listenCommand] Listening command from controller.");
};

/**
 * Decide if class is Sensor, Actuator or both.
 * @param {Array} dataType list of dataTypes to specify data.
 * @param {Array} commandList list of commandTypes to specify commands.
 * @returns {Enum} NODE_CLASSES sensor or actuator.
 */
var parseClass = function(dataType, commandType) {
	var result = 0;

	if (dataType && dataType.length !== 0)
		result |= Rainfall.NODE_CLASSES.sensor;

	if (commandType && commandType.length !== 0)
		result |= Rainfall.NODE_CLASSES.actuator;

	return result;
};

exports.createLeaf = createLeaf;
