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
*/

/**
    Enum containing all possible message fields. They can be chained, in other words:
    a message can be of type "whoiscontroller" and "iamcontroller"
    @constant
    @type { Enum }
    @property { EnumItem } whoiscontroller - requests controller information (value: 1)
    @property { EnumItem } iamcontroller - response for <tt>whoiscontroller</tt> (value: 2).
    Required fields: yourId
    @property { EnumItem } describeyourself - requests node description (value: 4).
    @property { EnumItem } description - contains node description (value: 8).
    Required fields: id, dataType (for sensor), commandType (for actuator).
    @property { EnumItem } data - contains sensor data (value: 16)
    Required fields: id, data.
    @property { EnumItem } command - contains actuator command (value: 32)
    Required fields: id, command.
    @property { EnumItem } lifetime - heartbeat interval definition (value: 64)
    Required fields: id, lifetime.
    @property { EnumItem } keepalive - contains heartbeat signal (value: 128)
    Required fields: id.
    @property { EnumItem } iamback - Sent when the sensor or actuator has an id and wants to reconnect (value: 256)
    Required fields: id.
    @property { EnumItem } welcomeback - Sent when the controller accepts the new node back (value: 512)
    @property { EnumItem } externalcommand - Sent when an external command changes the actuator states (value: 1024)
    Required fields: id, command
**/
const PACKAGE_TYPES = new Enum({
    'whoiscontroller':1, 'iamcontroller':2, 'describeyourself':4, 'description':8,
    'data':16, 'command':32, 'lifetime':64, 'keepalive':128, 'iamback': 256,
    'welcomeback': 512, 'externalcommand': 1024
});

/**
    Enum containing all possible node classes. They can be chained, in other words:
    a node can be a sensor and an actuator.
    @constant
    @type { Enum }
    @property { EnumItem } sensor - Node is a sensor (value: 1)
    @property { EnumItem } actuator - Node is an actuator (value: 2)
    @property { EnumItem } controller - Node is a controller (value: 4)
**/
const NODE_CLASSES = new Enum({"sensor":1, "actuator":2, "controller":4});

/**
    Enum containing all possible types (can be used either inside a dataType or commandType).
    @constant
    @type { Enum }
    @property { EnumItem } int - Data or command value is an integer (value: 1)
    @property { EnumItem } bool - Data or command value is an boolean (value: 2)
    @property { EnumItem } real - Data or command value is a real number (value: 3)
    @property { EnumItem } string - Data or command value is a string (value: 4)
**/
const DATA_TYPES = new Enum({"int": 1, "bool": 2, "real": 3, "string": 4 });

/**
    Enum containing all possible measure strategies. It is the way the sensor send data.
    @constant
    @type { Enum }
    @property { EnumItem } event - Data is send when an event that changes sensor measures happens (value: 1)
    @property { EnumItem } periodic - Data is send at an fixed interval of time (value: 2)
**/
const MEASURE_STRATEGIES = new Enum({event: 1, periodic: 2});

/**
    Enum containing all possible command categories, it is used do define which category of command that the
    actuator accepts.
    @constant
    @type { Enum }
    @property { EnumItem } toggle - Simple switch that can be on or off (value: 1)
    @property { EnumItem } temperature - Controls the temperature of the air conditioning (value: 2)
    @property { EnumItem } fan - Controls the speed of the fan (value: 3)
    @property { EnumItem } lightswitch - Controls if the light is on or off (value: 4)
    @property { EnumItem } acmode - Model of the air conditioning (value: 5)
    @property { EnumItem } lightintensity - Controls the light intensity (value: 6)
    @property { EnumItem } lightcolor - Controls the light color (value: 7)
    @property { EnumItem } custom - Customized command type (value: 8)
    @property { EnumItem } channel -  Control channel of the TV (value: 9)
**/
const COMMAND_CATEGORIES = new Enum({"toggle": 1, "temperature": 2, "fan": 3, "lightswitch": 4, "acmode": 5,
        "lightintensity": 6, "lightcolor": 7, "custom": 8, "channel": 9});
