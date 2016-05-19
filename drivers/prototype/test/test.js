/*jshint esversion: 6 */

/* Path to your driver */
var driver = require("../driver.js");

var should = require("should");

/*
    The test comprises sending and receiving data between two driver instances, one acting
    as a server (receiver) and one as the sender. Obhects receiverParams and senderParams
    are passed as arguments on the initialization of these drivers.
*/
var receiverParams = {
    /*
        parameters for the server driver constructor goes here
        e.g.: {address: XX, port: YY}
    */
};

var senderParams = {
    /*
        parameters for the sender driver constructor goes here
        e.g.: {address: XX, port: YY}
    */
};

/*
    When sending a test packet, serverAddress is passed as the "to" argument of
    send()
*/
var serverAddress = {/* Server address goes here */};

describe('networkDriver', function(){
    describe('hooks', function(){
        var receiverDriver;

        //clean Driver before each test
        beforeEach('Closing and cleaning driver', function(){
            if(receiverDriver) receiverDriver.close();
            receiverDriver = null;
        });

        //Check whether the driver starts listening without raising any errors
        describe('#listen()', function(){
            it('should execute without errors', function(done){
                driver.createDriver(receiverParams, function(err, receiverDriver){
                    if (err) err.should.not.be.Error();
                    receiverDriver.listen(
                        ()=>{},
                        (err) => {
                            if(err) done(err);
                            else done();
                        }
                    );
                });
            });
        });

        describe('#send()', function(){
            it('should send message correctly to server', function(done){
                /*
                    Add whatever arguments are passed to the callback when your
                    driver receives a message
                */
                function msgCallback(/*Add arguments here*/){
                    /*
                        Check if the message you sent was received correctly, for instance:
                        from.port.should.be.exactly(4567);
                        String(msg).should.be.exactly("Test");
                    */
                    done();
                }

                driver.createDriver(senderParams, (err, receiverDriver)=>{
                    if (err) err.should.not.be.Error();
                    receiverDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver(senderParams, (err, senderDriver)=>{
                                    if(err) done(err);
                                    senderDriver.send(serverAddress, new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        senderDriver.close();
                                        senderDriver = null;
                                    });
                                });
                            }
                        }
                    );
                });

            });
        });

        /*
            getBroadcastAddress() should return the broadcast address for the
            server correctly. Notice that the format returned by this method
            should be compatible with the "to" argument of send()
        */
        describe('#send() and #getBroadcastAddress()', function(){
            it('should broadcast message correctly', function(done){
                /*
                    Add whatever arguments are passed to the callback when your
                    driver receives a message
                */
                function msgCallback(/*Add arguments here*/){
                    /*
                        Check if the message you sent was received correctly, for instance:
                        from.port.should.be.exactly(4567);
                        String(msg).should.be.exactly("Test");
                    */
                    done();
                }

                driver.createDriver(receiverParams, function(err, receiverDriver){
                    receiverDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver(senderParams, (err, senderDriver)=>{
                                    if(err) done(err);
                                    senderDriver.send(receiverDriver.getBroadcastAddress(), new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        senderDriver.close();
                                        senderDriver = null;
                                    });
                                });
                            }
                        }
                    );
                });

            });
        });

        /*
            Check if it is possible to reply to a received message. In other words,
            it should be possible to call send() using as destination the "from" parameter
            received in the msgCallback of listen(). In this test, we keep the naming of
            both receiverDriver and senderDriver, but they will both be used to send and
            receive messages.
            -receiverDriver will send a message to senderDriver;
            -senderDriver will reply to this message based on the "from" parameter
            -receiverDriver will check the reply, terminating the test
        */
        describe('#send() as a reply to a received message', function(){
            it('should reply to messages correctly', function(done){
                function msgCallback(msg, from){
                    /*
                        Check if the reply was received correctly, for instance:
                        from.port.should.be.exactly(4567);
                        String(msg).should.be.exactly("Reply");
                    */
                    done();
                }

                new driver.createDriver(receiverParams, function(err, receiverDriver){
                    if(err) done(err);
                    receiverDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver(senderParams, (err, senderDriver)=>{
                                    if(err) done(err);
                                    var msgCallback2 = function(msg, from){
                                        senderDriver.send(from, new Buffer.from("Reply"), (err)=>{
                                            if(err) done(err);
                                            senderDriver.close();
                                            senderDriver = null;
                                        });
                                    };
                                    senderDriver.listen(
                                        msgCallback2,
                                        (err) => {
                                            if(err) done(err);
                                            else{
                                                senderDriver.send(serverAddress, new Buffer.from("Test"), function (err) {
                                                    if (err) done(err);
                                                });
                                            }
                                        }
                                    );
                                });
                            }
                        }
                    );
                });

            });
        });

        /*
            Calling stop() should make the callback passed in listen() not be
            called when a message arrives
        */
        describe('#stop()', function(){
            it('server should stop listening', function(done){
                var timer = null;
                /*
                    This function should not be called after stop() has been called
                */
                function msgCallback(/* May be left empty */){
                    done(new Error("Unexpected call to msgCallback"));
                }

                function successCallback(){
                    clearTimeout(timer);
                    done();
                }

                driver.createDriver(receiverParams, function(err, receiverDriver){
                    receiverDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                receiverDriver.stop();
                                driver.createDriver(senderParams, (err, senderDriver)=>{
                                    if(err) done(err);
                                    senderDriver.send(serverAddress, new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        senderDriver.close();
                                        senderDriver = null;
                                    });
                                });
                                //should not get any calls to msgCallback
                                //wait one second for response to ensure correctness
                                timer = setTimeout(successCallback, 1000);
                            }
                        }
                    );
                });
            });
        });

        /*
            Compare two addresses
        */
        describe('#compareAddresses()', function(){
            it('should compare addresses correctly', function(done){
                /*
                    Add examples of addresses that are supposed to identify the
                    same device. For instance, a device using UDP is identified
                    by its IP address, whereas it may use different ports when
                    sending a packet. The test could be represented as

                    a1 = {address: "192.168.1.1", port: 1234};
                    a2 = {address: "192.168.1.1", port: 1235};
                    a3 = {address: "192.168.1.2", port: 1234};
                    driver.compareAddresses(a1,a2).should.be.true();
                    driver.compareAddresses(a1,a3).should.be.false();
                    driver.compareAddresses(a2,a3).should.be.false();

                */

                done();
            });
        });
    });


});
