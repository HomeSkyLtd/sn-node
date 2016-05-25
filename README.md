# sn-node
This project is aimed to be used in home automation. It implements the Rainfall protocol and contains two APIs: Rainfall and Leaf and is useful to send payloads between sensors, actuators and the central node using distinct network protocols but a unique application protocol.

##Rainfall
The Rainfall is an application protocol for home automation. It uses CBOR to send JSONs between the nodes in a network and is defined in such a way that in a network there is one (or more) controllers and some sensors and actuaros. The role of the controller is to receive all data from the sensors and send commands to the actuators. It is an open protocol, so you can implement it in any envoriment, but in this repository we have implemented it using nodejs.

There is a more extense description of the protocol in the rainfall folder, but the protocol is very simple. It requires that the actuator/sensor sends a broadcast message asking "Who is the controller?", then the controllers answers saying "I am the controller", says the lifetime (in other words, how often the node needs to say "I am alive") and can ask the node to "Describe yourself". Then the node answers with its description and the real conversation can begin.
If the node is a sensor, it sends data to the controller when he wants to do so.
If the node is an actuator, it should always be listening for command messages to actuate. And when the state of the actuator changes due to interaction outside this network, it should send an external command message, informing that to the controller.
If for some reason the node turns off, he can broadcast the message "I am back", saying his id (which the controller defined previously), then the controller can say "welcome back", the lifetime and the conversation can restart.

The Rainfall is available on the npm: [rainfall](https://www.npmjs.com/package/rainfall).

##Leaf
Leaf is an API to be used by sensors and actuators, automatically managing control messages with the controller. It is very simple to use and the user only need to provide some information about the node (like the data it sends or the command it receives) and then listen for command (and send external commands if needed) or send data.

The Leaf is available on the npm: [rainfall-leaf](https://www.npmjs.com/package/rainfall-leaf).

##Drivers
This folder contains some driver implementations that need to be used to send messages using the Rainfall, so you can use any network protocol implemented here to send messages (or you can implement your own by following the instructions in the drivers/prototype).

##Tests
All drivers, the leaf API and the rainfall API use mocha for testing. To run the tests, just type `npm test` on its folder. Do not forget to install all dependencies before testing and developing: `npm install`.

##Examples
There is a folder with examples using both the Rainfall API and the Leaf API. If you want to see the power of the rainfall protocol, this is a good start point.
