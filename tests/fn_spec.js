'use strict';

var chai = require('chai'),
    expect = chai.expect,
    fn = require('../src/fn'),
    Maybe = require('data.maybe');

describe('fn', function () {
    describe('#flowRight', function () {
        it('should take the right event', function () {
            expect(fn.flowRight(Maybe.Just(1), Maybe.Just(2)).value)
                .to.equal(2);
        });
        it('should fail on either being a failure', function () {
            expect(fn.flowRight(Maybe.Nothing(), Maybe.Just(2)))
                .to.not.have.property('value');
            expect(fn.flowRight(Maybe.Just('a'),Maybe.Nothing()))
                .to.not.have.property('value');
        });
    });
    describe('#flowLeft', function () {
        it('should take the left event', function () {
            expect(fn.flowLeft(Maybe.Just(1), Maybe.Just(2)).value)
                .to.equal(1);
        });
        it('should fail on either being a failure', function () {
            expect(fn.flowLeft(Maybe.Nothing(), Maybe.Just(2)))
                .to.not.have.property('value');
            expect(fn.flowLeft(Maybe.Just('a'),Maybe.Nothing()))
                .to.not.have.property('value');
        });
    });
});
