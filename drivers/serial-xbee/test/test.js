/*jshint esversion: 6 */

var driver = require("../driver.js");
var should = require("should");

describe('serial-xbee', function(){
    this.timeout(3000);
    describe('hooks', function(){
        var xbeeDriver;

        //clean driver before each test
        beforeEach('Closing and cleaning driver', function(){
            if(xbeeDriver) xbeeDriver.close();
            xbeeDriver = null;
        });

        describe('#listen()', function(){
            it('should execute without errors', function(done){
                driver.createDriver({tty_port: "/dev/ttyUSB0"}, function(err, driverInstance){
                    xbeeDriver = driverInstance;
                    if (err) err.should.not.be.Error();
                    xbeeDriver.listen(
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
                    from.address.toUpperCase().should.be.exactly("0013A20040A165B1");
                    String(msg).should.be.exactly("Test");
                    done();
                }

                driver.createDriver({tty_port: "/dev/ttyUSB0"}, (err, driverInstance)=>{
                    xbeeDriver = driverInstance;
                    if (err) err.should.not.be.Error();
                    xbeeDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver({tty_port: "/dev/ttyUSB1"}, (err, driverInstance2)=>{
                                    xbeeSender = driverInstance2;
                                    if(err) done(err);
                                    xbeeSender.send({address: "0013A20040B0783F"}, new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        xbeeSender.close();
                                        xbeeSender = null;
                                    });
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
                    from.address.toUpperCase().should.be.exactly("0013A20040A165B1");
                    String(msg).should.be.exactly("Test");
                    done();
                }

                driver.createDriver({tty_port: "/dev/ttyUSB0"}, function(err, driverInstance){
                    xbeeDriver = driverInstance;
                    xbeeDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver({tty_port: "/dev/ttyUSB1"}, (err, driverInstance2)=>{
                                    xbeeSender = driverInstance2;
                                    if(err) done(err);
                                    xbeeSender.send(xbeeDriver.getBroadcastAddress(), new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        xbeeSender.close();
                                        xbeeSender = null;
                                    });
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
                    from.address.toUpperCase().should.be.exactly("0013A20040A165B1");
                    String(msg).should.be.exactly("Reply");
                    done();
                }

                xbeeDriver = driver.createDriver({tty_port: "/dev/ttyUSB0"}, function(err, driverInstance){
                    if(err) done(err);
                    xbeeDriver = driverInstance;
                    xbeeDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                driver.createDriver({tty_port: "/dev/ttyUSB1"}, (err, driverInstance2)=>{
                                    xbeeDriver2 = driverInstance2;
                                    if(err) done(err);
                                    var msgCallback2 = function(msg, from){
                                        from.address.toUpperCase().should.be.exactly("0013A20040B0783F");
                                        String(msg).should.be.exactly("Test");
                                        xbeeDriver2.send(from, new Buffer.from("Reply"), (err)=>{
                                            if(err) done(err);
                                            xbeeDriver2.close();
                                            xbeeDriver2 = null;
                                        });
                                    };
                                    xbeeDriver2.listen(
                                        msgCallback2,
                                        (err) => {
                                            if(err) done(err);
                                            else{
                                                xbeeDriver.send({address: "0013A20040A165B1"}, new Buffer.from("Test"), function (err) {
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

        describe('#stop()', function(){
            it('server should stop listening', function(done){
                function msgCallback(msg, from){
                    done(new Error("Unexpected call to msgCallback"));
                }

                function successCallback(){
                    done();
                }

                driver.createDriver({tty_port: "/dev/ttyUSB0"}, function(err, driverInstance){
                    xbeeDriver = driverInstance;
                    xbeeDriver.listen(
                        msgCallback,
                        (err) => {
                            if(err) done(err);
                            else{
                                xbeeDriver.stop();
                                driver.createDriver({tty_port: "/dev/ttyUSB1"}, (err, driverInstance2)=>{
                                    xbeeSender = driverInstance2;
                                    if(err) done(err);
                                    xbeeSender.send({address: "0013A20040B0783F"}, new Buffer.from("Test"), (err)=>{
                                        if(err) done(err);
                                        xbeeSender.close();
                                        xbeeSender = null;
                                    });
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
                a1 = {address: "0013A20040B0783F"};
                a2 = {address: "13A20040B0783F"};
                a3 = {address: "1013A20040B0783F"};
                driver.createDriver({tty_port: "/dev/ttyUSB0"}, (err, xbeeDriver) =>{
                    xbeeDriver.constructor.compareAddresses(a1,a2).should.be.true();
                    xbeeDriver.constructor.compareAddresses(a1,a3).should.be.false();
                    xbeeDriver.constructor.compareAddresses(a2,a3).should.be.false();
                    done();
                });
            });
        });
    });

});
