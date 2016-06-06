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
**/
const COMMAND_CATEGORIES = new Enum({"toggle": 1, "temperature": 2, "fan": 3, "lightswitch": 4, "acmode": 5,
        "lightintensity": 6, "lightcolor": 7, "custom": 8});
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
    return cbor.encode(object);
}

function random(start, end) {
    return Math.floor(Math.random() * (end + 1 - start)) + start;
}

function randomFromEnum(en) {
    return en.enums[random(0, en.enums.length - 1)].key;
}

var msgs = [{
    'packageType': 'whoiscontroller'
}, {
    'packageType': 'iamcontroller',
    'yourId': 500
}, {
    'packageType': 'describeyourself'
}, { 
    packageType: 'description',
    id: 0, nodeClass: 'sensor', dataType: [{
        id:  5, measureStrategy: 'event', type: 'real', 
        range: [0, 50], unit: 'C', dataCategory: 'temperature'
    }] },
    { 
        packageType: 'description',
        id: 0, nodeClass: "actuator", commandType: [{
            id: 5, type: 'int', unit: "", range: [0, 50], commandCategory: 'fan'
        }] },
    { 
        packageType: 'data',
        id: 0, data: [
            { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
        ]},
    {
        packageType: 'command',
        command: [
            { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
        ]},
    {
        'packageType': 'lifetime',
        'lifetime': 500
    },
    {
        'packageType': 'keepalive',
        'id': 100
    },
    {
        'packageType': 'iamback',
        'id': 300
    },
    {
        'packageType': 'welcomeback'
    },
    {
        'packageType': 'externalcommand',
        'id': 100,
        command: [
            { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
        ]}
];

for (var msg of msgs) {
    process.stdout.write(msg.packageType + ": " + Buffer.from(JSON.stringify(msg)).length);
    checkTypes(msg);
    checkPackage(msg);
    process.stdout.write("   " + Buffer.from(JSON.stringify(msg)).length);
    msg = exchangeKeys(msg, true);
    //console.log(msg);
    process.stdout.write("   " + Buffer.from(JSON.stringify(msg)).length);
    console.log("   " + encode(msg).length);
}