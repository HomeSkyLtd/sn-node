## Classes

<dl>
<dt><a href="#Rainfall">Rainfall</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#PACKAGE_TYPES">PACKAGE_TYPES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible message fields. They can be chained, in other words:
    a message can be of type &quot;whoiscontroller&quot; and &quot;iamcontroller&quot;</p>
</dd>
<dt><a href="#NODE_CLASSES">NODE_CLASSES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible node classes. They can be chained, in other words:
    a node can be a sensor and an actuator.</p>
</dd>
<dt><a href="#DATA_TYPES">DATA_TYPES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible types (can be used either inside a dataType or commandType).</p>
</dd>
<dt><a href="#MEASURE_STRATEGIES">MEASURE_STRATEGIES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible measure strategies. It is the way the sensor send data.</p>
</dd>
<dt><a href="#COMMAND_CATEGORIES">COMMAND_CATEGORIES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible command categories, it is used do define which category of command that the
    actuator accepts.</p>
</dd>
<dt><a href="#DATA_CATEGORIES">DATA_CATEGORIES</a> : <code>Enum</code></dt>
<dd><p>Enum containing all possible data categories, it is used do define which category of data that the
    sensor sends.</p>
</dd>
</dl>

<a name="Rainfall"></a>

## Rainfall
**Kind**: global class  

