# Sifted
[![Build Status](https://travis-ci.org/arzig/sifted.svg?branch=master)](https://travis-ci.org/arzig/sifted)

Sift out your valid inputs... functionally!
Sifted allows the purely compositional construction of a schema by which to verify arbitrarily shaped javascript object hierarchies with optional coercion.

## Basic Usage

Create constraints using combinators and then execute them with run.

    var sifted = requre('sifted'),
        C = sifted.Constraint,
        input = {
            a: 5,
            b: ['hello', 'world!'],
            q: 'extraneous property'
        },
        schema = C.assoc([
                C.property(C.isNumber, 'a'),
                C.property(C.anyLenArray(C.isString), 'b')
            ]),
        result = sifted.run(schema, input);
    result.fold(err => console.error(err), v => console.log(v));
    // Prints on stdout
    // { a: 5, b: [ 'hello', 'world!' ] }

At this point, `result` will be a `Validation<[Reason], a>` indicating success or failure (in this case success).
The `a` instance will match the ideal structure of your input including none of the superfluous fields.
For example, the extraneous property q will not be present in the output.

In the event of a validation failure, result will instead contain a result of `Reason`s; each one containing a `Context` indicating the location of the failure and a `String` indicating the reason.
There is also a `sifted.runCont(c, input, cb)` where `cb` should be an error first callback.

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
