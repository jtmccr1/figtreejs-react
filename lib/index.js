'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime_1 = createCommonjsModule(function (module) {
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
   module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}
});

var regenerator = runtime_1;

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
});

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }

    return arr2;
  }
}

var arrayWithoutHoles = _arrayWithoutHoles;

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

var iterableToArray = _iterableToArray;

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var nonIterableSpread = _nonIterableSpread;

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
}

var toConsumableArray = _toConsumableArray;

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

var arrayWithHoles = _arrayWithHoles;

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

var iterableToArrayLimit = _iterableToArrayLimit;

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var nonIterableRest = _nonIterableRest;

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}

var slicedToArray = _slicedToArray;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var createClass = _createClass;

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector(compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
}

function ascendingComparator(f) {
  return function(d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;

function variance(values, valueof) {
  let count = 0;
  let delta;
  let mean = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        delta = value - mean;
        mean += delta / ++count;
        sum += delta * (value - mean);
      }
    }
  }
  if (count > 1) return sum / (count - 1);
}

function deviation(values, valueof) {
  const v = variance(values, valueof);
  return v ? Math.sqrt(v) : v;
}

function extent(values, valueof) {
  let min;
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min === undefined) {
          if (value >= value) min = max = value;
        } else {
          if (min > value) min = value;
          if (max < value) max = value;
        }
      }
    }
  }
  return [min, max];
}

function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;

  var i = -1,
      n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
      range = new Array(n);

  while (++i < n) {
    range[i] = start + i * step;
  }

  return range;
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    start = Math.floor(start * step);
    stop = Math.ceil(stop * step);
    ticks = new Array(n = Math.ceil(start - stop + 1));
    while (++i < n) ticks[i] = (start - i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

function max(values, valueof) {
  let max;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (max < value || (max === undefined && value >= value))) {
        max = value;
      }
    }
  }
  return max;
}

function min(values, valueof) {
  let min;
  if (valueof === undefined) {
    for (const value of values) {
      if (value != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null
          && (min > value || (min === undefined && value >= value))) {
        min = value;
      }
    }
  }
  return min;
}

// Based on https://github.com/mourner/quickselect
// ISC license, Copyright 2018 Vladimir Agafonkin.
function quickselect(array, k, left = 0, right = array.length - 1, compare = ascending) {
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k - left + 1;
      const z = Math.log(n);
      const s = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
      const newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
      quickselect(array, k, newLeft, newRight, compare);
    }

    const t = array[k];
    let i = left;
    let j = right;

    swap(array, left, k);
    if (compare(array[right], t) > 0) swap(array, left, right);

    while (i < j) {
      swap(array, i, j), ++i, --j;
      while (compare(array[i], t) < 0) ++i;
      while (compare(array[j], t) > 0) --j;
    }

    if (compare(array[left], t) === 0) swap(array, left, j);
    else ++j, swap(array, j, right);

    if (j <= k) left = j + 1;
    if (k <= j) right = j - 1;
  }
  return array;
}

function swap(array, i, j) {
  const t = array[i];
  array[i] = array[j];
  array[j] = t;
}

function* numbers(values, valueof) {
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        yield value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        yield value;
      }
    }
  }
}

function quantile(values, p, valueof) {
  values = Float64Array.from(numbers(values, valueof));
  if (!(n = values.length)) return;
  if ((p = +p) <= 0 || n < 2) return min(values);
  if (p >= 1) return max(values);
  var n,
      i = (n - 1) * p,
      i0 = Math.floor(i),
      value0 = max(quickselect(values, i0).subarray(0, i0 + 1)),
      value1 = min(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}

function mean(values, valueof) {
  let count = 0;
  let sum = 0;
  if (valueof === undefined) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum += value;
      }
    }
  }
  if (count) return sum / count;
}

var t0 = new Date,
    t1 = new Date;

function newInterval(floori, offseti, count, field) {

  function interval(date) {
    return floori(date = arguments.length === 0 ? new Date : new Date(+date)), date;
  }

  interval.floor = function(date) {
    return floori(date = new Date(+date)), date;
  };

  interval.ceil = function(date) {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };

  interval.round = function(date) {
    var d0 = interval(date),
        d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };

  interval.offset = function(date, step) {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };

  interval.range = function(start, stop, step) {
    var range = [], previous;
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    do range.push(previous = new Date(+start)), offseti(start, step), floori(start);
    while (previous < start && start < stop);
    return range;
  };

  interval.filter = function(test) {
    return newInterval(function(date) {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, function(date, step) {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    });
  };

  if (count) {
    interval.count = function(start, end) {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };

    interval.every = function(step) {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null
          : !(step > 1) ? interval
          : interval.filter(field
              ? function(d) { return field(d) % step === 0; }
              : function(d) { return interval.count(0, d) % step === 0; });
    };
  }

  return interval;
}

var durationMinute = 6e4;
var durationDay = 864e5;
var durationWeek = 6048e5;

var day = newInterval(function(date) {
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setDate(date.getDate() + step);
}, function(start, end) {
  return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay;
}, function(date) {
  return date.getDate() - 1;
});

function weekday(i) {
  return newInterval(function(date) {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setDate(date.getDate() + step * 7);
  }, function(start, end) {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}

var sunday = weekday(0);
var monday = weekday(1);
var tuesday = weekday(2);
var wednesday = weekday(3);
var thursday = weekday(4);
var friday = weekday(5);
var saturday = weekday(6);

var year = newInterval(function(date) {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, function(date, step) {
  date.setFullYear(date.getFullYear() + step);
}, function(start, end) {
  return end.getFullYear() - start.getFullYear();
}, function(date) {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
year.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setFullYear(date.getFullYear() + step * k);
  });
};

var utcDay = newInterval(function(date) {
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCDate(date.getUTCDate() + step);
}, function(start, end) {
  return (end - start) / durationDay;
}, function(date) {
  return date.getUTCDate() - 1;
});

function utcWeekday(i) {
  return newInterval(function(date) {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, function(start, end) {
    return (end - start) / durationWeek;
  });
}

var utcSunday = utcWeekday(0);
var utcMonday = utcWeekday(1);
var utcTuesday = utcWeekday(2);
var utcWednesday = utcWeekday(3);
var utcThursday = utcWeekday(4);
var utcFriday = utcWeekday(5);
var utcSaturday = utcWeekday(6);

var utcYear = newInterval(function(date) {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, function(date, step) {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, function(start, end) {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, function(date) {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = function(k) {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : newInterval(function(date) {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, function(date, step) {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}

function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}

function newDate(y, m, d) {
  return {y: y, m: m, d: d, H: 0, M: 0, S: 0, L: 0};
}

function formatLocale(locale) {
  var locale_dateTime = locale.dateTime,
      locale_date = locale.date,
      locale_time = locale.time,
      locale_periods = locale.periods,
      locale_weekdays = locale.days,
      locale_shortWeekdays = locale.shortDays,
      locale_months = locale.months,
      locale_shortMonths = locale.shortMonths;

  var periodRe = formatRe(locale_periods),
      periodLookup = formatLookup(locale_periods),
      weekdayRe = formatRe(locale_weekdays),
      weekdayLookup = formatLookup(locale_weekdays),
      shortWeekdayRe = formatRe(locale_shortWeekdays),
      shortWeekdayLookup = formatLookup(locale_shortWeekdays),
      monthRe = formatRe(locale_months),
      monthLookup = formatLookup(locale_months),
      shortMonthRe = formatRe(locale_shortMonths),
      shortMonthLookup = formatLookup(locale_shortMonths);

  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };

  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };

  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);

  function newFormat(specifier, formats) {
    return function(date) {
      var string = [],
          i = -1,
          j = 0,
          n = specifier.length,
          c,
          pad,
          format;

      if (!(date instanceof Date)) date = new Date(+date);

      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);
          else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }

      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }

  function newParse(specifier, Z) {
    return function(string) {
      var d = newDate(1900, undefined, 1),
          i = parseSpecifier(d, specifier, string += "", 0),
          week, day$1;
      if (i != string.length) return null;

      // If a UNIX timestamp is specified, return it.
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

      // If this is utcParse, never use the local timezone.
      if (Z && !("Z" in d)) d.Z = 0;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // If the month was not specified, inherit from the quarter.
      if (d.m === undefined) d.m = "q" in d ? d.q : 0;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day$1 = week.getUTCDay();
          week = day$1 > 4 || day$1 === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day$1 = week.getDay();
          week = day$1 > 4 || day$1 === 0 ? monday.ceil(week) : monday(week);
          week = day.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day$1 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day$1 + 5) % 7 : d.w + d.U * 7 - (day$1 + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return localDate(d);
    };
  }

  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
        n = specifier.length,
        m = string.length,
        c,
        parse;

    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || ((j = parse(d, string, j)) < 0)) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }

    return j;
  }

  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup[n[0].toLowerCase()], i + n[0].length) : -1;
  }

  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }

  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }

  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }

  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }

  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }

  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }

  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }

  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }

  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }

  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }

  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }

  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }

  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }

  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }

  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }

  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() { return specifier; };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() { return specifier; };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() { return specifier; };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() { return specifier; };
      return p;
    }
  };
}

var pads = {"-": "", "_": " ", "0": "0"},
    numberRe = /^\s*\d+/, // note: ignores next directive
    percentRe = /^%/,
    requoteRe = /[\\^$*+?|[\]().{}]/g;

function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
      string = (sign ? -value : value) + "",
      length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}

function requote(s) {
  return s.replace(requoteRe, "\\$&");
}

function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}

function formatLookup(names) {
  var map = {}, i = -1, n = names.length;
  while (++i < n) map[names[i].toLowerCase()] = i;
  return map;
}

function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}

function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}

function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}

function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}

function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}

function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}

function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}

function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}

function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}

function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}

function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}

function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}

function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}

function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}

function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
}

function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}

function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}

function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}

function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}

function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}

function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}

function formatDayOfYear(d, p) {
  return pad(1 + day.count(year(d), d), p, 3);
}

function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}

function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}

function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}

function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}

function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}

function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}

function formatWeekNumberSunday(d, p) {
  return pad(sunday.count(year(d) - 1, d), p, 2);
}

function formatWeekNumberISO(d, p) {
  var day = d.getDay();
  d = (day >= 4 || day === 0) ? thursday(d) : thursday.ceil(d);
  return pad(thursday.count(year(d), d) + (year(d).getDay() === 4), p, 2);
}

function formatWeekdayNumberSunday(d) {
  return d.getDay();
}

function formatWeekNumberMonday(d, p) {
  return pad(monday.count(year(d) - 1, d), p, 2);
}

function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}

function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}

function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+"))
      + pad(z / 60 | 0, "0", 2)
      + pad(z % 60, "0", 2);
}

function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}

function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}

function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}

function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}

function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}

function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}

function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}

function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}

function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}

function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}

function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}

function formatUTCWeekNumberISO(d, p) {
  var day = d.getUTCDay();
  d = (day >= 4 || day === 0) ? utcThursday(d) : utcThursday.ceil(d);
  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}

function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}

function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}

function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}

function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}

function formatUTCZone() {
  return "+0000";
}

function formatLiteralPercent() {
  return "%";
}

function formatUnixTimestamp(d) {
  return +d;
}

function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1000);
}

var locale;
var timeFormat;
var timeParse;
var utcFormat;
var utcParse;

defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  timeParse = locale.parse;
  utcFormat = locale.utcFormat;
  utcParse = locale.utcParse;
  return locale;
}

/**
 * Helper function to determine if the provided year is a leap year
 * @param year
 * @return {boolean}
 */

function leapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
/**
 * A function which converts a decimal float into a date object
 * @param decimalDate
 * @return {Date}
 */

function decimalToDate(decimal) {
  var year = Math.trunc(decimal);
  var totalNumberOfDays = leapYear(year) ? 366 : 365;
  var day = Math.round((decimal - year) * totalNumberOfDays);
  return timeParse("%Y-%j")("".concat(year, "-").concat(day));
}
/**
 * A function that converts a date into a decimal.
 * @param date
 * @return {number}
 */

function dateToDecimal(date) {
  var year = parseInt(timeFormat("%Y")(date));
  var day = parseInt(timeFormat("%j")(date));
  var totalNumberOfDays = leapYear(year) ? 366 : 365;
  return year + day / totalNumberOfDays;
} //https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function areEqualShallow(a, b) {
  for (var key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false;
    }
  }

  for (var key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}
var customDateFormater = function customDateFormater(formatString) {
  return function (d) {
    var dateFormat = timeFormat(formatString);
    return "".concat(dateFormat(decimalToDate(d)));
  };
};
var kdeFactory = function kdeFactory(kernel) {
  return function (thresholds) {
    return function (data) {
      return thresholds.map(function (t) {
        return [t, mean(data, function (d) {
          return kernel(t - d);
        })];
      });
    };
  };
};
function epanechnikov(bandwidth) {
  return function (x) {
    return Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
  };
}
function mergeMaps(target, source) {
  source.forEach(function (v, k) {
    return target.set(k, v);
  });
  return target;
}
function setParentMap(map, child, parent) {
  map.set(child.id, {
    node: child,
    parent: parent
  });
  return map;
}
function extent$1(iterator) {
  var accessor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function (x) {
    return x;
  };
  return reduceIterator(iterator, function (acc, curr) {
    var value = accessor(curr);

    if (value < acc[0]) {
      acc[0] = value;
    }

    if (value > acc[1]) {
      acc[1] = value;
    }

    return acc;
  }, [Infinity, -Infinity]);
} //https://stackoverflow.com/questions/43885365/using-map-on-an-iterator

function reduceIterator(iterator, reducer) {
  var startingValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var accumulator = startingValue;

  while (true) {
    var current = iterator.next();

    if (current.done) {
      return accumulator;
    }

    accumulator = reducer(accumulator, current.value);
  }
}

