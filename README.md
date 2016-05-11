# sn-node
This project is aimed to be used in home automation. It implements the Rainfall protocol and contains two APIs: Rainfall and Leaf and is useful to send payloads between sensors, actuators and the central node using distinct network protocols but a unique application protocol.

The Rainfall API is the implementation of the Rainfall Protocol. You can use it to implement your sensor, controller or actuator.

The Leaf API is an library to implement sensors and actuators. When you use this API you don't need to know anything about the control messages in the Rainfall Protocol, just send data and receive commands.

You can use about any network protocol with the Rainfall protocol, check the implemented network APIs for rainfall usage in the drivers folder. 
