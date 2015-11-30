(function (R, C, Coerce, T) {
    'use strict';
    var run = R.curry(function (check, input) {
        return check(T.Context.Root)(input);
    });
    var runCont = R.curry(function (check, input, cont) {
        run(check, input).fold(function (err) {
            cont(err, null);
        }, function (val) {
            cont(null, val);
        });
    });

    module.exports = {
        run: run,
        runCont: runCont,
        constraint: C,
        coercion: Coerce,
        types: T
    };
}(
    require('ramda'),
    require('./constraint'),
    require('./coercion'),
    require('./types')
));
