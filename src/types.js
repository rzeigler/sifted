(function (daggy, R) {
    var Key = daggy.taggedSum({
        Index: ['i'],
        Field: ['k']
    });

    Key.prototype.toString = function () {
        return this.cata({
            Index: function (x) { return x.toString(); },
            Field: function (x) { return '"' + x.toString() + '"'; }
        });
    };

    var Context = daggy.taggedSum({
        Root: [],
        Derived: ['from', 'key']
    });

    Context.prototype.toString = function () {
        return this.cata({
            Root: R.always(''),
            Derived: function (from, key) {
                return from.toString() + '[' + key.toString() + ']';
            }
        });
    };

    var Reason = daggy.tagged('context', 'message');

    Reason.prototype.toString = function () {
        return 'Error: ' + this.context.toString() + ' ' + this.message;
    };

    var Coercion = daggy.tagged('type', 'fn');

    module.exports = {
        Key: Key,
        Context: Context,
        Reason: Reason,
        Coercion: Coercion
    };
}(
    require('daggy'),
    require('ramda')
));
