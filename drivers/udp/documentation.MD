<a name="module_udp"></a>

## udp

* [udp](#module_udp)
    * _static_
        * [.createDriver](#module_udp.createDriver)
        * [.compareAddresses](#module_udp.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~Driver](#module_udp..Driver)
            * [.listen(msgCallback, [listenCallback])](#module_udp..Driver+listen)
            * [.send(to, message, [callback])](#module_udp..Driver+send)
            * [.close()](#module_udp..Driver+close)
            * [.stop()](#module_udp..Driver+stop)
            * [.getAddress()](#module_udp..Driver+getAddress) ⇒ <code>[address](#module_udp..address)</code>
            * [.getBroadcastAddress()](#module_udp..Driver+getBroadcastAddress) ⇒ <code>[address](#module_udp..address)</code>
        * [~initParams](#module_udp..initParams)
        * [~onInitialized](#module_udp..onInitialized) : <code>function</code>
        * [~onMessage](#module_udp..onMessage) : <code>function</code>
        * [~onListening](#module_udp..onListening) : <code>function</code>
        * [~onSent](#module_udp..onSent) : <code>function</code>
        * [~address](#module_udp..address) : <code>Object</code>

<a name="module_udp.createDriver"></a>

### udp.createDriver
Creates a driver for UDP socket

**Kind**: static property of <code>[udp](#module_udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>[initParams](#module_udp..initParams)</code> | Parameters to initialize the udp driver |
| [callback] | <code>[onInitialized](#module_udp..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="module_udp.compareAddresses"></a>

### udp.compareAddresses ⇒ <code>boolean</code>
Compares two addresses

**Kind**: static property of <code>[udp](#module_udp)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[address](#module_udp..address)</code> | First address to compare |
| a2 | <code>[address](#module_udp..address)</code> | Second address to compare |

<a name="module_udp..Driver"></a>

### udp~Driver
**Kind**: inner class of <code>[udp](#module_udp)</code>  

* [~Driver](#module_udp..Driver)
    * [.listen(msgCallback, [listenCallback])](#module_udp..Driver+listen)
    * [.send(to, message, [callback])](#module_udp..Driver+send)
    * [.close()](#module_udp..Driver+close)
    * [.stop()](#module_udp..Driver+stop)
    * [.getAddress()](#module_udp..Driver+getAddress) ⇒ <code>[address](#module_udp..address)</code>
    * [.getBroadcastAddress()](#module_udp..Driver+getBroadcastAddress) ⇒ <code>[address](#module_udp..address)</code>

<a name="module_udp..Driver+listen"></a>

#### driver.listen(msgCallback, [listenCallback])
Opens an UDP socket listening the port and address specified in the rport parameter

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#module_udp..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#module_udp..onListening)</code> | Function to be called when the driver is listening,         or if an error occurred |

<a name="module_udp..Driver+send"></a>

#### driver.send(to, message, [callback])
Sends an UDP packet.

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[address](#module_udp..address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#module_udp..onSent)</code> | Function to be called when the message was sent |

<a name="module_udp..Driver+close"></a>

#### driver.close()
Closes the UDP socket. This driver should not be used anmore.

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  
<a name="module_udp..Driver+stop"></a>

#### driver.stop()
Stops the UDP server, if listen() was called. You can still use the driver to listen and send

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  
<a name="module_udp..Driver+getAddress"></a>

#### driver.getAddress() ⇒ <code>[address](#module_udp..address)</code>
Gets the driver network address. Only works when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  
**Returns**: <code>[address](#module_udp..address)</code> - Network address  
<a name="module_udp..Driver+getBroadcastAddress"></a>

#### driver.getBroadcastAddress() ⇒ <code>[address](#module_udp..address)</code>
Gets the broadcast network address.

**Kind**: instance method of <code>[Driver](#module_udp..Driver)</code>  
**Returns**: <code>[address](#module_udp..address)</code> - Broadcast network address  
<a name="module_udp..initParams"></a>

### udp~initParams
**Kind**: inner typedef of <code>[udp](#module_udp)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rport | <code>Number</code> | (Optional) The port listened by the server. If undefined, server will listen on arbitrary port |
| broadcast_port | <code>Number</code> | (Optional) The port used when creating a broadcast address. If undefined, a default value (2356) will be used |

<a name="module_udp..onInitialized"></a>

### udp~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[udp](#module_udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |
| driver | <code>[Driver](#module_udp..Driver)</code> | The driver object |

<a name="module_udp..onMessage"></a>

### udp~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[udp](#module_udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>[address](#module_udp..address)</code> | Address of the transmitter |

<a name="module_udp..onListening"></a>

### udp~onListening : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[udp](#module_udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="module_udp..onSent"></a>

### udp~onSent : <code>function</code>
Callback used by send.

**Kind**: inner typedef of <code>[udp](#module_udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="module_udp..address"></a>

### udp~address : <code>Object</code>
**Kind**: inner typedef of <code>[udp](#module_udp)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | The IP (v4 or v6) address |
| port | <code>Number</code> | The UDP port |
| family | <code>String</code> | (Optional) The IP version (can be IPv4 or IPv6) |

