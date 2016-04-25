/*jshint esversion: 6 */

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
        packageType: "description",
        dataTypes: [
            {
                id: 0,
                type: int | float | boolean,
                range: [1,2],
                measureStrategy: "event" | "periodic",
                category: temperature | presence | open door | humidity | light
            }
        ],
        commandTypes: [
            {
                id: 0
                type: int | float | boolean,
                range: { start: 0, end: 1 } | [1,2],
                category: temperature | light on | light intensity | fan speed | ...
            }
        ]
    }

    Package examples:

    Getting controller address
    {
        packageType: PACKAGE_TYPES.whoiscontroller
    }
    Controller declaring himself and sending sensor/actuator id
    {
        packageType: PACKAGE_TYPES.iamcontroller,
        yourid: 19
    }
    Controller sending lifetime (always in milliseconds)
    {
        packageType: PACKAGE_TYPES.lifetime,
        lifetime: 1000
    }
    Controller asking for description
    {
        packageType: PACKAGE_TYPES.describeyourself
    }
    Termometer sensor describing himself
    {
        packageType: PACKAGE_TYPES.description,
        id: 19,
        nodeClass: NODE_CLASSES.sensor,
        dataType: [
            {
                id: 0,
                type: "int",
                range: [-100, 100],
                measureStrategy: "event",
                category: "temperature"
                unit: "°C"
            }
        ]
    }
    Termometer sending data
    {
        packageType: PACKAGE_TYPES.data,
        id: 0,
        data: 20
    }
*/


/**
    @class
    @param {Object} Driver object
*/
function Communicator (driver) {
    this._driver = driver;
    this._listeningCallbacks = [];
    this._listening = false;
}

//Defines the fields of the packets
const FIELDS = new Enum({
    // Type of the package
    'packageType': 'p'.charCodeAt(0),
    // Class of the node (actuator, sensor)
    'nodeClass': 'n'.charCodeAt(0),
    // How the data is expressed
    'dataType': 'a'.charCodeAt(0),
    'id': 'i'.charCodeAt(0), 'type': 't'.charCodeAt(0), 'range': 'r'.charCodeAt(0), 
    'measureStrategy': 's'.charCodeAt(0), 'dataCategory': 'g'.charCodeAt(0), 'commandCategory': 'e'.charCodeAt(0),
    'commandType': 'm'.charCodeAt(0),
    // Data field
    'data': 'd'.charCodeAt(0),
    // Command field
    'command': 'c'.charCodeAt(0),
    'value': 'v'.charCodeAt(0),
    'lifetime': 'l'.charCodeAt(0),
    'yourid': 'y'.charCodeAt(0)
});

/**
    Defines values for the "packageType" field
*/
const PACKAGE_TYPES = new Enum([
    'whoiscontroller', 'iamcontroller', 'describeyourself', 'description',
    'data', 'command', 'lifetime', 'keepalive'
]);


/**
    This object contains some rules about package values and which fields must be defines based on these package values
**/
const PACKAGE_FIELDS = {
    packageType: {
        whoiscontroller: [],
        iamcontroller: ['yourid'],
        describeyourself: [],
        description: ['id', 'nodeClass'],
        data: ['id', 'data'],
        command: ['command'],
        lifetime: [ 'lifetime' ],
        keepalive: [ 'id']
    },
    nodeClass: {
        sensor: ['dataType'],
        actuator: ['commandType']
    }
}

exports.PACKAGE_TYPES = PACKAGE_TYPES;

/** Defines values for the "class" field
*/
const NODE_CLASSES = new Enum(["sensor", "actuator", "controller"]);
const DATA_TYPES = new Enum([ "int", "real", "string" ]);
const MEASURE_STRATEGIES = new Enum({event: 1, periodic: 2});
const COMMAND_CATEGORIES = new Enum({"fan": 1, "air": 2});
const DATA_CATEGORIES = new Enum(['temperature', 'umidity']);


