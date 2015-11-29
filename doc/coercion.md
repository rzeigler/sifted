# Coercion API
Sifted supports coercion of inputs via type specifications.
If, for instance, you expect to receive a Date in ISO format but want to operate on a Date instance in memory, you may construct a `Coercion`.
Note that `Coercion` is defined in types.
A `Coercion` defines the conversion from an input type to an output type that may optionally fail (using validation).
Alternatively, if I remember my category theory correctly, Coercion defines the Kleisli Arrow `T1 -> Validation[[E], T2]`

Once you have a `Coercion` you may construct a constraint via the `coercion` function.

## coercion
`coercion: Type -> [Coercion] -> Constraint -> Constraint`

Create a constraint from a list of coercions.
The returned `Constraint` succeeds if the input is either already of `Type` or can be coerced to that type via one of the coercion and the provided constraint succeeds.
If, for some reason, multiple coercions are defined for the input type, the first is chosen and the rest are ignored.

Example:

    Coerce.coercion(Number, [Coerce.parseInteger(10)], gt5)
