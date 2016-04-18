/*jshint esversion: 6 */

var driver = require("../driver.js");
var should = require("should");

describe('udp', function(){
    describe('hooks', function(){
        var udpDriver;

        //clean udpDriver before each test
        beforeEach('Closing and cleaning udp driver', function(){
            if(udpDriver) udpDriver.close();
            udpDriver = null;
        });

        describe('#listen()', function(){
            it('should execute without errors', function(done){
                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){
                    if (err) err.should.not.be.Error();
                    udpDriver.listen(
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
                function msgCallback(msg, from){
                    from.port.should.be.exactly(4567);
                    String(msg).should.be.exactly("Test");
                    done();
                }

                //use this function if you want to test sending with a different socket
                function sendMessage(to, msg){
                    sender = new driver.Driver({rport: 4568, broadcast_port:4568}, (err)=>{
                        if(err) done(err);
                        sender.send(to, msg, (err)=>{
                            if(err) done(err);
                            sender.close();
                        });
                    });
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, (err)=>{
                    if (err) err.should.not.be.Error();
                    udpDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                udpDriver.send({address: "localhost", port:4567}, new Buffer("Test"), (err)=>{
                                    if(err) done(err);
                                });
                            }
                        }
                    );
                });

            });
        });

        describe('#send() and #getBroadcastAddress()', function(){
            it('should broadcast message correctly', function(done){
                function msgCallback(msg, from){
                    from.port.should.be.exactly(4567);
                    String(msg).should.be.exactly("Test");
                    done();
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){
                    udpDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                udpDriver.send(udpDriver.getBroadcastAddress(), new Buffer("Test"), function (err) {
                                    if (err) done(err);
                                });
                            }
                        }
                    );
                });

            });
        });

        describe('#send() as a reply to a received message', function(){
            it('should reply to messages correctly', function(done){
                function msgCallback(msg, from){
                    from.port.should.be.exactly(4568);
                    String(msg).should.be.exactly("Reply");
                    done();
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){
                    udpDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                var udpDriver2 = new driver.Driver({rport:4568, broadcast_port: 4567});
                                var msgCallback2 = function(msg, from){
                                    from.port.should.be.exactly(4567);
                                    String(msg).should.be.exactly("Test");
                                    udpDriver2.send(from, new Buffer("Reply"), (err)=>{
                                        if(err) done(err);
                                    });
                                };
                                udpDriver2.listen(
                                    msgCallback2,
                                    (err) => {
                                        if(err) done(err);
                                        else{
                                            udpDriver.send({address:"localhost", port:4568}, new Buffer("Test"), function (err) {
                                                if (err) done(err);
                                            });
                                        }
                                    }
                                )

                            }
                        }
                    );
                });

            });
        });

        describe('#stop()', function(){
            it('server should stop listening', function(done){
                function msgCallback(msg, from){
                    done(new Error("Unexpected call to msgCallback"));
                }

                function successCallback(){
                    done();
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){
                    udpDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                udpDriver.stop();
                                udpDriver.send(udpDriver.getBroadcastAddress(), new Buffer("Test"), function (err) {
                                    if (err) done(err);
                                });
                                //should not get any calls to msgCallback
                                //wait one second for response to ensure correctness
                                setTimeout(successCallback, 1000);
                            }
                        }
                    );
                });
            });
        });

        describe('#compareAddresses()', function(){
            it('should compare addresses correctly', function(done){
                a1 = {address: "192.168.1.1", port: 1234};
                a2 = {address: "192.168.1.1", port: 1235};
                a3 = {address: "192.168.1.2", port: 1234};
                driver.Driver.compareAddresses(a1,a2).should.be.true();
                driver.Driver.compareAddresses(a1,a3).should.be.false();
                driver.Driver.compareAddresses(a2,a3).should.be.false();
                done();
            });
        });
    });


});
