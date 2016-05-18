<a name="module_leaf"></a>

## leaf

* [leaf](#module_leaf)
    * _static_
        * [.createLeaf](#module_leaf.createLeaf)
    * _inner_
        * [~Leaf](#module_leaf..Leaf)
            * [new Leaf(driver, args, [callback])](#new_module_leaf..Leaf_new)
            * [.sendData(data, [callback])](#module_leaf..Leaf+sendData)
            * [.listenCommand([callback], [callback])](#module_leaf..Leaf+listenCommand)
            * [.sendExternalCommand(command, [callback])](#module_leaf..Leaf+sendExternalCommand)
        * [~parseClass(dataType, commandList)](#module_leaf..parseClass) ⇒ <code>Enum</code>

<a name="module_leaf.createLeaf"></a>

### leaf.createLeaf
Factories instance of Leaf and get controller address.

**Kind**: static property of <code>[leaf](#module_leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object |
| args | <code>Object</code> | Arguments object: </br> <ul> 		<li> {Array} dataType list of dataTypes to specify data. 		<li> {Array} commandType list of commandList to specify data. 		<li> {Integer} timeout time between two attempts of sending whoiscontroller. 		<li> {Integer} limitOfPackets number of attempts before stoping. </ul> |
| [callback] | <code>Leaf~onInitialized</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="module_leaf..Leaf"></a>

### leaf~Leaf
**Kind**: inner class of <code>[leaf](#module_leaf)</code>  

* [~Leaf](#module_leaf..Leaf)
    * [new Leaf(driver, args, [callback])](#new_module_leaf..Leaf_new)
    * [.sendData(data, [callback])](#module_leaf..Leaf+sendData)
    * [.listenCommand([callback], [callback])](#module_leaf..Leaf+listenCommand)
    * [.sendExternalCommand(command, [callback])](#module_leaf..Leaf+sendExternalCommand)

<a name="new_module_leaf..Leaf_new"></a>

#### new Leaf(driver, args, [callback])
Construct instance of Leaf and get controller address.


| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object |
| args | <code>Object</code> | Arguments object: </br> <ul> 		<li> {Array} dataType list of dataTypes to specify data. 		<li> {Array} commandType list of commandList to specify data. 		<li> {Integer} timeout time between two attempts of sending whoiscontroller. 		<li> {Integer} limitOfPackets number of attempts before stoping. </ul> |
| [callback] | <code>Leaf~onInitialized</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="module_leaf..Leaf+sendData"></a>

#### leaf.sendData(data, [callback])
Send a message with data from sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> &#124; <code>Array</code> | Array of objects or one object with this fields <ul> 		<li>id: which of its parameters he is sending. 		<li>value: value captured by sensor. </ul> |
| [callback] | <code>Leaf~onDataSent</code> | function executed after data is sent |

<a name="module_leaf..Leaf+listenCommand"></a>

#### leaf.listenCommand([callback], [callback])
Listen a message with command from actuator to controller.

**Kind**: instance method of <code>[Leaf](#module_leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>Leaf~onCommandListened</code> | function to be called when a object (command) arrives |
| [callback] | <code>Leaf~onListening</code> | function to be called when it starts listening |

<a name="module_leaf..Leaf+sendExternalCommand"></a>

#### leaf.sendExternalCommand(command, [callback])
Send a message with command from actuator/sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>Object</code> &#124; <code>Array</code> | Array of objects or one object with this fields <ul> 		<li>id: which of its parameters he is sending. 		<li>command: executed by actuator </ul> |
| [callback] | <code>Leaf~onDataSent</code> | function executed after data is sent |

<a name="module_leaf..parseClass"></a>

### leaf~parseClass(dataType, commandList) ⇒ <code>Enum</code>
Decide if class is Sensor, Actuator or both.

**Kind**: inner method of <code>[leaf](#module_leaf)</code>  
**Returns**: <code>Enum</code> - NODE_CLASSES sensor or actuator.  

| Param | Type | Description |
| --- | --- | --- |
| dataType | <code>Array</code> | list of dataTypes to specify data. |
| commandList | <code>Array</code> | list of commandTypes to specify commands. |

