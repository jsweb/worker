/**
 * @name @jsweb/worker
 * @version 1.1.5
 * @desc JavaScript module to parallel process data through dynamic multi-thread workers.
 * @author Alex Bruno Cáceres <git.alexbr@outlook.com>
 * @create date 2020-08-13 22:05:51
 * @modify date 2020-08-14 20:24:37
 */
'use strict';

var os = require('os');
var Worker$1 = require('tiny-worker');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var Worker__default = /*#__PURE__*/_interopDefaultLegacy(Worker$1);

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

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

function _classPrivateFieldGet(receiver, privateMap) {
  var descriptor = privateMap.get(receiver);

  if (!descriptor) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  if (descriptor.get) {
    return descriptor.get.call(receiver);
  }

  return descriptor.value;
}

function _classPrivateFieldSet(receiver, privateMap, value) {
  var descriptor = privateMap.get(receiver);

  if (!descriptor) {
    throw new TypeError("attempted to set private field on non-instance");
  }

  if (descriptor.set) {
    descriptor.set.call(receiver, value);
  } else {
    if (!descriptor.writable) {
      throw new TypeError("attempted to set read only private field");
    }

    descriptor.value = value;
  }

  return value;
}

function _classPrivateMethodGet(receiver, privateSet, fn) {
  if (!privateSet.has(receiver)) {
    throw new TypeError("attempted to get private field on non-instance");
  }

  return fn;
}

var _threads = new WeakMap();

var _worker = new WeakMap();

var _node = new WeakMap();

var _flow = new WeakMap();

var _code = new WeakMap();

var _blob = new WeakMap();

var _functions = new WeakMap();

var _scripts = new WeakMap();

var _unpkg = new WeakMap();

var _env = new WeakMap();

var _asap = new WeakSet();

var _getWorker = new WeakSet();

var _getBlobUrl = new WeakSet();

var _setWorker = new WeakSet();

var _setCluster = new WeakSet();

var _shutdown = new WeakSet();

