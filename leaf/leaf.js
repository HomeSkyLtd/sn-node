/*jshint esversion: 6 */

var Enum = require('enum');
var Communicator = require("../communicator");

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
	this._commandType = args.commandType;

	if (args.timeout) {
		var timeout = args.timeout;
	} else {
		var timeout = 30*1000;
	}

	if (args.limitOfPackets) {
		var limitOfPackets = args.limitOfPackets;
	} else {
		var limitOfPackets = 3;
	}

	this._comm = new Communicator.Communicator(this._driver);
	this._comm.listen((msg, from) => {
				clearInterval(timerknock);

				console.log("[leaf.listening] Message iamcontroller received from " + JSON.stringify(from));
			    this._controllerAddress = from;
			    this._myId = msg.yourId;
				callback(null, this);

				return false;
		    }, Communicator.PACKAGE_TYPES.iamcontroller, null, null);

	this._comm.listen((msg, from) => {
			clearInterval(timerknock);

			console.log("[leaf.listening] Message lifetime received");

			this._controllerAddress = from;
			this._lifetime = msg.lifetime;

			if (this._lifetime !== 0) {
				setInterval(() => {
					var object = {
						packageType: Communicator.PACKAGE_TYPES.keepalive,
						id: this._myId
					};
					this._comm.send(from, object, function (err) { if (err) console.log(err); });

					console.log("[leaf.listening] Message keep alive sent to CONTROLLER.");
				}, this._lifetime);
			}
			return false;
		}, Communicator.PACKAGE_TYPES.lifetime, null, null);

	this._comm.listen((msg, from) => {
		clearInterval(timerknock);

		console.log("[leaf.listening] Message describeyourself received");

		var enumClass = Communicator.NODE_CLASSES.get(this._nodeClass);
		var object = {
			packageType: Communicator.PACKAGE_TYPES.description,
			id: this._myId,
			nodeClass: this._nodeClass,
		};

		if (enumClass.has(Communicator.NODE_CLASSES.actuator) && enumClass.has(Communicator.NODE_CLASSES.sensor)) {
			object.dataType = this._dataType;
			object.commandType = this._commandType;
		} else if (enumClass.has(Communicator.NODE_CLASSES.actuator)) {
			object.commandType = this._commandType;
		} else if (enumClass.has(Communicator.NODE_CLASSES.sensor)) {
			object.dataType = this._dataType;
		}

		this._comm.send(from, object, function (err) { if (err) console.log(err); });
		console.log("[leaf.listening] message description sent " + JSON.stringify(object));

		return false;
	}, Communicator.PACKAGE_TYPES.describeyourself, null, null);

	var obj = {packageType: Communicator.PACKAGE_TYPES.whoiscontroller};
	this._comm.sendBroadcast(obj, function (err) {
		if (err) console.log(err);
	});
	++nPackagesSent;
	console.log("[leaf.sending] message " + JSON.stringify(obj) + " sent in broadcast. " + nPackagesSent + " attempt(s).");

	timerknock = setInterval(() => {
		++nPackagesSent;
		if (nPackagesSent > limitOfPackets) {
			callback(new Error("Package sent " + args.limitOfPackets + " times. Stoping connection"), this);
			clearInterval(timerknock);
		} else {
			this._comm.sendBroadcast({packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, function (err) {
				if (err) console.log(err);
			});
			console.log("[leaf.sending] message " + JSON.stringify(obj) + " sent in broadcast. " + nPackagesSent + " attempt(s).");
		}
	}, timeout);
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
	var enumClass = Communicator.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Communicator.NODE_CLASSES.sensor)) {
		var msg = "[leaf.sendData] This leaf is not a sensor. Data cannot be sent.";
		throw new Error(msg);
	}

	var object = {
		packageType: Communicator.PACKAGE_TYPES.data,
		id: this._myId
	};

	if (!Array.isArray(data)) {
		data = [data];
	}

	object.data = data;
	console.log("[leaf.sendData] data sent " + JSON.stringify(object));

	this._comm.send(this._controllerAddress, object, callback);
};

/**
 * Listen a message with command from actuator to controller.
 * @param {Leaf~onCommandListened} [callback] function to be called when a object (command) arrives
 * @param {Leaf~onListening} [callback] function to be called when it starts listening
 */
Leaf.prototype.listenCommand = function (objectCallback, listenCallback) {
	var enumClass = Communicator.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Communicator.NODE_CLASSES.actuator)) {
		var msg = "[leaf.listenCommand] This leaf is not a actuator. Command cannot be received.";
		throw new Error(msg);
	}

	this._comm.listen(objectCallback, Communicator.PACKAGE_TYPES.command, this._controllerAddress, listenCallback);
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
		result |= Communicator.NODE_CLASSES.sensor;

	if (commandType && commandType.length !== 0)
		result |= Communicator.NODE_CLASSES.actuator;

	return result;
};

exports.createLeaf = createLeaf;
