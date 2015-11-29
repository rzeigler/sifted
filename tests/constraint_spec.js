(function (chai, chaiShallowDeepEqual, expect, Validation, S, C) {
    'use strict';
    chai.use(chaiShallowDeepEqual);

    function isPositive(x) { return x > 0; }

    function isLt3(x) { return x < 3; }

    function isGt5(x) { return x > 5; }

    function isLt7(x) { return x < 7; }

    var lt3 = C.constraint(isLt3, 'gt 3');

    describe('S', function () {
        describe('#constraint', function () {
            var c = C.constraint(isPositive, 'is negative');
            it('should create a constraint that returns Success on correctness', function () {
                expect(S.run(c, 5).s).to.equal(5);
            });
            it('should create a constraint that returns Failure on non-correctness', function () {
                expect(S.run(c, -1)).to.have.property('f');
            });
        });


        describe('#all', function () {
            var c = C.all([C.constraint(isGt5, 'is lt 5'),
            C.constraint(isLt7, 'is gt 7')]);
            it('should create a constraint that returns Success when all constituents return success', function () {
                expect(S.run(c, 6).s).to.equal(6);
            });
            it('should create a constraint that returns Failure when any constituents fail', function () {
                expect(S.run(c, 7)).to.have.property('f');
                expect(S.run(c, 4)).to.have.property('f');
            });
        });

        describe('#isA', function () {
            var c = C.isA(Number);
            it('should return success on matching types', function () {
                expect(S.run(c, 5).s).to.equal(5);
            });
            it('should return failure on non matching types', function () {
                expect(S.run(c, '5')).to.have.property('f');
            });
        });

        describe('#field', function () {
            var c = C.field('a', C.constraint(isGt5, 'lt 5')),
                optionalC = C.field('a', C.constraint(isGt5, 'lt 5'), {optional: true}),
                defaultedC = C.field('a', C.constraint(isGt5, 'lt 5'), {defaultVal: 6});
            it('should succeed when the field is present', function () {
                expect(S.run(c, {a: 6}).s).to.shallowDeepEqual({a: 6});
            });
            it('should fail when the field is not present', function () {
                expect(S.run(c, {})).to.have.property('f');
            });
            it('should fail when the field does not pass constraints', function () {
                expect(S.run(c, {a: 4})).to.have.property('f');
            });
            it('should succeed when the field is present with optional', function () {
                expect(S.run(optionalC, {a: 6}).s).to.shallowDeepEqual({a: 6});
            });
            it('should succeed with nothing when the field is not present and optional', function () {
                expect(S.run(optionalC, {}).s).to.shallowDeepEqual({});
            });
            it('should fail when the field does not pass constraints', function () {
                expect(S.run(optionalC, {a:4})).to.have.property('f');
            });
            it('should succeed when the field is present but optional', function () {
                expect(S.run(defaultedC, {a: 6}).s).to.shallowDeepEqual({a: 6});
            });
            it('should provide a default when the field is not present', function () {
                expect(S.run(defaultedC, {}).s).to.shallowDeepEqual({a: 6});
            });
            it('should fail when the field does not pass constraints', function () {
                expect(S.run(defaultedC, {a:4})).to.have.property('f');
            });
        });

        var gt5 = C.constraint(isGt5, 'lt 5');
        describe('#object', function () {
            var c = C.object([
                C.field('a', gt5),
                C.field('b', C.valid)
            ]);
            it('should succeed on valid input', function () {
                expect(S.run(c, {a: 6, b: 's'}).s).to.shallowDeepEqual({a: 6, b: 's'});
            });
            it('should fail on invalid input', function () {
                expect(S.run(c, {a: 4, b: 's'})).to.have.property('f');
                expect(S.run(c, {b: 's'})).to.have.property('f');
                expect(S.run(c, {a: 6})).to.have.property('f');
                expect(S.run(c, {})).to.have.property('f');
            });
        });

        describe('#array', function () {
            var c = C.array(C.valid, gt5),
                lenC = C.array(lt3, gt5);

            it('should succeed on all elements', function () {
                expect(S.run(c, [6, 7, 8]).s).to.shallowDeepEqual([6, 7, 8]);
            });
            it('should fail on bad elems', function () {
                expect(S.run(c, [6, 4, 3])).to.have.property('f');
            });
            it('should succeed on good lengths', function () {
                expect(S.run(lenC, [6, 7]).s).to.shallowDeepEqual([6, 7]);
            });
            it('should fail on bad lengths', function () {
                expect(S.run(lenC, [6, 7, 8, 9])).to.have.property('f');
            });
            it('should fail on invalid with a length spec', function () {
                expect(S.run(lenC, [6, 7, 8, 4])).to.have.property('f');
                expect(S.run(lenC, [6, 7, 8, 4]).f.length).to.equal(2); // 1 failure for len, 1 for invalid item
            });
        });
    });

    describe('#isIn', function () {
        var c = C.isIn([1, 2]);
        it('should succeed on valid inputs', function () {
            expect(S.run(c, 1).s).to.equal(1);
            expect(S.run(c, 2).s).to.equal(2);
        });
        it('should fail on invalid inputs', function () {
            expect(S.run(c, 3)).to.have.property('f');
        });
    });

    describe('#isGt', function () {
        var c = C.isGt(5);
        it('should succeed on valid inputs', function() {
            expect(S.run(c, 6).s).to.equal(6);
        });
        it('should fail on invalid inputs', function () {
            expect(S.run(c, 5)).to.have.property('f');
        });
    });

    describe('#isGte', function () {
        var c = C.isGte(5);
        it('should succeed on valid inputs', function() {
            expect(S.run(c, 5).s).to.equal(5);
            expect(S.run(c, 6).s).to.equal(6);
        });
        it('should fail on invalid inputs', function () {
            expect(S.run(c, 4)).to.have.property('f');
        });
    });

    describe('#isLt', function () {
        var c = C.isLt(5);
        it('should succeed on valid inputs', function() {
            expect(S.run(c, 4).s).to.equal(4);
        });
        it('should fail on invalid inputs', function () {
            expect(S.run(c, 5)).to.have.property('f');
        });
    });

    describe('#isGte', function () {
        var c = C.isLte(5);
        it('should succeed on valid inputs', function() {
            expect(S.run(c, 5).s).to.equal(5);
            expect(S.run(c, 4).s).to.equal(4);
        });
        it('should fail on invalid inputs', function () {
            expect(S.run(c, 6)).to.have.property('f');
        });
    });

    it('should allow for complex hierarchical constraints', function () {
        var c = C.object([
            C.field('a', C.array(C.valid, C.isNumber)),
            C.field('b', C.isString),
            C.field('c', C.array(lt3,
                                 C.object([
                                     C.field('q', C.isString)
                                 ])))
        ]);

        it('should succeed on valid input', function () {
            expect(S.run(c, {
                a: [5, 6],
                b: 'hi',
                c: [{q: 'world'}]
            })).to.shallowDeepEqual({
                a: [5, 6],
                b: 'hi',
                c: [{q: 'world'}]
            });
        });

        it('should fail on invalid input', function () {
            expect(S.run(c, {
                a: [5, 6],
                b: 7,
                c: [{q: 'world'}]
            })).to.have.property('f');

            expect(S.run(c, {
                a: [5, 6],
                b: 7,
                c: ['world']
            })).to.have.property('f');
        });
    });
}(
    require('chai'),
    require('chai-shallow-deep-equal'),
    require('chai').expect,
    require('fantasy-validations'),
    require('../src/index'),
    require('../src/constraint')
));
