
// Hold connections
var connections = [];

/**
    @class
    Driver object for a network protocol
    @param {Object} [params] - An object containing parameters for the specific driver
    @param {Driver~onInitialized} [callback] - Function to be called when the driver is initialized
*/
function Driver (params, callback) {
    this._id = params.id;
    connections[params.id] = this;
    if (callback) setTimeout(callback, 1);
}

/**
    Starts listening for messages
    @param {Driver~onMessage} msgCallback - Function to be called when a message arrives
    @param {Driver~onListening} [listenCallback] - Function to be called driver is listening, or if an error occurred
*/
Driver.prototype.listen = function (msgCallback, listenCallback) {
    if (this._listen) {
        if (listenCallback) listenCallback(Error("Already listening"));
        return;
    }
    this._listen = msgCallback;
    if (listenCallback) listenCallback(null);

}

/**
    Stops listening for messages
*/
Driver.prototype.stop = function () {
    if (!this._listen)
        throw Error("Not listening to Stop");
    delete this._listen;
}

/**
    Closes driver
*/
Driver.prototype.close = function () {
    if (this._listen)
        delete this._listen;
}

/**
    Sends a message to address
    @param {Object} to - Object containing the address object of the recipient
    @param {Buffer} message - Buffer containing the message to be sent
    @param {Driver~onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function (to, message, callback) {
    if (to === -1) {
        //Broadcast
        for (var i = 0; i < connections.length; i++) {
            if (i !== this._id && connections[i]._listen) {
                connections[i]._listen(message, this._id);
            }
        }
    }
    else if (connections[to]._listen) {
        //Send message: target is listening
        connections[to]._listen(message, this._id);

    }
    else {
        //Target not listening: do nothing
    }
    if (callback) callback();
}

/**
    Gets the broadcast network address. Only need to work when "listening" was called
    @returns {Object}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    return -1;
}

/**
    Compares two address
    @returns {boolean} true if address1 and adress2 are the same and false otherwise
*/
Driver.compareAddresses = function (address1, address2) {
    return address1 == address2;
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
