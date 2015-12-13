'use strict';

var chai = require('chai'),
    expect = chai.expect,
    shallowDeepEqual = require('chai-shallow-deep-equal'),
    Validation = require('data.validation'),
    Maybe = require('data.maybe'),
    constraint = require('../src/constraint'),
    T = require('../src/types'),
    Context = T.Context,
    Reason = T.Reason;

chai.use(shallowDeepEqual);

describe('constraint', function () {
    describe('#exists', function () {
        it('should succeed on present input', function () {
            expect(constraint.exists.run(Context.Root(5)))
                .to.shallowDeepEqual(Validation.Success(5));
        });
        it('should fail on missing input', function () {
            var context = Context.Root(null);
            expect(constraint.exists.run(context))
                .to.shallowDeepEqual(Validation.Failure([new Reason(context, 'value is not defined')]));
        });
    });
    describe('#anything', function () {
        it('should succeed on present input', function () {
            expect(constraint.anything.run(Context.Root(5)))
                .to.shallowDeepEqual(Validation.Success(Maybe.Just(5)));
        });
        it('should succeed on absent input', function () {
            expect(constraint.anything.run(Context.Root(null)))
                .to.shallowDeepEqual(Validation.Success(Maybe.Nothing()));
        });
    });
    describe('#check', function () {
        function isEven(x) { return x % 2 === 0; }
        it('should succeed on valid input', function () {
            expect(constraint.check(isEven, 'is not even').run(Context.Root(2)))
                .to.shallowDeepEqual(Validation.Success(2));
        });
        it('should fail on invalid input', function () {
            var context = Context.Root(3);
            expect(constraint.check(isEven, 'is not even').run(context))
                .to.shallowDeepEqual(Validation.Failure([new Reason(context, 'is not even')]));
        });
    });
    describe('#last', function () {
        var isEven = constraint.check(x => x % 2 === 0, 'is not even'),
            isPos = constraint.check(x => x > 0, 'is not positive'),
            composite = constraint.last([isEven, isPos]);
        it('it should succeed when all succeed', function () {
            expect(composite.run(Context.Root(2)))
                .to.shallowDeepEqual(Validation.Success(2));
        });
        it('should fail with the sum of component failures', function () {
            var context = Context.Root(-1);
            expect(composite.run(context))
                .to.shallowDeepEqual(Validation.Failure([new Reason(context, 'is not even'),
                                                         new Reason(context, 'is not positive')]));
        });
    });
    describe('#property', function () {
        var evenProperty = constraint.property(constraint.check(x => x % 2 === 0, 'is not even'));
        it('should succeed with a tuple on valid input', function () {
            expect(evenProperty('a').run(Context.Root({a: 2})))
                .to.shallowDeepEqual(Validation.Success(['a', 2]));
        });
        it('should fail on invalid inputs', function () {
            expect(evenProperty('a').run(Context.Root({a: 1})).isFailure)
                .to.equal(true);
        });
        it('should fail when the shown field isn\'t available', function () {
            expect(evenProperty('a').run(Context.Root({b: 1})).isFailure)
                .to.equal(true);
        });
    });

    describe('#optionalProperty', function () {
        var evenProperty = constraint.optionalProperty(constraint.check(x => x % 2 === 0, 'is not even'), {});
        it('should succeed with a tuple on valid input', function () {
            expect(evenProperty('a').run(Context.Root({a: 2})))
                .to.shallowDeepEqual(Validation.Success(['a', 2]));
        });
        it('should fail on invalid inputs', function () {
            expect(evenProperty('a').run(Context.Root({a: 1})).isFailure)
                .to.equal(true);
        });
        it('should succeed when the shown field isn\'t available', function () {
            expect(evenProperty('a').run(Context.Root({b: 1})))
                .to.shallowDeepEqual(Validation.Success([]));
        });
        it('should succeed with default when present', function () {
            var prop = constraint.optionalProperty(constraint.check(x => x % 2 === 0, 'is not even'), {default: 4});
            expect(prop('a').run(Context.Root({b: 1})))
                .to.shallowDeepEqual(Validation.Success(['a', 4]));
        });
        it('should fail when default is present but value disagrees', function () {
            var prop = constraint.optionalProperty(constraint.check(x => x % 2 === 0, 'is not even'), {default: 4});
            expect(prop('a').run(Context.Root({a: 1})).isFailure)
                .to.shallowDeepEqual(true);
        });
    });
    describe('#rejectProperty', function () {
        it('should succeed with an empty array when the property is absent', function () {
            expect(constraint.rejectProperty('a').run(Context.Root({b: 1})))
                .to.shallowDeepEqual(Validation.Success([]));
        });
        it('should fail when the property is present', function () {
            expect(constraint.rejectProperty('a').run(Context.Root({a: 1})).isFailure)
                .to.equal(true);
        });
    });
    describe('#assoc', function () {
        var evenProperty = constraint.property(constraint.check(x => x % 2 === 0, 'is not even')),
            oddProperty = constraint.property(constraint.check(x => x % 2 === 1, 'is not odd')),
            association = constraint.assoc([
                evenProperty('a'),
                oddProperty('b'),
                evenProperty('c')
            ]);
        it('should succeed on fully valid input', function () {
            expect(association.run(Context.Root({a: 2, b: 1, c: 4})))
                .to.shallowDeepEqual(Validation.Success({a: 2, b: 1, c: 4}));
        });
        it('should fail with accumulated errors', function () {
            var result = association.run(Context.Root({a: 2, b: 2}));
            expect(result.isFailure).to.equal(true);
            expect(result.value.length).to.equal(2);
        });
    });

    describe('#array', function () {
        var isEven = constraint.check(x => x % 2 === 0, 'is not even'),
            evenArray = constraint.array(constraint.exists, isEven);
        it('should succeed on valid input', function () {
            expect(evenArray.run(Context.Root([2, 4, 6, 8])))
                .to.shallowDeepEqual(Validation.Success([2, 4, 6, 8]));
        });
        it('should fail with accumulated errors', function () {
            var result = evenArray.run(Context.Root([2, 5, 8, 9]));
            expect(result.isFailure).to.equal(true);
            expect(result.value.length).to.equal(2);
        });
        it('should fail when input is not an array', function () {
            var result = evenArray.run(Context.Root({}));
            expect(result.isFailure).to.equal(true);
        });
    });

    describe('#isEq', function () {
        var isEq1 = constraint.isEq(1);
        it('should succeed on valid input', function () {
            expect(isEq1.run(Context.Root(1)))
                .to.shallowDeepEqual(Validation.Success(1));
        });
        it('should fail on invalid input', function () {
            expect(isEq1.run(Context.Root(2)).isFailure)
                .to.equal(true);
        });
    });

    describe('#isA', function () {
        it('should succeed on correctly typed input', function () {
            expect(constraint.isString.run(Context.Root('hi')))
                .to.shallowDeepEqual(Validation.Success('hi'));
        });
        it('should fail on invalid input', function () {
            expect(constraint.isString.run(Context.Root(1)).isFailure)
                .to.equal(true);
        });
    });

    it('should compose hierarchically', function () {
        var evenProperty = constraint.property(constraint.check(x => x % 2 === 0, 'is not even')),
            oddProperty = constraint.property(constraint.check(x => x % 2 === 1, 'is not odd')),
            isEven = constraint.check(x => x % 2 === 0, 'is not even'),
            evenArray = constraint.array(constraint.exists, isEven),
            assocArray = constraint.array(constraint.exists, constraint.assoc([oddProperty('o')])),
            association = constraint.assoc([
                evenProperty('a'),
                oddProperty('b'),
                constraint.property(evenArray, 'c'),
                constraint.optionalProperty(assocArray, {}, 'd')
            ]);
        expect(association.run(Context.Root({a: 2, b: 1, c: [2, 4], d: [{o: 1}]})))
            .to.shallowDeepEqual(Validation.Success({a: 2, b: 1, c: [2, 4], d: [{o: 1}]}));
        expect(association.run(Context.Root({a: 2, b: 1, c: [2, 4]})))
            .to.shallowDeepEqual(Validation.Success({a: 2, b: 1, c: [2, 4]}));
    });
});
