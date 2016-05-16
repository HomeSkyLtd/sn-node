/*jshint esversion: 6 */

var driver = require("../driver.js");
var should = require("should");

describe('tcp', function(){
    var tcpDriver1, tcpDriver2;

    //clean tcpDriver before each test
    beforeEach('Closing and cleaning tcp driver', function(){
        if (tcpDriver1) 
            tcpDriver1.close();
        if (tcpDriver2)
            tcpDriver2.close();
        tcpDriver1 = null;
        tcpDriver2 = null;
    });

    describe('#listen()', function(){
        it('should execute without errors', function(done){
            driver.createDriver({rport:4567, broadcast_port: 4567}, function(err, driverInstance){
                tcpDriver1 = driverInstance;
                if (err) err.should.not.be.Error();
                tcpDriver1.listen(
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
                from.port.should.be.exactly(4568);
                String(msg).should.be.exactly("Test");
                done();
            }

            //use this function if you want to test sending with a different socket
            function sendMessage(to, msg){
                driver.createDriver({rport: 4568, broadcast_port:4568}, (err, driverInstance)=>{
                    tcpDriver2 = driverInstance;
                    tcpDriver2.listen(()=>{}, () => {
                        if(err) done(err);
                        tcpDriver2.send(to, msg, (err)=>{
                            if(err) done(err);
                        });
                    });
                });
            }
            driver.createDriver({rport:4567, broadcast_port: 4567}, (err, driverInstance)=>{
                tcpDriver1 = driverInstance;
                if (err) err.should.not.be.Error();
                tcpDriver1.listen(
                    msgCallback,
                    (err) => {
                        if(err) done(err);
                        else{
                            sendMessage({address: "localhost", port: 4567}, Buffer.from("Test"));
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

            driver.createDriver({rport:4567, broadcast_port: 4567, udplisten: true}, function(err, driverInstance){
                tcpDriver1 = driverInstance;
                tcpDriver1.listen(
                    msgCallback,
                    (err) => {
                        if(err) done(err);
                        else{
                            tcpDriver1.send(tcpDriver1.getBroadcastAddress(), Buffer.from("Test"), function (err) {
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

            driver.createDriver({rport:4567, broadcast_port: 4567}, function(err, driverInstance){
                tcpDriver1 = driverInstance;
                tcpDriver1.listen(
                    msgCallback,
                    (err) => {
                        if(err) done(err);
                        else{
                            driver.createDriver({rport:4568, broadcast_port: 4567}, (err, driverInstance2)=>{
                                if(err) done(err);
                                tcpDriver2 = driverInstance2;
                                var msgCallback2 = function(msg, from){
                                    from.port.should.be.exactly(4567);
                                    String(msg).should.be.exactly("Test");
                                    tcpDriver2.send(from, Buffer.from("Reply"), (err)=>{
                                        if(err) done(err);
                                    });
                                };
                                tcpDriver2.listen(
                                    msgCallback2,
                                    (err) => {
                                        if(err) done(err);
                                        else{
                                            tcpDriver1.send({address:"localhost", port:4568}, Buffer.from("Test"), function (err) {
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

             driver.createDriver({rport:4567, broadcast_port: 4567}, function(err, driverInstance){
                tcpDriver1 = driverInstance;
                tcpDriver1.listen(
                    msgCallback,
                    (err) => {
                        if(err) done(err);
                        else{
                            tcpDriver1.stop();
                            tcpDriver1.send(tcpDriver1.getBroadcastAddress(), Buffer.from("Test"), function (err) {
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
            driver.createDriver({rport:4567, broadcast_port: 4567}, function(err, driverInstance){
                tcpDriver1 = driverInstance;
                tcpDriver1.constructor.compareAddresses(a1,a2).should.be.true();
                tcpDriver1.constructor.compareAddresses(a1,a3).should.be.false();
                tcpDriver1.constructor.compareAddresses(a2,a3).should.be.false();
                done();
            });
        });
    });
});
