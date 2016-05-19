/*jshint esversion: 6 */

var Enum = require('enum');
var Rainfall = require("rainfall");
var fs = require("fs");

/**
	@module Leaf
*/

/**
 * Construct instance of Leaf and get controller address.
 * @class
 * @param {Object} driver Driver object
 * @param {Object} args Arguments object
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

    var idIsOld = false;

	fs.access(id_dir, fs.F_OK, (err) => {
		if (!err) {
			this._myId = fs.readFileSync(id_dir, 'utf8', 'r');
			obj = {
				packageType: Rainfall.PACKAGE_TYPES.iamback,
				id: this._myId
			};
            idIsOld = true;
			this._rain.listen((msg, from) => {
				clearInterval(timerknock);

				console.log("[leaf.listening] Message welcomeback received from " + JSON.stringify(from));
                idIsOld = false;
                this._controllerAddress = from;

				for (var func of this._listOfCallbacks) {
	                func(this);
	            }

				callback(null, this);

				return false;
			}, Rainfall.PACKAGE_TYPES.welcomeback, null,
			function () {console.log("[leaf.listening] Starting listening for welcome back.");});



		} else {
			obj = {packageType: Rainfall.PACKAGE_TYPES.whoiscontroller};
		}

        this._rain.listen((msg, from) => {
            clearInterval(timerknock);

            console.log("[leaf.listening] Message iamcontroller received from " + JSON.stringify(from) + ": " + JSON.stringify(msg));
            this._controllerAddress = from;
            this._myId = msg.yourId;
            idIsOld = false;
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

		this._rain.listen((msg, from) => {
				clearInterval(timerknock);

				var lifetimeCallback = function (that) {
					console.log("[leaf.listening] Message lifetime received");

					// that._controllerAddress = from;
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
				if (this._myId && !idIsOld) {
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
			if (this._myId && !idIsOld) {
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
* Factory method to construct a Leaf instance. Do not return anything.
*/
function createLeaf(driver, args, callback) {
	new Leaf(driver, args, callback);
}

/**
 * Send a message with data from sensor to controller.
 * @param {Object|Array} data Array of objects or one object with this fields
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
 * Send a message with command from actuator/sensor to controller.
 * @param {Object|Array} command Array of objects.
 * @param {Leaf~onCommandSent} [callback] function executed after data is sent
 */
Leaf.prototype.sendExternalCommand = function (command, callback) {
	if (!command) throw Error("[leaf.sendExternalCommand] Can't send undefined object.");
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.actuator)) {
		var msg = "[leaf.listenCommand] This leaf is not a actuator. Command cannot be received.";
		throw new Error(msg);
	}

	var object = {
		packageType: Rainfall.PACKAGE_TYPES.externalcommand,
		id: this._myId
	};

	if (!Array.isArray(command)) {
		command = [command];
	}

	object.command = command;
	console.log("[leaf.sendExternalCommand] command sent " + JSON.stringify(object));

	this._rain.send(this._controllerAddress, object, callback);
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

/**
 * Factories instance of Leaf and get controller address.
 * @param {Object} driver Driver object.
 * @param {Object} args Arguments object.
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter.
 */
exports.createLeaf = createLeaf;

/**
* Arguments for Leaf constructor.
* @typedef {Object} Leaf~args
* @property {Array} dataType - list of dataTypes of specific data.
* @property {Array} commandType - list of commandList to specify data.
* @property {Number} timeout - time between two attempts of sending whoiscontroller.
* @property{Number} limitOfPackets - number of attempts before stoping.
*/

/**
 * Callback used by Leaf.
 * @callback Leaf~onInitialized
 * @param {Error} error - If there is a problem creating leaf this will be an Error object, otherwise will be null
 * @param {Driver} driver - The created driver object
 */

/**
* Data or list of data send to controller from this leaf.
* @typedef {Object|Array} Leaf~data
* @property {Number} id - number identifying which of the metrics that this sensor is sending.
* @property {Number|String|Boolean} value - data captured by sensor.
*/

/**
* Callback used by sendData
* @callback Leaf~onDataSent
* @param {Error} error - If there is a problem sending data this will be an Error object, otherwise will be null
*/

/**
* Callback used by listenCommand when message of command arrives.
* @callback Leaf~onCommandListened
* @returns {boolean|undefined} False if server should stop listening. Otherwise it will keep listening.
* @param {Object} message - Json object containing the received object
* @param {Object} from - Object containing the address object of the transmitter
*/

/**
* Callback used by listenCommand when leaf starts listening.
* @callback Leaf~onListening
* @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
*/

/**
* Command or list of commands executed by user and sent from actuator to controller.
* @typedef {Object|Array} Leaf~command
* @property {Number} id - number identifying which of the metrics that this sensor is sending.
* @property {Number|String|Boolean} value - command executed by user of the network and sent from actuator to controller.
*/

/**
* Callback executed by sendExternalCommand when a command is executed by the user of the network.
* @callback Leaf~onCommandSent
* @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
*/