exports.NODE_CLASSES = NODE_CLASSES;
exports.DATA_TYPES = DATA_TYPES;
exports.MEASURE_STRATEGIES = MEASURE_STRATEGIES;
exports.COMMAND_CATEGORIES = COMMAND_CATEGORIES;
exports.DATA_CATEGORIES = DATA_CATEGORIES;

// List of previous defined fields
// Values in brackets [] can accept lists of values
const VALUES = {
	packageType: PACKAGE_TYPES,
	nodeClass: NODE_CLASSES,
    type: DATA_TYPES,
    measureStrategy: MEASURE_STRATEGIES,
    dataCategory: DATA_CATEGORIES,
    commandCategory: COMMAND_CATEGORIES
};

/**
    Fields definition
    Each field must have a type, which is either list, object, int, double, string, any (string, int or double)

*/
const FIELDS_DEFINITION = {
    packageType: {
        type: "int",
        enum: PACKAGE_TYPES
    },
    nodeClass: {
        type: "int",
        enum: NODE_CLASSES
    },
    'lifetime': {
        type: "int"
    },
    id: {
        type: "int"
    },
    'yourid': {
        type: "int"
    },
    data: {
        type: "list",
        items: {
            type: "object",
            value: {
                id: {
                    type: "int"
                },
                value: {
                    type: "any"
                }
            }
        }
    },
    command: {
        type: "list",
        items: {
            type: "object",
            value: {
                id: {
                    type: "int"
                },
                value: {
                    type: "any"
                }
            }
        }
    },
     dataType: {
        type: "list",
        items: {
            type: "object",
            value: {
                id: {
                    type: "int"
                },
                measureStrategy: {
                    type: "int",
                    enum: MEASURE_STRATEGIES,
                },
                type: {
                    type: "int",
                    enum: DATA_TYPES
                },
                range: {
                    type: "list",
                    items: { 
                        type: "any"
                    }
                },
                dataCategory: {
                    type: "int",
                    enum: DATA_CATEGORIES
                }
            }
        }
    },

     commandType: {
        type: "list",
        items: {
            type: "object",
            value: {
                id: {
                    type: "int"
                },
                type: {
                    type: "int",
                    enum: DATA_TYPES
                },
                range: {
                    type: "list",
                    items: { 
                        type: "any"
                    }
                },
                commandCategory: {
                    type: "int",
                    enum: COMMAND_CATEGORIES
                }
            }
        }
    },

};

function exchangeKeys(object, compress) {
    function getNewKey(oldKey, isArray) {
        if (isArray) return oldKey;
        return compress ? String.fromCharCode(FIELDS.get(oldKey).value) : FIELDS.get(oldKey.charCodeAt(0)).key;
    }

    function replaceKeys(key, oldOject, newObject, isArray) {
        var value = oldOject[key];
        var newKey = getNewKey(key, isArray);
        //If it is object, call this function for all keys in that object
        if (value.constructor === Object) {
            newObject[newKey] = {};
            for (var k in value)
                replaceKeys(k, value, newObject[newKey], false);
        } 
        //If it is an array, copy array
        else if (Array.isArray(value)) {
            newObject[newKey] = [];
            for (var i in value) {
                replaceKeys(i, value, newObject[newKey], true);
            }
        }
        else {
            newObject[newKey] = value;
        }
    }
    var newObject = {};
    for (var key in object)
        replaceKeys(key, object, newObject, false);
    return newObject;
}


/**
    Internal Utility Functions
*/

