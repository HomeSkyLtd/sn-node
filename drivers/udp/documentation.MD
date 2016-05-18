<a name="module_rainfall-udp"></a>

## rainfall-udp

* [rainfall-udp](#module_rainfall-udp)
    * _static_
        * [.createDriver](#module_rainfall-udp.createDriver)
        * [.compareAddresses](#module_rainfall-udp.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~Driver](#module_rainfall-udp..Driver)
            * [.listen(msgCallback, [listenCallback])](#module_rainfall-udp..Driver+listen)
            * [.send(to, message, [callback])](#module_rainfall-udp..Driver+send)
            * [.close()](#module_rainfall-udp..Driver+close)
            * [.stop()](#module_rainfall-udp..Driver+stop)
            * [.getAddress()](#module_rainfall-udp..Driver+getAddress) ⇒ <code>[Address](#Driver..Address)</code>
            * [.getBroadcastAddress()](#module_rainfall-udp..Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>

<a name="module_rainfall-udp.createDriver"></a>

### rainfall-udp.createDriver
Creates a driver for UDP socket

**Kind**: static property of <code>[rainfall-udp](#module_rainfall-udp)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br />     <ul>         <li>[rport]: The port listened by the server. If undefined, server will listen on             arbitrary port         <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,             a default value (2356) will be used     </ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="module_rainfall-udp.compareAddresses"></a>

### rainfall-udp.compareAddresses ⇒ <code>boolean</code>
Compares two addresses

**Kind**: static property of <code>[rainfall-udp](#module_rainfall-udp)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[Address](#Driver..Address)</code> | First address to compare |
| a2 | <code>[Address](#Driver..Address)</code> | Second address to compare |

<a name="module_rainfall-udp..Driver"></a>

### rainfall-udp~Driver
UDP driver

**Kind**: inner class of <code>[rainfall-udp](#module_rainfall-udp)</code>  

* [~Driver](#module_rainfall-udp..Driver)
    * [.listen(msgCallback, [listenCallback])](#module_rainfall-udp..Driver+listen)
    * [.send(to, message, [callback])](#module_rainfall-udp..Driver+send)
    * [.close()](#module_rainfall-udp..Driver+close)
    * [.stop()](#module_rainfall-udp..Driver+stop)
    * [.getAddress()](#module_rainfall-udp..Driver+getAddress) ⇒ <code>[Address](#Driver..Address)</code>
    * [.getBroadcastAddress()](#module_rainfall-udp..Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>

<a name="module_rainfall-udp..Driver+listen"></a>

#### driver.listen(msgCallback, [listenCallback])
Opens an UDP socket listening the port and address specified in the rport parameter

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#Driver..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#Driver..onListening)</code> | Function to be called when the driver is listening,         or if an error occurred |

<a name="module_rainfall-udp..Driver+send"></a>

#### driver.send(to, message, [callback])
Sends an UDP packet.

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[Address](#Driver..Address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#Driver..onSent)</code> | Function to be called when the message was sent |

<a name="module_rainfall-udp..Driver+close"></a>

#### driver.close()
Closes the UDP socket. This driver should not be used anmore.

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  
<a name="module_rainfall-udp..Driver+stop"></a>

#### driver.stop()
Stops the UDP server, if listen() was called. You can still use the driver to listen and send

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  
<a name="module_rainfall-udp..Driver+getAddress"></a>

#### driver.getAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the driver network address. Only works when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Network address  
<a name="module_rainfall-udp..Driver+getBroadcastAddress"></a>

#### driver.getBroadcastAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the broadcast network address.

**Kind**: instance method of <code>[Driver](#module_rainfall-udp..Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Broadcast network address  
