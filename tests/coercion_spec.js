(function (expect, sifter, constraint, coercion) {
    describe('coercion', function () {
        function isGt5(x) { return x > 5; }
        describe('#coercion', function () {
            var c = coercion.coercion(Number, [coercion.parseInteger(10)],
                                      constraint.constraint(isGt5, 'lt 5'));
            it('should coerce as per provided specifications', function () {
                expect(sifter.run(c, '9').s).to.equal(9);
            });
            it('should fail when coercions fail', function () {
                expect(sifter.run(c, 'abc')).to.have.property('f');
            });
            it('should fail when there is no viable coercion', function () {
                expect(sifter.run(c, new Date())).to.have.property('f');
            });
            it('should fail when constraints do not pass', function() {
                expect(sifter.run(c, '4')).to.have.property('f');
            });
        });
    });
}(
    require('chai').expect,
    require('../src/index'),
    require('../src/constraint'),
    require('../src/coercion')
));
