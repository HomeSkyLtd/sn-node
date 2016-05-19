<a name="module_Leaf"></a>

## Leaf

* [Leaf](#module_Leaf)
    * _static_
        * [.createLeaf](#module_Leaf.createLeaf)
    * _inner_
        * [~Leaf](#module_Leaf..Leaf)
            * [new Leaf(driver, args, [callback])](#new_module_Leaf..Leaf_new)
            * [.sendData(data, [callback])](#module_Leaf..Leaf+sendData)
            * [.listenCommand([callback], [callback])](#module_Leaf..Leaf+listenCommand)
            * [.sendExternalCommand(command, [callback])](#module_Leaf..Leaf+sendExternalCommand)
        * [~createLeaf()](#module_Leaf..createLeaf)
        * [~parseClass(dataType, commandList)](#module_Leaf..parseClass) ⇒ <code>Enum</code>

<a name="module_Leaf.createLeaf"></a>

### Leaf.createLeaf
Factories instance of Leaf and get controller address.

**Kind**: static property of <code>[Leaf](#module_Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object. |
| args | <code>Object</code> | Arguments object. |
| [callback] | <code>[onInitialized](#Leaf..onInitialized)</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="module_Leaf..Leaf"></a>

### Leaf~Leaf
**Kind**: inner class of <code>[Leaf](#module_Leaf)</code>  

* [~Leaf](#module_Leaf..Leaf)
    * [new Leaf(driver, args, [callback])](#new_module_Leaf..Leaf_new)
    * [.sendData(data, [callback])](#module_Leaf..Leaf+sendData)
    * [.listenCommand([callback], [callback])](#module_Leaf..Leaf+listenCommand)
    * [.sendExternalCommand(command, [callback])](#module_Leaf..Leaf+sendExternalCommand)

<a name="new_module_Leaf..Leaf_new"></a>

#### new Leaf(driver, args, [callback])
Construct instance of Leaf and get controller address.


| Param | Type | Description |
| --- | --- | --- |
| driver | <code>Object</code> | Driver object |
| args | <code>Object</code> | Arguments object |
| [callback] | <code>[onInitialized](#Leaf..onInitialized)</code> | function executed after Leaf instance initialized, or when an error of timeout occurred, which is the first parameter. |

<a name="module_Leaf..Leaf+sendData"></a>

#### leaf.sendData(data, [callback])
Send a message with data from sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> &#124; <code>Array</code> | Array of objects or one object with this fields |
| [callback] | <code>[onDataSent](#Leaf..onDataSent)</code> | function executed after data is sent |

<a name="module_Leaf..Leaf+listenCommand"></a>

#### leaf.listenCommand([callback], [callback])
Listen a message with command from actuator to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>[onCommandListened](#Leaf..onCommandListened)</code> | function to be called when a object (command) arrives |
| [callback] | <code>[onListening](#Leaf..onListening)</code> | function to be called when it starts listening |

<a name="module_Leaf..Leaf+sendExternalCommand"></a>

#### leaf.sendExternalCommand(command, [callback])
Send a message with command from actuator/sensor to controller.

**Kind**: instance method of <code>[Leaf](#module_Leaf..Leaf)</code>  

| Param | Type | Description |
| --- | --- | --- |
| command | <code>Object</code> &#124; <code>Array</code> | Array of objects. |
| [callback] | <code>[onCommandSent](#Leaf..onCommandSent)</code> | function executed after data is sent |

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
| dataType | <code>Array</code> | list of dataTypes to specify data. |
| commandList | <code>Array</code> | list of commandTypes to specify commands. |

