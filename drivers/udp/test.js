var driver = require("./driver.js");
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
                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){});
                udpDriver.listen(
                    ()=>{},
                    (err) => {
                        if(err) done(err);
                        else done();
                    }
                );
            });
        });

        describe('#send()', function(){
            it('should send message correctly to server', function(done){
                function msgCallback(msg, from){
                    from.port.should.be.exactly(4567);
                    String(msg).should.be.exactly("Test");
                    done();
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){});
                udpDriver.listen(
                    msgCallback,
                    (err) => {
                        if(err) done(err);
                        else{
                            udpDriver.send({address: "localhost", port:4567}, new Buffer("Test"), function (err) {
                                if (err) done(err);
                            });
                        }
                    }
                );
            });
        });

        describe('#send() and #getBroadcastAddress()', function(){
            it('should broadcast message correctly', function(done){
                function msgCallback(msg, from){
                    from.port.should.be.exactly(4567);
                    String(msg).should.be.exactly("Test");
                    done();
                }

                udpDriver = new driver.Driver({rport:4567, broadcast_port: 4567}, function(err){});
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

        describe('#compareAddresses()', function(){
            it('should compare addresses correctly', function(done){
                a1 = {address: "192.168.1.1", port: 1234};
                a2 = {address: "192.168.1.1", port: 1235};
                a3 = {address: "192.168.1.2", port: 1234};
                driver.Driver.compareAddresses(a1,a2).should.be.equal.true;
                driver.Driver.compareAddresses(a1,a3).should.be.equal.false;
                driver.Driver.compareAddresses(a2,a3).should.be.equal.false;
                done();
            });
        });
    });


})