var bitset = createCommonjsModule(function (module, exports) {
/**
 * @license BitSet.js v5.1.1 2/1/2020
 * http://www.xarg.org/2014/03/javascript-bit-array/
 *
 * Copyright (c) 2020, Robert Eisele (robert@xarg.org)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 **/
(function(root) {

  /**
   * The number of bits of a word
   * @const
   * @type number
   */
  var WORD_LENGTH = 32;

  /**
   * The log base 2 of WORD_LENGTH
   * @const
   * @type number
   */
  var WORD_LOG = 5;

  /**
   * Calculates the number of set bits
   *
   * @param {number} v
   * @returns {number}
   */
  function popCount(v) {

    // Warren, H. (2009). Hacker`s Delight. New York, NY: Addison-Wesley

    v -= ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    return (((v + (v >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24);
  }

  /**
   * Divide a number in base two by B
   *
   * @param {Array} arr
   * @param {number} B
   * @returns {number}
   */
  function divide(arr, B) {

    var r = 0;

    for (var i = 0; i < arr.length; i++) {
      r *= 2;
      var d = (arr[i] + r) / B | 0;
      r = (arr[i] + r) % B;
      arr[i] = d;
    }
    return r;
  }

  /**
   * Parses the parameters and set variable P
   *
   * @param {Object} P
   * @param {string|BitSet|Array|Uint8Array|number=} val
   */
  function parse(P, val) {

    if (val == null) {
      P['data'] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      P['_'] = 0;
      return;
    }

    if (val instanceof BitSet) {
      P['data'] = val['data'];
      P['_'] = val['_'];
      return;
    }

    switch (typeof val) {

      case 'number':
        P['data'] = [val | 0];
        P['_'] = 0;
        break;

      case 'string':

        var base = 2;
        var len = WORD_LENGTH;

        if (val.indexOf('0b') === 0) {
          val = val.substr(2);
        } else if (val.indexOf('0x') === 0) {
          val = val.substr(2);
          base = 16;
          len = 8;
        }

        P['data'] = [];
        P['_'] = 0;

        var a = val.length - len;
        var b = val.length;

        do {

          var num = parseInt(val.slice(a > 0 ? a : 0, b), base);

          if (isNaN(num)) {
            throw SyntaxError('Invalid param');
          }

          P['data'].push(num | 0);

          if (a <= 0)
            break;

          a -= len;
          b -= len;
        } while (1);

        break;

      default:

        P['data'] = [0];
        var data = P['data'];

        if (val instanceof Array) {

          for (var i = val.length - 1; i >= 0; i--) {

            var ndx = val[i];

            if (ndx === Infinity) {
              P['_'] = -1;
            } else {
              scale(P, ndx);
              data[ndx >>> WORD_LOG] |= 1 << ndx;
            }
          }
          break;
        }

        if (Uint8Array && val instanceof Uint8Array) {

          var bits = 8;

          scale(P, val.length * bits);

          for (var i = 0; i < val.length; i++) {

            var n = val[i];

            for (var j = 0; j < bits; j++) {

              var k = i * bits + j;

              data[k >>> WORD_LOG] |= (n >> j & 1) << k;
            }
          }
          break;
        }
        throw SyntaxError('Invalid param');
    }
  }

  /**
   * Module entry point
   *
   * @constructor
   * @param {string|BitSet|number=} param
   * @returns {BitSet}
   */
  function BitSet(param) {

    if (!(this instanceof BitSet)) {
      return new BitSet(param);
    }
    parse(this, param);
    this['data'] = this['data'].slice();
  }

  function scale(dst, ndx) {

    var l = ndx >>> WORD_LOG;
    var d = dst['data'];
    var v = dst['_'];

    for (var i = d.length; l >= i; l--) {
      d.push(v);
    }
  }

  var P = {
    'data': [], // Holds the actual bits in form of a 32bit integer array.
    '_': 0 // Holds the MSB flag information to make indefinitely large bitsets inversion-proof
  };

  BitSet.prototype = {
    'data': [],
    '_': 0,
    /**
     * Set a single bit flag
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.set(3, 1);
     *
     * @param {number} ndx The index of the bit to be set
     * @param {number=} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    'set': function(ndx, value) {

      ndx |= 0;

      scale(this, ndx);

      if (value === undefined || value) {
        this['data'][ndx >>> WORD_LOG] |= (1 << ndx);
      } else {
        this['data'][ndx >>> WORD_LOG] &= ~(1 << ndx);
      }
      return this;
    },
    /**
     * Get a single bit flag of a certain bit position
     *
     * Ex:
     * bs1 = new BitSet();
     * var isValid = bs1.get(12);
     *
     * @param {number} ndx the index to be fetched
     * @returns {number} The binary flag
     */
    'get': function(ndx) {

      ndx |= 0;

      var d = this['data'];
      var n = ndx >>> WORD_LOG;

      if (n >= d.length) {
        return this['_'] & 1;
      }
      return (d[n] >>> ndx) & 1;
    },
    /**
     * Creates the bitwise NOT of a set.
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * res = bs1.not();
     *
     * @returns {BitSet} A new BitSet object, containing the bitwise NOT of this
     */
    'not': function() { // invert()

      var t = this['clone']();
      var d = t['data'];
      for (var i = 0; i < d.length; i++) {
        d[i] = ~d[i];
      }

      t['_'] = ~t['_'];

      return t;
    },
    /**
     * Creates the bitwise AND of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.and(bs2);
     *
     * @param {BitSet} value A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise AND of this and value
     */
    'and': function(value) {// intersection

      parse(P, value);

      var T = this['clone']();
      var t = T['data'];
      var p = P['data'];

      var pl = p.length;
      var p_ = P['_'];
      var t_ = T['_'];

      // If this is infinite, we need all bits from P
      if (t_ !== 0) {
        scale(T, pl * WORD_LENGTH - 1);
      }

      var tl = t.length;
      var l = Math.min(pl, tl);
      var i = 0;

      for (; i < l; i++) {
        t[i] &= p[i];
      }

      for (; i < tl; i++) {
        t[i] &= p_;
      }

      T['_'] &= p_;

      return T;
    },
    /**
     * Creates the bitwise OR of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.or(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise OR of this and val
     */
    'or': function(val) { // union

      parse(P, val);

      var t = this['clone']();
      var d = t['data'];
      var p = P['data'];

      var pl = p.length - 1;
      var tl = d.length - 1;

      var minLength = Math.min(tl, pl);

      // Append backwards, extend array only once
      for (var i = pl; i > minLength; i--) {
        d[i] = p[i];
      }

      for (; i >= 0; i--) {
        d[i] |= p[i];
      }

      t['_'] |= P['_'];

      return t;
    },
    /**
     * Creates the bitwise XOR of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.xor(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise XOR of this and val
     */
    'xor': function(val) { // symmetric difference

      parse(P, val);

      var t = this['clone']();
      var d = t['data'];
      var p = P['data'];

      var t_ = t['_'];
      var p_ = P['_'];

      var i = 0;

      var tl = d.length - 1;
      var pl = p.length - 1;

      // Cut if tl > pl
      for (i = tl; i > pl; i--) {
        d[i] ^= p_;
      }

      // Cut if pl > tl
      for (i = pl; i > tl; i--) {
        d[i] = t_ ^ p[i];
      }

      // XOR the rest
      for (; i >= 0; i--) {
        d[i] ^= p[i];
      }

      // XOR infinity
      t['_'] ^= p_;

      return t;
    },
    /**
     * Creates the bitwise AND NOT (not confuse with NAND!) of two sets.
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * res = bs1.notAnd(bs2);
     *
     * @param {BitSet} val A bitset object
     * @returns {BitSet} A new BitSet object, containing the bitwise AND NOT of this and other
     */
    'andNot': function(val) { // difference

      return this['and'](new BitSet(val)['flip']());
    },
    /**
     * Flip/Invert a range of bits by setting
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.flip(); // Flip entire set
     * bs1.flip(5); // Flip single bit
     * bs1.flip(3,10); // Flip a bit range
     *
     * @param {number=} from The start index of the range to be flipped
     * @param {number=} to The end index of the range to be flipped
     * @returns {BitSet} this
     */
    'flip': function(from, to) {

      if (from === undefined) {

        var d = this['data'];
        for (var i = 0; i < d.length; i++) {
          d[i] = ~d[i];
        }

        this['_'] = ~this['_'];

      } else if (to === undefined) {

        scale(this, from);

        this['data'][from >>> WORD_LOG] ^= (1 << from);

      } else if (0 <= from && from <= to) {

        scale(this, to);

        for (var i = from; i <= to; i++) {
          this['data'][i >>> WORD_LOG] ^= (1 << i);
        }
      }
      return this;
    },
    /**
     * Clear a range of bits by setting it to 0
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.clear(); // Clear entire set
     * bs1.clear(5); // Clear single bit
     * bs1.clear(3,10); // Clear a bit range
     *
     * @param {number=} from The start index of the range to be cleared
     * @param {number=} to The end index of the range to be cleared
     * @returns {BitSet} this
     */
    'clear': function(from, to) {

      var data = this['data'];

      if (from === undefined) {

        for (var i = data.length - 1; i >= 0; i--) {
          data[i] = 0;
        }
        this['_'] = 0;

      } else if (to === undefined) {

        from |= 0;

        scale(this, from);

        data[from >>> WORD_LOG] &= ~(1 << from);

      } else if (from <= to) {

        scale(this, to);

        for (var i = from; i <= to; i++) {
          data[i >>> WORD_LOG] &= ~(1 << i);
        }
      }
      return this;
    },
    /**
     * Gets an entire range as a new bitset object
     *
     * Ex:
     * bs1 = new BitSet();
     * bs1.slice(4, 8);
     *
     * @param {number=} from The start index of the range to be get
     * @param {number=} to The end index of the range to be get
     * @returns {BitSet} A new smaller bitset object, containing the extracted range
     */
    'slice': function(from, to) {

      if (from === undefined) {
        return this['clone']();
      } else if (to === undefined) {

        to = this['data'].length * WORD_LENGTH;

        var im = Object.create(BitSet.prototype);

        im['_'] = this['_'];
        im['data'] = [0];

        for (var i = from; i <= to; i++) {
          im['set'](i - from, this['get'](i));
        }
        return im;

      } else if (from <= to && 0 <= from) {

        var im = Object.create(BitSet.prototype);
        im['data'] = [0];

        for (var i = from; i <= to; i++) {
          im['set'](i - from, this['get'](i));
        }
        return im;
      }
      return null;
    },
    /**
     * Set a range of bits
     *
     * Ex:
     * bs1 = new BitSet();
     *
     * bs1.setRange(10, 15, 1);
     *
     * @param {number} from The start index of the range to be set
     * @param {number} to The end index of the range to be set
     * @param {number} value Optional value that should be set on the index (0 or 1)
     * @returns {BitSet} this
     */
    'setRange': function(from, to, value) {

      for (var i = from; i <= to; i++) {
        this['set'](i, value);
      }
      return this;
    },
    /**
     * Clones the actual object
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = bs1.clone();
     *
     * @returns {BitSet|Object} A new BitSet object, containing a copy of the actual object
     */
    'clone': function() {

      var im = Object.create(BitSet.prototype);
      im['data'] = this['data'].slice();
      im['_'] = this['_'];

      return im;
    },
    /**
     * Gets a list of set bits
     *
     * @returns {Array}
     */
    'toArray': Math['clz32'] ?
    function() {

      var ret = [];
      var data = this['data'];

      for (var i = data.length - 1; i >= 0; i--) {

        var num = data[i];

        while (num !== 0) {
          var t = 31 - Math['clz32'](num);
          num ^= 1 << t;
          ret.unshift((i * WORD_LENGTH) + t);
        }
      }

      if (this['_'] !== 0)
        ret.push(Infinity);

      return ret;
    } :
    function() {

      var ret = [];
      var data = this['data'];

      for (var i = 0; i < data.length; i++) {

        var num = data[i];

        while (num !== 0) {
          var t = num & -num;
          num ^= t;
          ret.push((i * WORD_LENGTH) + popCount(t - 1));
        }
      }

      if (this['_'] !== 0)
        ret.push(Infinity);

      return ret;
    },
    /**
     * Overrides the toString method to get a binary representation of the BitSet
     *
     * @param {number=} base
     * @returns string A binary string
     */
    'toString': function(base) {

      var data = this['data'];

      if (!base)
        base = 2;

      // If base is power of two
      if ((base & (base - 1)) === 0 && base < 36) {

        var ret = '';
        var len = 2 + Math.log(4294967295/*Math.pow(2, WORD_LENGTH)-1*/) / Math.log(base) | 0;

        for (var i = data.length - 1; i >= 0; i--) {

          var cur = data[i];

          // Make the number unsigned
          if (cur < 0)
            cur += 4294967296 /*Math.pow(2, WORD_LENGTH)*/;

          var tmp = cur.toString(base);

          if (ret !== '') {
            // Fill small positive numbers with leading zeros. The +1 for array creation is added outside already
            ret += '0'.repeat(len - tmp.length - 1);
          }
          ret += tmp;
        }

        if (this['_'] === 0) {

          ret = ret.replace(/^0+/, '');

          if (ret === '')
            ret = '0';
          return ret;

        } else {
          // Pad the string with ones
          ret = '1111' + ret;
          return ret.replace(/^1+/, '...1111');
        }

      } else {

        if ((2 > base || base > 36))
          throw SyntaxError('Invalid base');

        var ret = [];
        var arr = [];

        // Copy every single bit to a new array
        for (var i = data.length; i--; ) {

          for (var j = WORD_LENGTH; j--; ) {

            arr.push(data[i] >>> j & 1);
          }
        }

        do {
          ret.unshift(divide(arr, base).toString(base));
        } while (!arr.every(function(x) {
          return x === 0;
        }));

        return ret.join('');
      }
    },
    /**
     * Check if the BitSet is empty, means all bits are unset
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * bs1.isEmpty() ? 'yes' : 'no'
     *
     * @returns {boolean} Whether the bitset is empty
     */
    'isEmpty': function() {

      if (this['_'] !== 0)
        return false;

      var d = this['data'];

      for (var i = d.length - 1; i >= 0; i--) {
        if (d[i] !== 0)
          return false;
      }
      return true;
    },
    /**
     * Calculates the number of bits set
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var num = bs1.cardinality();
     *
     * @returns {number} The number of bits set
     */
    'cardinality': function() {

      if (this['_'] !== 0) {
        return Infinity;
      }

      var s = 0;
      var d = this['data'];
      for (var i = 0; i < d.length; i++) {
        var n = d[i];
        if (n !== 0)
          s += popCount(n);
      }
      return s;
    },
    /**
     * Calculates the Most Significant Bit / log base two
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var logbase2 = bs1.msb();
     *
     * var truncatedTwo = Math.pow(2, logbase2); // May overflow!
     *
     * @returns {number} The index of the highest bit set
     */
    'msb': Math['clz32'] ?
    function() {

      if (this['_'] !== 0) {
        return Infinity;
      }

      var data = this['data'];

      for (var i = data.length; i-- > 0;) {

        var c = Math['clz32'](data[i]);

        if (c !== WORD_LENGTH) {
          return (i * WORD_LENGTH) + WORD_LENGTH - 1 - c;
        }
      }
      return Infinity;
    } :
    function() {

      if (this['_'] !== 0) {
        return Infinity;
      }

      var data = this['data'];

      for (var i = data.length; i-- > 0;) {

        var v = data[i];
        var c = 0;

        if (v) {

          for (; (v >>>= 1) > 0; c++) {
          }
          return (i * WORD_LENGTH) + c;
        }
      }
      return Infinity;
    },
    /**
     * Calculates the number of trailing zeros
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var ntz = bs1.ntz();
     *
     * @returns {number} The index of the lowest bit set
     */
    'ntz': function() {

      var data = this['data'];

      for (var j = 0; j < data.length; j++) {
        var v = data[j];

        if (v !== 0) {

          v = (v ^ (v - 1)) >>> 1; // Set v's trailing 0s to 1s and zero rest

          return (j * WORD_LENGTH) + popCount(v);
        }
      }
      return Infinity;
    },
    /**
     * Calculates the Least Significant Bit
     *
     * Ex:
     * bs1 = new BitSet(10);
     *
     * var lsb = bs1.lsb();
     *
     * @returns {number} The index of the lowest bit set
     */
    'lsb': function() {

      var data = this['data'];

      for (var i = 0; i < data.length; i++) {

        var v = data[i];
        var c = 0;

        if (v) {

          var bit = (v & -v);

          for (; (bit >>>= 1); c++) {

          }
          return WORD_LENGTH * i + c;
        }
      }
      return this['_'] & 1;
    },
    /**
     * Compares two BitSet objects
     *
     * Ex:
     * bs1 = new BitSet(10);
     * bs2 = new BitSet(10);
     *
     * bs1.equals(bs2) ? 'yes' : 'no'
     *
     * @param {BitSet} val A bitset object
     * @returns {boolean} Whether the two BitSets have the same bits set (valid for indefinite sets as well)
     */
    'equals': function(val) {

      parse(P, val);

      var t = this['data'];
      var p = P['data'];

      var t_ = this['_'];
      var p_ = P['_'];

      var tl = t.length - 1;
      var pl = p.length - 1;

      if (p_ !== t_) {
        return false;
      }

      var minLength = tl < pl ? tl : pl;
      var i = 0;

      for (; i <= minLength; i++) {
        if (t[i] !== p[i])
          return false;
      }

      for (i = tl; i > pl; i--) {
        if (t[i] !== p_)
          return false;
      }

      for (i = pl; i > tl; i--) {
        if (p[i] !== t_)
          return false;
      }
      return true;
    },
    [Symbol.iterator]: function () {

      var d = this['data'];
      var ndx = 0;

      if (this['_'] === 0) {

        // Find highest index with something meaningful
        var highest = 0;
        for (var i = d.length - 1; i >= 0; i--) {
          if (d[i] !== 0) {
            highest = i;
            break;
          }
        }

        return {
          'next': function () {
            var n = ndx >>> WORD_LOG;

            return {
              'done': n > highest || n === highest && (d[n] >>> ndx) === 0,
              'value': n > highest ? 0 : (d[n] >>> ndx++) & 1
            };
          }
        };

      } else {
        // Endless iterator!
        return {
          'next': function () {
            var n = ndx >>> WORD_LOG;

            return {
              'done': false,
              'value': n < d.length ? (d[n] >>> ndx++) & 1 : 1,
            };
          }
        };
      }
    }
  };

  BitSet['fromBinaryString'] = function(str) {

    return new BitSet('0b' + str);
  };

  BitSet['fromHexString'] = function(str) {

    return new BitSet('0x' + str);
  };

  BitSet['Random'] = function(n) {

    if (n === undefined || n < 0) {
      n = WORD_LENGTH;
    }

    var m = n % WORD_LENGTH;

    // Create an array, large enough to hold the random bits
    var t = [];
    var len = Math.ceil(n / WORD_LENGTH);

    // Create an bitset instance
    var s = Object.create(BitSet.prototype);

    // Fill the vector with random data, uniformally distributed
    for (var i = 0; i < len; i++) {
      t.push(Math.random() * 4294967296 | 0);
    }

    // Mask out unwanted bits
    if (m > 0) {
      t[len - 1] &= (1 << m) - 1;
    }

    s['data'] = t;
    s['_'] = 0;
    return s;
  };

  {
    Object.defineProperty(exports, "__esModule", { 'value': true });
    BitSet['default'] = BitSet;
    BitSet['BitSet'] = BitSet;
    module['exports'] = BitSet;
  }

})();
});

var BitSet = unwrapExports(bitset);

var _marked =
/*#__PURE__*/
regenerator.mark(postorder);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var Type = {
  DISCRETE: Symbol("DISCRETE"),
  BOOLEAN: Symbol("BOOLEAN"),
  INTEGER: Symbol("INTEGER"),
  FLOAT: Symbol("FLOAT"),
  PROBABILITIES: Symbol("PROBABILITIES"),
  DATE: Symbol("DATE")
};
var ImmutableTree =
/*#__PURE__*/
function () {
  function ImmutableTree(treeData) {
    classCallCheck(this, ImmutableTree);

    this.tree = treeData;
    this.getDivergence = this.getDivergence();
  }

  createClass(ImmutableTree, [{
    key: "getRoot",
    value: function getRoot() {
      return this.tree.root;
    }
  }, {
    key: "getNode",
    value: function getNode(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      return this.tree.nodesById[id];
    }
  }, {
    key: "getParent",
    value: function getParent(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      return this.getNode(id).parent;
    }
  }, {
    key: "getChildren",
    value: function getChildren(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      return this.tree.nodesById[id].children;
    }
  }, {
    key: "getLength",
    value: function getLength(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      return this.tree.nodesById[id].length;
    }
  }, {
    key: "getClade",
    value: function getClade(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      return this.tree.nodesById[id].clade;
    }
  }, {
    key: "getClades",
    value: function getClades() {
      return this.tree.clades;
    }
  }, {
    key: "getNodeAnnotations",
    value: function getNodeAnnotations(id) {
      return this.tree.annotationsById[id];
    }
  }, {
    key: "getAnnotation",
    value: function getAnnotation(id) {
      return this.tree.annotationTypes[id];
    }
  }, {
    key: "getExternalNodes",
    value: function getExternalNodes() {
      return this.tree.externalNodes;
    }
  }, {
    key: "getInternalNodes",
    value: function getInternalNodes() {
      return this.tree.internalNodes;
    }
  }, {
    key: "getPostOrder",
    value: function getPostOrder() {
      return this.tree.postOrder;
    }
  }, {
    key: "getPreOrder",
    value: function getPreOrder() {
      return this.tree.postOrder.reverse();
    }
  }, {
    key: "getDivergence",
    value: function getDivergence() {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      var self = this;
      var cache = {};
      return function divergenceHelper(id) {
        var value;

        if (id in cache) {
          value = cache[id];
        } else {
          value = id !== self.getRoot() ? divergenceHelper(self.getParent(id)) + self.getLength(id) : 0;
          cache[id] = value;
        }

        return value;
      };
    }
  }, {
    key: "getRootToTipLengths",
    value: function getRootToTipLengths() {
      var _this = this;

      return this.tree.postOrder.map(function (id) {
        return _this.getDivergence(id);
      });
    }
  }, {
    key: "getHeight",
    value: function getHeight(id) {
      /*        if(!(id in this.tree.nodesById)){
                  throw new Error(`id ${id} not recognized in tree`)
              }*/
      var self = this;
      var maxDivergence = null;
      return function f(id) {
        if (!maxDivergence) {
          maxDivergence = max(self.getRootToTipLengths());
        }

        return maxDivergence - self.getDivergence(id);
      }(id);
    }
  }, {
    key: "orderByNodeDensity",
    value: function orderByNodeDensity() {
      var increasing = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getRoot();
      var factor = increasing ? 1 : -1;
      orderNodes.call(this, node, function (nodeA, countA, nodeB, countB) {
        return (countA - countB) * factor;
      });
      return this;
    }
  }, {
    key: "collapseUnsupportedNodes",
    value: function collapseUnsupportedNodes() {}
  }, {
    key: "setLength",
    value: function setLength(id, length) {
      this.tree.nodesById[id].length = length;
      return new ImmutableTree(this.tree);
    }
  }], [{
    key: "parseNexus",
    value: function parseNexus(nexus) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var trees = []; // odd parts ensure we're not in a taxon label
      //TODO make this parsing more robust

      var nexusTokens = nexus.split(/\s*(?:^|[^\w\d])Begin(?:^|[^\w\d])|(?:^|[^\w\d])begin(?:^|[^\w\d])|(?:^|[^\w\d])end(?:^|[^\w\d])|(?:^|[^\w\d])End(?:^|[^\w\d])|(?:^|[^\w\d])BEGIN(?:^|[^\w\d])|(?:^|[^\w\d])END(?:^|[^\w\d])\s*/);
      var firstToken = nexusTokens.shift().trim();

      if (firstToken.toLowerCase() !== '#nexus') {
        throw Error("File does not begin with #NEXUS is it a nexus file?");
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nexusTokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var section = _step.value;
          var workingSection = section.replace(/^\s+|\s+$/g, '').split(/\n/);
          var sectionTitle = workingSection.shift();

          if (sectionTitle.toLowerCase().trim() === "trees;") {
            var inTaxaMap = false;
            var tipMap = {};
            var tipNames = {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = workingSection[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var token = _step2.value;

                if (token.trim().toLowerCase() === "translate") {
                  inTaxaMap = true;
                } else {
                  if (inTaxaMap) {
                    if (token.trim() === ";") {
                      inTaxaMap = false;
                    } else {
                      var taxaData = token.trim().replace(",", "").split(/\s*\s\s*/);
                      tipMap[taxaData[0]] = taxaData[1];
                      tipNames[taxaData[1]] = taxaData[0];
                    }
                  } else {
                    var treeString = token.substring(token.indexOf("("));

                    if (Object.keys(tipMap).length > 0) {
                      var thisTree = ImmutableTree.parseNewick(treeString, _objectSpread({}, options, {
                        tipMap: tipMap,
                        tipNames: tipNames
                      }));
                      trees.push(thisTree);
                    } else {
                      var _thisTree = ImmutableTree.parseNewick(treeString, _objectSpread({}, options));

                      trees.push(_thisTree);
                    }
                  }
                }
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                  _iterator2["return"]();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return trees;
    }
  }, {
    key: "parseNewick",
    value: function parseNewick(newickString) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      options = _objectSpread({}, {
        labelName: "label",
        datePrefix: undefined,
        dateFormat: "%Y-%m-%d"
      }, {}, options);
      verifyNewickString(newickString);
      var nodeCount = 0;
      var tipCount = -1;
      var postOrderTally = -1;
      var treeData = {
        nodesById: {},
        annotationsById: {},
        annotationTypes: {},
        cladeMap: {},
        clades: [],
        externalNodes: [],
        internalNodes: [],
        postOrder: [],
        root: ""
      };

      function newickSubstringParser(newickString) {
        // check for semicolon
        //strip first and last parenthesis and annotations ect. call again on children.
        //https://www.regextester.com/103043
        //                      [children]data - name, label, branch length ect.
        var internalNode = /\((.*)\)(.*)/; // identify commas not included in (),[],or {}

        var nodeData = /(?:(.*)(?=\[&))?(?:\[&(.+)])?(?:(.+)(?=:))?:(\d+\.?\d*(?:[eE]-?\d+)?)/g;
        var isInternalNode = internalNode.test(newickString);
        var nodeString,
            childrenString,
            childNodes = [];

        if (isInternalNode) {
          var _newickString$split$f = newickString.split(internalNode).filter(function (s) {
            return s;
          });

          var _newickString$split$f2 = slicedToArray(_newickString$split$f, 2);

          childrenString = _newickString$split$f2[0];
          nodeString = _newickString$split$f2[1];
          var children = splitAtExposedCommas(childrenString);
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var child = _step3.value;
              childNodes.push(newickSubstringParser(child));
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        } else {
          nodeString = newickString;
        } //TODO get rid of leading and trailing empty matches


        var _nodeString$split = nodeString.split(nodeData),
            _nodeString$split2 = slicedToArray(_nodeString$split, 6),
            emptyMatch = _nodeString$split2[0],
            name = _nodeString$split2[1],
            annotationsString = _nodeString$split2[2],
            label = _nodeString$split2[3],
            length = _nodeString$split2[4],
            emptyMatch2 = _nodeString$split2[5];

        if (!isInternalNode && !annotationsString) {
          name = label;
          label = null;
        } else if (isInternalNode && name) {
          label = name;
          name = null;
        }

        if (name) {
          name = options.tipMap ? stripQuotes(options.tipMap[name]) : stripQuotes(name);
        }

        if (label) {
          label = stripQuotes(label);
        }

        var node = {
          id: name ? name : label ? options.labelName === "label" ? label : "node".concat(nodeCount += 1) : "node".concat(nodeCount += 1),
          name: name ? name : null,
          length: length !== undefined ? parseFloat(length) : null,
          children: childNodes.length > 0 ? childNodes : null,
          postOrder: postOrderTally += 1
        };

        if (node.children) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = node.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var childId = _step4.value;
              treeData.nodesById[childId].parent = node.id;
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }

        node.clade = node.children ? node.children.reduce(function (acc, child) {
          return acc.or(new BitSet("0x".concat(treeData.nodesById[child].clade)));
        }, new BitSet()).toString(16) : new BitSet([options.tipNames ? options.tipNames[name] : tipCount += 1]).toString(16);
        var annotations = annotationsString !== undefined ? parseAnnotation(annotationsString) : {};

        if (options.labelName !== "label") {
          if (label) {
            annotations[options.labelName] = label;
          }
        }

        var date;

        if (options.datePrefix && name) {
          date = getDate(name, options.datePrefix, options.dateFormat);
          annotations.date = date;
        }

        var typedAnnotations = typeAnnotations(annotations);
        treeData.nodesById[node.id] = node;
        treeData.annotationsById[node.id] = annotations;
        treeData.annotationTypes = reconcileAnnotations(typedAnnotations, treeData.annotationTypes);
        treeData.cladeMap[node.clade] = node.id;

        if (!isInternalNode) {
          treeData.externalNodes.push(node.id);
        } else {
          treeData.internalNodes.unshift(node.id);
        }

        treeData.postOrder.push(node.id);
        treeData.clades.push(node.clade);
        treeData.root = node.id;
        return node.id;
      }

      newickSubstringParser(newickString);
      return fromJS(treeData);
    }
  }]);

  return ImmutableTree;
}();

function parseAnnotation(annotationString) {
  var setRegex = /\{(.+)\}/; // const setRegex = /\{(.+)\}/;

  var out = {};
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = splitAtExposedCommas(annotationString)[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var annotation = _step6.value;

      var _annotation$split = annotation.split("="),
          _annotation$split2 = slicedToArray(_annotation$split, 2),
          annotationKey = _annotation$split2[0],
          data = _annotation$split2[1]; //TODO ensure this is working


      annotationKey = annotationKey.replace(/\./g, "_");

      if (setRegex.test(data)) {
        data = data.split(setRegex).filter(function (s) {
          return s !== "";
        }).reduce(function (acc, curr) {
          return acc.concat(splitAtExposedCommas(curr));
        }, []);

        if (data.reduce(function (acc, curr) {
          return acc & !isNaN(curr);
        }, true)) {
          data = data.map(function (d) {
            return parseFloat(d);
          });
        } else {
          data = data.reduce(function (acc, curr) {
            return acc.concat(curr.split(/[(?:\")')]/).filter(function (s) {
              return s !== "";
            }));
          }, []);
        }

        out[annotationKey] = data;
      } else {
        data = data.split(/[(?:\")')]/).filter(function (s) {
          return s !== "";
        })[0];

        if (isNaN(data)) {
          out[annotationKey] = data;
        } else {
          out[annotationKey] = parseFloat(data);
        }
      }
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
        _iterator6["return"]();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  return constructProbabilitySet(out);
}

function constructProbabilitySet(out) {
  var keys = Object.keys(out);
  var finalObject = {};
  var skippedKeys = [];

  for (var _i2 = 0, _keys = keys; _i2 < _keys.length; _i2++) {
    var probabilityKey = _keys[_i2];

    if (/.+_set_prob/.test(probabilityKey)) {
      var base = probabilityKey.split("_set_prob").filter(function (s) {
        return s !== "";
      })[0];
      var traitkey = "".concat(base, "_set");
      var probabilities = [].concat(out[probabilityKey]);
      skippedKeys.push(traitkey);

      if (keys.includes(traitkey)) {
        var probabilitySet = {};

        for (var i = 0; i < out[traitkey].length; i++) {
          probabilitySet[out[traitkey][i]] = probabilities[i];
        }

        finalObject["".concat(base, "_probSet")] = _objectSpread({}, probabilitySet);
      }
    } else if (!skippedKeys.includes(probabilityKey)) finalObject[probabilityKey] = out[probabilityKey];
  }

  return finalObject;
}

function reconcileAnnotations(incomingAnnotations) {
  var currentAnnotations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var _i3 = 0, _Object$entries2 = Object.entries(incomingAnnotations); _i3 < _Object$entries2.length; _i3++) {
    var _Object$entries2$_i = slicedToArray(_Object$entries2[_i3], 2),
        key = _Object$entries2$_i[0],
        types = _Object$entries2$_i[1];

    var annotation = currentAnnotations[key];

    if (!annotation) {
      currentAnnotations[key] = types;
    } else {
      var type = types.type;

      if (annotation.type !== type) {
        if (type === Type.INTEGER && annotation.type === Type.FLOAT || type === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          annotation.type = Type.FLOAT;

          if (annotation.values) {
            delete annotation.values;
          }

          annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : types.extent;
        } else {
          throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
        }
      } else if (annotation.type === type) {
        if (type === Type.DISCRETE) {
          if (!annotation.values) {
            annotation.values = new Set();
          }

          annotation.values = new Set([].concat(toConsumableArray(annotation.values), toConsumableArray(types.values)));
        } else if (annotation.values || types.values) {
          annotation.values = annotation.values ? annotation.values.concat(types.values) : types.values;
        } else if (annotation.extent || types.extent) {
          annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : types.extent;
        }
      }
    }
  }

  return currentAnnotations;
}

function typeAnnotations(annotations) {
  var annotationTypes = {};

  for (var _i4 = 0, _Object$entries3 = Object.entries(annotations); _i4 < _Object$entries3.length; _i4++) {
    var _Object$entries3$_i = slicedToArray(_Object$entries3[_i4], 2),
        key = _Object$entries3$_i[0],
        addValues = _Object$entries3$_i[1];

    var annotation = {};
    annotationTypes[key] = annotation;

    if (addValues instanceof Date) {
      annotation.type = Type.DATE;
      annotation.extent = [addValues, addValues];
    } else if (Array.isArray(addValues)) {
      // is a set of  values
      var type = void 0;

      if (addValues.map(function (v) {
        return isNaN(v);
      }).reduce(function (acc, curr) {
        return acc && curr;
      }, true)) {
        var _annotation$values;

        type = Type.DISCRETE;
        annotation.type = type;

        if (!annotation.values) {
          annotation.values = new Set();
        }

        (_annotation$values = annotation.values).add.apply(_annotation$values, toConsumableArray(addValues));
      } else if (addValues.map(function (v) {
        return parseFloat(v);
      }).reduce(function (acc, curr) {
        return acc && Number.isInteger(curr);
      }, true)) {
        type = Type.INTEGER;
        annotation.extent = extent(addValues);
      } else {
        type = Type.FLOAT;
        annotation.extent = extent(addValues);
      }

      if (annotation.type && annotation.type !== type) {
        if (type === Type.INTEGER && annotation.type === Type.FLOAT || type === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          type = Type.FLOAT;
          annotation.type = Type.FLOAT;

          if (annotation.values) {
            delete annotation.values;
          } else {
            throw Error("existing values of the annotation, ".concat(key, ", in the tree is discrete."));
          }
        }
      }

      annotation.type = type; // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
    } else if (Object.isExtensible(addValues)) {
      // is a set of properties with values
      var _type = undefined;
      var sum = 0.0;
      var keys = [];

      for (var _i5 = 0, _Object$entries4 = Object.entries(addValues); _i5 < _Object$entries4.length; _i5++) {
        var _Object$entries4$_i = slicedToArray(_Object$entries4[_i5], 2),
            _key = _Object$entries4$_i[0],
            value = _Object$entries4$_i[1];

        if (keys.includes(_key)) {
          throw Error("the states of annotation, ".concat(_key, ", should be unique"));
        }

        if (_typeof_1(value) === _typeof_1(1.0)) {
          // This is a vector of probabilities of different states
          _type = _type === undefined ? Type.PROBABILITIES : _type;

          if (_type === Type.DISCRETE) {
            throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
          }

          sum += value;

          if (sum > 1.01) {
            throw Error("the values of annotation, ".concat(_key, ", should be probabilities of states and add to 1.0"));
          }
        } else if (_typeof_1(value) === _typeof_1(true)) {
          _type = _type === undefined ? Type.DISCRETE : _type;

          if (_type === Type.PROBABILITIES) {
            console.warn(annotations);
            throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
          }
        } else {
          throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
        }

        keys.push(_key);
      }

      if (annotation.type && annotation.type !== _type) {
        throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
      }

      annotation.type = _type;
      annotation.values = annotation.values ? [].concat(toConsumableArray(annotation.values), [addValues]) : [addValues];
    } else {
      var _type2 = Type.DISCRETE;

      if (_typeof_1(addValues) === _typeof_1(true)) {
        _type2 = Type.BOOLEAN;
      } else if (!isNaN(addValues)) {
        _type2 = addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT;
      }

      if (annotation.type && annotation.type !== _type2) {
        if (_type2 === Type.INTEGER && annotation.type === Type.FLOAT || _type2 === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          _type2 = Type.FLOAT;
        } else {
          throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
        }
      }

      if (_type2 === Type.DISCRETE) {
        if (!annotation.values) {
          annotation.values = new Set();
        }

        annotation.values.add(addValues);
      } else if (_type2 === Type.FLOAT || _type2 === Type.INTEGER) {
        annotation.extent = [addValues, addValues];
      }

      annotation.type = _type2;
    } // overwrite the existing annotation property
    // annotationTypes[key] = annotation;

  }

  return annotationTypes;
}

function stripQuotes(string) {
  // remove any quoting and then trim whitespace
  return removeEndQuotes(removeFrontQuotes(string));
}

function removeFrontQuotes(s) {
  if (s.startsWith("\"") || s.startsWith("\'")) {
    return s.slice(1);
  }

  return s;
}

function removeEndQuotes(s) {
  if (s.endsWith("\"") || s.endsWith("\'")) {
    return s.slice(0, s.length - 1);
  }

  return s;
}

function verifyNewickString(s) {
  if (s[s.length - 1] !== ";") {
    throw new Error("Unknown format. Newick strings should end in ;");
  }

  if ((s.match(/\(/g) || []).length !== (s.match(/\)/g) || []).length) {
    throw new Error("Unmatched parenthesis in newick string");
  }
}

function getDate(name, datePrefix, dateFormat) {
  var parts = name.split(datePrefix);

  if (parts.length === 0) {
    throw new Error("the tip, ".concat(name, ", doesn't have a date separated by the prefix, '").concat(datePrefix, "'"));
  }

  var dateBit = parts[parts.length - 1];

  if (dateFormat === "decimal") {
    var decimalDate = parseFloat(parts[parts.length - 1]);
    return decimalToDate(decimalDate);
  } else {
    var date = timeParse(dateFormat)(dateBit);

    if (!date) {
      date = timeParse(dateFormat)("".concat(dateBit, "-15"));
    }

    if (!date) {
      date = timeParse(dateFormat)("".concat(dateBit, "-06-15"));
    }

    return date;
  }
} //TODO speed up - it's slow to do this everytime essentially nested looping


function splitAtExposedCommas(string) {
  var open = ["(", "[", "{"];
  var close = [")", "]", "}"];
  var count = 0;
  var commas = [-1];
  var stringLength = string.length;

  for (var i = 0; i < stringLength; i++) {
    if (open.includes(string[i])) {
      count += 1;
    } else if (close.includes(string[i])) {
      count -= 1;
    } else if (count === 0 && string[i] === ",") {
      commas.push(i);
    }
  }

  commas.push(string.length);
  var splits = [];
  var commaLength = commas.length;

  for (var _i6 = 1; _i6 < commaLength; _i6++) {
    splits.push(string.slice(commas[_i6 - 1] + 1, commas[_i6]));
  }

  return splits;
}

function orderNodes(node, ordering) {
  var count = 0;

  if (this.getChildren(node)) {
    // count the number of descendents for each child
    var counts = new Map();
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = this.getChildren(node)[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var child = _step7.value;
        var value = orderNodes.call(this, child, ordering);
        counts.set(child, value);
        count += value;
      } // sort the children using the provided function

    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
          _iterator7["return"]();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }

    this.getNode(node).children = this.getNode(node).children.sort(function (a, b) {
      return ordering(a, counts.get(a), b, counts.get(b), node);
    });
    var postOrder = [],
        exetrnal = [],
        internal = [];
    var _iteratorNormalCompletion8 = true;
    var _didIteratorError8 = false;
    var _iteratorError8 = undefined;

    try {
      for (var _iterator8 = postorder(this.getRoot(), this)[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
        var id = _step8.value;
        postOrder.push(id);

        if (this.getChildren(id)) {
          internal.push(id);
        } else {
          exetrnal.push(id);
        }
      }
    } catch (err) {
      _didIteratorError8 = true;
      _iteratorError8 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
          _iterator8["return"]();
        }
      } finally {
        if (_didIteratorError8) {
          throw _iteratorError8;
        }
      }
    }

    this.tree.postOrder = postOrder;
    this.tree.externalNodes = exetrnal;
    this.tree.internalNodes = internal;
  } else {
    count = 1;
  }

  return count;
}
/**
 * A generator function that returns the nodes in a post-order traversal
 *
 * @returns {IterableIterator<IterableIterator<*|*>>}
 */


function postorder(startNode, tree) {
  var traverse;
  return regenerator.wrap(function postorder$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          traverse =
          /*#__PURE__*/
          regenerator.mark(function traverse(node) {
            var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, child;

            return regenerator.wrap(function traverse$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!tree.getChildren(node)) {
                      _context.next = 26;
                      break;
                    }

                    _iteratorNormalCompletion9 = true;
                    _didIteratorError9 = false;
                    _iteratorError9 = undefined;
                    _context.prev = 4;
                    _iterator9 = tree.getChildren(node)[Symbol.iterator]();

                  case 6:
                    if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                      _context.next = 12;
                      break;
                    }

                    child = _step9.value;
                    return _context.delegateYield(traverse(child), "t0", 9);

                  case 9:
                    _iteratorNormalCompletion9 = true;
                    _context.next = 6;
                    break;

                  case 12:
                    _context.next = 18;
                    break;

                  case 14:
                    _context.prev = 14;
                    _context.t1 = _context["catch"](4);
                    _didIteratorError9 = true;
                    _iteratorError9 = _context.t1;

                  case 18:
                    _context.prev = 18;
                    _context.prev = 19;

                    if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                      _iterator9["return"]();
                    }

                  case 21:
                    _context.prev = 21;

                    if (!_didIteratorError9) {
                      _context.next = 24;
                      break;
                    }

                    throw _iteratorError9;

                  case 24:
                    return _context.finish(21);

                  case 25:
                    return _context.finish(18);

                  case 26:
                    _context.next = 28;
                    return node;

                  case 28:
                  case "end":
                    return _context.stop();
                }
              }
            }, traverse, null, [[4, 14, 18, 26], [19,, 21, 25]]);
          });
          return _context2.delegateYield(traverse(startNode), "t0", 2);

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked);
}

