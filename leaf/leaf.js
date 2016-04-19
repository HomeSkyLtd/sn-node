/*jshint esversion: 6 */

var Communicator = require("../communicator");

/**
 * Construct instance of Leaf and get controller address.
 * @class
 * @param {Object} Driver object
 * @param {Enum} NODE_CLASSES define between sensor, actuator or controller
 * @param {Enum} NODE_CATEGORY define the category, e.g. termometer, lightSensor, lightSwitch, etc.
 * @param {Leaf~onInitialized} [callback] function executed after Leaf instance initialized
 */
function Leaf (driver, nodeClass, nodeCategory, callback) {
	this._driver = driver;
	this._nodeClass = nodeClass;
	this._nodeCategory = nodeCategory;

	this._comm = new Communicator.Communicator(this._driver);

	comm.listen((msg, from) => {
			    this._controllerAddress = from;
			    this._myId = msg.yourid;
			    return false;
		    }, Communicator.PACKAGE_TYPES.iamcontroller, null, callback);

	comm.listen((msg, from) => {
			this._lifetime = msg.lifetime;
			return false;
		    }, Communicator.PACKAGE_TYPES.lifetime, null, () => {
			setInterval(function() {
				comm.send(from,
					  {
						  packageType: Communicator.PACKAGE_TYPES.keepalive,
						  id: this._myId
					  }, function (err) { console.log(err); });
			}, this._lifetime);
		    });

	comm.sendBroadcast({packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, function (err) {
		if (err) console.log(err);
	});
}

/**
 * Send a message with data from sensor to controller.
 * @param {Object} object
 * <ul>
 * 	<li>Node category: define wich sensor it is
 * 	<li>Data: value captured by sensor
 * </ul>
 * @param {Leaf~onDataSent} [callback] function executed after data is sent
 */
Leaf.prototype.sendData = function (object, callback) {
	if (!this._nodeClass.has(Communicator.NODE_CLASSES.sensor)) {
		var msg = "This leaf is not a sensor. Data cannot be sent.";
		throw new Error(msg);
	}

	object.packageType = Communicator.PACKAGE_TYPES.data;
	object.nodeClass   = Communicator.NODE_CLASSES.sensor;
	object.id	   = this._myId;

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
};
