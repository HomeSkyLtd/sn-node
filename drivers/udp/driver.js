const dgram = require("dgram");

const BROADCAST_ADDR = "255.255.255.255";

/**
    @class
    Creates a driver for a UDP socket
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>rport: The port listened by the server
        <li>address: Optional. The IP address listened by the server. If not specified, the operating system
            will attempt to listen on all addresses
        <li>broadcast_port: The port used when creating a broadcast address
    </ul>
    @param {Driver~onInitialized} [callback] - Function to be called when the driver is initialized
    
*/
function Driver(params, cb){
    this._rport = params.rport;
    this._address = params.address;
    this.broadcast_port = params.broadcast_port;
    this._server = dgram.createSocket('udp4');
    if (cb)
        cb(null);
}

/**
    Opens a UDP socket listening the port and address specified in the rport parameter
    @param {Driver~onMessage} msgCallback - Function to be called when a message arrives
    @param {Driver~onListening} [listenCallback] - Function to be called driver is listening,
        or if an error occurred
*/
Driver.prototype.listen = function (msgCallback, listenCallback) {
    if(this._address === undefined)
        this._server.bind(this._rport);
    else
        this._server.bind(this._rport, this._address);

    this._server.on('error', (err) =>{
        if (listenCallback) listenCallback(err);
    });

    this._server.on('listening', () =>{
        if (listenCallback) listenCallback(null);
    });

    this._server.on('message', (msg, rinfo) =>{
        var rport = msg.readInt16BE(msg.length - 2);
        rinfo.port = rport;
        msgCallback(msg.slice(0, msg.length - 2), rinfo);
    });
}

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
    var client = dgram.createSocket('udp4');
    client.bind();

    client.on('listening', () => {
        if(to.address === BROADCAST_ADDR) client.setBroadcast(true);
        var listenPort = new Buffer([Number(this._rport) >> 8, Number(this._rport) & 0xFF]);

        client.send(Buffer.concat([msg, listenPort]), to.port, to.address, (err) => {
            client.close();
            if (callback) callback(err);
        });
    });

}

/**
    Closes the UDP server, if listen() was called
*/
Driver.prototype.close = function() {
    
    this._server.close();
}

/**
    Gets the driver network address. Only need to work when "listening" was called beforehands
    @returns {Object} Network address
*/
Driver.prototype.getAddress = function(){
    try{
        var address = this._server.address();
    }
    catch(err){
        throw new Error("Failed to retrieve address. Have you called listen()?");
    }
    return address;
}

/**
    Compares two addresses
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
Driver.compareAddresses = function(a1, a2){
    return (a1.address === a2.address);
}

/**
    Gets the broadcast network address. Only need to work when "listening" was called beforehands
    @returns {Object}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function(){
    return {address: BROADCAST_ADDR, port: this.broadcast_port};
}

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