function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$1(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var ImmutableCladeCollection =
/*#__PURE__*/
function () {
  function ImmutableCladeCollection(collection) {
    classCallCheck(this, ImmutableCladeCollection);

    this.collection = collection;
  }

  createClass(ImmutableCladeCollection, null, [{
    key: "parseNexus",
    value: function parseNexus(string, options) {
      var trees = ImmutableTree.parseNexus(nexus, options = {});
      return ImmutableCladeCollection.collectTrees(trees);
    }
  }, {
    key: "collectTrees",
    value: function collectTrees(trees) {
      return trees.reduce(function (collection, tree) {
        return treeReducer(tree, collection);
      }, {});
    }
  }]);

  return ImmutableCladeCollection;
}();
function treeReducer(tree) {
  var collection = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var clades = collection.clades ? collection.clades.concat(tree.clades.filter(function (c) {
    return !collection.clades.includes(c);
  })) : tree.clades;
  var annotationTypes = collection.annotationTypes ? reconcileAnnotations(tree.annotationTypes, collection.annotationTypes) : tree.annotationTypes;
  var treeClades = tree.clades.reduce(function (acc, clade) {
    return _objectSpread$1({}, acc, defineProperty({}, clade, cladeMaker(tree, clade)));
  }, {});
  var cladesById = collection.cladesById ? mergeClades(collection.cladesById, treeClades) : treeClades;
  return {
    cladesById: cladesById,
    annotationTypes: annotationTypes,
    clades: clades
  };
}

function cladeMaker(tree, clade) {
  var node = tree.nodesById[tree.cladeMap[clade]];
  var annotations = tree.annotationsById[tree.cladeMap[clade]];

  var cladeAnnotations = _objectSpread$1({}, Object.keys(annotations).reduce(function (acc, curr) {
    return _objectSpread$1({}, acc, defineProperty({}, curr, [annotations[curr]]));
  }, {}), {
    count: 1
  });

  if (node.length) {
    cladeAnnotations.length = [node.length];
  }

  return cladeAnnotations;
}

function mergeClades(clades1, clades2) {
  var clades1Keys = Object.keys(clades1);
  var clades2Keys = Object.keys(clades2);
  var matchingClades = clades1Keys.filter(function (c) {
    return clades2Keys.includes(c);
  });
  return _objectSpread$1({}, clades1, {}, clades2, {}, matchingClades.reduce(function (acc, key) {
    return _objectSpread$1({}, acc, defineProperty({}, key, mergeClade(clades1[key], clades2[key])));
  }, {}));
}

function mergeClade(clade1, clade2) {
  var clade1Keys = Object.keys(clade1);
  var clade2Keys = Object.keys(clade2);
  var samekeys = clade1Keys.filter(function (key) {
    return !clade2Keys.includes(key);
  }).concat(clade2Keys.filter(function (key) {
    return !clade1Keys.includes(key);
  })).length === 0;

  if (!samekeys) {
    console.log(clade1);
    console.log(clade2);
    throw new Error("Unmatched keys between trees! check console for ");
  }

  return Object.assign(clade1Keys.filter(function (key) {
    return key !== "count";
  }).reduce(function (acc, key) {
    return _objectSpread$1({}, acc, defineProperty({}, key, clade1[key].concat(clade2[key])));
  }, _objectSpread$1({}, clade1)), {
    count: clade1.count + clade2.count
  });
}

var _extends_1 = createCommonjsModule(function (module) {
function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

module.exports = _extends;
});

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

const is = {
  arr: Array.isArray,
  obj: a => Object.prototype.toString.call(a) === '[object Object]',
  fun: a => typeof a === 'function',
  str: a => typeof a === 'string',
  num: a => typeof a === 'number',
  und: a => a === void 0,
  nul: a => a === null,
  set: a => a instanceof Set,
  map: a => a instanceof Map,

  equ(a, b) {
    if (typeof a !== typeof b) return false;
    if (is.str(a) || is.num(a)) return a === b;
    if (is.obj(a) && is.obj(b) && Object.keys(a).length + Object.keys(b).length === 0) return true;
    let i;

    for (i in a) if (!(i in b)) return false;

    for (i in b) if (a[i] !== b[i]) return false;

    return is.und(i) ? a === b : true;
  }

};
function merge(target, lowercase) {
  if (lowercase === void 0) {
    lowercase = true;
  }

  return object => (is.arr(object) ? object : Object.keys(object)).reduce((acc, element) => {
    const key = lowercase ? element[0].toLowerCase() + element.substring(1) : element;
    acc[key] = target(key);
    return acc;
  }, target);
}
function useForceUpdate() {
  const _useState = React.useState(false),
        f = _useState[1];

  const forceUpdate = React.useCallback(() => f(v => !v), []);
  return forceUpdate;
}
function withDefault(value, defaultValue) {
  return is.und(value) || is.nul(value) ? defaultValue : value;
}
function toArray(a) {
  return !is.und(a) ? is.arr(a) ? a : [a] : [];
}
function callProp(obj) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return is.fun(obj) ? obj(...args) : obj;
}

function getForwardProps(props) {
  const to = props.to,
        from = props.from,
        config = props.config,
        onStart = props.onStart,
        onRest = props.onRest,
        onFrame = props.onFrame,
        children = props.children,
        reset = props.reset,
        reverse = props.reverse,
        force = props.force,
        immediate = props.immediate,
        delay = props.delay,
        attach = props.attach,
        destroyed = props.destroyed,
        interpolateTo = props.interpolateTo,
        ref = props.ref,
        lazy = props.lazy,
        forward = _objectWithoutPropertiesLoose(props, ["to", "from", "config", "onStart", "onRest", "onFrame", "children", "reset", "reverse", "force", "immediate", "delay", "attach", "destroyed", "interpolateTo", "ref", "lazy"]);

  return forward;
}

function interpolateTo(props) {
  const forward = getForwardProps(props);
  if (is.und(forward)) return _extends({
    to: forward
  }, props);
  const rest = Object.keys(props).reduce((a, k) => !is.und(forward[k]) ? a : _extends({}, a, {
    [k]: props[k]
  }), {});
  return _extends({
    to: forward
  }, rest);
}
function handleRef(ref, forward) {
  if (forward) {
    // If it's a function, assume it's a ref callback
    if (is.fun(forward)) forward(ref);else if (is.obj(forward)) {
      forward.current = ref;
    }
  }

  return ref;
}

class Animated {
  constructor() {
    this.payload = void 0;
    this.children = [];
  }

  getAnimatedValue() {
    return this.getValue();
  }

  getPayload() {
    return this.payload || this;
  }

  attach() {}

  detach() {}

  getChildren() {
    return this.children;
  }

  addChild(child) {
    if (this.children.length === 0) this.attach();
    this.children.push(child);
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    this.children.splice(index, 1);
    if (this.children.length === 0) this.detach();
  }

}
class AnimatedArray extends Animated {
  constructor() {
    super(...arguments);
    this.payload = [];

    this.attach = () => this.payload.forEach(p => p instanceof Animated && p.addChild(this));

    this.detach = () => this.payload.forEach(p => p instanceof Animated && p.removeChild(this));
  }

}
class AnimatedObject extends Animated {
  constructor() {
    super(...arguments);
    this.payload = {};

    this.attach = () => Object.values(this.payload).forEach(s => s instanceof Animated && s.addChild(this));

    this.detach = () => Object.values(this.payload).forEach(s => s instanceof Animated && s.removeChild(this));
  }

  getValue(animated) {
    if (animated === void 0) {
      animated = false;
    }

    const payload = {};

    for (const key in this.payload) {
      const value = this.payload[key];
      if (animated && !(value instanceof Animated)) continue;
      payload[key] = value instanceof Animated ? value[animated ? 'getAnimatedValue' : 'getValue']() : value;
    }

    return payload;
  }

  getAnimatedValue() {
    return this.getValue(true);
  }

}

let applyAnimatedValues;
function injectApplyAnimatedValues(fn, transform) {
  applyAnimatedValues = {
    fn,
    transform
  };
}
let colorNames;
function injectColorNames(names) {
  colorNames = names;
}
let requestFrame = cb => typeof window !== 'undefined' ? window.requestAnimationFrame(cb) : -1;
let interpolation;
function injectStringInterpolator(fn) {
  interpolation = fn;
}
let now = () => Date.now();
let animatedApi = node => node.current;
let createAnimatedStyle;
function injectCreateAnimatedStyle(factory) {
  createAnimatedStyle = factory;
}

/**
 * Wraps the `style` property with `AnimatedStyle`.
 */

class AnimatedProps extends AnimatedObject {
  constructor(props, callback) {
    super();
    this.update = void 0;
    this.payload = !props.style ? props : _extends({}, props, {
      style: createAnimatedStyle(props.style)
    });
    this.update = callback;
    this.attach();
  }

}

const isFunctionComponent = val => is.fun(val) && !(val.prototype instanceof React__default.Component);

const createAnimatedComponent = Component => {
  const AnimatedComponent = React.forwardRef((props, ref) => {
    const forceUpdate = useForceUpdate();
    const mounted = React.useRef(true);
    const propsAnimated = React.useRef(null);
    const node = React.useRef(null);
    const attachProps = React.useCallback(props => {
      const oldPropsAnimated = propsAnimated.current;

      const callback = () => {
        let didUpdate = false;

        if (node.current) {
          didUpdate = applyAnimatedValues.fn(node.current, propsAnimated.current.getAnimatedValue());
        }

        if (!node.current || didUpdate === false) {
          // If no referenced node has been found, or the update target didn't have a
          // native-responder, then forceUpdate the animation ...
          forceUpdate();
        }
      };

      propsAnimated.current = new AnimatedProps(props, callback);
      oldPropsAnimated && oldPropsAnimated.detach();
    }, []);
    React.useEffect(() => () => {
      mounted.current = false;
      propsAnimated.current && propsAnimated.current.detach();
    }, []);
    React.useImperativeHandle(ref, () => animatedApi(node));
    attachProps(props);

    const _getValue = propsAnimated.current.getValue(),
          scrollTop = _getValue.scrollTop,
          scrollLeft = _getValue.scrollLeft,
          animatedProps = _objectWithoutPropertiesLoose(_getValue, ["scrollTop", "scrollLeft"]); // Functions cannot have refs, see:
    // See: https://github.com/react-spring/react-spring/issues/569


    const refFn = isFunctionComponent(Component) ? undefined : childRef => node.current = handleRef(childRef, ref);
    return React__default.createElement(Component, _extends({}, animatedProps, {
      ref: refFn
    }));
  });
  return AnimatedComponent;
};

let active = false;
const controllers = new Set();

const update = () => {
  if (!active) return false;
  let time = now();

  for (let controller of controllers) {
    let isActive = false;

    for (let configIdx = 0; configIdx < controller.configs.length; configIdx++) {
      let config = controller.configs[configIdx];
      let endOfAnimation, lastTime;

      for (let valIdx = 0; valIdx < config.animatedValues.length; valIdx++) {
        let animation = config.animatedValues[valIdx]; // If an animation is done, skip, until all of them conclude

        if (animation.done) continue;
        let from = config.fromValues[valIdx];
        let to = config.toValues[valIdx];
        let position = animation.lastPosition;
        let isAnimated = to instanceof Animated;
        let velocity = Array.isArray(config.initialVelocity) ? config.initialVelocity[valIdx] : config.initialVelocity;
        if (isAnimated) to = to.getValue(); // Conclude animation if it's either immediate, or from-values match end-state

        if (config.immediate) {
          animation.setValue(to);
          animation.done = true;
          continue;
        } // Break animation when string values are involved


        if (typeof from === 'string' || typeof to === 'string') {
          animation.setValue(to);
          animation.done = true;
          continue;
        }

        if (config.duration !== void 0) {
          /** Duration easing */
          position = from + config.easing((time - animation.startTime) / config.duration) * (to - from);
          endOfAnimation = time >= animation.startTime + config.duration;
        } else if (config.decay) {
          /** Decay easing */
          position = from + velocity / (1 - 0.998) * (1 - Math.exp(-(1 - 0.998) * (time - animation.startTime)));
          endOfAnimation = Math.abs(animation.lastPosition - position) < 0.1;
          if (endOfAnimation) to = position;
        } else {
          /** Spring easing */
          lastTime = animation.lastTime !== void 0 ? animation.lastTime : time;
          velocity = animation.lastVelocity !== void 0 ? animation.lastVelocity : config.initialVelocity; // If we lost a lot of frames just jump to the end.

          if (time > lastTime + 64) lastTime = time; // http://gafferongames.com/game-physics/fix-your-timestep/

          let numSteps = Math.floor(time - lastTime);

          for (let i = 0; i < numSteps; ++i) {
            let force = -config.tension * (position - to);
            let damping = -config.friction * velocity;
            let acceleration = (force + damping) / config.mass;
            velocity = velocity + acceleration * 1 / 1000;
            position = position + velocity * 1 / 1000;
          } // Conditions for stopping the spring animation


          let isOvershooting = config.clamp && config.tension !== 0 ? from < to ? position > to : position < to : false;
          let isVelocity = Math.abs(velocity) <= config.precision;
          let isDisplacement = config.tension !== 0 ? Math.abs(to - position) <= config.precision : true;
          endOfAnimation = isOvershooting || isVelocity && isDisplacement;
          animation.lastVelocity = velocity;
          animation.lastTime = time;
        } // Trails aren't done until their parents conclude


        if (isAnimated && !config.toValues[valIdx].done) endOfAnimation = false;

        if (endOfAnimation) {
          // Ensure that we end up with a round value
          if (animation.value !== to) position = to;
          animation.done = true;
        } else isActive = true;

        animation.setValue(position);
        animation.lastPosition = position;
      } // Keep track of updated values only when necessary


      if (controller.props.onFrame) controller.values[config.name] = config.interpolation.getValue();
    } // Update callbacks in the end of the frame


    if (controller.props.onFrame) controller.props.onFrame(controller.values); // Either call onEnd or next frame

    if (!isActive) {
      controllers.delete(controller);
      controller.stop(true);
    }
  } // Loop over as long as there are controllers ...


  if (controllers.size) {
    requestFrame(update);
  } else {
    active = false;
  }

  return active;
};

const start = controller => {
  if (!controllers.has(controller)) controllers.add(controller);

  if (!active) {
    active = true;
    requestFrame(update);
  }
};

const stop = controller => {
  if (controllers.has(controller)) controllers.delete(controller);
};

function createInterpolator(range, output, extrapolate) {
  if (typeof range === 'function') {
    return range;
  }

  if (Array.isArray(range)) {
    return createInterpolator({
      range,
      output: output,
      extrapolate
    });
  }

  if (interpolation && typeof range.output[0] === 'string') {
    return interpolation(range);
  }

  const config = range;
  const outputRange = config.output;
  const inputRange = config.range || [0, 1];
  const extrapolateLeft = config.extrapolateLeft || config.extrapolate || 'extend';
  const extrapolateRight = config.extrapolateRight || config.extrapolate || 'extend';

  const easing = config.easing || (t => t);

  return input => {
    const range = findRange(input, inputRange);
    return interpolate(input, inputRange[range], inputRange[range + 1], outputRange[range], outputRange[range + 1], easing, extrapolateLeft, extrapolateRight, config.map);
  };
}

function interpolate(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight, map) {
  let result = map ? map(input) : input; // Extrapolate

  if (result < inputMin) {
    if (extrapolateLeft === 'identity') return result;else if (extrapolateLeft === 'clamp') result = inputMin;
  }

  if (result > inputMax) {
    if (extrapolateRight === 'identity') return result;else if (extrapolateRight === 'clamp') result = inputMax;
  }

  if (outputMin === outputMax) return outputMin;
  if (inputMin === inputMax) return input <= inputMin ? outputMin : outputMax; // Input Range

  if (inputMin === -Infinity) result = -result;else if (inputMax === Infinity) result = result - inputMin;else result = (result - inputMin) / (inputMax - inputMin); // Easing

  result = easing(result); // Output Range

  if (outputMin === -Infinity) result = -result;else if (outputMax === Infinity) result = result + outputMin;else result = result * (outputMax - outputMin) + outputMin;
  return result;
}

function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i) if (inputRange[i] >= input) break;

  return i - 1;
}

class AnimatedInterpolation extends AnimatedArray {
  constructor(parents, range, output, extrapolate) {
    super();
    this.calc = void 0;
    this.payload = parents instanceof AnimatedArray && !(parents instanceof AnimatedInterpolation) ? parents.getPayload() : Array.isArray(parents) ? parents : [parents];
    this.calc = createInterpolator(range, output, extrapolate);
  }

  getValue() {
    return this.calc(...this.payload.map(value => value.getValue()));
  }

  updateConfig(range, output, extrapolate) {
    this.calc = createInterpolator(range, output, extrapolate);
  }

  interpolate(range, output, extrapolate) {
    return new AnimatedInterpolation(this, range, output, extrapolate);
  }

}

/**
 * Animated works by building a directed acyclic graph of dependencies
 * transparently when you render your Animated components.
 *
 *               new Animated.Value(0)
 *     .interpolate()        .interpolate()    new Animated.Value(1)
 *         opacity               translateY      scale
 *          style                         transform
 *         View#234                         style
 *                                         View#123
 *
 * A) Top Down phase
 * When an AnimatedValue is updated, we recursively go down through this
 * graph in order to find leaf nodes: the views that we flag as needing
 * an update.
 *
 * B) Bottom Up phase
 * When a view is flagged as needing an update, we recursively go back up
 * in order to build the new value that it needs. The reason why we need
 * this two-phases process is to deal with composite props such as
 * transform which can receive values from multiple parents.
 */
function addAnimatedStyles(node, styles) {
  if ('update' in node) {
    styles.add(node);
  } else {
    node.getChildren().forEach(child => addAnimatedStyles(child, styles));
  }
}

class AnimatedValue extends Animated {
  constructor(_value) {
    var _this;

    super();
    _this = this;
    this.animatedStyles = new Set();
    this.value = void 0;
    this.startPosition = void 0;
    this.lastPosition = void 0;
    this.lastVelocity = void 0;
    this.startTime = void 0;
    this.lastTime = void 0;
    this.done = false;

    this.setValue = function (value, flush) {
      if (flush === void 0) {
        flush = true;
      }

      _this.value = value;
      if (flush) _this.flush();
    };

    this.value = _value;
    this.startPosition = _value;
    this.lastPosition = _value;
  }

  flush() {
    if (this.animatedStyles.size === 0) {
      addAnimatedStyles(this, this.animatedStyles);
    }

    this.animatedStyles.forEach(animatedStyle => animatedStyle.update());
  }

  clearStyles() {
    this.animatedStyles.clear();
  }

  getValue() {
    return this.value;
  }

  interpolate(range, output, extrapolate) {
    return new AnimatedInterpolation(this, range, output, extrapolate);
  }

}

class AnimatedValueArray extends AnimatedArray {
  constructor(values) {
    super();
    this.payload = values.map(n => new AnimatedValue(n));
  }

  setValue(value, flush) {
    if (flush === void 0) {
      flush = true;
    }

    if (Array.isArray(value)) {
      if (value.length === this.payload.length) {
        value.forEach((v, i) => this.payload[i].setValue(v, flush));
      }
    } else {
      this.payload.forEach(p => p.setValue(value, flush));
    }
  }

  getValue() {
    return this.payload.map(v => v.getValue());
  }

  interpolate(range, output) {
    return new AnimatedInterpolation(this, range, output);
  }

}

let G = 0;

class Controller {
  constructor() {
    this.id = void 0;
    this.idle = true;
    this.hasChanged = false;
    this.guid = 0;
    this.local = 0;
    this.props = {};
    this.merged = {};
    this.animations = {};
    this.interpolations = {};
    this.values = {};
    this.configs = [];
    this.listeners = [];
    this.queue = [];
    this.localQueue = void 0;

    this.getValues = () => this.interpolations;

    this.id = G++;
  }
  /** update(props)
   *  This function filters input props and creates an array of tasks which are executed in .start()
   *  Each task is allowed to carry a delay, which means it can execute asnychroneously */


  update(args) {
    //this._id = n + this.id
    if (!args) return this; // Extract delay and the to-prop from props

    const _ref = interpolateTo(args),
          _ref$delay = _ref.delay,
          delay = _ref$delay === void 0 ? 0 : _ref$delay,
          to = _ref.to,
          props = _objectWithoutPropertiesLoose(_ref, ["delay", "to"]);

    if (is.arr(to) || is.fun(to)) {
      // If config is either a function or an array queue it up as is
      this.queue.push(_extends({}, props, {
        delay,
        to
      }));
    } else if (to) {
      // Otherwise go through each key since it could be delayed individually
      let ops = {};
      Object.entries(to).forEach((_ref2) => {
        let k = _ref2[0],
            v = _ref2[1];

        // Fetch delay and create an entry, consisting of the to-props, the delay, and basic props
        const entry = _extends({
          to: {
            [k]: v
          },
          delay: callProp(delay, k)
        }, props);

        const previous = ops[entry.delay] && ops[entry.delay].to;
        ops[entry.delay] = _extends({}, ops[entry.delay], entry, {
          to: _extends({}, previous, entry.to)
        });
      });
      this.queue = Object.values(ops);
    } // Sort queue, so that async calls go last


    this.queue = this.queue.sort((a, b) => a.delay - b.delay); // Diff the reduced props immediately (they'll contain the from-prop and some config)

    this.diff(props);
    return this;
  }
  /** start(onEnd)
   *  This function either executes a queue, if present, or starts the frameloop, which animates */


  start(onEnd) {
    // If a queue is present we must excecute it
    if (this.queue.length) {
      this.idle = false; // Updates can interrupt trailing queues, in that case we just merge values

      if (this.localQueue) {
        this.localQueue.forEach((_ref3) => {
          let _ref3$from = _ref3.from,
              from = _ref3$from === void 0 ? {} : _ref3$from,
              _ref3$to = _ref3.to,
              to = _ref3$to === void 0 ? {} : _ref3$to;
          if (is.obj(from)) this.merged = _extends({}, from, this.merged);
          if (is.obj(to)) this.merged = _extends({}, this.merged, to);
        });
      } // The guid helps us tracking frames, a new queue over an old one means an override
      // We discard async calls in that caseÍ


      const local = this.local = ++this.guid;
      const queue = this.localQueue = this.queue;
      this.queue = []; // Go through each entry and execute it

      queue.forEach((_ref4, index) => {
        let delay = _ref4.delay,
            props = _objectWithoutPropertiesLoose(_ref4, ["delay"]);

        const cb = finished => {
          if (index === queue.length - 1 && local === this.guid && finished) {
            this.idle = true;
            if (this.props.onRest) this.props.onRest(this.merged);
          }

          if (onEnd) onEnd();
        }; // Entries can be delayed, ansyc or immediate


        let async = is.arr(props.to) || is.fun(props.to);

        if (delay) {
          setTimeout(() => {
            if (local === this.guid) {
              if (async) this.runAsync(props, cb);else this.diff(props).start(cb);
            }
          }, delay);
        } else if (async) this.runAsync(props, cb);else this.diff(props).start(cb);
      });
    } // Otherwise we kick of the frameloop
    else {
        if (is.fun(onEnd)) this.listeners.push(onEnd);
        if (this.props.onStart) this.props.onStart();
        start(this);
      }

    return this;
  }

  stop(finished) {
    this.listeners.forEach(onEnd => onEnd(finished));
    this.listeners = [];
    return this;
  }
  /** Pause sets onEnd listeners free, but also removes the controller from the frameloop */


  pause(finished) {
    this.stop(true);
    if (finished) stop(this);
    return this;
  }

  runAsync(_ref5, onEnd) {
    var _this = this;

    let delay = _ref5.delay,
        props = _objectWithoutPropertiesLoose(_ref5, ["delay"]);

    const local = this.local; // If "to" is either a function or an array it will be processed async, therefor "to" should be empty right now
    // If the view relies on certain values "from" has to be present

    let queue = Promise.resolve(undefined);

    if (is.arr(props.to)) {
      for (let i = 0; i < props.to.length; i++) {
        const index = i;

        const fresh = _extends({}, props, interpolateTo(props.to[index]));

        if (is.arr(fresh.config)) fresh.config = fresh.config[index];
        queue = queue.then(() => {
          //this.stop()
          if (local === this.guid) return new Promise(r => this.diff(fresh).start(r));
        });
      }
    } else if (is.fun(props.to)) {
      let index = 0;
      let last;
      queue = queue.then(() => props.to( // next(props)
      p => {
        const fresh = _extends({}, props, interpolateTo(p));

        if (is.arr(fresh.config)) fresh.config = fresh.config[index];
        index++; //this.stop()

        if (local === this.guid) return last = new Promise(r => this.diff(fresh).start(r));
        return;
      }, // cancel()
      function (finished) {
        if (finished === void 0) {
          finished = true;
        }

        return _this.stop(finished);
      }).then(() => last));
    }

    queue.then(onEnd);
  }

  diff(props) {
    this.props = _extends({}, this.props, props);
    let _this$props = this.props,
        _this$props$from = _this$props.from,
        from = _this$props$from === void 0 ? {} : _this$props$from,
        _this$props$to = _this$props.to,
        to = _this$props$to === void 0 ? {} : _this$props$to,
        _this$props$config = _this$props.config,
        config = _this$props$config === void 0 ? {} : _this$props$config,
        reverse = _this$props.reverse,
        attach = _this$props.attach,
        reset = _this$props.reset,
        immediate = _this$props.immediate; // Reverse values when requested

    if (reverse) {
      var _ref6 = [to, from];
      from = _ref6[0];
      to = _ref6[1];
    } // This will collect all props that were ever set, reset merged props when necessary


    this.merged = _extends({}, from, this.merged, to);
    this.hasChanged = false; // Attachment handling, trailed springs can "attach" themselves to a previous spring

    let target = attach && attach(this); // Reduces input { name: value } pairs into animated values

    this.animations = Object.entries(this.merged).reduce((acc, _ref7) => {
      let name = _ref7[0],
          value = _ref7[1];
      // Issue cached entries, except on reset
      let entry = acc[name] || {}; // Figure out what the value is supposed to be

      const isNumber = is.num(value);
      const isString = is.str(value) && !value.startsWith('#') && !/\d/.test(value) && !colorNames[value];
      const isArray = is.arr(value);
      const isInterpolation = !isNumber && !isArray && !isString;
      let fromValue = !is.und(from[name]) ? from[name] : value;
      let toValue = isNumber || isArray ? value : isString ? value : 1;
      let toConfig = callProp(config, name);
      if (target) toValue = target.animations[name].parent;
      let parent = entry.parent,
          interpolation$$1 = entry.interpolation,
          toValues = toArray(target ? toValue.getPayload() : toValue),
          animatedValues;
      let newValue = value;
      if (isInterpolation) newValue = interpolation({
        range: [0, 1],
        output: [value, value]
      })(1);
      let currentValue = interpolation$$1 && interpolation$$1.getValue(); // Change detection flags

      const isFirst = is.und(parent);
      const isActive = !isFirst && entry.animatedValues.some(v => !v.done);
      const currentValueDiffersFromGoal = !is.equ(newValue, currentValue);
      const hasNewGoal = !is.equ(newValue, entry.previous);
      const hasNewConfig = !is.equ(toConfig, entry.config); // Change animation props when props indicate a new goal (new value differs from previous one)
      // and current values differ from it. Config changes trigger a new update as well (though probably shouldn't?)

      if (reset || hasNewGoal && currentValueDiffersFromGoal || hasNewConfig) {
        // Convert regular values into animated values, ALWAYS re-use if possible
        if (isNumber || isString) parent = interpolation$$1 = entry.parent || new AnimatedValue(fromValue);else if (isArray) parent = interpolation$$1 = entry.parent || new AnimatedValueArray(fromValue);else if (isInterpolation) {
          let prev = entry.interpolation && entry.interpolation.calc(entry.parent.value);
          prev = prev !== void 0 && !reset ? prev : fromValue;

          if (entry.parent) {
            parent = entry.parent;
            parent.setValue(0, false);
          } else parent = new AnimatedValue(0);

          const range = {
            output: [prev, value]
          };

          if (entry.interpolation) {
            interpolation$$1 = entry.interpolation;
            entry.interpolation.updateConfig(range);
          } else interpolation$$1 = parent.interpolate(range);
        }
        toValues = toArray(target ? toValue.getPayload() : toValue);
        animatedValues = toArray(parent.getPayload());
        if (reset && !isInterpolation) parent.setValue(fromValue, false);
        this.hasChanged = true; // Reset animated values

        animatedValues.forEach(value => {
          value.startPosition = value.value;
          value.lastPosition = value.value;
          value.lastVelocity = isActive ? value.lastVelocity : undefined;
          value.lastTime = isActive ? value.lastTime : undefined;
          value.startTime = now();
          value.done = false;
          value.animatedStyles.clear();
        }); // Set immediate values

        if (callProp(immediate, name)) {
          parent.setValue(isInterpolation ? toValue : value, false);
        }

        return _extends({}, acc, {
          [name]: _extends({}, entry, {
            name,
            parent,
            interpolation: interpolation$$1,
            animatedValues,
            toValues,
            previous: newValue,
            config: toConfig,
            fromValues: toArray(parent.getValue()),
            immediate: callProp(immediate, name),
            initialVelocity: withDefault(toConfig.velocity, 0),
            clamp: withDefault(toConfig.clamp, false),
            precision: withDefault(toConfig.precision, 0.01),
            tension: withDefault(toConfig.tension, 170),
            friction: withDefault(toConfig.friction, 26),
            mass: withDefault(toConfig.mass, 1),
            duration: toConfig.duration,
            easing: withDefault(toConfig.easing, t => t),
            decay: toConfig.decay
          })
        });
      } else {
        if (!currentValueDiffersFromGoal) {
          // So ... the current target value (newValue) appears to be different from the previous value,
          // which normally constitutes an update, but the actual value (currentValue) matches the target!
          // In order to resolve this without causing an animation update we silently flag the animation as done,
          // which it technically is. Interpolations also needs a config update with their target set to 1.
          if (isInterpolation) {
            parent.setValue(1, false);
            interpolation$$1.updateConfig({
              output: [newValue, newValue]
            });
          }

          parent.done = true;
          this.hasChanged = true;
          return _extends({}, acc, {
            [name]: _extends({}, acc[name], {
              previous: newValue
            })
          });
        }

        return acc;
      }
    }, this.animations);

    if (this.hasChanged) {
      // Make animations available to frameloop
      this.configs = Object.values(this.animations);
      this.values = {};
      this.interpolations = {};

      for (let key in this.animations) {
        this.interpolations[key] = this.animations[key].interpolation;
        this.values[key] = this.animations[key].interpolation.getValue();
      }
    }

    return this;
  }

