/*jshint esversion: 6 */

var Enum = require('enum');
var Rainfall = require("rainfall");
var fs = require("fs");

/**
	@module Leaf
*/

/**
	@class
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
	if (typeof args.path === 'string') {
		fs.mkdirSync(args.path);
		id_dir = args.path + "/.node_id";
	}

	var obj = {};

    var idIsOld = false;

	fs.access(id_dir, fs.F_OK, (err) => {
		if (err || args.path === false) {
			obj = {packageType: Rainfall.PACKAGE_TYPES.whoiscontroller};
		} else {
			this._myId = fs.readFileSync(id_dir, 'utf8', 'r');
			obj = {
				packageType: Rainfall.PACKAGE_TYPES.iamback,
				id: this._myId
			};
            idIsOld = true;
			this._rain.listen((msg, from) => {
				clearInterval(timerknock);

                idIsOld = false;
                this._controllerAddress = from;

				for (var func of this._listOfCallbacks) {
	                func(this);
	            }

				callback(null, this);

				return false;
			}, Rainfall.PACKAGE_TYPES.welcomeback, null,
			function () {});
		}

        this._rain.listen((msg, from) => {
            clearInterval(timerknock);

            this._controllerAddress = from;
            this._myId = msg.yourId;
            idIsOld = false;

			if (args.path !== false) {
	            fs.writeFile(id_dir, this._myId, function (err) {
	                if (err) callback(err);
	            });
			}

            for (var func of this._listOfCallbacks) {
                func(this);
            }

            callback(null, this);

            return false;
        }, Rainfall.PACKAGE_TYPES.iamcontroller, null, null);

		this._rain.listen((msg, from) => {
				clearInterval(timerknock);

				var lifetimeCallback = function (that) {
					that._lifetime = msg.lifetime;

					if (that._lifetime !== 0) {
						setInterval(() => {
							var object = {
								packageType: Rainfall.PACKAGE_TYPES.keepalive,
								id: that._myId
							};
							that._rain.send(from, object, function (err) { if (err) callback(err); });
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

				that._rain.send(from, object, function (err) { if (err) callback(err); });
			};
			if (this._myId && !idIsOld) {
				describeYourselfCallback(this);
			} else {
				this._listOfCallbacks.push(describeYourselfCallback);
			}

			return false;
		}, Rainfall.PACKAGE_TYPES.describeyourself, null, null);

		this._rain.sendBroadcast(obj, function (err) {
			if (err) callback(err);
		});
		++nPackagesSent;

		timerknock = setInterval(() => {
			++nPackagesSent;
			if (nPackagesSent > limitOfPackets) {
				callback(new Error("Package sent " + limitOfPackets + " times. Stoping connection"), this);
				clearInterval(timerknock);
			} else {
				this._rain.sendBroadcast(obj, function (err) {
					if (err) callback(err);
				});
			}
		}, timeout);

	});
}

function createLeaf(driver, args, callback) {
	new Leaf(driver, args, callback);
}

/**
 * Send a message with data from sensor to controller.
 * @param {module:Leaf~data} data Array of objects or one object.
 * @param {module:Leaf~onDataSent} [callback] function executed after data is sent.
 */
Leaf.prototype.sendData = function (data, callback) {
	if (!data) callback(new Error("[leaf.sendData] Can't send undefined object."));
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.sensor)) {
		var msg = "[leaf.sendData] This leaf is not a sensor. Data cannot be sent.";
		callback(new Error(msg));
	}

	var object = {
		packageType: Rainfall.PACKAGE_TYPES.data,
		id: this._myId
	};

	if (!Array.isArray(data)) {
		data = [data];
	}

	object.data = data;

	this._rain.send(this._controllerAddress, object, callback);
};

/**
 * Listen a message with command from actuator to controller.
 * @param {module:Leaf~onCommandListened} [callback] function to be called when a object (command) arrives
 * @param {module:Leaf~onListening} [callback] function to be called when it starts listening
 */
Leaf.prototype.listenCommand = function (objectCallback, listenCallback) {
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.actuator)) {
		var msg = "[leaf.listenCommand] This leaf is not a actuator. Command cannot be received.";
		callback(new Error(msg));
	}

	this._rain.listen(objectCallback, Rainfall.PACKAGE_TYPES.command, this._controllerAddress, listenCallback);
};

