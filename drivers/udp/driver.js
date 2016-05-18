/*jshint esversion: 6 */

const dgram = require("dgram");

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;

/** @module udp */
/**
    @class UDP driver
**/
function Driver(params, cb){
    //sets listening port, if defined
    if(params.rport !== undefined) this._rport = params.rport;

    //sets broadcast port, if defined
    if(params.broadcast_port !== undefined)
        this._broadcast_port = params.broadcast_port;
    else this._broadcast_port = BROADCAST_PORT;

    //instantiate socket and associate it to a port
    this._server = dgram.createSocket('udp4');
    if(this._rport === undefined)
		this._server.bind();
	else
		this._server.bind(this._rport);

    //ignore any messages received for now
    this._msgCallback = function(){};
    this._server.on('message', this._msgCallback);

    this._server.on('error', (err) =>{
        if (cb) cb(err);
    });

    this._server.on('listening', () =>{
		if (!this._rport)
			this._rport = this._server.address().port;
        if (cb) cb(null, this);
    });
}

function createDriver(params, callback) {
    new Driver(params, callback);
}

/**
    Opens an UDP socket listening the port and address specified in the rport parameter
    @param {onMessage} msgCallback - Function to be called when a message arrives
    @param {onListening} [listenCallback] - Function to be called when the driver is listening,
        or if an error occurred
*/
Driver.prototype.listen = function (msgCallback, listenCallback) {
    this._msgCallback = msgCallback;

    //must remove callbacks defined previously, otherwise they are still going to get called!
    this._server.removeAllListeners('message');
    this._server.on('message', this._msgCallback);
    if (listenCallback) listenCallback();
};

/**
    Sends an UDP packet.
    @param {Address} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function(to, msg, callback) {
    if(to.address === BROADCAST_ADDR) this._server.setBroadcast(true);

    this._server.send(msg, to.port, to.address, (err) => {
        if (callback) callback(err);
    });

};

/**
    Closes the UDP socket. This driver should not be used anmore.
*/
Driver.prototype.close = function() {
    this._server.close();
};

/**
    Stops the UDP server, if listen() was called. You can still use the driver to listen and send
*/
Driver.prototype.stop = function() {
	this._msgCallback = function(){};
    //must remove callbacks defined previously, otherwise they are still going to get called!
    this._server.removeAllListeners('message');
    this._server.on('message', this._msgCallback);
};


/**
    Gets the driver network address. Only works when "listening" was called beforehands
    @returns {Address} Network address
*/
Driver.prototype.getAddress = function(){
    var address;
    try{
        address = this._server.address();
    }
    catch(err){
        throw new Error("Failed to retrieve address. Have you called listen()?");
    }
    return address;
};

var compareAddresses = function(a1, a2){
    return (a1.address === a2.address);
};

/**
    Gets the broadcast network address.
    @returns {Address}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function(){
    return {address: BROADCAST_ADDR, port: this._broadcast_port, family: 'IPv4'};
};



/**
    Creates a driver for UDP socket
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>[rport]: The port listened by the server. If undefined, server will listen on
            arbitrary port
        <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,
            a default value (2356) will be used
    </ul>
    @param {onInitialized} [callback] - Function to be called when the driver is initialized

*/
exports.createDriver = createDriver;

/**
    Compares two addresses
    @param {Address} a1 - First address to compare
    @param {Address} a2 - Second address to compare
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
exports.compareAddresses = compareAddresses;


/**
 * Callback used by Driver.
 * @callback onInitialized
 * @param {Error} error - If there is a problem initializing this will be an Error object, otherwise will be null
 * @param {Driver} driver - The driver object
 */

/**
 * Callback used by listen.
 * @callback onMessage
 * @param {Buffer} message - Buffer containing the buffer received from the network
 * @param {Address} from - Address of the transmitter
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
    @typedef {Object} Address
    @property {String} address - The IP (v4 or v6) address
    @property {Number} port - The UDP port
    @property {String} family - (Optional) The IP version (can be IPv4 or IPv6)
 */
