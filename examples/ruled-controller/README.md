Ruled Network
========

Example of a network using the Rainfall protocol and the UDP driver. The network uses rules to check the value from sensors and send command to actuators.  

## Usage

To run the network, execute:
```js
node controller
```

To run the sensor on the default port (4567), execute:
```shell
node sensor
```

A port can be specified for the sensor:
```shell
node sensor <port>
```

Each time a sensor is executed, a file is created in home `~/.node_id`.
Remove this file if you want to insert the sensor at first time in the network (a message of the type `whoiscontroller` is sent):
```shell
rm ~/.node_id
```

If you want to simulate a sensor that is coming back to the network (for example, when it went off or the connection failed), just execute node again at the same port without removing `~/.node_id`
