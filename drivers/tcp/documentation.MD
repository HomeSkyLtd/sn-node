<a name="module_tcp"></a>

## tcp

* [tcp](#module_tcp)
    * _static_
        * [.createDriver](#module_tcp.createDriver)
        * [.compareAddresses](#module_tcp.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~Driver](#module_tcp..Driver)
            * [.compareAddresses](#module_tcp..Driver+compareAddresses) ⇒ <code>boolean</code>
            * [.listen(msgCallback, [listenCallback])](#module_tcp..Driver+listen)
            * [.send(to, message, [callback])](#module_tcp..Driver+send)
            * [.stop()](#module_tcp..Driver+stop)
            * [.close()](#module_tcp..Driver+close)
            * [.getBroadcastAddress()](#module_tcp..Driver+getBroadcastAddress) ⇒ <code>[address](#module_tcp..address)</code>
            * [.getAddress()](#module_tcp..Driver+getAddress) ⇒ <code>[address](#module_tcp..address)</code>
        * [~initParams](#module_tcp..initParams)
        * [~onInitialized](#module_tcp..onInitialized) : <code>function</code>
        * [~onMessage](#module_tcp..onMessage) : <code>function</code>
        * [~onListening](#module_tcp..onListening) : <code>function</code>
        * [~onSent](#module_tcp..onSent) : <code>function</code>
        * [~address](#module_tcp..address) : <code>Object</code>

<a name="module_tcp.createDriver"></a>

### tcp.createDriver
Creates a driver for TCP socket. It doesn't bind the port. But binds this port to the UDP.

**Kind**: static property of <code>[tcp](#module_tcp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>[initParams](#module_tcp..initParams)</code> | Parameters to initialize the tcp driver |
| [callback] | <code>[onInitialized](#module_tcp..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="module_tcp.compareAddresses"></a>

### tcp.compareAddresses ⇒ <code>boolean</code>
Compares two addresses

**Kind**: static property of <code>[tcp](#module_tcp)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[address](#module_tcp..address)</code> | First address to compare |
| a2 | <code>[address](#module_tcp..address)</code> | Second address to compare |

<a name="module_tcp..Driver"></a>

### tcp~Driver
**Kind**: inner class of <code>[tcp](#module_tcp)</code>  

* [~Driver](#module_tcp..Driver)
    * [.compareAddresses](#module_tcp..Driver+compareAddresses) ⇒ <code>boolean</code>
    * [.listen(msgCallback, [listenCallback])](#module_tcp..Driver+listen)
    * [.send(to, message, [callback])](#module_tcp..Driver+send)
    * [.stop()](#module_tcp..Driver+stop)
    * [.close()](#module_tcp..Driver+close)
    * [.getBroadcastAddress()](#module_tcp..Driver+getBroadcastAddress) ⇒ <code>[address](#module_tcp..address)</code>
    * [.getAddress()](#module_tcp..Driver+getAddress) ⇒ <code>[address](#module_tcp..address)</code>

<a name="module_tcp..Driver+compareAddresses"></a>

#### driver.compareAddresses ⇒ <code>boolean</code>
Compares two addresses (it is the same compareAddresses exported function)

**Kind**: instance property of <code>[Driver](#module_tcp..Driver)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[address](#module_tcp..address)</code> | First address to compare |
| a2 | <code>[address](#module_tcp..address)</code> | Second address to compare |

<a name="module_tcp..Driver+listen"></a>

#### driver.listen(msgCallback, [listenCallback])
Opens an TCP socket listening the port and address specified in the rport parameter.
    Also does that for UDP if you want to listen for broadcast messages.

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#module_tcp..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#module_tcp..onListening)</code> | Function to be called when the driver is     listening, if an error occurred |

<a name="module_tcp..Driver+send"></a>

#### driver.send(to, message, [callback])
Sends an package using TCP. If the address is the broadcast address, sends the
    package using UDP

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[address](#module_tcp..address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#module_tcp..onSent)</code> | Function to be called when the message was sent |

<a name="module_tcp..Driver+stop"></a>

#### driver.stop()
Stops listening for messages. But, if you start listening again, this instance must work

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  
<a name="module_tcp..Driver+close"></a>

#### driver.close()
Stops the UDP server, if listen() was called. You can still use the driver to listen and send

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  
<a name="module_tcp..Driver+getBroadcastAddress"></a>

#### driver.getBroadcastAddress() ⇒ <code>[address](#module_tcp..address)</code>
Gets the broadcast network address.

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  
**Returns**: <code>[address](#module_tcp..address)</code> - Broadcast network address  
<a name="module_tcp..Driver+getAddress"></a>

#### driver.getAddress() ⇒ <code>[address](#module_tcp..address)</code>
Gets the driver network address. Only works when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#module_tcp..Driver)</code>  
**Returns**: <code>[address](#module_tcp..address)</code> - Network address  
<a name="module_tcp..initParams"></a>

### tcp~initParams
**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| udplisten | <code>Boolean</code> | (Optional) True if you want to listen for broadcast     messages and false (or undefined) otherwise |
| rport | <code>Number</code> | (Optional) The port listened by the TCP (and UDP if you are     listening for broadcasts). If undefined, server will listen on arbitrary port. |
| broadcast_port | <code>Number</code> | (Optional) The port used when creating a broadcast address. If undefined, a default value (2357) will be used |

<a name="module_tcp..onInitialized"></a>

### tcp~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |
| driver | <code>[Driver](#module_tcp..Driver)</code> | The driver object |

<a name="module_tcp..onMessage"></a>

### tcp~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>[address](#module_tcp..address)</code> | Address of the transmitter |

<a name="module_tcp..onListening"></a>

### tcp~onListening : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="module_tcp..onSent"></a>

### tcp~onSent : <code>function</code>
Callback used by send.

**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="module_tcp..address"></a>

### tcp~address : <code>Object</code>
**Kind**: inner typedef of <code>[tcp](#module_tcp)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | The IP (v4 or v6) address |
| port | <code>Number</code> | The TCP port |
| family | <code>String</code> | (Optional) The IP version (can be IPv4 or IPv6) |

