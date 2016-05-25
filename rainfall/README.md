#Rainfall

API implementation of the Rainfall protocol, used in home automation.
This application protocol can use almost any netowrk infrastructure to communicate (see the drivers folder and check out which network protocol are already supported). The protocol is designed to provide a common language for all devices in your home communicate and it envolves three node classes:
##### Sensor
This node sends collected data to the controller.
##### Actuator
This node receives commands from the controller and eventually sends to the controller commands received from other sources.
##### Controller
This node controls all the sensors and actuators in the network, they only communicate with this node and do not between each other.


Actually, the protocol is flexible enough to let you define a node as both a sensor and an actuator.

##Documentation
For documentation on how to use the API, refer to [this](https://github.com/HomeSkyLtd/sn-node/blob/master/rainfall/documentation.MD)

##Usage
First of all you need to choose which driver you'll use, and then insantiate it:
```javascript
const Driver = require('my-driver');
Driver.createDriver({/*driver params*/}, (err, driver) => {
  //Check for errors
  if (err) throw err;
  //At this point we have a valid driver
});
```
Then, we instantiate the Rainfall, passing the `driver` object to it:
```javascript
const Rainfall = require('rainfall');

var rainfall = new Rainfall.Rainfall(driver);
```
The complete initialization would be something like this:
```javascript
const Driver = require('my-driver');
const Rainfall = require('rainfall');
Driver.createDriver({/*driver params*/}, (err, driver) => {
  if (err) throw err;
  var rainfall = new Rainfall.Rainfall(driver);
  //We can start using rainfall here
});
```


With the `rainfall` object we can send messages:
```javascript
rainfall.send({/*Destination Address, depends on driver */}, 
  { /*THE MESSAGE */ }, (err) => {
    //This function will be called when the message was sent or not sent due to an error 
    //(available in the err variable)
  }
);
```

With the `rainfall` object we can listen for messages:
```javascript
rainfall.listen((msg, from) => {
    //Called when a message arrives, msg contains the message and from contains the address of the sender
  }, /* Here you can define which packageTypes you want to listen (or null for all)*/,
     /* Here you can define which addresses you want to listen (or null for all)*/,
  (err) => {
    //This callback is called when the rainfall is actually listening (can take some time due to
    //driver implementation). If there is an error, the error is in the err variable
  }
);
```

With the `rainfall` object we can broadcast messages:
```javascript
rainfall.sendBroadcast({ /*THE MESSAGE */ }, (err) => {
    //This function will be called when the message was sent or not sent due to an error 
    //(available in the err variable)
  }
);
```

We can also stop listeners:
```javascript
rainfall.stopListen(/* Here you can define which packageTypes you want to stop listening (or null for all)*/);
```

And of course, we can shutdown the role thing:
```javascript
rainfall.close();
```

##Examples
In the examples below, we will use the TCP driver.

###Discovering Controller
This example asks who is controller and waits for response
```javascript
const Driver = require('rainfall-tcp');
const Rainfall = require('rainfall');
Driver.createDriver({ }, (err, driver) => {
  if (err) throw err;
  var rainfall = new Rainfall.Rainfall(driver);
  rainfall.listen((msg, from) => {
    console.log("I am controller received. The controller is in the address: " + from +
      " and my id is " + msg.yourId);
    //Returns false to stop listening
    return false;
  }, 'iamcontroller', null, (err) => {
    rainfall.sendBroadcast({ packageType: 'whoiscontroller' });
  });
});
```

###Answering who is the controller
This example asks who is controller and waits for response
```javascript
const Driver = require('rainfall-tcp');
const Rainfall = require('rainfall');
Driver.createDriver({ udplisten: true }, (err, driver) => {
  if (err) throw err;
  var rainfall = new Rainfall.Rainfall(driver);
  rainfall.listen((msg, from) => {
    console.log("Who is controller received from: " + from);
    //Answers question
    rainfall.send(from, { packageType: 'iamcontroller', yourId: 1 });
  }, 'whoiscontroller');
});
```
