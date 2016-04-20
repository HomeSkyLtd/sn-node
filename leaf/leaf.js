/*jshint esversion: 6 */
var Enum = require('enum');
var Communicator = require("../communicator");

/**
 * Construct instance of Leaf and get controller address.
 * @class
 * @param {Object} Driver object
 * @param {Array} dataList list of dataTypes to specify data.
 * @param {Array} commandList list of commandTypes to specify commands.
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized
 */
function Leaf (driver, dataList, commandList, callback) {
	this._driver = driver;
	this._nodeClass = parseClass(dataList, commandList);

	this._dataList = dataList;
	this._commandList = commandList;

	this._comm = new Communicator.Communicator(this._driver);
	this._comm.listen((msg, from) => {
				console.log("LEAF: Message iamcontroller received from:");
				console.log(from);
			    this._controllerAddress = from;
			    this._myId = msg.yourid;
				callback();
		    }, Communicator.PACKAGE_TYPES.iamcontroller, null, null);

	this._comm.listen((msg, from) => {
			console.log("LEAF: Message lifetime received");

			this._controllerAddress = from;
			this._lifetime = msg.lifetime;

			if (this._lifetime !== 0) {
				setInterval(() => {
					var object = {
						packageType: Communicator.PACKAGE_TYPES.keepalive,
						id: this._myId
					};
					this._comm.send(from, object, function (err) { if (err) console.log(err); });

					console.log("LEAF: Message keep alive sent to CONTROLLER.");
				}, this._lifetime);
			}
			return false;
		}, Communicator.PACKAGE_TYPES.lifetime, null, null);

	this._comm.listen((msg, from) => {
		console.log("LEAF: Message describeyourself received");

		var object = {
			packageType: Communicator.PACKAGE_TYPES.description,
			id: this._myId,
			nodeClass: this._nodeClass,
			dataType: this._dataList,
			commandType: this._commandList
		};

		this._comm.send(from, object, function (err) { if (err) console.log(err); })
		console.log("LEAF: message description sent: ");
		console.log(object);

		return false;
	}, Communicator.PACKAGE_TYPES.describeyourself, null, null);

	this._comm.sendBroadcast({packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, function (err) {
		if (err) console.log(err);
	});
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

	if (!enumClass.has(Communicator.NODE_CLASSES.sensor)) {
		var msg = "This leaf is not a sensor. Data cannot be sent.";
		throw new Error(msg);
	}

	object.packageType = Communicator.PACKAGE_TYPES.data;
	object.id	   = this._myId;

	console.log("Controller Address: " + this._controllerAddress);

	this._comm.send(this._controllerAddress, object, callback);
};

/**
 * Listen a message with command from actuator to controller.
 * @param {Leaf~onCommandListened} [callback] function to be called when a object (command) arrives
 * @param {Leaf~onListening} [callback] function to be called when it starts listening
 */
Leaf.prototype.listenCommand = function (objectCallback, listenCallback) {
	if (!this._nodeClass.has(Communicator.NODE_CLASSES.actuator)) {
		var msg = "This leaf is not a actuator. Command cannot be received.";
		throw new Error(msg);
	}

	this._comm.listen(objectCallback, Communicator.PACKAGE_TYPES.command, this._controllerAddress, listenCallback);
	console.log("LEAF: Listening command from controller.");
};

/**
 * Decide if class is Sensor, Actuator or both.
 * @param {Array} dataList list of dataTypes to specify data.
 * @param {Array} commandList list of commandTypes to specify commands.
 * @returns {Enum} NODE_CLASSES sensor or actuator.
 */
var parseClass = function(dataList, commandList) {
	var result = 0;

	if (dataList !== null && dataList.length !== 0)
		result |= Communicator.NODE_CLASSES.sensor;

	if (commandList !== null && commandList.length !== 0)
		result |= Communicator.NODE_CLASSES.actuator;

	return result;
};

exports.Leaf = Leaf;
