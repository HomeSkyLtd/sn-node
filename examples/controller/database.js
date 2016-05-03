/*jshint esversion: 6 */

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/controller';

var getDBConnection = function(){
    var connection;
    return function(cb){
        if(!connection){
            MongoClient.connect(url, function(err, db) {
                if(err) {
                    throw err;
                }
                connection = db;
                cb(connection);
            });
        }
        else cb(connection);
    };
}();

function getNetworks(cb) {
    getDBConnection((db) => {
        var collection = db.collection('networks');
        collection.find().toArray((err, docs)=>{
            if(err){
                throw err;
            }
            for(var item of docs){
                item.id = String(item._id);
                delete item._id;
            }
            cb(docs);
        });
    });
}

/* NODE FUNCTIONS */

function nodeExists(id, cb) {
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.find({_id: mongo.ObjectID(id)}).toArray((err, docs) => {
            if(docs.length === 1) cb(true);
            else if (docs.length === 0) cb(false);
            else throw new Error();
        });
    });
}

function getNode(id, cb) {
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.findOne({_id: mongo.ObjectID(id)}, (err, docs) => {
            if(err){
                console.log(err);
                db.close();
                return;
            }
            if(docs === null) cb(new Error("Requested node id " + id + " not found"), null);
			else if (docs.description === undefined) cb(new Error("Requested node id " + id +
				" has no description"));
            else cb(null, docs.description);
        });
    });
}

function newNode(cb) {
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.insertOne({}, function(err, r){
            if(err){
                throw err;
            }
            cb(String(r.insertedId));
        });
    });
}

function deactivateNode(id, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{activated: false}},
			null, (err, result)=>{
            if(err) cb(err);
            else if(result.result.ok !== 1){
				cb(new Error("Error deactivating node " + id));
			}
			else cb();
		});
	});
}

function activateNode(id, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{activated: false}},
			null, (err, result)=>{
            if(err) cb(err);
            else if(result.result.ok !== 1){
                cb(new Error("Error deactivating node " + id));
            }
            else cb();
		});
	});
}


/*  DATA AND COMMAND FUNCTIONS */

function insertNodeData(id, time, data, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.insertOne({id: id, time: time, data: data}, function(err, r){
			if(err){
                cb(err);
            }
            else{
                cb();
            }
		});
	});
}

/* Human commands */
function insertNodeCommand(id, time, command, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.insertOne({id: id, time: time, command: command}, function(err, r){
			if(err){
				cb(err);
			}
			else cb();
		});
	});
}

function setNodeDescription(id, description, cb) {
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{description: description, activated: true}},
			null, (err, result)=>{
            if(err) cb(err);
            else if(result.result.ok !== 1){
                cb(new Error("Error updating node description for node id " + id));
            }
			else cb();
        });
    });
}

function closeDB(){
    getDBConnection((db)=>{
        db.close();
    });
}

newNode((id)=>{
	setNodeDescription(id, {info: "someinfo"}, ()=>{
		deactivateNode(id, ()=>{
			getNode(id, (err, r)=>{
				console.log(r);
                closeDB();
			});
		});
	});
});

export_functions = {
    getNetworks: getNetworks,
    nodeExists: nodeExists,
    getNode: getNode,
    newNode: newNode,
    deactivateNode: deactivateNode,
    activateNode: activateNode,
    insertNodeData: insertNodeData,
    insertNodeCommand: insertNodeCommand,
    setNodeDescription: setNodeDescription,
    closeDB: closeDB
};

exports.db = export_functions;
