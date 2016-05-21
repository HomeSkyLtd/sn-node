/* jshint esversion: 6 */

clause = require('./clause/clause.js');
proposition = require('./clause/proposition.js');

/**
	In MongoDB, data should be like this:
 {
	command: {
		id: 1
		value: 20
	},
	clause: [
	  	[
	  		{
	  			op1: "1.1",
	  			operator: ">",
	  			op2: 20
	  		},
	  		{
	  			op1: "1.1",
	  			operator: "<",
	  			op2: 40
	  		}
	  	],
	  	[
	  		{
	  			op1: "2.1",
	  			operator: "==",
	  			op2: true
	  		}
	  	]
	  ]
  }
  */
function Rule () {
	this.rules = [];
}

Rule.prototype.getCommandsIfClauseIsTrue = function(callback) {
	var commands = [];

	addCommandIfClauseIsTrue = (index) => {
		if (index >= this.rules.length) {
			callback(commands);
		} else {
			this.rules[index].clause.evaluate((res) => {
				if (res) commands.push(this.rules[index].command);
				addCommandIfClauseIsTrue(index + 1);
			});
		}
	};

	addCommandIfClauseIsTrue(0);
};

Rule.prototype.addRule = function (rule) {

	var listOfProps = [];

	for (var orExps of rule.clause) {
		var andProps = [];

		for (var andExps of orExps) {
			andProps.push(new Proposition(andExps.rhs, andExps.operator, andExps.lhs));
		}

		listOfProps.push(andProps);
	}

	this.rules.push({
		command: rule.command,
		clause: new Clause(listOfProps)
	});
};

/**
A rule must be like this.
{
	command: {
		nodeId:
		cmdId: 1
		value: 20
   },
   clause: [
	   [
		   {
			   op1: "1.1",
			   operator: ">",
			   op2: 20
		   },
		   {
			   op1: "1.1",
			   operator: "<",
			   op2: 40
		   }
	   ],
	   [
		   {
			   op1: "2.1",
			   operator: "==",
			   op2: true
		   }
	   ]
	 ]
 }
*/

exports.Rule = Rule;
