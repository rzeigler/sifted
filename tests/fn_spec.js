'use strict';

(function (expect, Validation, fn) {
    describe('fn', function () {
        describe('#flowRight', function () {
            it('should take the right event', function () {
                expect(fn.flowRight(Validation.Success(1), Validation.Success(2)).s)
                .to.equal(2);
            });
            it('should fail on either being a failure', function () {
                expect(fn.flowRight(Validation.Failure(['a']), Validation.Success(2)))
                .to.have.property('f');
                expect(fn.flowRight(Validation.Success(['a']),
                Validation.Failure(['b'])))
                .to.have.property('f');
            });
        });
    });
}(
    require('chai').expect,
    require('fantasy-validations'),
    require('../src/fn')
));
