# Sifted
[![Build Status](https://travis-ci.org/arzig/sifted.svg?branch=master)](https://travis-ci.org/arzig/sifted)

Sift out your valid inputs... functionally!
Sifted performs schema validation of hierarchies of objects, arrays, and values in additional to constraint checking and optional coercion using only function composition.

## Basic Usage

Create constraints using combinators and then execute them with run.

    var sifted = requre('sifted'),
        C = sifted.constraint,
        schema = C.object([
                C.field('a', C.isNumber),
                C.field('b', C.array(C.valid, C.isString))
            ]),
        result = sifted.run(schema, input);
    result.fold(console.error.bind(console), console.log.bind(console));

At this point, result will be a `Validation[Array[Reason], Output]`.
The `Output` type will match the ideal structure of your input.
Each `Reason` in the output type is a `Context` indicating the location in the input an error occurred and an associated error message.
There is also a `sifted.runCont(c, input, cb)` that exposes an api similar to Joi where cb should have the signature `Array[Reason], Output -> Null`.
Note that if validation fails, the callback receives null for output.

For more see
* The [Constraint API](doc/constraint.md)
* The [Coercion API](doc/constraint.md)
* The [Types](doc/types.md)

These are exported from sifted as

    {
        constraint: constraint
        coercion: coercion,
        type: type,
        run: run,
        runCont: runCont
    }
