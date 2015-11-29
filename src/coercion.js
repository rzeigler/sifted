(function (Validation, R, T) {
    'use strict';

    function parseInteger(base) {
        return T.Coercion(String, function (context, str) {
            var parsed = parseInt(str, base);
            if (isNaN(parsed)) {
                return Validation.Failure([T.Reason(context, str + ' parsed to NaN')]);
            } else {
                return Validation.Success(parsed);
            }
        });
    }

    var parseFloat = T.Coercion(String, function (context, str) {
        var parsed = parseFloat(str);
        if (isNaN(parsed)) {
            return Validation.Failure([T.Reason(context, str + ' parsed to NaN')]);
        } else {
            return Validation.Success(parsed);
        }
    });

    var isOf = R.curry(function(instance, Type) {
        return R.is(Type, instance);
    });

    function coerce(expected, coercions, context) {
        return function (input) {
            // Coercion successful, already the correct type
            if (R.is(expected, input)) {
                return Validation.Success(input);
            } else {
                // filter Coercable's by testing that R.is(Coercable.type, input)
                // R.flip is needed to invert inputs
                var validCoercions = R.filter(R.compose(isOf(input), R.prop('type')), coercions);
                if (validCoercions.length > 0) {
                    return validCoercions[0].fn(context, input);
                } else {
                    return Validation.Failure([Error(context,
                                                    'Unable to find a coercion from ' + input.constructor + ' to ' + expected)]);
                }
            }
        };
    }

    // Perform a coercion with constraint on the resulting output
    function coercion(expected, coercions, constraint) {
        return function (context) {
            var contextCoerce = coerce(expected, coercions, context);
            // If no constraint, just return success
            var contextConstraint = constraint ? constraint(context) : Validation.Success;
            return function (input) {
                // If there are no constraints then return a success
                return contextCoerce(input).cata({
                    Failure: Validation.Failure, // Proxy errors up
                    Success: contextConstraint // Coercion suceeded, run constraints
                });
            };
        };
    }

    module.exports = {
        coercion: coercion,
        parseInteger: parseInteger,
        parseFloat: parseFloat
    };
}(
    require('fantasy-validations'),
    require('ramda'),
    require('./types')
));
