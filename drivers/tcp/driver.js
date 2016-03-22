const dgram = require("dgram");

const RPORT = 4567;
const SPORT = 4568;
var client = dgram.createSocket('udp4');

function listen(msgCallback, listenCallback) {
    var server = dgram.createSocket('udp4');
    server.bind(RPORT);

    var ret = {
        close: function () {
            server.close(PORT);
        },
        address: server.address()
    }

    server.on('error', (err) =>{
        if(listenCallback) listenCallback(err, ret);
    });

    server.on('listening', () =>{
        if(listenCallback) listenCallback(null, ret);
    });

    server.on('message', (msg, rinfo) =>{
        msgCallback(null, msg, rinfo, ret);
    });

}

function send(to, msg, callback) {
    client.send(msg, to.port, to.address, () =>{
        if(callback) callback;
    });
}

exports.listen = listen;
exports.send = send;