  destroy() {
    this.stop();
    this.props = {};
    this.merged = {};
    this.animations = {};
    this.interpolations = {};
    this.values = {};
    this.configs = [];
    this.local = 0;
  }

}

/** API
 * const props = useSprings(number, [{ ... }, { ... }, ...])
 * const [props, set] = useSprings(number, (i, controller) => ({ ... }))
 */

const useSprings = (length, props) => {
  const mounted = React.useRef(false);
  const ctrl = React.useRef();
  const isFn = is.fun(props); // The controller maintains the animation values, starts and stops animations

  const _useMemo = React.useMemo(() => {
    // Remove old controllers
    if (ctrl.current) {
      ctrl.current.map(c => c.destroy());
      ctrl.current = undefined;
    }

    let ref;
    return [new Array(length).fill().map((_, i) => {
      const ctrl = new Controller();
      const newProps = isFn ? callProp(props, i, ctrl) : props[i];
      if (i === 0) ref = newProps.ref;
      ctrl.update(newProps);
      if (!ref) ctrl.start();
      return ctrl;
    }), ref];
  }, [length]),
        controllers = _useMemo[0],
        ref = _useMemo[1];

  ctrl.current = controllers; // The hooks reference api gets defined here ...

  const api = React.useImperativeHandle(ref, () => ({
    start: () => Promise.all(ctrl.current.map(c => new Promise(r => c.start(r)))),
    stop: finished => ctrl.current.forEach(c => c.stop(finished)),

    get controllers() {
      return ctrl.current;
    }

  })); // This function updates the controllers

  const updateCtrl = React.useMemo(() => updateProps => ctrl.current.map((c, i) => {
    c.update(isFn ? callProp(updateProps, i, c) : updateProps[i]);
    if (!ref) c.start();
  }), [length]); // Update controller if props aren't functional

  React.useEffect(() => {
    if (mounted.current) {
      if (!isFn) updateCtrl(props);
    } else if (!ref) ctrl.current.forEach(c => c.start());
  }); // Update mounted flag and destroy controller on unmount

  React.useEffect(() => (mounted.current = true, () => ctrl.current.forEach(c => c.destroy())), []); // Return animated props, or, anim-props + the update-setter above

  const propValues = ctrl.current.map(c => c.getValues());
  return isFn ? [propValues, updateCtrl, finished => ctrl.current.forEach(c => c.pause(finished))] : propValues;
};

/** API
 * const props = useSpring({ ... })
 * const [props, set] = useSpring(() => ({ ... }))
 */

const useSpring = props => {
  const isFn = is.fun(props);

  const _useSprings = useSprings(1, isFn ? props : [props]),
        result = _useSprings[0],
        set = _useSprings[1],
        pause = _useSprings[2];

  return isFn ? [result[0], set, pause] : result;
};

class AnimatedStyle extends AnimatedObject {
  constructor(style) {
    if (style === void 0) {
      style = {};
    }

    super();

    if (style.transform && !(style.transform instanceof Animated)) {
      style = applyAnimatedValues.transform(style);
    }

    this.payload = style;
  }

}

// http://www.w3.org/TR/css3-color/#svg-color
const colors = {
  transparent: 0x00000000,
  aliceblue: 0xf0f8ffff,
  antiquewhite: 0xfaebd7ff,
  aqua: 0x00ffffff,
  aquamarine: 0x7fffd4ff,
  azure: 0xf0ffffff,
  beige: 0xf5f5dcff,
  bisque: 0xffe4c4ff,
  black: 0x000000ff,
  blanchedalmond: 0xffebcdff,
  blue: 0x0000ffff,
  blueviolet: 0x8a2be2ff,
  brown: 0xa52a2aff,
  burlywood: 0xdeb887ff,
  burntsienna: 0xea7e5dff,
  cadetblue: 0x5f9ea0ff,
  chartreuse: 0x7fff00ff,
  chocolate: 0xd2691eff,
  coral: 0xff7f50ff,
  cornflowerblue: 0x6495edff,
  cornsilk: 0xfff8dcff,
  crimson: 0xdc143cff,
  cyan: 0x00ffffff,
  darkblue: 0x00008bff,
  darkcyan: 0x008b8bff,
  darkgoldenrod: 0xb8860bff,
  darkgray: 0xa9a9a9ff,
  darkgreen: 0x006400ff,
  darkgrey: 0xa9a9a9ff,
  darkkhaki: 0xbdb76bff,
  darkmagenta: 0x8b008bff,
  darkolivegreen: 0x556b2fff,
  darkorange: 0xff8c00ff,
  darkorchid: 0x9932ccff,
  darkred: 0x8b0000ff,
  darksalmon: 0xe9967aff,
  darkseagreen: 0x8fbc8fff,
  darkslateblue: 0x483d8bff,
  darkslategray: 0x2f4f4fff,
  darkslategrey: 0x2f4f4fff,
  darkturquoise: 0x00ced1ff,
  darkviolet: 0x9400d3ff,
  deeppink: 0xff1493ff,
  deepskyblue: 0x00bfffff,
  dimgray: 0x696969ff,
  dimgrey: 0x696969ff,
  dodgerblue: 0x1e90ffff,
  firebrick: 0xb22222ff,
  floralwhite: 0xfffaf0ff,
  forestgreen: 0x228b22ff,
  fuchsia: 0xff00ffff,
  gainsboro: 0xdcdcdcff,
  ghostwhite: 0xf8f8ffff,
  gold: 0xffd700ff,
  goldenrod: 0xdaa520ff,
  gray: 0x808080ff,
  green: 0x008000ff,
  greenyellow: 0xadff2fff,
  grey: 0x808080ff,
  honeydew: 0xf0fff0ff,
  hotpink: 0xff69b4ff,
  indianred: 0xcd5c5cff,
  indigo: 0x4b0082ff,
  ivory: 0xfffff0ff,
  khaki: 0xf0e68cff,
  lavender: 0xe6e6faff,
  lavenderblush: 0xfff0f5ff,
  lawngreen: 0x7cfc00ff,
  lemonchiffon: 0xfffacdff,
  lightblue: 0xadd8e6ff,
  lightcoral: 0xf08080ff,
  lightcyan: 0xe0ffffff,
  lightgoldenrodyellow: 0xfafad2ff,
  lightgray: 0xd3d3d3ff,
  lightgreen: 0x90ee90ff,
  lightgrey: 0xd3d3d3ff,
  lightpink: 0xffb6c1ff,
  lightsalmon: 0xffa07aff,
  lightseagreen: 0x20b2aaff,
  lightskyblue: 0x87cefaff,
  lightslategray: 0x778899ff,
  lightslategrey: 0x778899ff,
  lightsteelblue: 0xb0c4deff,
  lightyellow: 0xffffe0ff,
  lime: 0x00ff00ff,
  limegreen: 0x32cd32ff,
  linen: 0xfaf0e6ff,
  magenta: 0xff00ffff,
  maroon: 0x800000ff,
  mediumaquamarine: 0x66cdaaff,
  mediumblue: 0x0000cdff,
  mediumorchid: 0xba55d3ff,
  mediumpurple: 0x9370dbff,
  mediumseagreen: 0x3cb371ff,
  mediumslateblue: 0x7b68eeff,
  mediumspringgreen: 0x00fa9aff,
  mediumturquoise: 0x48d1ccff,
  mediumvioletred: 0xc71585ff,
  midnightblue: 0x191970ff,
  mintcream: 0xf5fffaff,
  mistyrose: 0xffe4e1ff,
  moccasin: 0xffe4b5ff,
  navajowhite: 0xffdeadff,
  navy: 0x000080ff,
  oldlace: 0xfdf5e6ff,
  olive: 0x808000ff,
  olivedrab: 0x6b8e23ff,
  orange: 0xffa500ff,
  orangered: 0xff4500ff,
  orchid: 0xda70d6ff,
  palegoldenrod: 0xeee8aaff,
  palegreen: 0x98fb98ff,
  paleturquoise: 0xafeeeeff,
  palevioletred: 0xdb7093ff,
  papayawhip: 0xffefd5ff,
  peachpuff: 0xffdab9ff,
  peru: 0xcd853fff,
  pink: 0xffc0cbff,
  plum: 0xdda0ddff,
  powderblue: 0xb0e0e6ff,
  purple: 0x800080ff,
  rebeccapurple: 0x663399ff,
  red: 0xff0000ff,
  rosybrown: 0xbc8f8fff,
  royalblue: 0x4169e1ff,
  saddlebrown: 0x8b4513ff,
  salmon: 0xfa8072ff,
  sandybrown: 0xf4a460ff,
  seagreen: 0x2e8b57ff,
  seashell: 0xfff5eeff,
  sienna: 0xa0522dff,
  silver: 0xc0c0c0ff,
  skyblue: 0x87ceebff,
  slateblue: 0x6a5acdff,
  slategray: 0x708090ff,
  slategrey: 0x708090ff,
  snow: 0xfffafaff,
  springgreen: 0x00ff7fff,
  steelblue: 0x4682b4ff,
  tan: 0xd2b48cff,
  teal: 0x008080ff,
  thistle: 0xd8bfd8ff,
  tomato: 0xff6347ff,
  turquoise: 0x40e0d0ff,
  violet: 0xee82eeff,
  wheat: 0xf5deb3ff,
  white: 0xffffffff,
  whitesmoke: 0xf5f5f5ff,
  yellow: 0xffff00ff,
  yellowgreen: 0x9acd32ff
};

// const INTEGER = '[-+]?\\d+';
const NUMBER = '[-+]?\\d*\\.?\\d+';
const PERCENTAGE = NUMBER + '%';

function call() {
  for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
    parts[_key] = arguments[_key];
  }

  return '\\(\\s*(' + parts.join(')\\s*,\\s*(') + ')\\s*\\)';
}

const rgb = new RegExp('rgb' + call(NUMBER, NUMBER, NUMBER));
const rgba = new RegExp('rgba' + call(NUMBER, NUMBER, NUMBER, NUMBER));
const hsl = new RegExp('hsl' + call(NUMBER, PERCENTAGE, PERCENTAGE));
const hsla = new RegExp('hsla' + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER));
const hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
const hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
const hex6 = /^#([0-9a-fA-F]{6})$/;
const hex8 = /^#([0-9a-fA-F]{8})$/;

/*
https://github.com/react-community/normalize-css-color

BSD 3-Clause License

Copyright (c) 2016, React Community
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
function normalizeColor(color) {
  let match;

  if (typeof color === 'number') {
    return color >>> 0 === color && color >= 0 && color <= 0xffffffff ? color : null;
  } // Ordered based on occurrences on Facebook codebase


  if (match = hex6.exec(color)) return parseInt(match[1] + 'ff', 16) >>> 0;
  if (colors.hasOwnProperty(color)) return colors[color];

  if (match = rgb.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    0x000000ff) >>> // a
    0;
  }

  if (match = rgba.exec(color)) {
    return (parse255(match[1]) << 24 | // r
    parse255(match[2]) << 16 | // g
    parse255(match[3]) << 8 | // b
    parse1(match[4])) >>> // a
    0;
  }

  if (match = hex3.exec(color)) {
    return parseInt(match[1] + match[1] + // r
    match[2] + match[2] + // g
    match[3] + match[3] + // b
    'ff', // a
    16) >>> 0;
  } // https://drafts.csswg.org/css-color-4/#hex-notation


  if (match = hex8.exec(color)) return parseInt(match[1], 16) >>> 0;

  if (match = hex4.exec(color)) {
    return parseInt(match[1] + match[1] + // r
    match[2] + match[2] + // g
    match[3] + match[3] + // b
    match[4] + match[4], // a
    16) >>> 0;
  }

  if (match = hsl.exec(color)) {
    return (hslToRgb(parse360(match[1]), // h
    parsePercentage(match[2]), // s
    parsePercentage(match[3]) // l
    ) | 0x000000ff) >>> // a
    0;
  }

  if (match = hsla.exec(color)) {
    return (hslToRgb(parse360(match[1]), // h
    parsePercentage(match[2]), // s
    parsePercentage(match[3]) // l
    ) | parse1(match[4])) >>> // a
    0;
  }

  return null;
}

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h, s, l) {
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
}

function parse255(str) {
  const int = parseInt(str, 10);
  if (int < 0) return 0;
  if (int > 255) return 255;
  return int;
}

function parse360(str) {
  const int = parseFloat(str);
  return (int % 360 + 360) % 360 / 360;
}

function parse1(str) {
  const num = parseFloat(str);
  if (num < 0) return 0;
  if (num > 1) return 255;
  return Math.round(num * 255);
}

function parsePercentage(str) {
  // parseFloat conveniently ignores the final %
  const int = parseFloat(str);
  if (int < 0) return 0;
  if (int > 100) return 1;
  return int / 100;
}

function colorToRgba(input) {
  let int32Color = normalizeColor(input);
  if (int32Color === null) return input;
  int32Color = int32Color || 0;
  let r = (int32Color & 0xff000000) >>> 24;
  let g = (int32Color & 0x00ff0000) >>> 16;
  let b = (int32Color & 0x0000ff00) >>> 8;
  let a = (int32Color & 0x000000ff) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
} // Problem: https://github.com/animatedjs/animated/pull/102
// Solution: https://stackoverflow.com/questions/638565/parsing-scientific-notation-sensibly/658662


const stringShapeRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g; // Covers rgb, rgba, hsl, hsla
// Taken from https://gist.github.com/olmokramer/82ccce673f86db7cda5e

const colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi; // Covers color names (transparent, blue, etc.)

const colorNamesRegex = new RegExp(`(${Object.keys(colors).join('|')})`, 'g');
/**
 * Supports string shapes by extracting numbers so new values can be computed,
 * and recombines those values into new strings of the same shape.  Supports
 * things like:
 *
 *   rgba(123, 42, 99, 0.36)           // colors
 *   -45deg                            // values with units
 *   0 2px 2px 0px rgba(0, 0, 0, 0.12) // box shadows
 */