/**
    Enum containing all possible data categories, it is used do define which category of data that the
    sensor sends.
    @constant
    @type { Enum }
    @property { EnumItem } temperature - Indicates the temperature of the environment (value: 1)
    @property { EnumItem } luminance - Indicates how luminous is the environment (value: 2)
    @property { EnumItem } presence - Indicates it someone is in the environment or not (value: 3)
    @property { EnumItem } humidity - Indicates the humidity of the environment (value: 4)
    @property { EnumItem } pressure - Indicates the pressure of the environment (value: 5)
    @property { EnumItem } windspeed - Indicates the speed of the wind of the environment (value: 6)
    @property { EnumItem } smoke - Indicates if any smoke is present (value: 7)
    @property { EnumItem } custom - Customized data (value: 8)
    @property { EnumItem } pressed - Indicates if the button is pressed (value: 9)
**/
const DATA_CATEGORIES = new Enum({"temperature": 1, "luminance": 2, "presence": 3, "humidity": 4, "pressure": 5,
        "windspeed": 6, "smoke": 7, "custom": 8, "pressed": 9 });

exports.PACKAGE_TYPES = PACKAGE_TYPES;
exports.NODE_CLASSES = NODE_CLASSES;
exports.DATA_TYPES = DATA_TYPES;
exports.MEASURE_STRATEGIES = MEASURE_STRATEGIES;
exports.COMMAND_CATEGORIES = COMMAND_CATEGORIES;
exports.DATA_CATEGORIES = DATA_CATEGORIES;

/*
    Internal Variables
*/

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
    'commandType': 'm'.charCodeAt(0), 'unit': 'u'.charCodeAt(0),
    // Data field
    'data': 'd'.charCodeAt(0),
    // Command field
    'command': 'c'.charCodeAt(0),
    'value': 'v'.charCodeAt(0),
    'lifetime': 'l'.charCodeAt(0),
    'yourId': 'y'.charCodeAt(0)
});
/*
    This object contains some rules about package values and which fields must be defines based on these package values
*/
const PACKAGE_FIELDS = {
    packageType: {
        whoiscontroller: [],
        iamcontroller: ['yourId'],
        describeyourself: [],
        description: ['id', 'nodeClass'],
        data: ['id', 'data'],
        command: ['command'],
        lifetime: [ 'lifetime' ],
        keepalive: [ 'id' ],
        iamback: ['id'],
        welcomeback: [],
        externalcommand: ['id', 'command']
    },
    nodeClass: {
        sensor: ['dataType'],
        actuator: ['commandType']
    }
};

function searchRepeatedIds(pkt, fields) {
    var ids = {};
    for (var i = 0; i < fields.length; i++) {
        if (pkt[fields[i]]) {
            for (var el of pkt[fields[i]]) {
                if (ids[el.id] !== undefined) {
                    return {
                        id: el.id,
                        obj1: fields[ids[el.id]],
                        obj2: fields[i],
                    };
                }
                ids[el.id] = i;
            }
        }
    }
    return null;
}

/*
    This object contains additional checks that must be performed on every package
*/
function AdditionalCheck(pkt) {
    //Should check for non repeated dataType and commandType ids
    var err = searchRepeatedIds(pkt, ['dataType', 'commandType']);
    if (err) {
        throw new Error("Repeated id " + err.id + " in field" + (err.obj1 === err.obj2 ? 
            " " + err.obj1 : "s " + err.obj1 + " and " + err.obj2));
    }
    //Check in data and command
    err = searchRepeatedIds(pkt, ['data', 'command']);
    if (err) {
        throw new Error("Repeated id " + err.id + " in field" + (err.obj1 === err.obj2 ? 
            " " + err.obj1 : "s " + err.obj1 + " and " + err.obj2));
    }
}

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

/*
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
    'yourId': {
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
                },
                unit: {
                    type: "string"
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
                },
                unit: {
                    type: "string"
                }
            }
        }
    },

};


/*
    Internal Utility Functions
*/

/*
    Exchange keys on object, compress if asked or convert to natural name
*/
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

