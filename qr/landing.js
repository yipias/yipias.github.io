const Ue = () => {
};
const Ee = function(t) {
  const e = [];
  let r = 0;
  for (let n = 0; n < t.length; n++) {
    let o = t.charCodeAt(n);
    o < 128 ? e[r++] = o : o < 2048 ? (e[r++] = o >> 6 | 192, e[r++] = o & 63 | 128) : (o & 64512) === 55296 && n + 1 < t.length && (t.charCodeAt(n + 1) & 64512) === 56320 ? (o = 65536 + ((o & 1023) << 10) + (t.charCodeAt(++n) & 1023), e[r++] = o >> 18 | 240, e[r++] = o >> 12 & 63 | 128, e[r++] = o >> 6 & 63 | 128, e[r++] = o & 63 | 128) : (e[r++] = o >> 12 | 224, e[r++] = o >> 6 & 63 | 128, e[r++] = o & 63 | 128);
  }
  return e;
}, je = function(t) {
  const e = [];
  let r = 0, n = 0;
  for (; r < t.length; ) {
    const o = t[r++];
    if (o < 128)
      e[n++] = String.fromCharCode(o);
    else if (o > 191 && o < 224) {
      const s = t[r++];
      e[n++] = String.fromCharCode((o & 31) << 6 | s & 63);
    } else if (o > 239 && o < 365) {
      const s = t[r++], i = t[r++], c = t[r++], a = ((o & 7) << 18 | (s & 63) << 12 | (i & 63) << 6 | c & 63) - 65536;
      e[n++] = String.fromCharCode(55296 + (a >> 10)), e[n++] = String.fromCharCode(56320 + (a & 1023));
    } else {
      const s = t[r++], i = t[r++];
      e[n++] = String.fromCharCode((o & 15) << 12 | (s & 63) << 6 | i & 63);
    }
  }
  return e.join("");
}, q = {
  /**
   * Maps bytes to characters.
   */
  byteToCharMap_: null,
  /**
   * Maps characters to bytes.
   */
  charToByteMap_: null,
  /**
   * Maps bytes to websafe characters.
   * @private
   */
  byteToCharMapWebSafe_: null,
  /**
   * Maps websafe characters to bytes.
   * @private
   */
  charToByteMapWebSafe_: null,
  /**
   * Our default alphabet, shared between
   * ENCODED_VALS and ENCODED_VALS_WEBSAFE
   */
  ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  /**
   * Our default alphabet. Value 64 (=) is special; it means "nothing."
   */
  get ENCODED_VALS() {
    return this.ENCODED_VALS_BASE + "+/=";
  },
  /**
   * Our websafe alphabet.
   */
  get ENCODED_VALS_WEBSAFE() {
    return this.ENCODED_VALS_BASE + "-_.";
  },
  /**
   * Whether this browser supports the atob and btoa functions. This extension
   * started at Mozilla but is now implemented by many browsers. We use the
   * ASSUME_* variables to avoid pulling in the full useragent detection library
   * but still allowing the standard per-browser compilations.
   *
   */
  HAS_NATIVE_SUPPORT: typeof atob == "function",
  /**
   * Base64-encode an array of bytes.
   *
   * @param input An array of bytes (numbers with
   *     value in [0, 255]) to encode.
   * @param webSafe Boolean indicating we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeByteArray(t, e) {
    if (!Array.isArray(t))
      throw Error("encodeByteArray takes an array as a parameter");
    this.init_();
    const r = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, n = [];
    for (let o = 0; o < t.length; o += 3) {
      const s = t[o], i = o + 1 < t.length, c = i ? t[o + 1] : 0, a = o + 2 < t.length, l = a ? t[o + 2] : 0, y = s >> 2, f = (s & 3) << 4 | c >> 4;
      let v = (c & 15) << 2 | l >> 6, k = l & 63;
      a || (k = 64, i || (v = 64)), n.push(r[y], r[f], r[v], r[k]);
    }
    return n.join("");
  },
  /**
   * Base64-encode a string.
   *
   * @param input A string to encode.
   * @param webSafe If true, we should use the
   *     alternative alphabet.
   * @return The base64 encoded string.
   */
  encodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? btoa(t) : this.encodeByteArray(Ee(t), e);
  },
  /**
   * Base64-decode a string.
   *
   * @param input to decode.
   * @param webSafe True if we should use the
   *     alternative alphabet.
   * @return string representing the decoded value.
   */
  decodeString(t, e) {
    return this.HAS_NATIVE_SUPPORT && !e ? atob(t) : je(this.decodeStringToByteArray(t, e));
  },
  /**
   * Base64-decode a string.
   *
   * In base-64 decoding, groups of four characters are converted into three
   * bytes.  If the encoder did not apply padding, the input length may not
   * be a multiple of 4.
   *
   * In this case, the last group will have fewer than 4 characters, and
   * padding will be inferred.  If the group has one or two characters, it decodes
   * to one byte.  If the group has three characters, it decodes to two bytes.
   *
   * @param input Input to decode.
   * @param webSafe True if we should use the web-safe alphabet.
   * @return bytes representing the decoded value.
   */
  decodeStringToByteArray(t, e) {
    this.init_();
    const r = e ? this.charToByteMapWebSafe_ : this.charToByteMap_, n = [];
    for (let o = 0; o < t.length; ) {
      const s = r[t.charAt(o++)], c = o < t.length ? r[t.charAt(o)] : 0;
      ++o;
      const l = o < t.length ? r[t.charAt(o)] : 64;
      ++o;
      const f = o < t.length ? r[t.charAt(o)] : 64;
      if (++o, s == null || c == null || l == null || f == null)
        throw new Ve();
      const v = s << 2 | c >> 4;
      if (n.push(v), l !== 64) {
        const k = c << 4 & 240 | l >> 2;
        if (n.push(k), f !== 64) {
          const ze = l << 6 & 192 | f;
          n.push(ze);
        }
      }
    }
    return n;
  },
  /**
   * Lazy static initialization function. Called before
   * accessing any of the static map variables.
   * @private
   */
  init_() {
    if (!this.byteToCharMap_) {
      this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
      for (let t = 0; t < this.ENCODED_VALS.length; t++)
        this.byteToCharMap_[t] = this.ENCODED_VALS.charAt(t), this.charToByteMap_[this.byteToCharMap_[t]] = t, this.byteToCharMapWebSafe_[t] = this.ENCODED_VALS_WEBSAFE.charAt(t), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[t]] = t, t >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(t)] = t, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(t)] = t);
    }
  }
};
class Ve extends Error {
  constructor() {
    super(...arguments), this.name = "DecodeBase64StringError";
  }
}
const We = function(t) {
  const e = Ee(t);
  return q.encodeByteArray(e, !0);
}, we = function(t) {
  return We(t).replace(/\./g, "");
}, Ke = function(t) {
  try {
    return q.decodeString(t, !0);
  } catch (e) {
    console.error("base64Decode failed: ", e);
  }
  return null;
};
function _e() {
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  if (typeof global < "u")
    return global;
  throw new Error("Unable to locate global object.");
}
const Ge = () => _e().__FIREBASE_DEFAULTS__, qe = () => {
  if (typeof process > "u" || typeof process.env > "u")
    return;
  const t = process.env.__FIREBASE_DEFAULTS__;
  if (t)
    return JSON.parse(t);
}, Xe = () => {
  if (typeof document > "u")
    return;
  let t;
  try {
    t = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
  } catch {
    return;
  }
  const e = t && Ke(t[1]);
  return e && JSON.parse(e);
}, Ye = () => {
  try {
    return Ue() || Ge() || qe() || Xe();
  } catch (t) {
    console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${t}`);
    return;
  }
}, ye = () => Ye()?.config;
class A {
  constructor() {
    this.reject = () => {
    }, this.resolve = () => {
    }, this.promise = new Promise((e, r) => {
      this.resolve = e, this.reject = r;
    });
  }
  /**
   * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
   * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
   * and returns a node-style callback which will resolve or reject the Deferred's promise.
   */
  wrapCallback(e) {
    return (r, n) => {
      r ? this.reject(r) : this.resolve(n), typeof e == "function" && (this.promise.catch(() => {
      }), e.length === 1 ? e(r) : e(r, n));
    };
  }
}
function X() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function Je() {
  return new Promise((t, e) => {
    try {
      let r = !0;
      const n = "validate-browser-context-for-indexeddb-analytics-module", o = self.indexedDB.open(n);
      o.onsuccess = () => {
        o.result.close(), r || self.indexedDB.deleteDatabase(n), t(!0);
      }, o.onupgradeneeded = () => {
        r = !1;
      }, o.onerror = () => {
        e(o.error?.message || "");
      };
    } catch (r) {
      e(r);
    }
  });
}
const Qe = "FirebaseError";
class S extends Error {
  constructor(e, r, n) {
    super(r), this.code = e, this.customData = n, this.name = Qe, Object.setPrototypeOf(this, S.prototype), Error.captureStackTrace && Error.captureStackTrace(this, Y.prototype.create);
  }
}
class Y {
  constructor(e, r, n) {
    this.service = e, this.serviceName = r, this.errors = n;
  }
  create(e, ...r) {
    const n = r[0] || {}, o = `${this.service}/${e}`, s = this.errors[e], i = s ? Ze(s, n) : "Error", c = `${this.serviceName}: ${i} (${o}).`;
    return new S(o, c, n);
  }
}
function Ze(t, e) {
  return t.replace(et, (r, n) => {
    const o = e[n];
    return o != null ? String(o) : `<${n}?>`;
  });
}
const et = /\{\$([^}]+)}/g;
function z(t, e) {
  if (t === e)
    return !0;
  const r = Object.keys(t), n = Object.keys(e);
  for (const o of r) {
    if (!n.includes(o))
      return !1;
    const s = t[o], i = e[o];
    if (ne(s) && ne(i)) {
      if (!z(s, i))
        return !1;
    } else if (s !== i)
      return !1;
  }
  for (const o of n)
    if (!r.includes(o))
      return !1;
  return !0;
}
function ne(t) {
  return t !== null && typeof t == "object";
}
const tt = 1e3, rt = 2, nt = 14400 * 1e3, ot = 0.5;
function st(t, e = tt, r = rt) {
  const n = e * Math.pow(r, t), o = Math.round(
    // A fraction of the backoff value to add/subtract.
    // Deviation: changes multiplication order to improve readability.
    ot * n * // A random float (rounded to int by Math.round above) in the range [-1, 1]. Determines
    // if we add or subtract.
    (Math.random() - 0.5) * 2
  );
  return Math.min(nt, n + o);
}
function it(t) {
  return t && t._delegate ? t._delegate : t;
}
class _ {
  /**
   *
   * @param name The public service name, e.g. app, auth, firestore, database
   * @param instanceFactory Service factory responsible for creating the public interface
   * @param type whether the service provided by the component is public or private
   */
  constructor(e, r, n) {
    this.name = e, this.instanceFactory = r, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
  }
  setInstantiationMode(e) {
    return this.instantiationMode = e, this;
  }
  setMultipleInstances(e) {
    return this.multipleInstances = e, this;
  }
  setServiceProps(e) {
    return this.serviceProps = e, this;
  }
  setInstanceCreatedCallback(e) {
    return this.onInstanceCreated = e, this;
  }
}
const E = "[DEFAULT]";
class at {
  constructor(e, r) {
    this.name = e, this.container = r, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
  }
  /**
   * @param identifier A provider can provide multiple instances of a service
   * if this.component.multipleInstances is true.
   */
  get(e) {
    const r = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(r)) {
      const n = new A();
      if (this.instancesDeferred.set(r, n), this.isInitialized(r) || this.shouldAutoInitialize())
        try {
          const o = this.getOrInitializeService({
            instanceIdentifier: r
          });
          o && n.resolve(o);
        } catch {
        }
    }
    return this.instancesDeferred.get(r).promise;
  }
  getImmediate(e) {
    const r = this.normalizeInstanceIdentifier(e?.identifier), n = e?.optional ?? !1;
    if (this.isInitialized(r) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({
          instanceIdentifier: r
        });
      } catch (o) {
        if (n)
          return null;
        throw o;
      }
    else {
      if (n)
        return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (this.component = e, !!this.shouldAutoInitialize()) {
      if (lt(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: E });
        } catch {
        }
      for (const [r, n] of this.instancesDeferred.entries()) {
        const o = this.normalizeInstanceIdentifier(r);
        try {
          const s = this.getOrInitializeService({
            instanceIdentifier: o
          });
          n.resolve(s);
        } catch {
        }
      }
    }
  }
  clearInstance(e = E) {
    this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
  }
  // app.delete() will call this method on every provider to delete the services
  // TODO: should we mark the provider as deleted?
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((r) => "INTERNAL" in r).map((r) => r.INTERNAL.delete()),
      ...e.filter((r) => "_delete" in r).map((r) => r._delete())
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = E) {
    return this.instances.has(e);
  }
  getOptions(e = E) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: r = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(n))
      throw Error(`${this.name}(${n}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const o = this.getOrInitializeService({
      instanceIdentifier: n,
      options: r
    });
    for (const [s, i] of this.instancesDeferred.entries()) {
      const c = this.normalizeInstanceIdentifier(s);
      n === c && i.resolve(o);
    }
    return o;
  }
  /**
   *
   * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
   * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
   *
   * @param identifier An optional instance identifier
   * @returns a function to unregister the callback
   */
  onInit(e, r) {
    const n = this.normalizeInstanceIdentifier(r), o = this.onInitCallbacks.get(n) ?? /* @__PURE__ */ new Set();
    o.add(e), this.onInitCallbacks.set(n, o);
    const s = this.instances.get(n);
    return s && e(s, n), () => {
      o.delete(e);
    };
  }
  /**
   * Invoke onInit callbacks synchronously
   * @param instance the service instance`
   */
  invokeOnInitCallbacks(e, r) {
    const n = this.onInitCallbacks.get(r);
    if (n)
      for (const o of n)
        try {
          o(e, r);
        } catch {
        }
  }
  getOrInitializeService({ instanceIdentifier: e, options: r = {} }) {
    let n = this.instances.get(e);
    if (!n && this.component && (n = this.component.instanceFactory(this.container, {
      instanceIdentifier: ct(e),
      options: r
    }), this.instances.set(e, n), this.instancesOptions.set(e, r), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated))
      try {
        this.component.onInstanceCreated(this.container, e, n);
      } catch {
      }
    return n || null;
  }
  normalizeInstanceIdentifier(e = E) {
    return this.component ? this.component.multipleInstances ? e : E : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function ct(t) {
  return t === E ? void 0 : t;
}
function lt(t) {
  return t.instantiationMode === "EAGER";
}
class ht {
  constructor(e) {
    this.name = e, this.providers = /* @__PURE__ */ new Map();
  }
  /**
   *
   * @param component Component being added
   * @param overwrite When a component with the same name has already been registered,
   * if overwrite is true: overwrite the existing component with the new component and create a new
   * provider with the new component. It can be useful in tests where you want to use different mocks
   * for different tests.
   * if overwrite is false: throw an exception
   */
  addComponent(e) {
    const r = this.getProvider(e.name);
    if (r.isComponentSet())
      throw new Error(`Component ${e.name} has already been registered with ${this.name}`);
    r.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
  }
  /**
   * getProvider provides a type safe interface where it can only be called with a field name
   * present in NameServiceMapping interface.
   *
   * Firebase SDKs providing services should extend NameServiceMapping interface to register
   * themselves.
   */
  getProvider(e) {
    if (this.providers.has(e))
      return this.providers.get(e);
    const r = new at(e, this);
    return this.providers.set(e, r), r;
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
var h;
(function(t) {
  t[t.DEBUG = 0] = "DEBUG", t[t.VERBOSE = 1] = "VERBOSE", t[t.INFO = 2] = "INFO", t[t.WARN = 3] = "WARN", t[t.ERROR = 4] = "ERROR", t[t.SILENT = 5] = "SILENT";
})(h || (h = {}));
const dt = {
  debug: h.DEBUG,
  verbose: h.VERBOSE,
  info: h.INFO,
  warn: h.WARN,
  error: h.ERROR,
  silent: h.SILENT
}, ut = h.INFO, ft = {
  [h.DEBUG]: "log",
  [h.VERBOSE]: "log",
  [h.INFO]: "info",
  [h.WARN]: "warn",
  [h.ERROR]: "error"
}, pt = (t, e, ...r) => {
  if (e < t.logLevel)
    return;
  const n = (/* @__PURE__ */ new Date()).toISOString(), o = ft[e];
  if (o)
    console[o](`[${n}]  ${t.name}:`, ...r);
  else
    throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`);
};
class Ie {
  /**
   * Gives you an instance of a Logger to capture messages according to
   * Firebase's logging scheme.
   *
   * @param name The name that the logs will be associated with
   */
  constructor(e) {
    this.name = e, this._logLevel = ut, this._logHandler = pt, this._userLogHandler = null;
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in h))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  // Workaround for setter/getter having to be the same type.
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? dt[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  /**
   * The functions below are all based on the `console` interface
   */
  debug(...e) {
    this._userLogHandler && this._userLogHandler(this, h.DEBUG, ...e), this._logHandler(this, h.DEBUG, ...e);
  }
  log(...e) {
    this._userLogHandler && this._userLogHandler(this, h.VERBOSE, ...e), this._logHandler(this, h.VERBOSE, ...e);
  }
  info(...e) {
    this._userLogHandler && this._userLogHandler(this, h.INFO, ...e), this._logHandler(this, h.INFO, ...e);
  }
  warn(...e) {
    this._userLogHandler && this._userLogHandler(this, h.WARN, ...e), this._logHandler(this, h.WARN, ...e);
  }
  error(...e) {
    this._userLogHandler && this._userLogHandler(this, h.ERROR, ...e), this._logHandler(this, h.ERROR, ...e);
  }
}
const gt = (t, e) => e.some((r) => t instanceof r);
let oe, se;
function mt() {
  return oe || (oe = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function bt() {
  return se || (se = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const Ae = /* @__PURE__ */ new WeakMap(), U = /* @__PURE__ */ new WeakMap(), Te = /* @__PURE__ */ new WeakMap(), $ = /* @__PURE__ */ new WeakMap(), J = /* @__PURE__ */ new WeakMap();
function Et(t) {
  const e = new Promise((r, n) => {
    const o = () => {
      t.removeEventListener("success", s), t.removeEventListener("error", i);
    }, s = () => {
      r(m(t.result)), o();
    }, i = () => {
      n(t.error), o();
    };
    t.addEventListener("success", s), t.addEventListener("error", i);
  });
  return e.then((r) => {
    r instanceof IDBCursor && Ae.set(r, t);
  }).catch(() => {
  }), J.set(e, t), e;
}
function wt(t) {
  if (U.has(t))
    return;
  const e = new Promise((r, n) => {
    const o = () => {
      t.removeEventListener("complete", s), t.removeEventListener("error", i), t.removeEventListener("abort", i);
    }, s = () => {
      r(), o();
    }, i = () => {
      n(t.error || new DOMException("AbortError", "AbortError")), o();
    };
    t.addEventListener("complete", s), t.addEventListener("error", i), t.addEventListener("abort", i);
  });
  U.set(t, e);
}
let j = {
  get(t, e, r) {
    if (t instanceof IDBTransaction) {
      if (e === "done")
        return U.get(t);
      if (e === "objectStoreNames")
        return t.objectStoreNames || Te.get(t);
      if (e === "store")
        return r.objectStoreNames[1] ? void 0 : r.objectStore(r.objectStoreNames[0]);
    }
    return m(t[e]);
  },
  set(t, e, r) {
    return t[e] = r, !0;
  },
  has(t, e) {
    return t instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in t;
  }
};
function _t(t) {
  j = t(j);
}
function yt(t) {
  return t === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...r) {
    const n = t.call(N(this), e, ...r);
    return Te.set(n, e.sort ? e.sort() : [e]), m(n);
  } : bt().includes(t) ? function(...e) {
    return t.apply(N(this), e), m(Ae.get(this));
  } : function(...e) {
    return m(t.apply(N(this), e));
  };
}
function It(t) {
  return typeof t == "function" ? yt(t) : (t instanceof IDBTransaction && wt(t), gt(t, mt()) ? new Proxy(t, j) : t);
}
function m(t) {
  if (t instanceof IDBRequest)
    return Et(t);
  if ($.has(t))
    return $.get(t);
  const e = It(t);
  return e !== t && ($.set(t, e), J.set(e, t)), e;
}
const N = (t) => J.get(t);
function At(t, e, { blocked: r, upgrade: n, blocking: o, terminated: s } = {}) {
  const i = indexedDB.open(t, e), c = m(i);
  return n && i.addEventListener("upgradeneeded", (a) => {
    n(m(i.result), a.oldVersion, a.newVersion, m(i.transaction), a);
  }), r && i.addEventListener("blocked", (a) => r(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    a.oldVersion,
    a.newVersion,
    a
  )), c.then((a) => {
    s && a.addEventListener("close", () => s()), o && a.addEventListener("versionchange", (l) => o(l.oldVersion, l.newVersion, l));
  }).catch(() => {
  }), c;
}
const Tt = ["get", "getKey", "getAll", "getAllKeys", "count"], Dt = ["put", "add", "delete", "clear"], x = /* @__PURE__ */ new Map();
function ie(t, e) {
  if (!(t instanceof IDBDatabase && !(e in t) && typeof e == "string"))
    return;
  if (x.get(e))
    return x.get(e);
  const r = e.replace(/FromIndex$/, ""), n = e !== r, o = Dt.includes(r);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(r in (n ? IDBIndex : IDBObjectStore).prototype) || !(o || Tt.includes(r))
  )
    return;
  const s = async function(i, ...c) {
    const a = this.transaction(i, o ? "readwrite" : "readonly");
    let l = a.store;
    return n && (l = l.index(c.shift())), (await Promise.all([
      l[r](...c),
      o && a.done
    ]))[0];
  };
  return x.set(e, s), s;
}
_t((t) => ({
  ...t,
  get: (e, r, n) => ie(e, r) || t.get(e, r, n),
  has: (e, r) => !!ie(e, r) || t.has(e, r)
}));
class Ct {
  constructor(e) {
    this.container = e;
  }
  // In initial implementation, this will be called by installations on
  // auth token refresh, and installations will send this string.
  getPlatformInfoString() {
    return this.container.getProviders().map((r) => {
      if (St(r)) {
        const n = r.getImmediate();
        return `${n.library}/${n.version}`;
      } else
        return null;
    }).filter((r) => r).join(" ");
  }
}
function St(t) {
  return t.getComponent()?.type === "VERSION";
}
const V = "@firebase/app", ae = "0.14.8";
const p = new Ie("@firebase/app"), vt = "@firebase/app-compat", kt = "@firebase/analytics-compat", Rt = "@firebase/analytics", Bt = "@firebase/app-check-compat", Pt = "@firebase/app-check", Ot = "@firebase/auth", Mt = "@firebase/auth-compat", $t = "@firebase/database", Nt = "@firebase/data-connect", xt = "@firebase/database-compat", Ht = "@firebase/functions", Lt = "@firebase/functions-compat", Ft = "@firebase/installations", zt = "@firebase/installations-compat", Ut = "@firebase/messaging", jt = "@firebase/messaging-compat", Vt = "@firebase/performance", Wt = "@firebase/performance-compat", Kt = "@firebase/remote-config", Gt = "@firebase/remote-config-compat", qt = "@firebase/storage", Xt = "@firebase/storage-compat", Yt = "@firebase/firestore", Jt = "@firebase/ai", Qt = "@firebase/firestore-compat", Zt = "firebase";
const W = "[DEFAULT]", er = {
  [V]: "fire-core",
  [vt]: "fire-core-compat",
  [Rt]: "fire-analytics",
  [kt]: "fire-analytics-compat",
  [Pt]: "fire-app-check",
  [Bt]: "fire-app-check-compat",
  [Ot]: "fire-auth",
  [Mt]: "fire-auth-compat",
  [$t]: "fire-rtdb",
  [Nt]: "fire-data-connect",
  [xt]: "fire-rtdb-compat",
  [Ht]: "fire-fn",
  [Lt]: "fire-fn-compat",
  [Ft]: "fire-iid",
  [zt]: "fire-iid-compat",
  [Ut]: "fire-fcm",
  [jt]: "fire-fcm-compat",
  [Vt]: "fire-perf",
  [Wt]: "fire-perf-compat",
  [Kt]: "fire-rc",
  [Gt]: "fire-rc-compat",
  [qt]: "fire-gcs",
  [Xt]: "fire-gcs-compat",
  [Yt]: "fire-fst",
  [Qt]: "fire-fst-compat",
  [Jt]: "fire-vertex",
  "fire-js": "fire-js",
  // Platform identifier for JS SDK.
  [Zt]: "fire-js-all"
};
const P = /* @__PURE__ */ new Map(), tr = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map();
function ce(t, e) {
  try {
    t.container.addComponent(e);
  } catch (r) {
    p.debug(`Component ${e.name} failed to register with FirebaseApp ${t.name}`, r);
  }
}
function T(t) {
  const e = t.name;
  if (K.has(e))
    return p.debug(`There were multiple attempts to register component ${e}.`), !1;
  K.set(e, t);
  for (const r of P.values())
    ce(r, t);
  for (const r of tr.values())
    ce(r, t);
  return !0;
}
function De(t, e) {
  const r = t.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return r && r.triggerHeartbeat(), t.container.getProvider(e);
}
const rr = {
  "no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
  "bad-app-name": "Illegal App name: '{$appName}'",
  "duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
  "app-deleted": "Firebase App named '{$appName}' already deleted",
  "server-app-deleted": "Firebase Server App has been deleted",
  "no-options": "Need to provide options, when not being deployed to hosting via source.",
  "invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
  "invalid-log-argument": "First argument to `onLog` must be null or a function.",
  "idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
  "idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
  "finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
  "invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
}, b = new Y("app", "Firebase", rr);
class nr {
  constructor(e, r, n) {
    this._isDeleted = !1, this._options = { ...e }, this._config = { ...r }, this._name = r.name, this._automaticDataCollectionEnabled = r.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new _(
      "app",
      () => this,
      "PUBLIC"
      /* ComponentType.PUBLIC */
    ));
  }
  get automaticDataCollectionEnabled() {
    return this.checkDestroyed(), this._automaticDataCollectionEnabled;
  }
  set automaticDataCollectionEnabled(e) {
    this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
  }
  get name() {
    return this.checkDestroyed(), this._name;
  }
  get options() {
    return this.checkDestroyed(), this._options;
  }
  get config() {
    return this.checkDestroyed(), this._config;
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  /**
   * This function will throw an Error if the App has already been deleted -
   * use before performing API actions on the App.
   */
  checkDestroyed() {
    if (this.isDeleted)
      throw b.create("app-deleted", { appName: this._name });
  }
}
function Ce(t, e = {}) {
  let r = t;
  typeof e != "object" && (e = { name: e });
  const n = {
    name: W,
    automaticDataCollectionEnabled: !0,
    ...e
  }, o = n.name;
  if (typeof o != "string" || !o)
    throw b.create("bad-app-name", {
      appName: String(o)
    });
  if (r || (r = ye()), !r)
    throw b.create(
      "no-options"
      /* AppError.NO_OPTIONS */
    );
  const s = P.get(o);
  if (s) {
    if (z(r, s.options) && z(n, s.config))
      return s;
    throw b.create("duplicate-app", { appName: o });
  }
  const i = new ht(o);
  for (const a of K.values())
    i.addComponent(a);
  const c = new nr(r, n, i);
  return P.set(o, c), c;
}
function or(t = W) {
  const e = P.get(t);
  if (!e && t === W && ye())
    return Ce();
  if (!e)
    throw b.create("no-app", { appName: t });
  return e;
}
function I(t, e, r) {
  let n = er[t] ?? t;
  r && (n += `-${r}`);
  const o = n.match(/\s|\//), s = e.match(/\s|\//);
  if (o || s) {
    const i = [
      `Unable to register library "${n}" with version "${e}":`
    ];
    o && i.push(`library name "${n}" contains illegal characters (whitespace or "/")`), o && s && i.push("and"), s && i.push(`version name "${e}" contains illegal characters (whitespace or "/")`), p.warn(i.join(" "));
    return;
  }
  T(new _(
    `${n}-version`,
    () => ({ library: n, version: e }),
    "VERSION"
    /* ComponentType.VERSION */
  ));
}
const sr = "firebase-heartbeat-database", ir = 1, D = "firebase-heartbeat-store";
let H = null;
function Se() {
  return H || (H = At(sr, ir, {
    upgrade: (t, e) => {
      switch (e) {
        case 0:
          try {
            t.createObjectStore(D);
          } catch (r) {
            console.warn(r);
          }
      }
    }
  }).catch((t) => {
    throw b.create("idb-open", {
      originalErrorMessage: t.message
    });
  })), H;
}
async function ar(t) {
  try {
    const r = (await Se()).transaction(D), n = await r.objectStore(D).get(ve(t));
    return await r.done, n;
  } catch (e) {
    if (e instanceof S)
      p.warn(e.message);
    else {
      const r = b.create("idb-get", {
        originalErrorMessage: e?.message
      });
      p.warn(r.message);
    }
  }
}
async function le(t, e) {
  try {
    const n = (await Se()).transaction(D, "readwrite");
    await n.objectStore(D).put(e, ve(t)), await n.done;
  } catch (r) {
    if (r instanceof S)
      p.warn(r.message);
    else {
      const n = b.create("idb-set", {
        originalErrorMessage: r?.message
      });
      p.warn(n.message);
    }
  }
}
function ve(t) {
  return `${t.name}!${t.options.appId}`;
}
const cr = 1024, lr = 30;
class hr {
  constructor(e) {
    this.container = e, this._heartbeatsCache = null;
    const r = this.container.getProvider("app").getImmediate();
    this._storage = new ur(r), this._heartbeatsCachePromise = this._storage.read().then((n) => (this._heartbeatsCache = n, n));
  }
  /**
   * Called to report a heartbeat. The function will generate
   * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
   * to IndexedDB.
   * Note that we only store one heartbeat per day. So if a heartbeat for today is
   * already logged, subsequent calls to this function in the same day will be ignored.
   */
  async triggerHeartbeat() {
    try {
      const r = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), n = he();
      if (this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null) || this._heartbeatsCache.lastSentHeartbeatDate === n || this._heartbeatsCache.heartbeats.some((o) => o.date === n))
        return;
      if (this._heartbeatsCache.heartbeats.push({ date: n, agent: r }), this._heartbeatsCache.heartbeats.length > lr) {
        const o = fr(this._heartbeatsCache.heartbeats);
        this._heartbeatsCache.heartbeats.splice(o, 1);
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (e) {
      p.warn(e);
    }
  }
  /**
   * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
   * It also clears all heartbeats from memory as well as in IndexedDB.
   *
   * NOTE: Consuming product SDKs should not send the header if this method
   * returns an empty string.
   */
  async getHeartbeatsHeader() {
    try {
      if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0)
        return "";
      const e = he(), { heartbeatsToSend: r, unsentEntries: n } = dr(this._heartbeatsCache.heartbeats), o = we(JSON.stringify({ version: 2, heartbeats: r }));
      return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), o;
    } catch (e) {
      return p.warn(e), "";
    }
  }
}
function he() {
  return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function dr(t, e = cr) {
  const r = [];
  let n = t.slice();
  for (const o of t) {
    const s = r.find((i) => i.agent === o.agent);
    if (s) {
      if (s.dates.push(o.date), de(r) > e) {
        s.dates.pop();
        break;
      }
    } else if (r.push({
      agent: o.agent,
      dates: [o.date]
    }), de(r) > e) {
      r.pop();
      break;
    }
    n = n.slice(1);
  }
  return {
    heartbeatsToSend: r,
    unsentEntries: n
  };
}
class ur {
  constructor(e) {
    this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
  }
  async runIndexedDBEnvironmentCheck() {
    return X() ? Je().then(() => !0).catch(() => !1) : !1;
  }
  /**
   * Read all heartbeats.
   */
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const r = await ar(this.app);
      return r?.heartbeats ? r : { heartbeats: [] };
    } else
      return { heartbeats: [] };
  }
  // overwrite the storage with the provided heartbeats
  async overwrite(e) {
    if (await this._canUseIndexedDBPromise) {
      const n = await this.read();
      return le(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? n.lastSentHeartbeatDate,
        heartbeats: e.heartbeats
      });
    } else
      return;
  }
  // add heartbeats
  async add(e) {
    if (await this._canUseIndexedDBPromise) {
      const n = await this.read();
      return le(this.app, {
        lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? n.lastSentHeartbeatDate,
        heartbeats: [
          ...n.heartbeats,
          ...e.heartbeats
        ]
      });
    } else
      return;
  }
}
function de(t) {
  return we(
    // heartbeatsCache wrapper properties
    JSON.stringify({ version: 2, heartbeats: t })
  ).length;
}
function fr(t) {
  if (t.length === 0)
    return -1;
  let e = 0, r = t[0].date;
  for (let n = 1; n < t.length; n++)
    t[n].date < r && (r = t[n].date, e = n);
  return e;
}
function pr(t) {
  T(new _(
    "platform-logger",
    (e) => new Ct(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), T(new _(
    "heartbeat",
    (e) => new hr(e),
    "PRIVATE"
    /* ComponentType.PRIVATE */
  )), I(V, ae, t), I(V, ae, "esm2020"), I("fire-js", "");
}
pr("");
var gr = "firebase", mr = "12.9.0";
I(gr, mr, "app");
const G = /* @__PURE__ */ new Map(), ke = {
  activated: !1,
  tokenObservers: []
}, br = {
  initialized: !1,
  enabled: !1
};
function d(t) {
  return G.get(t) || { ...ke };
}
function Er(t, e) {
  return G.set(t, e), G.get(t);
}
function M() {
  return br;
}
const Re = "https://content-firebaseappcheck.googleapis.com/v1", wr = "exchangeRecaptchaEnterpriseToken", _r = "exchangeDebugToken", ue = {
  /**
   * This is the first retrial wait after an error. This is currently
   * 30 seconds.
   */
  RETRIAL_MIN_WAIT: 30 * 1e3,
  /**
   * This is the maximum retrial wait, currently 16 minutes.
   */
  RETRIAL_MAX_WAIT: 960 * 1e3
}, yr = 1440 * 60 * 1e3;
class Ir {
  constructor(e, r, n, o, s) {
    if (this.operation = e, this.retryPolicy = r, this.getWaitDuration = n, this.lowerBound = o, this.upperBound = s, this.pending = null, this.nextErrorWaitInterval = o, o > s)
      throw new Error("Proactive refresh lower bound greater than upper bound!");
  }
  start() {
    this.nextErrorWaitInterval = this.lowerBound, this.process(!0).catch(() => {
    });
  }
  stop() {
    this.pending && (this.pending.reject("cancelled"), this.pending = null);
  }
  isRunning() {
    return !!this.pending;
  }
  async process(e) {
    this.stop();
    try {
      this.pending = new A(), this.pending.promise.catch((r) => {
      }), await Ar(this.getNextRun(e)), this.pending.resolve(), await this.pending.promise, this.pending = new A(), this.pending.promise.catch((r) => {
      }), await this.operation(), this.pending.resolve(), await this.pending.promise, this.process(!0).catch(() => {
      });
    } catch (r) {
      this.retryPolicy(r) ? this.process(!1).catch(() => {
      }) : this.stop();
    }
  }
  getNextRun(e) {
    if (e)
      return this.nextErrorWaitInterval = this.lowerBound, this.getWaitDuration();
    {
      const r = this.nextErrorWaitInterval;
      return this.nextErrorWaitInterval *= 2, this.nextErrorWaitInterval > this.upperBound && (this.nextErrorWaitInterval = this.upperBound), r;
    }
  }
}
function Ar(t) {
  return new Promise((e) => {
    setTimeout(e, t);
  });
}
const Tr = {
  "already-initialized": "You have already called initializeAppCheck() for FirebaseApp {$appName} with different options. To avoid this error, call initializeAppCheck() with the same options as when it was originally called. This will return the already initialized instance.",
  "use-before-activation": "App Check is being used before initializeAppCheck() is called for FirebaseApp {$appName}. Call initializeAppCheck() before instantiating other Firebase services.",
  "fetch-network-error": "Fetch failed to connect to a network. Check Internet connection. Original error: {$originalErrorMessage}.",
  "fetch-parse-error": "Fetch client could not parse response. Original error: {$originalErrorMessage}.",
  "fetch-status-error": "Fetch server returned an HTTP error status. HTTP status: {$httpStatus}.",
  "storage-open": "Error thrown when opening storage. Original error: {$originalErrorMessage}.",
  "storage-get": "Error thrown when reading from storage. Original error: {$originalErrorMessage}.",
  "storage-set": "Error thrown when writing to storage. Original error: {$originalErrorMessage}.",
  "recaptcha-error": "ReCAPTCHA error.",
  "initial-throttle": "{$httpStatus} error. Attempts allowed again after {$time}",
  throttled: "Requests throttled due to previous {$httpStatus} error. Attempts allowed again after {$time}"
}, u = new Y("appCheck", "AppCheck", Tr);
function fe(t = !1) {
  return t ? self.grecaptcha?.enterprise : self.grecaptcha;
}
function Q(t) {
  if (!d(t).activated)
    throw u.create("use-before-activation", {
      appName: t.name
    });
}
function Be(t) {
  const e = Math.round(t / 1e3), r = Math.floor(e / (3600 * 24)), n = Math.floor((e - r * 3600 * 24) / 3600), o = Math.floor((e - r * 3600 * 24 - n * 3600) / 60), s = e - r * 3600 * 24 - n * 3600 - o * 60;
  let i = "";
  return r && (i += R(r) + "d:"), n && (i += R(n) + "h:"), i += R(o) + "m:" + R(s) + "s", i;
}
function R(t) {
  return t === 0 ? "00" : t >= 10 ? t.toString() : "0" + t;
}
async function Z({ url: t, body: e }, r) {
  const n = {
    "Content-Type": "application/json"
  }, o = r.getImmediate({
    optional: !0
  });
  if (o) {
    const f = await o.getHeartbeatsHeader();
    f && (n["X-Firebase-Client"] = f);
  }
  const s = {
    method: "POST",
    body: JSON.stringify(e),
    headers: n
  };
  let i;
  try {
    i = await fetch(t, s);
  } catch (f) {
    throw u.create("fetch-network-error", {
      originalErrorMessage: f?.message
    });
  }
  if (i.status !== 200)
    throw u.create("fetch-status-error", {
      httpStatus: i.status
    });
  let c;
  try {
    c = await i.json();
  } catch (f) {
    throw u.create("fetch-parse-error", {
      originalErrorMessage: f?.message
    });
  }
  const a = c.ttl.match(/^([\d.]+)(s)$/);
  if (!a || !a[2] || isNaN(Number(a[1])))
    throw u.create("fetch-parse-error", {
      originalErrorMessage: `ttl field (timeToLive) is not in standard Protobuf Duration format: ${c.ttl}`
    });
  const l = Number(a[1]) * 1e3, y = Date.now();
  return {
    token: c.token,
    expireTimeMillis: y + l,
    issuedAtTimeMillis: y
  };
}
function Dr(t, e) {
  const { projectId: r, appId: n, apiKey: o } = t.options;
  return {
    url: `${Re}/projects/${r}/apps/${n}:${wr}?key=${o}`,
    body: {
      recaptcha_enterprise_token: e
    }
  };
}
function Pe(t, e) {
  const { projectId: r, appId: n, apiKey: o } = t.options;
  return {
    url: `${Re}/projects/${r}/apps/${n}:${_r}?key=${o}`,
    body: {
      // eslint-disable-next-line
      debug_token: e
    }
  };
}
const Cr = "firebase-app-check-database", Sr = 1, C = "firebase-app-check-store", Oe = "debug-token";
let B = null;
function Me() {
  return B || (B = new Promise((t, e) => {
    try {
      const r = indexedDB.open(Cr, Sr);
      r.onsuccess = (n) => {
        t(n.target.result);
      }, r.onerror = (n) => {
        e(u.create("storage-open", {
          originalErrorMessage: n.target.error?.message
        }));
      }, r.onupgradeneeded = (n) => {
        const o = n.target.result;
        n.oldVersion === 0 && o.createObjectStore(C, {
          keyPath: "compositeKey"
        });
      };
    } catch (r) {
      e(u.create("storage-open", {
        originalErrorMessage: r?.message
      }));
    }
  }), B);
}
function vr(t) {
  return Ne(xe(t));
}
function kr(t, e) {
  return $e(xe(t), e);
}
function Rr(t) {
  return $e(Oe, t);
}
function Br() {
  return Ne(Oe);
}
async function $e(t, e) {
  const n = (await Me()).transaction(C, "readwrite"), s = n.objectStore(C).put({
    compositeKey: t,
    value: e
  });
  return new Promise((i, c) => {
    s.onsuccess = (a) => {
      i();
    }, n.onerror = (a) => {
      c(u.create("storage-set", {
        originalErrorMessage: a.target.error?.message
      }));
    };
  });
}
async function Ne(t) {
  const r = (await Me()).transaction(C, "readonly"), o = r.objectStore(C).get(t);
  return new Promise((s, i) => {
    o.onsuccess = (c) => {
      const a = c.target.result;
      s(a ? a.value : void 0);
    }, r.onerror = (c) => {
      i(u.create("storage-get", {
        originalErrorMessage: c.target.error?.message
      }));
    };
  });
}
function xe(t) {
  return `${t.options.appId}-${t.name}`;
}
const g = new Ie("@firebase/app-check");
async function Pr(t) {
  if (X()) {
    let e;
    try {
      e = await vr(t);
    } catch (r) {
      g.warn(`Failed to read token from IndexedDB. Error: ${r}`);
    }
    return e;
  }
}
function L(t, e) {
  return X() ? kr(t, e).catch((r) => {
    g.warn(`Failed to write token to IndexedDB. Error: ${r}`);
  }) : Promise.resolve();
}
async function Or() {
  let t;
  try {
    t = await Br();
  } catch {
  }
  if (t)
    return t;
  {
    const e = crypto.randomUUID();
    return Rr(e).catch((r) => g.warn(`Failed to persist debug token to IndexedDB. Error: ${r}`)), e;
  }
}
function ee() {
  return M().enabled;
}
async function te() {
  const t = M();
  if (t.enabled && t.token)
    return t.token.promise;
  throw Error(`
            Can't get debug token in production mode.
        `);
}
function Mr() {
  const t = _e(), e = M();
  if (e.initialized = !0, typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN != "string" && t.FIREBASE_APPCHECK_DEBUG_TOKEN !== !0)
    return;
  e.enabled = !0;
  const r = new A();
  e.token = r, typeof t.FIREBASE_APPCHECK_DEBUG_TOKEN == "string" ? r.resolve(t.FIREBASE_APPCHECK_DEBUG_TOKEN) : r.resolve(Or());
}
const $r = { error: "UNKNOWN_ERROR" };
function Nr(t) {
  return q.encodeString(
    JSON.stringify(t),
    /* webSafe= */
    !1
  );
}
async function O(t, e = !1, r = !1) {
  const n = t.app;
  Q(n);
  const o = d(n);
  let s = o.token, i;
  if (s && !w(s) && (o.token = void 0, s = void 0), !s) {
    const l = await o.cachedTokenPromise;
    l && (w(l) ? s = l : await L(n, void 0));
  }
  if (!e && s && w(s))
    return {
      token: s.token
    };
  let c = !1;
  if (ee())
    try {
      o.exchangeTokenPromise || (o.exchangeTokenPromise = Z(Pe(n, await te()), t.heartbeatServiceProvider).finally(() => {
        o.exchangeTokenPromise = void 0;
      }), c = !0);
      const l = await o.exchangeTokenPromise;
      return await L(n, l), o.token = l, { token: l.token };
    } catch (l) {
      return l.code === "appCheck/throttled" || l.code === "appCheck/initial-throttle" ? g.warn(l.message) : r && g.error(l), F(l);
    }
  try {
    o.exchangeTokenPromise || (o.exchangeTokenPromise = o.provider.getToken().finally(() => {
      o.exchangeTokenPromise = void 0;
    }), c = !0), s = await d(n).exchangeTokenPromise;
  } catch (l) {
    l.code === "appCheck/throttled" || l.code === "appCheck/initial-throttle" ? g.warn(l.message) : r && g.error(l), i = l;
  }
  let a;
  return s ? i ? w(s) ? a = {
    token: s.token,
    internalError: i
  } : a = F(i) : (a = {
    token: s.token
  }, o.token = s, await L(n, s)) : a = F(i), c && Fe(n, a), a;
}
async function xr(t) {
  const e = t.app;
  Q(e);
  const { provider: r } = d(e);
  if (ee()) {
    const n = await te(), { token: o } = await Z(Pe(e, n), t.heartbeatServiceProvider);
    return { token: o };
  } else {
    const { token: n } = await r.getToken();
    return { token: n };
  }
}
function He(t, e, r, n) {
  const { app: o } = t, s = d(o), i = {
    next: r,
    error: n,
    type: e
  };
  if (s.tokenObservers = [...s.tokenObservers, i], s.token && w(s.token)) {
    const c = s.token;
    Promise.resolve().then(() => {
      r({ token: c.token }), pe(t);
    }).catch(() => {
    });
  }
  s.cachedTokenPromise.then(() => pe(t));
}
function Le(t, e) {
  const r = d(t), n = r.tokenObservers.filter((o) => o.next !== e);
  n.length === 0 && r.tokenRefresher && r.tokenRefresher.isRunning() && r.tokenRefresher.stop(), r.tokenObservers = n;
}
function pe(t) {
  const { app: e } = t, r = d(e);
  let n = r.tokenRefresher;
  n || (n = Hr(t), r.tokenRefresher = n), !n.isRunning() && r.isTokenAutoRefreshEnabled && n.start();
}
function Hr(t) {
  const { app: e } = t;
  return new Ir(
    // Keep in mind when this fails for any reason other than the ones
    // for which we should retry, it will effectively stop the proactive refresh.
    async () => {
      const r = d(e);
      let n;
      if (r.token ? n = await O(t, !0) : n = await O(t), n.error)
        throw n.error;
      if (n.internalError)
        throw n.internalError;
    },
    () => !0,
    () => {
      const r = d(e);
      if (r.token) {
        let n = r.token.issuedAtTimeMillis + (r.token.expireTimeMillis - r.token.issuedAtTimeMillis) * 0.5 + 3e5;
        const o = r.token.expireTimeMillis - 300 * 1e3;
        return n = Math.min(n, o), Math.max(0, n - Date.now());
      } else
        return 0;
    },
    ue.RETRIAL_MIN_WAIT,
    ue.RETRIAL_MAX_WAIT
  );
}
function Fe(t, e) {
  const r = d(t).tokenObservers;
  for (const n of r)
    try {
      n.type === "EXTERNAL" && e.error != null ? n.error(e.error) : n.next(e);
    } catch {
    }
}
function w(t) {
  return t.expireTimeMillis - Date.now() > 0;
}
function F(t) {
  return {
    token: Nr($r),
    error: t
  };
}
class Lr {
  constructor(e, r) {
    this.app = e, this.heartbeatServiceProvider = r;
  }
  _delete() {
    const { tokenObservers: e } = d(this.app);
    for (const r of e)
      Le(this.app, r.next);
    return Promise.resolve();
  }
}
function Fr(t, e) {
  return new Lr(t, e);
}
function zr(t) {
  return {
    getToken: (e) => O(t, e),
    getLimitedUseToken: () => xr(t),
    addTokenListener: (e) => He(t, "INTERNAL", e),
    removeTokenListener: (e) => Le(t.app, e)
  };
}
const Ur = "@firebase/app-check", jr = "0.11.0", Vr = "https://www.google.com/recaptcha/enterprise.js";
function Wr(t, e) {
  const r = new A(), n = d(t);
  n.reCAPTCHAState = { initialized: r };
  const o = Kr(t), s = fe(!0);
  return s ? ge(t, e, s, o, r) : Xr(() => {
    const i = fe(!0);
    if (!i)
      throw new Error("no recaptcha");
    ge(t, e, i, o, r);
  }), r.promise;
}
function ge(t, e, r, n, o) {
  r.ready(() => {
    qr(t, e, r, n), o.resolve(r);
  });
}
function Kr(t) {
  const e = `fire_app_check_${t.name}`, r = document.createElement("div");
  return r.id = e, r.style.display = "none", document.body.appendChild(r), e;
}
async function Gr(t) {
  Q(t);
  const r = await d(t).reCAPTCHAState.initialized.promise;
  return new Promise((n, o) => {
    const s = d(t).reCAPTCHAState;
    r.ready(() => {
      n(
        // widgetId is guaranteed to be available if reCAPTCHAState.initialized.promise resolved.
        r.execute(s.widgetId, {
          action: "fire_app_check"
        })
      );
    });
  });
}
function qr(t, e, r, n) {
  const o = r.render(n, {
    sitekey: e,
    size: "invisible",
    // Success callback - set state
    callback: () => {
      d(t).reCAPTCHAState.succeeded = !0;
    },
    // Failure callback - set state
    "error-callback": () => {
      d(t).reCAPTCHAState.succeeded = !1;
    }
  }), s = d(t);
  s.reCAPTCHAState = {
    ...s.reCAPTCHAState,
    // state.reCAPTCHAState is set in the initialize()
    widgetId: o
  };
}
function Xr(t) {
  const e = document.createElement("script");
  e.src = Vr, e.onload = t, document.head.appendChild(e);
}
class re {
  /**
   * Create a ReCaptchaEnterpriseProvider instance.
   * @param siteKey - reCAPTCHA Enterprise score-based site key.
   */
  constructor(e) {
    this._siteKey = e, this._throttleData = null;
  }
  /**
   * Returns an App Check token.
   * @internal
   */
  async getToken() {
    Jr(this._throttleData);
    const e = await Gr(this._app).catch((n) => {
      throw u.create(
        "recaptcha-error"
        /* AppCheckError.RECAPTCHA_ERROR */
      );
    });
    if (!d(this._app).reCAPTCHAState?.succeeded)
      throw u.create(
        "recaptcha-error"
        /* AppCheckError.RECAPTCHA_ERROR */
      );
    let r;
    try {
      r = await Z(Dr(this._app, e), this._heartbeatServiceProvider);
    } catch (n) {
      throw n.code?.includes(
        "fetch-status-error"
        /* AppCheckError.FETCH_STATUS_ERROR */
      ) ? (this._throttleData = Yr(Number(n.customData?.httpStatus), this._throttleData), u.create("initial-throttle", {
        time: Be(this._throttleData.allowRequestsAfter - Date.now()),
        httpStatus: this._throttleData.httpStatus
      })) : n;
    }
    return this._throttleData = null, r;
  }
  /**
   * @internal
   */
  initialize(e) {
    this._app = e, this._heartbeatServiceProvider = De(e, "heartbeat"), Wr(e, this._siteKey).catch(() => {
    });
  }
  /**
   * @internal
   */
  isEqual(e) {
    return e instanceof re ? this._siteKey === e._siteKey : !1;
  }
}
function Yr(t, e) {
  if (t === 404 || t === 403)
    return {
      backoffCount: 1,
      allowRequestsAfter: Date.now() + yr,
      httpStatus: t
    };
  {
    const r = e ? e.backoffCount : 0, n = st(r, 1e3, 2);
    return {
      backoffCount: r + 1,
      allowRequestsAfter: Date.now() + n,
      httpStatus: t
    };
  }
}
function Jr(t) {
  if (t && Date.now() - t.allowRequestsAfter <= 0)
    throw u.create("throttled", {
      time: Be(t.allowRequestsAfter - Date.now()),
      httpStatus: t.httpStatus
    });
}
function Qr(t = or(), e) {
  t = it(t);
  const r = De(t, "app-check");
  if (M().initialized || Mr(), ee() && te().then((o) => (
    // Not using logger because I don't think we ever want this accidentally hidden.
    console.log(`App Check debug token: ${o}. You will need to add it to your app's App Check settings in the Firebase console for it to work.`)
  )), r.isInitialized()) {
    const o = r.getImmediate(), s = r.getOptions();
    if (s.isTokenAutoRefreshEnabled === e.isTokenAutoRefreshEnabled && s.provider.isEqual(e.provider))
      return o;
    throw u.create("already-initialized", {
      appName: t.name
    });
  }
  const n = r.initialize({ options: e });
  return Zr(t, e.provider, e.isTokenAutoRefreshEnabled), d(t).isTokenAutoRefreshEnabled && He(n, "INTERNAL", () => {
  }), n;
}
function Zr(t, e, r = !1) {
  const n = Er(t, { ...ke });
  n.activated = !0, n.provider = e, n.cachedTokenPromise = Pr(t).then((o) => (o && w(o) && (n.token = o, Fe(t, { token: o.token })), o)), n.isTokenAutoRefreshEnabled = r && t.automaticDataCollectionEnabled, !t.automaticDataCollectionEnabled && r && g.warn("`isTokenAutoRefreshEnabled` is true but `automaticDataCollectionEnabled` was set to false during `initializeApp()`. This blocks automatic token refresh."), n.provider.initialize(t);
}
async function en(t, e) {
  const r = await O(t, e);
  if (r.error)
    throw r.error;
  if (r.internalError)
    throw r.internalError;
  return { token: r.token };
}
const tn = "app-check", me = "app-check-internal";
function rn() {
  T(new _(
    tn,
    (t) => {
      const e = t.getProvider("app").getImmediate(), r = t.getProvider("heartbeat");
      return Fr(e, r);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  ).setInstanceCreatedCallback((t, e, r) => {
    t.getProvider(me).initialize();
  })), T(new _(
    me,
    (t) => {
      const e = t.getProvider("app-check").getImmediate();
      return zr(e);
    },
    "PUBLIC"
    /* ComponentType.PUBLIC */
  ).setInstantiationMode(
    "EXPLICIT"
    /* InstantiationMode.EXPLICIT */
  )), I(Ur, jr);
}
rn();
function nn(t) {
  const e = /^\/v\/([A-Fa-f0-9]{40})$/.exec(t);
  return e ? e[1] : null;
}
function on(t, e) {
  const r = "yipias_qr_visitor_v1", n = t.getItem(r);
  if (typeof n == "string" && /^[a-f0-9]{32}$/.test(n)) return n;
  const o = e.getRandomValues(new Uint8Array(16)), s = Array.from(o, (i) => i.toString(16).padStart(2, "0")).join("");
  return t.setItem(r, s), s;
}
function sn(t, e, r, n) {
  if (!/^https:\/\//.test(t)) throw new Error("Invalid resolver endpoint");
  if (!/^[A-Fa-f0-9]{40}$/.test(e)) throw new Error("Invalid QR token");
  if (!/^[a-f0-9]{32}$/.test(r)) throw new Error("Invalid visitor ID");
  if (typeof n != "string" || n.length === 0) throw new Error("Missing App Check token");
  return {
    url: t,
    options: {
      method: "POST",
      credentials: "omit",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        "X-Firebase-AppCheck": n
      },
      body: JSON.stringify({ token: e, visitor_id: r })
    }
  };
}
function an(t) {
  if (typeof t != "string" || t.length > 2048) return null;
  try {
    const e = new URL(t), r = e.hostname === "play.google.com" || e.hostname === "apps.apple.com" || e.hostname === "yipias.com" || e.hostname.endsWith(".yipias.com");
    return e.protocol !== "https:" || !r || e.username || e.password ? null : e.toString();
  } catch {
    return null;
  }
}
const be = "6LeditstAAAAAGJOoIdDYRSpfBOhEBQPt4hYtYGK", cn = "https://us-central1-yipias-web-f06e1.cloudfunctions.net/resolverQrPublico", ln = Ce({
  apiKey: "AIzaSyAGPUHsI-gX67ISkXBhIl6-Lr0Uo9enKX4",
  authDomain: "yipias-web-f06e1.firebaseapp.com",
  projectId: "yipias-web-f06e1",
  appId: "1:454915066576:web:eb5a4235d6a8b3ded12cd5"
}, "yipias-public-qr");
async function hn() {
  const t = document.getElementById("qr-status");
  try {
    const e = nn(window.location.pathname);
    if (!e || e !== window.__YIPIAS_QR_TOKEN__) throw new Error("Invalid QR path");
    const r = on(window.localStorage, window.crypto), n = Qr(ln, {
      provider: new re(be),
      isTokenAutoRefreshEnabled: !0
    }), o = await en(n), s = sn(cn, e, r, o.token), i = await window.fetch(s.url, s.options);
    if (!i.ok) throw new Error("QR resolution failed");
    const c = await i.json(), a = an(c?.destino);
    if (!a) throw new Error("Invalid QR destination");
    window.location.replace(a);
  } catch {
    t && (t.textContent = "No se pudo abrir este código QR. Inténtalo nuevamente.");
  }
}
hn();
