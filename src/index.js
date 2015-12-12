'use strict';

var R = require('ramda'),
    Constraint = require('./constraint'),
    Coercion = require('./coercion'),
    Types = require('./types');

var run = R.curry(function (processor, value) {
    return processor.run(Types.Context.Root(value));
});

var runCont = R.curry(function (processor, value, cont) {
    run(processor, value).fold(err => cont(err, null),
                               val => cont(null, val));
});

module.exports = {
    run: run,
    runCont: runCont,
    Constraint: Constraint,
    Coercion: Coercion,
    Types: Types
};
