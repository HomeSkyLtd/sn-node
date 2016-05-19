
// Hold connections
var connections = [];


function Driver (params, callback) {
    this._id = params.id;
    connections[params.id] = this;
    if (callback) callback(null, this);
}


function createDriver(params, callback) {
    new Driver(params, callback);
}


Driver.prototype.listen = function (msgCallback, listenCallback) {
    if (this._listen) {
        if (listenCallback) listenCallback(Error("Already listening"));
        return;
    }
    this._listen = msgCallback;
    if (listenCallback) listenCallback(null);

};

/*
    Stops listening for messages
*/
Driver.prototype.stop = function () {
    if (!this._listen)
        throw Error("Not listening to Stop");
    delete this._listen;
};

/*
    Closes driver
*/
Driver.prototype.close = function () {
    if (this._listen)
        delete this._listen;
};

/*
    Sends a message to address
*/
Driver.prototype.send = function (to, message, callback) {
    if (to === -1) {
        //Broadcast
        for (var i in connections) {
            if (i !== this._id && connections[i]._listen) {
                connections[i]._listen(message, this._id);
            }
        }
    }
    else if (connections[to]._listen) {
        //Send message: target is listening
        connections[to]._listen(message, this._id);

    }
    else {
        //Target not listening: do nothing
    }
    if (callback) callback();
};

Driver.prototype.getBroadcastAddress = function () {
    return -1;
};


Driver.prototype.compareAddresses = function (address1, address2) {
    return address1 == address2;
};

exports.createDriver = createDriver;
exports.compareAddresses = Driver.prototype.compareAddresses;
