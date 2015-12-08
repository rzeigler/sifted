'use strict';

var R = require('ramda'),
    Maybe = require('data.maybe'),
    Validation = require('data.validation'),
    fn = require('./fn');

function Path () { }
Path.prototype.toString = fn.unimplemented;
Path.prototype.cata = fn.unimplemented;
Path.Index = function (n) {
    return new Index(n);
};
Path.Property = function (p) {
    return new Property(p);
};

function Index(n) {
    this.n = n;
}
Index.prototype = Object.create(Path.prototype);
Index.prototype.isIndex = true;
Index.prototype.toString = function () {
    return '[' +  this.n.toString() + ']';
};
Index.prototype.cata = function (dispatch) {
    return dispatch.Index(this.n);
};


function Property(p) {
    this.p = p;
}
Property.prototype.isProperty = true;
Property.prototype = Object.create(Path.prototype);
Property.prototype.toString = function () {
    return '["' + this.p.toString() + '"]';
};
Property.prototype.cata = function (dispatch) {
    return dispatch.Property(this.p);
};

// Context defines a location within an object along with the value at that
// position
function Context () { }
Context.Root = function (value) { return new Root(Maybe.fromNullable(value)); };
Context.Derived = function (enclosing, path, value) { return new Derived(enclosing, path, Maybe.fromNullable(value)); };
Context.prototype.cata = fn.unimplemented;
Context.prototype.pathList = fn.unimplemented;
Context.prototype.derive = function (path) {
    // We can just pluck the value of the cata to update the context
    // Derive constructor will handle the Maybe case
    var self = this,
        dispatch = {
            Index: R.identity,
            Property: R.identity
        };
    return self.value.map(value => Context.Derived(self, path, value[path.cata(dispatch)]))
        .getOrElse(Context.Derived(self, path, Maybe.Nothing()));
};

function Root (value) {
    this.value = value;
}
Root.prototype.isRoot = true;
Root.prototype = Object.create(Context.prototype);
Root.prototype.cata = function (dispatch) {
    return dispatch.Root(this.value);
};
Root.prototype.pathList = R.always([]);

function Derived(enclosing, path, value) {
    this.enclosing = enclosing;
    this.path = path;
    this.value = value;
}
Derived.prototype.isDerived = true;
Derived.prototype = Object.create(Context.prototype);
Derived.prototype.cata = function (dispatch) {
    return dispatch.Derived(this.enclosing, this.path, this.value);
};
Derived.prototype.pathList = function() {
    return R.concat(this.enclosing.pathList(), R.of(this.path));
};

function Reason(context, message) {
    this.context = context;
    this.message = message;
}
Reason.prototype.toString = function () {
    return this.context.pathList().map(x => x.toString()).join('') + ': ' + this.context.value + ' - ' + this.message;
};

// The core type for all operations.
// run should be a function of type Context -> Validation[Array[Reason], Output]
function Processor(run) {
    this.run = run;
}
Processor.prototype.map = function (fn) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context).map(fn);
    });
};
Processor.prototype.of = Processor.of = function (x) {
    return new Processor(function () { return Validation.Success(x); });
};
Processor.prototype.ap = function (other) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context).ap(other.run(context));
    });
};
Processor.prototype.chain = function (fn) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context)
            .fold(Validation.Failure, v => fn(v).run(context));
    });
};
Processor.prototype.concat = function (other, concat) {
    var self = this;
    return new Processor(function (context) {
        // Map to Id to get augmented concat logic then map back
        var append = concat || (a => b => a.concat(b));
        return self.run(context)
            .map(a => other.run(context)
                .map(b => append(a, b)));
    });
};
// Create a derived processor that returns a successful result from this, or a
// successful result from the other. The error message will be that of the second
// in the case of both being a failure
Processor.prototype.orElse = function (other) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context).orElse(function () { return other.run(context); });
    });
};
// Applicatively sequence actions, taking the result of the second
Processor.prototype.andThen = function (other) {
    var self = this;
    return Processor.of(R.always(R.identity))
        .ap(self)
        .ap(other);
};
// Applicatively sequence actions, taking the result of the first
Processor.prototype.onlyIf = function (other) {
    var self = this;
    return Processor.of(R.always)
        .ap(self)
        .ap(other);
};
// Create a new derived processor that overrides the error message.
Processor.prototype.errorMessage = function (msg) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context)
            .fold(R.always(Reason(context, msg)), Validation.Success);
    });
};
// Create a processor
Processor.prototype.asks = function (path) {
    var self = this;
    return new Processor(function (context) {
        return self.run(context.derive(path));
    });
};
Processor.asks = R.curry(function (processor, path) {
    return processor.asks(path);
});
// A processor which returns the value in context.
// identity : Context -> Validation[[Reason], Maybe[a]]
Processor.identity = new Processor(function (context) {
    return Validation.Success(context.value);
});

module.exports = {
    Path: Path,
    Reason: Reason,
    Context: Context,
    Processor: Processor
};
