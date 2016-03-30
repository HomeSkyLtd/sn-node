/**
	@class
    Driver object for a network protocol
    @type {Object} Returns a Driver instance
    @param {Object} [params] - An object containing parameters for the specific driver
    @param {Driver~onInitialized} [callback] - Function to be called when the driver is initialized
*/
function Driver (params, callback) {
    throw Error("not implemented")
}

/**
    Starts listening for messages
    @param {Driver~onMessage} msgCallback - Function to be called when a message arrives
    @param {Driver~onListening} [listenCallback] - Function to be called when a message arrives
*/
Driver.prototype.listen = function (msgCallback, listenCallback) { 
    throw Error("Not implemented");
}

/**
	Stops listening for messages
*/
Driver.prototype.close = function () {
    throw Error("Not implemented");
}

/**
	Sends a message to address 
  	@param {Object} to - Object containing the address object of the recipient
  	@param {Buffer} message - Buffer containing the message to be sent
  	@param {Driver~onSent} [callback] - Function to be called when the message was sent

*/
Driver.prototype.send = function (to, message, callback) {
    throw Error("Not implemented");
}

/**
    Gets the driver network address. Only need to work when "listening" was called
    @type {Object} Network address
*/
Driver.prototype.getAddress = function () {
    throw Error("Not implemented");
}

/**
    Gets the broadcast network address. Only need to work when "listening" was called
    @type {Object}  Broadcast network address
*/
Driver.prototype.getBroadcastAddress = function () {
    throw Error("Not implemented");
}

/**
    Compares two address
    @type {boolean} true if address1 and adress2 are the same and false otherwise
*/
Driver.compareAddresses = function (address1, address2) {
    throw Error("Not implemented");
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