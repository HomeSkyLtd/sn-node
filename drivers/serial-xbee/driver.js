var xbee_api = require('xbee-api');

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
	this._baud_rate = (params.baud_rate === undefined ? 9600 : params.baud_rate);
	this._data_bits = (params.data_bits === undefined ? 8 : params.data_bits);
	this._stop_bits = (params.stop_bits === undefined ? 1 : params.stop_bits);
	this._parity = (params.parity === undefined ? "none" : params.stop_bits);
};

Driver.prototype.listen = function (msgCallback, listenCallback) {
	//TODO: listen message
}

Driver.prototype.send = function (to, msg, callback) {
	//TODO: send message
}

exports.Driver = Driver
