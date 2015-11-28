(function (daggy) {
    var Key = daggy.taggedSum({
        Index: ['i'],
        Field: ['k']
    });

    var Context = daggy.taggedSum({
        Root: [],
        Derived: ['from', 'key']
    });

    var Reason = daggy.tagged('context', 'message');

    var Coercion = daggy.tagged('type', 'fn');

    module.exports = {
        Key: Key,
        Context: Context,
        Reason: Reason,
        Coercion: Coercion
    };
}(
    require('daggy')
));
