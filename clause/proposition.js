/*jshint esversion: 6 */

Proposition = function(lhs, operator, rhs){
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
};

Proposition.prototype.evaluate = function(){
    switch(this.operator){
        case '>':
            return this.lhs > this.rhs;
        case '<':
            return this.lhs < this.rhs;
        case '>=':
            return this.lhs >= this.rhs;
        case '<=':
            return this.lhs <= this.rhs;
        case '==':
            return this.lhs === this.rhs;
        case '!=':
            return this.lhs !== this.rhs;
        default:
            throw new Error(`Operator ${this.operator} is not defined`);
    }
};

exports.proposition = Proposition;
