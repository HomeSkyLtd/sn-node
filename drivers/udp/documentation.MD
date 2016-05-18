<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_"></a>

## UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses

* [UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_)
    * [~Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)
        * [.listen(msgCallback, [listenCallback])](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+listen)
        * [.send(to, message, [callback])](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+send)
        * [.close()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+close)
        * [.stop()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+stop)
        * [.getAddress()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getAddress) ⇒ <code>[Address](#Driver..Address)</code>
        * [.getBroadcastAddress()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>
    * [~createDriver(params, [callback])](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..createDriver)
    * [~compareAddresses(a1, a2)](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..compareAddresses) ⇒ <code>boolean</code>

<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver"></a>

### UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses~Driver
UDP driver

**Kind**: inner class of <code>[UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_)</code>  

* [~Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)
    * [.listen(msgCallback, [listenCallback])](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+listen)
    * [.send(to, message, [callback])](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+send)
    * [.close()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+close)
    * [.stop()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+stop)
    * [.getAddress()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getAddress) ⇒ <code>[Address](#Driver..Address)</code>
    * [.getBroadcastAddress()](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>

<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+listen"></a>

#### driver.listen(msgCallback, [listenCallback])
Opens an UDP socket listening the port and address specified in the rport parameter

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#Driver..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#Driver..onListening)</code> | Function to be called when the driver is listening,         or if an error occurred |

<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+send"></a>

#### driver.send(to, message, [callback])
Sends an UDP packet.

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[Address](#Driver..Address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#Driver..onSent)</code> | Function to be called when the message was sent |

<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+close"></a>

#### driver.close()
Closes the UDP socket. This driver should not be used anmore.

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  
<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+stop"></a>

#### driver.stop()
Stops the UDP server, if listen() was called. You can still use the driver to listen and send

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  
<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getAddress"></a>

#### driver.getAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the driver network address. Only works when "listening" was called beforehands

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Network address  
<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver+getBroadcastAddress"></a>

#### driver.getBroadcastAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the broadcast network address.

**Kind**: instance method of <code>[Driver](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Broadcast network address  
<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..createDriver"></a>

### UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses~createDriver(params, [callback])
Creates a driver for UDP socket

**Kind**: inner method of <code>[UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Object</code> | an object with the following parameters:<br />     <ul>         <li>[rport]: The port listened by the server. If undefined, server will listen on             arbitrary port         <li>[broadcast_port]: The port used when creating a broadcast address. If undefined,             a default value (2356) will be used     </ul> |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_..compareAddresses"></a>

### UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses~compareAddresses(a1, a2) ⇒ <code>boolean</code>
Compares two addresses

**Kind**: inner method of <code>[UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions: createDriver and compareAddresses](#UdpDriver
    This module is the UDP driver for the Rainfall library. It exports two
    functions_ createDriver and compareAddressesmodule_)</code>  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[Address](#Driver..Address)</code> | First address to compare |
| a2 | <code>[Address](#Driver..Address)</code> | Second address to compare |

