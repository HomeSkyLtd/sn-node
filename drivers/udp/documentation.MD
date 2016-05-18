<a name="Driver"></a>

## Driver
Creates a driver for a UDP socket

**Kind**: global class  

* [Driver](#Driver)
    * [new Driver(params, [callback])](#new_Driver_new)
    * _instance_
        * [.listen(msgCallback, [listenCallback])](#Driver+listen)
        * [.send(to, message, [callback])](#Driver+send)
        * [.close()](#Driver+close)
        * [.stop()](#Driver+stop)
        * [.getAddress()](#Driver+getAddress) ⇒ <code>Object</code>
        * [.getBroadcastAddress()](#Driver+getBroadcastAddress) ⇒ <code>Object</code>
    * _static_
        * [.compareAddresses()](#Driver.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~onInitialized](#Driver..onInitialized) : <code>function</code>
        * [~onMessage](#Driver..onMessage) : <code>function</code>
        * [~onListening](#Driver..onListening) : <code>function</code>
        * [~onSent](#Driver..onSent) : <code>function</code>

<a name="new_Driver_new"></a>

### new Driver(params, [callback])

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br />     <ul>         <li>[rport]: The port listened by the server. If undefined, server will listen on             arbitrary port         <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,             a default value will be used     </ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="Driver+listen"></a>

### driver.listen(msgCallback, [listenCallback])
Opens a UDP socket listening the port and address specified in the rport parameter

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#Driver..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#Driver..onListening)</code> | Function to be called driver is listening,         or if an error occurred |

<a name="Driver+send"></a>

### driver.send(to, message, [callback])
Sends a UDP packet.

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>Object</code> | Object containing the address object of the recipient. Contains the following fields:<br />     <ul>         <li>address: the target IP address         <li>port: the target port |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#Driver..onSent)</code> | Function to be called when the message was sent |

<a name="Driver+close"></a>

### driver.close()
Closes the UDP socket. This driver should not be used anmore.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+stop"></a>

### driver.stop()
Stops the UDP server, if listen() was called

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+getAddress"></a>

### driver.getAddress() ⇒ <code>Object</code>
Gets the driver network address. Only need to work when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>Object</code> - Network address  
<a name="Driver+getBroadcastAddress"></a>

### driver.getBroadcastAddress() ⇒ <code>Object</code>
Gets the broadcast network address. Only need to work when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>Object</code> - Broadcast network address  
<a name="Driver.compareAddresses"></a>

### Driver.compareAddresses() ⇒ <code>boolean</code>
Compares two addresses

**Kind**: static method of <code>[Driver](#Driver)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  
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

