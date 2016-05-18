<a name="module_rainfall-udp"></a>

## rainfall-udp

* [rainfall-udp](#module_rainfall-udp)
    * [.createDriver](#module_rainfall-udp.createDriver)
    * [.compareAddresses](#module_rainfall-udp.compareAddresses) ⇒ <code>boolean</code>

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