/*
    Function that checkes package fields types (and replace enums by its value)
    Throws error if not valid
    First check on package: its types
*/
function checkTypes(object) {
    if (!object || typeof object !== 'object')
        throw new Error("Invalid package. It must be an object");
    function checkDefinition(key, value, def, obj, parent) {
        if (def === undefined)
            throw new Error("Non existing field '" + key + "' specified");
        switch (def.type) {
            case "int":
                if (def.enum) {
                    if (value.constructor.isEnumItem)
                        obj[key] = value = value.value;
                    if (!isNaN(value))
                        obj[key] = value = parseInt(value, 10);
                    if (typeof value !== 'number' || isNaN(value)) {
                        var tempValue = def.enum.get(value);
                        if (tempValue === undefined)
                            throw new Error("Invalid value '" + value + "' in field '" + key + "'");
                        obj[key] = value = tempValue.value;
                    }
                    if (!def.enum.get(value) || def.enum.get(value).value !== value)
                        throw new Error("Invalid value '" + value + "' in field '" + key + "'");
                }
                else {
                    if (!isNaN(value))
                        obj[key] = value = parseInt(value, 10);
                    if (typeof value !== 'number' || isNaN(value))
                        throw new Error("Expected int (got '" + value + "') in field '" + key + "'");
                }
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
                    checkDefinition(i, value[i], def.items, value, key);
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
                for (var innerKey in def.value) {
                    if (value[innerKey] === undefined)
                        throw new Error("Missing key '" + innerKey + "' in '" + parent + "'");
                    checkDefinition(innerKey, value[innerKey], def.value[innerKey], value, key);
                }
                break;

            default:
                throw new Error("Invalid type ('" + def.type + ") of field " + key);
        }
    }
    for (var key in object)
        checkDefinition(key, object[key], FIELDS_DEFINITION[key], object, 'package');
}

