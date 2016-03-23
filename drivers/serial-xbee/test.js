var util = require('util');
var SerialPort = require('serialport').SerialPort;
var xbee_api = require('xbee-api');

var C = xbee_api.constants;

var xbeeAPI = new xbee_api.XBeeAPI({
    api_mode: 1
});

var serialport = new SerialPort("/dev/ttyAMA0", {
    baudrate: 9600,
    parser: xbeeAPI.rawParser()
});

serialport.on("open", function() {
    setInterval(function () {
        var frame_obj = { // AT Request to be sent to  
            type: C.FRAME_TYPE.AT_COMMAND,
            command: "NI",
            commandParameter: [],
        };

        serialport.write(xbeeAPI.buildFrame(frame_obj));
         console.log('Sent to serial port.');
     }, 3000);
});

// All frames parsed by the XBee will be emitted here 
xbeeAPI.on("frame_object", function(frame) {
    console.log(">>", frame);
});