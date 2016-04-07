/*jshint esversion: 6 */

const dgram = require("dgram");

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;

/**
    @class
    Creates a driver for a UDP socket
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>[rport]: The port listened by the server. If undefined, server will listen on
            arbitrary port
        <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,
            a default value will be used
    </ul>
    @param {Driver~onInitialized} [callback] - Function to be called when the driver is initialized

*/
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
        if (cb) cb(null);
    });
}

/**
    Opens a UDP socket listening the port and address specified in the rport parameter
    @param {Driver~onMessage} msgCallback - Function to be called when a message arrives
    @param {Driver~onListening} [listenCallback] - Function to be called driver is listening,
        or if an error occurred
*/
Driver.prototype.listen = function (msgCallback, listenCallback) {
    this._msgCallback = msgCallback;

    //must remove callbacks defined previously, otherwise they are still going to get called!
    this._server.removeAllListeners('message');
    this._server.on('message', this._msgCallback);
    listenCallback();
};

/**
    Sends a UDP packet.
    @param {Object} to - Object containing the address object of the recipient. Contains the following fields:<br />
    <ul>
        <li>address: the target IP address
        <li>port: the target port
    @param {Buffer} message - Buffer containing the message to be sent
    @param {Driver~onSent} [callback] - Function to be called when the message was sent

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
    Stops the UDP server, if listen() was called
*/
Driver.prototype.stop = function() {
	this._msgCallback = function(){};
    //must remove callbacks defined previously, otherwise they are still going to get called!
    this._server.removeAllListeners('message');
    this._server.on('message', this._msgCallback);
};


/**
    Gets the driver network address. Only need to work when "listening" was called beforehands
    @returns {Object} Network address
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

/**
    Compares two addresses
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
Driver.compareAddresses = function(a1, a2){
    return (a1.address === a2.address);
};

/**
    Gets the broadcast network address. Only need to work when "listening" was called beforehands
    @returns {Object}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function(){
    return {address: BROADCAST_ADDR, port: this._broadcast_port};
};

exports.Driver = Driver;

/**
 * Callback used by Driver.
 * @callback Driver~onInitialized
 * @param {Error} error - If there is a problem initializing this will be an Error object, otherwise will be null
 */

/**
 * Callback used by listen.
 * @callback Driver~onMessage
 * @param {Buffer} message - Buffer containing the buffer received from the network
 * @param {Object} from - Object containing the address object of the transmitter
 */

/**
 * Callback used by listen.
 * @callback Driver~onListening
 * @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
 */

/**
 * Callback used by send.
 * @callback Driver~onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
 */