/**
    Function that checkes package fields types (and replace enums by its value)
    Throws error if not valid
    First check on package: its types
**/
function checkTypes(object) {
    if (!object || typeof object !== 'object')
        throw new Error("Invalid package. It must be an object");
    function checkDefinition(key, value, def, obj) {
        if (def === undefined)
            throw new Error("Non existing field '" + key + "' specified");
        switch (def.type) {
            case "int":
                if (def.enum && value.constructor.isEnumItem)
                    obj[key] = value = value.value;
                if (!isNaN(value))
                    obj[key] = value = parseInt(value, 10);
                if (typeof value !== 'number' || isNaN(value))
                    throw new Error("Expected int (got '" + value + "') in field '" + key + "'");
                if (def.enum && (!def.enum.get(value) || def.enum.get(value).value !== value))
                    throw new Error("Invalid value '" + value + "' in field '" + key + "'");
                break;
            case "double":
                if (!isNaN(value))
                    obj[key] = value = Number(value);
                if (typeof value !== 'number' || isNaN(value))
                    throw new Error("Expected double (got '" + value + "') in field '" + key + "'");
                break;
            case "list": 
                if (!Array.isArray(value))
                    throw new Error("Expected array (got '" + value + "') in field '" + key + "'");
                for (var i = 0; i < value.length; i++)
                    checkDefinition(i, value[i], def.items, value);
                break;
            case "string":
                obj[key] = value = String(value); 
                break;
            case "any":
                if (!isNaN(value))
                    obj[key] = value = Number(value);
                else
                    obj[key] = value = String(value);
                break;
            case "object":
                //Check field by field
                for (var key in def.value) {
                    if (value[key] === undefined)
                        throw new Error("Missing key '" + key + "' in '" + key + "'");
                    checkDefinition(key, value[key], def.value[key], value);
                }
                break;

            default:
                throw new Error("Invalid type ('" + def.type + ") of field " + key);
        }
    }
    for (var key in object)
        checkDefinition(key, object[key], FIELDS_DEFINITION[key], object);
}

/**
    Checks package fields. Must run after types are checked
*/
function checkPackage(pkt) {
    if (pkt.packageType === undefined)
        throw new Error("Missing field 'packageType' in package");
    //Required fields in package
    var fields = {'packageType': 1 };
    //See which package fields are defined and make rules about required fields based on values
    for (var fieldKey in PACKAGE_FIELDS) {
        var values = PACKAGE_FIELDS[fieldKey]
        if (pkt[fieldKey] !== undefined && VALUES[fieldKey] !== undefined) {
            //Value of field on package
            var value = VALUES[fieldKey].get(pkt[fieldKey]);
            //See how many values are defined (can be 1, 2, ...)
            for (var key in VALUES[fieldKey].enums) {
                var enumVal = VALUES[fieldKey].enums[key];
                if (value.has(enumVal)) {
                    //If it is defined, add all required fields do fields
                    var newFields = PACKAGE_FIELDS[fieldKey][enumVal];
                    for (var i = 0; i < newFields.length; i++)
                        fields[newFields[i]] = 1;
                }
            }
        }
    }
    //Check if all defined fields are required
    for (var key in pkt) {
        if (fields[key] !== 1) {
            throw new Error("Unexpected field '" + key + "' in package");
        }
    }
    //Check if all required fields are defined
    for (var key in fields)
        if (!(key in pkt))
            throw new Error("Missing field '" + key + "' in package");
}


// Function to encode json object into Buffer
function encode(object) {
    return cbor.encode(exchangeKeys(object, true));
}

// Function to decode Buffer into json object into Buffer. Calls callback after it is done
function decode (rawPackage, callback) {
    cbor.decodeFirst(rawPackage, (err, pkt) => {
        callback(err, err === null ? exchangeKeys(pkt, false) : null);
    });
}


/**
    API FUNCTIONS
**/


/**
    Sends a json object to address
    @param {Object} to - Object containing the address object of the recipient
    @param {Object} object - Json object containing the message to be sent
    @param {Communicator~onSent} [callback] - Function to be called when the object was sent
*/
Communicator.prototype.send = function (to, object, callback) {
    //Check package

    try {
        checkTypes(object);
        checkPackage(object);
    }
    catch (err) {
        callback(err);
        return;
    }
    //Package ok! Encode and send
    this._driver.send(to, encode(object), (err) => {
        if (callback)
            callback(err);
    });
};

