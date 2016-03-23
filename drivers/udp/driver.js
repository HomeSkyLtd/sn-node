const dgram = require("dgram");

var RPORT;
var client = dgram.createSocket('udp4');

/**
    Sets the parameters for the UDP server
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>rport: The port listened by the server
    </ul>
*/
function init(params){
    RPORT = params.rport;
}


function listen(msgCallback, listenCallback) {
    
    var server = dgram.createSocket('udp4');
    var listenObj = {
        close: function () {
            server.close(RPORT);
        }
    };

    server.on('error', (err) =>{
        if (listenCallback) listenCallback(err, listenObj);
    });

    server.on('listening', () =>{
        if (listenCallback) listenCallback(null, listenObj);
    });

    server.on('message', (msg, rinfo) =>{
        msgCallback(null, msg, rinfo, listenObj);
    });

    server.bind(RPORT, function () {
        listenObj.address = server.address();
    });
}

function send(to, msg, callback) {
    client.send(msg, to.port, to.address, (err) => {
        if (callback) callback(err);
    });
}

exports.listen = listen;
exports.send = send;
exports.init = init;