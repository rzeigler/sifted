# Constraint

The Constraint module provides combinators returning `Processor`s with the described behavior.
Consult [types](./types.md) for a description of the types involved.

### `exists: Processor<a>`
A `Processor` that return the value in its context if it is defined, otherwise it fails.

### `anything: Processor<Maybe<a>>`
A `Processor` that always succeeds on its input.

### `check: (a -> Boolean) -> String -> Processor<a>`
Create a `Processor` that succeeds with its input value if it is both defined and the predicate provided as the first argument returns true.
If the value is defined but the does not pass the predicate the failure message will be used in the `Reason`.

### `last: [Processor<a>] -> Processor<a>`
Create a `Processor` that runs all of the input `Processor`s aggregating errors.
If all processors succeed, the output processor succeeds with the value of the last processor.
This is useful for combining many `check` results into a single `Processor`

### `property: Processor<a> -> String -> Processor<[String a]>`
Create a processor for a property.
If the input constraint is successful and the property is defined, the `Processor` will result in an array of length 2 containing the input key as the first value and the value at that property as the second.
This is useful in conjunction with `[assoc](#assoc)`.
The property name is the second parameter to allow the same constraint to be easily used among multiple properties with currying.

### `optionalProperty: Processor<a> -> Options -> String -> Processor<[String a]>`
Like property, but if the value in the given field is undefined, returns an empty array instead.
Useful in conjunction with `[assoc](#assoc)` to define fields that need not necessarily be present.
If options.default is defined, it will be used for the result instead of an empty array.

### `assoc: [Processor<[String a]] -> Processor<Object>`
Combine an array of property processors into a processor that returns an object. Example:

    association = constraint.assoc([
        property(isEven, 'a'),
        property(isOdd, 'b'),
        property(isEven, 'c')
    ]);

### `array: Processor<Number> -> Processor<a> -> Processor<[a]>`
Create an array `Processor` from a `Processory` verifying the length of an Array and the subsequently verifying each element with the `Processor` given by the second argument. Note that existence and isNumberness of length is verified by default. If you don't care about the length you may use `anyLenArray`. Example:

    var isEven = constraint.check(x => x % 2 === 0, 'is not even'),
        evenArray = constraint.array(constraint.isNumber, isEven);

If you wish to do something unusual like limit the length of an array to a given size, yet not reject larger arrays, you may construct a length validator that returns a different length from the length of the actual array.
If your length validator returns something that is not a number, it will be discarded in favor of the actual length of the array.

### `anyLenArray: Processor<a> -> Processor<[a]>`
Create an array processor that accepts any object with a length property that is also a number.

### `isA: T -> Processor<a>`
Create a processor that succeeds if the input value is defined and an instance of `T`.

## Other combinators
There are further combinators that are defined and generally do what you would expect. They include

* isEq
* isGt
* isGte
* isLt
* isLte
* isNumber
* isString
* isArray

Note that for less than, greater than variants, the input value from the context is tested against the input in the first position.
Hopefully this does what you expect, but for completeness, assuming the value in `Context` is `y`, `isGt(x)` will create a Processor that tests, informally, whether `x < y` which is equivalent to the test `y > x` which you might expect from the method name.
