var should = require('should');

var Communicator = require("../communicator");
var Driver = require("./test_driver");

describe('Communicator', function() {

    

    var driver1 = new Driver.Driver({id: 0});
    var driver2 = new Driver.Driver({id: 1});

    var node1 = null;
    var node2 = null;

    function clearNodes() {
        if (node1) node1.close();
        node1 = new Communicator.Communicator(driver1);
        if (node2) node2.close();
        node2 = new Communicator.Communicator(driver2);
    }

    function getDriver1Address() {
        return 0;
    }

    function getDriver2Address() {
        return 1;
    }


    beforeEach('Closing and cleaning Communicator', () => {
        clearNodes();
    });


    describe.only('#send()', () => {

        it('should execute without error', (done) => {
            node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, (err) => {
                should(err).not.be.Error();     
                done();
            });
        });
        it('should not allow sending package without packageType', (done) => {
            node1.send(getDriver2Address(), {}, (err) => {
                should(err).be.Error();  
                done();  
            });
        });
        it('should allow packages with multiple package types', (done) => {
            node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.data | 
            Communicator.PACKAGE_TYPES.command, id: 0, command: [], data: []  }, (err) => {
                should(err).not.be.Error();
                done();
            });
        });
        describe("#Check fields", () => {
            it('should check required fields in whoiscontroller', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.whoiscontroller}, (err) => {
                    should(err).not.be.Error();     
                    done();
                });
            });
             it('should check not required fields in whoiscontroller', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.whoiscontroller, id: 10}, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });

            it('should check required fields in iamcontroller', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.iamcontroller, yourid: 10 }, (err) => {
                    should(err).not.be.Error();     
                    done();
                });
            });
            it('should check missing fields in iamcontroller', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.iamcontroller }, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });
            it('should check not required fields in iamcontroller', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.iamcontroller, yourid: 20, data: []}, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });

            it('should check required fields in describeyourself', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.describeyourself}, (err) => {
                    should(err).not.be.Error();     
                    done();
                });
            });
            it('should check not required fields in describeyourself', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.describeyourself, yourid: 20, data: []}, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });

            it('should check required fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description, 
                    nodeClass: Communicator.NODE_CLASSES.sensor, dataType: [{
                        id:  5, measureStrategy: 1, type: 1, range: [0, 50], dataCategory: 1
                    }] }, (err) => {
                    should(err).not.be.Error();     
                    done();
                });
            });
            it('should check missing fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                nodeClass: Communicator.NODE_CLASSES.sensor }, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });
            it('should check not required fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description, 
                    nodeClass: Communicator.NODE_CLASSES.sensor, dataType: [{
                        id:  5, measureStrategy: 1, type: 1, range: [0, 50], dataCategory: 1
                    }] data: []}, (err) => {
                    should(err).be.Error();     
                    done();
                });
            });

        });

    });

     describe('#sendBroadcast()', () => {

        it('should execute without error', (done) => {
            node1.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.data}, (err) => {
                should(err).not.be.Error();    
                done();
            });
        });
        it('should not allow sending package without packageType', (done) => {
            node1.sendBroadcast({}, (err) => {
                should(err).be.Error();    
                done();
            });
        });
    });

    describe('#listen()', () => {
        it('should execute without error', (done) => {
            node1.listen(() => {}, null, null, (err) => {
                should(err).not.be.Error();    
                done();
            });
        });
        it('should allow one packageType', (done) => {
            node1.listen(() => {}, Communicator.PACKAGE_TYPES.data, null, (err) => {
                should(err).not.be.Error();  
                done();  
            });
        });
        it('should not allow invalid packageType', (done) => {
            node1.listen(() => {}, -1, null, (err) => {
                should(err).be.Error();    
                done();
            });
        });
        it('should allow multiple packageTypes', (done) => {
            node1.listen(() => {}, [Communicator.PACKAGE_TYPES.data, Communicator.PACKAGE_TYPES.description], null, (err) => {
                should(err).not.be.Error();    
                done();
            });
        });
        it('should not allow multiple invalid packageTypes', (done) => {
            node1.listen(() => {}, [Communicator.PACKAGE_TYPES.data, -7], null, (err) => {
                should(err).be.Error();    
                done();
            });
        });
        it('should allow one address', (done) => {
            node1.listen(() => {}, null, getDriver2Address(), (err) => {
                should(err).not.be.Error();  
                done();  
            });
        });
        it('should allow multiple addresses', (done) => {
            node1.listen(() => {}, null, [getDriver2Address(), getDriver1Address()], (err) => {
                should(err).not.be.Error();  
                done();  
            });
        });
    });

    describe("#send() and #listen()", () => {

        it('should send a message correctly', (done) => {
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test Data");
                done();
            }, null, null, (err) => {
                should(err).not.be.Error();    
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();    
                });
            });
        });

        it('should receive message from specific package type', (done) => {
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test Data");
                done();
            }, Communicator.PACKAGE_TYPES.data, null, (err) => {
                should(err).not.be.Error();    
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();    
                });
            });
        });

        it('should receive only one message (filtering by package type)', (done) => {
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test Data2");
                done();
            }, [Communicator.PACKAGE_TYPES.data], null, (err) => {
                should(err).not.be.Error();    
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();
                    node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.command, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                        should(err).not.be.Error();   
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, 'data': [ { 'id': 0, 'value': 'Test Data2'}] }, (err) => {
                            should(err).not.be.Error();    
                        }); 
                    });
                });
            });
        });

        it('should receive only one message (filtering by address)', (done) => {

            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                done();
            }, null, getDriver2Address(), (err) => {
                var tempDriver = new Driver.Driver({id: 2});
                var tempNode =  new Communicator.Communicator(tempDriver); 
                should(err).not.be.Error();    
                tempNode.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();
                    node1.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.command, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                        should(err).not.be.Error();   
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                            should(err).not.be.Error();  
                            tempNode.close();  
                        }); 
                    });    
                });
            });
        });

        it('should receive only one message (filtering by package type and address)', (done) => {

            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                done();
            }, Communicator.PACKAGE_TYPES.description, getDriver2Address(), (err) => {
                var tempDriver = new Driver.Driver({id: 2});
                var tempNode =  new Communicator.Communicator(tempDriver); 
                should(err).not.be.Error();    
                tempNode.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();
                    node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.command, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                        should(err).not.be.Error();   
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                            should(err).not.be.Error();  
                            tempNode.close();  
                        }); 
                    });    
                });
            });
        });

        it('should call two callbacks from package of two types', (done) => {
            var listened = false;
            console.log("EITA");
            node1.listen((msg, from) => {
                console.log("RECEIVE 1");
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value | Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                if (listened)
                    done();
                else
                    listened = true;
            }, Communicator.PACKAGE_TYPES.description, null, (err) => {
                console.log("EITA2");
                should(err).not.be.Error();    
                node1.listen((msg, from) => {
                    console.log("RECEIVE 2");
                    should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value | Communicator.PACKAGE_TYPES.data.value);
                    should(from).be.equal(getDriver2Address());
                    should(msg.data[0].value).be.equal("Test");
                    if (listened)
                        done();
                    else
                        listened = true;
                }, Communicator.PACKAGE_TYPES.data, null, (err) => {
                    console.log("EITA3");
                    should(err).not.be.Error();    
                    node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data | Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                        should(err).not.be.Error();  
                        console.log("SEND");
                    }); 
                });    
            });
        });
    });

    describe("#sendBroadcast() and #listen()", () => {

        it('should broadcast a message correctly', (done) => {
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test Data");
                done();
            }, null, null, (err) => {
                should(err).not.be.Error();    
                node2.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.data, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();    
                });
            });
        });

        it('should broadcast a message to multiple nodes correctly', (done) => {
            var tempDriver = new Driver.Driver({id: 2});
            var tempNode =  new Communicator.Communicator(tempDriver); 
            var called = false;
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                if (!called)
                    called = true;
                else
                    done();
            }, null, null, (err) => {
                should(err).not.be.Error();    
                tempNode.listen((msg, from) => {
                    should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value);
                    should(from).be.equal(getDriver2Address());
                    should(msg.data[0].value).be.equal("Test");
                    if (!called)
                        called = true;
                    else
                        done();
                }, null, null, (err) => {
                        node2.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.description, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                    });
                });
            });
        });

    });
});