var WebWorker = /*#__PURE__*/function () {
  /**
   * Creates WebWorker instance
   *
   * @param {any} data
   * @param {number} threads
   * @param {any} worker
   * @param {boolean} node
   *
   * @memberOf WebWorker
   */
  function WebWorker(data) {
    var threads = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

    var _worker2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Worker;

    var node = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    _classCallCheck(this, WebWorker);

    _shutdown.add(this);

    _setCluster.add(this);

    _setWorker.add(this);

    _getBlobUrl.add(this);

    _getWorker.add(this);

    _asap.add(this);

    _threads.set(this, {
      writable: true,
      value: void 0
    });

    _worker.set(this, {
      writable: true,
      value: void 0
    });

    _node.set(this, {
      writable: true,
      value: void 0
    });

    _flow.set(this, {
      writable: true,
      value: void 0
    });

    _code.set(this, {
      writable: true,
      value: void 0
    });

    _blob.set(this, {
      writable: true,
      value: void 0
    });

    _functions.set(this, {
      writable: true,
      value: void 0
    });

    _scripts.set(this, {
      writable: true,
      value: void 0
    });

    _unpkg.set(this, {
      writable: true,
      value: void 0
    });

    _env.set(this, {
      writable: true,
      value: void 0
    });

    this.data = data; // Private props

    _classPrivateFieldSet(this, _threads, parseInt(threads, 10));

    _classPrivateFieldSet(this, _worker, _worker2);

    _classPrivateFieldSet(this, _node, node);

    _classPrivateFieldSet(this, _code, null);

    _classPrivateFieldSet(this, _blob, null);

    _classPrivateFieldSet(this, _functions, []);

    _classPrivateFieldSet(this, _scripts, []);

    _classPrivateFieldSet(this, _unpkg, []);

    _classPrivateFieldSet(this, _env, {});

    _classPrivateFieldSet(this, _flow, Promise.resolve(data));
  }
  /**
   * Sets a Worker environment constant attached to 'self.env' object.
   *
   * @param {String|Number} key
   * @param {any} value
   * @returns {WebWorker}
   *
   * @memberOf WebWorker
   */


  _createClass(WebWorker, [{
    key: "env",
    value: function env(key, value) {
      _classPrivateFieldGet(this, _env)[key] = value;
      return this;
    }
    /**
     * Import code to use at Worker environment like functions or scripts.
     * Accepts any number of named functions or scripts URLs.
     *
     * @param {any} args
     * @returns {WebWorker}
     *
     * @memberOf WebWorker
     */

  }, {
    key: "imports",
    value: function imports() {
      var _this = this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      args.forEach(function (arg) {
        switch (_typeof(arg)) {
          case 'string':
            _classPrivateFieldGet(_this, _scripts).push("'".concat(arg, "'"));

            break;

          case 'function':
            _classPrivateFieldGet(_this, _functions).push({
              name: arg.name,
              code: arg
            });

            break;

          default:
            _classPrivateFieldGet(_this, _functions).push(arg);

            break;
        }
      });
      return this;
    }
    /**
     * Import NPM modules from UNPKG CDN to use at Worker environment.
     * Accepts any number of string arguments to identify modules.
     *
     * @param {any} args
     * @returns
     *
     * @memberOf WebWorker
     */

  }, {
    key: "unpkg",
    value: function unpkg() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      _classPrivateFieldSet(this, _unpkg, args.map(function (path) {
        return "'https://unpkg.com/".concat(path, "'");
      }));

      return this;
    }
    /**
     * Executes a task function in a single parallel thread.
     *
     * @param {Function} task(data) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "exec",
    value: function exec(task) {
      var _this2 = this;

      if (!this.data) return this;

      _classPrivateFieldSet(this, _flow, _classPrivateFieldGet(this, _flow).then(function () {
        var fn = task.toString();

        var wk = _classPrivateMethodGet(_this2, _setWorker, _setWorker2).call(_this2, fn);

        return new Promise(function (done) {
          wk.postMessage(_this2.data);
          wk.addEventListener('message', function (e) {
            _this2.data = e.data;

            _classPrivateMethodGet(_this2, _shutdown, _shutdown2).call(_this2, [wk]);

            done(_this2.data);
          });
        });
      }));

      return this;
    }
    /**
     * Executes a multi-thread Array.map method.
     *
     * @param {Function} task(item, index, array) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "map",
    value: function map(task) {
      var _this3 = this;

      if (!this.data) return this;

      _classPrivateFieldSet(this, _flow, _classPrivateFieldGet(this, _flow).then(function () {
        var total = Number(_this3.data.length);
        var thread = 0;
        var proxy = [];
        var exec = 'task(o.v, o.k)';
        var result = '{ v: r, k: o.k }';
        var job = "o => { const task = ".concat(task, ", r = ").concat(exec, "; return ").concat(result, " }");

        var cluster = _classPrivateMethodGet(_this3, _setCluster, _setCluster2).call(_this3, job);

        var back = function back(done) {
          _this3.data = proxy;

          _classPrivateMethodGet(_this3, _shutdown, _shutdown2).call(_this3, cluster);

          return done(_this3.data);
        };

        function loop(v, k) {
          if (thread === cluster.length) thread = 0;
          return cluster[thread++].postMessage({
            v: v,
            k: k
          });
        }

        return new Promise(function (done) {
          function ping(e) {
            proxy[e.data.k] = e.data.v;
            return --total || back(done);
          }

          cluster.forEach(function (wk) {
            return wk.addEventListener('message', ping);
          });

          _this3.data.forEach(function (v, k) {
            return _classPrivateMethodGet(_this3, _asap, _asap2).call(_this3, loop, v, k);
          });
        });
      }));

      return this;
    }
    /**
     * Executes a multi-thread Array.reduce method.
     *
     * @param {Function} task(result, item, index, array) {}
     * @param {any} result
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "reduce",
    value: function reduce(task, arg) {
      var _this4 = this;

      if (!this.data) return this;

      _classPrivateFieldSet(this, _flow, _classPrivateFieldGet(this, _flow).then(function () {
        var total = 0;
        var thread = 0;
        var limit = 100;
        var parts = [];
        var proxy = [];
        var cluster = [];
        var job = "o => o.a.reduce(".concat(task, ", o.r)");

        var last = _classPrivateMethodGet(_this4, _setWorker, _setWorker2).call(_this4, job);

        var back = function back(done, result) {
          _classPrivateMethodGet(_this4, _shutdown, _shutdown2).call(_this4, cluster.concat(last));

          _this4.data = result;
          return done(_this4.data);
        };

        function finish(all) {
          if (Array.isArray(all[0])) all = all.reduce(function (a, i) {
            return a.concat(i);
          }, []);
          last.postMessage({
            a: all,
            r: arg
          });
        }

        function loop(part) {
          if (thread === cluster.length) thread = 0;
          return cluster[thread++].postMessage({
            a: part,
            r: arg
          });
        }

        function ping(e) {
          proxy.push(e.data);
          return --total || finish(proxy);
        }

        return new Promise(function (done) {
          last.addEventListener('message', function (e) {
            return back(done, e.data);
          });
          if (_this4.data.length <= limit) return finish(_this4.data);
          cluster = _classPrivateMethodGet(_this4, _setCluster, _setCluster2).call(_this4, job);
          cluster.forEach(function (wk) {
            return wk.addEventListener('message', ping);
          });

          while (_this4.data.length) {
            parts.push(_this4.data.splice(0, limit));
          }

          total = parseInt(parts.length);
          return parts.forEach(function (part) {
            return _classPrivateMethodGet(_this4, _asap, _asap2).call(_this4, loop, part);
          });
        });
      }));

      return this;
    }
    /**
     * Executes a single parallel thread Array.filter method.
     *
     * @param {Function} task(item) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "filter",
    value: function filter(task) {
      if (!this.data) return this;
      var job = "a => a.filter(".concat(task, ")");
      return this.exec(job);
    }
    /**
     * Executes a single parallel thread Array.sort method.
     *
     * @param {Function} task(a, b) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "sort",
    value: function sort(task) {
      if (!this.data) return this;
      var job = "a => a.sort(".concat(task, ")");
      return this.exec(job);
    }
    /**
     * Executes a single-thread Array.flat method.
     *
     * @param {Number} depth
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "flat",
    value: function flat() {
      var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      if (!this.data) return this;
      var job = "a => a.flat(".concat(depth, ")");
      return this.exec(job);
    }
    /**
     * Executes a multi-thread Array.flatMap like method.
     * In fact, this method just chain flat (single-thread) and map (multi-thread) methods.
     * It differs a bit from native Array.flatMap because it allows to set flat depth.
     *
     * @param {Function} task(item, index, array) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "flatMap",
    value: function flatMap(task) {
      var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      if (!this.data) return this;
      return this.flat(depth).map(task);
    }
    /**
     * Promise-like async step.
     * Unlike the native `Promise.then`, which returns a `Promise`, this method returns the `worker` instance to chain another methods.
     *
     * @param {Function} task(data) {}
     * @returns WebWorker
     *
     * @memberOf WebWorker
     */

  }, {
    key: "then",
    value: function then(task) {
      var _this5 = this;

      _classPrivateFieldSet(this, _flow, _classPrivateFieldGet(this, _flow).then(function () {
        return task(_this5.data);
      }));

      return this;
    }
    /**
     * Promise-like async last step.
     *
     * @param {Function} task(data) {}
     * @returns {Function} task
     *
     * @memberOf WebWorker
     */

  }, {
    key: "finally",
    value: function _finally(task) {
      var _this6 = this;

      return _classPrivateFieldGet(this, _flow).then(function () {
        return task(_this6.data);
      });
    } // Private methods

  }]);

  return WebWorker;
}();

