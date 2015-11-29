# Constraint API

Constraints are just curried functions with a type of `Context -> Input -> Validation[Array[Reason], Output]`.
In particular, this means that creating your own constraints is super easy because functions compose really well.
That said, there are some combinators to make creating your own constraints super easy. When reading this document assume that `Constraint = Context -> Input -> Validation[Array[Reason], Output]`
Any instance of `Constraint` is suitable for passing to `sifted.run` however, some are not particularly useful on their own such as `valid` or `field`.

## constraint
`constraint: (Input -> Bool) -> String -> Constraint`

Create a constraint from a predicate function and a message.
The produced constraint will succeed with the input when the predicate returns true.
If the predicate returns false, the constraint will fail with a Reason containing message along with the input context.

## valid
`valid: Constraint`

Create a constraint that succeeds on any input.

## isA
`isA: Type -> Constraint`

Create a constraint that succeeds with its input when `input instanceof Type`

## and
`and: Constraint -> Constraint -> Constraint`

Create a constraint that is a shortcircuiting and on its 2 input constraints. This is most useful for ensuring that an input is of given type and then running typed validations on the value.
For instance, one would not want to run numeric checks on an input that is a string.

Example:

    and(isA(Number), gt5);

## all
`all: [Constraint] -> Constraint`

Create a constraint that is the union of all its component constraints. Errors across the input constraints will be aggregated.
When the combined constraint succeeds it will succeed with the value of the last constraint in the input array.

## field
`field: String -> Constraint -> Options -> Constraint`

[fieldid]: Create a constraint that validates a single field of an input object against the provided constraint.
 When this succeeds, it succeeds with either an empty object `{}` or an object with a single field field matching the input string.
This is not terribly useful on its own but operates in conjuction with [object] [objectid] that aggregates the results.


## object
`object: [Constraint] -> Constraint`

[objectid]: Create an object constraint.
There is an assumption that the input Constraints all succeed with objects themselves such as being produced by [field] [fieldid].
If this is not the case, the output of the returned constraint is undefined.
You may further nest object constraints within an object's field to achieve hierarchies.

Example:

    C.object([
        C.field('a', C.isNumber),
        C.field('b', C.isString)
    ]);

## array
`array: Constraint -> Constraint -> Constraint`

Creates an array constraint.
The first constraint argument is a constraint on the length of the array.
The second constraint argument is a constraint on each element of the array.

Example:

    var numberArray = C.array(C.valid, C.isNumber),
        geoJsonPointLocation = C.array(C.constraint(R.eq(2), 'must have length 2'),
                                       C.isNumber);

## isNumber
`isNumber: Constraint`

A constraint that succeeds when its input is a number.

## isString
`isString: Constraint`

A constraint that succeeds when its input is a string.

## isDate
`isDate: Constraint`

A constraint that succeeds when its input is a Date.
