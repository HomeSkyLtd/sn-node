/*jshint esversion: 6 */

var Controller = require("../controller.js");

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function saveValue(lhsOrRhs, callback) {
	var nodeState = Controller.nodeState;

	if (lhsOrRhs === undefined || lhsOrRhs === null) {
		throw new Error('[Proposition] Empty operand');
	} else if (typeof lhsOrRhs === 'string') {
		ids = lhsOrRhs.split('.');
		if (ids.length !== 2) {
			throw new Error ('[Proposition] format must be "id.id"');
		}

		nodeId = ids[0];
		dataId = ids[1];

		if (nodeState[nodeId] === undefined) {
			throw new Error('Node Id ' + nodeId + " undefined.");
		}

		callback(nodeState[nodeId][dataId]);
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
