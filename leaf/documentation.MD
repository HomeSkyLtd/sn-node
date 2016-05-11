## Classes

<dl>
<dt><a href="#Leaf">Leaf</a></dt>
<dd></dd>
<dt><a href="#createLeaf">createLeaf</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#parseClass">parseClass(dataType, commandList)</a> ⇒ <code>Enum</code></dt>
<dd><p>Decide if class is Sensor, Actuator or both.</p>
</dd>
</dl>

<a name="Leaf"></a>

## Leaf
**Kind**: global class  

* [Leaf](#Leaf)
    * [new Leaf(driver, args, [callback])](#new_Leaf_new)
    * [.sendData(data, [callback])](#Leaf+sendData)
    * [.listenCommand([callback], [callback])](#Leaf+listenCommand)

<a name="new_Leaf_new"></a>

### new Leaf(driver, args, [callback])
Construct instance of Leaf and get controller address.


| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object |
| args | <code>Object</code> | Arguments object: </br> <ul> 		<li> {Array} dataType list of dataTypes to specify data. 		<li> {Array} commandType list of commandList to specify data. 		<li> {Integer} timeout time between two attempts of sending whoiscontroller. 		<li> {Integer} limitOfPackets number of attempts before stoping. </ul> |
| [callback] | <code>Leaf~onInitialized</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="Leaf+sendData"></a>

### leaf.sendData(data, [callback])
Send a message with data from sensor to controller.

**Kind**: instance method of <code>[Leaf](#Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> &#124; <code>Array</code> | Array of objects or one object with this fields <ul> 		<li>id: which of its parameters he is sending. 		<li>value: value captured by sensor. </ul> |
| [callback] | <code>Leaf~onDataSent</code> | function executed after data is sent |

<a name="Leaf+listenCommand"></a>

### leaf.listenCommand([callback], [callback])
Listen a message with command from actuator to controller.

**Kind**: instance method of <code>[Leaf](#Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>Leaf~onCommandListened</code> | function to be called when a object (command) arrives |
| [callback] | <code>Leaf~onListening</code> | function to be called when it starts listening |

<a name="createLeaf"></a>

## createLeaf
**Kind**: global class  
<a name="new_createLeaf_new"></a>

### new createLeaf(driver, args, [callback])
Factories instance of Leaf and get controller address.


| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object |
| args | <code>Object</code> | Arguments object: </br> <ul> 		<li> {Array} dataType list of dataTypes to specify data. 		<li> {Array} commandType list of commandList to specify data. 		<li> {Integer} timeout time between two attempts of sending whoiscontroller. 		<li> {Integer} limitOfPackets number of attempts before stoping. </ul> |
| [callback] | <code>Leaf~onInitialized</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="parseClass"></a>

## parseClass(dataType, commandList) ⇒ <code>Enum</code>
Decide if class is Sensor, Actuator or both.

**Kind**: global function  
**Returns**: <code>Enum</code> - NODE_CLASSES sensor or actuator.  

| Param | Type | Description |
| --- | --- | --- |
| dataType | <code>Array</code> | list of dataTypes to specify data. |
| commandList | <code>Array</code> | list of commandTypes to specify commands. |

