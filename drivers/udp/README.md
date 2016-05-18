#UDP Driver
This is the driver implementation of the UDP driver for the Rainfall library. Besides the `createDriver` method, 
you won't need to call any other method.

##Usage
You'll use this driver to pass it to the Rainfall library or the Leaf library.

###Examples

Creates a driver on port 4567 and uses default broadcast port (2456)
```javascript
var Udp = require('rainfall-udp');
Udp.createDriver({rport: 4567}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

Creates a driver on port 4567 and setting broadcast port to 4567
```javascript
var Udp = require('rainfall-udp');
Udp.createDriver({rport: 4567, broadcast_port: 4567}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

Creates a driver on arbitrary port and uses default broadcast port (2456)
```javascript
var Udp = require('rainfall-udp');
Udp.createDriver({}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

##Documentation
For documentation on how to use this driver, refer to 
[this](https://github.com/HomeSkyLtd/sn-node/blob/master/drivers/udp/documentation.MD)
