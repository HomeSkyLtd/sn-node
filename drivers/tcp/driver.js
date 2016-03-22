const dgram = require("dgram");

const RPORT = 4567;
const SPORT = 4568;
var client = dgram.createSocket('udp4');

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