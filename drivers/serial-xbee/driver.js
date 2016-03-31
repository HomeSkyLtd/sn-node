var xbee_api = require('xbee-api');
var SerialPort = require('serialport').SerialPort;
var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
	api_mode: 1,       // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
	module: "802.15.4",// ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
	raw_frames: false  // [true, false]; If set to true, only raw byte frames are emitted (after validation) but not parsed to objects.
});

/**
 	@class
 	Creates a driver for xbee
	@param {Object} params - an object with the following parameters:<br/>
	<ul>
		<li>baud rate: symbols transmitted per second, 9600 by default
		<li>data bits: 8 bits by default
		<li>stop bits: 1 bit by default
		<li>parity: "None" by default
	</ul>
	@param {Driver~onInitialized} [callback] - Function to be called when serial port is initialized and MAC address is read.
*/
function Driver(params, callback) {
	this._tty_port = params.tty_port; // ttyAMA0, ttyUSB0, etc.
	this._baud_rate = (params.baud_rate === undefined ? 9600 : params.baud_rate);
	this._data_bits = (params.data_bits === undefined ? 8 : params.data_bits);
	this._stop_bits = (params.stop_bits === undefined ? 1 : params.stop_bits);
	this._parity = (params.parity === undefined ? "none" : params.stop_bits);

	this._serialport = new SerialPort(this._tty_port, {
	    baudrate: this._baud_rate,
			dataBits: this._data_bits,
			stopBits: this._stop_bits,
			parity: this._parity,
	    parser: xbeeAPI.rawParser()
	});

	// Set msgCallback to null, meaning that the device is closed and not listening.
	this._msgCallback = null;
	// Communication with XBee is enabled just after serial port is opened.
	this._serialport.on("open", () => {
		this._getAddress(callback);
	});
}

/**
	Compare if two XBee addresses are equals.
	@param {object} - First Xbee address
	@param {object} - Second Xbee address
	@returns {boolean} True if address1 is equal to address2, false otherwise.
*/
Driver.compareAddresses = function(address1, address2) {
	return address1.address === address2.address;
}

/**
	Private method that saves MAC address as this objects' attribute.
	@param {Driver~onAddressReady} [callback] - Callback function to be executes after address is read from device and saved.
	@returns {Object} an object with the following parameters:<br/>
	<ul>
		<li>address: device's 64 bits MAC address as value in address field.
	</ul>
*/
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
		xbeeAPI.on("frame_object", (frame) => {
			if (frame.command === "SH") {
				this.address = frame.commandData.toString('hex');
			} else if (frame.command === "SL") {
				this.address += frame.commandData.toString('hex');
				if (callback) callback(); // After address is ready, execute callback.
			}
		});

		this._serialport.write(xbeeAPI.buildFrame(frame_obj));
		frame_obj["command"] = "SL"; // Get 32 lower address bits
		this._serialport.write(xbeeAPI.buildFrame(frame_obj));
	}
	return {address: this.address};
}

/**
	Public method that calls _getAddress but doesn't pass a callback as parameter.
	@returns {Object} An object with the following parameters:<br/>
	<ul>
		<li>address: device's 64 bits MAC address as value in address field.
	</ul>
*/
Driver.prototype.getAddress = function() {
	return this._getAddress(); // Call private getAddress without a callback.
}

/**
 * Listen to serial port, when it is open. When a frame is received form XBee, executes callback msgCallback.
 * @param {Driver~onListen} [callback] - Callback executed when serial port is open.
 * @param {Driver~onMessage} [callback] - Callback executed when a XBee delivers a frame.
 */
Driver.prototype.listen = function (msgCallback, listenCallback) {
	// Serial port must be open. So waits for it to open or, if is open, call callback.
	this._serialport.on("open", () => {
		if (listenCallback) listenCallback();
	});

	if (this._serialport.isOpen()) {
		if (listenCallback) listenCallback();
	}

	// Set private msgCallback so it is not null (XBee is open).
	this._msgCallback = msgCallback;

	xbeeAPI.on("frame_object", (frame) => {
		if (this._msgCallback) this._msgCallback(frame);
	});
}

/**
 * A method to get the broadcast address, which is defined by XBee and constant equals to 0xFFFF.
 * @returns {Object} An object with the following parameters:<br/>
 * <ul>
 *  <li>address: 64 bit MAC address of the broadcast address, defined by XBee and constant.
 * </ul>
 */
Driver.prototype.getBroadcastAddress = function () {
	return {address: "000000000000FFFF"};
}

/**
 * Send a message to an destination, and an optional callback is executed after.
 * @param {Object} to - an object with the following parameters:<br/>
 * <ul>
 *  <li>address: 64 bit MAC address of the destination device.
 * </ul>
 */
Driver.prototype.send = function (to, msg, callback) {
	var frame_obj = {
		type: C.FRAME_TYPE.TX_REQUEST_64,
		destination64: to.address,
		data: msg
	}

	this._serialport.write(xbeeAPI.buildFrame(frame_obj), callback);
	console.log("Sent XBee frame to " + to.address);
}

/**
 * Close XBee. Serial port is still open, but XBee no longer responds to delivered frames.
 */
Driver.prototype.close = function() {
	if (this._serialport.isOpen()) {
		this._msgCallback = null; // If XBee is closed, then it doesn't execute a messsage callback.
	}
}

exports.Driver = Driver
