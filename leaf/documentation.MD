<a name="module_Leaf"></a>

## Leaf

* [Leaf](#module_Leaf)
    * _static_
        * [.createLeaf](#module_Leaf.createLeaf)
    * _inner_
        * [~Leaf](#module_Leaf..Leaf)
            * [.sendData(data, [callback])](#module_Leaf..Leaf+sendData)
            * [.listenCommand([callback], [callback])](#module_Leaf..Leaf+listenCommand)
            * [.sendExternalCommand(command, [callback])](#module_Leaf..Leaf+sendExternalCommand)
        * [~createLeaf()](#module_Leaf..createLeaf)
        * [~parseClass(dataType, commandList)](#module_Leaf..parseClass) ⇒ <code>Enum</code>
        * [~args](#module_Leaf..args) : <code>Object</code>
        * [~onInitialized](#module_Leaf..onInitialized) : <code>function</code>
        * [~data](#module_Leaf..data) : <code>Object</code> &#124; <code>Array</code>
        * [~onDataSent](#module_Leaf..onDataSent) : <code>function</code>
        * [~onCommandListened](#module_Leaf..onCommandListened) ⇒ <code>boolean</code> &#124; <code>undefined</code>
        * [~onListening](#module_Leaf..onListening) : <code>function</code>
        * [~command](#module_Leaf..command) : <code>Object</code> &#124; <code>Array</code>
        * [~onCommandSent](#module_Leaf..onCommandSent) : <code>function</code>
        * [~commandType](#module_Leaf..commandType) : <code>Object</code>
        * [~dataType](#module_Leaf..dataType) : <code>Object</code>

<a name="module_Leaf.createLeaf"></a>

### Leaf.createLeaf
Factories instance of Leaf and get controller address.

**Kind**: static property of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object. |
| args | <code>[args](#module_Leaf..args)</code> | Arguments object. |
| [callback] | <code>[onInitialized](#module_Leaf..onInitialized)</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="module_Leaf..Leaf"></a>

### Leaf~Leaf
**Kind**: inner class of <code>[Leaf](#module_Leaf)</code>  

* [~Leaf](#module_Leaf..Leaf)
    * [.sendData(data, [callback])](#module_Leaf..Leaf+sendData)
    * [.listenCommand([callback], [callback])](#module_Leaf..Leaf+listenCommand)
    * [.sendExternalCommand(command, [callback])](#module_Leaf..Leaf+sendExternalCommand)

<a name="module_Leaf..Leaf+sendData"></a>

#### leaf.sendData(data, [callback])
Send a message with data from sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>[data](#module_Leaf..data)</code> | Array of objects or one object. |
| [callback] | <code>[onDataSent](#module_Leaf..onDataSent)</code> | function executed after data is sent. |

<a name="module_Leaf..Leaf+listenCommand"></a>

#### leaf.listenCommand([callback], [callback])
Listen a message with command from actuator to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[onCommandListened](#module_Leaf..onCommandListened)</code> | function to be called when a object (command) arrives |
| [callback] | <code>[onListening](#module_Leaf..onListening)</code> | function to be called when it starts listening |

<a name="module_Leaf..Leaf+sendExternalCommand"></a>

#### leaf.sendExternalCommand(command, [callback])
Send a message with command from actuator/sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>[command](#module_Leaf..command)</code> | Array of objects or a single object. |
| [callback] | <code>[onCommandSent](#module_Leaf..onCommandSent)</code> | function executed after data is sent |

<a name="module_Leaf..createLeaf"></a>

### Leaf~createLeaf()
Factory method to construct a Leaf instance. Do not return anything.

**Kind**: inner method of <code>[Leaf](#module_Leaf)</code>  
<a name="module_Leaf..parseClass"></a>

### Leaf~parseClass(dataType, commandList) ⇒ <code>Enum</code>
Decide if class is Sensor, Actuator or both.

**Kind**: inner method of <code>[Leaf](#module_Leaf)</code>  
**Returns**: <code>Enum</code> - NODE_CLASSES sensor or actuator.  

| Param | Type | Description |
| --- | --- | --- |
| dataType | <code>[dataType](#module_Leaf..dataType)</code> | list of dataTypes to specify data. |
| commandList | <code>[commandType](#module_Leaf..commandType)</code> | list of commandTypes to specify commands. |

<a name="module_Leaf..args"></a>

### Leaf~args : <code>Object</code>
Arguments for Leaf constructor.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| dataType | <code>[dataType](#module_Leaf..dataType)</code> | list of dataTypes of specific data. |
| commandType | <code>[commandType](#module_Leaf..commandType)</code> | list of commandList to specify data. |
| timeout | <code>Number</code> | time between two attempts of sending whoiscontroller. |
| limitOfPackets | <code>Number</code> | number of attempts before stoping. |

<a name="module_Leaf..onInitialized"></a>

### Leaf~onInitialized : <code>function</code>
Callback used by Leaf.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem creating leaf this will be an Error object, otherwise will be null |
| driver | <code>Driver</code> | The created driver object |

<a name="module_Leaf..data"></a>

### Leaf~data : <code>Object</code> &#124; <code>Array</code>
Data or list of data send to controller from this leaf.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | number identifying which of the metrics that this sensor is sending. |
| value | <code>Number</code> &#124; <code>String</code> &#124; <code>Boolean</code> | data captured by sensor. |

<a name="module_Leaf..onDataSent"></a>

### Leaf~onDataSent : <code>function</code>
Callback used by sendData

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending data this will be an Error object, otherwise will be null |

<a name="module_Leaf..onCommandListened"></a>

### Leaf~onCommandListened ⇒ <code>boolean</code> &#124; <code>undefined</code>
Callback used by listenCommand when message of command arrives.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Returns**: <code>boolean</code> &#124; <code>undefined</code> - False if server should stop listening. Otherwise it will keep listening.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Object</code> | Json object containing the received object |
| from | <code>Object</code> | Object containing the address object of the transmitter |

<a name="module_Leaf..onListening"></a>

### Leaf~onListening : <code>function</code>
Callback used by listenCommand when leaf starts listening.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="module_Leaf..command"></a>

### Leaf~command : <code>Object</code> &#124; <code>Array</code>
Command or list of commands executed by user and sent from actuator to controller.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | number identifying which of the metrics that this sensor is sending. |
| value | <code>Number</code> &#124; <code>String</code> &#124; <code>Boolean</code> | command executed by user of the network and sent from actuator to controller. |

<a name="module_Leaf..onCommandSent"></a>

### Leaf~onCommandSent : <code>function</code>
Callback executed by sendExternalCommand when a command is executed by the user of the network.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="module_Leaf..commandType"></a>

### Leaf~commandType : <code>Object</code>
Command type object. Used by actuator to inform the controller the accepted commands.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Id of the command. Defined by the actuator. |
| type | <code>DATA_TYPES</code> &#124; <code>String</code> | The format of the command. |
| range | <code>Array.&lt;Number&gt;</code> | Range of the command, it is a list with two values (start and end).     It is needed only when the type of the command is numeric. |
| commandCategory | <code>COMMAND_CATEGORIES</code> &#124; <code>String</code> | The category of the command |
| unit | <code>String</code> | Unit of the command (for example: meters, seconds) |

<a name="module_Leaf..dataType"></a>

### Leaf~dataType : <code>Object</code>
Data type object. Used by sensor to inform the controller the collected data.

**Kind**: inner typedef of <code>[Leaf](#module_Leaf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>Number</code> | Id of the data. Defined by the sensor. |
| type | <code>DATA_TYPES</code> &#124; <code>String</code> | The format of the data sent. |
| range | <code>Array.&lt;Number&gt;</code> | Range of the data, it is a list with two values (start and end).     It is needed only when the type of the data is numeric. |
| dataCategory | <code>DATA_CATEGORIES</code> &#124; <code>String</code> | The category of the data |
| unit | <code>String</code> | Unit of the data (for example: meters, seconds) |
| measureStrategy | <code>MEASURE_STRATEGIES</code> &#124; <code>String</code> | The strategy used by the sensor     to measure and send data |

