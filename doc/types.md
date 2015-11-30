# Types

## Key

A tagged sum representing a lookup step in the context zipper object.
This is either a `Field` indicating an object lookup or an `Index` indicating an array lookup.

## Context
`Context = Root | Derived Context Key`

A specification for a location within a hierarchy of objects.
A context uniquely identifies a specific location (which may not exist) within an object.
`Context` provides a toString() method to print its address.

## Reason
`Reason Context String`

The reason for a validation failure.
Each reason contains a `context` field indicating the location of a failure and a `message` field indicating the reason why validation failed.

## Coercion
`Coercion Type Function`

The specification of a coercion.
Coercions are specified by a `type` and a function (the `fn` field) that performs the conversion but may fail via Validation.
