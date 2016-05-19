## Classes

<dl>
<dt><a href="#Driver">Driver</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#createDriver">createDriver([params], [callback])</a></dt>
<dd><p>The client should call this function to instantiate the driver. The new driver is passed in the callback function.
    The implementation is very simple, just copy and paste the code bellow.</p>
</dd>
<dt><a href="#compareAddresses">compareAddresses(address1, address2)</a> ⇒ <code>boolean</code></dt>
<dd><p>Compares two address</p>
</dd>
</dl>

<a name="Driver"></a>

## Driver
**Kind**: global class  

* [Driver](#Driver)
    * _instance_
        * [.listen(msgCallback, [listenCallback])](#Driver+listen)
        * [.stop()](#Driver+stop)
        * [.close()](#Driver+close)
        * [.send(to, message, [callback])](#Driver+send)
        * [.getBroadcastAddress()](#Driver+getBroadcastAddress) ⇒ <code>[Address](#Driver..Address)</code>
    * _inner_
        * [~Address](#Driver..Address)
        * [~onInitialized](#Driver..onInitialized) : <code>function</code>
        * [~onMessage](#Driver..onMessage) : <code>function</code>
        * [~onListening](#Driver..onListening) : <code>function</code>
        * [~onSent](#Driver..onSent) : <code>function</code>

<a name="Driver+listen"></a>

### driver.listen(msgCallback, [listenCallback])
Starts listening for messages

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| msgCallback | <code>[onMessage](#Driver..onMessage)</code> | Function to be called when a message arrives |
| [listenCallback] | <code>[onListening](#Driver..onListening)</code> | Function to be called driver is listening, or if an error occurred |

<a name="Driver+stop"></a>

### driver.stop()
Stops listening for messages. But, if you start listening again, this instance must work

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+close"></a>

### driver.close()
Closes driver. After that call, the driver doesn't need to work anymore and should stop any assync task

**Kind**: instance method of <code>[Driver](#Driver)</code>  
<a name="Driver+send"></a>

### driver.send(to, message, [callback])
Sends a message to address

**Kind**: instance method of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| to | <code>[Address](#Driver..Address)</code> | Object containing the address object of the recipient |
| message | <code>Buffer</code> | Buffer containing the message to be sent |
| [callback] | <code>[onSent](#Driver..onSent)</code> | Function to be called when the message was sent |

<a name="Driver+getBroadcastAddress"></a>

### driver.getBroadcastAddress() ⇒ <code>[Address](#Driver..Address)</code>
Gets the broadcast network address. Only needs to work when "listening" was called.
    It should return an object in the same format as the "to" argument in Driver.send

**Kind**: instance method of <code>[Driver](#Driver)</code>  
**Returns**: <code>[Address](#Driver..Address)</code> - Broadcast network address  
<a name="Driver..Address"></a>

### Driver~Address
Actually anything used by the driver do identify the address of
    the node. For example, in UDP it is the port and the ip address of the node.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  
<a name="Driver..onInitialized"></a>

### Driver~onInitialized : <code>function</code>
Callback used by Driver.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>Error</code> | If there is a problem initializing this will be an Error object, otherwise will be null |
| driver | <code>[Driver](#Driver)</code> | The new driver instance |

<a name="Driver..onMessage"></a>

### Driver~onMessage : <code>function</code>
Callback used by listen.

**Kind**: inner typedef of <code>[Driver](#Driver)</code>  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>Buffer</code> | Buffer containing the buffer received from the network |
| from | <code>[Address](#Driver..Address)</code> | Object containing the address object of the transmitter |

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

<a name="createDriver"></a>

## createDriver([params], [callback])
The client should call this function to instantiate the driver. The new driver is passed in the callback function.
    The implementation is very simple, just copy and paste the code bellow.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>Object</code> | An object containing parameters for the specific driver |
| [callback] | <code>[onInitialized](#Driver..onInitialized)</code> | Function to be called when the driver is initialized |

<a name="compareAddresses"></a>

## compareAddresses(address1, address2) ⇒ <code>boolean</code>
Compares two address

**Kind**: global function  
**Returns**: <code>boolean</code> - true if address1 and adress2 are the same and false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| address1 | <code>[Address](#Driver..Address)</code> | First address to compare |
| address2 | <code>[Address](#Driver..Address)</code> | Second address to compare |

