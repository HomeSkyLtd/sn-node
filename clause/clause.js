/*jshint esversion: 6 */

/*
    Represents a boolean expression in CNF form. In this representation, an expression
    in the form (a^b^c) | (d^e) is represented as [[a,b,c] , [d,e]]
*/
Clause = function(cnf){
    this.cnf = cnf;
};

Clause.prototype.evaluate = function(){
    var allTrue;
    for(var andExpression of this.cnf){
        allTrue = true;
        for(var proposition of andExpression){
            if(!proposition.evaluate()) {
                allTrue = false;
                break;
            }
        }
        if(allTrue) return true;
    }
    return false;
};

exports.clause = Clause;
