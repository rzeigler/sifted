# Sifted
[![Build Status](https://travis-ci.org/arzig/sifted.svg?branch=master)](https://travis-ci.org/arzig/sifted)

Sift out your valid inputs... functionally!
Sifted allows the purely compositional construction of a schema by which to verify arbitrarily shaped javascript object hierarchies with optional coercion.

## Basic Usage

Create constraints using combinators and then execute them with run.

    var sifted = requre('sifted'),
        C = sifted.Constraint,
        schema = C.assoc([
                C.property(C.isNumber, 'a'),
                C.property(C.anyLenArray(C.isString), 'b')
            ]),
        result = sifted.run(schema, input);
    result.fold(err => console.error(err), v => console.log(v));

At this point, `result` will be a `Validation[Array[Reason], A]` which is an object conforming to the specification you might expect.
The `A` type will match the ideal structure of your input including none of the superfluous fields.
Each `Reason` in the output type is a `Context` indicating the location in the input an error occurred and an associated error message.
There is also a `sifted.runCont(c, input, cb)` that exposes an api similar to Joi where cb should have the signature `Array[Reason], Output -> Null`.
Note that if validation fails, the callback receives null for output.

For more see
* The [Constraint API](doc/constraint.md)
* The [Coercion API](doc/coercion.md)
* The [Types](doc/types.md)

These are exported from sifted as

    {
        Constraint,
        Coercion,
        Types
        run,
        runCont
    }