* [Rainfall](#Rainfall)
    * [new Rainfall(Driver)](#new_Rainfall_new)
    * _instance_
        * [.send(to, object, [callback])](#Rainfall+send)
        * [.sendBroadcast(object, [callback])](#Rainfall+sendBroadcast)
        * [.listen(objectCallback, [packageTypes], [addresses], [listenCallback])](#Rainfall+listen)
        * [.stopListen([packageTypes])](#Rainfall+stopListen)
        * [.close()](#Rainfall+close)
    * _inner_
        * [~Message](#Rainfall..Message) : <code>Object</code>
        * [~data](#Rainfall..data) : <code>Object</code>
        * [~dataType](#Rainfall..dataType) : <code>Object</code>
        * [~commandType](#Rainfall..commandType) : <code>Object</code>
        * [~onMessage](#Rainfall..onMessage) ⇒ <code>boolean</code> &#124; <code>undefined</code>
        * [~onListening](#Rainfall..onListening) : <code>function</code>
        * [~onSent](#Rainfall..onSent) : <code>function</code>

<a name="new_Rainfall_new"></a>

### new Rainfall(Driver)

| Param | Type | Description |
| --- | --- | --- |
| Driver | <code>Object</code> | object |

<a name="Rainfall+send"></a>

### rainfall.send(to, object, [callback])
Sends a json object to address

**Kind**: instance method of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>Object</code> | Object containing the address object of the recipient, depends on the driver |
| object | <code>[Message](#Rainfall..Message)</code> | Json object containing the message to be sent |
| [callback] | <code>[onSent](#Rainfall..onSent)</code> | Function to be called when the object was sent |

<a name="Rainfall+sendBroadcast"></a>

### rainfall.sendBroadcast(object, [callback])
Sends a json object to broadcast address

**Kind**: instance method of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>[Message](#Rainfall..Message)</code> | Json object containing the message to be sent |
| [callback] | <code>[onSent](#Rainfall..onSent)</code> | Function to be called when the object was sent |

<a name="Rainfall+listen"></a>

### rainfall.listen(objectCallback, [packageTypes], [addresses], [listenCallback])
Starts listening for objects. You can call this method multiple times to set multiple callbacks
    for each package type (or addresses). All callbacks that match the object address and type will be called

**Kind**: instance method of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| objectCallback | <code>[onMessage](#Rainfall..onMessage)</code> | Function to be called when a object arrives |
| [packageTypes] | <code>[Array.&lt;PACKAGE_TYPES&gt;](#PACKAGE_TYPES)</code> &#124; <code>[PACKAGE_TYPES](#PACKAGE_TYPES)</code> &#124; <code>Array.&lt;String&gt;</code> &#124; <code>String</code> | Package types that will issue the callback. It is null if listening     for all package types |
| [addresses] | <code>Array.&lt;Object&gt;</code> &#124; <code>Object</code> | Addresses that will issue the callback. It is null if listening     for or all package types |
| [listenCallback] | <code>[onListening](#Rainfall..onListening)</code> | Function to be called when it starts listening for packages (or there is an error) |

<a name="Rainfall+stopListen"></a>

### rainfall.stopListen([packageTypes])
Stops all callbacks associated with the specified packageType from being called when the package arrives.
    If a callback listens for more than one package type, it will still be called. Throws error if rainfall is closed.

**Kind**: instance method of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [packageTypes] | <code>[Array.&lt;PACKAGE_TYPES&gt;](#PACKAGE_TYPES)</code> &#124; <code>[PACKAGE_TYPES](#PACKAGE_TYPES)</code> &#124; <code>Array.&lt;String&gt;</code> &#124; <code>String</code> | Package types that will stop being listened. If     it is falsy, stops all callbacks. |

<a name="Rainfall+close"></a>

### rainfall.close()
Closes the Rainfall. After this call, can't listen or send messages.

**Kind**: instance method of <code>[Rainfall](#Rainfall)</code>  
<a name="Rainfall..Message"></a>

### Rainfall~Message : <code>Object</code>
The message object. It is a regular javascript object with certain fields.
    Depending on the packageType (which is obligatory) and on nodeClass (when present).
    To define enums you can use the enum item or a string with the key. Flaggable enums
    accept multiple values (like packageType and nodeClass)

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| packageType | <code>[PACKAGE_TYPES](#PACKAGE_TYPES)</code> &#124; <code>String</code> | Defines which package it is. Required field     and the presence or absence of other fields depends on this value. |
| nodeClass | <code>[NODE_CLASSES](#NODE_CLASSES)</code> &#124; <code>String</code> | Field to define which class the node is |
| yourId | <code>Number</code> | Used by the controller to inform the node its id. |
| id | <code>Number</code> | Field defining the node id. It is useful to the controller to     know which node is sending the message. Defined by the controller in the yourId field. |
| data | <code>[Array.&lt;data&gt;](#Rainfall..data)</code> | List of data. Sent by the sensor to the controller. |
| command | <code>[Array.&lt;data&gt;](#Rainfall..data)</code> | List of commands. Sent by the controller to the actuator. |
| lifetime | <code>Number</code> | The period of time between keepalive messages sent by the node |
| dataType | <code>[Array.&lt;dataType&gt;](#Rainfall..dataType)</code> | Field used by the sensor to inform the controller the data it     will send |
| commandType | <code>[Array.&lt;commandType&gt;](#Rainfall..commandType)</code> | Field used by the actautor to inform the controller     the commands it accepts |

<a name="Rainfall..data"></a>

### Rainfall~data : <code>Object</code>
Data object. Used by sensor to send collected data.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Id of the data. Defined by the sensor. |
| value: | <code>String</code> &#124; <code>Number</code> | Value of the measure. |

<a name="Rainfall..dataType"></a>

### Rainfall~dataType : <code>Object</code>
Data type object. Used by sensor to inform the controller the collected data.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Id of the data. Defined by the sensor, shouldn't repeat in dataType and commandType. |
| type | <code>[DATA_TYPES](#DATA_TYPES)</code> &#124; <code>String</code> | The format of the data sent. |
| range | <code>Array.&lt;Number&gt;</code> | Range of the data, it is a list with two values (start and end).     It is needed only when the type of the data is numeric. |
| dataCategory | <code>[DATA_CATEGORIES](#DATA_CATEGORIES)</code> &#124; <code>String</code> | The category of the data |
| unit | <code>String</code> | Unit of the data (for example: meters, seconds) |
| measureStrategy | <code>[MEASURE_STRATEGIES](#MEASURE_STRATEGIES)</code> &#124; <code>String</code> | The strategy used by the sensor     to measure and send data |

<a name="Rainfall..commandType"></a>

### Rainfall~commandType : <code>Object</code>
Command type object. Used by actuator to inform the controller the accepted commands.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Id of the command. Defined by the actuator, shouldn't repeat in dataType and commandType. |
| type | <code>[DATA_TYPES](#DATA_TYPES)</code> &#124; <code>String</code> | The format of the command. |
| range | <code>Array.&lt;Number&gt;</code> | Range of the command, it is a list with two values (start and end).     It is needed only when the type of the command is numeric. |
| commandCategory | <code>[COMMAND_CATEGORIES](#COMMAND_CATEGORIES)</code> &#124; <code>String</code> | The category of the command |
| unit | <code>String</code> | Unit of the command (for example: meters, seconds) |

<a name="Rainfall..onMessage"></a>

### Rainfall~onMessage ⇒ <code>boolean</code> &#124; <code>undefined</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  
**Returns**: <code>boolean</code> &#124; <code>undefined</code> - False if server should stop listening. Otherwise it will keep listening.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Object</code> | Json object containing the received object |
| from | <code>Object</code> | Object containing the address object of the transmitter |

<a name="Rainfall..onListening"></a>

### Rainfall~onListening : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="Rainfall..onSent"></a>

### Rainfall~onSent : <code>function</code>
Callback used by send.

**Kind**: inner typedef of <code>[Rainfall](#Rainfall)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="PACKAGE_TYPES"></a>

## PACKAGE_TYPES : <code>Enum</code>
Enum containing all possible message fields. They can be chained, in other words:
    a message can be of type "whoiscontroller" and "iamcontroller"

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| whoiscontroller | <code>EnumItem</code> | requests controller information (value: 1) |
| iamcontroller | <code>EnumItem</code> | response for <tt>whoiscontroller</tt> (value: 2).     Required fields: yourId |
| describeyourself | <code>EnumItem</code> | requests node description (value: 4). |
| description | <code>EnumItem</code> | contains node description (value: 8).     Required fields: id, dataType (for sensor), commandType (for actuator). |
| data | <code>EnumItem</code> | contains sensor data (value: 16)     Required fields: id, data. |
| command | <code>EnumItem</code> | contains actuator command (value: 32)     Required fields: id, command. |
| lifetime | <code>EnumItem</code> | heartbeat interval definition (value: 64)     Required fields: id, lifetime. |
| keepalive | <code>EnumItem</code> | contains heartbeat signal (value: 128)     Required fields: id. |
| iamback | <code>EnumItem</code> | Sent when the sensor or actuator has an id and wants to reconnect (value: 256)     Required fields: id. |
| welcomeback | <code>EnumItem</code> | Sent when the controller accepts the new node back (value: 512) |
| externalcommand | <code>EnumItem</code> | Sent when an external command changes the actuator states (value: 1024)     Required fields: id, command |

<a name="NODE_CLASSES"></a>

## NODE_CLASSES : <code>Enum</code>
Enum containing all possible node classes. They can be chained, in other words:
    a node can be a sensor and an actuator.

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sensor | <code>EnumItem</code> | Node is a sensor (value: 1) |
| actuator | <code>EnumItem</code> | Node is an actuator (value: 2) |
| controller | <code>EnumItem</code> | Node is a controller (value: 4) |

<a name="DATA_TYPES"></a>

## DATA_TYPES : <code>Enum</code>
Enum containing all possible types (can be used either inside a dataType or commandType).

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| int | <code>EnumItem</code> | Data or command value is an integer (value: 1) |
| bool | <code>EnumItem</code> | Data or command value is an boolean (value: 2) |
| real | <code>EnumItem</code> | Data or command value is a real number (value: 3) |
| string | <code>EnumItem</code> | Data or command value is a string (value: 4) |

<a name="MEASURE_STRATEGIES"></a>

## MEASURE_STRATEGIES : <code>Enum</code>
Enum containing all possible measure strategies. It is the way the sensor send data.

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| event | <code>EnumItem</code> | Data is send when an event that changes sensor measures happens (value: 1) |
| periodic | <code>EnumItem</code> | Data is send at an fixed interval of time (value: 2) |

<a name="COMMAND_CATEGORIES"></a>

## COMMAND_CATEGORIES : <code>Enum</code>
Enum containing all possible command categories, it is used do define which category of command that the
    actuator accepts.

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| toggle | <code>EnumItem</code> | Simple switch that can be on or off (value: 1) |
| temperature | <code>EnumItem</code> | Controls the temperature of the air conditioning (value: 2) |
| fan | <code>EnumItem</code> | Controls the speed of the fan (value: 3) |
| lightswitch | <code>EnumItem</code> | Controls if the light is on or off (value: 4) |
| acmode | <code>EnumItem</code> | Model of the air conditioning (value: 5) |
| lightintensity | <code>EnumItem</code> | Controls the light intensity (value: 6) |
| lightcolor | <code>EnumItem</code> | Controls the light color (value: 7) |
| custom | <code>EnumItem</code> | Customized command type (value: 8) |
| channel | <code>EnumItem</code> | Control channel of the TV (value: 9) |

<a name="DATA_CATEGORIES"></a>

## DATA_CATEGORIES : <code>Enum</code>
Enum containing all possible data categories, it is used do define which category of data that the
    sensor sends.

**Kind**: global constant  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| temperature | <code>EnumItem</code> | Indicates the temperature of the environment (value: 1) |
| luminance | <code>EnumItem</code> | Indicates how luminous is the environment (value: 2) |
| presence | <code>EnumItem</code> | Indicates it someone is in the environment or not (value: 3) |
| humidity | <code>EnumItem</code> | Indicates the humidity of the environment (value: 4) |
| pressure | <code>EnumItem</code> | Indicates the pressure of the environment (value: 5) |
| windspeed | <code>EnumItem</code> | Indicates the speed of the wind of the environment (value: 6) |
| smoke | <code>EnumItem</code> | Indicates if any smoke is present (value: 7) |
| custom | <code>EnumItem</code> | Customized data (value: 8) |
| pressed | <code>EnumItem</code> | Indicates if the button is pressed (value: 9) |

