<a name="module_xbee_s1"></a>

## xbee_s1

* [xbee_s1](#module_xbee_s1)
    * _static_
        * [.createDriver](#module_xbee_s1.createDriver)
        * [.compareAddresses](#module_xbee_s1.compareAddresses) ⇒ <code>boolean</code>
    * _inner_
        * [~Driver](#module_xbee_s1..Driver)
            * [.listen([listenCallback], [msgCallback])](#module_xbee_s1..Driver+listen)
            * [.getBroadcastAddress()](#module_xbee_s1..Driver+getBroadcastAddress) ⇒ <code>[address](#module_xbee_s1..address)</code>
            * [.send(to, msg, [callback])](#module_xbee_s1..Driver+send)
            * [.stop()](#module_xbee_s1..Driver+stop)
            * [.close()](#module_xbee_s1..Driver+close)
        * [~onInitialized](#module_xbee_s1..onInitialized) : <code>function</code>
        * [~onMessage](#module_xbee_s1..onMessage) : <code>function</code>
        * [~onListening](#module_xbee_s1..onListening) : <code>function</code>
        * [~onSent](#module_xbee_s1..onSent) : <code>function</code>
        * [~initParams](#module_xbee_s1..initParams) : <code>Object</code>
        * [~address](#module_xbee_s1..address) : <code>Object</code>

<a name="module_xbee_s1.createDriver"></a>

### xbee_s1.createDriver
Factory method that constructs Driver instances

**Kind**: static property of <code>[xbee_s1](#module_xbee_s1)</code>  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>[initParams](#module_xbee_s1..initParams)</code> | the object specifying the driver parameters |
| [callback] | <code>[onInitialized](#module_xbee_s1..onInitialized)</code> | Function to be called when serial port is initialized and MAC address is read. |

<a name="module_xbee_s1.compareAddresses"></a>

### xbee_s1.compareAddresses ⇒ <code>boolean</code>
Compare if two XBee addresses are equal.

**Kind**: static property of <code>[xbee_s1](#module_xbee_s1)</code>  
**Returns**: <code>boolean</code> - True if address1 is equal to address2, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| a1 | <code>[address](#module_xbee_s1..address)</code> | First Xbee address |
| a2 | <code>[address](#module_xbee_s1..address)</code> | Second Xbee address |

<a name="module_xbee_s1..Driver"></a>

### xbee_s1~Driver
Xbee-S1 driver class

**Kind**: inner class of <code>[xbee_s1](#module_xbee_s1)</code>  

* [~Driver](#module_xbee_s1..Driver)
    * [.listen([listenCallback], [msgCallback])](#module_xbee_s1..Driver+listen)
    * [.getBroadcastAddress()](#module_xbee_s1..Driver+getBroadcastAddress) ⇒ <code>[address](#module_xbee_s1..address)</code>
    * [.send(to, msg, [callback])](#module_xbee_s1..Driver+send)
    * [.stop()](#module_xbee_s1..Driver+stop)
    * [.close()](#module_xbee_s1..Driver+close)

<a name="module_xbee_s1..Driver+listen"></a>

#### driver.listen([listenCallback], [msgCallback])
Listen to serial port, when it is open. When a frame is received form XBee, executes callback msgCallback.

**Kind**: instance method of <code>[Driver](#module_xbee_s1..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [listenCallback] | <code>[onListening](#module_xbee_s1..onListening)</code> | Callback executed when serial port is open. |
| [msgCallback] | <code>[onMessage](#module_xbee_s1..onMessage)</code> | Callback executed when a XBee delivers a frame. |

<a name="module_xbee_s1..Driver+getBroadcastAddress"></a>

#### driver.getBroadcastAddress() ⇒ <code>[address](#module_xbee_s1..address)</code>
A method to get the broadcast address, which is defined by XBee and constant equals to 0xFFFF.

**Kind**: instance method of <code>[Driver](#module_xbee_s1..Driver)</code>  
**Returns**: <code>[address](#module_xbee_s1..address)</code> - An object with the broadcast address  
<a name="module_xbee_s1..Driver+send"></a>

#### driver.send(to, msg, [callback])
Send a message to an destination, and an optional callback is executed after.

**Kind**: instance method of <code>[Driver](#module_xbee_s1..Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[address](#module_xbee_s1..address)</code> | the destination address |
| msg | <code>Buffer</code> | content to be sent to destination |
| [callback] | <code>[onSent](#module_xbee_s1..onSent)</code> | function to be executed after package is sent |

<a name="module_xbee_s1..Driver+stop"></a>

#### driver.stop()
Stop XBee. Serial port is still open, but XBee no longer responds to delivered frames.

**Kind**: instance method of <code>[Driver](#module_xbee_s1..Driver)</code>  
<a name="module_xbee_s1..Driver+close"></a>

#### driver.close()
Close XBee. Serial port is closed and XBee no longer responds to delivered frames.

**Kind**: instance method of <code>[Driver](#module_xbee_s1..Driver)</code>  
<a name="module_xbee_s1..onInitialized"></a>

### xbee_s1~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |
| driver | <code>Driver</code> | The created driver object |

<a name="module_xbee_s1..onMessage"></a>

### xbee_s1~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>[address](#module_xbee_s1..address)</code> | Object containing the address object of the transmitter |

<a name="module_xbee_s1..onListening"></a>

### xbee_s1~onListening : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem listening this will be an Error object, otherwise will be null |

<a name="module_xbee_s1..onSent"></a>

### xbee_s1~onSent : <code>function</code>
Callback used by send.

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem sending this will be an Error object, otherwise will be null |

<a name="module_xbee_s1..initParams"></a>

### xbee_s1~initParams : <code>Object</code>
Parameters object used with the factory method

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| tty_port | <code>String</code> | The serial port where the xbee module is connected |
| baud_rate | <code>Number</code> | (optional) Symbols transmitted per second, 9600 by default |
| data_bits | <code>Number</code> | (optional) Number of bits to be transmitted in the serial channel, 8 by default |
| stop_bits | <code>Number</code> | (optional) Number of stop bits used in the serial channel, 8 by default |
| parity | <code>String</code> | (optional) Specify the behavior of the parity bit in the serial channel. Must be         one of "none", "even", "mark", "odd", "space". Defaults to "none". |

<a name="module_xbee_s1..address"></a>

### xbee_s1~address : <code>Object</code>
Address object

**Kind**: inner typedef of <code>[xbee_s1](#module_xbee_s1)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| address | <code>String</code> | 64-bit MAC address of the device |

