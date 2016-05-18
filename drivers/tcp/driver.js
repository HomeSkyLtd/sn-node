/*jshint esversion: 6 */

var net = require('net');
var udp = require('rainfall-udp');

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;


/** @module tcp */

/**
    @typedef initParams
    @property {Boolean} [udplisten] - (Optional) True if you want to listen for broadcast
    messages and false (or undefined) otherwise
    @property {Number} [rport] - (Optional) The port listened by the TCP (and UDP if you are
    listening for broadcasts). If undefined, server will listen on arbitrary port.
    @property {Number} [broadcast_port] - (Optional) The port used when creating a broadcast address. If undefined, a default value (2356) will be used
*/

/**
 * Callback used by Driver.
 * @callback onInitialized
 * @param {Error} error - If there is a problem initializing this will be an Error object, otherwise will be null
 * @param {module:tcp~Driver} driver - The driver object
 */

/**
 * Callback used by listen.
 * @callback onMessage
 * @param {Buffer} message - Buffer containing the buffer received from the network
 * @param {module:tcp~address} from - Address of the transmitter
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
    @typedef {Object} address
    @property {String} address - The IP (v4 or v6) address
    @property {Number} port - The TCP port
    @property {String} family - (Optional) The IP version (can be IPv4 or IPv6)
 */


 /**
    @class Driver
 **/
function Driver (params, callback) {
    this._port = params.rport;
    this._msgCallback = null;
    this._udpListen = params.udplisten;
    //TCP server to listen
    this._tcpServer = net.createServer();
    this._tcpServer.on('error', (err) => {
        if (this._lastCallback) {
            this._lastCallback(err);
            this._lastCallback = null;
        }
    });
    this._tcpServer.on('connection', (socket) => {
        var buf = null;
        var error = null;
        var address = {
            address: socket.remoteAddress,
            family: socket.remoteFamily
        };
        socket.on('data', (data) => {
            if (buf === null)
                buf = data;
            else
                buf = Buffer.concat([buf, data], buf.length + data.length);
        });
        socket.on('end', () => {
            if (this._msgCallback) {
                if (!error) {
                    address.port = buf.readUInt32BE(buf.length - 4);
                    this._msgCallback(buf.slice(0, buf.length - 4), address);
                }
            }
        });
        socket.on('error', (err) => {
            error = err;
        });
    });
    //Creates UDP for broadcast
    udp.createDriver(params, (err, udpInstance) => {
        this._udpDriver = udpInstance;
        if (err)
            callback(err);
        else if (callback)
            callback(null, this);
    });
}

function createDriver(params, callback) {
    new Driver(params, callback);
}

/**
    Opens an TCP socket listening the port and address specified in the rport parameter.
    Also does that for UDP if you want to listen for broadcast messages.
    @param {module:tcp~onMessage} msgCallback - Function to be called when a message arrives
    @param {module:tcp~onListening} [listenCallback] - Function to be called when the driver is
    listening, if an error occurred
*/
Driver.prototype.listen = function (msgCallback, listenCallback) {
    this._lastCallback = listenCallback;
    this._msgCallback = msgCallback;
    this._tcpServer.listen({
        port: this._port
    }, () => {
        this._lastCallback  = null;
        if (this._udpListen) {
            this._udpDriver.listen(msgCallback, listenCallback);
        }
        else if (listenCallback) listenCallback();
    });
};

/**
    Sends an package using TCP. If the address is the broadcast address, sends the
    package using UDP
    @param {module:tcp~address} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {module:tcp~onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function (to, message, callback) {
    if (to.address === BROADCAST_ADDR) {
        //Send using udp
        this._udpDriver.send(to, message, callback);
    }
    else {
        const client = net.createConnection({
            port: to.port,
            host: to.address,
        }, () => {
            var portBuffer = new Buffer(4);
            portBuffer.writeUInt32BE(this._port, 0);
            client.end(Buffer.concat([message, portBuffer], message.length + portBuffer.length));
        });
        client.on('end', () => {
            callback();
        });
        client.on('error', (err) => {
            callback(err);
        });
    }
};

/**
    Stops listening for messages. But, if you start listening again, this instance must work
*/
Driver.prototype.stop = function () {
    this._tcpServer.close();
    this._udpDriver.stop();
};

/**
    Stops the UDP server, if listen() was called. You can still use the driver to listen and send
*/
Driver.prototype.close = function () {
    this._tcpServer.close();
    this._udpDriver.close();
};


/**
    Gets the broadcast network address.
    @returns {module:udp~address}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    return this._udpDriver.getBroadcastAddress();
};

var compareAddresses = function (address1, address2) {
    return address1.address === address2.address;
};



/**
    Creates a driver for TCP socket. It doesn't bind the port. But binds this port to the UDP.
    @param {module:tcp~initParams} params - Parameters to initialize the tcp driver
    @param {module:tcp~onInitialized} [callback] - Function to be called when the driver is initialized

*/
exports.createDriver = createDriver;

/**
    Compares two addresses
    @param {module:tcp~address} a1 - First address to compare
    @param {module:tcp~address} a2 - Second address to compare
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
exports.compareAddresses = compareAddresses;
