Ruled Network
========

Example of a network using the Rainfall protocol and the TCP driver. The network uses rules to check the value from sensors and send command to actuators. The rules are inserted in the console and there is no database.

## Usage

To run the controller, execute:
```shell
node controller
```

It is possible to run one or more leafs. For example, to run a light-switch (which is an actuator). In this case, the controller will detect the actuator and insert it into the network. The same occurs for any sensor, for example the presence-sensor.

To add a rule to the controller, press ENTER when it is running. A list of sensors and actuator will be shown. To add a proposition, enter the nodeId dot dataId, an operator and a value. For example:
```shell
"1.1" == 1
```
If the sensor presence has a node id equals to 1 and its data id is equals to 1 a command will be emitted when someone is in the room (value equals to one). It is possible to build a boolean expression with ANDs and ORs with this propositions. After finished, enter OK.
Next add a command, for example, if the light-switch has nodeId 0 and commandId 0, enter:
```shell
0 0 1
```
That means that when "1.1" == 1, a command will be sent to node with id equals to 0 and command id equals to 0 with the value 1, which represents that the light-switch is turned on.
