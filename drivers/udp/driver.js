const dgram = require("dgram");

const BROADCAST_ADDR = "255.255.255.255";

/**
    Creates a driver for a UDP socket
    @param {Object} params - an object with the following parameters:<br />
    <ul>
        <li>rport: The port listened by the server
        <li>address: The IP address listened by the server
    </ul>
    @param {function} cb - a callback function called when driver instantiation is finished 
*/
function Driver(params, cb){
    this.RPORT = params.rport;
    this.ADDRESS = params.address;
    this._server = dgram.createSocket('udp4');
    cb(null);
}

Driver.prototype.listen = function (msgCallback, listenCallback) {
    if(this.ADDRESS === undefined)
        this._server.bind(this.RPORT);
    else
        this._server.bind(this.RPORT, this.ADDRESS);

    this._server.on('error', (err) =>{
        if (listenCallback) listenCallback(err);
    });

    this._server.on('listening', () =>{
        if (listenCallback) listenCallback(null);
    });

    this._server.on('message', (msg, rinfo) =>{
        var rport = msg.readInt16BE(msg.length - 2);
        rinfo.port = rport;
        msgCallback(msg.slice(0, msg.length - 2), rinfo);
    });
}

Driver.prototype.send = function(to, msg, callback) {
    var client = dgram.createSocket('udp4');
    client.bind();

    client.on('listening', () => {
        if(to.address === BROADCAST_ADDR) client.setBroadcast(true);
        var listenPort = new Buffer([Number(this.RPORT) >> 8, Number(this.RPORT) & 0xFF]);

        client.send(Buffer.concat([msg, listenPort]), to.port, to.address, (err) => {
            client.close();
            if (callback) callback(err);
        });
    });

}

Driver.prototype.close = function() {
    
    this._server.close();
}

Driver.prototype.getAddress = function(){
    try{
        var address = this._server.address();
    }
    catch(err){
        throw new Error("Failed to retrieve address. Have you called listen()?");
    }
    return address;
}

Driver.compareAdresses = function(a1, a2){
    return (a1.address === a2.address);
}

Driver.prototype.getBroadcastAddress = function(){
    return BROADCAST_ADDR;
}

exports.Driver = Driver;