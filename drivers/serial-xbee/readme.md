# rainfall-xbee-s1
This is the driver implementation of the Xbee S1 module for the Rainfall library. Besides the `createDriver` method,
you won't need to call any other method.

## Usage
You'll use this driver to pass it to the Rainfall library or the Leaf library.

### Examples

Creates a driver assuming the xbee module is connected on `/dev/ttyUSB0`
```javascript
var xbee = require('rainfall-xbee-s1');
xbee.createDriver({tty_port: "/dev/ttyUSB0"}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or Leaf
});
```

## Documentation
For documentation on how to use this driver, refer to [this link](https://github.com/HomeSkyLtd/sn-node/blob/master/drivers/serial-xbee/documentation.md).
