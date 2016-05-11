## Classes

<dl>
<dt><a href="#Driver">Driver</a></dt>
<dd><p>Constructor for xbee driver</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#xbee_api">xbee_api</a></dt>
<dd><p>XBee S1 driver for the rainfall package</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createDriver">createDriver(params, [callback])</a></dt>
<dd><p>Creates a driver for xbee</p>
</dd>
</dl>

<a name="Driver"></a>

## Driver
Constructor for xbee driver

**Kind**: global class  

* [Driver](#Driver)
    * [new Driver(params, [callback])](#new_Driver_new)
    * _instance_
        * [.listen([callback], [callback])](#Driver+listen)
        * [.getBroadcastAddress()](#Driver+getBroadcastAddress) ⇒ <code>Object</code>
        * [.send(to, msg, [callback])](#Driver+send)
        * [.stop()](#Driver+stop)
        * [.close()](#Driver+close)
    * _static_
        * [.compareAddresses(address1, address2)](#Driver.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~onInitialized](#Driver..onInitialized) : <code>function</code>
        * [~onMessage](#Driver..onMessage) : <code>function</code>
        * [~onListening](#Driver..onListening) : <code>function</code>
        * [~onSent](#Driver..onSent) : <code>function</code>

<a name="new_Driver_new"></a>

### new Driver(params, [callback])

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br/> 	<ul> 		<li>baud rate: symbols transmitted per second, 9600 by default 		<li>data bits: 8 bits by default 		<li>stop bits: 1 bit by default 		<li>parity: "None" by default 	</ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when serial port is initialized and MAC address is read. |

<a name="Driver+listen"></a>

### driver.listen([callback], [callback])
Listen to serial port, when it is open. When a frame is received form XBee, executes callback msgCallback.

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [callback] | <code>Driver~onListen</code> | Callback executed when serial port is open. |
| [callback] | <code>[onMessage](#Driver..onMessage)</code> | Callback executed when a XBee delivers a frame. |

<a name="Driver+getBroadcastAddress"></a>

### driver.getBroadcastAddress() ⇒ <code>Object</code>
A method to get the broadcast address, which is defined by XBee and constant equals to 0xFFFF.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>Object</code> - An object with the following parameters:<br/>
<ul>
 <li>address: 64 bit MAC address of the broadcast address, defined by XBee and constant.
</ul>  
<a name="Driver+send"></a>

### driver.send(to, msg, [callback])
Send a message to an destination, and an optional callback is executed after.

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>Object</code> | an object with the following parameters:<br/> <ul>  <li>address: 64 bit MAC address of the destination device. </ul> |
| msg | <code>String</code> | string to be sent to destination |
| [callback] | <code>[onSent](#Driver..onSent)</code> | function to be executed after package is sent |

<a name="Driver+stop"></a>

### driver.stop()
Stop XBee. Serial port is still open, but XBee no longer responds to delivered frames.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+close"></a>

### driver.close()
Close XBee. Serial port is closed and XBee no longer responds to delivered frames.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver.compareAddresses"></a>

### Driver.compareAddresses(address1, address2) ⇒ <code>boolean</code>
Compare if two XBee addresses are equals.

**Kind**: static method of <code>[Driver](#Driver)</code>  
**Returns**: <code>boolean</code> - True if address1 is equal to address2, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| address1 | <code>object</code> | First Xbee address |
| address2 | <code>object</code> | Second Xbee address |

<a name="Driver..onInitialized"></a>

### Driver~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |

<a name="Driver..onMessage"></a>

### Driver~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>Object</code> | Object containing the address object of the transmitter |

<a name="Driver..onListening"></a>

### Driver~onListening : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="Driver..onSent"></a>

### Driver~onSent : <code>function</code>
Callback used by send.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="xbee_api"></a>

## xbee_api
XBee S1 driver for the rainfall package

**Kind**: global variable  
<a name="createDriver"></a>

## createDriver(params, [callback])
Creates a driver for xbee

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br/> 	<ul> 		<li>baud rate: symbols transmitted per second, 9600 by default 		<li>data bits: 8 bits by default 		<li>stop bits: 1 bit by default 		<li>parity: "None" by default 	</ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when serial port is initialized and MAC address is read. |