/**
 * Send a message with command from actuator/sensor to controller.
 * @param {module:Leaf~command} command Array of objects or a single object.
 * @param {module:Leaf~onCommandSent} [callback] function executed after data is sent
 */
Leaf.prototype.sendExternalCommand = function (command, callback) {
	if (!command) callback(Error("[leaf.sendExternalCommand] Can't send undefined object."));
	var enumClass = Rainfall.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Rainfall.NODE_CLASSES.actuator)) {
		var msg = "[leaf.listenCommand] This leaf is not a actuator. Command cannot be received.";
		callback(new Error(msg));
	}

	var object = {
		packageType: Rainfall.PACKAGE_TYPES.externalcommand,
		id: this._myId
	};

	if (!Array.isArray(command)) {
		command = [command];
	}

	object.command = command;

	this._rain.send(this._controllerAddress, object, callback);
};

/*
 * Decide if class is Sensor, Actuator or both.
 * dataType - list of dataTypes to specify data.
 * commandList - list of commandTypes to specify commands.
 * returns Enum NODE_CLASSES sensor or actuator.
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
 * @param {module:Leaf~args} args Arguments object.
 * @param {module:Leaf~onInitialized} [callback] function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter.
 */
exports.createLeaf = createLeaf;

/**
* Arguments for Leaf constructor.
* @typedef {Object} args
* @property {module:Leaf~dataType} dataType - list of dataTypes of specific data.
* @property {module:Leaf~commandType} commandType - list of commandList to specify data.
* @property {Number} timeout - time between two attempts of sending whoiscontroller.
* @property {Number} limitOfPackets - number of attempts before stoping.
* @property {Boolean|String} path - Where to save the id in the filesystem. If false, the id is not saved, if undefined the id is saved in the home directory, otherwise it is saved in the path passed.
*/

/**
 * Callback used by Leaf.
 * @callback onInitialized
 * @param {Error} error - If there is a problem creating leaf this will be an Error object, otherwise will be null
 * @param {Driver} driver - The created driver object
 */

/**
* Data or list of data send to controller from this leaf.
* @typedef {Object|Array} data
* @property {Number} id - number identifying which of the metrics that this sensor is sending.
* @property {Number|String|Boolean} value - data captured by sensor.
*/

/**
* Callback used by sendData
* @callback onDataSent
* @param {Error} error - If there is a problem sending data this will be an Error object, otherwise will be null
*/

/**
* Callback used by listenCommand when message of command arrives.
* @callback onCommandListened
* @returns {boolean|undefined} False if server should stop listening. Otherwise it will keep listening.
* @param {Object} message - Json object containing the received object
* @param {Object} from - Object containing the address object of the transmitter
*/

/**
* Callback used by listenCommand when leaf starts listening.
* @callback onListening
* @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
*/

/**
* Command or list of commands executed by user and sent from actuator to controller.
* @typedef {Object|Array} command
* @property {Number} id - number identifying which of the metrics that this sensor is sending.
* @property {Number|String|Boolean} value - command executed by user of the network and sent from actuator to controller.
*/

/**
* Callback executed by sendExternalCommand when a command is executed by the user of the network.
* @callback onCommandSent
* @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
*/

/**
    Command type object. Used by actuator to inform the controller the accepted commands.
    @typedef {Object} commandType
    @property {Number} id - Id of the command. Defined by the actuator.
    @property {DATA_TYPES|String} type - The format of the command.
    @property {Number[]} [range] - Range of the command, it is a list with two values (start and end).
    It is needed only when the type of the command is numeric.
    @property {COMMAND_CATEGORIES|String} commandCategory - The category of the command
    @property {String} unit - Unit of the command (for example: meters, seconds)
*/

/**
    Data type object. Used by sensor to inform the controller the collected data.
    @typedef {Object} dataType
    @property {Number} id - Id of the data. Defined by the sensor.
    @property {DATA_TYPES|String} type - The format of the data sent.
    @property {Number[]} [range] - Range of the data, it is a list with two values (start and end).
    It is needed only when the type of the data is numeric.
    @property {DATA_CATEGORIES|String} dataCategory - The category of the data
    @property {String} unit - Unit of the data (for example: meters, seconds)
    @property {MEASURE_STRATEGIES|String} measureStrategy - The strategy used by the sensor
    to measure and send data
*/
