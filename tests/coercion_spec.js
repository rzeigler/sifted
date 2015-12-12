'use strict';

var chai = require('chai'),
    expect = chai.expect,
    shallowDeepEqual = require('chai-shallow-deep-equal'),
    Validation = require('data.validation'),
    T = require('../src/types'),
    Context = T.Context,
    coercion = require('../src/coercion');

chai.use(shallowDeepEqual);

describe('coercion', function () {
    describe('#id', function () {
        it('should succeed if the input is already the expected type', function () {
            expect(coercion.id(Number).run(Context.Root(1)))
                .to.shallowDeepEqual(Validation.Success(1));
        });
        it('should fail when the input is not the expected type', function () {
            expect(coercion.id(Number).run(Context.Root('1')).isFailure)
                .to.equal(true);
        });
    });
    describe('#coerce', function () {
        // Test the derived combinators to get 2 for 1.
        it('should perform the expected coercion', function () {
            expect(coercion.integerCoercion(10).run(Context.Root('1')))
                .to.shallowDeepEqual(Validation.Success(1));
        });
        it('should fail if the the input could not be coerced', function () {
            expect(coercion.integerCoercion(10).run(Context.Root('foo')).isFailure)
                .to.equal(true);
        });
    });
    describe('#coercer', function () {
        it('should perform the expected coercion', function () {
            var result = coercion.coercer(Number, [coercion.integerCoercion(10)]).run(Context.Root('1'));
            expect(result.isSuccess).to.equal(true);
            expect(result).to.shallowDeepEqual(Validation.Success(1));

        });
        it('should noop if the input is already of the expected type', function () {
            expect(coercion.coercer(Number, [coercion.integerCoercion(10)]).run(Context.Root(1)))
                .to.shallowDeepEqual(Validation.Success(1));
        });
        it('should fail if the input cannot be coerced', function () {
            var result = coercion.coercer(Number, [coercion.integerCoercion(10)]).run(Context.Root('foo'));
            expect(result.isFailure).to.equal(true);
        });
    });
});
