'use strict';

var chai = require('chai'),
    expect = chai.expect,
    chaiShallowDeepEqual = require('chai-shallow-deep-equal'),
    Maybe = require('data.maybe'),
    Validation = require('data.validation'),
    R = require('ramda'),
    T = require('../src/types');

chai.use(chaiShallowDeepEqual);

describe('types', function () {
    describe('Context', function () {
        describe('#derive', function() {
            var object = {a: {b: [1, 2, 3]}},
                context = T.Context.Root(object);
            it('should derive by path correctly', function () {
                expect(context.derive(T.Path.Property('a')).derive(T.Path.Property('b')).derive(T.Path.Index(1)).value.value)
                    .to.equal(2);
            });
            it('should produce paths lists', function () {
                var list = context.derive(T.Path.Property('a')).derive(T.Path.Property('b')).derive(T.Path.Index(1)).pathList();
                expect(list).to.have.length(3);
                expect(list.map(s => s.toString()).join('')).to.equal('["a"]["b"][1]');
            });
            it('should run to arbitrary depths', function () {
                var deep = {a: [{b: {c: [3, 4]}}]},
                    context = T.Context.Root(deep),
                    derived = context.derive(T.Path.Property('a')).derive(T.Path.Index(0)).derive(T.Path.Property('b')).derive(T.Path.Property('c')).derive(T.Path.Index(1));
                expect(derived.value)
                    .to.shallowDeepEqual(Maybe.Just(4));
                expect(derived.derive(T.Path.Index(0)).value)
                    .to.shallowDeepEqual(Maybe.Nothing());
            });
        });
    });
    describe('Processor', function () {
        var f1 = R.add(1),
            f2 = R.multiply(2),
            f3 = R.compose(f1, f2),
            Processor = T.Processor,
            Context = T.Context,
            Path = T.Path;
        describe('Functor', function () {
            // Null is used since Processor.of doesn't do anything with the input context
            it('should obey the identity law', function () {
                expect(Processor.of(1).map(R.identity).run(null))
                    .to.shallowDeepEqual(Processor.of(1).run(null));
            });
            it('should obey the composition law', function () {
                expect(Processor.of(1).map(f2).map(f1).run(null))
                    .to.shallowDeepEqual(Processor.of(1).map(f3).run(null));
            });
        });
        describe('Applicative', function () {
            it('should obey the identity law', function () {
                expect(T.Processor.of(R.identity).ap(T.Processor.of(1)).run(null))
                    .to.shallowDeepEqual(T.Processor.of(1).run(null));
            });
            it('should obey the composition law', function () {
                expect(Processor.of(R.curryN(2, R.compose))
                        .ap(Processor.of(f1))
                        .ap(Processor.of(f2))
                        .ap(Processor.of(1)).run(null))
                    .to.shallowDeepEqual(
                        Processor.of(f3).ap(Processor.of(1)).run(null)
                    );
            });
            it('should obey the homomorphism law', function () {
                expect(Processor.of(f1).ap(Processor.of(1)).run(null))
                    .to.shallowDeepEqual(Processor.of(f1(1)).run(null));
            });
            it('should obey the interchange law', function () {
                expect(Processor.of(f1).ap(Processor.of(1)).run(null))
                    .to.shallowDeepEqual(Processor.of(f => f(1)).ap(Processor.of(f1)).run(null));
            });
        });
        describe('Monad', function () {
            it('should obey the associativity law', function () {
                var pF1 = R.compose(Processor.of, f1),
                    pF2 = R.compose(Processor.of, f2);
                // m.chain(f).chain(g) is equivalent to m.chain(x => f(x).chain(g))
                expect(Processor.of(1).chain(pF1).chain(pF2).run(null))
                    .to.shallowDeepEqual(Processor.of(1).chain(x => pF1(x).chain(pF2)).run(null));
            });
        });
        describe('#identity',  function () {
            it('should return the value context', function () {
                expect(Processor.identity.run(Context.Root(1)))
                    .to.shallowDeepEqual(Validation.Success(Maybe.Just(1)));
            });
        });
        describe('#asks', function () {
            it('should lens on the element', function () {
                expect(Processor.identity.asks(Path.Property('a')).run(Context.Root({a: 1})))
                    .to.shallowDeepEqual(Validation.Success(Maybe.Just(1)));
            });
        });
    });
    describe('Sum', function () {
        describe('Monoid', function () {
            it('should implement associative concat', function () {
                
            });
        });
    });
});
