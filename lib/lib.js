var Enum = require("enum");
var cbor = require("cbor");

/**
    Notation: a packet is defined by an object in the following format:
    {
        field1: value1,
        field2: value2,
        ...
    }

    Each field has a set of possible values. When conveninent, these values are defined in
    a specific enum.

    Examples:
    pkt = {
        type: "control",
        class: "sensor",
        category: "temperature"
    }

    pkt = {
        type: "data",
        temperature: 25
    }
*/


/**
    @class
    @param {Object} Driver object
*/
function Lib (driver) {
    this._driver = driver;
    this._listeningCallbacks = [];
    this._listening = false;
}

//Defines the fields of the packets
const FIELDS = new Enum([
    // Type of the package
    'packageType', 
    // Class of the node (actuator, sensor)
    'nodeClass',
    // Category of the node (switch, termometer)
    'nodeCategory',
    // Data field
    'data',
    // Command field
    'command'
]);


/** Defines values for the "packageType" field
*/
const PACKAGE_TYPES = new Enum([
    'data', 'hello', 'whoisController', 'IamController', 'command'
]);

exports.PACKAGE_TYPES = PACKAGE_TYPES;

/** Defines values for the "class" field
*/
const NODE_CLASSES = new Enum(["sensor", "actuator", "controller"]);

/** Defines values for the "category" field
*/
const NODE_CATEGORIES = new Enum({
    'termometer':    0,
    'lightSensor':   1,
    'lightSwitch':   2,
    'doorSwitch':    3,
    'airController': 4
});

// List of previous defined fields
// Values in brackets [] can accept lists of values
const VALUES = {
	packageType: [ PACKAGE_TYPES ],
	nodeClass: [ NODE_CLASSES ],
	nodeCategory: [ NODE_CATEGORIES ]	
};

/**
    Internal Utility Functions 
*/

// Given a key, it checks if the passed value is valid based on possible values.
// Then it returns the enum item (if getEnum is true) or the enum item value (otherwise)
function getAndCheckValue(key, value, getEnum) {
    var possibleValues = VALUES[key];
    var acceptArrays = false;

    if (Array.isArray(possibleValues)) {
        acceptArrays = true;
        possibleValues = possibleValues[0];
    }
    
    if (possibleValues !== undefined) {
        if (Array.isArray(value) && acceptArrays) {
            for (i in value) {
                var val = value[i];
                var enumVal = possibleValues.get(val);
                if (enumVal === undefined || enumVal.key.indexOf("|") !== -1)
                    throw new Error("Invalid value (" + val + ")" + " in key '" + FIELDS.get(key).key + "'");
                if (getEnum)
                    value[i] = enumVal;
                else
                    value[i] = enumVal.value;
            }
        }
        else if (Array.isArray(value))
            throw new Error("Arrays don't accepted in key '" + FIELDS.get(key).key + "'");
        else if (possibleValues.get(value) === undefined || possibleValues.get(value).key.indexOf("|") !== -1)
            throw new Error("Invalid value (" + value + ")" + " in key '" + FIELDS.get(key).key+ "'");
        else {
            var enumVal = possibleValues.get(value);
            if (getEnum)
                value = enumVal;
            else
                value = enumVal.value;
        }
    }

    return value;
}

// Function to iterate over all object keys, replacing keys with convertKey function,
// which receives a key and returns the respective mapped key
// It also replaces enum values for its values
function exchangeKeys(object, convertKey, extractValue) {
    var newObject = {};
    
    // Function to iterate over object keys
    function iterateOverObj(key, value, newObject) {
        // If it is an object, iterate over keys and call this funciton for each entry
        if (typeof value === 'object' && !Array.isArray(value) && !value.constructor.isEnumItem) {
            var tempObject = {};
            for (var innerKey in value) {
                iterateOverObj(innerKey, value[innerKey], tempObject);
            }
            newObject[convertKey(key)] = tempObject;
        }
        // Otherwise, check the value and updates object
        else {
            if (typeof value === 'object')
                value = value.value;
            newObject[convertKey(key)] = extractValue(key, value);
        }
    }

    //Iterate over all object keys
    for (var innerKey in object)
        iterateOverObj(innerKey, object[innerKey], newObject);

    return newObject;
}

// Function to encode json object into Buffer
function encode(object) {
    return cbor.encode(exchangeKeys(object, (key) => FIELDS.get(key).value,
        (key, value) => getAndCheckValue(key, value, false)));
}

// Function to decode Buffer into json object into Buffer. Calls callback after it is done
function decode (rawPackage, callback) {
    cbor.decodeFirst(rawPackage, (error, package) => {
        callback(error, error === null ? exchangeKeys(package, (key) => FIELDS.get(Number(key)).key,
            (key, value) => getAndCheckValue(FIELDS.get(Number(key)).key, value, true)) : null);
    });
}

