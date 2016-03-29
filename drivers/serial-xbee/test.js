var util = require('util');

// All frames parsed by the XBee will be emitted here
xbeeAPI.on("frame_object", function(frame) {
    console.log(">>", frame);
});
