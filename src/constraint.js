'use strict';

var R = require('ramda'),
    Validation = require('data.validation'),
    T = require('./types'),
    Processor = T.Processor,
    Path = T.Path,
    Reason = T.Reason;

// Success on input that exists
// exists : Processor[Validation[Reason, a]]
var exists = new Processor(function (context) {
    return context.value.map(Validation.Success)
        .getOrElse(Validation.Failure([new Reason(context, 'value is not defined')]));
});

// Success on any input.
// anything : Processor[Validation[Reason, Maybe[a]]]
var anything = Processor.identity;

// Create a Processor from a predicate.
// check : (a -> Bool) -> String -> Processor[Validation[Reason, a]]
var check = R.curry(function constraint(predicate, message) {
    return new Processor(function (context) {
        var test = R.cond([
            [predicate, Validation.Success],
            [R.T, R.always(Validation.Failure([new Reason(context, message)]))]
        ]);
        return context.value.map(test)
            .getOrElse(Validation.Failure([new Reason(context, 'value is not defined')]));
    });
});

// Runs all processors, taking the value of the last
// all : [Processor[Validation[Reason, a]]] -> Processor[Validation[Reason, a]]
var last = function (processors) {
    return R.commute(Processor.of, processors).map(R.tail);
};

// Runs a field processor
// property: Processor[a] -> String -> Processor[[k v]]
// The result of this processor, if successful will be a an array of length 2
var property = R.curry(function (constraint, name) {
    var path = Path.Property(name);
    // Test existence first, then check constraint
    return exists.asks(path).chain(R.always(constraint.asks(path)))
        // Construct an object with a single kv pair from the
        .map(R.compose(R.prepend(name), R.of));
});

var optionalProperty = R.curry(function (constraint, opts, name) {
    return new Processor(function (context) {
        var path = Path.Property(name),
            subcontext = context.derive(path);
        if (subcontext.value.isJust) {
            return property(constraint, name).run(context);
        } else {
            return opts.default ? Validation.Success([name, opts.default]) : Validation.Success([]);
        }
    });
});

// Reject if a property is present
var rejectProperty = R.curry(function (name) {
    return new Processor(function (context) {
        var path = Path.Property(name),
            subcontext = context.derive(path);
        return subcontext.value
            .map(R.always(Validation.Failure([new Reason(context, 'property ' + name + ' is disallowed')])))
            .getOrElse(Validation.Success([]));
    });
});

var assoc = function (fields) {
    return R.commute(Processor.of, fields)
        .map(R.fromPairs);
};

var isEq = function (x) {
    return check(R.equals(x), 'is not equal to ' + x);
};

var isGt = function (x) {
    return check(R.lt(x), 'is not greather than ' + x);
};

var isGte = function (x) {
    return check(R.lte(x), 'is not greater than or equal to ' + x);
};

var isLt = function (x) {
    return check(R.gt(x), 'is not less than ' + x);
};

var isLte = function (x) {
    return check(R.gte(x), 'is not greater than or equal to ' + x);
};

var isA = function (t) {
    return check(R.is(t), 'is not an instance of ' + t);
};

var isNumber = isA(Number);

var isString = isA(String);

var isArray = isA(Array);

var array = R.curry(function (onLength, onItem) {
    var len = Path.Property('length'),
        unfoldf = l => n => n < l ? [onItem.asks(Path.Index(n)), n + 1] : false;
    // Always verify that length exists and is a number
    return isArray.chain(R.always(isNumber.asks(len)))
        // Defend against onLength doing something wierd like not returning a number
        // Otherwise use the number returned by the on length constraint
        .chain(l => onLength.asks(len).chain(r => R.is(Number, r) ? Processor.of(r) : Processor.of(l)))
        // Given a length, produce a set of constraints, one per index
        .chain(l => R.commute(Processor.of, R.unfold(unfoldf(l), 0)));
});

var anyLenArray = array(isNumber);

module.exports = {
    exists: exists,
    anything: anything,
    check: check,
    last: last,
    property: property,
    optionalProperty: optionalProperty,
    rejectProperty: rejectProperty,
    assoc: assoc,
    array: array,
    anyLenArray: anyLenArray,
    isEq: isEq,
    isGt: isGt,
    isGte: isGte,
    isLt: isLt,
    isLte: isLte,
    isA: isA,
    isNumber: isNumber,
    isString: isString,
    isArray: isArray
};
