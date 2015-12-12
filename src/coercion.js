'use strict';

var R = require('ramda'),
    Validation = require('data.validation'),
    Maybe = require('data.maybe'),
    fn = require('./fn'),
    T = require('./types'),
    Reason = R.construct(T.Reason),
    Processor = T.Processor;

// Convert an Option to a Validation.Success of failure with the associated message and context
var mkResult = R.curry(function (context, msg, opt) {
    var reason = Reason(context, msg);
    return opt.map(Validation.Success).getOrElse(Validation.Failure([reason]));
});

// Create a coercion, expect an input type i, a msg, and a cf of type i -> Maybe[a]
var coercion = R.curry(function (i, msg, cf) {
    return new Processor(function (context) {
        return context.value.map(R.cond([
            [R.is(i), R.compose(mkResult(context, msg), cf)],
            [R.T, R.compose(mkResult(context, 'input type mismatch'), R.always(Maybe.Nothing()))]
        ])).getOrElse(Validation.Failure([Reason(context, 'input is undefined')]));
    });
});

// Create a coercer of a -> Option[a]. This is useful as a seed for coercer
var id = function (t) {
    return coercion(t, 'input type was not an instance of ' + t, R.cond([
        [R.is(t), Maybe.Just],
        [R.T, R.always(Maybe.Nothing())]
    ]));
};

// parseInteger: base -> str -> number
var parseInteger = R.curry(R.flip(parseInt));

var integerCoercion = function (base) {
    // Attempt to parse an integer, use multimethod to cond to dispatch option response
    return coercion(String, 'could not parse int in base ' + base, R.compose(
        R.cond([
            [isNaN, R.always(Maybe.Nothing())],
            [R.T, Maybe.Just]
        ]),
        parseInteger(base))
    );
};

var floatCoercion = coercion(String, 'could not parse float', R.compose(
    R.cond([
        [isNaN, R.always(Maybe.Nothing())],
        [R.T, Maybe.Just]
    ]),
    parseFloat
));

// Create a single coercer that accepts its input if it is already of type t,
// otherwise attempts various different coercions
var coercer = R.curry(function (t, coercions) {
    return R.reduce(fn.orElse, id(t), coercions).errorMessage('No provided coercions succeeded');
});

module.exports = {
    id: id,
    coercion: coercion,
    coercer: coercer,
    integerCoercion: integerCoercion,
    floatCoercion: floatCoercion
};
