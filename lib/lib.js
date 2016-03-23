Enum = require("enum");

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
var cFields = new Enum({
    type: 0,
    class: 1,
    category: 2,
    //other control-related fields

    temperature: 100,
    luminance: 101,
    //other sensor-related fields

    switch: 500,
    dim: 501
    //other actuator-related fields
})

//Defines values for the "type" field
var cTypeValues = new Enum({
    control: 0,
    data: 1
});

//Defines values for the "class" field
var cClassValues = new Enum(["sensor", "actuator"]);

//Defines values for the "category" field
var cCategoryValues = new Enum({
    termometer: 0,
    lightSensor: 1,
    switch: 2
    //other device categories
});

// List of previous defined fields
var cValuesList = {
	type: cTypeValues,
	class: cClassValues,
	category: cCategoryValues	
};

// Convert key to respective values defined before by Enums
function parseJSON(json) {
	var new_json = {};

	for (var key in json) {
		var json_value = json[key];
		var field_def_values = cValuesList[key];

		if (field_def_values !== undefined) {
			field_value = field_def_values.get(json_value);
			if (field_value === undefined) {
				msg = "Error: " + json_value + " is undefined.";
				throw msg;
			}

			json_value = field_value.value;
		}

		new_json[cFields[key].value] = parseInt(json_value);
	}

	return new_json;
}

function decode(enc_obj){
    var decodedObj = {};

    for(key in enc_obj){
        key = parseInt(key);
        var key_dec = cFields.get(key).key;
        var field_def_values = cValuesList[key_dec];
        //console.log(key);
        if (field_def_values !== undefined) {
            var value_dec = field_def_values.get(enc_obj[key]).key;
            if(value_dec === undefined)
                throw("Error: value " + enc_obj[key] + " is undefined");
            decodedObj[key_dec] = value_dec;
        }
        else decodedObj[key_dec] = enc_obj[key];
    }
    return decodedObj;
}


exports.parse = parseJSON;
exports.decode = decode;