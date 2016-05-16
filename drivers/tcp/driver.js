/*jshint esversion: 6 */

var net = require('net');
var udp = require('../udp/');

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;

/**
    Creates the TCP driver. It also contains a UDP driver for broadcast communication
*/
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

/**
    The client should call this function to instantiate the driver. The new driver is passed in the callback function.
    The implementation is very example, just copy and paste the code bellow.
    @param {Object} [params] - An object containing rport and broadcast_port
    @param {Driver~onInitialized} [callback] - Function to be called when the driver is initialized
**/
function createDriver(params, callback) {
    new Driver(params, callback);
}
/**
    Starts listening for messages
    @param {Driver~onMessage} msgCallback - Function to be called when a message arrives
    @param {Driver~onListening} [listenCallback] - Function to be called driver is listening, or if an error occurred
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
    Stops listening for messages. But, if you start listening again, this instance must work
*/
Driver.prototype.stop = function () {
    this._tcpServer.close();
    this._udpDriver.stop();
};

/**
    Closes driver. After that call, the driver don't need to work anymore and should stop any assync task
*/
Driver.prototype.close = function () {
    this._tcpServer.close();
    this._udpDriver.close();
};

/**
    Sends a message to address
    @param {Driver~Address} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {Driver~onSent} [callback] - Function to be called when the message was sent

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
    Gets the broadcast network address. Only needs to work when "listening" was called.
    It should return an object in the same format as the "to" argument in Driver.send
    @returns {Driver~Address}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    return this._udpDriver.getBroadcastAddress();
};

/**
    Compares two address
    @param {Driver~Address} address1 - First address to compare
    @param {Driver~Address} address2 - Second address to compare
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
Driver.compareAddresses = function (address1, address2) {
    return address1.address === address2.address;
};

exports.createDriver = createDriver;

/**
    Actually anything used by the driver do identify the address of
    the node. For example, in UDP it is the port and the ip address of the node.
    @typedef Driver~Address
*/

/**
 * Callback used by Driver.
 * @callback Driver~onInitialized
 * @param {Error} error - If there is a problem initializing this will be an Error object, otherwise will be null
 * @param {Driver} driver - The new driver instance
 */

/**
 * Callback used by listen.
 * @callback Driver~onMessage
 * @param {Buffer} message - Buffer containing the buffer received from the network
 * @param {Driver~Address} from - Object containing the address object of the transmitter
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
