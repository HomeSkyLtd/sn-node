/*jshint esversion: 6 */

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var Communicator = require("communicator");
var Udp = require("udp");

var nodes = [];
var com;
const KEEP_ALIVE_TIME = 10 * 1000;//10s
const url = 'mongodb://localhost:27017/controller';

function startTimer(node_id, id) {
	if (id !== undefined)
		clearTimeout(id);
	setTimeout(() => {
		console.log("Removing node with id " + node_id + " due to timeout.");
		node[node_id] = null;
	}, keepAliveTime);
}

function getNetworks(cb) {
    MongoClient.connect(url, function(err, db) {
        if(err) {
            console.error(err);
            return;
        }
        var collection = db.collection('networks');
        collection.find().toArray((err, docs)=>{
            if(err){
                console.error(err);
                return;
            }
            for(var item of docs){
                item.id = String(item._id);
                delete item._id;
            }
            db.close();
            cb(docs);
        });
    });
}

/* NODE FUNCTIONS */

function nodeExists(id, cb) {
    MongoClient.connect(url, function(err, db) {
        if(err){
            console.error(err);
            return;
        }
        var collection = db.collection('nodes');
        collection.find({_id: mongo.ObjectID(id)}).toArray((err, docs) => {
            if(docs.length === 1) cb(true);
            else if (docs.length === 0) cb(false);
            else throw new Error();
            db.close();
        });
    });
}

function getNode(cb) {

}

function newNode(cb) {
    MongoClient.connect(url, function(err, db) {
        if(err){
            console.error(err);
            return;
        }
        var collection = db.collection('nodes');
        collection.insertOne({}, function(err, r){
            if(err){
                console.error(err);
                return;
            }
            db.close();
            cb(String(r.insertedId));
        });
    });
}

function deactivateNode(cb) {

}

function activateNode(cb) {

}


/*  DATA AND COMMAND FUNCTIONS */

function insertNodeData(cb) {

}

/* Human commands */
function insertNodeCommand(cb) {

}

function setNodeDescription(id, description, cb) {
    MongoClient.connect(url, function(err, db) {
        if(err){
            console.err(err);
            return;
        }
        var collection = db.collection('nodes');
        collection.updateOne({_id: mongo.ObjectID(id)}, {description: description}, null, (err, result)=>{
            if(err || result.result.ok !== 1){
                console.error("Error updating node description for node id " + id);
                if(err) console.error(err);
                db.close();
                return;
            }
            db.close();
        });
    });
}

setNodeDescription("5727a6ce4896d0651d08e3ae", {address: 3, type: 5}, (docs)=>{console.log(docs);});

var udpDriver = new Udp.Driver(() => {

	com = new Communicator.Communicator(udpDriver);
	//Listen for new leafs
	com.listen((obj, from) => {
		console.log("[NEW CONNECTION]");
		com.send(from, {
			packageType: 'iamcontroller | describeyourself | lifetime',
			'yourid': nodes.length,
			'lifetime': keepAliveTime,
		}, () => { nodes.push({}); });
	}, 'whoiscontroller');

	//Register new nodes
	com.listen((obj, from) => {
		console.log("[NEW DESCRIPTION] from " + obj.id);

		for (var type in obj.dataType) {
			nodes[obj.id][type.id] = {
				'type': type,
				'measures': []
			};
		}
		startTimer(obj.id);


	}, 'description');

	//Listen for data
	com.listen((obj, from) => {
		var time = Date.now();
		console.log("[NEW DATA] from " + obj.id  + " at " + time);
		for (var data in obj.data) {
			if (nodes[obj.id][data.id] === undefined)
				console.log("	Data with id " + data.id + " not declared");
			else {
				console.log("	Data with id " + data.id + " received: " + data.value);
				nodes[obj.id][data.id].measures.push({timestamp: time, data: data.value});
			}
		}
	}, Communicator.PACKAGE_TYPES.data);

	com.listen((obj, from) => {
		console.log("[KEEP ALIVE] from " + obj.id);
		startTimer(obj.id);
	}, Communicator.PACKAGE_TYPES.keepalive);
});
