(function (R)  {
    // Applicative *> sequence actions discarding the right
    function flowRight(left, right) {
        var of = left.of || left.constructor.of;
        if (!of) {
            throw new TypeError('Unable to find Applicative#of on left');
        }
        return of(R.always(R.identity))
        .ap(left)
        .ap(right);
    }

    // Applicative <* sequence actions discarding the right
    function flowLeft(left, right) {
        var of = left.of || left.constructor.of;
        if (!of) {
            throw new TypeError('Unable to find Applicative#of on left');
        }
        return of(R.always)
        .ap(left)
        .ap(right);
    }

    module.exports = {
        flowRight: flowRight,
        flowLeft: flowLeft
    };
}(
    require('ramda')
));
