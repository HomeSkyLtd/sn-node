/*jshint esversion: 6 */

clause = require('./clause.js');
proposition = require('./proposition.js');

c = new Clause([
	[new Proposition('1.1', '>=', 2.1)],
    [new Proposition(1, '==', 1), new Proposition(2, "<", 1)],
	[new Proposition(1.3, '>=', 2.1)]
]);

c.evaluate((res) => {
	console.log("[CLAUSE] Result: " + res);
});
