# Coercion
Sifted supports coercion of inputs via type specifications.
If, for instance, you expect to receive a Date in an ISO formated string but want to operate on a Date instance in memory, you may use the provided combinators to create a `Processor` that performs this coercion for you.

# combinators

### `coercion: A -> String -> (a -> Maybe<b>)`
Given an expected input type `A`, a failure message, and a coercion function, create a `Processor` that will attempt to the coercion if the value in its `Context` is of type `A`.
If the input type does not match, an appropriate `Failure` will be constructed and if the coercion function returns `Nothing` a `Failure` will be constructed with the input failure message as its reason.

### `id: A -> Processor<a>`
A no-op coercion function.
This coercer will succeed if the input is already of type A.
This is primarily used as a seed for `coercer`

### `integerCoercion: Number -> Processor<Number>`
Create an integer coercer using parseInt with the given base.

### `floatCoercion: Processor<Number>`
A coercer that uses parseFloat internally.

### `coercer: A -> [Processor<a>] -> Processor<a>`
Given an input type and an array of coercion Processors, returns a coercing `Processor` that succeeds if the input is already of type `a` or can be coerced to an `a` by one of provided coercers.
