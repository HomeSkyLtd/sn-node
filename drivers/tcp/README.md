#TCP Driver
This is the driver implementation of the TCP driver for the Rainfall library. Besides the `createDriver` method, you won't need to call any other method. It uses an UDP driver for broadcast communication.

##Usage
You'll use this driver to pass it to the Rainfall library or the Leaf library. If you want
to listen for broadcast messages you must set `udplisten` in the parameters to `true`.
###Examples

Creates a driver on port 4567 and uses default broadcast port (2357)
```javascript
var Tcp = require('rainfall-tcp');
Tcp.createDriver({rport: 4567}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

Creates a driver on port 4567 and setting broadcast port to 4567
```javascript
var Tcp = require('rainfall-tcp');
Tcp.createDriver({rport: 4567, broadcast_port: 4567}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

Creates a driver on arbitrary port, uses default broadcast port (2357)
and will listen to broadcast messages
```javascript
var Tcp = require('rainfall-tcp');
Tcp.createDriver({rport: 4568, udplisten: true}, (err, inst) => {
  //inst is the created driver, pass it to Rainfall or leaf
});
```

##Documentation
For documentation on how to use this driver, refer to
[this](https://github.com/HomeSkyLtd/sn-node/blob/master/drivers/tcp/documentation.MD)
