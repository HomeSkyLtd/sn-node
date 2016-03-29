var xbee_api = require('xbee-api');
var SerialPort = require('serialport').SerialPort;
var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
	api_mode: 1,       // [1, 2]; 1 is default, 2 is with escaping (set ATAP=2)
	module: "802.15.4",// ["802.15.4", "ZNet", "ZigBee", "Any"]; This does nothing, yet!
	raw_frames: false  // [true, false]; If set to true, only raw byte frames are emitted (after validation) but not parsed to objects.
});

/**
  // Something you might want to send to XBee
	var frame_obj = {
		type: ,
		command: ,
		commandParameter: []
	};

	// Encode frame to be sent
	console.log(xbeeAPI.buildFrame(frame_obj));

	// Something you migth receive from an XBee
	var raw_frame = new Buffer([
		0x7E, 0x00, 0x13, 0x97, 0x55, 0x00, 0x13, 0xA2, 0x00, 0x40, 0x52, 0x2B,
		0xAA, 0x7D, 0x84, 0x53, 0x4C, 0x00, 0x40, 0x52, 0x2B, 0xAA, 0xF0
	]);

	// Decode frame to receive
	console.log(xbeeAPI.parseFrame(raw_frame));
*/

/**
 * Creates a driver for xbee
	@param {Object} params - an object with the following parameters:<br/>
	<ul>
		<li>baud rate: symbols transmitted per second, 9600 by default
		<li>data bits: 8 bits by default
		<li>stop bits: 1 bit by default
		<li>parity: "None" by default
	</ul>
*/
function Driver(params) {
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
};

Driver.prototype.listen = function (msgCallback, listenCallback) {
	this._serialport.on("open", () => {
		if (listenCallback) listenCallback();
	});

	if (this._serialport.isOpen()) {
		if (listenCallback) listenCallback();
	}

	this._serialport.on("data", (raw_frame) => {
		var frame = xbeeAPI.parseFrame(raw_frame);
		msgCallback(frame);
	});
}

Driver.prototype.send = function (to, msg, callback) {
	var frame_obj = {
		type: C.FRAME_TYPE.TX_REQUEST_64,
		destination64: to.address,
		data: msg
	}

	this._serialport.write(xbeeAPI.buildFrame(frame_obj), callback);
	console.log("Sent XBee frame to " + to.address);
}

Driver.prototype.close = function() {
	if (this._serialport.isOpen()) {
		this._serialport.close(function() {
			console.log("Error while closing serial port.");
		});
	}
}

exports.Driver = Driver