/**
    Sends a json object to broadcast address
    @param {Object} object - Json object containing the message to be sent
    @param {Communicator~onSent} [callback] - Function to be called when the object was sent
*/
Communicator.prototype.sendBroadcast = function (object, callback) {
    this.send(this._driver.getBroadcastAddress(), object, callback);
};

/**
    Starts listening for objects. You can call this method multiple times to set multiple callbacks
    for each package type (or addresses). All callbacks that match the object address and type will be called

    @param {Communicator~onMessage} objectCallback - Function to be called when a object arrives

    @param {Array|Object|null} [packageTypes] - Package types that will issue the callback. It is null if listening
    for all package types

    @param {Array|Object|null} [addresses] - Addresses that will issue the callback. It is null if listening
    for or all package types

    @param {Communicator~onListening} [listenCallback] - Function to be called when it starts listening
*/
Communicator.prototype.listen = function (objectCallback, packageTypes, addresses, listenCallback) {

    // Adjust arguments (packageTypes and addresses)
    if (!packageTypes)
        var packageTypes = null;
    else if (!Array.isArray(packageTypes))
        packageTypes = [packageTypes];
    else if (packageTypes.length === 0)
        packageTypes = null; 

    //Transform packageTypes in values
    for (var p in packageTypes) {
        if (packageTypes[p].constructor.isEnumItem)
            continue;
        var temp = PACKAGE_TYPES.get(packageTypes[p]);
        if (temp.value !== packageTypes[p]) {
            listenCallback(new Error("Invalid 'packageType' " + packageTypes[p]));
            return;
        }
        packageTypes[p] = temp;
    }

    if (!addresses)
        var addresses = null;
    else if (!Array.isArray(addresses))
        addresses = [addresses];
    else if (addresses.length === 0)
        addresses = null;

    // Add the listening callback to the list
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
            decode(rawPackage, (err, pkt) => {
                if (err) {
                    // TODO: Check if we should be doing this
                    console.log("[Communicator.listen] Package with error received. Silent ignoring...");
                    console.log(err);
                    return;
                }
                try {
                    checkTypes(pkt);
                    checkPackage(pkt);
                }
                catch (err) {
                    console.log("[Communicator.listen] Package with error received. Silent ignoring...");
                    console.log(err);
                    return;
                }
                /* Function to scan all callbacks, searching for mathcing package */
                var scanPackages = (callback) => {
                    for (var i in cmpCallback.packageType) {
                        if (PACKAGE_TYPES.get(pkt.packageType).has(cmpCallback.packageType[i])
                            || cmpCallback.packageType[i].has(PACKAGE_TYPES.get(pkt.packageType))) {
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
                    if (cmpCallback.callback(pkt, from) === false) {
                        that._listeningCallbacks.splice(i, 1);
                        if (that._listeningCallbacks.length === 0) {
                            that._driver.close();
                            this._listening = false;
                        }
                    }
                };

                for (var i in that._listeningCallbacks) {
                    var cmpCallback = that._listeningCallbacks[i];
                    // Filter package and calls callbacks
                    if (cmpCallback.packageType === null && cmpCallback.addresses === null)
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
            if (err)
                this._listening = false;
            if (listenCallback)
                listenCallback(err);

        });
    }
    else if (listenCallback)
        listenCallback(null);
};

Communicator.prototype.close = function () {
    if (this._listening)
        this._driver.close();
};

exports.Communicator = Communicator;

/**
 * Callback used by listen.
 * @callback Communicator~onMessage
 * @returns {boolean} False if server should stop listening. Otherwise it will keep listening.
 * @param {Object} message - Json object containing the received object
 * @param {Object} from - Object containing the address object of the transmitter
 */

/**
 * Callback used by listen.
 * @callback Communicator~onListening
 * @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
 */

/**
 * Callback used by send.
 * @callback Communicator~onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
 */
