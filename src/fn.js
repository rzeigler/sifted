var R = require('ramda');

// Applicative *> sequence actions discarding the right
var flowRight = R.curry(function (left, right) {
    var of = left.of || left.constructor.of;
    if (!of) {
        throw new TypeError('Unable to find Applicative#of on left');
    }
    return of(R.always(R.identity))
    .ap(left)
    .ap(right);
});

// Applicative <* sequence actions discarding the right
var flowLeft = R.curry(function (left, right) {
    var of = left.of || left.constructor.of;
    if (!of) {
        throw new TypeError('Unable to find Applicative#of on left');
    }
    return of(R.always)
    .ap(left)
    .ap(right);
});

var orElse = R.curry(function (left, right) {
    return left.orElse(right);
});

function unimplemented() {
    throw new Error('Not implemented');
}

function noop () {
    return this;
}

var tap = R.curry(function (fn, x) {
    fn(x);
    return x;
});

var asField = R.curry(function (field, value) {
    var o = {};
    o[field] = value;
    return o;
});

function unwrap(wrapped) {
    return wrapped.unwrap();
}

module.exports = {
    flowRight: flowRight,
    flowLeft: flowLeft,
    orElse: orElse,
    tap: tap,
    unimplemented: unimplemented,
    noop: noop,
    asField: asField,
    unwrap: unwrap
};
