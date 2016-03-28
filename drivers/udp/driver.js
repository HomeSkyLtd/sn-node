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
    this._server =dgram.createSocket('udp4');
}


Driver.prototype.listen = function (msgCallback, listenCallback) {
    
    var listenObj = {
        port: this.RPORT,
        close: function () {
            this._server.close(this.RPORT);
        }
    };

    this._server.bind(this.RPORT, function () {
        // listenObj.address = this.server.address(); <-- this.server is undefined!    
    });

    this._server.on('error', (err) =>{
        if (listenCallback) listenCallback(err, listenObj);
    });

    this._server.on('listening', () =>{
        if (listenCallback) listenCallback(null, listenObj);
    });

    this._server.on('message', (msg, rinfo) =>{
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
    this._server.close();
}

Driver.prototype.close

exports.UdpDriver = Driver;