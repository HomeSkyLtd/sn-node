/*jshint esversion: 6*/

var Driver = require("rainfall-tcp");
var Leaf = require("rainfall-leaf");

const readline = require('readline');


const MIN_TEMPERATURE = 0;
const MAX_TEMPERATURE = 28;
//Creates the TCP driver
// This driver represents a sensor that listens controller messages.
var state = 0;
Driver.createDriver({ }, function(err, driver) {
    if (err) console.log(err);
    else {
        Leaf.createLeaf(
            driver,
            {
                commandType: [
                    {
                        id: 1,
                        type: "bool",
                        range: [0, 1],
                        commandCategory: "toggle",
                        unit: ""
                    },
                    {
                        id: 2,
                        type: "real",
                        range: [MIN_TEMPERATURE, MAX_TEMPERATURE],
                        commandCategory: "temperature",
                        unit: "°C"
                    }
                ],
                dataType: [
                    {
                        id: 3,
                        type: "real",
                        range: [-40, 40],
                        dataCategory: "temperature",
                        measureStrategy: "event",
                        unit: "°C"
                    },
                    {
                        id: 4,
                        type: "int",
                        range: [0, 100],
                        dataCategory: "humidity",
                        measureStrategy: "event",
                        unit: "%"
                    }
                ],
                path: false
            },
            (err, leaf) => {
                if (err) console.log(err);
                else {
                    leaf.listenCommand(
                    function (obj) {
                        var cmds = obj.command;
                        cmds.sort((a,b) => { return a.id - b.id; });
                        var toggle = null, temp = null;
                        if (cmds[0].id === 1)
                            toggle = cmds[0].value;
                        else
                            temp = cmds[0].value;
                        if (cmds[1])
                            temp = cmds[1].value;
                        state.configure(toggle, temp);
                    },
                    function() {
                        if (err)
                            console.log(err);
                        else {
                            //Node is running
                            console.log("[initialized] Air-conditioner initialized");
                            state.print_state();
                            var change = () => {
                                var stdin = process.openStdin();
                                console.log("Press ENTER to change Air-conditioner state/temperature");
                                stdin.addListener('data', function listener(d) {
                                    can_print = false;
                                    stdin.removeAllListeners("data");
                                    const ask = readline.createInterface({
                                        input: process.stdin,
                                        output: process.stdout
                                    });
                                    ask.question("Type the air-conditioner state (0 for off and 1 for on) and the new temperature (if on): ",
                                        (answer) => {
                                            if (answer !== '') {
                                                var answers = answer.split(' ');
                                                state.configure(answers[0] == 1, answers[1]);
                                                var external = [];
                                                if (answers[0] !== undefined)
                                                    external.push({
                                                        id: 1,
                                                        value: answers[0] == 1
                                                    });
                                                if (answers[1] !== undefined)
                                                    external.push({
                                                        id: 2,
                                                        value: answers[1]
                                                    });
                                                leaf.sendExternalCommand(external);
                                            }
                                            can_print = true;
                                            ask.close();
                                            change();

                                    });
                                });
                            };
                            state.on_change = function () {
                                //Send data
                                leaf.sendData([{id: 3, value: state.get_temperature()},
                                    {id: 4, value: Math.floor(Math.random() * 100)}]);
                            };
                            change();
                        }
                    });
                }
            });
    }
});


var state = function() {
    //The temperature the room should be
    var conf = 22.0;
    //The real temperature in the room
    var real = 25;
    //If the air-conditioner is on or off
    var on = false;
    const rate_temp = 1;
    const rate_time = 5*1000; //5s
    var timeout = null;
    var print_state = () => {
       if (on)
            print_message("[state] The current temperature is " + real + "°C and the air-conditioner is on and set to " + conf + "°C");
        else
            print_message("[state] The current temperature is " + real + "°C and the air-conditioner is off");
    };
    var update = function() {
        if (real > conf) {
            real = (real - rate_temp);
            if (real < conf)
                real = conf;
        }
        else if (real < conf) {
            real = (real + rate_temp);
            if (real > conf)
                real = conf;
        }
        print_state();
        if (real != conf)
            timeout = setTimeout(update, rate_time);
        else
            timeout = null;
        state.on_change();
    };
    return {
        print_state: print_state,
        get_temperature: () => real,
        configure: (turn_on, new_temp) => {
            if (turn_on !== undefined && turn_on !== null)
                on = turn_on;
            if (on) {
                if (new_temp !== undefined && new_temp !== null) {
                    new_temp = parseFloat(new_temp);
                    conf = new_temp;
                    if (conf < MIN_TEMPERATURE || conf > MAX_TEMPERATURE)
                        conf = (conf < MIN_TEMPERATURE ? MIN_TEMPERATURE : MAX_TEMPERATURE);
                }
                if (timeout === null)
                    timeout = setTimeout(update, rate_time);
            }
            else {
                //Turn off
                if (timeout !== null)
                    clearTimeout(timeout);
                timeout = null;
            }
            state.print_state();
        }
    };

}();

//Function to not print messages while asking for input
var can_print = true;
var print_message = function () {
    var messages = [];

    return function (msg) {
        if (msg)
            messages.push(msg);
        if (can_print) {
            for (var message of messages) {
                console.log(message);
            }
            messages = [];
        }
    };

}();
