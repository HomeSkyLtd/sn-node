/*jshint esversion: 6 */

var Controller = require("../controller.js");

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function saveValue(lhsOrRhs, callback) {
	var nodeDataState = Controller.nodeDataState;
	var nodeCmdState = Controller.nodeCmdState;

	if (lhsOrRhs === undefined || lhsOrRhs === null) {
		throw new Error('[Proposition] Empty operand');
	} else if (typeof lhsOrRhs === 'string') {
		ids = lhsOrRhs.split('.');
		if (ids.length !== 2) {
			throw new Error ('[Proposition] format must be "id.id"');
		}

		nodeId = ids[0];

		if (nodeCmdState[nodeId] === undefined && nodeDataState[nodeId] === undefined) {
			throw new Error('Node Id ' + nodeId + " undefined.");
		}

		if (ids[1].substr(ids[1].length - 1) === 'c') {
			var cmdId = ids[1].substr(0, ids[1].length - 1);
			console.log("COMANDO EXECUTED: " + nodeId + " " + cmdId);
			callback(nodeCmdState[nodeId][cmdId]);
		} else if (ids[1].substr(ids[1].length - 1) === 'd') {
			var dataId = ids[1].substr(0, ids[1].length - 1);
			console.log("DATA EXECUTED: " + nodeId + " " + dataId);
			callback(nodeDataState[nodeId][dataId]);
		} else {
			console.log("DATA EXECUTED: " + nodeId + " " + ids[1]);
			callback(nodeDataState[nodeId][ids[1]]);
		}

	} else if (isNumeric(lhsOrRhs)) {
		callback(lhsOrRhs);
	} else {
		throw new Error ('[Proposition] wrong format. Number or "id.id"');
	}
}

Proposition = function(lhs, operator, rhs, cb){
	var ids;
	var nodeId;
	var dataId;

	this.lhs = lhs;
	this.operator = operator;
	this.rhs = rhs;
};

Proposition.prototype.evaluate = function(callback) {
	saveValue(this.lhs, (lhs) => {
		saveValue(this.rhs, (rhs) => {

	    switch(this.operator){
	        case '>':
	            callback(lhs > rhs);
				break;
	        case '<':
	            callback(lhs < rhs);
				break;
	        case '>=':
	            callback(lhs >= rhs);
				break;
	        case '<=':
	            callback(lhs <= rhs);
				break;
	        case '==':
	            callback(lhs == rhs);
				break;
	        case '!=':
	            callback(lhs != rhs);
				break;
	        default:
	            throw new Error(`Operator ${this.operator} is not defined`);
	    }
		});
	});
};

exports.proposition = Proposition;
