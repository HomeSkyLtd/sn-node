var net = require('net');

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;

function Driver (params, callback) {
    if (!params.)
    this._socket = new net.Socket(params);
}
/**
    The client should call this function to instantiate the driver. The new driver is passed in the callback function.
    The implementation is very example, just copy and paste the code bellow.
    @param {Object} [params] - An object containing parameters for the specific driver
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
    throw Error("Not implemented");
};

/**
    Stops listening for messages. But, if you start listening again, this instance must work
*/
Driver.prototype.stop = function () {
    throw Error("Not implemented");
};

/**
    Closes driver. After that call, the driver don't need to work anymore and should stop any assync task
*/
Driver.prototype.close = function () {
    throw Error("Not implemented");
};

/**
    Sends a message to address
    @param {Driver~Address} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {Driver~onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function (to, message, callback) {
    var socket = net.createConnection(to.port, to.address, function () {
        socket.end(message);
    });
};

/**
    Gets the driver network address. Only need to work when "listening" was called
    @returns {Driver~Address} Network address
*/
Driver.prototype.getAddress = function () {
    return  {
        address: this._socket.localAddress,
        port: this._socket.localPort
    };
};

/**
    Gets the broadcast network address. Only needs to work when "listening" was called.
    It should return an object in the same format as the "to" argument in Driver.send
    @returns {Driver~Address}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    return {
        address: BROADCAST_ADDR,
        port: this._broadcast_port
    };
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
