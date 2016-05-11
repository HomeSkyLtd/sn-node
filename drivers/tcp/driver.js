/*jshint esversion: 6 */

var net = require('net');
var udp = require('../udp/');

const BROADCAST_ADDR = "255.255.255.255";
const BROADCAST_PORT = 2356;

function Driver (params, callback) {
    this._msgCallback = function () {};
    this._port = params.rport;
    this._listenBroadcast = params.listenbroadcast;
    //TCP socket for general communication
    this._tcpClient = new net.Socket();
    
    net.createServer((socket) => { 
        console.log("foi");
        this._tcpServer = socket;
        udp.createDriver(params, (err, udpInstance) => {
            this._udp = udpInstance;
            if (callback) callback(null, this);
        });
        this._lastCallback = null; 


        this._tcpClient.on('error', (err) => {
            if (this._lastCallback)
                this._lastCallback(err);
            this._lastCallback = null;
        });
        this.tcpServer.on('error', (err) => {
            if (this._lastCallback)
                this._lastCallback(err);
            this._lastCallback = null;
        });
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
    this._tcpServer.on('data', (buf) => {
            console.log("DATA");
    });
    listenCallback();
    /*this._tcp.listen({ port: this._port }, () => {
        this._lastCallback = null;
        //Is listening, start events
        var incomingMessages = {};
        this._tcp.on('data', (buf) => {
            console.log("DATA");
        });

        if (this._listenBroadcast) {
            this._udp.listen(msgCallback, (udpError) => {
                if (listenCallback) listenCallback(udpError);
            });
        }
        else if (listenCallback)
            listenCallback();
    });*/

};

/**
    Stops listening for messages. But, if you start listening again, this instance must work
*/
Driver.prototype.stop = function () {
    this._udp.stop();
};

/**
    Closes driver. After that call, the driver don't need to work anymore and should stop any assync task
*/
Driver.prototype.close = function () {
    this._tcpServer.unref();
    this._udp.close();
};

/**
    Sends a message to address
    @param {Driver~Address} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {Driver~onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function (to, message, callback) {
    if (to.address === this._udp.getBroadcastAddress().address) {
        //Send broadcast using udp
        this._udp.send(to, message, callback);
    }
    else {
        this._lastCallback = callback;
        this._tcpClient.connect({
            port: to.port,
            host: to.address,
            localPort: this._port,
        }, (socket) => {
            console.log("connected");
            socket.end(message);
        });
    }
};

/**
    Gets the broadcast network address. Only needs to work when "listening" was called.
    It should return an object in the same format as the "to" argument in Driver.send
    @returns {Driver~Address}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    return this._udp.getBroadcastAddress();
};

Driver.prototype.getAddress = function () {
    return this._udp.getAddress();
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

createDriver({rport: 2929}, (err, test) => {
    console.log("eita");
    test.listen(() => { }, (err) => {
        console.log("listening " + err);
        test.send(test.getAddress(), Buffer.from("oifads"), (err) => {
            if (err) console.log("err");
            console.log("sent");
            test.close();
        });
    });
});


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
