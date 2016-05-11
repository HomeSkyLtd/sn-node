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
