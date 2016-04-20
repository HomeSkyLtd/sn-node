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
const FIELDS = new Enum([
    // Type of the package
    'packageType',
    // Class of the node (actuator, sensor)
    'nodeClass',
    // Category of the node (switch, termometer)
    'nodeCategory',
    // How the data is expressed
    'dataType',
    'id', 'type', 'range', 'measureStrategy', 'category', 'unit',
    'commandType',
    // Data field
    'data',
    // Command field
    'command',
    'value',
    'lifetime',
    'yourid'
]);


/**
    Defines values for the "packageType" field
*/
const PACKAGE_TYPES = new Enum([
    'whoiscontroller', 'iamcontroller', 'describeyourself', 'description',
    'data', 'command', 'lifetime', 'keepalive'
]);

exports.PACKAGE_TYPES = PACKAGE_TYPES;

/** Defines values for the "class" field
*/
const NODE_CLASSES = new Enum(["sensor", "actuator", "controller"]);

exports.NODE_CLASSES = NODE_CLASSES;
/** Defines values for the "category" field
*/
const NODE_CATEGORIES = new Enum({
    'termometer':    0,
    'lightSensor':   1,
    'lightSwitch':   2,
    'doorSwitch':    3,
    'airController': 4
});

exports.NODE_CATEGORIES = NODE_CATEGORIES;

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
            var retValue = 0;
            for (var i in value) {
                var val = value[i];
                var enumVal = possibleValues.get(val);
                if (enumVal === undefined || enumVal.key.indexOf("|") !== -1)
                    throw new Error("Invalid value (" + val + ")" + " in key '" + FIELDS.get(key).key + "'");
                retValue = retValue | enumVal.value;
            }
            if (getEnum)
                value = possibleValues.get(retValue);
            else
                value = retValue;
        }
        else if (acceptArrays && possibleValues.get(value).key.indexOf("|") !== -1) {
            if (value !== possibleValues.get(value).value)
                throw new Error("Invalid value (" + value + ")" + " in key '" + FIELDS.get(key).key+ "'");
            if (getEnum)
                value = possibleValues.get(value);

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
                iterateOverObj(convertKey(innerKey), value[innerKey], tempObject);
            }
            newObject[key] = tempObject;
        }
        // Otherwise, check the value and updates object
        else {
            if (typeof value === 'object')  {
                newObject[key] = value.value;

            }
            else if (!Array.isArray(value)) {
                newObject[key] = extractValue(FIELDS.get(key).value, value);
            }
            else {
                for (var innerKey in object)
                    iterateOverObj(innerKey, object[innerKey], newObject);
            }
        }
    }

    //Iterate over all object keys
    for (var innerKey in object)
        iterateOverObj(convertKey(innerKey), object[innerKey], newObject);

    return newObject;
}

// Function to encode json object into Buffer
function encode(object) {
    return cbor.encode(exchangeKeys(object, (key) => FIELDS.get(key).value,
        (key, value) => getAndCheckValue(key, value, false)));
}

// Function to decode Buffer into json object into Buffer. Calls callback after it is done
function decode (rawPackage, callback) {
    cbor.decodeFirst(rawPackage, (err, pkt) => {
        callback(err, err === null ? exchangeKeys(pkt, (key) => FIELDS.get(Number(key)).key,
            (key, value) => getAndCheckValue(FIELDS.get(Number(key)).key, value, false)) : null);
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
    //Package need to have a type:
    if (object.packageType === undefined) {
        callback(Error("The object to be sent need to have 'packageType' field"));
        return;
    }
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
    //Package need to have a type:
    if (object.packageType === undefined) {
        callback(Error("The object to be sent need to have 'packageType' field"));
        return;
    }
    this._driver.send(this._driver.getBroadcastAddress(), encode(object), (err) => {
        if (callback)
            callback(err);
    });
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

    if (packageTypes !== null) {
        try {
            getAndCheckValue(FIELDS.packageType, packageTypes);
        }
        catch (err) {
            listenCallback(err);
            return;
        }
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
                /* Function to scan all callbacks, searching for mathcing package */
                var scanPackages = (callback) => {
                    for (var i in cmpCallback.packageType) {
                        if (cmpCallback.packageType[i] == pkt.packageType) {
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
