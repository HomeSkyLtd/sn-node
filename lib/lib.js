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

function parseJSON(json) {
	var new_json = {};

	for (var key in json) {
		var j_value = json[key];
		switch(key) {
			case "type":
				new_json[cFields.type.value] = cTypeValues.get(j_value).value;
				break;
			case "class":
				new_json[cFields.class.value] = cClassValues.get(j_value).value;
				break;
			case "category":
				new_json[cFields.category.value] = cCategoryValues.get(j_value).value;
				break;
			default:
				new_json[cFields.get(key).value] = j_value;
		}
	}

	return new_json;

}

exports.parse = parseJSON;
