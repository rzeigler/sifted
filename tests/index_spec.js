'use strict';

var chai = require('chai'),
    expect = chai.expect,
    sifted = require('../');

describe('index', function () {
    describe('#run', function () {
        it('should execute a processor', function () {
            expect(sifted.run(sifted.Constraint.isNumber, 1).value)
                .to.equal(1);
        });
    });
    describe('#runCont', function () {
        it('should execute a processor into a continuation', function () {
            sifted.runCont(sifted.Constraint.isNumber, 1, function (err, v) {
                expect(err).to.equal(null);
                expect(v).to.equal(1);
            });
        });
    });
});
