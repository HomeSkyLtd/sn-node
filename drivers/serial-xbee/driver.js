/*jshint esversion: 6 */

var xbee_api = require('xbee-api');
var SerialPort = require('serialport').SerialPort;
var C = xbee_api.constants;

/**
    @module xbee_s1
*/

/**
	@class
	Xbee-S1 driver class
*/
function Driver(params, callback) {
	this._tty_port = params.tty_port; // /dev/ttyAMA0, /dev/ttyUSB0, etc.
	this._baud_rate = (params.baud_rate === undefined ? 9600 : params.baud_rate);
	this._data_bits = (params.data_bits === undefined ? 8 : params.data_bits);
	this._stop_bits = (params.stop_bits === undefined ? 1 : params.stop_bits);
	this._parity = (params.parity === undefined ? "none" : params.stop_bits);

	this._xbeeAPI = new xbee_api.XBeeAPI({
		api_mode: 1,       // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
		module: "802.15.4",// ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
		raw_frames: false  // [true, false]; If set to true, only raw byte frames are emitted (after validation) but not parsed to objects.
	});


	// Set msgCallback to null, meaning that the device is closed and not listening.
	this._msgCallback = null;

	this._serialport = new SerialPort(this._tty_port, {
	    baudrate: this._baud_rate,
		dataBits: this._data_bits,
		stopBits: this._stop_bits,
		parity: this._parity,
	    parser: this._xbeeAPI.rawParser()
	});

	// Communication with XBee is enabled just after serial port is opened.
	this._serialport.on("open", () => {
		this._getAddress(callback);
	});
}


function createDriver(params, callback) {
	new Driver(params, callback);
}

compareAddresses = function(address1, address2) {
	var addr1Pad = "0".repeat(64).concat(address1.address).substr(-64);
	var addr2Pad = "0".repeat(64).concat(address2.address).substr(-64);
	return addr1Pad === addr2Pad;
};

Driver.prototype._getAddress = function(callback) {
	// If address is already saved, just return it.
	if (!this.address) {
		if (!this._serialport.isOpen()) {
			var msg = "Address not ready yet. Use driver methods inside a callback.";
			throw new Error(msg);
		}

		var frame_obj = {
			type: C.FRAME_TYPE.AT_COMMAND, // Send a command
			command: "SH",	// Get 32 higher address bits
			commandParameter: []
		};


		// Waits for some data from XBee
		this._xbeeAPI.on("frame_object", (frame) => {
			if (frame.command === "SH") {
				this.address = frame.commandData.toString('hex');
			} else if (frame.command === "SL") {
				this.address += frame.commandData.toString('hex');
				this._xbeeAPI.removeAllListeners("frame_object");
				if (callback) callback(null, this); // After address is ready, execute callback.
			}
		});

		this._serialport.write(this._xbeeAPI.buildFrame(frame_obj));
		frame_obj.command = "SL"; // Get 32 lower address bits
		this._serialport.write(this._xbeeAPI.buildFrame(frame_obj));
	}
	return {address: this.address};
};

/*
	Public method that calls _getAddress but doesn't pass a callback as parameter.
	@returns {Object} An object with the following parameters:<br/>
	<ul>
		<li>address: device's 64 bits MAC address as value in address field.
	</ul>
*/
Driver.prototype.getAddress = function() {
	return this._getAddress(); // Call private getAddress without a callback.
};

/**
 * Listen to serial port, when it is open. When a frame is received form XBee, executes callback msgCallback.
 * @param {module:xbee_s1~onListening} [msgCallback] - Callback executed when serial port is open.
 * @param {module:xbee_s1~onMessage} [listenCallback] - Callback executed when a XBee delivers a frame.
 */
Driver.prototype.listen = function (msgCallback, listenCallback) {
	// Set private msgCallback so it is not null (XBee is open).
	this._msgCallback = msgCallback;

	this._xbeeAPI.on("frame_object", (frame) => {
		//only consider messages that have a "data" field
		if(frame.data)
			if (this._msgCallback) {
				this._msgCallback(frame.data, {address: frame.remote64});
			}
	});

	if (this._serialport.isOpen()) {
		if (listenCallback) listenCallback();
	}
};

/**
 * A method to get the broadcast address, which is defined by XBee and constant equals to 0xFFFF.
 * @returns {module:xbee_s1~address} An object with the broadcast address
 */
Driver.prototype.getBroadcastAddress = function () {
	return {address: "000000000000FFFF"};
};

/**
 * Send a message to an destination, and an optional callback is executed after.
 * @param {module:xbee_s1~address} to - the destination address
 * @param {Buffer} msg - content to be sent to destination
 * @param {module:xbee_s1~onSent} [callback] - function to be executed after package is sent
 */
Driver.prototype.send = function (to, msg, callback) {
	var frame_obj = {
		type: C.FRAME_TYPE.TX_REQUEST_64,
		destination64: to.address,
		data: msg
	};

	this._serialport.write(this._xbeeAPI.buildFrame(frame_obj), callback);
	 //console.log("Sent XBee frame to " + to.address);
};

/**
 * Stop XBee. Serial port is still open, but XBee no longer responds to delivered frames.
 */
Driver.prototype.stop = function() {
	if (this._serialport.isOpen()) {
		this._msgCallback = null; // If XBee is closed, then it doesn't execute a messsage callback.
	}
};

/**
 * Close XBee. Serial port is closed and XBee no longer responds to delivered frames.
 */
Driver.prototype.close = function() {
	if (this._serialport.isOpen()) {
		this._serialport.close(function(err) {
			// if (err) console.log(err);
			// else console.log("Port successfully closed");
		});
	}
};

/**
	Factory method that constructs Driver instances
	@param {module:xbee_s1~initParams} params - the object specifying the driver parameters
	@param {module:xbee_s1~onInitialized} [callback] - Function to be called when serial port is initialized and MAC address is read.
*/
exports.createDriver = createDriver;

/**
	Compare if two XBee addresses are equal.
	@param {module:xbee_s1~address} a1 - First Xbee address
	@param {module:xbee_s1~address} a2 - Second Xbee address
	@returns {boolean} True if address1 is equal to address2, false otherwise.
*/
exports.compareAddresses = compareAddresses;

/**
 * Callback used by Driver.
 * @callback module:xbee_s1~onInitialized
 * @param {Error} error - If there is a problem initializing this will be an Error object, otherwise will be null
 */

/**
 * Callback used by listen.
 * @callback module:xbee_s1~onMessage
 * @param {Buffer} message - Buffer containing the buffer received from the network
 * @param {module:xbee_s1~address} from - Object containing the address object of the transmitter
 */

/**
 * Callback used by listen.
 * @callback onListening
 * @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
 */

/**
 * Callback used by send.
 * @callback onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
 */

 /**
     Parameters object used with the factory method
     @typedef {Object} initParams
     @property {String} tty_port - The serial port where the xbee module is connected
     @property {Number} [baud_rate] - Symbols transmitted per second, 9600 by default
     @property {Number} [data_bits] - Number of bits to be transmitted in the serial channel, 8 by default
     @property {Number} [stop_bits] - Number of stop bits used in the serial channel, 8 by default
     @property {String} [parity] - Specify the behavior of the parity bit in the serial channel. Must be
        one of "none", "even", "mark", "odd", "space". Defaults to "none".
 */

 /**
    Address object
    @typedef {Object} address
    @property {String} 64-bit MAC address of the device
 */