var _asap2 = function _asap2(fn) {
  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  return _classPrivateFieldGet(this, _node) ? setImmediate.apply(void 0, [fn].concat(args)) : setTimeout.apply(void 0, [fn, 1].concat(args));
};

var _getWorker2 = function _getWorker2(str) {
  var worker = ['"use strict"'];
  var env = JSON.stringify(_classPrivateFieldGet(this, _env));

  var scripts = _classPrivateFieldGet(this, _scripts).join(',');

  var unpkg = _classPrivateFieldGet(this, _unpkg).join(',');

  var footer = ["const env = ".concat(env, ", job = ").concat(str, ";"), 'self.addEventListener("message", e => {', 'const result = job(e.data);', 'self.postMessage(result);', '})'].join(' ');
  if (scripts.length) worker.push("importScripts(".concat(scripts, ")"));
  if (unpkg.length) worker.push("importScripts(".concat(unpkg, ")"));

  _classPrivateFieldGet(this, _functions).forEach(function (fn) {
    var func = fn.name ? "const ".concat(fn.name, " = ").concat(fn.code) : fn.code.toString();
    worker.push(func);
  });

  _classPrivateFieldSet(this, _code, worker.concat(footer).join('\n'));

  return _classPrivateFieldGet(this, _code);
};

var _getBlobUrl2 = function _getBlobUrl2(wk) {
  var blob = new Blob([wk], {
    type: 'application/javascript'
  });

  _classPrivateFieldSet(this, _blob, URL.createObjectURL(blob));

  return _classPrivateFieldGet(this, _blob);
};

var _setWorker2 = function _setWorker2(str) {
  var code = _classPrivateFieldGet(this, _code) || _classPrivateMethodGet(this, _getWorker, _getWorker2).call(this, str),
      wk = _classPrivateFieldGet(this, _node) ? new Function(code) : _classPrivateFieldGet(this, _blob) || _classPrivateMethodGet(this, _getBlobUrl, _getBlobUrl2).call(this, code);

  return new (_classPrivateFieldGet(this, _worker))(wk);
};

var _setCluster2 = function _setCluster2(task) {
  var cluster = [];

  for (var i = _classPrivateFieldGet(this, _threads); i > 0; i--) {
    cluster.push(_classPrivateMethodGet(this, _setWorker, _setWorker2).call(this, task));
  }

  return cluster;
};

var _shutdown2 = function _shutdown2(cluster) {
  _classPrivateFieldSet(this, _code, null);

  cluster.forEach(function (wk) {
    return wk.terminate();
  });

  if (_classPrivateFieldGet(this, _blob)) {
    URL.revokeObjectURL(_classPrivateFieldGet(this, _blob));

    _classPrivateFieldSet(this, _blob, null);
  }
};

function node (data) {
  var threads = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : os.cpus().length;
  return new WebWorker(data, threads, Worker__default['default'], true);
}

module.exports = node;
