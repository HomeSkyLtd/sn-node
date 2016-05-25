#Drivers

This folder contains driver implementations to be used with the Rainfall and Leaf APIs. In the prototype folder
there is the model, which you can use to implement you own driver for any network protocol. If you implement one, we ask
you to submit a pull request so we can incorpore it in this folder.

The driver is just an API for the Rainfall protocol to use to send payloads, the driver must be capable of listening for
messages, sending messages, broadcasting messages and comparing addresses.
