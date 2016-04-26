/*jshint esversion: 6 */
var Enum = require('enum');
var Communicator = require("../communicator");

/**
 * Construct instance of Leaf and get controller address.
 * @class
 * @param {Object} driver Driver object
 * @param {Object} args Arguments object: </br>
 * <ul>
 * 		<li> {Array} dataList list of dataTypes to specify data.
 * 		<li> {Array} commandList list of commandList to specify data.
 * 		<li> {Integer} timeout time between two attempts of sending whoiscontroller.
 * 		<li> {Integer} limitOfPackets number of attempts before stoping.
 * </ul>
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter.
 */
function Leaf (driver, args, callback) {
	nPackagesSent = 0;

	this._driver = driver;
	this._nodeClass = parseClass(args.dataList, args.commandList);

	this._dataList = args.dataList;
	this._commandList = args.commandList;

	this._comm = new Communicator.Communicator(this._driver);
	this._comm.listen((msg, from) => {
				clearInterval(timerknock);

				console.log("[leaf.listening] Message iamcontroller received from:");
				console.log(from);
			    this._controllerAddress = from;
			    this._myId = msg.yourid;
				callback();
				
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

		var object = {
			packageType: Communicator.PACKAGE_TYPES.description,
			id: this._myId,
			nodeClass: this._nodeClass,
			dataList: this._dataList,
			commandList: this._commandList
		};

		this._comm.send(from, object, function (err) { if (err) console.log(err); })
		console.log("[leaf.listening] message description sent: ");
		console.log(object);

		return false;
	}, Communicator.PACKAGE_TYPES.describeyourself, null, null);

	this._comm.sendBroadcast({packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, function (err) {
		if (err) console.log(err);
	});
	++nPackagesSent;
	console.log("[leaf.sending] message whoiscontroller sent in broadcast. " + nPackagesSent + " attempt(s).");

	timerknock = setInterval(() => {
		++nPackagesSent;
		if (nPackagesSent > args.limitOfPackets) {
			callback(new Error("Package sent " + args.limitOfPackets + " times. Stoping connection"));
			clearInterval(timerknock);
		} else {
			this._comm.sendBroadcast({packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, function (err) {
				if (err) console.log(err);
			});
			console.log("[leaf.sending] message whoiscontroller sent in broadcast. " + nPackagesSent + " attempt(s).");
		}
	}, args.timeout);
}

/**
 * Send a message with data from sensor to controller.
 * @param {Object} object
 * <ul>
 * 		<li>Data ID: which of its parameters he is sending.
 * 		<li>Data: value captured by sensor.
 * </ul>
 * @param {Leaf~onDataSent} [callback] function executed after data is sent
 */
Leaf.prototype.sendData = function (object, callback) {
	var enumClass = Communicator.NODE_CLASSES.get(this._nodeClass);

	if (enumClass && !enumClass.has(Communicator.NODE_CLASSES.sensor)) {
		var msg = "[leaf.sendData] This leaf is not a sensor. Data cannot be sent.";
		throw new Error(msg);
	}

	object.packageType = Communicator.PACKAGE_TYPES.data;
	object.id	   = this._myId;

	console.log("[leaf.sendData] Controller Address: " + this._controllerAddress);

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
 * @param {Array} dataList list of dataTypes to specify data.
 * @param {Array} commandList list of commandTypes to specify commands.
 * @returns {Enum} NODE_CLASSES sensor or actuator.
 */
var parseClass = function(dataList, commandList) {
	var result = 0;

	if (dataList && dataList.length !== 0)
		result |= Communicator.NODE_CLASSES.sensor;

	if (commandList && commandList.length !== 0)
		result |= Communicator.NODE_CLASSES.actuator;

	return result;
};

exports.Leaf = Leaf;
