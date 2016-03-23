const dgram = require("dgram");

/**
    Creates a driver for a UDP socket
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>rport: The port listened by the server
    </ul>
*/
function Driver(params){
    this.RPORT = params.rport
    this.server =dgram.createSocket('udp4');
}


Driver.prototype.listen = function (msgCallback, listenCallback) {
    
    var listenObj = {
        port: this.RPORT,
        close: function () {
            this.server.close(this.RPORT);
        }
    };

    this.server.bind(this.RPORT, function () {
        // listenObj.address = this.server.address(); <-- this.server is undefined!    
    });

    this.server.on('error', (err) =>{
        if (listenCallback) listenCallback(err, listenObj);
    });

    this.server.on('listening', () =>{
        if (listenCallback) listenCallback(null, listenObj);
    });

    this.server.on('message', (msg, rinfo) =>{
        msgCallback(msg, rinfo, listenObj);
    });
}

Driver.prototype.send = function(to, msg, callback) {
    var client = dgram.createSocket('udp4');
    client.send(msg, to.port, to.address, (err) => {
        client.close();
        if (callback) callback(err);
    });
}

Driver.prototype.close = function(){
    this.server.close();
}

Driver.prototype.close

exports.Driver = Driver;