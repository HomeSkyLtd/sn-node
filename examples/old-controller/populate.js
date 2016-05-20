/*jshint esversion: 6 */

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/controller';

MongoClient.connect(url, function(err, db) {
    if(err) console.log("Error connecting do database");
    else{
        var collection = db.collection('networks');
        collection.count((err, count)=>{
            if(err) console.log("Error accessing number of networks");
            else{
                if(count == 2) {
                    console.log("Networks database already up to date");
                    db.close();
                }
                else{
                    console.log("Inserting network entries...");
                    collection.insertMany([
                        {params: {rport:2356, broadcast_port: 2356}, type: 0}, //udp params
                        {params: {tty_port: "/dev/ttyUSB0"}, type: 1} //xbee 802.15.4 params
                    ], (err, r)=>{
                        console.log("Done! Inserted entries: ");
                        console.log(r.ops);
                        db.close();
                    });
                }
            }
        });
    }
});