/** 
    Sends a json object to address
    @param {Object} to - Object containing the address object of the recipient
    @param {Object} object - Json object containing the message to be sent
    @param {Lib~onSent} [callback] - Function to be called when the object was sent
*/
Lib.prototype.send = function (to, object, callback) {
    //Package need to have a type:
    if (object.packageType === undefined)
        throw new Error("The object to be sent need to have 'packageType' field");
    this._driver.send(to, encode(object), (err) => {
        if (callback)
            callback(err);
    })
};

/** 
    Sends a json object to broadcast address
    @param {Object} object - Json object containing the message to be sent
    @param {Lib~onSent} [callback] - Function to be called when the object was sent
*/
Lib.prototype.sendBroadcast = function (object, callback) {
    //Package need to have a type:
    if (object.packageType === undefined)
        throw new Error("The object to be sent need to have 'packageType' field");
    this._driver.send(this._driver.getBroadcastAddress(), encode(object), (err) => {
        if (callback)
            callback(err);
    });
};

/**
    Starts listening for objects. You can call this method multiple times to set multiple callbacks
    for each package type (or addresses). Any callback that matches the object condition will be called
    
    @param {Lib~onMessage} objectCallback - Function to be called when a object arrives
    
    @param {Array|Object|null} [packageTypes] - Package types that will issue the callback. It is null if listening 
    for all package types
    
    @param {Array|Object|null} [addresses] - Addresses that will issue the callback. It is null if listening
    for or all package types
    
    @param {Lib~onListening} [listenCallback] - Function to be called when it starts listening
*/
Lib.prototype.listen = function (objectCallback, packageTypes, addresses, listenCallback) {
    
    // Adjust arguments (packageTypes and addresses)
    if (!packageTypes)
        var packageTypes = null
    else if (!Array.isArray(packageTypes))
        packageTypes = [packageTypes];
    else if (packageTypes.length == 0)
        packageTypes = null;

    if (packageTypes != null)
        getAndCheckValue(FIELDS.packageType, packageTypes)

    if (!addresses)
        var addresses = null;
    else if (!Array.isArray(addresses))
        addresses = [addresses];
    else if (addresses.length == 0)
        addresses = null;
    
    this._listeningCallbacks.push({
        'callback': objectCallback,
        'packageType': packageTypes,
        'addresses' : addresses
    });

    // If it isn't listening, start listening
    if (!this._listening) {
        this._listening = true;
        var that = this;
        this._driver.listen((rawPackage, from) => {
            decode(rawPackage, (error, package) => {
                
                /* Function to scan all callbacks, searching for mathcing package */
                var scanPackages = (callback) => {
                    for (var i in cmpCallback.packageType) {
                        if (cmpCallback.packageType[i] == package.packageType) {
                            callback();
                        }
                    }
                };

                /* Function to scan all callbacks, searching for mathcing address */
                var scanAddresses = (callback) => {
                    for (var i in cmpCallback.addresses) {
                        if (that._driver.constructor.compareAddresses(cmpCallback.addresses[i], from)) {
                            callback();
                            break;
                        }
                    }
                };

                var completeCallback = () => {
                    if (cmpCallback.callback(package, from) === false) {
                        that._listeningCallbacks.splice(i, 1);
                        if (that._listeningCallbacks.length == 0) {
                            that._driver.close();
                            this._listening = false;
                        }
                    }
                } 

                for (var i in that._listeningCallbacks) {
                    var cmpCallback = that._listeningCallbacks[i];

                    // Filter package and calls callbacks
                    if (cmpCallback.packageType === null && cmpCallback.addresses == null)
                        completeCallback();
                    else if (cmpCallback.packageType === null)
                        scanAddresses(completeCallback);
                    else if (cmpCallback.addresses === null)
                        scanPackages(completeCallback);   
                    else
                        scanPackages(() => scanAddresses(completeCallback));      
                }
            });
        }, (err) => {
            if (err != null)
                this._listening = false;
            if (listenCallback) 
                listenCallback(err);

        });
    }
}

exports.Lib = Lib;


/**
 * Callback used by listen.
 * @callback Lib~onMessage
 * @type {boolean} Returns false if server should stop listening. Otherwise it will keep listening.
 * @param {Buffer} message - Json object containing the received object
 * @param {Object} from - Object containing the address object of the transmitter
 */

/**
 * Callback used by listen.
 * @callback Lib~onListening
 * @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null 
 */

/**
 * Callback used by send.
 * @callback Lib~onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null 
 */ 