## Classes

<dl>
<dt><a href="#Driver">Driver</a></dt>
<dd><p>UDP driver</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#createDriver">createDriver</a></dt>
<dd><p>Creates a driver for UDP socket</p>
</dd>
<dt><a href="#compareAddresses">compareAddresses</a> ⇒ <code>boolean</code></dt>
<dd><p>Compares two addresses</p>
</dd>
</dl>

<a name="Driver"></a>

## Driver
UDP driver

**Kind**: global class  

* [Driver](#Driver)
    * _instance_
        * [.listen(msgCallback, [listenCallback])](#Driver+listen)
        * [.send(to, message, [callback])](#Driver+send)
        * [.close()](#Driver+close)
        * [.stop()](#Driver+stop)
        * [.getAddress()](#Driver+getAddress) ⇒ <code>[Address](#Driver..Address)</code>
        * [.getBroadcastAddress()](#Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>
    * _inner_
        * [~onInitialized](#Driver..onInitialized) : <code>function</code>
        * [~onMessage](#Driver..onMessage) : <code>function</code>
        * [~onListening](#Driver..onListening) : <code>function</code>
        * [~onSent](#Driver..onSent) : <code>function</code>
        * [~Address](#Driver..Address) : <code>Object</code>

<a name="Driver+listen"></a>

### driver.listen(msgCallback, [listenCallback])
Opens an UDP socket listening the port and address specified in the rport parameter

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#Driver..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#Driver..onListening)</code> | Function to be called when the driver is listening,         or if an error occurred |

<a name="Driver+send"></a>

### driver.send(to, message, [callback])
Sends an UDP packet.

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[Address](#Driver..Address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#Driver..onSent)</code> | Function to be called when the message was sent |

<a name="Driver+close"></a>

### driver.close()
Closes the UDP socket. This driver should not be used anmore.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+stop"></a>

### driver.stop()
Stops the UDP server, if listen() was called. You can still use the driver to listen and send

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+getAddress"></a>

### driver.getAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the driver network address. Only works when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Network address  
<a name="Driver+getBroadcastAddress"></a>

### driver.getBroadcastAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the broadcast network address.

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Broadcast network address  
<a name="Driver..onInitialized"></a>

### Driver~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |
| driver | <code>[Driver](#Driver)</code> | The driver object |

<a name="Driver..onMessage"></a>

### Driver~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>[Address](#Driver..Address)</code> | Address of the transmitter |

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

<a name="Driver..Address"></a>

### Driver~Address : <code>Object</code>
**Kind**: inner typedef of <code>[Driver](#Driver)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | The IP (v4 or v6) address |
| port | <code>Number</code> | The UDP port |
| family | <code>String</code> | (Optional) The IP version (can be IPv4 or IPv6) |

<a name="createDriver"></a>

## createDriver
Creates a driver for UDP socket

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br />     <ul>         <li>[rport]: The port listened by the server. If undefined, server will listen on             arbitrary port         <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,             a default value (2356) will be used     </ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="compareAddresses"></a>

## compareAddresses ⇒ <code>boolean</code>
Compares two addresses

**Kind**: global variable  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[Address](#Driver..Address)</code> | First address to compare |
| a2 | <code>[Address](#Driver..Address)</code> | Second address to compare |

