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
    

    // Address of the controller
    'controllerAddress',

    // Data field
    'data',

    // Command field
    'command'
]);


//Defines values for the "type" field
const PACKAGE_TYPES = new Enum([
    'data', 'hello', 'whoIsController', 'hereIsController', 'command'
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

function Lib (driver) {
    this._driver = driver;
    this._listening_callbacks = [];
    this._listening = false;
}

// Function to send package. Optional callback after send
// with one parameter (error or null if it was sent)
Lib.prototype.send = function (package, to, callback) {
    this._driver.send(to, cbor.encode(encode(package)), (err) => {
        if (callback)
            callback(err);
    })
};

// Function to listen to packages
// Listen from packages from types and/or addresses
Lib.prototype.listen = function (packageTypes, addresses, callback, callbackListening) {
    if (packageTypes == null) {
        packageTypes = [];
        for (var e in PACKAGE_TYPES.enums)
            packageTypes.push(e.value);
    }
    if (!Array.isArray(packageTypes))
        packageTypes = [packageTypes];

    this._listening_callbacks.push({
        'callback': callback,
        'packageType': packageTypes
    });
    //TODO: listen from adresses

    if (!this._listening) {
        var that = this;
        this._driver.listen((rawPackage) => {
            cbor.decodeFirst(rawPackage, (error, obj) => {
                var package = decode(obj);    
                for (var i in that._listening_callbacks) {
                    
                    var listening_callback = that._listening_callbacks[i];
                    for (var type in listening_callback.packageType) {
                        if (listening_callback.packageType[type] == package.packageType) {
                            listening_callback.callback();
                            break;
                        }
                    }
                }
            });
        }, () => {
            this._listening = true;
            if (callbackListening) callbackListening();

        });
    }
}

exports.Lib = Lib;