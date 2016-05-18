Leaf
========

API implementation of Leaf, used in home automation above Rainfall protocol.

## Documentation
For documentation on how to use the API, refer to [this](https://github.com/HomeSkyLtd/sn-node/blob/master/leaf/documentation.MD)

## Examples

Creates a UDP driver on port 4567 and uses it to construct a Leaf. Handshake with central controller is automatic.
```javascript
var Udp = require('rainfall-udp');
var Leaf = require('rainfall-leaf');
Udp.createDriver({rport: 4567}, (err, driver) => {
  //driver is the created driver
	if (err) {
		// treat the error
	} else {
		Leaf.createLeaf(
			driver,
			{
				// An example of dataType passed, this is a temperature sensor.
				dataType: [
					{
						id: 1,
						type: "real",
						range: [-10, 50],
						measureStrategy: "periodic",
						dataCategory: "temperature",
						unit: "ºC"
					}
				],
				commandType: []
			},
			(err, leaf) => {
				// use leaf methods to send data, send external command or listen command.
			});
		);
	}
});
```

On the callback, use leaf to send a data to central controller. Data is a object with id and value.
```javascript
leaf.sendData({id: 1, value: 23.2}, function (err) {
	if (err) {
		// Treat error.
	} else {
		// Do something else.
	}
})
```
