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


//Defines values for the "type" field
const PACKAGE_TYPES = new Enum([
    'data', 'hello', 'whoisController', 'IamController', 'command'
]);

//Defines values for the "class" field
const NODE_CLASSES = new Enum(["sensor", "actuator", "controller"]);

//Defines values for the "category" field
var NODE_CATEGORIES = new Enum(['termometer', 'lightSensor', 'lightSwitch',
    'doorSwitch', 'airController']);

// List of previous defined fields
// Values in brackets [] can use bitwise operations to be defined
var VALUES = {
	packageType: [ PACKAGE_TYPES ],
	nodeClass: [ NODE_CLASSES ],
	nodeCategory: [ NODE_CATEGORIES ]	
};

// Validates value
function validValue(key, value) {
    var possibleValues = VALUES[key];
    
    if (possibleValues !== undefined) {
        if (Array.isArray(possibleValues)) {
            possibleValues = possibleValues[0];
            if (value < possibleValues.enums[0].value 
                || value >= (2 * possibleValues.enums[possibleValues.enums.length - 1].value)) {
                throw new Error("Invalid value (" + value + ")" + " in key '" + key + "'");
            }
        }
        else {
             if (possibleValues.get(value) === undefined)
                throw new Error("Invalid value (" + value + ")" + " in key '" + key + "'");
        }
    }
}

// Function to iterate over all object keys
// convertKey is a function that receives a key and returns another key
function exchangeKeys(object, convertKey, checkValue) {
    var newObject = {};
    
    // Function to iterate over object keys
    function iterateOverObj(key, value, newObject) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            var tempObject = {};
            for (var innerKey in value) {
                iterateOverObj(innerKey, value[innerKey], tempObject);
            }
            newObject[convertKey(key)] = tempObject;
        }
        else {
            !checkValue(key, value);
            newObject[convertKey(key)] = value;
        }
    }

    for (var innerKey in object) {
        iterateOverObj(innerKey, object[innerKey], newObject);
    }

    return newObject;
}

function encode(object) {
    return exchangeKeys(object, (key) => FIELDS.get(key).value,
        (key, value) => validValue(key, value));
}

function decode(object) {
    return exchangeKeys(object, (key) => FIELDS.get(parseInt(key)).key,
        (key, value) => validValue(FIELDS.get(parseInt(key)).key, value));
}

/**
    @class
*/
function Lib (driver) {
    this._driver = driver;
    this._listeningCallbacks = [];
    this._listening = false;
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
    this._driver.send(to, cbor.encode(encode(object)), (err) => {
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
    this._driver.send(this._driver.getBroadcastAddress(), cbor.encode(encode(object)), (err) => {
        if (callback)
            callback(err);
    });
};

/**
    Starts listening for objects. You can call this method multiple times to set multiple callbacks
    for each package type (or addresses). Any callback that matches the object condition will be called
    
    @param {Driver~onMessage} objectCallback - Function to be called when a object arrives
    
    @param {Array|Object|null} [packageTypes] - Package types that will issue the callback. It is null if listening 
    for all package types
    
    @param {Array|Object|null} [addresses] - Addresses that will issue the callback. It is null if listening
    for or all package types
    
    @param {Driver~onListening} [listenCallback] - Function to be called when it starts listening
*/
Lib.prototype.listen = function (objectCallback, packageTypes, addresses, listenCallback) {
    
    // Adjust arguments (packageTypes and addresses)
    if (!packageTypes)
        var packageTypes = null
    else if (!Array.isArray(packageTypes))
        packageTypes = [packageTypes];

    if (!addresses)
        var addresses = null;
    else if (!Array.isArray(addresses))
        addresses = [addresses];

    this._listeningCallbacks.push({
        'callback': objectCallback,
        'packageType': packageTypes,
        'addresses' : addresses
    });

    if (!this._listening) {
        var that = this;
        this._driver.listen((rawPackage, from) => {
            cbor.decodeFirst(rawPackage, (error, obj) => {
                var package = decode(obj);    
                for (var i in that._listeningCallbacks) {
                    var cmpCallback = that._listeningCallbacks[i];

                    var scanPackages = (callback) => {
                        for (var i in cmpCallback.packageType) {
                            if (cmpCallback.packageType[i] == package.packageType) {
                                callback();
                                break;
                            }
                        }
                    };

                    var scanAddresses = (callback) => {
                        for (var i in cmpCallback.addresses) {
                            if (that._driver.constructor.compareAddresses(cmpCallback.addresses[i], from)) {
                                callback();
                                break;
                            }
                        }
                    };

                    if (cmpCallback.packageType === null && cmpCallback.addresses == null)
                        cmpCallback.callback(objectCallback, from);
                    else if (cmpCallback.packageType === null)
                        scanAddresses(() => cmpCallback(package, from));
                    else if (cmpCallback.addresses === null)
                        scanPackages(() => cmpCallback(package, from));   
                    else
                        scanPackages(() => scanAddresses(() => cmpCallback(package, from)));      
                }
            });
        }, () => {
            this._listening = true;
            if (listenCallback) 
                listenCallback();

        });
    }
}

exports.Lib = Lib;


/**
 * Callback used by send.
 * @callback Lib~onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null 
 */ 