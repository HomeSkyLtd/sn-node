/*jshint esversion: 6 */

/*
    Represents a boolean expression in CNF form. In this representation, an expression
    in the form (a^b^c) | (d^e) is represented as [[a,b,c] , [d,e]]
*/
Clause = function(cnf){
    this.cnf = cnf;
};

Clause.prototype.evaluate = function(cb){
    /*
        Evaluates the propositions from propIndex..end in the AND expression represented
        by cnf[andIndex]. Making propIndex=0 evaluates all the propositions in cnf[andIndex]
    */
    evaluatePropInAndStat = (andIndex, propIndex, cb) => {
        if(this.cnf[andIndex].length <= propIndex) cb(true);
        else {
            this.cnf[andIndex][propIndex].evaluate((res) => {
                if(res === false) cb(false);
                else evaluatePropInAndStat(andIndex, propIndex + 1, cb);
            });
        }
    };

    /*
        Evaluates the AND expressions from index..end in the OR expression represented by cnf.
        Making index=0 evaluates all the AND expressions in cnf.
    */
    evaluateAndStat = (index, cb) => {
        if(this.cnf.length <= index) cb(false);
        else {
            evaluatePropInAndStat(index, 0, (res) => {
                if(res === true) cb(true);
                else evaluateAndStat(index + 1, cb);
            });
        }
    };
    evaluateAndStat(0, cb);
};

exports.clause = Clause;
