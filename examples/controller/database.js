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
                cb(db);
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
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.find({_id: mongo.ObjectID(id)}).toArray((err, docs) => {
            if(docs.length === 1) cb(true);
            else if (docs.length === 0) cb(false);
            else throw new Error();
            db.close();
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
            db.close();
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
                console.error(err);
                return;
            }
            db.close();
            cb(String(r.insertedId));
        });
    });
}

function deactivateNode(id, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{activated: false}},
			null, (err, result)=>{
			if(err || result.result.ok !== 1){
				console.error("Error deactivating node id " + id);
				if(err) console.error(err);
				db.close();
				return;
			}
			db.close();
			cb();
		});
	});
}

function activateNode(id, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{activated: false}},
			null, (err, result)=>{
			if(err || result.result.ok !== 1){
				console.error("Error deactivating node id " + id);
				if(err) console.error(err);
				db.close();
				return;
			}
			db.close();
			cb();
		});
	});
}


/*  DATA AND COMMAND FUNCTIONS */

function insertNodeData(id, time, data, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.insertOne({id: id, time: time, data: data}, function(err, r){
			if(err){
                console.error(err);
                return;
            }
			db.close();
		});
	});
}

/* Human commands */
function insertNodeCommand(id, time, command, cb) {
    getDBConnection((db) => {
		var collection = db.collection('nodes');
		collection.insertOne({id: id, time: time, command: command}, function(err, r){
			if(err){
				console.error(err);
				return;
			}
			db.close();
		});
	});
}

function setNodeDescription(id, description, cb) {
    getDBConnection((db) => {
        var collection = db.collection('nodes');
        collection.updateOne({_id: mongo.ObjectID(id)}, {$set:{description: description, activated: true}},
			null, (err, result)=>{
            if(err || result.result.ok !== 1){
                console.error("Error updating node description for node id " + id);
                if(err) console.error(err);
                db.close();
                return;
            }
            db.close();
			cb();
        });
    });
}

newNode((id)=>{
	setNodeDescription(id, {info: "someinfo"}, ()=>{
		deactivateNode(id, ()=>{
			getNode(id, (err, r)=>{
				console.log(r);
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
    setNodeDescription: setNodeDescription
};

exports.db = export_functions;