/*
    Checks package fields. Must run after types are checked
*/
function checkPackage(pkt) {
    if (pkt.packageType === undefined)
        throw new Error("Missing field 'packageType' in package");
    //Required fields in package
    var fields = {'packageType': 1 }, key;
    //See which package fields are defined and make rules about required fields based on values
    for (var fieldKey in PACKAGE_FIELDS) {
        var values = PACKAGE_FIELDS[fieldKey];
        if (pkt[fieldKey] !== undefined && VALUES[fieldKey] !== undefined) {
            //Value of field on package
            var value = VALUES[fieldKey].get(pkt[fieldKey]);
            //See how many values are defined (can be 1, 2, ...)
            for (key in VALUES[fieldKey].enums) {
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
    for (key in pkt) {
        if (fields[key] !== 1) {
            throw new Error("Unexpected field '" + key + "' in package");
        }
    }
    //Check if all required fields are defined
    for (key in fields)
        if (!(key in pkt))
            throw new Error("Missing field '" + key + "' in package");

    //Additional package checks
    AdditionalCheck(pkt);
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
    @class
    @param {Object} Driver object
*/
function Rainfall (driver) {
    if (!driver)
        throw new Error("Invalid driver");
    this._driver = driver;
    this._listeningCallbacks = [];
    this._listening = false;
    this._listeningId = 0;
}


/**
    Sends a json object to address
    @param {Object} to - Object containing the address object of the recipient, depends on the driver
    @param {Rainfall~Message} object - Json object containing the message to be sent
    @param {Rainfall~onSent} [callback] - Function to be called when the object was sent
*/
Rainfall.prototype.send = function (to, object, callback) {
    if (!this._driver) {
        if (callback)
            callback(new Error("Can't send message using closed instance"));
        return;
    }
    //Check package
    try {
        checkTypes(object);
        checkPackage(object);
    }
    catch (err) {
        if (callback)
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
    @param {Rainfall~Message} object - Json object containing the message to be sent
    @param {Rainfall~onSent} [callback] - Function to be called when the object was sent
*/
Rainfall.prototype.sendBroadcast = function (object, callback) {
    this.send(this._driver.getBroadcastAddress(), object, callback);
};

/**
    Starts listening for objects. You can call this method multiple times to set multiple callbacks
    for each package type (or addresses). All callbacks that match the object address and type will be called

    @param {Rainfall~onMessage} objectCallback - Function to be called when a object arrives

    @param {PACKAGE_TYPES[]|PACKAGE_TYPES|String[]|String} [packageTypes] - Package types that will issue the callback. It is null if listening
    for all package types

    @param {Object[]|Object} [addresses] - Addresses that will issue the callback. It is null if listening
    for or all package types

    @param {Rainfall~onListening} [listenCallback] - Function to be called when it starts listening for packages (or there is an error)

*/
Rainfall.prototype.listen = function (objectCallback, packageTypes, addresses, listenCallback) {
    if (!this._driver) {
        if (listenCallback)
            listenCallback(new Error("Can't listen using closed instance"));
        return;
    }
    // Adjust arguments (packageTypes and addresses)
    if (!packageTypes)
        packageTypes = null;
    else if (!Array.isArray(packageTypes))
        packageTypes = [packageTypes];
    else if (packageTypes.length === 0)
        packageTypes = null;

    //Transform packageTypes in values
    for (var p in packageTypes) {
        if (packageTypes[p].constructor.isEnumItem)
            continue;
        var temp = PACKAGE_TYPES.get(packageTypes[p]);
        if (!isNaN(packageTypes[p]) && temp.value !== packageTypes[p]) {
            if (listenCallback)
                listenCallback(new Error("Invalid 'packageType' " + packageTypes[p]));
            return;
        }
        packageTypes[p] = temp;
    }

    if (!addresses)
        addresses = null;
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
                    console.log("[Rainfall.listen] Package with error received. Silent ignoring...");
                    console.log(err);
                    return;
                }
                try {
                    checkTypes(pkt);
                    checkPackage(pkt);
                }
                catch (error) {
                    console.log("[Rainfall.listen] Package with error received. Silent ignoring...");
                    console.log(error);
                    return;
                }
                /* Function to scan all callbacks, searching for mathcing package */

                var scanPackages = (callback) => {
                    for (var i in cmpCallback.packageType) {
                        if (PACKAGE_TYPES.get(pkt.packageType).has(cmpCallback.packageType[i]) ||
                            cmpCallback.packageType[i].has(PACKAGE_TYPES.get(pkt.packageType))) {
                            callback();
                        }
                    }
                };

                /* Function to scan all callbacks, searching for mathcing address */
                var scanAddresses = (callback) => {
                    for (var i in cmpCallback.addresses) {
                        if (that._driver.compareAddresses(cmpCallback.addresses[i], from)) {
                            callback();
                            break;
                        }
                    }
                };

                var completeCallback = () => {
                    if (cmpCallback.callback(pkt, from) === false) {
                        that._listeningCallbacks.splice(i, 1);
                        if (that._listeningCallbacks.length === 0 && that._listening) {
                            that._driver.stop();
                            this._listening = false;
                        }
                    }
                };

                var scanALl = (callback) => {
                    scanPackages(() => scanAddresses(callback));
                };

                for (var i = that._listeningCallbacks.length - 1; i >= 0; i--) {
                    var cmpCallback = that._listeningCallbacks[i];
                    // Filter package and calls callbacks
                    if (cmpCallback.packageType === null && cmpCallback.addresses === null)
                        completeCallback();
                    else if (cmpCallback.packageType === null)
                        scanAddresses(completeCallback);
                    else if (cmpCallback.addresses === null)
                        scanPackages(completeCallback);
                    else
                        scanALl(completeCallback);
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

/**
    Stops all callbacks associated with the specified packageType from being called when the package arrives.
    If a callback listens for more than one package type, it will still be called. Throws error if rainfall is closed.

    @param {PACKAGE_TYPES[]|PACKAGE_TYPES|String[]|String} [packageTypes] - Package types that will stop being listened. If
    it is falsy, stops all callbacks.
*/
Rainfall.prototype.stopListen = function (packageType) {
    if (!this._driver)
        throw new Error("Can't listen using closed instance");
    
    if (packageType) {
        for (var i = this._listeningCallbacks.length - 1; i >= 0; i--) {
            if (this._listeningCallbacks[i].packageType === PACKAGE_TYPES.get(packageType).value) {
                this._listeningCallbacks.splice(i, 1);
            }
        }
    }
    else
        this._listeningCallbacks = [];

    if (this._listeningCallbacks.length === 0 && this._listening) {
        this._driver.stop();
        this._listening = false;
    }
};

/**
    Closes the Rainfall. After this call, can't listen or send messages.
*/
Rainfall.prototype.close = function () {
    this._driver.close();
    this._driver = null;
    this._listeningCallbacks = [];
    this._listening = false;
};

exports.Rainfall = Rainfall;

/**
    The message object. It is a regular javascript object with certain fields.
    Depending on the packageType (which is obligatory) and on nodeClass (when present).
    To define enums you can use the enum item or a string with the key. Flaggable enums
    accept multiple values (like packageType and nodeClass)

    @typedef {Object} Rainfall~Message

    @property {PACKAGE_TYPES|String} packageType - Defines which package it is. Required field
    and the presence or absence of other fields depends on this value.
    @property {NODE_CLASSES|String} [nodeClass] - Field to define which class the node is
    @property {Number} [yourId] - Used by the controller to inform the node its id.
    @property {Number} [id] - Field defining the node id. It is useful to the controller to
    know which node is sending the message. Defined by the controller in the yourId field.
    @property {Rainfall~data[]} [data] - List of data. Sent by the sensor to the controller.
    @property {Rainfall~data[]} [command] - List of commands. Sent by the controller to the actuator.
    @property {Number} [lifetime] - The period of time between keepalive messages sent by the node
    @property {Rainfall~dataType[]} [dataType] - Field used by the sensor to inform the controller the data it
    will send
    @property {Rainfall~commandType[]} [commandType] - Field used by the actautor to inform the controller
    the commands it accepts
*/

/**
    Data object. Used by sensor to send collected data.
    @typedef {Object} Rainfall~data
    @property {Number} id - Id of the data. Defined by the sensor.
    @property {String|Number} value: Value of the measure.
*/

/**
    Data type object. Used by sensor to inform the controller the collected data.
    @typedef {Object} Rainfall~dataType
    @property {Number} id - Id of the data. Defined by the sensor, shouldn't repeat in dataType and commandType.
    @property {DATA_TYPES|String} type - The format of the data sent.
    @property {Number[]} [range] - Range of the data, it is a list with two values (start and end).
    It is needed only when the type of the data is numeric.
    @property {DATA_CATEGORIES|String} dataCategory - The category of the data
    @property {String} unit - Unit of the data (for example: meters, seconds)
    @property {MEASURE_STRATEGIES|String} measureStrategy - The strategy used by the sensor
    to measure and send data
*/


/**
    Command type object. Used by actuator to inform the controller the accepted commands.
    @typedef {Object} Rainfall~commandType
    @property {Number} id - Id of the command. Defined by the actuator, shouldn't repeat in dataType and commandType.
    @property {DATA_TYPES|String} type - The format of the command.
    @property {Number[]} [range] - Range of the command, it is a list with two values (start and end).
    It is needed only when the type of the command is numeric.
    @property {COMMAND_CATEGORIES|String} commandCategory - The category of the command
    @property {String} unit - Unit of the command (for example: meters, seconds)
*/



/**
 * Callback used by listen.
 * @callback Rainfall~onMessage
 * @returns {boolean|undefined} False if server should stop listening. Otherwise it will keep listening.
 * @param {Object} message - Json object containing the received object
 * @param {Object} from - Object containing the address object of the transmitter
 */

/**
 * Callback used by listen.
 * @callback Rainfall~onListening
 * @param {Error} error - If there is a problem listening this will be an Error object, otherwise will be null
 */

/**
 * Callback used by send.
 * @callback Rainfall~onSent
 * @param {Error} error - If there is a problem sending this will be an Error object, otherwise will be null
 */
