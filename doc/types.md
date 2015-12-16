# Types
The types module defines all of the types used in sifted.
Many modules from the [_folktale_](http://folktalejs.org) libraries are used as dependencies including those from data.maybe and data.validation.
For documentation regarding the `Validation` and `Maybe` types consult the [_folktale_ documentation](http://docs.folktalejs.org/en/latest/).

# `Path`
Sum type representing a key lookup in a hierarchy.
Values represent lookup by either index or key.

## `Index n`
Path value representing lookup of an index in an array

## `Property p`
Path value representing lookup of a property in an object.

## Members

* `isProperty : Bool` is a path a Property
* `isIndex : Bool` is a path an Index
* `cata : Map<String, (a -> b)> -> b` perform dispatch based on the value type. Example:


    var p = Path.Index(1);
    p.cata({
        Index: n => console.log('index: ' n),
        Property: k => console.log('property: ' + k)
    });
    // prints index: 1


# `Context`
A zipper into an object hierarchy.
Maintains the focused value as a `Maybe` where `Nothing` indicates that there is no value at the given path. If you want to inspect the Maybe value directly, it will always be in a property named value.

## `Root value`
Context indicating the top level value in a hierarchy.
This context focuses the outermost object.

## `Derived enclosing path value`
Context indicating value derived from some outer context.
Enclosing is the parent context, path is the Path object to derive this from the parent, and value is the focused value.

## Members
* `isDerived: Boolean` is this a derived context
* `isRoot: Boolean` is this a root context
* `cata: Map<String, (a -> b)> -> b` dispatch based on type
* `pathList: () -> [Path]` generate the list of Paths used to arrive at the focused Value
* `derive: Path -> Context` create a derived context based on Path

# `Reason context message`
The reason for a processor failure.
This encapsulates the context at which the `Processor` failed as well as a message string indicating what went wrong.
All `Processors` return an `Array` of `Reasons` in the failure case.

# `Processor a`
An instance of an `Context` processor.
`Processors` encapsulate a function of type `Context -> Validation<[Reason], a>`.
This makes them a restricted form of a Reader.
As such, they implement the fantasy-land specification for `Functor`, `Applicative`, and `Monad`.
To execute a `Processor` directly against a context, call `p.run(ctx)`.
In most cases this is unnecessary as the index module exports a function `run(processor, value)` that handles wrapping the value in a root context

## Monad v Applicative
A note on `Processor` usage.
`Processor` is defined as a `Monad`, however, `Validation` is only an `Applicative`.
As such, it is not possible to aggregate errors when the `Processor` is used
as a monad.
In many cases, this makes sense. For instance, one should verify that the value in a context is defined before attempting to check constraints against it.
However, when using the `Monad` interface, consider whether or not your goals can be achieved using `Applicative` instead as your error reporting may not be as complete as it otherwise could be

## Members
*    `run: Context -> Validation<[Reason], a>` the run function
*    `map: a -> b -> Processor<b>`
*    `[static|member] of: a -> Processor a` create a constant `Processor a`
*    `ap: Processor<a> -> Processor<b> where this is a Processor<a -> b>`
*    `chain: a -> Processor<b> -> Processor<b>`
*    `concat: Processor<a> -> (a -> a -> a) -> Processor<a>`

    Semigroup concat/append the result of this processor with another processor. This function is _not_ curried because the provided function is optional. It is only provided in the case where executing the concat method (i.e. using the types Semigroup implementation per fantasy-land) on the inner value doesn't make sense. Say, in the case where you want to use append on `Number`s of `Object`s.
* `orElse: Processor<a> -> Processor<a>` Alternative#choice creating a `Processor` that will execute this processor and attempt to recover by executing the other processor on failure.
* `andThen: Processor<a> -> Processor<a>` Applicatively sequence this and another processor. This results in the value of the other processor if and only if both are successful. This is equivalent to Haskell's `*>`.
* `onlyIf: Processor<a> -> Processor<a>` Applicatively sequence this and another processor. This results in the value of this processor if and only if both are successful. This is equivalent to Haskell's `<*`
* `errorMessage: String -> Processor<a>` create a `Processor` that has the exact same semantics as this processor except it will always fail with the provided error message instead of any error messages that may have been accumulated.
This is useful to provide meaningful error messages in the case of coercion where many coercions may fail and it makes sense to return a single summary error.
* `asks: Path -> Processor<a>` create a `Processor` that runs this on its input context derived by Path instead of the input context itself.
Used for navigating the object hierarchy.
This is similar to `Reader#asks` but restricted to Path rather than a general function.
There is also a static variant that accepts the processor as the first argument.
The constraint combinators `assoc` and `array` should alleviate almost all need to call this function directly.
* `[static] identity: Processor<Maybe<a>>` a processor that always succeeds on the value in its input context, even if it is `Nothing`.
