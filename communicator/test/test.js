/*jshint esversion: 6 */

var should = require('should');

var Communicator = require("../communicator");
var Driver = require("./test_driver");

describe('Communicator', function() {
    var driver1, driver2;

    before('Instanciation of drivers', (done) => {
        Driver.createDriver({id: 0}, (err, driver) => {
            driver1 = driver;
            Driver.createDriver({id: 1}, (err, driver) => {
                driver2 = driver;
                done();
            });
        });
    });

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


    describe('#send()', () => {

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
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.iamcontroller, yourId: 10 }, (err) => {
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
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.iamcontroller, yourId: 20, data: []}, (err) => {
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
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.describeyourself, yourId: 20, data: []}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                    id: 0, nodeClass: Communicator.NODE_CLASSES.sensor, dataType: [{
                        id:  5, measureStrategy: 1, type: 1, range: [0, 50], unit: 'C', dataCategory: 1
                    }] }, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                id: 3, nodeClass: Communicator.NODE_CLASSES.sensor }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in description for sensor', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                    id: 3, nodeClass: Communicator.NODE_CLASSES.sensor, dataType: [{
                        id:  5, measureStrategy: 1, type: 1, range: [0, 50], unit: "m", dataCategory: 1
                    }], commandType: []}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in description for actuator', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                    id: 0, nodeClass: "actuator", commandType: [{
                        id:  5, type: 1, unit: "", range: [0, 50], commandCategory: 1
                    }] }, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in description for actuator', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                id: 3, nodeClass: Communicator.NODE_CLASSES.actuator }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in description for actuator', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.description,
                    id: 3, nodeClass: Communicator.NODE_CLASSES.actuator, commandType: [{
                        id:  5, type: 1, unit: "", range: [0, 50], commandCategory: 1
                    }], dataType: []}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in data', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.data,
                    id: 0, data: [
                        { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
                    ]}, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in data', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.data,
                data: [
                        { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
                    ]}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in data', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.data,
                    id: 3, nodeClass: Communicator.NODE_CLASSES.actuator, data: [
                        { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
                    ]}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in command', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.command,
                    command: [
                        { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
                    ]}, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in command', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.command
                }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in command', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.command,
                    id: 3, command: [
                        { id:0, value: 0}, { id:1, value: 3.8}, { id: 2, value: "person"}
                    ]}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in lifetime', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.lifetime,
                    lifetime: 500}, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in lifetime', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.lifetime
                }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in lifetime', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.lifetime,
                    id: 3, lifetime: 100 }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in keepalive', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.keepalive,
                    id: 500}, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in keepalive', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.keepalive
                }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in keepalive', (done) => {
                node1.send(getDriver2Address(), { packageType: Communicator.PACKAGE_TYPES.keepalive,
                    id: 3, lifetime: 100 }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in iamback', (done) => {
                node1.send(getDriver2Address(), { packageType: 'iamback',
                    id: 500 }, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in iamback', (done) => {
                node1.send(getDriver2Address(), { packageType: 'iamback'
                }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in iamback', (done) => {
                node1.send(getDriver2Address(), { packageType: 'iamback',
                    id: 3,  command: [ { id: 1, value: 0.5 } ] }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in welcomeback', (done) => {
                node1.send(getDriver2Address(), { packageType: 'welcomeback',
                    }, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check not required fields in welcomeback', (done) => {
                node1.send(getDriver2Address(), { packageType: 'welcomeback',
                    id: 3 }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });

            it('should check required fields in externalcommand', (done) => {
                node1.send(getDriver2Address(), { packageType: 'externalcommand',
                    id: 500, command: [ { id: 1, value: 0.5 } ] }, (err) => {
                    should(err).not.be.Error();
                    done();
                });
            });
            it('should check missing fields in externalcommand', (done) => {
                node1.send(getDriver2Address(), { packageType: 'externalcommand',
                    id: 50}, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            it('should check not required fields in externalcommand', (done) => {
                node1.send(getDriver2Address(), { packageType: 'externalcommand',
                    id: 3,  command: [ { id: 1, value: 0.5 } ], lifetime: 100 }, (err) => {
                    should(err).be.Error();
                    done();
                });
            });
            

        });

    });

     describe('#sendBroadcast()', () => {

        it('should execute without error', (done) => {
            node1.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.whoiscontroller}, (err) => {
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
            node1.listen(() => {}, 'data', null, (err) => {
                should(err).not.be.Error();
                done();
            });
        });
        it('should allow multiple packageTypes', (done) => {
            node1.listen(() => {}, [Communicator.PACKAGE_TYPES.data, Communicator.PACKAGE_TYPES.description], null, (err) => {
                should(err).not.be.Error();
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
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 0, data: [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
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
            }, 'data', null, (err) => {
                should(err).not.be.Error();
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 0, data: [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
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
                node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.iamcontroller, yourId: 2}, (err) => {
                    should(err).not.be.Error();
                    node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.whoiscontroller }, (err) => {
                        should(err).not.be.Error();
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 0, 'data': [ { 'id': 0, 'value': 'Test Data2'}] }, (err) => {
                            should(err).not.be.Error();
                        });
                    });
                });
            });
        });

        it('should receive only one message (filtering by address)', (done) => {

            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                done();
            }, null, getDriver2Address(), (err) => {
                Driver.createDriver({id: 2}, (err, tempDriver) => {
                    var tempNode =  new Communicator.Communicator(tempDriver);
                    should(err).not.be.Error();
                    tempNode.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.iamcontroller, yourId: 3 }, (err) => {
                        should(err).not.be.Error();
                        node1.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.whoiscontroller }, (err) => {
                            should(err).not.be.Error();
                            node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 3, data: [ { id: 0, value: 'Test'}] }, (err) => {
                                should(err).not.be.Error();
                                tempNode.close();
                            });
                        });
                    });
                });
            });
        });

        it('should receive only one message (filtering by package type and address)', (done) => {

            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                done();
            }, Communicator.PACKAGE_TYPES.data, getDriver2Address(), (err) => {
                Driver.createDriver({id: 2}, (err, tempDriver) => {
                    var tempNode =  new Communicator.Communicator(tempDriver);
                    should(err).not.be.Error();
                    tempNode.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, nodeClass: 1, id: 0, 'dataType': [ ]}, (err) => {
                        should(err).not.be.Error();
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.command, 'command': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                            should(err).not.be.Error();
                            node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 1, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                                should(err).not.be.Error();
                                tempNode.close();
                            });
                        });
                    });
                });
            });
        });

        it('should call two callbacks from package of two types', (done) => {
            var listened = false;
            node1.listen((msg, from) => {
                should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value | Communicator.PACKAGE_TYPES.data.value);
                should(from).be.equal(getDriver2Address());
                should(msg.data[0].value).be.equal("Test");
                if (listened)
                    done();
                else
                    listened = true;
            }, Communicator.PACKAGE_TYPES.description, null, (err) => {
                should(err).not.be.Error();
                node1.listen((msg, from) => {
                    should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.description.value | Communicator.PACKAGE_TYPES.data.value);
                    should(from).be.equal(getDriver2Address());
                    should(msg.data[0].value).be.equal("Test");
                    if (listened)
                        done();
                    else
                        listened = true;
                }, Communicator.PACKAGE_TYPES.data, null, (err) => {
                    should(err).not.be.Error();
                    node2.send(getDriver1Address(), { 'packageType': 'data | description', id: 0, nodeClass: 1, dataType: [], 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                        should(err).not.be.Error();
                    });
                });
            });
        });

        it('should receive two messages from different types on the same callback', (done) => {
            var listened = false;
            node1.listen((msg, from) => {
                should(msg.id).be.equal(1);
                if (listened)
                    done();
                else
                    listened = true;
            }, Communicator.PACKAGE_TYPES.data | Communicator.PACKAGE_TYPES.description, null, (err) => {
                Driver.createDriver({id: 2}, (err, tempDriver) => {
                    var tempNode =  new Communicator.Communicator(tempDriver);
                    should(err).not.be.Error();
                    tempNode.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.description, nodeClass: 1, id: 1, 'dataType': [ ]}, (err) => {
                        should(err).not.be.Error();
                        node2.send(getDriver1Address(), { 'packageType': Communicator.PACKAGE_TYPES.data, id: 1, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                            should(err).not.be.Error();
                        });
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
                node2.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.data, id: 5, 'data': [ { 'id': 0, 'value': 'Test Data'}] }, (err) => {
                    should(err).not.be.Error();
                });
            });
        });

        it('should broadcast a message to multiple nodes correctly', (done) => {
            Driver.createDriver({id: 2}, (err, tempDriver) => {
                var tempNode =  new Communicator.Communicator(tempDriver);
                var called = false;
                node1.listen((msg, from) => {
                    should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                    should(from).be.equal(getDriver2Address());
                    should(msg.data[0].value).be.equal("Test");
                    if (!called)
                        called = true;
                    else
                        done();
                }, null, null, (err) => {
                    should(err).not.be.Error();
                    tempNode.listen((msg, from) => {
                        should(msg.packageType).be.equal(Communicator.PACKAGE_TYPES.data.value);
                        should(from).be.equal(getDriver2Address());
                        should(msg.data[0].value).be.equal("Test");
                        if (!called)
                            called = true;
                        else
                            done();
                    }, null, null, (err) => {
                            node2.sendBroadcast({ 'packageType': Communicator.PACKAGE_TYPES.data, id: 5, 'data': [ { 'id': 0, 'value': 'Test'}] }, (err) => {
                                should(err).not.be.Error();
                        });
                    });
                });
            });
        });

    });
});