const createStringInterpolator = config => {
  // Replace colors with rgba
  const outputRange = config.output.map(rangeValue => rangeValue.replace(colorRegex, colorToRgba)).map(rangeValue => rangeValue.replace(colorNamesRegex, colorToRgba));
  const outputRanges = outputRange[0].match(stringShapeRegex).map(() => []);
  outputRange.forEach(value => {
    value.match(stringShapeRegex).forEach((number, i) => outputRanges[i].push(+number));
  });
  const interpolations = outputRange[0].match(stringShapeRegex).map((_value, i) => createInterpolator(_extends({}, config, {
    output: outputRanges[i]
  })));
  return input => {
    let i = 0;
    return outputRange[0] // 'rgba(0, 100, 200, 0)'
    // ->
    // 'rgba(${interpolations[0](input)}, ${interpolations[1](input)}, ...'
    .replace(stringShapeRegex, () => interpolations[i++](input)) // rgba requires that the r,g,b are integers.... so we want to round them, but we *dont* want to
    // round the opacity (4th column).
    .replace(/rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi, (_, p1, p2, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`);
  };
};

let isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};

const prefixKey = (prefix, key) => prefix + key.charAt(0).toUpperCase() + key.substring(1);

const prefixes = ['Webkit', 'Ms', 'Moz', 'O'];
isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
  prefixes.forEach(prefix => acc[prefixKey(prefix, prop)] = acc[prop]);
  return acc;
}, isUnitlessNumber);

function dangerousStyleValue(name, value, isCustomProperty) {
  if (value == null || typeof value === 'boolean' || value === '') return '';
  if (!isCustomProperty && typeof value === 'number' && value !== 0 && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name])) return value + 'px'; // Presumes implicit 'px' suffix for unitless numbers

  return ('' + value).trim();
}

const attributeCache = {};
injectCreateAnimatedStyle(style => new AnimatedStyle(style));
injectStringInterpolator(createStringInterpolator);
injectColorNames(colors);
injectApplyAnimatedValues((instance, props) => {
  if (instance.nodeType && instance.setAttribute !== undefined) {
    const style = props.style,
          children = props.children,
          scrollTop = props.scrollTop,
          scrollLeft = props.scrollLeft,
          attributes = _objectWithoutPropertiesLoose(props, ["style", "children", "scrollTop", "scrollLeft"]);

    const filter = instance.nodeName === 'filter' || instance.parentNode && instance.parentNode.nodeName === 'filter';
    if (scrollTop !== void 0) instance.scrollTop = scrollTop;
    if (scrollLeft !== void 0) instance.scrollLeft = scrollLeft; // Set textContent, if children is an animatable value

    if (children !== void 0) instance.textContent = children; // Set styles ...

    for (let styleName in style) {
      if (!style.hasOwnProperty(styleName)) continue;
      var isCustomProperty = styleName.indexOf('--') === 0;
      var styleValue = dangerousStyleValue(styleName, style[styleName], isCustomProperty);
      if (styleName === 'float') styleName = 'cssFloat';
      if (isCustomProperty) instance.style.setProperty(styleName, styleValue);else instance.style[styleName] = styleValue;
    } // Set attributes ...


    for (let name in attributes) {
      // Attributes are written in dash case
      const dashCase = filter ? name : attributeCache[name] || (attributeCache[name] = name.replace(/([A-Z])/g, n => '-' + n.toLowerCase()));
      if (typeof instance.getAttribute(dashCase) !== 'undefined') instance.setAttribute(dashCase, attributes[name]);
    }

    return;
  } else return false;
}, style => style);

const domElements = ['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr', // SVG
'circle', 'clipPath', 'defs', 'ellipse', 'foreignObject', 'g', 'image', 'line', 'linearGradient', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'text', 'tspan'];
// Extend animated with all the available THREE elements
const apply = merge(createAnimatedComponent, false);
const extendedAnimated = apply(domElements);

var basicBranch = function basicBranch(props) {
  var x = props.x,
      y = props.y,
      classes = props.classes,
      interactions = props.interactions;
  var position = useSpring({
    transform: "translate(".concat(x, ",").concat(y, ")")
  });
  return React__default.createElement(extendedAnimated.g, _extends_1({
    className: "branch ".concat(classes.join(" "), " ")
  }, position, interactions), props.children);
};

var Branch = React__default.memo(basicBranch, samesies);

function samesies(prev, curr) {
  var prevChildren = [].concat(prev.children).map(function (child) {
    return child.props;
  });
  var currChildren = [].concat(curr.children).map(function (child) {
    return child.props;
  });
  var prevProps = {
    x: prev.x,
    y: prev.y
  };
  var currProps = {
    x: curr.x,
    y: curr.y
  };

  if (!areEqualShallow(prevProps, currProps)) {
    return false;
  }

  if (prevChildren.length !== currChildren.length) {
    return false;
  }

  for (var i = 0; i < prevChildren.length; i++) {
    if (!areEqualShallow(prevChildren[i], currChildren[i])) {
      return false;
    }
  }

  return true;
}

function _objectWithoutPropertiesLoose$1(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

var objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose$1;

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = objectWithoutPropertiesLoose(source, excluded);
  var key, i;

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

var objectWithoutProperties = _objectWithoutProperties;

var pi = Math.PI,
    tau = 2 * pi,
    epsilon = 1e-6,
    tauEpsilon = tau - epsilon;

function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = "";
}

function path() {
  return new Path;
}

Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function(x, y) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function(x, y) {
    this._ += "L" + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  quadraticCurveTo: function(x1, y1, x, y) {
    this._ += "Q" + (+x1) + "," + (+y1) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
    this._ += "C" + (+x1) + "," + (+y1) + "," + (+x2) + "," + (+y2) + "," + (this._x1 = +x) + "," + (this._y1 = +y);
  },
  arcTo: function(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1,
        y0 = this._y1,
        x21 = x2 - x1,
        y21 = y2 - y1,
        x01 = x0 - x1,
        y01 = y0 - y1,
        l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon));

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
          y20 = y2 - y0,
          l21_2 = x21 * x21 + y21 * y21,
          l20_2 = x20 * x20 + y20 * y20,
          l21 = Math.sqrt(l21_2),
          l01 = Math.sqrt(l01_2),
          l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
          t01 = l / l01,
          t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon) {
        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
      }

      this._ += "A" + r + "," + r + ",0,0," + (+(y01 * x20 > x01 * y20)) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
    }
  },
  arc: function(x, y, r, a0, a1, ccw) {
    x = +x, y = +y, r = +r, ccw = !!ccw;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0),
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
      this._ += "L" + x0 + "," + y0;
    }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau + tau;

    // Is this a complete circle? Draw two arcs to complete the circle.
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x - dx) + "," + (y - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    }

    // Is this arc non-empty? Draw an arc!
    else if (da > epsilon) {
      this._ += "A" + r + "," + r + ",0," + (+(da >= pi)) + "," + cw + "," + (this._x1 = x + r * Math.cos(a1)) + "," + (this._y1 = y + r * Math.sin(a1));
    }
  },
  rect: function(x, y, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x) + "," + (this._y0 = this._y1 = +y) + "h" + (+w) + "v" + (+h) + "h" + (-w) + "Z";
  },
  toString: function() {
    return this._;
  }
};

function constant(x) {
  return function constant() {
    return x;
  };
}

function Linear(context) {
  this._context = context;
}

Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // proceed
      default: this._context.lineTo(x, y); break;
    }
  }
};

function curveLinear(context) {
  return new Linear(context);
}

function x(p) {
  return p[0];
}

function y(p) {
  return p[1];
}

function line() {
  var x$1 = x,
      y$1 = y,
      defined = constant(true),
      context = null,
      curve = curveLinear,
      output = null;

  function line(data) {
    var i,
        n = data.length,
        d,
        defined0 = false,
        buffer;

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  line.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), line) : x$1;
  };

  line.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), line) : y$1;
  };

  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), line) : defined;
  };

  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };

  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };

  return line;
}

function area() {
  var x0 = x,
      x1 = null,
      y0 = constant(0),
      y1 = y,
      defined = constant(true),
      context = null,
      curve = curveLinear,
      output = null;

  function area(data) {
    var i,
        j,
        k,
        n = data.length,
        d,
        defined0 = false,
        buffer,
        x0z = new Array(n),
        y0z = new Array(n);

    if (context == null) output = curve(buffer = path());

    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k = i - 1; k >= j; --k) {
            output.point(x0z[k], y0z[k]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }

    if (buffer) return output = null, buffer + "" || null;
  }

  function arealine() {
    return line().defined(defined).curve(curve).context(context);
  }

  area.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), x1 = null, area) : x0;
  };

  area.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant(+_), area) : x0;
  };

  area.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : x1;
  };

  area.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), y1 = null, area) : y0;
  };

  area.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant(+_), area) : y0;
  };

  area.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant(+_), area) : y1;
  };

  area.lineX0 =
  area.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };

  area.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };

  area.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };

  area.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant(!!_), area) : defined;
  };

  area.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area) : curve;
  };

  area.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area) : context;
  };

  return area;
}

var slice = Array.prototype.slice;

function linkSource(d) {
  return d.source;
}

function linkTarget(d) {
  return d.target;
}

function link(curve) {
  var source = linkSource,
      target = linkTarget,
      x$1 = x,
      y$1 = y,
      context = null;

  function link() {
    var buffer, argv = slice.call(arguments), s = source.apply(this, argv), t = target.apply(this, argv);
    if (!context) context = buffer = path();
    curve(context, +x$1.apply(this, (argv[0] = s, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
    if (buffer) return context = null, buffer + "" || null;
  }

  link.source = function(_) {
    return arguments.length ? (source = _, link) : source;
  };

  link.target = function(_) {
    return arguments.length ? (target = _, link) : target;
  };

  link.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant(+_), link) : x$1;
  };

  link.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant(+_), link) : y$1;
  };

  link.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), link) : context;
  };

  return link;
}

function curveHorizontal(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
}

function linkHorizontal() {
  return link(curveHorizontal);
}

function Step(context, t) {
  this._context = context;
  this._t = t;
}

Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x, y) {
    x = +x, y = +y;
    switch (this._point) {
      case 0: this._point = 1; this._line ? this._context.lineTo(x, y) : this._context.moveTo(x, y); break;
      case 1: this._point = 2; // proceed
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y);
          this._context.lineTo(x, y);
        } else {
          var x1 = this._x * (1 - this._t) + x * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y);
        }
        break;
      }
    }
    this._x = x, this._y = y;
  }
};

function stepBefore(context) {
  return new Step(context, 0);
}

function ownKeys$2(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$2(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$2(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$2(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
var counter = 1;
/**
 * This is an HOC that creates a linear gradient def and returns this def and the wrapped component with the def
 * applied.
 * @param WrappedContainer
 * @return {function(*): *}
 */
//TODO make possible to apply to a group of components so we don't need one per branch/node when they are the same.

var withLinearGradient = function withLinearGradient(WrappedContainer) {
  function WithLinearGradient(props) {
    props = _objectSpread$2({}, defaultProps(), {}, props);

    var _props = props,
        startingX = _props.startingX,
        endingX = _props.endingX,
        staringY = _props.staringY,
        endingY = _props.endingY,
        fillRamper = _props.fillRamper,
        opacityRamper = _props.opacityRamper,
        n = _props.n,
        gradientAttribute = _props.gradientAttribute,
        attrs = _props.attrs,
        restProps = objectWithoutProperties(_props, ["startingX", "endingX", "staringY", "endingY", "fillRamper", "opacityRamper", "n", "gradientAttribute", "attrs"]);

    var colorStops = [];

    for (var i = 0; i < n; i++) {
      var style = {
        stopColor: fillRamper(i / (n - 1)),
        stopOpacity: opacityRamper(i / (n - 1))
      };
      colorStops.push(React__default.createElement("stop", _extends_1({
        key: i,
        offset: "".concat(i / (n - 1))
      }, style)));
    }

    var idNumber = counter += 1;
    var newAttrs = attrs ? _objectSpread$2({}, attrs, defineProperty({}, gradientAttribute, "url(#grad".concat(idNumber, ")"))) : defineProperty({}, gradientAttribute, "url(#grad".concat(idNumber, ")"));
    return React__default.createElement("g", null, React__default.createElement("defs", null, React__default.createElement("linearGradient", {
      id: "grad".concat(idNumber),
      x1: startingX,
      y1: staringY,
      x2: endingX,
      y2: endingY
    }, colorStops)), React__default.createElement(WrappedContainer, _extends_1({}, restProps, {
      attrs: newAttrs
    })));
  }

  return WithLinearGradient;
};

function defaultProps() {
  return {
    startingX: "0%",
    endingX: "100%",
    staringY: "0%",
    endingY: "0%",
    n: 10,
    fillRamper: function fillRamper(i) {
      return "grey";
    },
    opacityRamper: function opacityRamper(i) {
      return 1;
    },
    gradientAttribute: "fill"
  };
}

function initRange(domain, range) {
  switch (arguments.length) {
    case 0: break;
    case 1: this.range(domain); break;
    default: this.range(range).domain(domain); break;
  }
  return this;
}

function define(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}

function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}

var darker = 0.7;
var brighter = 1 / darker;

var reI = "\\s*([+-]?\\d+)\\s*",
    reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
    reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
    reHex = /^#([0-9a-f]{3,8})$/,
    reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
    reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
    reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
    reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
    reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
    reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};

define(Color, color, {
  copy: function(channels) {
    return Object.assign(new this.constructor, this, channels);
  },
  displayable: function() {
    return this.rgb().displayable();
  },
  hex: color_formatHex, // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});

function color_formatHex() {
  return this.rgb().formatHex();
}

function color_formatHsl() {
  return hslConvert(this).formatHsl();
}

function color_formatRgb() {
  return this.rgb().formatRgb();
}

function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
      : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
      : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
      : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
      : null) // invalid hex
      : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
      : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
      : (m = reRgbaInteger.exec(format)) ? rgba$1(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
      : (m = reRgbaPercent.exec(format)) ? rgba$1(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
      : (m = reHslPercent.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
      : (m = reHslaPercent.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
      : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
      : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
      : null;
}

function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}

function rgba$1(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}

function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb;
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}

function rgb$1(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}

function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}

define(Rgb, rgb$1, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb: function() {
    return this;
  },
  displayable: function() {
    return (-0.5 <= this.r && this.r < 255.5)
        && (-0.5 <= this.g && this.g < 255.5)
        && (-0.5 <= this.b && this.b < 255.5)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex, // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));

function rgb_formatHex() {
  return "#" + hex(this.r) + hex(this.g) + hex(this.b);
}

function rgb_formatRgb() {
  var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
  return (a === 1 ? "rgb(" : "rgba(")
      + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
      + Math.max(0, Math.min(255, Math.round(this.b) || 0))
      + (a === 1 ? ")" : ", " + a + ")");
}

function hex(value) {
  value = Math.max(0, Math.min(255, Math.round(value) || 0));
  return (value < 16 ? "0" : "") + value.toString(16);
}

function hsla$1(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;
  else if (l <= 0 || l >= 1) h = s = NaN;
  else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}

function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl;
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
      g = o.g / 255,
      b = o.b / 255,
      min = Math.min(r, g, b),
      max = Math.max(r, g, b),
      h = NaN,
      s = max - min,
      l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;
    else if (g === max) h = (b - r) / s + 2;
    else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}

function hsl$1(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}

function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}

define(Hsl, hsl$1, extend(Color, {
  brighter: function(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker: function(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb: function() {
    var h = this.h % 360 + (this.h < 0) * 360,
        s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
        l = this.l,
        m2 = l + (l < 0.5 ? l : 1 - l) * s,
        m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
      hsl2rgb(h, m1, m2),
      hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
      this.opacity
    );
  },
  displayable: function() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s))
        && (0 <= this.l && this.l <= 1)
        && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl: function() {
    var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
    return (a === 1 ? "hsl(" : "hsla(")
        + (this.h || 0) + ", "
        + (this.s || 0) * 100 + "%, "
        + (this.l || 0) * 100 + "%"
        + (a === 1 ? ")" : ", " + a + ")");
  }
}));

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60
      : h < 180 ? m2
      : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
      : m1) * 255;
}

function constant$1(x) {
  return function() {
    return x;
  };
}

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant$1(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant$1(isNaN(a) ? b : a);
}

var rgb$2 = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb(start, end) {
    var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
})(1);

function numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function interpolateNumber(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolate$1(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function string(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: interpolateNumber(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function interpolate$1(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant$1(b)
      : (t === "number" ? interpolateNumber
      : t === "string" ? ((c = color(b)) ? (b = c, rgb$2) : string)
      : b instanceof color ? rgb$2
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : interpolateNumber)(a, b);
}

function interpolateRound(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

function quantize(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
}

function constant$2(x) {
  return function() {
    return x;
  };
}

function number(x) {
  return +x;
}

var unit = [0, 1];

function identity(x) {
  return x;
}

function normalize(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant$2(isNaN(b) ? NaN : 0.5);
}

function clamper(a, b) {
  var t;
  if (a > b) t = a, a = b, b = t;
  return function(x) { return Math.max(a, Math.min(b, x)); };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp())
      .unknown(source.unknown());
}

function transformer() {
  var domain = unit,
      range = unit,
      interpolate = interpolate$1,
      transform,
      untransform,
      unknown,
      clamp = identity,
      piecewise,
      output,
      input;

  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
  }

  scale.invert = function(y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = Array.from(_), interpolate = interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };

  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };

  return function(t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}

function continuous() {
  return transformer()(identity, identity);
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimal(1.23) returns ["123", 0].
function formatDecimal(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

function exponent(x) {
  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
}

function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

function formatNumerals(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// [[fill]align][sign][symbol][0][width][,][.precision][~][type]
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}

formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

function FormatSpecifier(specifier) {
  this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
  this.align = specifier.align === undefined ? ">" : specifier.align + "";
  this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === undefined ? undefined : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === undefined ? "" : specifier.type + "";
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width === undefined ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
      + (this.trim ? "~" : "")
      + this.type;
};

// Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
function formatTrim(s) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

var prefixExponent;

function formatPrefixAuto(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

function formatRounded(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

var formatTypes = {
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "b": function(x) { return Math.round(x).toString(2); },
  "c": function(x) { return x + ""; },
  "d": function(x) { return Math.round(x).toString(10); },
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "g": function(x, p) { return x.toPrecision(p); },
  "o": function(x) { return Math.round(x).toString(8); },
  "p": function(x, p) { return formatRounded(x * 100, p); },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
  "x": function(x) { return Math.round(x).toString(16); }
};

function identity$1(x) {
  return x;
}

var map = Array.prototype.map,
    prefixes$1 = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function formatLocale$1(locale) {
  var group = locale.grouping === undefined || locale.thousands === undefined ? identity$1 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
      currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
      currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
      decimal = locale.decimal === undefined ? "." : locale.decimal + "",
      numerals = locale.numerals === undefined ? identity$1 : formatNumerals(map.call(locale.numerals, String)),
      percent = locale.percent === undefined ? "%" : locale.percent + "",
      minus = locale.minus === undefined ? "-" : locale.minus + "",
      nan = locale.nan === undefined ? "NaN" : locale.nan + "";

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        trim = specifier.trim,
        type = specifier.type;

    // The "n" type is an alias for ",g".
    if (type === "n") comma = true, type = "g";

    // The "" type, and any invalid type, is an alias for ".12~g".
    else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

    // If zero fill is specified, padding goes after sign and before digits.
    if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision === undefined ? 6
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Perform the initial formatting.
        var valueNegative = value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

        // Trim insignificant zeros.
        if (trim) value = formatTrim(value);

        // If a negative value rounds to zero during formatting, treat as positive.
        if (valueNegative && +value === 0) valueNegative = false;

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;

        valueSuffix = (type === "s" ? prefixes$1[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": value = valuePrefix + value + valueSuffix + padding; break;
        case "=": value = valuePrefix + padding + value + valueSuffix; break;
        case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
        default: value = padding + valuePrefix + value + valueSuffix; break;
      }

      return numerals(value);
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes$1[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

var locale$1;
var format;
var formatPrefix;

defaultLocale$1({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""],
  minus: "-"
});

function defaultLocale$1(definition) {
  locale$1 = formatLocale$1(definition);
  format = locale$1.format;
  formatPrefix = locale$1.formatPrefix;
  return locale$1;
}

function precisionFixed(step) {
  return Math.max(0, -exponent(Math.abs(step)));
}

function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
}

function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent(max) - exponent(step)) + 1;
}

function tickFormat(start, stop, count, specifier) {
  var step = tickStep(start, stop, count),
      precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };

  scale.nice = function(count) {
    if (count == null) count = 10;

    var d = domain(),
        i0 = 0,
        i1 = d.length - 1,
        start = d[i0],
        stop = d[i1],
        step;

    if (stop < start) {
      step = start, start = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }

    step = tickIncrement(start, stop, count);

    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
      step = tickIncrement(start, stop, count);
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
      step = tickIncrement(start, stop, count);
    }

    if (step > 0) {
      d[i0] = Math.floor(start / step) * step;
      d[i1] = Math.ceil(stop / step) * step;
      domain(d);
    } else if (step < 0) {
      d[i0] = Math.ceil(start * step) / step;
      d[i1] = Math.floor(stop * step) / step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear$1() {
  var scale = continuous();

  scale.copy = function() {
    return copy(scale, linear$1());
  };

  initRange.apply(scale, arguments);

  return linearish(scale);
}

function getVertexClassesFromNode(tree) {
  var classes = [!tree.children ? "external-node" : "internal-node"];

  if (tree.annotationTypes) {
    classes = classes.concat(Object.entries(tree.annotationTypes).filter(function (_ref) {
      var _ref2 = slicedToArray(_ref, 1),
          key = _ref2[0];

      return tree.annotationTypes[key] && (tree.annotationTypes[key].type === Type.DISCRETE || tree.annotationTypes[key].type === Type.BOOLEAN || tree.annotationTypes[key].type === Type.INTEGER);
    }).map(function (_ref3) {
      var _ref4 = slicedToArray(_ref3, 2),
          key = _ref4[0],
          value = _ref4[1];

      if (tree.annotationTypes[key].type === Type.DISCRETE || tree.annotationTypes[key].type === Type.INTEGER) {
        return "".concat(key, "-").concat(tree.annotations[key]);
      } else if (tree.annotationTypes[key].type === Type.BOOLEAN && tree.annotations[key]) {
        return "".concat(key);
      }
    }));
  }

  return classes;
}
function makeVertexFromNode(node, labelBelow) {
  var leftLabel = !!node.children;
  return {
    id: node.id,
    textLabel: {
      labelBelow: labelBelow,
      x: leftLabel ? "-6" : "12",
      y: leftLabel ? labelBelow ? "-8" : "8" : "0",
      alignmentBaseline: leftLabel ? labelBelow ? "bottom" : "hanging" : "middle",
      textAnchor: leftLabel ? "end" : "start"
    },
    classes: getVertexClassesFromNode(node)
  };
}

// Should be no imports here!
var _a; // SOme things that should be evaluated before all else...


var hasSymbol = typeof Symbol !== "undefined";
var hasMap = typeof Map !== "undefined";
var hasSet = typeof Set !== "undefined";
/**
 * The sentinel value returned by producers to replace the draft with undefined.
 */

var NOTHING = hasSymbol ? Symbol("immer-nothing") : (_a = {}, _a["immer-nothing"] = true, _a);
/**
 * To let Immer treat your class instances as plain immutable objects
 * (albeit with a custom prototype), you must define either an instance property
 * or a static property on each of your custom classes.
 *
 * Otherwise, your class instance will never be drafted, which means it won't be
 * safe to mutate in a produce callback.
 */

var DRAFTABLE = hasSymbol ? Symbol("immer-draftable") : "__$immer_draftable";
var DRAFT_STATE = hasSymbol ? Symbol("immer-state") : "__$immer_state";
var iteratorSymbol = hasSymbol ? Symbol.iterator : "@@iterator";

/* istanbul ignore next */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } }
  };

  return extendStatics(d, b);
}; // Ugly hack to resolve #502 and inherit built in Map / Set


function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = ( // @ts-ignore
  __.prototype = b.prototype, new __());
}

var Archtype;

(function (Archtype) {
  Archtype[Archtype["Object"] = 0] = "Object";
  Archtype[Archtype["Array"] = 1] = "Array";
  Archtype[Archtype["Map"] = 2] = "Map";
  Archtype[Archtype["Set"] = 3] = "Set";
})(Archtype || (Archtype = {}));

var ProxyType;

(function (ProxyType) {
  ProxyType[ProxyType["ProxyObject"] = 0] = "ProxyObject";
  ProxyType[ProxyType["ProxyArray"] = 1] = "ProxyArray";
  ProxyType[ProxyType["ES5Object"] = 2] = "ES5Object";
  ProxyType[ProxyType["ES5Array"] = 3] = "ES5Array";
  ProxyType[ProxyType["Map"] = 4] = "Map";
  ProxyType[ProxyType["Set"] = 5] = "Set";
})(ProxyType || (ProxyType = {}));

/** Returns true if the given value is an Immer draft */

function isDraft(value) {
  return !!value && !!value[DRAFT_STATE];
}
/** Returns true if the given value can be drafted by Immer */

function isDraftable(value) {
  if (!value) { return false; }
  return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor[DRAFTABLE] || isMap(value) || isSet(value);
}
function isPlainObject(value) {
  if (!value || typeof value !== "object") { return false; }
  var proto = Object.getPrototypeOf(value);
  return !proto || proto === Object.prototype;
}
var ownKeys$3 = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : typeof Object.getOwnPropertySymbols !== "undefined" ? function (obj) {
  return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
} :
/* istanbul ignore next */
Object.getOwnPropertyNames;
function each(obj, iter) {
  if (getArchtype(obj) === Archtype.Object) {
    ownKeys$3(obj).forEach(function (key) {
      return iter(key, obj[key], obj);
    });
  } else {
    obj.forEach(function (entry, index) {
      return iter(index, entry, obj);
    });
  }
}
function isEnumerable(base, prop) {
  var desc = Object.getOwnPropertyDescriptor(base, prop);
  return desc && desc.enumerable ? true : false;
}
function getArchtype(thing) {
  /* istanbul ignore next */
  if (!thing) { die(); }

  if (thing[DRAFT_STATE]) {
    switch (thing[DRAFT_STATE].type) {
      case ProxyType.ES5Object:
      case ProxyType.ProxyObject:
        return Archtype.Object;

      case ProxyType.ES5Array:
      case ProxyType.ProxyArray:
        return Archtype.Array;

      case ProxyType.Map:
        return Archtype.Map;

      case ProxyType.Set:
        return Archtype.Set;
    }
  }

  return Array.isArray(thing) ? Archtype.Array : isMap(thing) ? Archtype.Map : isSet(thing) ? Archtype.Set : Archtype.Object;
}
function has(thing, prop) {
  return getArchtype(thing) === Archtype.Map ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function get(thing, prop) {
  // @ts-ignore
  return getArchtype(thing) === Archtype.Map ? thing.get(prop) : thing[prop];
}
function set(thing, propOrOldValue, value) {
  switch (getArchtype(thing)) {
    case Archtype.Map:
      thing.set(propOrOldValue, value);
      break;

    case Archtype.Set:
      thing.delete(propOrOldValue);
      thing.add(value);
      break;

    default:
      thing[propOrOldValue] = value;
  }
}
function is$1(x, y) {
  // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
  if (x === y) {
    return x !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}
function isMap(target) {
  return hasMap && target instanceof Map;
}
function isSet(target) {
  return hasSet && target instanceof Set;
}
function latest(state) {
  return state.copy || state.base;
}
function shallowCopy(base, invokeGetters) {
  if (invokeGetters === void 0) {
    invokeGetters = false;
  }

  if (Array.isArray(base)) { return base.slice(); }
  var clone = Object.create(Object.getPrototypeOf(base));
  ownKeys$3(base).forEach(function (key) {
    if (key === DRAFT_STATE) {
      return; // Never copy over draft state.
    }

    var desc = Object.getOwnPropertyDescriptor(base, key);
    var value = desc.value;

    if (desc.get) {
      if (!invokeGetters) {
        throw new Error("Immer drafts cannot have computed properties");
      }

      value = desc.get.call(base);
    }

    if (desc.enumerable) {
      clone[key] = value;
    } else {
      Object.defineProperty(clone, key, {
        value: value,
        writable: true,
        configurable: true
      });
    }
  });
  return clone;
}
function freeze(obj, deep) {
  if (!isDraftable(obj) || isDraft(obj) || Object.isFrozen(obj)) { return; }
  var type = getArchtype(obj);

  if (type === Archtype.Set) {
    obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
  } else if (type === Archtype.Map) {
    obj.set = obj.clear = obj.delete = dontMutateFrozenCollections;
  }

  Object.freeze(obj);
  if (deep) { each(obj, function (_, value) {
    return freeze(value, true);
  }); }
}

function dontMutateFrozenCollections() {
  throw new Error("This object has been frozen and should not be mutated");
}

function createHiddenProperty(target, prop, value) {
  Object.defineProperty(target, prop, {
    value: value,
    enumerable: false,
    writable: true
  });
}
/* istanbul ignore next */

function die() {
  throw new Error("Illegal state, please file a bug");
}

/** Each scope represents a `produce` call. */

var ImmerScope =
/** @class */
function () {
  function ImmerScope(parent, immer) {
    this.drafts = [];
    this.parent = parent;
    this.immer = immer; // Whenever the modified draft contains a draft from another scope, we
    // need to prevent auto-freezing so the unowned draft can be finalized.

    this.canAutoFreeze = true;
  }

  ImmerScope.prototype.usePatches = function (patchListener) {
    if (patchListener) {
      this.patches = [];
      this.inversePatches = [];
      this.patchListener = patchListener;
    }
  };

  ImmerScope.prototype.revoke = function () {
    this.leave();
    this.drafts.forEach(revoke); // @ts-ignore

    this.drafts = null;
  };

  ImmerScope.prototype.leave = function () {
    if (this === ImmerScope.current) {
      ImmerScope.current = this.parent;
    }
  };

  ImmerScope.enter = function (immer) {
    var scope = new ImmerScope(ImmerScope.current, immer);
    ImmerScope.current = scope;
    return scope;
  };

  return ImmerScope;
}();

function revoke(draft) {
  var state = draft[DRAFT_STATE];
  if (state.type === ProxyType.ProxyObject || state.type === ProxyType.ProxyArray) { state.revoke(); }else { state.revoked = true; }
}

function processResult(immer, result, scope) {
  var baseDraft = scope.drafts[0];
  var isReplaced = result !== undefined && result !== baseDraft;
  immer.willFinalize(scope, result, isReplaced);

  if (isReplaced) {
    if (baseDraft[DRAFT_STATE].modified) {
      scope.revoke();
      throw new Error("An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft."); // prettier-ignore
    }

    if (isDraftable(result)) {
      // Finalize the result in case it contains (or is) a subset of the draft.
      result = finalize(immer, result, scope);
      if (!scope.parent) { maybeFreeze(immer, result); }
    }

    if (scope.patches) {
      scope.patches.push({
        op: "replace",
        path: [],
        value: result
      });
      scope.inversePatches.push({
        op: "replace",
        path: [],
        value: baseDraft[DRAFT_STATE].base
      });
    }
  } else {
    // Finalize the base draft.
    result = finalize(immer, baseDraft, scope, []);
  }

  scope.revoke();

  if (scope.patches) {
    scope.patchListener(scope.patches, scope.inversePatches);
  }

  return result !== NOTHING ? result : undefined;
}

function finalize(immer, draft, scope, path) {
  var state = draft[DRAFT_STATE];

  if (!state) {
    if (Object.isFrozen(draft)) { return draft; }
    return finalizeTree(immer, draft, scope);
  } // Never finalize drafts owned by another scope.


  if (state.scope !== scope) {
    return draft;
  }

  if (!state.modified) {
    maybeFreeze(immer, state.base, true);
    return state.base;
  }

  if (!state.finalized) {
    state.finalized = true;
    finalizeTree(immer, state.draft, scope, path); // We cannot really delete anything inside of a Set. We can only replace the whole Set.

    if (immer.onDelete && state.type !== ProxyType.Set) {
      // The `assigned` object is unreliable with ES5 drafts.
      if (immer.useProxies) {
        var assigned = state.assigned;
        each(assigned, function (prop, exists) {
          if (!exists) { immer.onDelete(state, prop); }
        });
      } else {
        var base = state.base,
            copy_1 = state.copy;
        each(base, function (prop) {
          if (!has(copy_1, prop)) { immer.onDelete(state, prop); }
        });
      }
    }

    if (immer.onCopy) {
      immer.onCopy(state);
    } // At this point, all descendants of `state.copy` have been finalized,
    // so we can be sure that `scope.canAutoFreeze` is accurate.


    if (immer.autoFreeze && scope.canAutoFreeze) {
      freeze(state.copy, false);
    }

    if (path && scope.patches) {
      generatePatches(state, path, scope.patches, scope.inversePatches);
    }
  }

  return state.copy;
}

function finalizeTree(immer, root, scope, rootPath) {
  var state = root[DRAFT_STATE];

  if (state) {
    if (state.type === ProxyType.ES5Object || state.type === ProxyType.ES5Array) {
      // Create the final copy, with added keys and without deleted keys.
      state.copy = shallowCopy(state.draft, true);
    }

    root = state.copy;
  }

  each(root, function (key, value) {
    return finalizeProperty(immer, scope, root, state, root, key, value, rootPath);
  });
  return root;
}

function finalizeProperty(immer, scope, root, rootState, parentValue, prop, childValue, rootPath) {
  if (childValue === parentValue) {
    throw Error("Immer forbids circular references");
  } // In the `finalizeTree` method, only the `root` object may be a draft.


  var isDraftProp = !!rootState && parentValue === root;
  var isSetMember = isSet(parentValue);

  if (isDraft(childValue)) {
    var path = rootPath && isDraftProp && !isSetMember && // Set objects are atomic since they have no keys.
    !has(rootState.assigned, prop) // Skip deep patches for assigned keys.
    ? rootPath.concat(prop) : undefined; // Drafts owned by `scope` are finalized here.

    childValue = finalize(immer, childValue, scope, path);
    set(parentValue, prop, childValue); // Drafts from another scope must prevent auto-freezing.

    if (isDraft(childValue)) {
      scope.canAutoFreeze = false;
    }
  } // Unchanged draft properties are ignored.
  else if (isDraftProp && is$1(childValue, get(rootState.base, prop))) {
      return;
    } // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.
    // TODO: the recursion over here looks weird, shouldn't non-draft stuff have it's own recursion?
    // especially the passing on of root and rootState doesn't make sense...
    else if (isDraftable(childValue)) {
        each(childValue, function (key, grandChild) {
          return finalizeProperty(immer, scope, root, rootState, childValue, key, grandChild, rootPath);
        });
        if (!scope.parent) { maybeFreeze(immer, childValue); }
      }

  if (isDraftProp && immer.onAssign && !isSetMember) {
    immer.onAssign(rootState, prop, childValue);
  }
}

function maybeFreeze(immer, value, deep) {
  if (deep === void 0) {
    deep = false;
  }

  if (immer.autoFreeze && !isDraft(value)) {
    freeze(value, deep);
  }
}

/**
 * Returns a new draft of the `base` object.
 *
 * The second argument is the parent draft-state (used internally).
 */

function createProxy(base, parent) {
  var isArray = Array.isArray(base);
  var state = {
    type: isArray ? ProxyType.ProxyArray : ProxyType.ProxyObject,
    // Track which produce call this is associated with.
    scope: parent ? parent.scope : ImmerScope.current,
    // True for both shallow and deep changes.
    modified: false,
    // Used during finalization.
    finalized: false,
    // Track which properties have been assigned (true) or deleted (false).
    assigned: {},
    // The parent draft state.
    parent: parent,
    // The base state.
    base: base,
    // The base proxy.
    draft: null,
    // Any property proxies.
    drafts: {},
    // The base copy with any updated values.
    copy: null,
    // Called by the `produce` function.
    revoke: null,
    isManual: false
  }; // the traps must target something, a bit like the 'real' base.
  // but also, we need to be able to determine from the target what the relevant state is
  // (to avoid creating traps per instance to capture the state in closure,
  // and to avoid creating weird hidden properties as well)
  // So the trick is to use 'state' as the actual 'target'! (and make sure we intercept everything)
  // Note that in the case of an array, we put the state in an array to have better Reflect defaults ootb

  var target = state;
  var traps = objectTraps;

  if (isArray) {
    target = [state];
    traps = arrayTraps;
  } // TODO: optimization: might be faster, cheaper if we created a non-revocable proxy
  // and administrate revoking ourselves


  var _a = Proxy.revocable(target, traps),
      revoke = _a.revoke,
      proxy = _a.proxy;

  state.draft = proxy;
  state.revoke = revoke;
  return proxy;
}
/**
 * Object drafts
 */

var objectTraps = {
  get: function (state, prop) {
    if (prop === DRAFT_STATE) { return state; }
    var drafts = state.drafts; // Check for existing draft in unmodified state.

    if (!state.modified && has(drafts, prop)) {
      return drafts[prop];
    }

    var value = latest(state)[prop];

    if (state.finalized || !isDraftable(value)) {
      return value;
    } // Check for existing draft in modified state.


    if (state.modified) {
      // Assigned values are never drafted. This catches any drafts we created, too.
      if (value !== peek(state.base, prop)) { return value; } // Store drafts on the copy (when one exists).
      // @ts-ignore

      drafts = state.copy;
    }

    return drafts[prop] = state.scope.immer.createProxy(value, state);
  },
  has: function (state, prop) {
    return prop in latest(state);
  },
  ownKeys: function (state) {
    return Reflect.ownKeys(latest(state));
  },
  set: function (state, prop
  /* strictly not, but helps TS */
  , value) {
    if (!state.modified) {
      var baseValue = peek(state.base, prop); // Optimize based on value's truthiness. Truthy values are guaranteed to
      // never be undefined, so we can avoid the `in` operator. Lastly, truthy
      // values may be drafts, but falsy values are never drafts.

      var isUnchanged = value ? is$1(baseValue, value) || value === state.drafts[prop] : is$1(baseValue, value) && prop in state.base;
      if (isUnchanged) { return true; }
      prepareCopy(state);
      markChanged(state);
    }

    state.assigned[prop] = true; // @ts-ignore

    state.copy[prop] = value;
    return true;
  },
  deleteProperty: function (state, prop) {
    // The `undefined` check is a fast path for pre-existing keys.
    if (peek(state.base, prop) !== undefined || prop in state.base) {
      state.assigned[prop] = false;
      prepareCopy(state);
      markChanged(state);
    } else if (state.assigned[prop]) {
      // if an originally not assigned property was deleted
      delete state.assigned[prop];
    } // @ts-ignore


    if (state.copy) { delete state.copy[prop]; }
    return true;
  },
  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
  // the same guarantee in ES5 mode.
  getOwnPropertyDescriptor: function (state, prop) {
    var owner = latest(state);
    var desc = Reflect.getOwnPropertyDescriptor(owner, prop);

    if (desc) {
      desc.writable = true;
      desc.configurable = state.type !== ProxyType.ProxyArray || prop !== "length";
    }

    return desc;
  },
  defineProperty: function () {
    throw new Error("Object.defineProperty() cannot be used on an Immer draft"); // prettier-ignore
  },
  getPrototypeOf: function (state) {
    return Object.getPrototypeOf(state.base);
  },
  setPrototypeOf: function () {
    throw new Error("Object.setPrototypeOf() cannot be used on an Immer draft"); // prettier-ignore
  }
};
/**
 * Array drafts
 */

var arrayTraps = {};
each(objectTraps, function (key, fn) {
  // @ts-ignore
  arrayTraps[key] = function () {
    arguments[0] = arguments[0][0];
    return fn.apply(this, arguments);
  };
});

arrayTraps.deleteProperty = function (state, prop) {
  if (isNaN(parseInt(prop))) {
    throw new Error("Immer only supports deleting array indices"); // prettier-ignore
  }

  return objectTraps.deleteProperty.call(this, state[0], prop);
};

arrayTraps.set = function (state, prop, value) {
  if (prop !== "length" && isNaN(parseInt(prop))) {
    throw new Error("Immer only supports setting array indices and the 'length' property"); // prettier-ignore
  }

  return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
/**
 * Map drafts
 */
// Access a property without creating an Immer draft.


function peek(draft, prop) {
  var state = draft[DRAFT_STATE];
  var desc = Reflect.getOwnPropertyDescriptor(state ? latest(state) : draft, prop);
  return desc && desc.value;
}

function markChanged(state) {
  if (!state.modified) {
    state.modified = true;

    if (state.type === ProxyType.ProxyObject || state.type === ProxyType.ProxyArray) {
      var copy_1 = state.copy = shallowCopy(state.base);
      each(state.drafts, function (key, value) {
        // @ts-ignore
        copy_1[key] = value;
      });
      state.drafts = undefined;
    }

    if (state.parent) {
      markChanged(state.parent);
    }
  }
}

function prepareCopy(state) {
  if (!state.copy) {
    state.copy = shallowCopy(state.base);
  }
}

function willFinalizeES5(scope, result, isReplaced) {
  scope.drafts.forEach(function (draft) {
    draft[DRAFT_STATE].finalizing = true;
  });

  if (!isReplaced) {
    if (scope.patches) {
      markChangesRecursively(scope.drafts[0]);
    } // This is faster when we don't care about which attributes changed.


    markChangesSweep(scope.drafts);
  } // When a child draft is returned, look for changes.
  else if (isDraft(result) && result[DRAFT_STATE].scope === scope) {
      markChangesSweep(scope.drafts);
    }
}
function createES5Proxy(base, parent) {
  var isArray = Array.isArray(base);
  var draft = clonePotentialDraft(base);
  each(draft, function (prop) {
    proxyProperty(draft, prop, isArray || isEnumerable(base, prop));
  });
  var state = {
    type: isArray ? ProxyType.ES5Array : ProxyType.ES5Object,
    scope: parent ? parent.scope : ImmerScope.current,
    modified: false,
    finalizing: false,
    finalized: false,
    assigned: {},
    parent: parent,
    base: base,
    draft: draft,
    copy: null,
    revoked: false,
    isManual: false
  };
  createHiddenProperty(draft, DRAFT_STATE, state);
  return draft;
} // Access a property without creating an Immer draft.

function peek$1(draft, prop) {
  var state = draft[DRAFT_STATE];

  if (state && !state.finalizing) {
    state.finalizing = true;
    var value = draft[prop];
    state.finalizing = false;
    return value;
  }

  return draft[prop];
}

function get$1(state, prop) {
  assertUnrevoked(state);
  var value = peek$1(latest(state), prop);
  if (state.finalizing) { return value; } // Create a draft if the value is unmodified.

  if (value === peek$1(state.base, prop) && isDraftable(value)) {
    prepareCopy$1(state); // @ts-ignore

    return state.copy[prop] = state.scope.immer.createProxy(value, state);
  }

  return value;
}

function set$1(state, prop, value) {
  assertUnrevoked(state);
  state.assigned[prop] = true;

  if (!state.modified) {
    if (is$1(value, peek$1(latest(state), prop))) { return; }
    markChangedES5(state);
    prepareCopy$1(state);
  } // @ts-ignore


  state.copy[prop] = value;
}

function markChangedES5(state) {
  if (!state.modified) {
    state.modified = true;
    if (state.parent) { markChangedES5(state.parent); }
  }
}

function prepareCopy$1(state) {
  if (!state.copy) { state.copy = clonePotentialDraft(state.base); }
}

function clonePotentialDraft(base) {
  var state = base && base[DRAFT_STATE];

  if (state) {
    state.finalizing = true;
    var draft = shallowCopy(state.draft, true);
    state.finalizing = false;
    return draft;
  }

  return shallowCopy(base);
} // property descriptors are recycled to make sure we don't create a get and set closure per property,
// but share them all instead


var descriptors = {};

function proxyProperty(draft, prop, enumerable) {
  var desc = descriptors[prop];

  if (desc) {
    desc.enumerable = enumerable;
  } else {
    descriptors[prop] = desc = {
      configurable: true,
      enumerable: enumerable,
      get: function () {
        return get$1(this[DRAFT_STATE], prop);
      },
      set: function (value) {
        set$1(this[DRAFT_STATE], prop, value);
      }
    };
  }

  Object.defineProperty(draft, prop, desc);
}

function assertUnrevoked(state) {
  if (state.revoked === true) { throw new Error("Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + JSON.stringify(latest(state))); }
} // This looks expensive, but only proxies are visited, and only objects without known changes are scanned.

function markChangesSweep(drafts) {
  // The natural order of drafts in the `scope` array is based on when they
  // were accessed. By processing drafts in reverse natural order, we have a
  // better chance of processing leaf nodes first. When a leaf node is known to
  // have changed, we can avoid any traversal of its ancestor nodes.
  for (var i = drafts.length - 1; i >= 0; i--) {
    var state = drafts[i][DRAFT_STATE];

    if (!state.modified) {
      switch (state.type) {
        case ProxyType.ES5Array:
          if (hasArrayChanges(state)) { markChangedES5(state); }
          break;

        case ProxyType.ES5Object:
          if (hasObjectChanges(state)) { markChangedES5(state); }
          break;
      }
    }
  }
}

function markChangesRecursively(object) {
  if (!object || typeof object !== "object") { return; }
  var state = object[DRAFT_STATE];
  if (!state) { return; }
  var base = state.base,
      draft = state.draft,
      assigned = state.assigned,
      type = state.type;

  if (type === ProxyType.ES5Object) {
    // Look for added keys.
    // TODO: looks quite duplicate to hasObjectChanges,
    // probably there is a faster way to detect changes, as sweep + recurse seems to do some
    // unnecessary work.
    // also: probably we can store the information we detect here, to speed up tree finalization!
    each(draft, function (key) {
      if (key === DRAFT_STATE) { return; } // The `undefined` check is a fast path for pre-existing keys.

      if (base[key] === undefined && !has(base, key)) {
        assigned[key] = true;
        markChangedES5(state);
      } else if (!assigned[key]) {
        // Only untouched properties trigger recursion.
        markChangesRecursively(draft[key]);
      }
    }); // Look for removed keys.

    each(base, function (key) {
      // The `undefined` check is a fast path for pre-existing keys.
      if (draft[key] === undefined && !has(draft, key)) {
        assigned[key] = false;
        markChangedES5(state);
      }
    });
  } else if (type === ProxyType.ES5Array) {
    if (hasArrayChanges(state)) {
      markChangedES5(state);
      assigned.length = true;
    }

    if (draft.length < base.length) {
      for (var i = draft.length; i < base.length; i++) { assigned[i] = false; }
    } else {
      for (var i = base.length; i < draft.length; i++) { assigned[i] = true; }
    } // Minimum count is enough, the other parts has been processed.


    var min = Math.min(draft.length, base.length);

    for (var i = 0; i < min; i++) {
      // Only untouched indices trigger recursion.
      if (assigned[i] === undefined) { markChangesRecursively(draft[i]); }
    }
  }
}

function hasObjectChanges(state) {
  var base = state.base,
      draft = state.draft; // Search for added keys and changed keys. Start at the back, because
  // non-numeric keys are ordered by time of definition on the object.

  var keys = Object.keys(draft);

  for (var i = keys.length - 1; i >= 0; i--) {
    var key = keys[i];
    var baseValue = base[key]; // The `undefined` check is a fast path for pre-existing keys.

    if (baseValue === undefined && !has(base, key)) {
      return true;
    } // Once a base key is deleted, future changes go undetected, because its
    // descriptor is erased. This branch detects any missed changes.
    else {
        var value = draft[key];
        var state_1 = value && value[DRAFT_STATE];

        if (state_1 ? state_1.base !== baseValue : !is$1(value, baseValue)) {
          return true;
        }
      }
  } // At this point, no keys were added or changed.
  // Compare key count to determine if keys were deleted.


  return keys.length !== Object.keys(base).length;
}

function hasArrayChanges(state) {
  var draft = state.draft;
  if (draft.length !== state.base.length) { return true; } // See #116
  // If we first shorten the length, our array interceptors will be removed.
  // If after that new items are added, result in the same original length,
  // those last items will have no intercepting property.
  // So if there is no own descriptor on the last position, we know that items were removed and added
  // N.B.: splice, unshift, etc only shift values around, but not prop descriptors, so we only have to check
  // the last one

  var descriptor = Object.getOwnPropertyDescriptor(draft, draft.length - 1); // descriptor can be null, but only for newly created sparse arrays, eg. new Array(10)

  if (descriptor && !descriptor.get) { return true; } // For all other cases, we don't have to compare, as they would have been picked up by the index setters

  return false;
}

var DraftMap = function (_super) {
  if (!_super) {
    /* istanbul ignore next */
    throw new Error("Map is not polyfilled");
  }

  __extends(DraftMap, _super); // Create class manually, cause #502


  function DraftMap(target, parent) {
    this[DRAFT_STATE] = {
      type: ProxyType.Map,
      parent: parent,
      scope: parent ? parent.scope : ImmerScope.current,
      modified: false,
      finalized: false,
      copy: undefined,
      assigned: undefined,
      base: target,
      draft: this,
      isManual: false,
      revoked: false
    };
    return this;
  }

  var p = DraftMap.prototype; // TODO: smaller build size if we create a util for Object.defineProperty

  Object.defineProperty(p, "size", {
    get: function () {
      return latest(this[DRAFT_STATE]).size;
    },
    enumerable: true,
    configurable: true
  });

  p.has = function (key) {
    return latest(this[DRAFT_STATE]).has(key);
  };

  p.set = function (key, value) {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);

    if (latest(state).get(key) !== value) {
      prepareCopy$2(state);
      state.scope.immer.markChanged(state);
      state.assigned.set(key, true);
      state.copy.set(key, value);
      state.assigned.set(key, true);
    }

    return this;
  };

  p.delete = function (key) {
    if (!this.has(key)) {
      return false;
    }

    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$2(state);
    state.scope.immer.markChanged(state);
    state.assigned.set(key, false);
    state.copy.delete(key);
    return true;
  };

  p.clear = function () {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$2(state);
    state.scope.immer.markChanged(state);
    state.assigned = new Map();
    return state.copy.clear();
  };

  p.forEach = function (cb, thisArg) {
    var _this = this;

    var state = this[DRAFT_STATE];
    latest(state).forEach(function (_value, key, _map) {
      cb.call(thisArg, _this.get(key), key, _this);
    });
  };

  p.get = function (key) {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    var value = latest(state).get(key);

    if (state.finalized || !isDraftable(value)) {
      return value;
    }

    if (value !== state.base.get(key)) {
      return value; // either already drafted or reassigned
    } // despite what it looks, this creates a draft only once, see above condition


    var draft = state.scope.immer.createProxy(value, state);
    prepareCopy$2(state);
    state.copy.set(key, draft);
    return draft;
  };

  p.keys = function () {
    return latest(this[DRAFT_STATE]).keys();
  };

  p.values = function () {
    var _a;

    var _this = this;

    var iterator = this.keys();
    return _a = {}, _a[iteratorSymbol] = function () {
      return _this.values();
    }, _a.next = function () {
      var r = iterator.next();
      /* istanbul ignore next */

      if (r.done) { return r; }

      var value = _this.get(r.value);

      return {
        done: false,
        value: value
      };
    }, _a;
  };

  p.entries = function () {
    var _a;

    var _this = this;

    var iterator = this.keys();
    return _a = {}, _a[iteratorSymbol] = function () {
      return _this.entries();
    }, _a.next = function () {
      var r = iterator.next();
      /* istanbul ignore next */

      if (r.done) { return r; }

      var value = _this.get(r.value);

      return {
        done: false,
        value: [r.value, value]
      };
    }, _a;
  };

  p[iteratorSymbol] = function () {
    return this.entries();
  };

  return DraftMap;
}(Map);

function proxyMap(target, parent) {
  // @ts-ignore
  return new DraftMap(target, parent);
}

function prepareCopy$2(state) {
  if (!state.copy) {
    state.assigned = new Map();
    state.copy = new Map(state.base);
  }
}

var DraftSet = function (_super) {
  if (!_super) {
    /* istanbul ignore next */
    throw new Error("Set is not polyfilled");
  }

  __extends(DraftSet, _super); // Create class manually, cause #502


  function DraftSet(target, parent) {
    this[DRAFT_STATE] = {
      type: ProxyType.Set,
      parent: parent,
      scope: parent ? parent.scope : ImmerScope.current,
      modified: false,
      finalized: false,
      copy: undefined,
      base: target,
      draft: this,
      drafts: new Map(),
      revoked: false,
      isManual: false
    };
    return this;
  }

  var p = DraftSet.prototype;
  Object.defineProperty(p, "size", {
    get: function () {
      return latest(this[DRAFT_STATE]).size;
    },
    enumerable: true,
    configurable: true
  });

  p.has = function (value) {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state); // bit of trickery here, to be able to recognize both the value, and the draft of its value

    if (!state.copy) {
      return state.base.has(value);
    }

    if (state.copy.has(value)) { return true; }
    if (state.drafts.has(value) && state.copy.has(state.drafts.get(value))) { return true; }
    return false;
  };

  p.add = function (value) {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);

    if (state.copy) {
      state.copy.add(value);
    } else if (!state.base.has(value)) {
      prepareCopy$3(state);
      state.scope.immer.markChanged(state);
      state.copy.add(value);
    }

    return this;
  };

  p.delete = function (value) {
    if (!this.has(value)) {
      return false;
    }

    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$3(state);
    state.scope.immer.markChanged(state);
    return state.copy.delete(value) || (state.drafts.has(value) ? state.copy.delete(state.drafts.get(value)) :
    /* istanbul ignore next */
    false);
  };

  p.clear = function () {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$3(state);
    state.scope.immer.markChanged(state);
    return state.copy.clear();
  };

  p.values = function () {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$3(state);
    return state.copy.values();
  };

  p.entries = function entries() {
    var state = this[DRAFT_STATE];
    assertUnrevoked(state);
    prepareCopy$3(state);
    return state.copy.entries();
  };

  p.keys = function () {
    return this.values();
  };

  p[iteratorSymbol] = function () {
    return this.values();
  };

  p.forEach = function forEach(cb, thisArg) {
    var iterator = this.values();
    var result = iterator.next();

    while (!result.done) {
      cb.call(thisArg, result.value, result.value, this);
      result = iterator.next();
    }
  };

  return DraftSet;
}(Set);

function proxySet(target, parent) {
  // @ts-ignore
  return new DraftSet(target, parent);
}

function prepareCopy$3(state) {
  if (!state.copy) {
    // create drafts for all entries to preserve insertion order
    state.copy = new Set();
    state.base.forEach(function (value) {
      if (isDraftable(value)) {
        var draft = state.scope.immer.createProxy(value, state);
        state.drafts.set(value, draft);
        state.copy.add(draft);
      } else {
        state.copy.add(value);
      }
    });
  }
}

function generatePatches(state, basePath, patches, inversePatches) {
  switch (state.type) {
    case ProxyType.ProxyObject:
    case ProxyType.ES5Object:
    case ProxyType.Map:
      return generatePatchesFromAssigned(state, basePath, patches, inversePatches);

    case ProxyType.ES5Array:
    case ProxyType.ProxyArray:
      return generateArrayPatches(state, basePath, patches, inversePatches);

    case ProxyType.Set:
      return generateSetPatches(state, basePath, patches, inversePatches);
  }
}

function generateArrayPatches(state, basePath, patches, inversePatches) {
  var _a, _b;

  var base = state.base,
      assigned = state.assigned,
      copy = state.copy;
  /* istanbul ignore next */

  if (!copy) { die(); } // Reduce complexity by ensuring `base` is never longer.

  if (copy.length < base.length) {
    _a = [copy, base], base = _a[0], copy = _a[1];
    _b = [inversePatches, patches], patches = _b[0], inversePatches = _b[1];
  }

  var delta = copy.length - base.length; // Find the first replaced index.

  var start = 0;

  while (base[start] === copy[start] && start < base.length) {
    ++start;
  } // Find the last replaced index. Search from the end to optimize splice patches.


  var end = base.length;

  while (end > start && base[end - 1] === copy[end + delta - 1]) {
    --end;
  } // Process replaced indices.


  for (var i = start; i < end; ++i) {
    if (assigned[i] && copy[i] !== base[i]) {
      var path = basePath.concat([i]);
      patches.push({
        op: "replace",
        path: path,
        value: copy[i]
      });
      inversePatches.push({
        op: "replace",
        path: path,
        value: base[i]
      });
    }
  }

  var replaceCount = patches.length; // Process added indices.

  for (var i = end + delta - 1; i >= end; --i) {
    var path = basePath.concat([i]);
    patches[replaceCount + i - end] = {
      op: "add",
      path: path,
      value: copy[i]
    };
    inversePatches.push({
      op: "remove",
      path: path
    });
  }
} // This is used for both Map objects and normal objects.


function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
  var base = state.base,
      copy = state.copy;
  each(state.assigned, function (key, assignedValue) {
    var origValue = get(base, key);
    var value = get(copy, key);
    var op = !assignedValue ? "remove" : has(base, key) ? "replace" : "add";
    if (origValue === value && op === "replace") { return; }
    var path = basePath.concat(key);
    patches.push(op === "remove" ? {
      op: op,
      path: path
    } : {
      op: op,
      path: path,
      value: value
    });
    inversePatches.push(op === "add" ? {
      op: "remove",
      path: path
    } : op === "remove" ? {
      op: "add",
      path: path,
      value: origValue
    } : {
      op: "replace",
      path: path,
      value: origValue
    });
  });
}

function generateSetPatches(state, basePath, patches, inversePatches) {
  var base = state.base,
      copy = state.copy;
  var i = 0;
  base.forEach(function (value) {
    if (!copy.has(value)) {
      var path = basePath.concat([i]);
      patches.push({
        op: "remove",
        path: path,
        value: value
      });
      inversePatches.unshift({
        op: "add",
        path: path,
        value: value
      });
    }

    i++;
  });
  i = 0;
  copy.forEach(function (value) {
    if (!base.has(value)) {
      var path = basePath.concat([i]);
      patches.push({
        op: "add",
        path: path,
        value: value
      });
      inversePatches.unshift({
        op: "remove",
        path: path,
        value: value
      });
    }

    i++;
  });
}

function applyPatches(draft, patches) {
  patches.forEach(function (patch) {
    var path = patch.path,
        op = patch.op;
    /* istanbul ignore next */

    if (!path.length) { die(); }
    var base = draft;

    for (var i = 0; i < path.length - 1; i++) {
      base = get(base, path[i]);
      if (!base || typeof base !== "object") { throw new Error("Cannot apply patch, path doesn't resolve: " + path.join("/")); } // prettier-ignore
    }

    var type = getArchtype(base);
    var value = deepClonePatchValue(patch.value); // used to clone patch to ensure original patch is not modified, see #411

    var key = path[path.length - 1];

    switch (op) {
      case "replace":
        switch (type) {
          case Archtype.Map:
            return base.set(key, value);

          /* istanbul ignore next */

          case Archtype.Set:
            throw new Error('Sets cannot have "replace" patches.');

          default:
            // if value is an object, then it's assigned by reference
            // in the following add or remove ops, the value field inside the patch will also be modifyed
            // so we use value from the cloned patch
            // @ts-ignore
            return base[key] = value;
        }

      case "add":
        switch (type) {
          case Archtype.Array:
            return base.splice(key, 0, value);

          case Archtype.Map:
            return base.set(key, value);

          case Archtype.Set:
            return base.add(value);

          default:
            return base[key] = value;
        }

      case "remove":
        switch (type) {
          case Archtype.Array:
            return base.splice(key, 1);

          case Archtype.Map:
            return base.delete(key);

          case Archtype.Set:
            return base.delete(patch.value);

          default:
            return delete base[key];
        }

      default:
        throw new Error("Unsupported patch operation: " + op);
    }
  });
  return draft;
}

function deepClonePatchValue(obj) {
  if (!obj || typeof obj !== "object") { return obj; }
  if (Array.isArray(obj)) { return obj.map(deepClonePatchValue); }
  if (isMap(obj)) { return new Map(Array.from(obj.entries()).map(function (_a) {
    var k = _a[0],
        v = _a[1];
    return [k, deepClonePatchValue(v)];
  })); }
  if (isSet(obj)) { return new Set(Array.from(obj).map(deepClonePatchValue)); }
  var cloned = Object.create(Object.getPrototypeOf(obj));

  for (var key in obj) { cloned[key] = deepClonePatchValue(obj[key]); }

  return cloned;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

/* istanbul ignore next */

function verifyMinified() {}

var configDefaults = {
  useProxies: typeof Proxy !== "undefined" && typeof Proxy.revocable !== "undefined" && typeof Reflect !== "undefined",
  autoFreeze: typeof process !== "undefined" ? process.env.NODE_ENV !== "production" :
  /* istanbul ignore next */
  verifyMinified.name === "verifyMinified",
  onAssign: null,
  onDelete: null,
  onCopy: null
};

var Immer =
/** @class */
function () {
  function Immer(config) {
    var _this = this;

    this.useProxies = false;
    this.autoFreeze = false;
    each(configDefaults, function (key, value) {
      var _a, _b; // @ts-ignore


      _this[key] = (_b = (_a = config) === null || _a === void 0 ? void 0 : _a[key], _b !== null && _b !== void 0 ? _b : value);
    });
    this.setUseProxies(this.useProxies);
    this.produce = this.produce.bind(this);
    this.produceWithPatches = this.produceWithPatches.bind(this);
  }
  /**
   * The `produce` function takes a value and a "recipe function" (whose
   * return value often depends on the base state). The recipe function is
   * free to mutate its first argument however it wants. All mutations are
   * only ever applied to a __copy__ of the base state.
   *
   * Pass only a function to create a "curried producer" which relieves you
   * from passing the recipe function every time.
   *
   * Only plain objects and arrays are made mutable. All other objects are
   * considered uncopyable.
   *
   * Note: This function is __bound__ to its `Immer` instance.
   *
   * @param {any} base - the initial state
   * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
   * @param {Function} patchListener - optional function that will be called with all the patches produced here
   * @returns {any} a new state, or the initial state if nothing was modified
   */


  Immer.prototype.produce = function (base, recipe, patchListener) {
    var _this = this; // curried invocation


    if (typeof base === "function" && typeof recipe !== "function") {
      var defaultBase_1 = recipe;
      recipe = base;
      var self_1 = this;
      return function curriedProduce(base) {
        var arguments$1 = arguments;

        var _this = this;

        if (base === void 0) {
          base = defaultBase_1;
        }

        var args = [];

        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments$1[_i];
        }

        return self_1.produce(base, function (draft) {
          return recipe.call.apply(recipe, __spreadArrays([_this, draft], args));
        }); // prettier-ignore
      };
    } // prettier-ignore


    {
      if (typeof recipe !== "function") {
        throw new Error("The first or second argument to `produce` must be a function");
      }

      if (patchListener !== undefined && typeof patchListener !== "function") {
        throw new Error("The third argument to `produce` must be a function or undefined");
      }
    }
    var result; // Only plain objects, arrays, and "immerable classes" are drafted.

    if (isDraftable(base)) {
      var scope_1 = ImmerScope.enter(this);
      var proxy = this.createProxy(base, undefined);
      var hasError = true;

      try {
        result = recipe(proxy);
        hasError = false;
      } finally {
        // finally instead of catch + rethrow better preserves original stack
        if (hasError) { scope_1.revoke(); }else { scope_1.leave(); }
      }

      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then(function (result) {
          scope_1.usePatches(patchListener);
          return processResult(_this, result, scope_1);
        }, function (error) {
          scope_1.revoke();
          throw error;
        });
      }

      scope_1.usePatches(patchListener);
      return processResult(this, result, scope_1);
    } else {
      result = recipe(base);
      if (result === NOTHING) { return undefined; }
      if (result === undefined) { result = base; }
      maybeFreeze(this, result, true);
      return result;
    }
  };

  Immer.prototype.produceWithPatches = function (arg1, arg2, arg3) {
    var _this = this;

    if (typeof arg1 === "function") {
      return function (state) {
        var arguments$1 = arguments;

        var args = [];

        for (var _i = 1; _i < arguments.length; _i++) {
          args[_i - 1] = arguments$1[_i];
        }

        return _this.produceWithPatches(state, function (draft) {
          return arg1.apply(void 0, __spreadArrays([draft], args));
        });
      };
    } // non-curried form

    /* istanbul ignore next */


    if (arg3) { die(); }
    var patches, inversePatches;
    var nextState = this.produce(arg1, arg2, function (p, ip) {
      patches = p;
      inversePatches = ip;
    });
    return [nextState, patches, inversePatches];
  };

  Immer.prototype.createDraft = function (base) {
    if (!isDraftable(base)) {
      throw new Error("First argument to `createDraft` must be a plain object, an array, or an immerable object"); // prettier-ignore
    }

    var scope = ImmerScope.enter(this);
    var proxy = this.createProxy(base, undefined);
    proxy[DRAFT_STATE].isManual = true;
    scope.leave();
    return proxy;
  };

  Immer.prototype.finishDraft = function (draft, patchListener) {
    var state = draft && draft[DRAFT_STATE];

    if (!state || !state.isManual) {
      throw new Error("First argument to `finishDraft` must be a draft returned by `createDraft`"); // prettier-ignore
    }

    if (state.finalized) {
      throw new Error("The given draft is already finalized"); // prettier-ignore
    }

    var scope = state.scope;
    scope.usePatches(patchListener);
    return processResult(this, undefined, scope);
  };
  /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is disabled in production.
   */


  Immer.prototype.setAutoFreeze = function (value) {
    this.autoFreeze = value;
  };
  /**
   * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
   * always faster than using ES5 proxies.
   *
   * By default, feature detection is used, so calling this is rarely necessary.
   */


  Immer.prototype.setUseProxies = function (value) {
    this.useProxies = value;
  };

  Immer.prototype.applyPatches = function (base, patches) {
    // If a patch replaces the entire state, take that replacement as base
    // before applying patches
    var i;

    for (i = patches.length - 1; i >= 0; i--) {
      var patch = patches[i];

      if (patch.path.length === 0 && patch.op === "replace") {
        base = patch.value;
        break;
      }
    }

    if (isDraft(base)) {
      // N.B: never hits if some patch a replacement, patches are never drafts
      return applyPatches(base, patches);
    } // Otherwise, produce a copy of the base state.


    return this.produce(base, function (draft) {
      return applyPatches(draft, patches.slice(i + 1));
    });
  };

  Immer.prototype.createProxy = function (value, parent) {
    // precondition: createProxy should be guarded by isDraftable, so we know we can safely draft
    var draft = isMap(value) ? proxyMap(value, parent) : isSet(value) ? proxySet(value, parent) : this.useProxies ? createProxy(value, parent) : createES5Proxy(value, parent);
    var scope = parent ? parent.scope : ImmerScope.current;
    scope.drafts.push(draft);
    return draft;
  };

  Immer.prototype.willFinalize = function (scope, thing, isReplaced) {
    if (!this.useProxies) { willFinalizeES5(scope, thing, isReplaced); }
  };

  Immer.prototype.markChanged = function (state) {
    if (this.useProxies) {
      markChanged(state);
    } else {
      markChangedES5(state);
    }
  };

  return Immer;
}();

var immer = new Immer();
/**
 * The `produce` function takes a value and a "recipe function" (whose
 * return value often depends on the base state). The recipe function is
 * free to mutate its first argument however it wants. All mutations are
 * only ever applied to a __copy__ of the base state.
 *
 * Pass only a function to create a "curried producer" which relieves you
 * from passing the recipe function every time.
 *
 * Only plain objects and arrays are made mutable. All other objects are
 * considered uncopyable.
 *
 * Note: This function is __bound__ to its `Immer` instance.
 *
 * @param {any} base - the initial state
 * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
 * @param {Function} patchListener - optional function that will be called with all the patches produced here
 * @returns {any} a new state, or the initial state if nothing was modified
 */

var produce = immer.produce;
/**
 * Like `produce`, but `produceWithPatches` always returns a tuple
 * [nextState, patches, inversePatches] (instead of just the next state)
 */

var produceWithPatches = immer.produceWithPatches.bind(immer);
/**
 * Pass true to automatically freeze all copies created by Immer.
 *
 * By default, auto-freezing is disabled in production.
 */

var setAutoFreeze = immer.setAutoFreeze.bind(immer);
/**
 * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
 * always faster than using ES5 proxies.
 *
 * By default, feature detection is used, so calling this is rarely necessary.
 */

var setUseProxies = immer.setUseProxies.bind(immer);
/**
 * Apply an array of Immer patches to the first argument.
 *
 * This function is a producer, which means copy-on-write is in effect.
 */

var applyPatches$1 = immer.applyPatches.bind(immer);
/**
 * Create an Immer draft from the given base state, which may be a draft itself.
 * The draft can be modified until you finalize it with the `finishDraft` function.
 */

var createDraft = immer.createDraft.bind(immer);
/**
 * Finalize an Immer draft from a `createDraft` call, returning the base state
 * (if no changes were made) or a modified copy. The draft must *not* be
 * mutated afterwards.
 *
 * Pass a function as the 2nd argument to generate Immer patches based on the
 * changes that were made.
 */

var finishDraft = immer.finishDraft.bind(immer);
//# sourceMappingURL=immer.module.js.map

var _marked$1 =
/*#__PURE__*/
regenerator.mark(getNodesIterator);
var nodeCalls = {
  self: Symbol("self"),
  parent: Symbol("parent")
};
/**
 * This is a cached private function that returns the node or the nodes parent from a provided tree
 * It is used internally in getNode and getParent. It is used to cache a central parent and node cacheing
 * to reduce overall tree traversal.
 * @type {nodeGetter}
 */

function getParent(tree, nodeId) {
  return nodeGetter(tree, nodeId, nodeCalls.parent);
}

var nodeGetter = function () {
  var cache = new Map();
  return function nodeGetter(tree, nodeId, call) {
    if (!cache.has(tree)) {
      // This is the first time looking for nodes in this tree
      cache.set(tree, new Map([[tree.id, {
        node: tree
      }]]));

      if (tree.children === null) {
        if (call === nodeCalls.self && tree.id === nodeId) {
          return tree;
        }

        return null;
      } else {
        // we are here do we need to update downstream?
        var result = call === nodeCalls.self ? tree.id === nodeId ? tree : null : tree.children.map(function (c) {
          return c.id;
        }).includes(nodeId) ? tree : null;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = tree.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            if (cache.has(child)) {
              result = result ? result : cache.get(child).has(nodeId) ? call === nodeCalls.self ? cache.get(child).get(nodeId).node : cache.get(child).get(nodeId).parent : null;
            } else {
              var downStreamSearch = nodeGetter(child, nodeId, call);
              result = result ? result : downStreamSearch;
            }

            var updatedTreeMap = setParentMap(mergeMaps(cache.get(tree), cache.get(child)), child, tree);
            cache.set(tree, updatedTreeMap);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return result;
      }
    } else {
      return call === nodeCalls.self ? cache.get(tree).get(nodeId).node : cache.get(tree).get(nodeId).parent;
    }
  };
}();

function getNode(tree, nodeId) {
  return nodeGetter(tree, nodeId, nodeCalls.self);
}
function getDivergence(tree, node) {
  var cache = new Map();

  if (!cache.has(tree)) {
    cache.set(tree, new Map());
  }

  if (cache.has(tree) && cache.get(tree).has(node)) {
    return cache.get(tree).get(node);
  }

  if (node === tree) {
    return 0;
  } else {
    var result = node.length + getDivergence(tree, getParent(tree, node.id));
    cache.get(tree).set(node, result);
    return result;
  }
}
function getNodesIterator(tree) {
  var traverse;
  return regenerator.wrap(function getNodesIterator$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          traverse =
          /*#__PURE__*/
          regenerator.mark(function traverse(tree) {
            var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, child;

            return regenerator.wrap(function traverse$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!tree.children) {
                      _context.next = 26;
                      break;
                    }

                    _iteratorNormalCompletion2 = true;
                    _didIteratorError2 = false;
                    _iteratorError2 = undefined;
                    _context.prev = 4;
                    _iterator2 = tree.children[Symbol.iterator]();

                  case 6:
                    if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                      _context.next = 12;
                      break;
                    }

                    child = _step2.value;
                    return _context.delegateYield(traverse(child), "t0", 9);

                  case 9:
                    _iteratorNormalCompletion2 = true;
                    _context.next = 6;
                    break;

                  case 12:
                    _context.next = 18;
                    break;

                  case 14:
                    _context.prev = 14;
                    _context.t1 = _context["catch"](4);
                    _didIteratorError2 = true;
                    _iteratorError2 = _context.t1;

                  case 18:
                    _context.prev = 18;
                    _context.prev = 19;

                    if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                      _iterator2["return"]();
                    }

                  case 21:
                    _context.prev = 21;

                    if (!_didIteratorError2) {
                      _context.next = 24;
                      break;
                    }

                    throw _iteratorError2;

                  case 24:
                    return _context.finish(21);

                  case 25:
                    return _context.finish(18);

                  case 26:
                    _context.next = 28;
                    return tree;

                  case 28:
                  case "end":
                    return _context.stop();
                }
              }
            }, traverse, null, [[4, 14, 18, 26], [19,, 21, 25]]);
          });
          return _context2.delegateYield(traverse(tree), "t0", 2);

        case 2:
        case "end":
          return _context2.stop();
      }
    }
  }, _marked$1);
}
function getNodes(tree) {
  return toConsumableArray(getNodesIterator(tree));
}
function getRootToTipLengths(tree) {
  return getNodes(tree).map(function (node) {
    return getDivergence(tree, node);
  });
} // function getTipsSimple(tree){
//    if(tree.children===null){
//        return tree;
//    }else{
//        return tree.children.reduce((list,child)=>list.concat(getTipsSimple(child)),[]);
//    }
// }
// export const getTips = memoize(getTipsSimple);

function getTips(tree) {
  return toConsumableArray(getNodesIterator(tree)).filter(function (n) {
    return !n.children;
  });
}

var rectangularLayout = function () {
  var cache = new Map();
  return function rectangularLayout(tree) {
    var labelBelow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    if (!cache.has(tree)) {
      cache.set(tree, new Map());
    }

    if (cache.has(tree) && cache.get(tree).has(labelBelow)) {
      return cache.get(tree).get(labelBelow);
    }

    if (tree.children === null) {
      var vertex = makeVertexFromNode(tree, labelBelow);
      vertex.x = 0;
      vertex.y = 0;
      var output = {
        vertices: [vertex],
        edges: []
      };
      cache.get(tree).set(labelBelow, output);
      return output;
    } else {
      var _ret = function () {
        var childrenLayouts = tree.children.map(function (child, i) {
          return rectangularLayout(child, i);
        });
        var i = 0;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = childrenLayouts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var childLayout = _step.value;
            childLayout.vertices.forEach(function (v) {
              return v.x += tree.children[i].length;
            });
            childLayout.edges.forEach(function (e) {
              return e.x += tree.children[i].length;
            });

            if (i > 0) {
              (function () {
                var maxY = max(childrenLayouts[i - 1].vertices, function (v) {
                  return v.y;
                }) + 1;
                childLayout.vertices.forEach(function (vertex) {
                  return vertex.y += maxY;
                });
                childLayout.edges.forEach(function (e) {
                  return e.y += maxY;
                });
              })();
            }

            i += 1;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var y = mean(childrenLayouts.map(function (l) {
          return l.vertices;
        }), function (d) {
          return d.slice(-1)[0].y;
        });
        var vertex = makeVertexFromNode(tree, labelBelow);
        vertex.y = y;
        vertex.x = 0;
        var newEdges = childrenLayouts.map(function (l) {
          return makeEdge(vertex, l.vertices.slice(-1)[0]);
        });
        var vertices = childrenLayouts.reduce(function (acc, curr) {
          return acc.concat(curr.vertices);
        }, []);
        vertices.push(vertex);
        var edges = childrenLayouts.reduce(function (acc, curr) {
          return acc.concat(curr.edges);
        }, newEdges);
        var output = {
          vertices: vertices,
          edges: edges
        };
        cache.get(tree).set(labelBelow, output);
        return {
          v: output
        };
      }();

      if (_typeof_1(_ret) === "object") return _ret.v;
    }
  };
}();
function edgeFactory(vertexLayout) {
  function makeEdges(tree) {
    if (tree.children === null) {
      return;
    }

    var vertices = toConsumableArray(vertexLayout(tree));

    var nodes = getNodes(tree);
    var currentSource = vertices.pop();
    var currentTarget = vertices.pop();
    var childrenMap = new Map(nodes.map(function (n) {
      return [n.id, n.children ? n.children.length : 0];
    }));
    var deque = [];
    var edges = [];

    while (edges.length < nodes.length - 1) {
      edges.push(makeEdge(currentSource, currentTarget));
      childrenMap.set(currentSource.id, childrenMap.get(currentSource.id) - 1);

      if (childrenMap.get(currentTarget.id)) {
        deque.push(currentSource);
        currentSource = currentTarget;
        currentTarget = vertices.pop();
      } else if (childrenMap.get(currentSource.id)) {
        currentTarget = vertices.pop();
      } else {
        currentTarget = vertices.pop();
        currentSource = deque.pop();
      }
    }

    return edges;
  }
  return makeEdges;
}

function makeEdge(source, target) {
  return {
    v0: source,
    v1: target,
    id: target.id,
    classes: target.classes,
    x: source.x,
    y: target.y,
    textLabel: {
      x: mean([target.x, source.x]),
      y: -6,
      alignmentBaseline: "bottom",
      textAnchor: "middle"
    }
  };
}

function rectangularVertices(tree) {
  var currentY = -1;

  var helper = function () {
    var cache = new Map(); // remade every layout but that's ok for now

    return function helper(node) {
      var labelBelow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (cache.has(node)) {
        return cache.get(node);
      } else {
        var vertex = makeVertexFromNode(node, labelBelow);
        vertex.x = getDivergence(tree, node);
        vertex.y = node.children ? mean(node.children.map(function (child, i) {
          return helper(child, child.children === null ? 0 : i).y;
        })) : currentY += 1;
        vertex.node = node;
        cache.set(node, vertex);
        return vertex;
      }
    };
  }();

  return new Map(getNodes(tree).map(function (node) {
    return [node, helper(node)];
  }));
}
function makeEdges(vertices) {
  return reduceIterator(vertices.keys(), function (edges, node) {
    node.children && node.children.map(function (child) {
      return makeEdge(vertices.get(node), vertices.get(child));
    }).forEach(function (edge) {
      return edges.push(edge);
    });
    return edges;
  }, []);
}

var nodeReducer = produce(function (draft, action) {
  switch (action.type) {
    case "hover":
      draft.hovered = action.payload;
      break;

    case "unhover":
      draft.hovered = "";
      break;

    case "appendSelection":
      draft.selected.push(action.payload);
      break;

    case "select":
      draft.selected = [action.payload];
      break;

    case "removeSelection":
      return draft.filter(function (s) {
        return s !== action.payload;
      });

    case "clearSelection":
      draft.selected = [];
  }
}); // hover
//unhover
//select
//deselect

function ownKeys$4(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$3(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$4(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$4(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function parseAnnotation$1(annotationString) {
  var setRegex = /\{(.+)\}/; // const setRegex = /\{(.+)\}/;

  var out = {};
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = splitAtExposedCommas$1(annotationString)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var annotation = _step.value;

      var _annotation$split = annotation.split("="),
          _annotation$split2 = slicedToArray(_annotation$split, 2),
          annotationKey = _annotation$split2[0],
          data = _annotation$split2[1]; //TODO ensure this is working


      annotationKey = annotationKey.replace(/\./g, "_");

      if (setRegex.test(data)) {
        data = data.split(setRegex).filter(function (s) {
          return s !== "";
        }).reduce(function (acc, curr) {
          return acc.concat(splitAtExposedCommas$1(curr));
        }, []);

        if (data.reduce(function (acc, curr) {
          return acc & !isNaN(curr);
        }, true)) {
          data = data.map(function (d) {
            return parseFloat(d);
          });
        } else {
          data = data.reduce(function (acc, curr) {
            return acc.concat(curr.split(/[(?:\")')]/).filter(function (s) {
              return s !== "";
            }));
          }, []);
        }

        out[annotationKey] = data;
      } else {
        data = data.split(/[(?:\")')]/).filter(function (s) {
          return s !== "";
        })[0];

        if (isNaN(data)) {
          out[annotationKey] = data;
        } else {
          out[annotationKey] = parseFloat(data);
        }
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator["return"] != null) {
        _iterator["return"]();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return constructProbabilitySet$1(out);
}
function constructProbabilitySet$1(out) {
  var keys = Object.keys(out);
  var finalObject = {};
  var skippedKeys = [];

  for (var _i = 0, _keys = keys; _i < _keys.length; _i++) {
    var probabilityKey = _keys[_i];

    if (/.+_set_prob/.test(probabilityKey)) {
      var base = probabilityKey.split("_set_prob").filter(function (s) {
        return s !== "";
      })[0];
      var traitkey = "".concat(base, "_set");
      var probabilities = [].concat(out[probabilityKey]);
      skippedKeys.push(traitkey);

      if (keys.includes(traitkey)) {
        var probabilitySet = {};

        for (var i = 0; i < out[traitkey].length; i++) {
          probabilitySet[out[traitkey][i]] = probabilities[i];
        }

        finalObject["".concat(base, "_probSet")] = _objectSpread$3({}, probabilitySet);
      }
    } else if (!skippedKeys.includes(probabilityKey)) finalObject[probabilityKey] = out[probabilityKey];
  }

  return finalObject;
}
function reconcileAnnotations$1(incomingAnnotations) {
  var currentAnnotations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  for (var _i2 = 0, _Object$entries = Object.entries(incomingAnnotations); _i2 < _Object$entries.length; _i2++) {
    var _Object$entries$_i = slicedToArray(_Object$entries[_i2], 2),
        key = _Object$entries$_i[0],
        types = _Object$entries$_i[1];

    var annotation = currentAnnotations[key];

    if (!annotation) {
      currentAnnotations[key] = _objectSpread$3({}, types);
    } else {
      var type = types.type;

      if (annotation.type !== type) {
        if (type === Type.INTEGER && annotation.type === Type.FLOAT || type === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          annotation.type = Type.FLOAT;

          if (annotation.values) {
            delete annotation.values;
          }

          annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : toConsumableArray(types.extent);
        } else {
          throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
        }
      } else if (annotation.type === type) {
        if (type === Type.DISCRETE) {
          if (!annotation.values) {
            annotation.values = new Set();
          }

          annotation.values = new Set([].concat(toConsumableArray(annotation.values), toConsumableArray(types.values)));
        } else if (annotation.values || types.values) {
          annotation.values = annotation.values ? annotation.values.concat(types.values) : toConsumableArray(types.values);
        } else if (annotation.extent || types.extent) {
          annotation.extent = annotation.extent ? extent(annotation.extent.concat(types.extent)) : toConsumableArray(types.extent);
        }
      }
    }
  }

  return currentAnnotations;
}
function typeAnnotations$1(annotations) {
  var annotationTypes = {};

  for (var _i3 = 0, _Object$entries2 = Object.entries(annotations); _i3 < _Object$entries2.length; _i3++) {
    var _Object$entries2$_i = slicedToArray(_Object$entries2[_i3], 2),
        key = _Object$entries2$_i[0],
        addValues = _Object$entries2$_i[1];

    var annotation = {};
    annotationTypes[key] = annotation;

    if (addValues instanceof Date) {
      annotation.type = Type.DATE;
      annotation.extent = [addValues, addValues];
    } else if (Array.isArray(addValues)) {
      // is a set of  values
      var type = void 0;

      if (addValues.map(function (v) {
        return isNaN(v);
      }).reduce(function (acc, curr) {
        return acc && curr;
      }, true)) {
        var _annotation$values;

        type = Type.DISCRETE;
        annotation.type = type;

        if (!annotation.values) {
          annotation.values = new Set();
        }

        (_annotation$values = annotation.values).add.apply(_annotation$values, toConsumableArray(addValues));
      } else if (addValues.map(function (v) {
        return parseFloat(v);
      }).reduce(function (acc, curr) {
        return acc && Number.isInteger(curr);
      }, true)) {
        type = Type.INTEGER;
        annotation.extent = extent(addValues);
      } else {
        type = Type.FLOAT;
        annotation.extent = extent(addValues);
      }

      if (annotation.type && annotation.type !== type) {
        if (type === Type.INTEGER && annotation.type === Type.FLOAT || type === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          type = Type.FLOAT;
          annotation.type = Type.FLOAT;

          if (annotation.values) {
            delete annotation.values;
          } else {
            throw Error("existing values of the annotation, ".concat(key, ", in the tree is discrete."));
          }
        }
      }

      annotation.type = type; // annotation.values = annotation.values? [...annotation.values, ...addValues]:[...addValues]
    } else if (Object.isExtensible(addValues)) {
      // is a set of properties with values
      var _type = undefined;
      var sum = 0.0;
      var keys = [];

      for (var _i4 = 0, _Object$entries3 = Object.entries(addValues); _i4 < _Object$entries3.length; _i4++) {
        var _Object$entries3$_i = slicedToArray(_Object$entries3[_i4], 2),
            _key = _Object$entries3$_i[0],
            value = _Object$entries3$_i[1];

        if (keys.includes(_key)) {
          throw Error("the states of annotation, ".concat(_key, ", should be unique"));
        }

        if (_typeof_1(value) === _typeof_1(1.0)) {
          // This is a vector of probabilities of different states
          _type = _type === undefined ? Type.PROBABILITIES : _type;

          if (_type === Type.DISCRETE) {
            throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
          }

          sum += value;

          if (sum > 1.01) {
            throw Error("the values of annotation, ".concat(_key, ", should be probabilities of states and add to 1.0"));
          }
        } else if (_typeof_1(value) === _typeof_1(true)) {
          _type = _type === undefined ? Type.DISCRETE : _type;

          if (_type === Type.PROBABILITIES) {
            console.warn(annotations);
            throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
          }
        } else {
          throw Error("the values of annotation, ".concat(_key, ", should be all boolean or all floats"));
        }

        keys.push(_key);
      }

      if (annotation.type && annotation.type !== _type) {
        throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
      }

      annotation.type = _type;
      annotation.values = annotation.values ? [].concat(toConsumableArray(annotation.values), [addValues]) : [addValues];
    } else {
      var _type2 = Type.DISCRETE;

      if (_typeof_1(addValues) === _typeof_1(true)) {
        _type2 = Type.BOOLEAN;
      } else if (!isNaN(addValues)) {
        _type2 = addValues % 1 === 0 ? Type.INTEGER : Type.FLOAT;
      }

      if (annotation.type && annotation.type !== _type2) {
        if (_type2 === Type.INTEGER && annotation.type === Type.FLOAT || _type2 === Type.FLOAT && annotation.type === Type.INTEGER) {
          // upgrade to float
          _type2 = Type.FLOAT;
        } else {
          throw Error("existing values of the annotation, ".concat(key, ", in the tree is not of the same type"));
        }
      }

      if (_type2 === Type.DISCRETE) {
        if (!annotation.values) {
          annotation.values = new Set();
        }

        annotation.values.add(addValues);
      } else if (_type2 === Type.FLOAT || _type2 === Type.INTEGER) {
        annotation.extent = [addValues, addValues];
      }

      annotation.type = _type2;
    } // overwrite the existing annotation property
    // annotationTypes[key] = annotation;

  }

  return annotationTypes;
}
function stripQuotes$1(string) {
  // remove any quoting and then trim whitespace
  return removeEndQuotes$1(removeFrontQuotes$1(string));
}
function removeFrontQuotes$1(s) {
  if (s.startsWith("\"") || s.startsWith("\'")) {
    return s.slice(1);
  }

  return s;
}
function removeEndQuotes$1(s) {
  if (s.endsWith("\"") || s.endsWith("\'")) {
    return s.slice(0, s.length - 1);
  }

  return s;
}
function verifyNewickString$1(s) {
  if (s[s.length - 1] !== ";") {
    throw new Error("Unknown format. Newick strings should end in ;");
  }

  if ((s.match(/\(/g) || []).length !== (s.match(/\)/g) || []).length) {
    throw new Error("Unmatched parenthesis in newick string");
  }
}
function getDate$1(name, datePrefix, dateFormat) {
  var parts = name.split(datePrefix);

  if (parts.length === 0) {
    throw new Error("the tip, ".concat(name, ", doesn't have a date separated by the prefix, '").concat(datePrefix, "'"));
  }

  var dateBit = parts[parts.length - 1];

  if (dateFormat === "decimal") {
    var decimalDate = parseFloat(parts[parts.length - 1]);
    return decimalToDate(decimalDate);
  } else {
    var date = timeParse(dateFormat)(dateBit);

    if (!date) {
      date = timeParse(dateFormat)("".concat(dateBit, "-15"));
    }

    if (!date) {
      date = timeParse(dateFormat)("".concat(dateBit, "-06-15"));
    }

    return date;
  }
} //TODO speed up - it's slow to do this everytime essentially nested looping

function splitAtExposedCommas$1(string) {
  var open = ["(", "[", "{"];
  var close = [")", "]", "}"];
  var count = 0;
  var commas = [-1];
  var stringLength = string.length;

  for (var i = 0; i < stringLength; i++) {
    if (open.includes(string[i])) {
      count += 1;
    } else if (close.includes(string[i])) {
      count -= 1;
    } else if (count === 0 && string[i] === ",") {
      commas.push(i);
    }
  }

  commas.push(string.length);
  var splits = [];
  var commaLength = commas.length;

  for (var _i5 = 1; _i5 < commaLength; _i5++) {
    splits.push(string.slice(commas[_i5 - 1] + 1, commas[_i5]));
  }

  return splits;
}

function ownKeys$5(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$4(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$5(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$5(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function parseNewick(newickString) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  options = _objectSpread$4({}, {
    labelName: "label",
    datePrefix: undefined,
    dateFormat: "%Y-%m-%d"
  }, {}, options);
  var nodeCount = 0;
  verifyNewickString$1(newickString);

  function newickSubstringParser(newickString) {
    // check for semicolon
    //strip first and last parenthesis and annotations ect. call again on children.
    //https://www.regextester.com/103043
    //                      [children]data - name, label, branch length ect.
    var internalNode = /\((.*)\)(.*)/; // identify commas not included in (),[],or {}

    var nodeData = /(?:(.*)(?=\[&))?(?:\[&(.+)])?(?:(.+)(?=:))?:(\d+\.?\d*(?:[eE]-?\d+)?)/g;
    var isInternalNode = internalNode.test(newickString);
    var nodeString,
        childrenString,
        childNodes = [];

    if (isInternalNode) {
      var _newickString$split$f = newickString.split(internalNode).filter(function (s) {
        return s;
      });

      var _newickString$split$f2 = slicedToArray(_newickString$split$f, 2);

      childrenString = _newickString$split$f2[0];
      nodeString = _newickString$split$f2[1];
      var children = splitAtExposedCommas$1(childrenString);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var child = _step.value;
          childNodes.push(newickSubstringParser(child));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      nodeString = newickString;
    } //TODO get rid of leading and trailing empty matches


    var _nodeString$split = nodeString.split(nodeData),
        _nodeString$split2 = slicedToArray(_nodeString$split, 6),
        emptyMatch = _nodeString$split2[0],
        name = _nodeString$split2[1],
        annotationsString = _nodeString$split2[2],
        label = _nodeString$split2[3],
        length = _nodeString$split2[4],
        emptyMatch2 = _nodeString$split2[5];

    if (!isInternalNode && !annotationsString) {
      name = label;
      label = null;
    } else if (isInternalNode && name) {
      label = name;
      name = null;
    }

    if (name) {
      name = options.tipMap ? stripQuotes$1(options.tipMap[name]) : stripQuotes$1(name);
    }

    if (label) {
      label = stripQuotes$1(label);
    }

    var node = {
      id: name ? name : label ? options.labelName === "label" ? label : "node".concat(nodeCount += 1) : "node".concat(nodeCount += 1),
      name: name ? name : null,
      length: length !== undefined ? parseFloat(length) : null,
      children: childNodes.length > 0 ? childNodes : null
    };
    var annotations = annotationsString !== undefined ? parseAnnotation$1(annotationsString) : {};

    if (options.labelName !== "label") {
      if (label) {
        annotations[options.labelName] = label;
      }
    }

    var date;

    if (options.datePrefix && name) {
      date = getDate$1(name, options.datePrefix, options.dateFormat);
      annotations.date = date;
    }

    var typedAnnotations = typeAnnotations$1(annotations);
    node.annotations = annotations;
    node.annotationTypes = childNodes ? [typedAnnotations].concat(toConsumableArray(childNodes.map(function (c) {
      return c.annotationTypes;
    }))).reduce(function (acc, curr) {
      return reconcileAnnotations$1(curr, acc);
    }, {}) : typedAnnotations;
    return node;
  }

  var root = newickSubstringParser(newickString);
  return root;
}
function parseNexus(nexus) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var trees = []; // odd parts ensure we're not in a taxon label
  //TODO make this parsing more robust

  var nexusTokens = nexus.split(/\s*(?:^|[^\w\d])Begin(?:^|[^\w\d])|(?:^|[^\w\d])begin(?:^|[^\w\d])|(?:^|[^\w\d])end(?:^|[^\w\d])|(?:^|[^\w\d])End(?:^|[^\w\d])|(?:^|[^\w\d])BEGIN(?:^|[^\w\d])|(?:^|[^\w\d])END(?:^|[^\w\d])\s*/);
  var firstToken = nexusTokens.shift().trim();

  if (firstToken.toLowerCase() !== '#nexus') {
    throw Error("File does not begin with #NEXUS is it a nexus file?");
  }

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = nexusTokens[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var section = _step2.value;
      var workingSection = section.replace(/^\s+|\s+$/g, '').split(/\n/);
      var sectionTitle = workingSection.shift();

      if (sectionTitle.toLowerCase().trim() === "trees;") {
        var inTaxaMap = false;
        var tipMap = {};
        var tipNames = {};
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = workingSection[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var token = _step3.value;

            if (token.trim().toLowerCase() === "translate") {
              inTaxaMap = true;
            } else {
              if (inTaxaMap) {
                if (token.trim() === ";") {
                  inTaxaMap = false;
                } else {
                  var taxaData = token.trim().replace(",", "").split(/\s*\s\s*/);
                  tipMap[taxaData[0]] = taxaData[1];
                  tipNames[taxaData[1]] = taxaData[0];
                }
              } else {
                var treeString = token.substring(token.indexOf("("));

                if (Object.keys(tipMap).length > 0) {
                  var thisTree = parseNewick(treeString, _objectSpread$4({}, options, {
                    tipMap: tipMap,
                    tipNames: tipNames
                  }));
                  trees.push(thisTree);
                } else {
                  var _thisTree = parseNewick(treeString, _objectSpread$4({}, options));

                  trees.push(_thisTree);
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
        _iterator2["return"]();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  return trees;
}
function orderByNodeDensity(tree) {
  var increasing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var factor = increasing ? -1 : 1;
  var flipper = produce(function (draft) {
    if (draft.children) {
      draft.children.forEach(function (child, i) {
        return draft.children[i] = flipper(child);
      });
      draft.children.sort(function (a, b) {
        return factor * (getTips(a).length - getTips(b).length);
      });
    }
  });
  return flipper(tree);
}
function collapseUnsupportedNodes(tree, predicate) {
  var collapser = produce(function (draft) {
    if (draft.children) {
      var lookAgain = false;

      do {
        lookAgain = false;
        draft.children = draft.children.reduce(function (acc, child) {
          if (predicate(child)) {
            lookAgain = true; // collapsed node so need to see if this one is valid too. look again

            child.children.forEach(function (kid) {
              kid.length += child.length;
              acc.push(kid);
            });
          } else {
            acc.push(child);
          }

          return acc;
        }, []);
      } while (lookAgain); //TODO there could be a better way to pass the new children to the parent;


      draft.children.forEach(function (child, i) {
        return draft.children[i] = collapser(child);
      });
    }
  });
  return collapser(tree);
}
function annotateNode(tree, nodeId, annotation) {
  return produce(tree, function (draft) {
    var node = getNode(draft, nodeId);

    for (var _i = 0, _Object$entries = Object.entries(annotation); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      node.annotations[key] = value;
    }

    node.annotationTypes = typeAnnotations$1(node.annotations);
    var parent = getParent(draft, node.id);

    while (parent) {
      parent.annotationTypes = reconcileAnnotations$1(getNode(draft, node.id).annotationTypes, parent.annotationTypes);
      node = parent;
      parent = getParent(draft, node.id);
    }
  });
} //
//
// function orderChildren(tree,increasing){
//     const factor = increasing ? -1 : 1;
//     return produce(tree, draft => {
//         if(draft.children){
//             draft.children.sort((a,b)=>factor*(getTips(a).length-getTips(b).length))
//         }
//     });
// }

/**
 * The FigTree component
 * This takes a tree and layout options. It calls the layout and handles state for this figure.
 * It also passes it's scales to it's children props as well as the edges to the branches and the nodes to the nodes.
 */

var initialState = {
  hovered: null,
  selected: []
};
var ScaleContext = React__default.createContext({
  scales: {
    x: linear$1().domain([0, 100]).range([0, 230]),
    y: linear$1().domain([0, 100]).range([0, 240])
  },
  width: 300,
  height: 300,
  margins: {
    top: 10,
    bottom: 50,
    left: 60,
    right: 20
  }
});
var NodeContext = React__default.createContext({
  nodeState: initialState,
  dispatch: nodeReducer
});
var TreeContext = React__default.createContext(parseNewick('((((((virus1:0.1,virus2:0.12)0.95:0.08,(virus3:0.011,virus4:0.0087)1.0:0.15)0.65:0.03,virus5:0.21)1.0:0.2,(virus6:0.45,virus7:0.4)0.51:0.02)1.0:0.1,virus8:0.4)1.0:0.1,(virus9:0.04,virus10:0.03)1.0:0.6);'));
var LayoutContext = React__default.createContext({
  vertices: new Map(),
  edges: []
});
function FigTree(props) {
  var layout = props.layout,
      margins = props.margins,
      width = props.width,
      height = props.height,
      tree = props.tree;

  var _useReducer = React.useReducer(nodeReducer, initialState),
      _useReducer2 = slicedToArray(_useReducer, 2),
      NodeState = _useReducer2[0],
      nodeDispatch = _useReducer2[1];

  var vertices = React.useMemo(function () {
    return layout(tree);
  }, [tree]);
  var edges = React.useMemo(function () {
    return makeEdges(vertices);
  }, [vertices]);
  var scales = React.useMemo(function () {
    return setUpScales({
      width: width,
      height: height
    }, margins, vertices);
  }, [tree]);
  return React__default.createElement(ScaleContext.Provider, {
    value: {
      scales: scales,
      width: width,
      height: height,
      margins: margins
    }
  }, React__default.createElement(NodeContext.Provider, {
    value: {
      state: NodeState,
      dispatch: nodeDispatch
    }
  }, React__default.createElement(TreeContext.Provider, {
    value: tree
  }, React__default.createElement(LayoutContext.Provider, {
    value: {
      vertices: vertices,
      edges: edges
    }
  }, React__default.createElement("g", {
    transform: "translate(".concat(margins.left, ",").concat(margins.top, ")")
  }, React__default.Children.toArray(props.children).reverse())))));
}

function setUpScales(size, margins, vertices) {
  var xdomain = extent$1(vertices.values(), function (d) {
    return d.x;
  });
  var ydomain = extent$1(vertices.values(), function (d) {
    return d.y;
  });
  var x = linear$1().domain(xdomain).range([0, size.width - margins.right - margins.left]);
  var y = linear$1().domain(ydomain).range([0, size.height - margins.bottom - margins.top]);
  return {
    x: x,
    y: y
  };
}

FigTree.defaultProps = {
  width: undefined,

  /** Width of svg */
  height: undefined,
  layout: rectangularVertices,
  children: [React__default.createElement(Branches, null)],
  margins: {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  }
};

/**
 * This function takes in an attributes object keyed by attributes that will be applied to the bauble.
 * It returns a function that takes a vertex or edge and returns the attributes for that dom element.
 *
 * @param attrs - values can be primitives or functions. if primitive it will apply the attribute to all baubles
 * @return {function(*=): {}}
 */
function mapAttrsToProps() {
  var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return function (v) {
    var props = {};

    for (var _i = 0, _Object$entries = Object.entries(attrs); _i < _Object$entries.length; _i++) {
      var _Object$entries$_i = slicedToArray(_Object$entries[_i], 2),
          key = _Object$entries$_i[0],
          value = _Object$entries$_i[1];

      if (typeof value === "function") {
        props[key] = value(v);
      } else {
        props[key] = value;
      }
    }

    return props;
  };
}

function ownKeys$6(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$5(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$6(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$6(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function BaseCoalescentShape(props) {
  //HOC for node logic
  var _useContext = React.useContext(LayoutContext),
      vertices = _useContext.vertices;

  var _useContext2 = React.useContext(ScaleContext),
      scales = _useContext2.scales;

  var vertex = props.vertex,
      attrs = props.attrs;
  var targets = vertex.node.children.map(function (child) {
    return vertices.get(child);
  });
  var d = makeCoalescent(vertex, targets, scales);
  return React__default.createElement("path", _extends_1({
    className: "node-shape",
    d: d
  }, attrs));
}

BaseCoalescentShape.defaultProps = {
  attrs: {
    fill: "steelblue",
    strokeWidth: 1,
    stroke: 'black'
  },
  slope: 5
};
var link$1 = linkHorizontal().x(function (d) {
  return d.x;
}).y(function (d) {
  return d.y;
});
function coalescentPath(source, target) {
  var slope = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;

  var adjustedTarget = _objectSpread$5({}, target, {
    x: target.x / slope
  });

  var inverseTarget = _objectSpread$5({}, adjustedTarget, {
    y: source.y - (adjustedTarget.y - source.y)
  });

  var topD = link$1({
    source: source,
    target: adjustedTarget
  });
  var linker = "L".concat(target.x, ",").concat(target.y, "v").concat(inverseTarget.y - adjustedTarget.y, "L").concat(inverseTarget.x, ",").concat(inverseTarget.y);
  var bottomD = link$1({
    source: inverseTarget,
    target: source
  });
  return topD + linker + bottomD + "L".concat(source.x, ",").concat(source.y);
}
function makeCoalescent(vertex, targets, scales) {
  // TODO make slope and percent gradient based on min x
  var x = scales.x(max(targets, function (d) {
    return d.x;
  }) - vertex.x);
  var y = -scales.y(0.4 + vertex.y - min(targets, function (d) {
    return d.y;
  }));
  return coalescentPath({
    x: 0,
    y: 0
  }, {
    x: x,
    y: y
  });
}
var CoalescentShape = withLinearGradient(BaseCoalescentShape);
CoalescentShape.defaultProps = {
  x1: "0%",
  x2: "100%",
  y1: "0%",
  y2: "0%",
  n: 10,
  fillRamper: function fillRamper(i) {
    return "grey";
  },
  opacityRamper: function opacityRamper(i) {
    return 1 - i;
  },
  slope: 5
};

function ownKeys$7(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$6(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$7(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$7(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

var RectangularBranchPath = function RectangularBranchPath(props) {
  var x0 = props.x0,
      y0 = props.y0,
      x1 = props.x1,
      y1 = props.y1,
      edge = props.edge,
      attrs = objectWithoutProperties(props, ["x0", "y0", "x1", "y1", "edge"]);

  var path = {
    d: branchPathGenerator({
      x0: x0,
      y0: y0,
      x1: x1,
      y1: y1
    })
  };
  var allAttrs = useSpring(_objectSpread$6({}, attrs));
  return React__default.createElement(extendedAnimated.path, _extends_1({}, allAttrs, path, {
    fill: "none"
  }));
};

function branchPathGenerator(_ref) {
  var x0 = _ref.x0,
      y0 = _ref.y0,
      x1 = _ref.x1,
      y1 = _ref.y1;
  var branchLine = line().x(function (v) {
    return v.x;
  }).y(function (v) {
    return v.y;
  }).curve(stepBefore);
  return branchLine([{
    x: 0,
    y: y0 - y1
  }, {
    x: x1 - x0,
    y: 0
  }]); // return (output)
}

function CoalescentBranchPathHOC(RegularPath) {
  // TODO memoize upto source and taget since its called for all sibling and is the same
  return function CoalescentBP(props) {
    var _useContext = React.useContext(LayoutContext),
        vertices = _useContext.vertices;

    var _useContext2 = React.useContext(ScaleContext),
        scales = _useContext2.scales;

    var edge = props.edge,
        y1 = props.y1,
        y0 = props.y0;
    var vertex = vertices.get(edge.v0.node);
    var targets = vertex.node.children.map(function (child) {
      return vertices.get(child);
    });
    var source = {
      x: 0,
      y: y0 - y1
    };
    var target = {
      x: scales.x(max(targets, function (d) {
        return d.x;
      }) - vertex.x),
      y: scales.y(min(targets, function (d) {
        return d.y;
      })) - y1
    };
    var clipPath = coalescentPath(source, target);
    return React__default.createElement("g", null, React__default.createElement("defs", null, React__default.createElement("clipPath", {
      id: "clipPathEdge".concat(edge.v1.id)
    }, React__default.createElement("path", {
      d: clipPath
    }))), React__default.createElement("g", {
      clipPath: "url(#clipPathEdge".concat(edge.v1.id, ")")
    }, React__default.createElement(RectangularBranchPath, props)));
  };
}

var CoalescentBranch = CoalescentBranchPathHOC(); // FadeInBranchPath.defaultProps={
//     x1:"0%",
//     x2:"100%",
//     y1:"0%",
//     y2:"0%",
//     n:10,
//     fillRamper:i=>"#541753",
//     opacityRamper:i=>i<0.5?i/2:i,
//     gradientAttribute: "stroke",
//     attrs:{
//         strokeWidth:2,
//         stroke:"#541753",
//         strokeLinecap:"round",
//         strokeLinejoin:"round"
//     }
//    //issure with attrss
//
// }

function BranchesHOC(PathComponent) {
  return function BaseBranches(props) {
    var _useContext = React.useContext(ScaleContext),
        scales = _useContext.scales;

    var _useContext2 = React.useContext(LayoutContext),
        edges = _useContext2.edges;

    var attrs = props.attrs,
        filter = props.filter;
    var attrMapper = React.useMemo(function () {
      return mapAttrsToProps(attrs);
    }, [attrs]);

    function getPosition(e) {
      return {
        x0: scales.x(e.v0.x),
        y0: scales.y(e.v0.y),
        x1: scales.x(e.v1.x),
        y1: scales.y(e.v1.y)
      };
    }
    return React__default.createElement("g", {
      className: "branch-layer"
    }, edges.filter(filter).map(function (e) {
      return React__default.createElement(Branch, {
        key: "branch-".concat(e.id),
        classes: e.classes,
        x: scales.x(e.x),
        y: scales.y(e.y)
      }, React__default.createElement(PathComponent, _extends_1({}, getPosition(e), attrMapper(e), {
        edge: e
      })));
    }));
  };
}

var RectangularBranches = BranchesHOC(RectangularBranchPath);
RectangularBranches.defaultProps = {
  filter: function filter(e) {
    return true;
  }
};
var CoalescentBranches = BranchesHOC(CoalescentBranch);
var Branches = {
  Rectangular: RectangularBranches,
  Coalescent: CoalescentBranches
};

var Circle = function Circle(props) {
  var attrs = props.attrs,
      interactions = props.interactions;
  var visibleProperties = useSpring(attrs);
  return React__default.createElement(extendedAnimated.circle, _extends_1({
    className: "node-shape"
  }, visibleProperties, interactions));
};

Circle.defaultProps = {
  attrs: {
    r: 4,
    fill: "steelblue",
    strokeWidth: 0,
    stroke: 'black'
  }
};
var Circle$1 = React__default.memo(Circle);

/**
 * This positions a group at x,y with classes and calls a nodeShape with the remaining props.
 * @param props
 * @return {*}
 */

var basicNode = function basicNode(props) {
  var x = props.x,
      y = props.y,
      classes = props.classes;
  var position = useSpring({
    transform: "translate(".concat(x, ",").concat(y, ")")
  });
  return React__default.createElement(extendedAnimated.g, _extends_1({
    className: "node ".concat(classes.join(" "), " ")
  }, position), props.children);
};

function samesies$1(prev, curr) {
  var prevChildren = [].concat(prev.children).map(function (child) {
    return child.props;
  });
  var currChildren = [].concat(curr.children).map(function (child) {
    return child.props;
  });
  var prevProps = {
    x: prev.x,
    y: prev.y
  };
  var currProps = {
    x: curr.x,
    y: curr.y
  };

  if (!areEqualShallow(prevProps, currProps)) {
    return false;
  }

  if (prevChildren.length !== currChildren.length) {
    return false;
  }

  for (var i = 0; i < prevChildren.length; i++) {
    if (!areEqualShallow(prevChildren[i], currChildren[i])) {
      return false;
    }
  }

  return true;
}

var Node = React__default.memo(basicNode, samesies$1); // const Node=basicNode;

function ownKeys$8(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$7(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$8(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$8(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function NodesHOC(ShapeComponent) {
  return function BaseNodes(props) {
    var _useContext = React.useContext(ScaleContext),
        scales = _useContext.scales;

    var _useContext2 = React.useContext(LayoutContext),
        vertices = _useContext2.vertices;

    var _useContext3 = React.useContext(NodeContext),
        state = _useContext3.state,
        dispatch = _useContext3.dispatch;

    var filter = props.filter,
        className = props.className,
        attrs = props.attrs,
        selectedAttrs = props.selectedAttrs,
        hoveredAttrs = props.hoveredAttrs;
    var baseAttrMapper = React.useMemo(function () {
      return mapAttrsToProps(attrs);
    }, [attrs]);
    var selectedAttrMapper = React.useMemo(function () {
      return mapAttrsToProps(selectedAttrs);
    }, [selectedAttrs]);
    var hoveredAttrMapper = React.useMemo(function () {
      return mapAttrsToProps(hoveredAttrs);
    }, [hoveredAttrs]);

    function attrMapper(v) {
      var attrs = baseAttrMapper(v);

      if (state.hovered === v.id) {
        attrs = _objectSpread$7({}, attrs, {}, hoveredAttrMapper(v));
      }

      if (state.selected.includes(v.id)) {
        attrs = _objectSpread$7({}, attrs, {}, selectedAttrMapper(v));
      }

      return attrs;
    }

    function interactionMapper(v) {
      return {
        onMouseEnter: function onMouseEnter() {
          return dispatch({
            type: "hover",
            payload: v.id
          });
        },
        onMouseLeave: function onMouseLeave() {
          return dispatch({
            type: "unhover"
          });
        },
        onClick: function onClick() {
          return selectorLogic(state.selected, dispatch, v.id);
        }
      };
    }

    function shapeProps(v) {
      return {
        attrs: attrMapper(v),
        interactions: interactionMapper(v)
      };
    }

    return React__default.createElement("g", {
      className: className
    }, reduceIterator(vertices.values(), function (all, v) {
      if (filter(v)) {
        all.push(React__default.createElement(Node, {
          key: "node-".concat(v.id),
          classes: v.classes,
          x: scales.x(v.x),
          y: scales.y(v.y)
        }, React__default.createElement(ShapeComponent, _extends_1({}, shapeProps(v), {
          vertex: v
        }))));
      }

      return all;
    }, []));
  };
}

function selectorLogic(selection, dispatcher, vertexId) {
  if (selection.length === 1 && selection[0] === vertexId) {
    dispatcher({
      type: "clearSelection"
    });
  } else {
    dispatcher({
      type: "select",
      payload: vertexId
    });
  }
}

var CircleNodes = NodesHOC(Circle$1);
CircleNodes.defaultProps = {
  filter: function filter(v) {
    return true;
  },
  attrs: {
    r: 2
  },
  selectedAttrs: {},
  hoveredAttrs: {}
};
var CoalescentNodes = NodesHOC(CoalescentShape);
CoalescentNodes.defualtProps = {
  attrs: {
    fill: "steelblue",
    strokeWidth: 1,
    stroke: 'black'
  }
};
var Nodes = {
  Circle: CircleNodes,
  Coalescent: CoalescentNodes
};
 // Nested renders for selected and hovered nodes

function Axis(props) {
  var _useContext = React.useContext(ScaleContext),
      scales = _useContext.scales,
      width = _useContext.width,
      height = _useContext.height,
      margins = _useContext.margins;

  var direction = props.direction,
      title = props.title,
      ticks = props.ticks,
      gap = props.gap;
  var scale = makeAxisScale(props, scales); // scaleSequentialQuantile doesn’t implement tickValues or tickFormat.

  var tickValues;

  if (!scale.ticks) {
    tickValues = range(ticks.number).map(function (i) {
      return quantile(scale.domain(), i / (ticks.number - 1));
    });
  } else {
    tickValues = scale.ticks(ticks.number);
  }

  var transform = direction === "horizontal" ? "translate(".concat(0, ",", height - margins.bottom - margins.top + gap, ")") : "translate(".concat(-1 * gap, ",", 0, ")"); //TODO break this into parts HOC with logic horizontal/ vertical axis ect.

  return React__default.createElement("g", {
    className: "axis",
    transform: transform
  }, React__default.Children.toArray(props.children).map(function (child, index) {
    return React__default.cloneElement(child, {
      scale: scale,
      width: width,
      height: height,
      margins: margins,
      tickValues: tickValues,
      gap: gap
    });
  }), React__default.createElement("path", {
    d: getPath(scale, direction),
    stroke: "black"
  }), React__default.createElement("g", null, tickValues.map(function (t, i) {
    return React__default.createElement("g", {
      key: i,
      transform: "translate(".concat(direction === "horizontal" ? scale(t) : 0, ",").concat(direction === "horizontal" ? 0 : scale(t), ")")
    }, React__default.createElement("line", _extends_1({}, getTickLine(ticks.length, direction), {
      stroke: "black"
    })), React__default.createElement("text", {
      transform: "translate(".concat(direction === "horizontal" ? 0 : ticks.padding, ",").concat(direction === "horizontal" ? ticks.padding : 0, ")"),
      textAnchor: "middle",
      alignmentBaseline: "middle"
    }, ticks.format(t)));
  }), React__default.createElement("g", {
    transform: "translate(".concat(direction === "horizontal" ? mean(scale.range()) : title.padding, ",").concat(direction === "horizontal" ? title.padding : mean(scale.range()), ")")
  }, React__default.createElement("text", {
    textAnchor: "middle"
  }, title.text))));
} //TODO merge these in instead of overwriting;

Axis.defaultProps = {
  offsetBy: 0,
  scaleBy: 1,
  reverse: false,
  gap: 5,
  title: {
    text: "",
    padding: 40,
    style: {}
  },
  ticks: {
    number: 5,
    format: format(".1f"),
    padding: 20,
    style: {},
    length: 6
  },
  direction: "horizontal",
  scale: undefined
};

function getPath(scale, direction) {
  var f = line().x(function (d) {
    return d[0];
  }).y(function (d) {
    return d[1];
  });

  if (direction === 'horizontal') {
    return f(scale.range().map(function (d) {
      return [d, 0];
    }));
  } else if (direction === "vertical") {
    return f(scale.range().map(function (d) {
      return [0, d];
    }));
  }
}

function getTickLine(length, direction) {
  if (direction === "horizontal") {
    return {
      x1: 0,
      y1: 0,
      y2: length,
      x2: 0
    };
  } else if (direction === "vertical") {
    return {
      x1: 0,
      y1: 0,
      y2: 0,
      x2: -1 * length
    };
  }
}
/**
 * A helper function to make the scale used in the axis. if supplied by props then no modifications are
 * applied.
 * @param props
 * @param contextScales
 * @returns {*}
 */


function makeAxisScale(props, contextScales) {
  var reverse = props.reverse,
      offsetBy = props.offsetBy,
      scaleBy = props.scaleBy,
      scale = props.scale,
      direction = props.direction;
  var axisScale = (scale === undefined ? direction === "horizontal" ? contextScales.x : contextScales.y : scale).copy();

  if (scale === undefined) {
    if (reverse) {
      axisScale.domain(axisScale.domain().reverse());
    }

    return axisScale.domain(axisScale.domain().map(function (d) {
      return (d + offsetBy) * scaleBy;
    }));
  } else {
    return axisScale;
  }
}

function ownKeys$9(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread$8(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys$9(Object(source), true).forEach(function (key) { defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys$9(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
function AxisBars(props) {
  var scale = props.scale,
      tickValues = props.tickValues,
      height = props.height,
      margins = props.margins,
      attrs = props.attrs,
      evenFill = props.evenFill,
      oddFill = props.oddFill,
      gap = props.gap,
      lift = props.lift;
  return React__default.createElement("g", {
    className: "axisBars"
  }, tickValues.reduce(function (acc, curr, i) {
    var width = i === tickValues.length - 1 ? scale.range()[1] - scale(tickValues[i]) : scale(tickValues[i + 1]) - scale(tickValues[i]);
    var fill = i % 2 === 0 ? evenFill : oddFill;
    acc.push(React__default.createElement("rect", _extends_1({
      key: i,
      transform: "translate(".concat(scale(tickValues[i]), ",0)"),
      width: width,
      y: -1 * (height - margins.bottom - margins.top + gap + lift),
      height: height - margins.bottom - margins.top + gap + lift,
      fill: fill
    }, _objectSpread$8({
      rx: 2,
      ry: 2
    }, attrs))));
    return acc;
  }, []));
}
AxisBars.defaultProps = {
  evenFill: "#DCDCDC",
  oddFill: "none",
  attrs: {
    rx: 2,
    ry: 2
  },
  lift: 5
};

function Rect(_ref) {
  var width = _ref.width,
      height = _ref.height,
      attrs = _ref.attrs;
  return React__default.createElement("rect", _extends_1({
    width: width,
    height: height
  }, attrs));
}
/** Color ramp
 *
 * This color ramp is inspired by the ramp used in https://observablehq.com/@d3/color-legend.
 * It takes a function whose input is between 0,1 and outputs a color. It uses this interpolator
 * to map the progress along a rectangle to a color gradient.
 * @param ramper
 * @param n
 * @param width
 * @param height
 * @return {*}
 * @constructor
 */
//TODO move to Legend


var ColorRamp = withLinearGradient(Rect);

/**
 * Legend
 *
 * A color legend that accept continuous and sequential color scales. It is modeled after the color legends
 * at https://observablehq.com/@d3/color-legend
 *
 * @param props
 * @param scale
 * @param pos
 * @param width
 * @param height
 * @param direction
 * @param title
 * @param ticks
 * @param tickFormat
 * @return {(number|*)[]|*}
 * @constructor
 */

function Legend(_ref) {
  var scale = _ref.scale,
      pos = _ref.pos,
      width = _ref.width,
      height = _ref.height,
      direction = _ref.direction,
      title = _ref.title,
      ticks = _ref.ticks;
  var x;
  var fillRamper; //Continuous

  if (scale.interpolate) {
    var n = Math.min(scale.domain().length, scale.range().length);
    x = scale.copy().rangeRound(quantize(interpolate$1(0, width), n)); // for numbers

    fillRamper = scale.copy().domain(quantize(interpolate$1(0, 1), n)); // for colors
  } // Sequential
  else if (scale.interpolator) {
      x = Object.assign(scale.copy().interpolator(interpolateRound(0, width)), // update interpolator to work on x scale
      {
        range: function range() {
          return [0, width];
        }
      }); //vc assigns range function so we can use it later!

      fillRamper = scale.interpolator();
    }

  return React__default.createElement("g", {
    className: "legend",
    transform: "translate(".concat(pos.x, ",").concat(pos.y, ")")
  }, React__default.createElement("text", {
    transform: "translate(0,-6)"
  }, title), React__default.createElement(ColorRamp, {
    fillRamper: fillRamper,
    width: width,
    height: height
  }), React__default.createElement(Axis, _extends_1({
    transform: "translate(".concat(0, ",", height, ")")
  }, {
    width: width,
    height: height,
    direction: direction,
    ticks: ticks
  }, {
    scale: x
  })));
}
Legend.defaultProps = {
  pos: {
    x: 0,
    y: 0
  },
  width: 200,
  height: 50,
  direction: "horizontal",
  ticks: {
    number: 5,
    format: format(".1f"),
    padding: 20,
    style: {},
    length: 6
  },
  title: ""
};

function KDE(_ref) {
  var data = _ref.data,
      height = _ref.height,
      width = _ref.width,
      kernel = _ref.kernel,
      numberOfThresholds = _ref.numberOfThresholds,
      attrs = _ref.attrs,
      props = objectWithoutProperties(_ref, ["data", "height", "width", "kernel", "numberOfThresholds", "attrs"]);

  var x = linear$1().domain(extent(data)).range([0, width]);
  var y = linear$1().range([height, 0]);
  var thresholdScale = linear$1().domain([0, numberOfThresholds]).range(x.domain());
  var bandwidth = 0.9 * Math.min(deviation(data), IQR(data) / 1.34) * Math.pow(data.length, -1 / 5);
  var thresholds = range(numberOfThresholds).map(function (t) {
    return thresholdScale(t);
  });
  var kde = kdeFactory(kernel(bandwidth))(thresholds);
  var estimate = kde(data);
  y.domain(extent(estimate.map(function (d) {
    return d[1];
  })));
  var areaD = area().x(function (d) {
    return x(d[0]);
  }).y0(function (d) {
    return y.range()[0];
  }).y1(function (d) {
    return y(d[1]);
  }); // const areaD = line().x(d=>x(d[0])).y(d=>y(d[1]));

  return React__default.createElement("g", null, React__default.createElement("path", _extends_1({
    d: areaD(estimate)
  }, attrs)), props.children);
}
KDE.defaultProps = {
  kernel: epanechnikov,
  numberOfThresholds: 100,
  attrs: {
    stroke: "black",
    strokeWidth: 2
  }
};

function IQR(data) {
  return quantile(data, 0.75) - quantile(data, 0.25);
}

exports.Axis = Axis;
exports.AxisBars = AxisBars;
exports.Branches = Branches;
exports.CoalescentShape = CoalescentShape;
exports.FigTree = FigTree;
exports.ImmutableCladeCollection = ImmutableCladeCollection;
exports.ImmutableTree = ImmutableTree;
exports.KDE = KDE;
exports.Legend = Legend;
exports.NodeShape = Circle$1;
exports.Nodes = Nodes;
exports.RectangularBranchPath = RectangularBranchPath;
exports.annotateNode = annotateNode;
exports.collapseUnsupportedNodes = collapseUnsupportedNodes;
exports.customDateFormater = customDateFormater;
exports.dateToDecimal = dateToDecimal;
exports.decimalToDate = decimalToDate;
exports.edgeFactory = edgeFactory;
exports.getDivergence = getDivergence;
exports.getNode = getNode;
exports.getNodes = getNodes;
exports.getParent = getParent;
exports.getRootToTipLengths = getRootToTipLengths;
exports.getTips = getTips;
exports.orderByNodeDensity = orderByNodeDensity;
exports.parseNewick = parseNewick;
exports.parseNexus = parseNexus;
exports.rectangularLayout = rectangularLayout;
//# sourceMappingURL=index.js.map
